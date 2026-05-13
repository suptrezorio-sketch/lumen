import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';

const CATS = ['all','income','housing','utilities','crypto','food','coffee','transport','phone'];

export default function History({ onNavigate }) {
  const { t, transactions } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = transactions.filter(tx => {
    if (filter !== 'all' && tx.category !== filter) return false;
    if (search && !tx.title.toLowerCase().includes(search.toLowerCase()) && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (selected) {
    const tx = selected;
    return (
      <div className="h-full bg-white dark:bg-black">
        <div className="sticky top-0 bg-white/90 dark:bg-black/90 border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
          <div className="flex items-center justify-between">
            <button onClick={() => onNavigate('/')}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
            <h2 className="text-base font-bold text-lumen-black dark:text-white">{t('history.details')}</h2>
            <div className="w-6" />
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-center py-4">
            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 ${tx.type === 'incoming' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {tx.type === 'incoming' ? <Icons.TrendingUp size={28} /> : <Icons.TrendingDown size={28} />}
            </div>
            <h3 className="text-xl font-bold text-lumen-black dark:text-white">{tx.type === 'incoming' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString()}</h3>
            <p className="text-sm text-gray-500 mt-1">{tx.title}</p>
          </div>
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4 space-y-3">
            <div className="flex justify-between"><span className="text-xs text-gray-500">{t('history.txId')}</span><span className="text-xs font-mono font-bold text-lumen-black dark:text-white">{tx.id}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500">{t('history.date')}</span><span className="text-xs text-lumen-black dark:text-white">{new Date(tx.date).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500">{t('history.category')}</span><span className="text-xs text-lumen-black dark:text-white capitalize">{tx.category}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500">{t('history.fee')}</span><span className="text-xs text-lumen-black dark:text-white">${(tx.fee || 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500">{t('history.status')}</span>
              <span className={`text-xs font-bold ${tx.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                {tx.status === 'completed' ? t('history.completed') : t('history.pending')}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-28">
      <div className="sticky top-0 bg-white/90 dark:bg-black/90 border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
        <h2 className="text-lg font-bold text-lumen-black dark:text-white text-center mb-3">{t('history.title')}</h2>
        <div className="relative">
          <Icons.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('history.search')}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-[#1C1C1E] rounded-xl text-sm text-lumen-black dark:text-white border-0 outline-none placeholder-gray-400" />
        </div>
      </div>

      <div className="px-5 pt-3 pb-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATS.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filter === cat ? 'bg-lumen-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-[#1C1C1E] text-gray-600 dark:text-gray-400'}`}>
              {t(`history.${cat}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-2 pb-4">
        <AnimatePresence>
          {filtered.map((tx, i) => {
            const isIn = tx.type === 'incoming';
            return (
              <motion.div key={tx.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                onClick={() => setSelected(tx)}
                className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl cursor-pointer active:bg-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isIn ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                    {isIn ? <Icons.TrendingUp size={16} /> : <Icons.TrendingDown size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-lumen-black dark:text-white">{tx.title}</p>
                    <span className="text-[11px] text-gray-400">{new Date(tx.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <span className={`text-sm font-bold ${isIn ? 'text-green-600' : 'text-lumen-black dark:text-white'}`}>
                  {isIn ? '+' : '-'}${Math.abs(tx.amount).toLocaleString()}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">{t('history.noTransactions') || 'No transactions found'}</div>
        )}
      </div>
    </div>
  );
}
