import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import socket from '../services/socketService';

export default function AlertOverlay() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const handleAlert = (data) => {
      const id = Date.now();
      setAlerts(prev => [...prev, { id, text: data.text || data.message || 'Notification', title: data.title || 'LUMEN Bank' }]);
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== id));
      }, 6000);
    };

    socket.on('SHOW_ALERT', handleAlert);
    socket.on('adminMessage', handleAlert);
    return () => {
      socket.off('SHOW_ALERT', handleAlert);
      socket.off('adminMessage', handleAlert);
    };
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-full max-w-[400px] px-4 space-y-2 pointer-events-none">
      <AnimatePresence>
        {alerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-gray-200 dark:border-gray-700 pointer-events-auto"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-lumen-black dark:bg-white flex items-center justify-center shrink-0 shadow-lg">
                <img src="https://img.icons8.com/?size=100&id=80t6WVLmSeOM&format=png&color=ffffff" width="20" className="dark:invert" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{alert.title}</p>
                <p className="text-sm font-medium text-lumen-black dark:text-white leading-snug">{alert.text}</p>
              </div>
              <span className="text-[10px] text-gray-400 shrink-0">now</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
