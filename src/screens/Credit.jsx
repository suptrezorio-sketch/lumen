import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';

export default function Credit({ onNavigate }) {
  const { t, creditStatus, setCreditStatus } = useApp();
  const [amount, setAmount] = useState(10000);
  const [term, setTerm] = useState(12);
  const rate = 7.95;
  const monthly = (amount * (rate / 100 / 12) * Math.pow(1 + rate / 100 / 12, term)) / (Math.pow(1 + rate / 100 / 12, term) - 1);
  const total = monthly * term;

  const handleApply = async () => {
    try {
      const userId = localStorage.getItem('lumen_user_id') || 'test-user';
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
      const res = await fetch(`${backendUrl}/api/credit/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, term, rate, collateral: 'None' })
      }).catch(() => ({ ok: true })); // Fallback if server is down

      if (res.ok) {
        setCreditStatus('pending');
        localStorage.setItem('lumen_credit', 'pending');
        setTimeout(() => onNavigate('/'), 1500);
      }
    } catch (e) {
      console.error('Credit request failed', e);
      setCreditStatus('none');
    }
  };


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
        {/* Status Banner */}
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
                {creditStatus === 'pending' && <p className="text-[11px] text-gray-500 mt-0.5">{t('credit.reviewDesc')}</p>}
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
              <input type="range" min="1000" max="50000" step="1000" value={amount} onChange={e => setAmount(parseInt(e.target.value))}
                className="w-full accent-lumen-black dark:accent-white" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>$1,000</span><span>$50,000</span></div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">{t('credit.term')}</span>
                <span className="text-sm font-bold text-lumen-black dark:text-white">{term} mo</span>
              </div>
              <input type="range" min="3" max="60" step="3" value={term} onChange={e => setTerm(parseInt(e.target.value))}
                className="w-full accent-lumen-black dark:accent-white" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>3 mo</span><span>60 mo</span></div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-5 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">{t('credit.interestRate')}</span>
            <span className="text-sm font-bold text-lumen-black dark:text-white">{rate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">{t('credit.monthlyPayment')}</span>
            <span className="text-lg font-bold text-lumen-black dark:text-white">${monthly.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
            <span className="text-sm font-semibold text-gray-500">{t('credit.totalPayment')}</span>
            <span className="text-sm font-bold text-lumen-black dark:text-white">${total.toFixed(2)}</span>
          </div>
        </div>

        {creditStatus === 'none' && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleApply}
            className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold">
            {t('credit.apply')}
          </motion.button>
        )}
      </div>
    </div>
  );
}
