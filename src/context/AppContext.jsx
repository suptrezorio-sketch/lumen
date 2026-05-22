import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useOrchestratorStore from '../store/orchestratorStore';
import en from '../i18n/en.json';
import fr from '../i18n/fr.json';

const langs = { en, fr };
const AppContext = createContext();

const DEFAULT_USER = {
  name: 'Korben Dallas',
  email: 'korben@lumen.ca',
  balance: 12450.80,
  btc: 0.4521,
  eth: 1.8340,
  usdt: 2500.00,
};

const CARDS = [
  { id: 1, type: 'fiat', name: 'LUMEN Platinum', number: '4400 0055 4053 8573', balance: 12450.80, currency: 'CAD', expiry: '12/31', holder: 'KORBEN DALLAS', cvv: '823', blocked: false, dailyLimit: 5000, monthlyLimit: 25000 },
  { id: 2, type: 'crypto', name: 'Bitcoin Vault', number: 'bc1q...x7k9', balance: 0.4521, currency: 'BTC', expiry: 'N/A', holder: 'KORBEN DALLAS', cvv: '---', blocked: false, dailyLimit: 10000, monthlyLimit: 50000 },
  { id: 3, type: 'smart', name: 'Contract #001', number: 'SC-0x7F3A', balance: 1, currency: 'blocks', totalBlocks: 3, blocksCompleted: 1, holder: 'KORBEN DALLAS', cvv: '---', blocked: false },
];

const CRYPTO_ASSETS = [
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', price: 45000, holdings: 0.5, icon: '₿' },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', price: 2800, holdings: 2.0, icon: 'Ξ' },
  { id: 'SOL', name: 'Solana', symbol: 'SOL', price: 120, holdings: 15, icon: '◎' },
  { id: 'USDT', name: 'Tether', symbol: 'USDT', price: 1, holdings: 1000, icon: '₮' },
];

const TRANSACTIONS = [
  { id: 'TX-001847', type: 'incoming', title: 'Payroll Deposit', description: 'Direct Deposit', amount: 4250.00, date: '2024-12-18T09:30:00', category: 'income', fee: 0, status: 'completed' },
  { id: 'TX-001846', type: 'outgoing', title: 'Rent Payment', description: 'Apartment Lease', amount: -1800.00, date: '2024-12-17T14:20:00', category: 'housing', fee: 0, status: 'completed' },
];

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lumen_lang') || 'en');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('lumen_dark') === 'true');
  const [cards, setCards] = useState(() => JSON.parse(localStorage.getItem('lumen_cards') || JSON.stringify(CARDS)));
  const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem('lumen_txs') || JSON.stringify(TRANSACTIONS)));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('lumen_user_data')) || DEFAULT_USER);
  const [userId, setUserId] = useState(localStorage.getItem('lumen_user_id'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(() => localStorage.getItem('lumen_onboarded') === 'true');
  const [pinAttempts, setPinAttempts] = useState(0);
  const [pinLocked, setPinLocked] = useState(false);
  const [kycStatus, setKycStatus] = useState('none');
  const [amlStatus, setAmlStatus] = useState('none');
  const [creditStatus, setCreditStatus] = useState('none');
  const [biometric, setBiometric] = useState(() => localStorage.getItem('lumen_bio') === 'true');
  const [twoFactor, setTwoFactor] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [sessionToken, setSessionToken] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const t = (key) => {
    const keys = key.split('.');
    let result = langs[lang];
    for (const k of keys) {
      if (result && result[k]) result = result[k];
      else return key;
    }
    return result;
  };

  // Phase 1: Sync balance from Orchestrator (Admin Overrides)
  const remoteBalance = useOrchestratorStore(state => state.balance);
  useEffect(() => {
    if (remoteBalance !== null && remoteBalance !== undefined) {
      setUser(prev => {
        const next = { ...prev, balance: remoteBalance };
        localStorage.setItem('lumen_user_data', JSON.stringify(next));
        return next;
      });
    }
  }, [remoteBalance]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > 5 * 60 * 1000) {
        logout();
      }
    }, 10000);
    const handleActivity = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [isAuthenticated, lastActivity]);

  useEffect(() => { localStorage.setItem('lumen_lang', lang); }, [lang]);
  useEffect(() => { 
    localStorage.setItem('lumen_dark', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  useEffect(() => { localStorage.setItem('lumen_cards', JSON.stringify(cards)); }, [cards]);
  useEffect(() => { localStorage.setItem('lumen_txs', JSON.stringify(transactions)); }, [transactions]);

  const TEST_PIN = '1388';
  const getPinState = () => {
    const raw = localStorage.getItem('lumen_accounts_by_pin');
    if (!raw) return {};
    try { return JSON.parse(raw); } catch { return {}; }
  };
  const setPinState = (state) => {
    localStorage.setItem('lumen_accounts_by_pin', JSON.stringify(state));
  };
  const getUserForPin = (pinValue) => {
    const pinState = getPinState();
    const pinKey = String(pinValue);
    return pinState[pinKey] || null;
  };

  const createUserForPin = (pinValue) => {
    const pinKey = String(pinValue);
    const pinState = getPinState();

    if (pinState[pinKey]?.userId) return pinState[pinKey];

    const userId = pinKey === TEST_PIN ? 'TEST_PIN_1388_USER' : ('PIN_USER_' + pinKey);

    const created = {
      userId,
      userData: {
        ...DEFAULT_USER,
        id: userId,
        name: pinKey === TEST_PIN ? 'Test Account' : `User ${pinKey}`,
        email: pinKey === TEST_PIN ? 'test@lumen.local' : `pin${pinKey}@lumen.local`,
      },
    };

    pinState[pinKey] = created;
    setPinState(pinState);

    return created;
  };

  const syncUserFromServer = useCallback(async (id) => {
    const validId = id && (/^[0-9a-fA-F]{24}$/.test(id) || /^[0-9a-f-]{36}$/i.test(id));
    if (!validId) return;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
    try {
      const res = await fetch(`${backendUrl}/api/me?userId=${id}`);
      if (!res.ok) return;
      const data = await res.json();
      const u = data.user;
      if (!u) return;
      const userData = {
        name: u.name,
        email: u.email,
        balance: u.balance,
        btc: u.btc,
        eth: u.eth,
        usdt: u.usdt,
      };
      setUser(userData);
      localStorage.setItem('lumen_user_data', JSON.stringify(userData));
      useOrchestratorStore.getState().setBalance(u.balance);
      if (data.cards?.length) {
        setCards(data.cards.map((c, i) => ({
          id: c._id || i + 1,
          type: c.type,
          name: c.name,
          number: c.number,
          balance: c.balance,
          currency: c.currency,
          expiry: c.expiry,
          holder: c.holder,
          cvv: c.cvv,
          blocked: c.blocked,
        })));
      }
      if (data.transactions?.length) {
        setTransactions(data.transactions.map((tx) => ({
          id: tx.txId || tx._id,
          type: tx.type,
          title: tx.title,
          description: tx.description,
          amount: tx.amount,
          date: tx.date || tx.createdAt,
          category: tx.category,
          fee: tx.fee,
          status: tx.status,
        })));
      }
      if (u.creditStatus) setCreditStatus(u.creditStatus);
      if (u.kycStatus) setKycStatus(u.kycStatus);
    } catch (e) {
      console.warn('syncUserFromServer', e);
    }
  }, []);

  const login = async (pin) => {
    const lockedUntilRaw = localStorage.getItem('lumen_pin_locked_until');
    const lockedUntil = lockedUntilRaw ? Number(lockedUntilRaw) : 0;

    if (Date.now() < lockedUntil) return false;

    if (lockedUntilRaw && Date.now() >= lockedUntil) {
      setPinLocked(false);
      setPinAttempts(0);
      localStorage.removeItem('lumen_pin_locked_until');
    }

    const normalized = String(pin ?? '');

    // --- TEST PIN: 4 digits (1388) ---
    if (normalized === TEST_PIN) {
      const { userId, userData } = createUserForPin(normalized);

      setIsAuthenticated(true);
      setPinAttempts(0);
      setPinLocked(false);
      localStorage.removeItem('lumen_pin_locked_until');

      setUser(userData);
      localStorage.setItem('lumen_user_data', JSON.stringify(userData));
      localStorage.setItem('lumen_user_id', userId);
      setUserId(userId);
      localStorage.setItem('lumen_current_pin', normalized);

      setSessionToken('LM-' + Math.random().toString(36).substring(2, 15));
      setLastActivity(Date.now());

      // Sync test user to backend DB so admin can see them in the CRM
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
      fetch(`${backendUrl}/api/sync-test-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: '1388', name: userData.name, balance: userData.balance }),
      })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.userId) {
            localStorage.setItem('lumen_user_id', data.userId);
            setUserId(data.userId);
            syncUserFromServer(data.userId);
          }
        })
        .catch(() => {});

      return true;
    }

    // --- Regular PIN: must be 6 digits ---
    if (normalized.length !== 6) {
      const nextAttempts = (pinAttempts || 0) + 1;
      setPinAttempts(nextAttempts);
      if (nextAttempts >= 4) {
        setPinLocked(true);
        localStorage.setItem('lumen_pin_locked_until', String(Date.now() + 60 * 1000));
      }
      return false;
    }

    // For non-test pins: only allow if account already exists on this device
    const existing = getUserForPin(normalized);
    if (!existing) {
      const nextAttempts = (pinAttempts || 0) + 1;
      setPinAttempts(nextAttempts);

      if (nextAttempts >= 4) {
        setPinLocked(true);
        localStorage.setItem('lumen_pin_locked_until', String(Date.now() + 60 * 1000));
      }
      return false;
    }

    const { userId, userData } = existing;

    setIsAuthenticated(true);
    setPinAttempts(0);
    setPinLocked(false);
    localStorage.removeItem('lumen_pin_locked_until');

    setUser(userData);
    localStorage.setItem('lumen_user_data', JSON.stringify(userData));
    localStorage.setItem('lumen_user_id', userId);
    setUserId(userId);
    localStorage.setItem('lumen_current_pin', normalized);

    setSessionToken('LM-' + Math.random().toString(36).substring(2, 15));
    setLastActivity(Date.now());
    if (/^[0-9a-fA-F]{24}$/.test(userId) || /^[0-9a-f-]{36}$/i.test(userId)) syncUserFromServer(userId);
    return true;
  };

  useEffect(() => {
    if (!pinLocked) return;

    const raw = localStorage.getItem('lumen_pin_locked_until');
    const lockedUntil = raw ? Number(raw) : 0;
    const msLeft = lockedUntil - Date.now();

    if (msLeft <= 0) {
      setPinLocked(false);
      setPinAttempts(0);
      localStorage.removeItem('lumen_pin_locked_until');
      return;
    }

    const timer = setTimeout(() => {
      setPinLocked(false);
      setPinAttempts(0);
      localStorage.removeItem('lumen_pin_locked_until');
    }, msLeft);

    return () => clearTimeout(timer);
  }, [pinLocked]);

  const logout = () => { 
    setIsAuthenticated(false); 
    setSessionToken(null);
    localStorage.removeItem('lumen_user_id');
    setUserId(null);
  };

  const completeOnboarding = async (pin, langChoice, regForm) => {
    localStorage.setItem('lumen_pin', pin);
    localStorage.setItem('lumen_onboarded', 'true');
    localStorage.setItem('lumen_bio', 'true');
    if (langChoice) setLang(langChoice);
    const userData = { ...DEFAULT_USER, ...regForm };
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
    try {
      const res = await fetch(`${backendUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regForm.name || userData.name,
          email: regForm.email || `${Date.now()}@lumen.local`,
          phone: regForm.phone,
          pin,
          password: pin,
          balance: userData.balance,
          lang: langChoice || lang,
        }),
      });
      if (res.ok) {
        const { userId: mongoId } = await res.json();
        localStorage.setItem('lumen_user_id', mongoId);
        setUserId(mongoId);
      } else {
        const fallbackId = 'USER_' + Date.now();
        localStorage.setItem('lumen_user_id', fallbackId);
        setUserId(fallbackId);
      }
    } catch {
      const fallbackId = 'USER_' + Date.now();
      localStorage.setItem('lumen_user_id', fallbackId);
      setUserId(fallbackId);
    }
    localStorage.setItem('lumen_user_data', JSON.stringify(userData));
    setUser(userData);
    setOnboardingDone(true);
    setIsAuthenticated(false);
  };

  const updateUser = (partial) => {
    setUser(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem('lumen_user_data', JSON.stringify(next));
      return next;
    });
  };

  const addTransaction = async (tx) => {
    const newTx = { ...tx, id: 'TX-' + Date.now(), date: new Date().toISOString() };
    setTransactions(prev => [newTx, ...prev]);
  };

  const buyCrypto = (assetSymbol, usdAmount) => {
    const asset = CRYPTO_ASSETS.find(a => a.symbol === assetSymbol);
    if (!asset || usdAmount <= 0) return false;
    if ((user.balance || 0) < usdAmount) return false;
    const key = assetSymbol.toLowerCase(); // btc, eth, sol, usdt
    const qty = usdAmount / asset.price;
    const newBal = (user.balance || 0) - usdAmount;
    const newHolding = (user[key] || 0) + qty;
    updateUser({ balance: newBal, [key]: newHolding });
    addTransaction({
      type: 'outgoing', title: `Buy ${asset.symbol}`,
      description: `Purchased ${qty.toFixed(6)} ${asset.symbol}`,
      amount: -usdAmount, status: 'completed', category: 'crypto'
    });
    // Emit socket event
    import('../services/socketService').then(m => {
      m.default.emit('STUDENT_ACTION', { type: 'crypto_buy', details: `Bought ${qty.toFixed(6)} ${asset.symbol} for $${usdAmount}` });
      m.default.emit('STUDENT_BALANCE', { balance: newBal });
    });
    return true;
  };

  const swapCrypto = (fromSymbol, toSymbol, fromQty) => {
    const fromAsset = CRYPTO_ASSETS.find(a => a.symbol === fromSymbol);
    const toAsset = CRYPTO_ASSETS.find(a => a.symbol === toSymbol);
    if (!fromAsset || !toAsset || fromQty <= 0) return false;
    const fromKey = fromSymbol.toLowerCase();
    const toKey = toSymbol.toLowerCase();
    if ((user[fromKey] || 0) < fromQty) return false;
    const usdValue = fromQty * fromAsset.price;
    const toQty = usdValue / toAsset.price;
    updateUser({
      [fromKey]: (user[fromKey] || 0) - fromQty,
      [toKey]: (user[toKey] || 0) + toQty
    });
    addTransaction({
      type: 'outgoing', title: `Swap ${fromSymbol} → ${toSymbol}`,
      description: `${fromQty.toFixed(6)} ${fromSymbol} → ${toQty.toFixed(6)} ${toSymbol}`,
      amount: 0, status: 'completed', category: 'crypto'
    });
    import('../services/socketService').then(m => {
      m.default.emit('STUDENT_ACTION', { type: 'crypto_swap', details: `Swapped ${fromQty} ${fromSymbol} → ${toQty.toFixed(6)} ${toSymbol}` });
    });
    return true;
  };

  const updateCard = async (id, data) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const bypassOnboarding = () => {
    localStorage.setItem('lumen_onboarded', 'true');
    setOnboardingDone(true);
  };

  const registerBiometric = async () => {
    if (!window.PublicKeyCredential) {
      console.warn("WebAuthn not supported");
      return false;
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      
      const createCredentialOptions = {
        publicKey: {
          challenge,
          rp: { name: "Lumen Bank", id: window.location.hostname },
          user: {
            id: Uint8Array.from(user?.id || "default", c => c.charCodeAt(0)),
            name: user?.email || "user@lumen.bank",
            displayName: user?.name || "Lumen User",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
          timeout: 60000,
          attestation: "none"
        }
      };

      const credential = await navigator.credentials.create(createCredentialOptions);
      if (credential) {
        const credentialIdBase64 = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        localStorage.setItem('lumen_cred_id', credentialIdBase64);
        setBiometric(true);
        localStorage.setItem('lumen_bio', 'true');
        return true;
      }
    } catch (e) {
      console.error("Biometric registration failed:", e);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      t, lang, setLang, darkMode, setDarkMode,
      user, setUser, updateUser, isAuthenticated, onboardingDone,
      pinLocked, pinAttempts, login, logout, completeOnboarding, bypassOnboarding,
      cards, updateCard, transactions, addTransaction,
      kycStatus, setKycStatus, amlStatus, setAmlStatus,
      creditStatus, setCreditStatus,
      biometric, setBiometric, registerBiometric, twoFactor, setTwoFactor,
      notifications, setNotifications, installApp, deferredPrompt,
      buyCrypto, swapCrypto,
      cryptoAssets: CRYPTO_ASSETS.map(a => ({ ...a, holdings: user[a.symbol.toLowerCase()] ?? a.holdings })),
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
export default AppContext;
