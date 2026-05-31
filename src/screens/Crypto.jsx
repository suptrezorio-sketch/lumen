import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';
import { usePbClient } from '../hooks/usePbClient';

// Decorative sparkline SVG chart
function Sparkline({ points, isUp, width = 120, height = 40 }) {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const xs = points.map((_, i) => (i / (points.length - 1)) * width);
  const ys = points.map(p => height - ((p - min) / range) * height);
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const fill = `${d} L${width},${height} L0,${height} Z`;
  const color = isUp ? '#22c55e' : '#ef4444';
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <path d={fill} fill={color} opacity="0.12" />
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ASSET_META = {
  BTC:  { icon: '₿', name: 'Bitcoin',  price: 67400, stable: false },
  ETH:  { icon: 'Ξ', name: 'Ethereum', price: 3520,  stable: false },
  USDT: { icon: '₮', name: 'Tether',   price: 1.00,  stable: true  },
  USDC: { icon: '$', name: 'USD Coin', price: 1.00,  stable: true  },
  BNB:  { icon: 'B', name: 'BNB',      price: 590,   stable: false },
  SOL:  { icon: '◎', name: 'Solana',   price: 172,   stable: false },
};

function generateSparkline(basePrice, n = 30) {
  const pts = [basePrice];
  for (let i = 1; i < n; i++) {
    const prev = pts[i - 1];
    pts.push(Math.max(0.01, prev + (Math.random() - 0.48) * prev * 0.015));
  }
  return pts;
}

export default function Crypto({ onNavigate, showToast }) {
  const { t, cryptoAssets: localAssets } = useApp();
  const { cryptoAccounts, operations, hasPbClient, submitOperation } = usePbClient();

  const [view, setView] = useState('list'); // 'list' | 'buy' | 'sell' | 'swap'
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [amount, setAmount] = useState('');
  const [swapFrom, setSwapFrom] = useState(0);
  const [swapTo, setSwapTo] = useState(1);
  const [swapFromSym, setSwapFromSym] = useState('BTC');
  const [swapToSym, setSwapToSym] = useState('ETH');
  const [submitting, setSubmitting] = useState(false);
  const [buySymbol, setBuySymbol] = useState('BTC'); // asset selected in buy flow

  // Full catalog for buy — all known assets
  const ALL_ASSETS = Object.entries(ASSET_META).map(([sym, meta]) => ({ symbol: sym, ...meta }));

  // Build display assets: prefer PB crypto_wallets, empty for new clients (no demo fallback)
  const assets = cryptoAccounts.length > 0
    ? cryptoAccounts.map(w => ({
        id: w.id,
        symbol: w.asset || 'BTC',
        name: ASSET_META[w.asset]?.name || w.asset,
        icon: ASSET_META[w.asset]?.icon || '◈',
        holdings: w.available_balance || 0,
        price: ASSET_META[w.asset]?.price || 0,
        status: w.status,
      }))
    : [];

  // Live price simulation — stablecoins stay at 1.00
  const [prices, setPrices] = useState(() => assets.map(a => a.price || 1));
  const [sparklines, setSparklines] = useState(() => assets.map(a =>
    ASSET_META[a.symbol]?.stable ? Array(30).fill(1) : generateSparkline(a.price || 1)
  ));

  // Re-init when assets list changes (PB loaded)
  useEffect(() => {
    setPrices(assets.map(a => a.price || 1));
    setSparklines(assets.map(a =>
      ASSET_META[a.symbol]?.stable ? Array(30).fill(1) : generateSparkline(a.price || 1)
    ));
  }, [assets.length]);

  useEffect(() => {
    const iv = setInterval(() => {
      setPrices(prev => prev.map((p, i) => {
        if (ASSET_META[assets[i]?.symbol]?.stable) return 1.00; // stablecoins locked
        const next = Math.max(0.01, p + (Math.random() - 0.49) * p * 0.002);
        setSparklines(sp => sp.map((s, si) => si === i ? [...s.slice(-29), next] : s));
        return +next.toFixed(2);
      }));
    }, 3000);
    return () => clearInterval(iv);
  }, [assets.length]);

  // totalValue = sum of (holdings × current price)
  const totalValue = assets.reduce((s, a, i) => s + (parseFloat(a.holdings) || 0) * (prices[i] || 0), 0);
  const pendingCryptoOps = operations.filter(o =>
    ['CRYPTO_BUY','CRYPTO_SELL','CRYPTO_SWAP','CRYPTO_TRANSFER'].includes(o.type) &&
    ['Pending','Processing','Under Review'].includes(o.status)
  );

  // ── Operation submit ──────────────────────────────────────────
  const handleOp = async (opType, data) => {
    setSubmitting(true);
    try {
      await submitOperation(opType, { ...data });
      showToast('Request submitted — Pending review');
    } catch { showToast('Error submitting'); }
    setSubmitting(false);
    setView('list');
    setAmount('');
  };

  const selected = assets[selectedIdx] || assets[0];
  const price = prices[selectedIdx] || 1;
  const amtNum = parseFloat(amount) || 0;
  const youGet = amtNum > 0 ? (amtNum / price).toFixed(8) : '0.00000000';
  const swapRate = (ASSET_META[swapFromSym]?.price || prices[swapFrom] || 1) / (ASSET_META[swapToSym]?.price || prices[swapTo] || 1);

  // ── Buy view ──────────────────────────────────────────────────
  if (view === 'buy') {
    const buyMeta = ASSET_META[buySymbol] || ALL_ASSETS[0];
    const buyPrice = buyMeta.stable ? 1.00 : (buyMeta.price || 1);
    const buyGet = amtNum > 0 ? (amtNum / buyPrice).toFixed(8) : '0.00000000';
    return (
      <div className="h-full flex flex-col bg-white dark:bg-black">
        <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
          <div className="flex items-center justify-between">
            <button onClick={() => setView('list')}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
            <h2 className="text-base font-bold text-lumen-black dark:text-white">{t('crypto.buy')}</h2>
            <div className="w-6" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-10">
          {/* Asset selector */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Select Asset</label>
            <div className="grid grid-cols-3 gap-2">
              {ALL_ASSETS.map(a => (
                <button key={a.symbol} onClick={() => { setBuySymbol(a.symbol); setAmount(''); }}
                  className={`p-3 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all ${
                    buySymbol === a.symbol
                      ? 'border-lumen-black dark:border-white bg-lumen-black dark:bg-white'
                      : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1C1C1E]'
                  }`}>
                  <span className={`text-lg font-black ${buySymbol === a.symbol ? 'text-white dark:text-black' : 'text-lumen-black dark:text-white'}`}>{a.icon}</span>
                  <span className={`text-[10px] font-black ${buySymbol === a.symbol ? 'text-white dark:text-black' : 'text-gray-500'}`}>{a.symbol}</span>
                  <span className={`text-[9px] ${buySymbol === a.symbol ? 'text-white/70 dark:text-black/60' : 'text-gray-400'}`}>${a.stable ? '1.00' : (a.price || 0).toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Amount (USD)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
              className="w-full mt-2 p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl text-3xl font-black text-lumen-black dark:text-white border-0 outline-none" />
          </div>
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-xl p-4 flex justify-between">
            <span className="text-sm text-gray-500">You receive</span>
            <span className="text-sm font-bold text-lumen-black dark:text-white">{buyGet} {buySymbol}</span>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} disabled={amtNum <= 0 || submitting}
            onClick={() => handleOp('CRYPTO_BUY', { amount: amtNum, currency: buySymbol, details: { asset: buySymbol, price: buyPrice, expected_amount: buyGet } })}
            className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold disabled:opacity-30">
            {submitting ? 'Submitting…' : `Buy ${buySymbol}`}
          </motion.button>
        </div>
      </div>
    );
  }

  // ── Sell view ─────────────────────────────────────────────────
  if (view === 'sell' && selected) {
    const fiatGet = amtNum * price;
    return (
      <div className="h-full flex flex-col bg-white dark:bg-black">
        <div className="sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
          <div className="flex items-center justify-between">
            <button onClick={() => setView('list')}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
            <h2 className="text-base font-bold text-lumen-black dark:text-white">{t('crypto.sell')} {selected.symbol}</h2>
            <div className="w-6" />
          </div>
        </div>
        <div className="flex-1 p-5 space-y-5">
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Available</span>
            <span className="font-bold text-lumen-black dark:text-white">{selected.holdings} {selected.symbol}</span>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Amount ({selected.symbol})</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00000000"
              className="w-full mt-2 p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl text-2xl font-black text-lumen-black dark:text-white border-0 outline-none" />
          </div>
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-xl p-4 flex justify-between">
            <span className="text-sm text-gray-500">You receive</span>
            <span className="text-sm font-bold text-lumen-black dark:text-white">USD {fiatGet.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} disabled={amtNum <= 0 || submitting}
            onClick={() => handleOp('CRYPTO_SELL', { amount: amtNum, details: { asset: selected.symbol, fiat_expected: fiatGet } })}
            className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold disabled:opacity-30">
            {submitting ? 'Submitting…' : `Sell ${selected.symbol}`}
          </motion.button>
        </div>
      </div>
    );
  }

  // ── Swap view ─────────────────────────────────────────────────
  if (view === 'swap') {
    const ALL_SWAP_SYMBOLS = Object.keys(ASSET_META);
    const swapGet = (amtNum * swapRate).toFixed(6);
    return (
      <div className="h-full flex flex-col bg-white dark:bg-black">
        <div className="sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
          <div className="flex items-center justify-between">
            <button onClick={() => setView('list')}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
            <h2 className="text-base font-bold text-lumen-black dark:text-white">{t('crypto.swap')}</h2>
            <div className="w-6" />
          </div>
        </div>
        <div className="flex-1 p-5 space-y-4">
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold uppercase">From</span>
            <div className="flex items-center justify-between mt-2">
              <select value={swapFromSym}
                onChange={e => { setSwapFromSym(e.target.value); if (e.target.value === swapToSym) setSwapToSym(swapFromSym); }}
                className="font-bold text-lumen-black dark:text-white bg-transparent outline-none text-lg border-0 cursor-pointer">
                {ALL_SWAP_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                className="text-right text-lg font-bold bg-transparent outline-none w-32 text-lumen-black dark:text-white" />
            </div>
          </div>
          <div className="flex justify-center">
            <motion.button whileTap={{ rotate: 180 }} onClick={() => { const tmp = swapFromSym; setSwapFromSym(swapToSym); setSwapToSym(tmp); }}
              className="w-10 h-10 bg-lumen-black dark:bg-white rounded-full flex items-center justify-center">
              <Icons.ArrowUpDown size={18} className="text-white dark:text-black" />
            </motion.button>
          </div>
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold uppercase">To</span>
            <div className="flex items-center justify-between mt-2">
              <select value={swapToSym}
                onChange={e => { setSwapToSym(e.target.value); if (e.target.value === swapFromSym) setSwapFromSym(swapToSym); }}
                className="font-bold text-lumen-black dark:text-white bg-transparent outline-none text-lg border-0 cursor-pointer">
                {ALL_SWAP_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="text-lg font-bold text-lumen-black dark:text-white">{swapGet}</span>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-xl p-3 text-center">
            <span className="text-xs text-gray-500">1 {swapFromSym} ≈ {swapRate.toFixed(6)} {swapToSym}</span>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} disabled={amtNum <= 0 || submitting}
            onClick={() => handleOp('CRYPTO_SWAP', { amount: amtNum, details: { from: swapFromSym, to: swapToSym, expected: swapGet } })}
            className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold disabled:opacity-30">
            {submitting ? 'Submitting…' : 'Swap'}
          </motion.button>
        </div>
      </div>
    );
  }

  // ── Main portfolio list ───────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-28">
      <div className="sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
        <h2 className="text-lg font-bold text-lumen-black dark:text-white text-center">{t('crypto.title')}</h2>
      </div>

      {/* Portfolio balance */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">{t('crypto.portfolio')}</p>
        <h1 className="text-3xl font-bold text-lumen-black dark:text-white mt-1">
          USD {totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h1>
      </div>

      {/* Selected asset chart */}
      <div className="px-5 mb-4">
        <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4">
          {/* Asset selector */}
          <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
            {assets.map((a, i) => (
              <button key={a.symbol} onClick={() => setSelectedIdx(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${selectedIdx === i ? 'bg-lumen-black dark:bg-white text-white dark:text-black' : 'bg-gray-200 dark:bg-[#2C2C2E] text-gray-600 dark:text-gray-300'}`}>
                {a.symbol}
              </button>
            ))}
          </div>
          {/* Price + sparkline */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-400">{selected?.name}</p>
              <p className="text-xl font-bold text-lumen-black dark:text-white">
                ${ASSET_META[selected?.symbol]?.stable ? '1.00' : (prices[selectedIdx] || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{parseFloat(selected?.holdings || 0).toFixed(4)} {selected?.symbol}</p>
            </div>
            {ASSET_META[selected?.symbol]?.stable
              ? <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">Stable</span>
              : <Sparkline points={sparklines[selectedIdx]} isUp={sparklines[selectedIdx]?.at(-1) >= sparklines[selectedIdx]?.[0]} width={120} height={44} />
            }
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mb-5 grid grid-cols-4 gap-2">
        {[
          { label: t('crypto.buy'),  action: () => setView('buy'),  icon: Icons.Plus },
          { label: t('crypto.sell'), action: () => setView('sell'), icon: Icons.Minus },
          { label: t('crypto.swap'), action: () => setView('swap'), icon: Icons.ArrowUpDown },
          { label: 'Send',           action: () => showToast('Crypto Send — coming in Phase 7'), icon: Icons.Send },
        ].map((a, i) => (
          <motion.button key={i} whileTap={{ scale: 0.92 }} onClick={a.action}
            className="flex flex-col items-center gap-1.5 py-3 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl">
            <div className="w-9 h-9 bg-lumen-black dark:bg-white rounded-xl flex items-center justify-center">
              <a.icon size={16} className="text-white dark:text-black" />
            </div>
            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">{a.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Pending crypto operations */}
      {pendingCryptoOps.length > 0 && (
        <div className="px-5 mb-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pending Operations</h3>
          <div className="space-y-2">
            {pendingCryptoOps.map(op => (
              <div key={op.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-lumen-black dark:text-white">{op.type?.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-yellow-600">{op.status}</p>
                </div>
                <span className="text-sm font-bold text-lumen-black dark:text-white">{op.amount} {op.currency}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Asset list */}
      <div className="px-5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('crypto.assets')}</h3>
        <div className="space-y-2">
          {assets.map((asset, i) => {
            const p = prices[i] || 0;
            const value = (asset.holdings || 0) * p;
            const sp = sparklines[i] || [];
            const isUp = sp.length >= 2 ? sp[sp.length - 1] >= sp[0] : true;
            const changePct = sp.length >= 2 ? (((sp[sp.length - 1] - sp[0]) / sp[0]) * 100).toFixed(2) : '0.00';
            return (
              <motion.div key={asset.symbol} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                onClick={() => { setSelectedIdx(i); setView('buy'); }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl cursor-pointer active:bg-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-lumen-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black font-bold text-lg">
                    {asset.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-lumen-black dark:text-white">{asset.name}</p>
                    <span className="text-xs text-gray-400">{parseFloat(asset.holdings || 0).toFixed(4)} {asset.symbol}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!ASSET_META[asset.symbol]?.stable && <Sparkline points={sp} isUp={isUp} width={50} height={22} />}
                  <div className="text-right">
                    <p className="text-sm font-bold text-lumen-black dark:text-white">
                      {ASSET_META[asset.symbol]?.stable
                        ? `$${parseFloat(asset.holdings || 0).toFixed(2)}`
                        : `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </p>
                    {!ASSET_META[asset.symbol]?.stable && (
                      <span className={`text-xs font-semibold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                        {isUp ? '+' : ''}{changePct}%
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
