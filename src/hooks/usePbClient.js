import { useState, useEffect, useCallback, useRef } from 'react';
import pb from '../lib/pb';

/**
 * Fetches and caches the current client's data from PocketBase:
 * ledger_accounts, cards, operations, notifications, crypto_wallets.
 * Subscribes to realtime updates so balances refresh automatically.
 */
export function usePbClient() {
  const [clientId, setClientId] = useState(() => localStorage.getItem('lumen_pb_client_id'));

  // Keep clientId in sync if it is set after component mounts (e.g. after registration)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'lumen_pb_client_id') {
        setClientId(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    // Also poll once in case same-tab writes don't fire storage event
    const check = setInterval(() => {
      const id = localStorage.getItem('lumen_pb_client_id');
      if (id) { setClientId(id); clearInterval(check); }
    }, 1000);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(check);
    };
  }, []);

  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [operations, setOperations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [cryptoWallets, setCryptoWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const unsubsRef = useRef([]);

  const ensureAuth = useCallback(async () => {
    if (pb.authStore.isValid) return;
    const email = JSON.parse(localStorage.getItem('lumen_user_data') || '{}').email;
    const pass = localStorage.getItem('lumen_pb_pass');
    if (email && pass) {
      try { await pb.collection('clients').authWithPassword(email, pass); } catch {}
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    await ensureAuth();
    try {
      const [accs, cds, ops, notifs, cw] = await Promise.all([
        pb.collection('ledger_accounts').getList(1, 50, {
          filter: `client = '${clientId}'`, sort: 'type',
        }),
        pb.collection('cards').getList(1, 20, {
          filter: `client = '${clientId}'`, sort: '-created',
        }),
        pb.collection('operations').getList(1, 50, {
          filter: `client = '${clientId}'`, sort: '-created',
        }),
        pb.collection('notifications').getList(1, 20, {
          filter: `client = '${clientId}'`, sort: '-created',
        }),
        pb.collection('crypto_wallets').getList(1, 20, {
          filter: `client = '${clientId}'`, sort: '-balance',
        }),
      ]);
      setAccounts(accs.items);
      setCards(cds.items);
      setOperations(ops.items);
      setNotifications(notifs.items);
      setCryptoWallets(cw.items);
    } catch {
      // PB unreachable or no auth — silently fall back
    }
    setLoading(false);
  }, [clientId]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime subscriptions — refresh on any change to client's data
  useEffect(() => {
    if (!clientId) return;
    let mounted = true;
    const unsubs = [];

    (async () => {
      try {
        // ledger_accounts changes (balance updates after CRM approve)
        const u1 = await pb.collection('ledger_accounts').subscribe('*', (e) => {
          if (e.record.client === clientId) refresh();
        });
        unsubs.push(u1);

        // operations changes (status updates)
        const u2 = await pb.collection('operations').subscribe('*', (e) => {
          if (e.record.client === clientId) refresh();
        });
        unsubs.push(u2);

        // notifications
        const u3 = await pb.collection('notifications').subscribe('*', (e) => {
          if (e.record.client === clientId) refresh();
        });
        unsubs.push(u3);

        // cards
        const u4 = await pb.collection('cards').subscribe('*', (e) => {
          if (e.record.client === clientId) refresh();
        });
        unsubs.push(u4);

        // crypto_wallets
        const u5 = await pb.collection('crypto_wallets').subscribe('*', (e) => {
          if (e.record.client === clientId) refresh();
        });
        unsubs.push(u5);

        if (mounted) unsubsRef.current = unsubs;
      } catch {
        // realtime not available — polling fallback
      }
    })();

    return () => {
      mounted = false;
      unsubsRef.current.forEach(fn => { try { fn(); } catch {} });
      unsubsRef.current = [];
    };
  }, [clientId, refresh]);

  // Derived values
  const fiatAccount = accounts.find(a => a.type === 'fiat');
  const fiatBalance = fiatAccount?.available_balance ?? 0;
  const fiatCurrency = fiatAccount?.currency ?? 'USD';
  const fiatPending = fiatAccount?.pending_balance ?? 0;

  const cryptoAccounts = accounts.filter(a => a.type === 'crypto');

  // Enrich cards: attach balance from ledger_accounts instead of relying on card.available_balance
  // Cards from PB `cards` collection are fiat/debit cards — their balance lives in ledger_accounts
  const enrichedCards = cards.map(card => {
    if (card.type === 'crypto') {
      // crypto cards — find matching ledger_account by asset/currency
      const cryptoAcc = cryptoAccounts.find(a =>
        a.asset === card.currency || a.currency === card.currency
      );
      return { ...card, available_balance: cryptoAcc?.available_balance ?? 0, _pbCard: true };
    }
    // fiat/debit cards — use fiatAccount balance
    return { ...card, available_balance: fiatAccount?.available_balance ?? card.available_balance ?? 0, currency: card.currency || fiatCurrency, _pbCard: true };
  });

  const submitOperation = async (type, data) => {
    if (!clientId) return null;
    const op = await pb.collection('operations').create({
      client: clientId,
      type,
      status: 'Pending',
      ...data,
    });

    // Create pending ledger entry if amount provided and fiatAccount exists
    const isCryptoOp = ['CRYPTO_BUY','CRYPTO_SELL','CRYPTO_SWAP','CRYPTO_TRANSFER'].includes(type);
    if (data.amount && fiatAccount?.id && !isCryptoOp) {
      try {
        await pb.collection('ledger_entries').create({
          operation: op.id,
          ledger_account: fiatAccount.id,
          direction: 'debit',
          amount: data.amount,
          currency_or_asset: data.currency || fiatCurrency,
          status: 'pending',
        });
        await pb.collection('ledger_accounts').update(fiatAccount.id, {
          pending_balance: fiatPending + parseFloat(data.amount),
        });
      } catch { /* non-critical — operation was created */ }
    }

    // For crypto ops: create wallet entry if needed
    if (isCryptoOp && data.asset) {
      try {
        const existing = cryptoWallets.find(w => w.asset === data.asset);
        if (!existing) {
          await pb.collection('crypto_wallets').create({
            client: clientId,
            asset: data.asset,
            balance: 0,
            status: 'pending',
          });
        }
      } catch { /* non-critical */ }
    }

    await refresh();
    return op;
  };

  return {
    accounts,
    fiatAccount,
    fiatBalance,
    fiatCurrency,
    fiatPending,
    cryptoAccounts,
    cryptoWallets,
    cards: enrichedCards,
    operations,
    notifications,
    loading,
    refresh,
    submitOperation,
    hasPbClient: !!clientId,
  };
}
