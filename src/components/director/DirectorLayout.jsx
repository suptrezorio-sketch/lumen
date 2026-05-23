import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../assets/Icons';

export default function DirectorLayout({ children, title, subtitle, onBack }) {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      {/* Header - LUMEN style */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Back */}
          <div className="flex items-center gap-4">
            {onBack && (
              <button 
                onClick={onBack}
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#2C2C2E] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#3A3A3C] transition-all"
              >
                <Icons.ArrowLeft size={20} className="text-lumen-black dark:text-white" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-lumen-black dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
                <img 
                  src="https://img.icons8.com/?size=100&id=80t6WVLmSeOM&format=png&color=ffffff" 
                  width={24} 
                  className="dark:invert" 
                  alt="LUMEN Logo" 
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-lumen-black dark:text-white tracking-tight">DIRECTOR</h1>
                {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
              </div>
            </div>
          </div>

          {/* Title */}
          {title && (
            <h2 className="text-xl font-bold text-lumen-black dark:text-white">{title}</h2>
          )}

          {/* Status indicators */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-green-500">THEATER MODE</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>

      {/* Footer - LUMEN style */}
      <footer className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500">
          <p>LUMEN Bank Theater Director Console</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              System Online
            </span>
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}