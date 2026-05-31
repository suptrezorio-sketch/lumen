import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import LumenLogo from '../components/LumenLogo';
import { Icons } from '../assets/Icons';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

const pulse = {
  animate: { scale: [1, 1.08, 1] },
  transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
};

const ringRotate = {
  animate: { rotate: 360 },
  transition: { duration: 4, repeat: Infinity, ease: 'linear' }
};

export default function PendingApproval() {
  const { user, accountStatus, refreshAccountStatus, logout, t } = useApp();
  const intervalRef = useRef(null);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    refreshAccountStatus();
    intervalRef.current = setInterval(refreshAccountStatus, 10000);
    return () => clearInterval(intervalRef.current);
  }, [refreshAccountStatus]);

  useEffect(() => {
    const iv = setInterval(() => {
      setCountdown(p => (p <= 1 ? 10 : p - 1));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const isRejected = accountStatus === 'rejected' || accountStatus === 'blocked';

  const steps = [
    { label: 'Application submitted', done: true },
    { label: 'Identity verification', active: true },
    { label: 'Account activation', pending: true },
  ];

  return (
    <div className="h-screen max-w-[430px] mx-auto flex flex-col items-center justify-center bg-white dark:bg-black safe-top px-8">
      <AnimatePresence mode="wait">
        {isRejected ? (
          <motion.div key="rejected" {...fadeIn} className="flex flex-col items-center text-center">
            <motion.div
              {...pulse}
              className="w-20 h-20 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl flex items-center justify-center mb-6"
            >
              <Icons.X size={36} className="text-gray-400" />
            </motion.div>

            <h1 className="text-2xl font-bold text-lumen-black dark:text-white mb-3">
              {accountStatus === 'blocked' ? 'Account Blocked' : 'Application Not Approved'}
            </h1>

            <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-xs">
              {accountStatus === 'blocked'
                ? 'Your account has been blocked. Please contact LUMEN support for assistance.'
                : 'We were unable to approve your application at this time. Please contact support for more information.'
              }
            </p>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={logout}
              className="px-8 py-3 bg-gray-100 dark:bg-[#1C1C1E] text-gray-600 dark:text-gray-300 rounded-2xl font-semibold text-sm"
            >
              Sign Out
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="pending" {...fadeIn} className="flex flex-col items-center text-center h-full">
            {/* Logo and Back Arrow Placeholder */}
            <div className="w-full flex justify-between items-center mt-6">
              <button onClick={logout} className="p-2 -ml-2 text-black dark:text-white active:opacity-50 transition-opacity">
                <Icons.ArrowLeft size={28} strokeWidth={2.5} />
              </button>
              <LumenLogo size={28} variant="auto" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center -mt-20">
              <motion.div
                {...pulse}
                className="mb-8"
              >
                <Icons.PendingUser size={160} strokeWidth={1} className="text-black dark:text-white" />
              </motion.div>

              <h1 className="text-[32px] font-bold text-black dark:text-white leading-tight mb-4 tracking-tight">
                Waiting<br />conformation
              </h1>

              <p className="text-base text-gray-400 font-medium mb-8">
                Check your email now
              </p>
            </div>

            <div className="w-full pb-8">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => window.open('mailto:', '_blank')}
                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-semibold text-[17px]"
              >
                Open Gmail
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign out */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={logout}
        className="absolute bottom-8 text-xs text-gray-300 dark:text-gray-600 uppercase tracking-widest"
      >
        Sign Out
      </motion.button>
    </div>
  );
}
