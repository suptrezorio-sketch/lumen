import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import useOrchestratorStore from '../store/orchestratorStore';
import { Icons } from '../assets/Icons';

export default function Home({ onNavigate, showToast }) {
  const { t, user, cards, transactions, cryptoAssets } = useApp();
  const orchestratorBalance = useOrchestratorStore(s => s.balance);
  const fiatBalance = orchestratorBalance !== null ? orchestratorBalance : user?.balance ?? 0;
  
  const cryptoBalance = cards
    .filter(c => c.type === 'crypto')
    .reduce((sum, card) => {
      const asset = cryptoAssets?.find(a => a.symbol === card.currency);
      const price = asset ? asset.price : 65000;
      return sum + (Number(card.balance) * price);
    }, 0);
    
  const displayBalance = fiatBalance + cryptoBalance;
  
  const [bannerIdx, setBannerIdx] = useState(0);
  const [dynamicBanners, setDynamicBanners] = useState([]);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
    fetch(`${backendUrl}/api/banners`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setDynamicBanners(data);
      })
      .catch(console.error);
  }, []);

  const staticBanners = [
    { title: t('home.investorFund'), sub: t('home.investorFundDesc'), bg: 'linear-gradient(135deg,#F0F0F5,#E8E8F0)', icon: <Icons.Shield size={22} className="text-lumen-black" /> },
    { title: t('home.homeInsurance'), sub: t('home.homeInsuranceDesc'), bg: 'linear-gradient(135deg,#FFF5F5,#FFE8E8)', icon: <Icons.Shield size={22} className="text-lumen-black" /> },
    { title: t('home.creditLine'), sub: t('home.creditLineDesc'), bg: 'linear-gradient(135deg,#F5F0FF,#E8E0F0)', icon: <Icons.Percent size={22} className="text-lumen-black" /> },
  ];

  const displayBanners = dynamicBanners.length > 0 ? dynamicBanners : staticBanners;

  useEffect(() => {
    if (displayBanners.length === 0) return;
    const t = setInterval(() => setBannerIdx(p => (p + 1) % displayBanners.length), 5000);
    return () => clearInterval(t);
  }, [displayBanners.length]);

  const quickActions = [
    { icon: Icons.Send, label: 'Send', screen: '/transfers' },
    { icon: Icons.Plus, label: 'Top Up', screen: '/topup' },
    { icon: Icons.Minus, label: 'Withdraw', screen: '/withdraw' },
    { icon: Icons.FileText, label: 'Utilities', screen: '/utilities' },
    { icon: Icons.Percent, label: 'Credit', screen: '/credit' },
  ];

  const fiatCard = cards.find(c => c.type === 'fiat');

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-28">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30 safe-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="https://img.icons8.com/?size=100&id=80t6WVLmSeOM&format=png&color=000000" width="22" className="dark:invert" alt="Logo" />
            <span className="text-lg font-bold tracking-tight text-lumen-black dark:text-white">LUMEN</span>
          </div>
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => onNavigate('/chat')}
              className="w-9 h-9 bg-lumen-black dark:bg-white/10 text-white rounded-xl flex items-center justify-center">
              <Icons.Chat size={16} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => onNavigate('/profile')}
              className="w-9 h-9 bg-lumen-black dark:bg-white/10 text-white rounded-xl flex items-center justify-center">
              <Icons.Bell size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="px-5 pt-5 pb-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('home.totalBalance')}</p>
        <h1 className="text-4xl font-bold text-lumen-black dark:text-white mt-1">
          ${displayBalance.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
            <Icons.TrendingUp size={11} className="mr-1" /> +2.4%
          </span>
          <span className="text-xs text-gray-500 font-medium">BTC: {(user?.btc || 0).toFixed(4)}</span>
        </div>
      </div>

      {/* Card Carousel */}
      <div className="mb-5 mt-2">
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x snap-mandatory px-5">
          {cards.map(card => (
            <motion.div key={card.id} whileTap={{ scale: 0.97 }} onClick={() => onNavigate('/cards')}
              className="min-w-[270px] h-[160px] rounded-2xl relative overflow-hidden snap-center cursor-pointer shadow-lg flex-shrink-0"
              style={{ background: card.type === 'smart' ? 'linear-gradient(135deg,#F0F0F5,#E8E8F0)' : 'linear-gradient(135deg,#1C1C1E,#2C2C2E)' }}>
              <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {card.type === 'smart' ? t('cards.smartContract') : t('cards.debitCard')}
                    </span>
                    <h3 className={`text-base font-bold mt-0.5 ${card.type === 'smart' ? 'text-lumen-black' : 'text-white'}`}>{card.name}</h3>
                  </div>
                  {card.type === 'crypto' ? <Icons.Bitcoin size={18} className="text-white/60" /> :
                   card.type === 'smart' ? <Icons.Code size={18} className="text-lumen-black/60" /> :
                   <Icons.CreditCard size={18} className="text-white/60" />}
                </div>
                <div>
                  <span className={`text-xs font-mono tracking-wider ${card.type === 'smart' ? 'text-lumen-black/60' : 'text-white/60'}`}>{card.number}</span>
                  <div className="flex justify-between items-end mt-1.5">
                    <div>
                      <span className={`text-[9px] ${card.type === 'smart' ? 'text-lumen-black/40' : 'text-white/40'}`}>{t('cards.balance')}</span>
                      <p className={`text-lg font-bold ${card.type === 'smart' ? 'text-lumen-black' : 'text-white'}`}>
                        {card.type === 'crypto' ? `${card.balance} ${card.currency}` :
                         card.type === 'smart' ? `${card.blocksCompleted}/${card.totalBlocks}` :
                         `$${card.balance.toLocaleString()}`}
                      </p>
                    </div>
                    <span className={`text-[10px] font-medium ${card.type === 'smart' ? 'text-lumen-black/50' : 'text-white/50'}`}>{card.expiry}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-5 gap-2">
          {quickActions.map((a, i) => (
            <motion.button key={i} whileTap={{ scale: 0.92 }} onClick={() => onNavigate(a.screen)}
              className="flex flex-col items-center gap-1.5 p-2.5 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl">
              <div className="w-10 h-10 bg-lumen-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center">
                <a.icon size={17} />
              </div>
              <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{a.label}</span>
            </motion.button>
          ))}
        </div>
      </div>


      {/* Ad Banner */}
      <div className="px-5 mb-5">
        <AnimatePresence mode="wait">
          {displayBanners.length > 0 && displayBanners[bannerIdx] && (
            <motion.div key={bannerIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              onClick={() => {
                const b = displayBanners[bannerIdx];
                if (b.linkType === 'url' && b.linkValue) window.open(b.linkValue, '_blank');
                if (b.linkType === 'event' && b.linkValue) onNavigate(b.linkValue);
              }}
              className="p-4 rounded-2xl cursor-pointer relative overflow-hidden" 
              style={{ background: displayBanners[bannerIdx].bg || '#000' }}>
              
              {displayBanners[bannerIdx].imageUrl ? (
                <img src={displayBanners[bannerIdx].imageUrl} alt="banner" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-11 h-11 bg-white/80 rounded-xl flex items-center justify-center">{displayBanners[bannerIdx].icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lumen-black text-sm">{displayBanners[bannerIdx].title}</h4>
                    <p className="text-[11px] text-lumen-black/60 mt-0.5">{displayBanners[bannerIdx].sub}</p>
                  </div>
                  <Icons.ChevronRight size={18} className="text-lumen-black/30" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex justify-center gap-1 mt-2">
          {displayBanners.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === bannerIdx ? 'bg-lumen-black dark:bg-white w-4' : 'bg-gray-300'}`} />)}
        </div>
      </div>



      {/* Transactions */}
      <div className="px-5 mb-8">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-lumen-black dark:text-white">{t('home.recentTransactions')}</h3>
          <button onClick={() => onNavigate('/history')} className="text-xs font-semibold text-blue-500">{t('home.seeAll')}</button>
        </div>
        <div className="space-y-2">
          {transactions.slice(0, 5).map((tx, i) => {
            const isIn = tx.type === 'incoming';
            return (
              <motion.div key={tx.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isIn ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                    {isIn ? <Icons.TrendingUp size={16} /> : <Icons.TrendingDown size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-lumen-black dark:text-white">{tx.title}</p>
                    <span className="text-[11px] text-gray-400">{tx.description}</span>
                  </div>
                </div>
                <span className={`text-sm font-bold ${isIn ? 'text-green-600' : 'text-lumen-black dark:text-white'}`}>
                  {isIn ? '+' : '-'}${Math.abs(tx.amount).toLocaleString()}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}