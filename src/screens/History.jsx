import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';
import { usePbClient } from '../hooks/usePbClient';
import { logoLightB64, logoDarkB64 } from '../assets/logoBase64';

function printReceipt(tx) {
  const typeLabel = {
    TOP_UP: 'Top Up', WITHDRAW: 'Withdrawal', CARD_TRANSFER: 'Card Transfer',
    IBAN_TRANSFER: 'IBAN Transfer', CRYPTO_BUY: 'Crypto Purchase', CRYPTO_SELL: 'Crypto Sale',
    CRYPTO_SWAP: 'Crypto Swap', INTERNAL_TRANSFER: 'Internal Transfer',
  };
  const title = tx.title || typeLabel[tx.type] || (tx.type?.replace(/_/g, ' ')) || 'Transaction';
  const amount = Math.abs(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
  const currency = tx.currency || 'USD';
  const date = tx.date || tx.created;
  const status = tx.status || 'Pending';
  const isIn = tx.direction === 'credit' || tx.type === 'incoming' || tx.type === 'TOP_UP';
  const statusColor = status === 'Completed' || status === 'Approved' ? '#16a34a' : status === 'Rejected' ? '#dc2626' : '#92400e';
  const statusBg = status === 'Completed' || status === 'Approved' ? '#f0fdf4' : status === 'Rejected' ? '#fef2f2' : '#fffbeb';
  const html = `<!DOCTYPE html><html><head><meta charset='utf-8'>
  <title>LUMEN Receipt</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',Arial,sans-serif; background:#f5f5f7; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px; }
    .card { background:#fff; border-radius:24px; width:100%; max-width:420px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.12); }
    .header { background:#000; padding:28px 28px 24px; }
    .logo { color:#fff; font-size:20px; font-weight:900; letter-spacing:-0.5px; }
    .logo-sub { color:rgba(255,255,255,0.4); font-size:11px; margin-top:2px; letter-spacing:1px; text-transform:uppercase; }
    .amount-section { background:#000; padding:0 28px 32px; text-align:center; border-bottom:1px solid rgba(255,255,255,0.08); }
    .amount-sign { font-size:14px; color:rgba(255,255,255,0.5); font-weight:600; margin-bottom:2px; }
    .amount-value { font-size:52px; font-weight:800; color:#fff; letter-spacing:-2px; line-height:1; }
    .amount-type { font-size:13px; color:rgba(255,255,255,0.45); margin-top:8px; letter-spacing:2px; text-transform:uppercase; font-weight:500; }
    .body { padding:28px; }
    .row { display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #f0f0f0; }
    .row:last-child { border-bottom:none; }
    .row-label { font-size:12px; color:#8e8e93; font-weight:500; }
    .row-value { font-size:13px; color:#1c1c1e; font-weight:600; text-align:right; max-width:220px; font-family:inherit; }
    .row-value.mono { font-family:'SF Mono',Monaco,monospace; font-size:11px; color:#3c3c43; }
    .status-badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:0.5px; background:${statusBg}; color:${statusColor}; }
    .divider { border:none; border-top:2px dashed #e5e5ea; margin:4px 0; }
    .footer { text-align:center; padding:20px 28px 24px; }
    .footer-logo { font-size:16px; font-weight:900; color:#1c1c1e; letter-spacing:-0.5px; margin-bottom:4px; }
    .footer-text { font-size:10px; color:#aeaeb2; line-height:1.5; }
    @media print { body { background:#fff; } .card { box-shadow:none; } }
  </style>
</head><body>
  <div class='card'>
    <div class='header'>
      <div style='display:flex;align-items:center;gap:10px;margin-bottom:4px'>
        <img src='${logoLightB64}' style='height:28px' alt='LUMEN'/>
        <span style='font-size:20px;font-weight:900;color:#fff;letter-spacing:-0.5px'>LUMEN</span>
      </div>
      <div class='logo-sub'>Transaction Receipt</div>
    </div>
    <div class='amount-section'>
      <div class='amount-sign'>${isIn ? 'CREDITED' : 'DEBITED'}</div>
      <div class='amount-value'>${isIn ? '+' : '−'}${currency} ${amount}</div>
      <div class='amount-type'>${title}</div>
    </div>
    <div class='body'>
      <div class='row'><span class='row-label'>Transaction ID</span><span class='row-value mono'>${tx.id}</span></div>
      <div class='row'><span class='row-label'>Date &amp; Time</span><span class='row-value'>${date ? new Date(date).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'}</span></div>
      <div class='row'><span class='row-label'>Network Fee</span><span class='row-value'>${currency} ${(tx.fee || 0).toFixed(2)}</span></div>
      <div class='row'><span class='row-label'>Status</span><span class='row-value'><span class='status-badge'>${status}</span></span></div>
      ${tx.notes ? `<div class='row'><span class='row-label'>Notes</span><span class='row-value'>${tx.notes}</span></div>` : ''}
    </div>
    <hr class='divider'>
    <div class='footer'>
      <div style='display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:6px'>
        <img src='${logoDarkB64}' style='height:20px' alt='LUMEN'/>
        <span style='font-size:15px;font-weight:900;color:#1c1c1e;letter-spacing:-0.5px'>LUMEN Bank</span>
      </div>
      <div class='footer-text'>This is a computer-generated receipt.<br>${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}</div>
    </div>
  </div>
</body></html>`;
  const w = window.open('', '_blank', 'width=500,height=760');
  w.document.write(html);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 500);
}

const STATUS_COLORS = {
  Pending: 'text-yellow-500',
  Processing: 'text-blue-500',
  Completed: 'text-green-600',
  Rejected: 'text-red-500',
  'Under Review': 'text-blue-400',
  completed: 'text-green-600',
  pending: 'text-yellow-500',
};

const OP_TYPES = ['all','TOP_UP','WITHDRAW','INTERNAL_TRANSFER','IBAN_TRANSFER','CRYPTO_BUY','CRYPTO_SELL','MOBILE_TOP_UP','UTILITY_PAYMENT'];

export default function History({ onNavigate }) {
  const { t, transactions: localTxs } = useApp();
  const { operations, hasPbClient } = usePbClient();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  // Merge sources
  const allItems = hasPbClient && operations.length > 0 ? operations : localTxs;

  const filtered = allItems.filter(tx => {
    const title = tx.title || tx.type || '';
    const desc = tx.description || tx.notes || '';
    if (filter !== 'all' && tx.category !== filter && tx.type !== filter) return false;
    if (search && !title.toLowerCase().includes(search.toLowerCase()) && !desc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (selected) {
    const tx = selected;
    const txTitle = tx.title || (tx.type?.replace(/_/g, ' ')) || 'Operation';
    const txAmount = Math.abs(tx.amount || 0);
    const txCurrency = tx.currency || 'USD';
    const txDate = tx.date || tx.created;
    const txStatus = tx.status || 'pending';
    const isIn = tx.type === 'incoming' || tx.direction === 'credit';
    return (
      <div className="h-full bg-white dark:bg-black">
        <div className="sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
          <div className="flex items-center justify-between">
            <button onClick={() => setSelected(null)}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
            <h2 className="text-base font-bold text-lumen-black dark:text-white">{t('history.details')}</h2>
            <button onClick={async () => {
              try {
                const { generateReceipt } = await import('../services/pdfService');
                const url = await generateReceipt(tx);
                if (url) window.open(url, '_blank');
                else printReceipt(tx);
              } catch (e) { printReceipt(tx); }
            }} className="w-8 h-8 bg-gray-100 dark:bg-[#1C1C1E] rounded-xl flex items-center justify-center">
              <Icons.Download size={15} className="text-lumen-black dark:text-white" />
            </button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-center py-4">
            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 ${isIn ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {isIn ? <Icons.TrendingUp size={28} /> : <Icons.TrendingDown size={28} />}
            </div>
            <h3 className="text-xl font-bold text-lumen-black dark:text-white">{isIn ? '+' : '−'}{txCurrency} {txAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
            <p className="text-sm text-gray-500 mt-1">{txTitle}</p>
          </div>
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4 space-y-3">
            <div className="flex justify-between"><span className="text-xs text-gray-500">{t('history.txId')}</span><span className="text-xs font-mono font-bold text-lumen-black dark:text-white truncate ml-4">{tx.id}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500">{t('history.date')}</span><span className="text-xs text-lumen-black dark:text-white">{txDate ? new Date(txDate).toLocaleString() : '—'}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500">{t('history.fee')}</span><span className="text-xs text-lumen-black dark:text-white">{txCurrency} {(tx.fee || 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500">{t('history.status')}</span>
              <span className={`text-xs font-bold ${STATUS_COLORS[txStatus] || 'text-gray-500'}`}>{txStatus}</span>
            </div>
            {tx.notes && <div className="flex justify-between"><span className="text-xs text-gray-500">Notes</span><span className="text-xs text-lumen-black dark:text-white ml-4 text-right">{tx.notes}</span></div>}
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={async () => {
              try {
                // Show loading toast or update state here if needed
                const { generateReceipt } = await import('../services/pdfService');
                const url = await generateReceipt(tx);
                if (url) {
                  window.open(url, '_blank');
                } else {
                  // Fallback to old print logic if API fails
                  printReceipt(tx);
                }
              } catch (e) {
                console.error(e);
                printReceipt(tx);
              }
            }}
            className="w-full py-3.5 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-lumen-black dark:text-white">
            <Icons.Download size={16} /> Download Receipt
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-28">
      <div className="sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
        <h2 className="text-lg font-bold text-lumen-black dark:text-white text-center mb-3">{t('history.title')}</h2>
        <div className="relative">
          <Icons.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('history.search')}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-[#1C1C1E] rounded-xl text-sm text-lumen-black dark:text-white border-0 outline-none placeholder-gray-400" />
        </div>
      </div>

      <div className="px-5 pt-3 pb-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {OP_TYPES.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filter === cat ? 'bg-lumen-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-[#1C1C1E] text-gray-600 dark:text-gray-400'}`}>
              {cat === 'all' ? (t('history.all') || 'All') : cat.replace(/_/g,' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-2 pb-4">
        <AnimatePresence>
          {filtered.map((tx, i) => {
            const isIn = tx.type === 'incoming' || tx.direction === 'credit';
            const title = tx.title || (tx.type?.replace(/_/g,' ')) || 'Operation';
            const amount = Math.abs(tx.amount || 0);
            const currency = tx.currency || 'USD';
            const date = tx.date || tx.created;
            const status = tx.status || 'pending';
            return (
              <motion.div key={tx.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                onClick={() => setSelected(tx)}
                className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl cursor-pointer active:bg-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isIn ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                    {isIn ? <Icons.TrendingUp size={16} /> : <Icons.TrendingDown size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-lumen-black dark:text-white">{title}</p>
                    <span className={`text-[10px] font-semibold ${STATUS_COLORS[status] || 'text-gray-400'}`}>{status}</span>
                    <span className="text-[10px] text-gray-400 ml-2">{date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                  </div>
                </div>
                <span className={`text-sm font-bold ${isIn ? 'text-green-600' : 'text-lumen-black dark:text-white'}`}>
                  {isIn ? '+' : '-'}{currency} {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
