import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';
import { usePbClient } from '../hooks/usePbClient';
import LumenLogo from '../components/LumenLogo';
import pb from '../lib/pb';

const OP_TYPE_LABEL = {
  TOP_UP: 'Top Up', WITHDRAW: 'Withdrawal', CARD_TRANSFER: 'Card Transfer',
  IBAN_TRANSFER: 'IBAN Transfer', CRYPTO_BUY: 'Crypto Buy', CRYPTO_SELL: 'Crypto Sell',
  CRYPTO_SWAP: 'Crypto Swap', CRYPTO_TRANSFER: 'Crypto Transfer',
  INTERNAL_TRANSFER: 'Internal Transfer',
};
const STATUS_DOT = { Pending: 'bg-yellow-400', Processing: 'bg-blue-400', Approved: 'bg-green-500', Rejected: 'bg-red-500', Completed: 'bg-green-600' };

const FALLBACK_BANNERS = [
  { title_en: 'Investor Fund', subtitle_en: 'Grow your portfolio', bg_color: '#F0F0F5' },
  { title_en: 'Home Insurance', subtitle_en: 'Protect what matters', bg_color: '#FFF5F5' },
  { title_en: 'Credit Line', subtitle_en: 'Flexible financing', bg_color: '#F5F0FF' },
];

export default function Home({ onNavigate, showToast }) {
  const { t, user, cards: localCards, transactions: localTxs } = useApp();
  const { fiatBalance, fiatCurrency, fiatPending, cards: pbCards, operations, cryptoAccounts, hasPbClient } = usePbClient();

  const [bannerIdx, setBannerIdx] = useState(0);
  const [pbBanners, setPbBanners] = useState([]);

  // Fetch promo banners from PB
  useEffect(() => {
    pb.collection('promo_banners').getList(1, 10, { filter: 'active = true', sort: 'sort_order' })
      .then(r => { if (r.items.length) setPbBanners(r.items); })
      .catch(() => {});
  }, []);

  const banners = pbBanners.length > 0 ? pbBanners : FALLBACK_BANNERS;

  useEffect(() => {
    if (banners.length <= 1) return;
    const iv = setInterval(() => setBannerIdx(p => (p + 1) % banners.length), 5000);
    return () => clearInterval(iv);
  }, [banners.length]);

  // Always prefer PB data; show zeroes when no PB client (not fake defaults)
  const displayBalance = fiatBalance;
  const displayCurrency = fiatCurrency || 'USD';
  const displayCards = pbCards; // only real cards from PB
  const displayTxs = operations;

  const quickActions = [
    { icon: Icons.Send, label: 'Send', screen: '/transfers' },
    { icon: Icons.Plus, label: 'Top Up', screen: '/topup' },
    { icon: Icons.Minus, label: 'Withdraw', screen: '/withdraw' },
    { icon: Icons.FileText, label: 'Utilities', screen: '/utilities' },
    { icon: Icons.Percent, label: 'Credit', screen: '/credit' },
  ];

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-28">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30 safe-top">
        <div className="flex items-center justify-between">
          <LumenLogo size={26} />
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => onNavigate('/chat')}
              className="w-9 h-9 bg-lumen-black dark:bg-white/10 text-white rounded-xl flex items-center justify-center">
              <Icons.Chat size={16} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => onNavigate('/notifications')}
              className="w-9 h-9 bg-lumen-black dark:bg-white/10 text-white rounded-xl flex items-center justify-center relative">
              <Icons.Bell size={16} />
              {operations.filter(o => o.status === 'Pending').length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="px-5 pt-5 pb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('home.totalBalance')}</p>
        <h1 className="text-4xl font-bold text-lumen-black dark:text-white mt-1">
          {displayCurrency} {displayBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </h1>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {fiatPending > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold">
              {fiatPending.toFixed(2)} pending
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
            Active
          </span>
        </div>
      </div>

      {/* Crypto balances */}
      {cryptoAccounts.length > 0 && (
        <div className="px-5 mb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {cryptoAccounts.map(acc => (
              <div key={acc.id} onClick={() => onNavigate('/crypto')}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl cursor-pointer flex-shrink-0">
                <span className="text-sm font-bold text-lumen-black dark:text-white">{acc.asset}</span>
                <span className="text-xs text-gray-500">{Number(acc.available_balance || 0).toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card Carousel */}
      <div className="mb-5 mt-2">
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x snap-mandatory px-5">
          {displayCards.map(card => {
            const cardName = card.label || card.name || 'LUMEN Card';
            const cardNum  = (card.number_last4 && card.number_last4 !== '0000') ? `•••• ${card.number_last4}` : (card.number ? `•••• ${card.number.slice(-4)}` : '•••• ••••');
            const cardBal  = card.available_balance ?? card.balance ?? 0;
            const isSmart  = card.type === 'smart' || card.type === 'contract';
            const isCrypto = card.type === 'crypto';
            const isFrozen = card.status === 'frozen' || card.blocked;
            return (
              <motion.div key={card.id} whileTap={{ scale: 0.97 }} onClick={() => onNavigate('/cards')}
                className="min-w-[270px] h-[160px] rounded-2xl relative overflow-hidden snap-center cursor-pointer shadow-lg flex-shrink-0"
                style={{ background: isSmart ? 'linear-gradient(135deg,#F0F0F5,#E8E8F0)' : 'linear-gradient(135deg,#1C1C1E,#2C2C2E)', opacity: isFrozen ? 0.7 : 1 }}>
                <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        {isSmart ? t('cards.smartContract') : isCrypto ? 'Crypto' : t('cards.debitCard')}
                        {isFrozen && ' · FROZEN'}
                      </span>
                      <h3 className={`text-base font-bold mt-0.5 ${isSmart ? 'text-lumen-black' : 'text-white'}`}>{cardName}</h3>
                    </div>
                    {isCrypto ? <Icons.Bitcoin size={18} className="text-white/60" /> :
                     isSmart  ? <Icons.Code size={18} className="text-lumen-black/60" /> :
                                <Icons.CreditCard size={18} className="text-white/60" />}
                  </div>
                  <div>
                    <span className={`text-xs font-mono tracking-wider ${isSmart ? 'text-lumen-black/60' : 'text-white/60'}`}>{cardNum}</span>
                    <div className="flex justify-between items-end mt-1.5">
                      <div>
                        <span className={`text-[9px] ${isSmart ? 'text-lumen-black/40' : 'text-white/40'}`}>{t('cards.balance')}</span>
                        <p className={`text-lg font-bold ${isSmart ? 'text-lumen-black' : 'text-white'}`}>
                          {isCrypto ? `${cardBal} ${card.currency || card.asset || ''}` :
                           isSmart  ? `${card.blocksCompleted ?? 0}/${card.totalBlocks ?? 0}` :
                                      `${displayCurrency} ${Number(cardBal).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                        </p>
                      </div>
                      <span className={`text-[10px] font-medium ${isSmart ? 'text-lumen-black/50' : 'text-white/50'}`}>{card.expiry || ''}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
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

      {/* Promo Banners — below quick actions */}
      <div className="px-5 mb-4">
        <AnimatePresence mode="wait">
          {(() => {
            const b = banners[bannerIdx];
            const bg = b.bg_color || b.bg || '#F0F0F5';
            const title = b.title_en || b.title || '';
            const sub = b.subtitle_en || b.sub || '';
            return (
              <motion.div key={bannerIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onClick={() => b.target_url ? window.open(b.target_url, '_blank') : null}
                className="p-4 rounded-2xl cursor-pointer" style={{ background: bg }}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/80 rounded-xl flex items-center justify-center">
                    <Icons.Shield size={20} className="text-lumen-black" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lumen-black text-sm">{title}</h4>
                    <p className="text-[11px] text-lumen-black/60 mt-0.5">{sub}</p>
                  </div>
                  <Icons.ChevronRight size={18} className="text-lumen-black/30" />
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
        <div className="flex justify-center gap-1 mt-2">
          {banners.map((_, i) => (
            <div key={i} onClick={() => setBannerIdx(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${i === bannerIdx ? 'bg-lumen-black dark:bg-white w-4' : 'w-1.5 bg-gray-300'}`} />
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="px-5 mb-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-lumen-black dark:text-white">{t('home.recentTransactions')}</h3>
          <button onClick={() => onNavigate('/history')} className="text-xs font-semibold text-blue-500">{t('home.seeAll')}</button>
        </div>
        <div className="space-y-2">
          {displayTxs.slice(0, 5).map((tx, i) => {
            // Support both PB operations and local transactions
            const isPbOp = !!tx.type && !tx.title;
            const label  = isPbOp ? (OP_TYPE_LABEL[tx.type] || tx.type?.replace(/_/g, ' ')) : (tx.title || tx.type);
            const sub    = isPbOp ? (tx.status || 'Pending') : (tx.description || '');
            const amt    = tx.amount || 0;
            const isIn   = tx.direction === 'credit' || tx.type === 'incoming' || tx.type === 'TOP_UP';
            const dotCls = STATUS_DOT[tx.status] || 'bg-gray-300';
            return (
              <motion.div key={tx.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => onNavigate('/history')}
                className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isIn ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-gray-100 dark:bg-[#2C2C2E] text-gray-500'}`}>
                    {isIn ? <Icons.TrendingUp size={16} /> : <Icons.TrendingDown size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-lumen-black dark:text-white">{label}</p>
                    <div className="flex items-center gap-1.5">
                      {isPbOp && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotCls}`} />}
                      <span className="text-[11px] text-gray-400">{sub}</span>
                    </div>
                  </div>
                </div>
                <span className={`text-sm font-bold ${isIn ? 'text-green-600' : 'text-lumen-black dark:text-white'}`}>
                  {isIn ? '+' : '−'}{tx.currency || '$'} {Math.abs(amt).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </motion.div>
            );
          })}
          {displayTxs.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-sm">No transactions yet</div>
          )}
        </div>
      </div>

    </div>
  );
}