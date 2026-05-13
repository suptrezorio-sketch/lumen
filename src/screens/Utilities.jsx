import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';

function OTPModal({ onVerify, onClose, t }) {
  const [code, setCode] = useState('');
  const [showBtn, setShowBtn] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      const c = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedCode(c);
      setShowBtn(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDigit = (d) => { if (code.length < 6) setCode(code + d); };
  const handleDelete = () => setCode(code.slice(0, -1));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[80] flex items-end justify-center">
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        className="w-full max-w-[430px] bg-white dark:bg-[#1C1C1E] rounded-t-3xl p-6 pb-10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-lumen-black dark:text-white">{t('otp.title')}</h3>
          <button onClick={onClose}><Icons.X size={24} className="text-gray-400" /></button>
        </div>
        
        <div className="flex gap-2 justify-center mb-8">
          {[0,1,2,3,4,5].map(i => (
            <div key={i} className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all
              ${i < code.length ? 'border-lumen-black dark:border-white bg-gray-50 dark:bg-[#2C2C2E] text-lumen-black dark:text-white' : 'border-gray-200 dark:border-gray-600'}`}>
              {code[i] || ''}
            </div>
          ))}
        </div>

        {showBtn && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => setCode(generatedCode)}
            className="w-full py-3 mb-6 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl text-sm font-bold">
            {t('otp.showCode')}: {generatedCode}
          </motion.button>
        )}

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[1,2,3,4,5,6,7,8,9,'',0,'del'].map((k, i) => (
            <motion.button key={i} whileTap={{ scale: 0.95 }}
              onClick={() => k === 'del' ? handleDelete() : k !== '' ? handleDigit(String(k)) : null}
              className={`h-14 rounded-xl text-xl font-bold flex items-center justify-center ${k === '' ? 'invisible' : 'bg-gray-50 dark:bg-[#2C2C2E] text-lumen-black dark:text-white'}`}>
              {k === 'del' ? <Icons.ArrowLeft size={24} /> : k}
            </motion.button>
          ))}
        </div>

        <button onClick={() => onVerify(code)} disabled={code.length < 6}
          className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold disabled:opacity-30">
          {t('otp.verify')}
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function Utilities({ onNavigate, showToast }) {
  const { t, addTransaction } = useApp();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const categories = [
    { id: 'phone', icon: 'Phone', color: 'bg-blue-500' },
    { id: 'internet', icon: 'Wifi', color: 'bg-purple-500' },
    { id: 'electricity', icon: 'Zap', color: 'bg-yellow-500' },
    { id: 'water', icon: 'Droplets', color: 'bg-cyan-500' },
    { id: 'housing', icon: 'Home', color: 'bg-orange-500' }
  ];

  const handlePay = () => {
    if (!selectedCategory || !phone || !amount) return;
    setShowOtp(true);
  };

  const verifyOtp = () => {
    setShowOtp(false);
    setIsDone(true);
    showToast(t('common.success'));
    
    addTransaction({
      type: 'outgoing',
      title: t('history.' + selectedCategory),
      description: phone,
      amount: -parseFloat(amount),
      category: selectedCategory,
      status: 'completed'
    });

    // IMMEDIATELY navigate home after delay
    setTimeout(() => {
      onNavigate('/');
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black">
      <div className="sticky top-0 bg-white/80 dark:bg-black/80 px-5 py-4 flex items-center gap-4 z-20">
        <button onClick={() => onNavigate('/')}><Icons.ArrowLeft size={24} className="text-lumen-black dark:text-white" /></button>
        <h2 className="text-xl font-bold text-lumen-black dark:text-white">{t('utilities_screen.title')}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 pb-32">
        <div className="grid grid-cols-3 gap-3">
          {categories.map(cat => {
            const Icon = Icons[cat.icon];
            const active = selectedCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border-2 ${active ? 'border-lumen-black dark:border-white bg-lumen-black dark:bg-white text-white dark:text-black' : 'border-transparent bg-gray-50 dark:bg-[#1C1C1E] text-gray-500'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? 'bg-white/20' : cat.color + ' text-white'}`}>
                  <Icon size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{t('history.' + cat.id)}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('transfers.recipient')}</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="000-000-0000"
              className="w-full p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl text-sm font-bold text-lumen-black dark:text-white outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('transfers.amount')}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">$</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                className="w-full p-4 pl-10 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl text-2xl font-bold text-lumen-black dark:text-white outline-none" />
            </div>
          </div>
        </div>

        <button onClick={handlePay} disabled={!selectedCategory || !phone || !amount || isDone}
          className="w-full py-5 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-lg shadow-xl disabled:opacity-30 uppercase tracking-widest">
          {isDone ? 'COMPLETED' : t('common.confirm')}
        </button>
      </div>

      <AnimatePresence>
        {showOtp && <OTPModal onVerify={verifyOtp} onClose={() => setShowOtp(false)} t={t} />}
      </AnimatePresence>
    </div>
  );
}
