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

  const login = async (pin) => {
    const storedPin = localStorage.getItem('lumen_pin');
    if (pin === storedPin) { 
      setIsAuthenticated(true); 
      setPinAttempts(0); 
      setSessionToken('LM-' + Math.random().toString(36).substring(2, 15));
      setLastActivity(Date.now());
      return true; 
    }
    const next = pinAttempts + 1;
    setPinAttempts(next);
    if (next >= 3) setPinLocked(true);
    return false;
  };

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
    const newUserId = 'USER_' + Date.now();
    localStorage.setItem('lumen_user_id', newUserId);
    setUserId(newUserId);
    const userData = { ...DEFAULT_USER, ...regForm, id: newUserId };
    localStorage.setItem('lumen_user_data', JSON.stringify(userData));
    setUser(userData);
    setOnboardingDone(true);
    setIsAuthenticated(false);
  };

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
      user, setUser, isAuthenticated, onboardingDone,
      pinLocked, pinAttempts, login, logout, completeOnboarding, bypassOnboarding,
      cards, updateCard, transactions, addTransaction,
      kycStatus, setKycStatus, amlStatus, setAmlStatus,
      creditStatus, setCreditStatus,
      biometric, setBiometric, registerBiometric, twoFactor, setTwoFactor,
      notifications, setNotifications, installApp, deferredPrompt,
      cryptoAssets: CRYPTO_ASSETS,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
export default AppContext;
