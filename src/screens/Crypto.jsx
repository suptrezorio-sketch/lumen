import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useFiatBalance } from '../hooks/useDisplayBalance';
import { Icons } from '../assets/Icons';

export default function Crypto({ onNavigate, showToast }) {
  const { t, cryptoAssets, user, buyCrypto, swapCrypto, updateUser, addTransaction } = useApp();
  const fiatBalance = useFiatBalance();
  const [view, setView] = useState('list');
  const [prices, setPrices] = useState(cryptoAssets.map(a => a.price));
  const [buyAsset, setBuyAsset] = useState(null);
  const [buyAmount, setBuyAmount] = useState('');
  const [swapFrom, setSwapFrom] = useState(0);
  const [swapTo, setSwapTo] = useState(1);
  const [swapAmount, setSwapAmount] = useState('');

  // Generate stable sparkline data per asset
  const [sparkData] = useState(() =>
    cryptoAssets.map(() => Array.from({ length: 20 }, (_, i) => 30 + Math.sin(i * 0.7) * 20 + Math.random() * 15))
  );

  if (view === 'buy' && buyAsset !== null) {
    const asset = cryptoAssets[buyAsset];
    const price = prices[buyAsset];
    const amt = parseFloat(buyAmount) || 0;
    const youGet = amt > 0 ? (amt / price).toFixed(8) : '0.00000000';

    const handleBuy = () => {
      if (amt <= 0) return;
      const ok = buyCrypto(asset.symbol, amt);
      if (!ok) {
        showToast('Insufficient funds');
        return;
      }
      showToast(`Bought ${youGet} ${asset.symbol}`);
      setView('list');
      setBuyAmount('');
    };

    return (
      <div className="h-full flex flex-col bg-white dark:bg-black">
        <div className="sticky top-0 bg-white/90 dark:bg-black/90 border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
          <div className="flex items-center justify-between">
            <button onClick={() => setView('list')}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
            <h2 className="text-base font-bold text-lumen-black dark:text-white">{t('crypto.buy')}</h2>
            <div className="w-6" />
          </div>
        </div>
        <div className="flex-1 p-5 space-y-5">
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-5 text-center">
            <span className="text-4xl">{asset.icon}</span>
            <h3 className="text-lg font-bold text-lumen-black dark:text-white mt-2">{asset.name}</h3>
            <p className="text-sm text-gray-500">${price.toLocaleString()}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('crypto.amount')} (USD)</label>
            <input type="number" value={buyAmount} onChange={e => setBuyAmount(e.target.value)} placeholder="0.00"
              className="w-full mt-1 p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl text-lg font-bold text-lumen-black dark:text-white border-0 outline-none" />
            <p className="text-xs text-gray-500 mt-2 text-right">Balance: ${fiatBalance.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-xl p-4 flex justify-between">
            <span className="text-sm text-gray-500">{t('crypto.youGet')}</span>
            <span className="text-sm font-bold text-lumen-black dark:text-white">{youGet} {asset.symbol}</span>
          </div>
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={handleBuy}
            disabled={amt <= 0}
            className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold disabled:opacity-30">
            {t('crypto.confirm')}
          </motion.button>
        </div>
      </div>
    );
  }

  if (view === 'swap') {
    const fromAsset = cryptoAssets[swapFrom];
    const toAsset = cryptoAssets[swapTo];
    const amt = parseFloat(swapAmount) || 0;
    const rate = prices[swapFrom] / prices[swapTo];
    const youGet = (amt * rate).toFixed(6);

    return (
      <div className="h-full flex flex-col bg-white dark:bg-black">
        <div className="sticky top-0 bg-white/90 dark:bg-black/90 border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
          <div className="flex items-center justify-between">
            <button onClick={() => setView('list')}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
            <h2 className="text-base font-bold text-lumen-black dark:text-white">{t('crypto.swap')}</h2>
            <div className="w-6" />
          </div>
        </div>
        <div className="flex-1 p-5 space-y-4">
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4">
            <span className="text-xs text-gray-500 font-semibold">{t('crypto.from')}</span>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{fromAsset.icon}</span>
                <span className="font-bold text-lumen-black dark:text-white">{fromAsset.symbol}</span>
              </div>
              <input type="number" value={swapAmount} onChange={e => setSwapAmount(e.target.value)} placeholder="0.00"
                className="text-right text-lg font-bold bg-transparent outline-none w-32 text-lumen-black dark:text-white" />
            </div>
          </div>

          <div className="flex justify-center">
            <motion.button whileTap={{ rotate: 180 }} onClick={() => { setSwapFrom(swapTo); setSwapTo(swapFrom); }}
              className="w-10 h-10 bg-lumen-black dark:bg-white rounded-full flex items-center justify-center">
              <Icons.ArrowUpDown size={18} className="text-white dark:text-black" />
            </motion.button>
          </div>

          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4">
            <span className="text-xs text-gray-500 font-semibold">{t('crypto.to')}</span>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{toAsset.icon}</span>
                <span className="font-bold text-lumen-black dark:text-white">{toAsset.symbol}</span>
              </div>
              <span className="text-lg font-bold text-lumen-black dark:text-white">{youGet}</span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-xl p-3 text-center">
            <span className="text-xs text-gray-500">1 {fromAsset.symbol} = {rate.toFixed(6)} {toAsset.symbol}</span>
          </div>

          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => {
              const ok = swapCrypto(fromAsset.symbol, toAsset.symbol, amt);
              if (!ok) { showToast('Insufficient holdings'); return; }
              showToast(`Swapped ${swapAmount} ${fromAsset.symbol} → ${youGet} ${toAsset.symbol}`);
              setView('list'); setSwapAmount('');
            }}
            disabled={amt <= 0}
            className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold disabled:opacity-30">
           {t('crypto.confirm')}
          </motion.button>
        </div>
      </div>
    );
  }

  // Simulate price ticks
  useEffect(() => {
    const iv = setInterval(() => {
      setPrices(prev => prev.map((p) => {
        const change = (Math.random() - 0.5) * p * 0.002;
        return Math.max(0.01, +(p + change).toFixed(2));
      }));
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const totalValue = cryptoAssets.reduce((sum, a, i) => sum + a.holdings * prices[i], 0);

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-28">
      <div className="sticky top-0 bg-white/90 dark:bg-black/90 border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
        <h2 className="text-lg font-bold text-lumen-black dark:text-white text-center">{t('crypto.title')}</h2>
      </div>

      <div className="px-5 mt-5 mb-5">
        <div className="bg-[#111] dark:bg-[#1C1C1E] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold mb-1">{t('crypto.portfolio')}</p>
              <h2 className="text-3xl font-bold tracking-tight">${totalValue.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            </div>
          </div>
          {/* Monochrome Chart */}
          <div className="h-16 w-full flex items-end gap-1.5 opacity-90 relative z-10">
            {[20, 35, 25, 50, 40, 70, 55, 85, 65, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-white/10 rounded-t-sm relative group transition-all hover:bg-white/30" style={{ height: `${h}%` }}>
                <div className="absolute top-0 left-0 w-full bg-white rounded-t-sm" style={{ height: '3px' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 mb-5 grid grid-cols-3 gap-3">
        {[{ label: t('crypto.buy'), action: () => { setBuyAsset(0); setView('buy'); } },
          { label: t('crypto.sell') || 'Sell', action: () => {
            const sym = window.prompt('Which asset to sell? (BTC/ETH/SOL/USDT)');
            if (!sym) return;
            const key = sym.toUpperCase();
            const idx = cryptoAssets.findIndex(a => a.symbol === key);
            if (idx === -1) { showToast('Unknown asset'); return; }
            const qty = window.prompt(`How many ${key} to sell?`, '0.01');
            const q = parseFloat(qty);
            if (!q || q <= 0) return;
            const proceeds = q * prices[idx];
            const lk = key.toLowerCase();
            if ((user[lk] || 0) < q) { showToast('Insufficient holdings'); return; }
            updateUser({ balance: (user.balance || 0) + proceeds, [lk]: (user[lk] || 0) - q });
            addTransaction({ type: 'incoming', title: `Sell ${key}`, description: `Sold ${q} ${key}`, amount: proceeds, status: 'completed', category: 'crypto' });
            showToast(`Sold ${q} ${key} for $${proceeds.toFixed(2)}`);
          }},
          { label: t('crypto.swap'), action: () => setView('swap') }
        ].map((a, i) => (
          <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={a.action}
            className="py-3 bg-lumen-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold">{a.label}</motion.button>
        ))}
      </div>

      <div className="px-5">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t('crypto.assets')}</h3>
        <div className="space-y-2">
          {cryptoAssets.map((asset, i) => {
            const price = prices[i];
            const value = asset.holdings * price;
            const changePercent = ((price - asset.price) / asset.price * 100).toFixed(2);
            const isUp = parseFloat(changePercent) >= 0;
            return (
              <motion.div key={asset.symbol} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                onClick={() => { setBuyAsset(i); setView('buy'); }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white dark:bg-[#2C2C2E] rounded-xl flex items-center justify-center text-xl">{asset.icon}</div>
                  <div>
                    <p className="text-sm font-bold text-lumen-black dark:text-white">{asset.name}</p>
                    <span className="text-xs text-gray-400">{asset.holdings} {asset.symbol}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-lumen-black dark:text-white">${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <span className={`text-xs font-semibold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                    {isUp ? '+' : ''}{changePercent}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
