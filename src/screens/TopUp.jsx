import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';

export default function TopUp({ onNavigate }) {
  const { t } = useApp();
  const [step, setStep] = useState('amount'); // 'amount', 'method', 'submitting', 'success'
  const [data, setData] = useState({
    amount: '',
    currency: 'CAD',
    country: '',
    city: '',
    method: 'crypto', // 'crypto', 'cash', 'terminal', 'other_bank', 'western_union', 'paysera'
  });

  const methods = [
    { id: 'crypto', label: 'Crypto (USDT/BTC)', icon: <Icons.Bitcoin size={20} /> },
    { id: 'cash', label: 'Cash (Local Pickup)', icon: <Icons.DollarSign size={20} /> },
    { id: 'terminal', label: 'Self-Service Terminal', icon: <Icons.Building size={20} /> },
    { id: 'other_bank', label: 'Other Bank (Card/IBAN)', icon: <Icons.CreditCard size={20} /> },
    { id: 'western_union', label: 'Western Union / MoneyGram', icon: <Icons.Send size={20} /> },
    { id: 'paysera', label: 'Paysera / Revolut', icon: <Icons.Zap size={20} /> },
  ];

  const handleSubmit = () => {
    setStep('submitting');
    // Simulation of sending to admin
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate('/')}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
          <h2 className="text-base font-bold text-lumen-black dark:text-white">Top Up (P2P)</h2>
          <div className="w-6" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6">
        <AnimatePresence mode="wait">
          {step === 'amount' && (
            <motion.div key="amount" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Requested Amount</label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-lumen-black dark:text-white">$</span>
                  <input type="number" value={data.amount} onChange={e => setData({...data, amount: e.target.value})} placeholder="0.00"
                    className="w-full p-5 pl-10 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl text-3xl font-black text-lumen-black dark:text-white outline-none border-2 border-transparent focus:border-blue-500/30" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Country</label>
                  <input type="text" value={data.country} onChange={e => setData({...data, country: e.target.value})} placeholder="e.g. Canada"
                    className="w-full mt-2 p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl text-sm font-bold text-lumen-black dark:text-white outline-none" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">City</label>
                  <input type="text" value={data.city} onChange={e => setData({...data, city: e.target.value})} placeholder="e.g. Toronto"
                    className="w-full mt-2 p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl text-sm font-bold text-lumen-black dark:text-white outline-none" />
                </div>
              </div>

              <button disabled={!data.amount || !data.city} onClick={() => setStep('method')}
                className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold uppercase tracking-widest disabled:opacity-20 transition-all">
                Select Method
              </button>
            </motion.div>
          )}

          {step === 'method' && (
            <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Deposit Method</label>
              <div className="grid grid-cols-1 gap-2">
                {methods.map(m => (
                  <button key={m.id} onClick={() => setData({...data, method: m.id})}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border-2 ${data.method === m.id ? 'border-lumen-black dark:border-white bg-lumen-black dark:bg-white text-white dark:text-black' : 'bg-gray-50 dark:bg-[#1C1C1E] border-transparent text-lumen-black dark:text-white'}`}>
                    <div className={data.method === m.id ? 'text-white dark:text-black' : 'text-blue-500'}>{m.icon}</div>
                    <span className="text-sm font-bold">{m.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 space-y-3">
                <button onClick={handleSubmit} className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold uppercase tracking-widest">
                  Submit Request
                </button>
                <button onClick={() => setStep('amount')} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-lumen-black dark:text-white rounded-2xl font-bold uppercase tracking-widest text-xs">
                  Back
                </button>
              </div>
            </motion.div>
          )}

          {step === 'submitting' && (
            <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <div>
                <h3 className="text-lg font-bold text-lumen-black dark:text-white">Connecting to Cashier...</h3>
                <p className="text-xs text-gray-500 mt-1">Please wait while we process your request.</p>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-10 text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center shadow-lg">
                <Icons.Check size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-lumen-black dark:text-white uppercase tracking-tighter">Request Sent!</h2>
                <p className="text-sm text-gray-500 px-10">Your top-up request for <b>${data.amount}</b> has been received. Our manager will contact you in the chat with the payment details.</p>
              </div>
              <div className="w-full space-y-3 pt-6">
                <button onClick={() => onNavigate('/chat')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg">Open Chat</button>
                <button onClick={() => onNavigate('/')} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-lumen-black dark:text-white rounded-2xl font-bold uppercase tracking-widest text-xs">Done</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
