import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useOrchestratorStore from '../store/orchestratorStore';
import en from '../i18n/en.json';
import fr from '../i18n/fr.json';
import pb from '../lib/pb';

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
  const [cards, setCards] = useState(() => JSON.parse(localStorage.getItem('lumen_cards') || '[]'));
  const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem('lumen_txs') || '[]'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('lumen_user_data')) || DEFAULT_USER);
  const [userId, setUserId] = useState(localStorage.getItem('lumen_user_id'));
  const [pbClientId, setPbClientId] = useState(() => localStorage.getItem('lumen_pb_client_id'));
  const [accountStatus, setAccountStatus] = useState(() => {
    const stored = localStorage.getItem('lumen_account_status');
    if (stored) return stored;
    // Existing users without PB registration get approved by default
    const hasPbId = !!localStorage.getItem('lumen_pb_client_id');
    return hasPbId ? 'pending' : 'approved';
  });
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
  const [deferredPrompt, setDeferredPrompt] = useState(window.deferredPrompt || null);

  useEffect(() => {
    // If it was captured before React loaded
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
    }
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
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

  const login = async (pin) => {
    const clientId = localStorage.getItem('lumen_pb_client_id');
    const storedPin = localStorage.getItem('lumen_pin');
    if (pin !== storedPin) {
      const next = pinAttempts + 1;
      setPinAttempts(next);
      if (next >= 3) setPinLocked(true);
      return false;
    }
    // Re-fetch account status from PocketBase on every login (public GET, no auth)
    if (clientId && !clientId.startsWith('USER_')) {
      try {
        const res = await fetch(`${pb.baseUrl}/api/collections/clients/records/${clientId}`);
        if (res.ok) {
          const client = await res.json();
          const status = client.account_status || 'pending';
          setAccountStatus(status);
          localStorage.setItem('lumen_account_status', status);
          const fullName = `${client.first_name} ${client.last_name}`.trim();
          const updatedUser = { ...user, name: fullName, email: client.email, phone: client.phone, pbId: clientId };
          setUser(updatedUser);
          localStorage.setItem('lumen_user_data', JSON.stringify(updatedUser));
        }
      } catch {}
    }
    setIsAuthenticated(true);
    setPinAttempts(0);
    setSessionToken('LM-' + Math.random().toString(36).substring(2, 15));
    setLastActivity(Date.now());
    return true;
  };

  const loadClientData = useCallback(async () => {
    const clientId = localStorage.getItem('lumen_pb_client_id');
    const pass = localStorage.getItem('lumen_pb_pass');
    if (!clientId || clientId.startsWith('USER_') || !pass) return;

    try {
      if (!pb.authStore.isValid) {
        const clientRec = await pb.collection('clients').getOne(clientId);
        await pb.collection('clients').authWithPassword(clientRec.email, pass);
      }

      const [accs, pbCards, pbOps] = await Promise.all([
        pb.collection('ledger_accounts').getList(1, 20, { filter: `client = '${clientId}'` }),
        pb.collection('cards').getList(1, 20, { filter: `client = '${clientId}'` }),
        pb.collection('operations').getList(1, 50, { filter: `client = '${clientId}'`, sort: '-created' })
      ]);

      const fiatAcc = accs.items.find(a => a.type === 'fiat');
      const btcAcc = accs.items.find(a => a.currency === 'BTC' || a.asset === 'BTC');
      const ethAcc = accs.items.find(a => a.currency === 'ETH' || a.asset === 'ETH');
      const usdtAcc = accs.items.find(a => a.currency === 'USDT' || a.asset === 'USDT');

      setUser(prev => {
        const next = { ...prev };
        if (fiatAcc) next.balance = fiatAcc.available_balance || 0;
        if (btcAcc) next.btc = btcAcc.available_balance || 0;
        if (ethAcc) next.eth = ethAcc.available_balance || 0;
        if (usdtAcc) next.usdt = usdtAcc.available_balance || 0;
        localStorage.setItem('lumen_user_data', JSON.stringify(next));
        return next;
      });

      if (pbCards.items.length > 0) {
        setCards(pbCards.items.map(c => ({
          id: c.id,
          type: c.type,
          name: c.label || c.type,
          number: `•••• •••• •••• ${c.number_last4 || '0000'}`,
          balance: (fiatAcc && c.type === 'fiat') ? (fiatAcc.available_balance || 0) : 0,
          currency: c.currency,
          expiry: c.expiry,
          holder: c.holder,
          cvv: '***',
          blocked: c.status !== 'active',
          dailyLimit: 5000,
          monthlyLimit: 25000
        })));
      }

      if (pbOps.items.length > 0) {
        setTransactions(pbOps.items.map(o => {
          const isOutgoing = ['WITHDRAW','CARD_TRANSFER','IBAN_TRANSFER','CRYPTO_BUY'].includes(o.type);
          return {
            id: o.id,
            type: isOutgoing ? 'outgoing' : 'incoming',
            title: o.type.replace(/_/g, ' '),
            description: o.status,
            amount: isOutgoing ? -Math.abs(o.amount) : Math.abs(o.amount),
            date: o.created,
            category: 'general',
            fee: 0,
            status: o.status.toLowerCase()
          };
        }));
      }
    } catch (e) {
      console.error('Failed to load client data from PB', e);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadClientData();
    }
  }, [isAuthenticated, loadClientData]);

  const resetPinLock = () => {
    setPinLocked(false);
    setPinAttempts(0);
  };

  const changePin = async (newPin) => {
    const clientId = localStorage.getItem('lumen_pb_client_id');
    if (!clientId) {
      localStorage.setItem('lumen_pin', newPin);
      return;
    }
    await pb.collection('clients').update(clientId, { pin: newPin });
    localStorage.setItem('lumen_pin', newPin);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setSessionToken(null);
    localStorage.removeItem('lumen_user_id');
    setUserId(null);
    pb.authStore.clear();
  };

  const completeOnboarding = async (pin, langChoice, regForm) => {
    if (langChoice) setLang(langChoice);
    localStorage.setItem('lumen_pin', pin);
    localStorage.setItem('lumen_onboarded', 'true');

    const nameParts = (regForm.name || '').trim().split(' ');
    const firstName = nameParts[0] || 'Client';
    const lastName = nameParts.slice(1).join(' ') || '.';
    const email = regForm.email || `client_${Date.now()}@lumen.app`;
    const tempPassword = pin + '_Lm' + Date.now();
    const pbUrl = pb.baseUrl;

    const saveLocal = (id, status = 'pending') => {
      localStorage.setItem('lumen_pb_client_id', id);
      localStorage.setItem('lumen_pb_pass', tempPassword);
      localStorage.setItem('lumen_account_status', status);
      localStorage.setItem('lumen_user_id', id);
      setPbClientId(id);
      setAccountStatus(status);
      setUserId(id);
      const userData = { ...DEFAULT_USER, name: `${firstName} ${lastName}`, email, phone: regForm.phone || '', id, pbId: id };
      localStorage.setItem('lumen_user_data', JSON.stringify(userData));
      setUser(userData);
    };

    try {
      // Step 1: Get admin token
      const adminRes = await fetch(`${pbUrl}/api/admins/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: 'admin@lumen.bank', password: 'Lumen2026Admin' }),
      });
      const adminData = await adminRes.json();
      const adminToken = adminData.token;
      if (!adminToken) throw new Error('Admin auth failed');

      // Step 2: Create client record via admin API
      const clientRes = await fetch(`${pbUrl}/api/collections/clients/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': adminToken },
        body: JSON.stringify({
          email,
          password: tempPassword,
          passwordConfirm: tempPassword,
          emailVisibility: true,
          first_name: firstName,
          last_name: lastName,
          phone: regForm.phone || '',
          country: regForm.country || 'CA',
          language: langChoice || 'en',
          account_status: 'pending',
          kyc_status: 'none',
          aml_status: 'none',
          risk_level: 'low',
          pin,
        }),
      });
      const clientRecord = await clientRes.json();
      if (!clientRecord.id) throw new Error(clientRecord.message || 'Client creation failed');

      // Step 3: Create client_application via admin API (this is what shows up in CRM)
      await fetch(`${pbUrl}/api/collections/client_applications/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': adminToken },
        body: JSON.stringify({ client: clientRecord.id, status: 'submitted' }),
      });

      saveLocal(clientRecord.id, 'pending');
    } catch (err) {
      console.error('Registration error:', err);
      // Fallback: try direct PB SDK (works if createRule is open)
      try {
        const clientRecord = await pb.collection('clients').create({
          email, password: tempPassword, passwordConfirm: tempPassword,
          emailVisibility: true,
          first_name: firstName, last_name: lastName,
          phone: regForm.phone || '', country: regForm.country || 'CA',
          language: langChoice || 'en', account_status: 'pending',
          kyc_status: 'none', aml_status: 'none', risk_level: 'low', pin,
        });
        try {
          await pb.collection('client_applications').create({ client: clientRecord.id, status: 'submitted' });
        } catch {}
        saveLocal(clientRecord.id, 'pending');
      } catch (fallbackErr) {
        console.error('Fallback registration also failed:', fallbackErr);
        // Last resort: save locally only (no CRM visibility)
        const localId = 'USER_' + Date.now();
        localStorage.setItem('lumen_user_id', localId);
        setUserId(localId);
        const userData = { name: `${firstName} ${lastName}`, email, phone: regForm.phone || '', id: localId };
        localStorage.setItem('lumen_user_data', JSON.stringify(userData));
        setUser(userData);
        localStorage.setItem('lumen_account_status', 'pending');
        setAccountStatus('pending');
      }
    }

    setOnboardingDone(true);
    setIsAuthenticated(false);
  };

  // Poll account status while pending — public GET, no auth needed (viewRule = '')
  const refreshAccountStatus = useCallback(async () => {
    const clientId = localStorage.getItem('lumen_pb_client_id');
    if (!clientId || clientId.startsWith('USER_')) return;
    try {
      const res = await fetch(`${pb.baseUrl}/api/collections/clients/records/${clientId}`);
      if (!res.ok) return;
      const client = await res.json();
      const status = client.account_status || 'pending';
      setAccountStatus(status);
      localStorage.setItem('lumen_account_status', status);
    } catch {}
  }, []);

  const addTransaction = async (tx) => {
    const newTx = { ...tx, id: 'TX-' + Date.now(), date: new Date().toISOString() };
    setTransactions(prev => [newTx, ...prev]);
  };

  const updateCard = async (id, data) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const bypassOnboarding = () => {
    localStorage.setItem('lumen_onboarded', 'true');
    setOnboardingDone(true);
  };

  // Phase 2: Biometric (WebAuthn) stubs
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
      user, setUser, isAuthenticated, onboardingDone,
      pinLocked, pinAttempts, login, logout, changePin, resetPinLock, completeOnboarding, bypassOnboarding,
      cards, updateCard, transactions, addTransaction,
      kycStatus, setKycStatus, amlStatus, setAmlStatus,
      creditStatus, setCreditStatus,
      biometric, setBiometric, registerBiometric, twoFactor, setTwoFactor,
      notifications, setNotifications, installApp, deferredPrompt,
      cryptoAssets: CRYPTO_ASSETS,
      pbClientId, accountStatus, setAccountStatus, refreshAccountStatus, loadClientData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
export default AppContext;
