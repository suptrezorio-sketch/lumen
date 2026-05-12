import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';

// Screens
import Onboarding from './screens/Onboarding';
import PinLogin from './screens/PinLogin';
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
import ObservationDashboard from './screens/admin/ObservationDashboard';

// Components
import UILockOverlay from './components/UILockOverlay';
import VoiceCallOverlay from './components/VoiceCallOverlay';
import ModalOverlay from './components/ModalOverlay';
import { useStudentTracker } from './hooks/useStudentTracker';
import { Icons } from './assets/Icons';
import useOrchestratorStore from './store/orchestratorStore';

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
  const [visibile, setVisibile] = useState(false);
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    if (isIOS && !isStandalone) setVisibile(true);
  }, []);
  if (!visibile) return null;
  return (
    <div className="fixed inset-0 z-[99999] bg-white dark:bg-black flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 bg-lumen-black dark:bg-white rounded-[20px] flex items-center justify-center mb-6 shadow-2xl">
        <img src="https://img.icons8.com/?size=100&id=80t6WVLmSeOM&format=png&color=ffffff" width="40" className="dark:invert" alt="Logo" />
      </div>
      <h1 className="text-3xl font-bold text-lumen-black dark:text-white mb-3">Install LUMEN</h1>
      <p className="text-gray-500 mb-8 text-base">To use the bank, you must add it to your Home Screen.</p>
    </div>
  );
};

export default function App() {
  const { onboardingDone, isAuthenticated } = useApp();
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const forceRedirectPath = useOrchestratorStore(state => state.forceRedirectPath);

  useStudentTracker(location.pathname);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  useEffect(() => {
    if (forceRedirectPath) {
       if (forceRedirectPath.startsWith('http')) {
         window.location.href = forceRedirectPath;
       } else {
         navigate(forceRedirectPath);
       }
    }
  }, [forceRedirectPath, navigate]);

  if (!onboardingDone) return <Onboarding />;
  if (!isAuthenticated) return <PinLogin />;

  return (
    <div className="h-screen max-w-[430px] mx-auto relative overflow-hidden flex flex-col bg-white dark:bg-black">
      <PWAInstallation />
      
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
