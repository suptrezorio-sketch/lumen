import React from 'react';
import { motion } from 'framer-motion';
import useOrchestratorStore from '../store/orchestratorStore';
import { useApp } from '../context/AppContext';

const UILockOverlay = () => {
  const uiLock = useOrchestratorStore(state => state.uiLock);
  const { t } = useApp();

  // Don't render anything when UI is not locked
  if (!uiLock) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-lumen-black/90 dark:bg-black/90 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative flex flex-col items-center justify-center text-center px-6 py-8"
      >
        <div className="w-16 h-16 bg-lumen-black/50 dark:bg-white/50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white dark:text-black mb-4">
          {t('uilock.title') || 'Technical Works'}
        </h2>
        <p className="text-lg text-gray-300 dark:text-gray-400 mb-6">
          {t('uilock.message') || "We're performing scheduled maintenance. We'll be back shortly."}
        </p>
        {/* Optional: add a spinner or animation */}
        <motion.div className="w-12 h-12 border-4 border-t-white dark:border-t-black rounded-full animate-spin" />
      </motion.div>
    </motion.div>
  );
};

export default UILockOverlay;