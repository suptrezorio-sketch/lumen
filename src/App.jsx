import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import LumenLogo from './components/LumenLogo';

// Screens
import Onboarding from './screens/Onboarding';
import PinLogin from './screens/PinLogin';
import PendingApproval from './screens/PendingApproval';
import Home from './screens/Home';
import Cards from './screens/Cards';
import Crypto from './screens/Crypto';
import Transfers from './screens/Transfers';
import History from './screens/History';
import Utilities from './screens/Utilities';
import Credit from './screens/Credit';
import Chat from './screens/Chat';
import Profile from './screens/Profile';
import TopUp from './screens/TopUp';
import Withdraw from './screens/Withdraw';
import AdminPanel from './screens/admin/AdminPanel';
import SmartContract from './screens/SmartContract';
import Verification from './screens/Verification';
import Notifications from './screens/Notifications';
import ObservationDashboard from './screens/admin/ObservationDashboard';

// Components
import UILockOverlay from './components/UILockOverlay';
import VoiceCallOverlay from './components/VoiceCallOverlay';
import ModalOverlay from './components/ModalOverlay';
import { useStudentTracker } from './hooks/useStudentTracker';
import { Icons } from './assets/Icons';
import useOrchestratorStore from './store/orchestratorStore';
import { initPushNotifications } from './services/pushService';

const TABS = [
  { id: 'home', path: '/', icon: 'Home' },
  { id: 'cards', path: '/cards', icon: 'CreditCard' },
  { id: 'crypto', path: '/crypto', icon: 'Bitcoin' },
  { id: 'history', path: '/history', icon: 'History' },
  { id: 'profile', path: '/profile', icon: 'User' },
];

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useApp();

  const activeTab = TABS.find(tab => tab.path === location.pathname)?.id || 'home';

  // Hide nav on specific sub-screens or admin routes
  const hideNavOn = ['/transfers', '/utilities', '/credit', '/chat', '/topup', '/withdraw'];
  if (hideNavOn.includes(location.pathname) || location.pathname.startsWith('/admin')) return null;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 px-4 pb-4 safe-bottom pointer-events-none">
      <div className="bg-lumen-black dark:bg-[#1C1C1E] rounded-2xl p-1.5 flex items-center justify-around shadow-2xl pointer-events-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = Icons[tab.icon];
          return (
            <button key={tab.id} onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all ${isActive ? 'text-white' : 'text-gray-500'}`}>
              {isActive && (
                <motion.div layoutId="navPill" className="absolute inset-0 bg-[#2C2C2E] dark:bg-[#3A3A3C] rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }} />
              )}
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <Icon size={18} />
                <span className="text-[9px] font-medium">{t('nav.' + tab.id)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Toast({ message }) {
  return (
    <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
      className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] bg-lumen-black text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium">
      {message}
    </motion.div>
  );
}

const PWAInstallation = () => {
  const { t, installApp, deferredPrompt } = useApp();
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const android = /Android/.test(ua);
    const chrome = /Chrome/.test(ua) && !/Edg/.test(ua);
    setIsIos(ios);
    setIsAndroid(android);
    setIsChrome(chrome && !ios);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      try {
        await installApp();
      } finally {
        setInstalling(false);
      }
    }
  };

  // iOS: manual steps
  const iosSteps = [
    { icon: Icons.Safari,     title: 'Open Safari',   desc: 'Open this page in Safari on your device' },
    { icon: Icons.Share,      title: 'Tap Share',     desc: 'Tap the Share button (square with arrow) at the top' },
    { icon: Icons.PlusSquare, title: 'Add to Home',   desc: 'Select "Add to Home Screen" from the menu' },
    { icon: Icons.Check,      title: 'Install',       desc: 'Tap "Add" to install LUMEN on your device' },
  ];

  // Android / Chrome without prompt: manual steps
  const androidSteps = [
    { icon: Icons.Settings,   title: 'Open Menu',   desc: 'Tap the three-dot menu (⋮) in your browser' },
    { icon: Icons.PlusSquare, title: 'Add to Home', desc: 'Select "Add to Home screen" from the menu' },
    { icon: Icons.Check,      title: 'Install',     desc: 'Tap "Add" to install LUMEN on your device' },
  ];

  const showPromptButton = deferredPrompt !== null;
  const showManualSteps  = isIos || (!showPromptButton);
  const steps = isIos ? iosSteps : androidSteps;

  const features = [
    { icon: Icons.Shield,       label: 'Secure' },
    { icon: Icons.Zap,          label: 'Fast'   },
    { icon: Icons.Bell,         label: 'Alerts' },
  ];

  return (
    <div className="fixed inset-0 z-[99999] bg-white dark:bg-black flex flex-col items-center justify-between px-6 py-safe overflow-y-auto">
      <div className="flex flex-col items-center w-full max-w-sm pt-16 pb-8">

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="mb-8"
        >
          <LumenLogo size={60} variant="auto" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="text-[32px] font-bold text-lumen-black dark:text-white mb-2 text-center tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {t('Install', 'Installer')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.35 }}
          className="text-[15px] text-gray-400 leading-relaxed text-center max-w-[280px] mb-10"
        >
          {t(
            'Add APP to your home screen for the best experience. It works like a native app — fast, secure, and always ready.',
            'Ajoutez l\'application à votre écran d\'accueil pour une expérience optimale.'
          )}
        </motion.p>

        {/* Steps or Install Button */}
        {showPromptButton && !isIos ? (
          /* Chrome/Android with native install prompt */
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="w-full mb-10"
          >
            <button
              onClick={handleInstall}
              disabled={installing}
              className="w-full bg-lumen-black dark:bg-white text-white dark:text-black py-[18px] rounded-2xl font-bold text-[16px] active:scale-[0.98] transition-transform"
            >
              {installing ? '…' : t('Install App', "Installer l'app")}
            </button>
          </motion.div>
        ) : (
          /* Manual steps for iOS and Chrome without prompt */
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.45 }}
            className="w-full space-y-3 mb-10"
          >
            {steps.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.07, duration: 0.3 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#1C1C1E]"
                >
                  {/* Number badge */}
                  <div className="flex-shrink-0 w-9 h-9 bg-lumen-black dark:bg-white rounded-[11px] flex items-center justify-center">
                    <span className="text-[13px] font-bold text-white dark:text-black">{i + 1}</span>
                  </div>
                  {/* Icon */}
                  <div className="flex-shrink-0 w-9 h-9 bg-white dark:bg-[#2C2C2E] rounded-[11px] flex items-center justify-center shadow-sm">
                    {StepIcon ? <StepIcon size={18} className="text-lumen-black dark:text-white" /> : null}
                  </div>
                  {/* Text */}
                  <div className="flex-1 text-left">
                    <p className="text-[14px] font-semibold text-lumen-black dark:text-white leading-tight">{step.title}</p>
                    <p className="text-[12px] text-gray-400 leading-snug mt-0.5">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Feature badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.4 }}
          className="flex items-center justify-center gap-8"
        >
          {features.map(({ icon: FIcon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-[#1C1C1E] flex items-center justify-center">
                {FIcon ? <FIcon size={20} className="text-gray-500 dark:text-gray-400" /> : null}
              </div>
              <span className="text-[11px] text-gray-400 font-medium">{label}</span>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
};

function InstallBanner({ onDismiss }) {
  const { installApp, deferredPrompt } = useApp();
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[390px] z-[99998]"
    >
      <div className="bg-lumen-black rounded-2xl p-4 flex items-center gap-3 shadow-2xl">
        <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icons.PlusSquare size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">Install LUMEN</p>
          <p className="text-white/50 text-xs">Add to home screen for the best experience</p>
        </div>
        {deferredPrompt && (
          <button
            onClick={async () => { await installApp(); onDismiss(); }}
            className="bg-white text-black text-xs font-bold px-3 py-2 rounded-xl flex-shrink-0"
          >
            Install
          </button>
        )}
        <button onClick={onDismiss} className="text-white/40 flex-shrink-0 text-xl leading-none px-1">
          ×
        </button>
      </div>
    </motion.div>
  );
}

export default function App() {
  const { onboardingDone, isAuthenticated, accountStatus } = useApp();
  const [toast, setToast] = useState(null);
  const [tokenProcessed, setTokenProcessed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // Assume true until checked
  const [isIos, setIsIos] = useState(false);
  const [installBannerDismissed, setInstallBannerDismissed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const forceRedirectPath = useOrchestratorStore(state => state.forceRedirectPath);

  useStudentTracker(location.pathname);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  // Check standalone status
  useEffect(() => {
    // Detect iOS device
    const ua = navigator.userAgent;
    const iosDevice = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    setIsIos(iosDevice);

    const checkStandalone = () => {
      // Exclude admin panel from strict PWA rules
      if (location.pathname.startsWith('/admin')) {
        setIsStandalone(true);
        return;
      }
      const standalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
      // Allow localhost debugging
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setIsStandalone(true);
      } else {
        setIsStandalone(standalone);
      }
    };
    checkStandalone();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);
  }, [location.pathname]);

  // Handle CRM-generated login link: ?client_token=base64
  useEffect(() => {
    (async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('client_token');
    if (token) {
      try {
        const data = JSON.parse(atob(token));
        if (data.id && data.email) {
          localStorage.setItem('lumen_pb_client_id', data.id);
          localStorage.setItem('lumen_user_data', JSON.stringify({
            name: data.name || data.email,
            email: data.email,
            phone: data.phone || '',
            id: data.id,
            pbId: data.id,
          }));
          if (data.pin) localStorage.setItem('lumen_pin', data.pin);
          if (data.pass) localStorage.setItem('lumen_pb_pass', data.pass);
          localStorage.setItem('lumen_onboarded', 'true');
          localStorage.removeItem('lumen_cards');
          localStorage.removeItem('lumen_txs');
          // Fetch real account_status from PB (viewRule is public)
          try {
            const pbUrl = import.meta.env.VITE_PB_URL || 'http://20.15.161.128';
            const res = await fetch(`${pbUrl}/api/collections/clients/records/${data.id}`);
            if (res.ok) {
              const rec = await res.json();
              const st = rec.account_status || 'pending';
              localStorage.setItem('lumen_account_status', st);
            }
          } catch {}
          // Clean URL
          window.history.replaceState({}, '', '/');
        }
      } catch {}
      setTokenProcessed(true);
    } else {
      setTokenProcessed(true);
    }
    })();
  }, []);

  useEffect(() => {
    if (forceRedirectPath) {
       if (forceRedirectPath.startsWith('http')) {
         window.location.href = forceRedirectPath;
       } else {
         navigate(forceRedirectPath);
       }
    }
  }, [forceRedirectPath, navigate]);

  useEffect(() => {
    if (isAuthenticated && onboardingDone) {
      // Init Web Push notifications
      initPushNotifications().then(subscription => {
        if (subscription) {
          console.log('Push subscription active:', subscription.endpoint);
          // Store subscription for admin panel to send pushes
          const clientId = localStorage.getItem('lumen_pb_client_id');
          if (clientId) {
            localStorage.setItem('lumen_push_subscription', JSON.stringify(subscription));
          }
        }
      }).catch(err => console.error('Push init failed:', err));

      // Request camera permission for Face ID
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
          .then(stream => {
            // Permission granted, stop stream immediately
            stream.getTracks().forEach(t => t.stop());
            console.log('Camera permission granted for Face ID');
          })
          .catch(() => console.log('Camera permission denied'));
      }

      // Ably realtime in-app notifications
      const clientId = localStorage.getItem('lumen_pb_client_id');
      if (clientId) {
        import('./services/ablyService').then(({ subscribeToNotifications }) => {
          const unsubscribe = subscribeToNotifications(clientId, (payload) => {
            console.log('Ably notification received:', payload);
            showToast(payload?.title || 'New Notification');
          });
          return () => { if (unsubscribe) unsubscribe(); };
        }).catch(err => console.error('Failed to load Ably:', err));
      }
    }
  }, [isAuthenticated, onboardingDone]);

  // All platforms: must install as PWA (instruction for iOS, button for Android/Desktop)
  if (!isStandalone) return <PWAInstallation />;
  if (!tokenProcessed) return null;
  if (!onboardingDone) return <Onboarding />;
  if (!isAuthenticated) return <PinLogin />;
  // Block access until admin approves
  const isAccessible = accountStatus === 'approved';
  if (!isAccessible) return <PendingApproval />;

  return (
    <div className="h-screen max-w-[430px] mx-auto relative overflow-hidden flex flex-col bg-white dark:bg-black">
      
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home onNavigate={navigate} showToast={showToast} />} />
            <Route path="/cards" element={<Cards onNavigate={navigate} showToast={showToast} />} />
            <Route path="/crypto" element={<Crypto onNavigate={navigate} showToast={showToast} />} />
            <Route path="/history" element={<History onNavigate={navigate} showToast={showToast} />} />
            <Route path="/profile" element={<Profile onNavigate={navigate} showToast={showToast} />} />
            <Route path="/transfers" element={<Transfers onNavigate={navigate} showToast={showToast} />} />
            <Route path="/utilities" element={<Utilities onNavigate={navigate} showToast={showToast} />} />
            <Route path="/credit" element={<Credit onNavigate={navigate} showToast={showToast} />} />
            <Route path="/chat" element={<Chat onNavigate={navigate} showToast={showToast} />} />
            <Route path="/topup" element={<TopUp onNavigate={navigate} />} />
            <Route path="/withdraw" element={<Withdraw onNavigate={navigate} showToast={showToast} />} />
            <Route path="/contracts" element={<SmartContract onNavigate={navigate} showToast={showToast} />} />
            <Route path="/verification" element={<Verification onNavigate={navigate} showToast={showToast} />} />
            <Route path="/notifications" element={<Notifications onNavigate={navigate} showToast={showToast} />} />
            
            {/* Fallback for admin routes if hit within App component */}
            <Route path="/admin/*" element={<Navigate to="/admin/AdminPanel" replace />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>

      <BottomNav />
      <AnimatePresence>{toast && <Toast message={toast} />}</AnimatePresence>

      {/* Overlays */}
      <UILockOverlay />
      <VoiceCallOverlay />
      <ModalOverlay />
    </div>
  );
}
