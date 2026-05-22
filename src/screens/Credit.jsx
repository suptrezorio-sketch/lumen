import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';

export default function Credit({ onNavigate }) {
  const { t, creditStatus, setCreditStatus } = useApp();
  const [amount, setAmount] = useState(10000);
  const [term, setTerm] = useState(12);
  const [employment, setEmployment] = useState('employed');
  const [income, setIncome] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const rate = 7.95;
  const monthly = (amount * (rate / 100 / 12) * Math.pow(1 + rate / 100 / 12, term)) / (Math.pow(1 + rate / 100 / 12, term) - 1);
  const total = monthly * term;

  useEffect(() => {
    const onCredit = (e) => {
      setCreditStatus(e.detail);
      localStorage.setItem('lumen_credit', e.detail);
    };
    window.addEventListener('LUMEN_CREDIT_STATUS', onCredit);
    return () => window.removeEventListener('LUMEN_CREDIT_STATUS', onCredit);
  }, [setCreditStatus]);

  const handleApply = async () => {
    if (!income || !purpose) return;
    try {
      const userId = localStorage.getItem('lumen_user_id') || 'test-user';
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
      await fetch(`${backendUrl}/api/credit/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, term, rate, employment, income, purpose, collateral: 'None' })
      }).catch(() => {});
      setCreditStatus('pending');
      localStorage.setItem('lumen_credit', 'pending');
      setIsSuccess(true);
    } catch (e) {
      console.error('Credit request failed', e);
    }
  };

  if (isSuccess) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-black">
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full flex items-center justify-center mb-6">
          <Icons.History size={40} />
        </div>
        <h2 className="text-2xl font-bold text-lumen-black dark:text-white mb-2">Under Review</h2>
        <p className="text-gray-500 mb-2">Your application for <strong>${amount.toLocaleString()}</strong> has been submitted.</p>
        <p className="text-xs text-gray-400 mb-8">Your personal manager will review it and contact you via chat. This usually takes 1–2 business days.</p>
        <div className="w-full bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-3xl p-5 space-y-3 mb-8">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Amount</span><span className="font-bold">${amount.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Term</span><span className="font-bold">{term} months</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Rate</span><span className="font-bold">{rate}% p.a.</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Monthly est.</span><span className="font-bold">${monthly.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm border-t border-yellow-200 dark:border-yellow-800 pt-3">
            <span className="text-gray-500">Status</span>
            <span className="font-bold text-yellow-600 flex items-center gap-1"><Icons.History size={12} /> Pending Approval</span>
          </div>
        </div>
        <div className="w-full space-y-3">
          <button onClick={() => onNavigate('/chat')} className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold flex items-center justify-center gap-2">
            <Icons.Chat size={20} /> Contact Manager
          </button>
          <button onClick={() => onNavigate('/')} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-lumen-black dark:text-white rounded-2xl font-bold">
            Back to Home
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black">
      <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate('/')}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
          <h2 className="text-base font-bold text-lumen-black dark:text-white">{t('credit.title')}</h2>
          <div className="w-6" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-5 pb-10">
        {creditStatus !== 'none' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl ${creditStatus === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200' : creditStatus === 'approved' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' : 'bg-red-50 dark:bg-red-900/20 border border-red-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${creditStatus === 'pending' ? 'bg-yellow-100 text-yellow-600' : creditStatus === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {creditStatus === 'pending' ? <Icons.History size={20} /> : creditStatus === 'approved' ? <Icons.Check size={20} /> : <Icons.X size={20} />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-lumen-black dark:text-white">{t('credit.statusTitle')}</h4>
                <p className={`text-xs font-semibold ${creditStatus === 'pending' ? 'text-yellow-600' : creditStatus === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                  {creditStatus === 'pending' ? t('credit.underReview') : creditStatus === 'approved' ? t('credit.approved') : t('credit.rejected')}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Calculator */}
        <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Icons.Calculator size={20} className="text-lumen-black dark:text-white" />
            <h3 className="text-base font-bold text-lumen-black dark:text-white">{t('credit.loanCalculator')}</h3>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">{t('credit.amount')}</span>
                <span className="text-sm font-bold text-lumen-black dark:text-white">${amount.toLocaleString()}</span>
              </div>
              <input type="range" min="1000" max="50000" step="1000" value={amount} onChange={e => setAmount(parseInt(e.target.value))} className="w-full accent-lumen-black dark:accent-white" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>$1,000</span><span>$50,000</span></div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">{t('credit.term')}</span>
                <span className="text-sm font-bold text-lumen-black dark:text-white">{term} mo</span>
              </div>
              <input type="range" min="3" max="60" step="3" value={term} onChange={e => setTerm(parseInt(e.target.value))} className="w-full accent-lumen-black dark:accent-white" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>3 mo</span><span>60 mo</span></div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-5 space-y-3">
          <div className="flex justify-between"><span className="text-sm text-gray-500">{t('credit.interestRate')}</span><span className="text-sm font-bold text-lumen-black dark:text-white">{rate}%</span></div>
          <div className="flex justify-between"><span className="text-sm text-gray-500">{t('credit.monthlyPayment')}</span><span className="text-lg font-bold text-lumen-black dark:text-white">${monthly.toFixed(2)}</span></div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
            <span className="text-sm font-semibold text-gray-500">{t('credit.totalPayment')}</span>
            <span className="text-sm font-bold text-lumen-black dark:text-white">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Application Form */}
        {creditStatus === 'none' && (
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-lumen-black dark:text-white uppercase tracking-widest">Application Details</h3>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Employment Type</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[['employed', 'Employed'], ['self', 'Self-Empl.'], ['other', 'Other']].map(([val, lbl]) => (
                  <button key={val} onClick={() => setEmployment(val)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${employment === val ? 'bg-lumen-black dark:bg-white text-white dark:text-black border-transparent' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Monthly Income</label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">$</span>
                <input type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="0.00"
                  className="w-full p-4 pl-9 bg-white dark:bg-[#2C2C2E] rounded-2xl text-lg font-bold text-lumen-black dark:text-white outline-none border-2 border-transparent focus:border-blue-500/30" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loan Purpose</label>
              <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g. Home renovation, education..."
                className="w-full mt-2 p-4 bg-white dark:bg-[#2C2C2E] rounded-2xl text-sm font-bold text-lumen-black dark:text-white outline-none border-2 border-transparent focus:border-blue-500/30" />
            </div>
          </div>
        )}

        {creditStatus === 'none' && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleApply}
            disabled={!income || !purpose}
            className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold disabled:opacity-30">
            {t('credit.apply')}
          </motion.button>
        )}
      </div>
    </div>
  );
}
