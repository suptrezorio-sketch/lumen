import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';
import { usePbClient } from '../hooks/usePbClient';
import LumenCardNumberInput from '../components/inputs/LumenCardNumberInput';
import LumenNumericKeyboard from '../components/inputs/LumenNumericKeyboard';

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
  const autoFill = () => setCode(generatedCode);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[80] flex items-end justify-center">
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-[430px] bg-white dark:bg-[#1C1C1E] rounded-t-3xl p-6 pb-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-lumen-black dark:text-white">{t('otp.title')}</h3>
          <button onClick={onClose}><Icons.X size={20} className="text-gray-400" /></button>
        </div>
        
        <div className="flex gap-2 justify-center mb-6">
          {[0,1,2,3,4,5].map(i => (
            <div key={i} className={`w-11 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all
              ${i < code.length ? 'border-lumen-black dark:border-white bg-gray-50 dark:bg-[#2C2C2E] text-lumen-black dark:text-white' : 'border-gray-200 dark:border-gray-600'}`}>
              {code[i] || ''}
            </div>
          ))}
        </div>

        {showBtn && (
          <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            onClick={autoFill}
            className="w-full py-3 mb-6 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl text-sm font-semibold">
            {t('otp.showCode')}: {generatedCode}
          </motion.button>
        )}

        <div className="w-full max-w-[320px] mx-auto mb-6">
          <LumenNumericKeyboard 
            onKeyPress={handleDigit} 
            onDelete={handleDelete} 
          />
        </div>

        <motion.button whileTap={{ scale: 0.97 }}
          onClick={() => code.length === 6 && onVerify(code)}
          disabled={code.length < 6}
          className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold disabled:opacity-30 shadow-lg">
          {t('otp.verify')}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function SlideToPay({ onComplete, label, disabled }) {
  const x = useMotionValue(0);
  const trackRef = useRef(null);
  const [done, setDone] = useState(false);
  const bg = useTransform(x, [0, 200], ['rgba(0,122,255,0.05)', 'rgba(48,209,88,0.2)']);

  const handleDragEnd = (_, info) => {
    if (disabled || !trackRef.current) return;
    const width = trackRef.current.offsetWidth - 56;
    if (info.offset.x > width * 0.7) {
      setDone(true);
      onComplete();
    }
  };

  return (
    <motion.div ref={trackRef} style={{ background: bg }}
      className={`relative h-14 rounded-full overflow-hidden border-2 ${disabled ? 'opacity-30 grayscale' : 'border-blue-500/20'}`}>
      {!done && (
        <>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-blue-500 pointer-events-none uppercase tracking-widest">{label}</span>
          <motion.div drag="x" dragConstraints={{ left: 0, right: (trackRef.current?.offsetWidth || 300) - 56 }}
            dragElastic={0} onDragEnd={handleDragEnd} style={{ x }}
            whileTap={{ scale: 1.05 }}
            className="absolute top-1 left-1 w-12 h-12 bg-lumen-black dark:bg-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10 shadow-lg">
            <Icons.ChevronRight size={20} className="text-white dark:text-black" />
          </motion.div>
        </>
      )}
      {done && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500 text-white font-bold">
           <Icons.Check size={24} className="mr-2" /> SUCCESS
        </div>
      )}
    </motion.div>
  );
}

const SuccessReceipt = ({ data, onBack, t }) => {
  const txId = React.useMemo(() => '#' + Math.random().toString(36).substr(2, 9).toUpperCase(), []);
  const dateStr = new Date().toLocaleString('en-CA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const opLabel = data.type === 'WITHDRAW' ? 'Withdrawal' : data.type === 'IBAN_TRANSFER' ? 'IBAN Transfer' : 'Card Transfer';
  const amtFormatted = `${data.currency || 'CAD'} ${parseFloat(data.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const handleShare = () => {
    const receiptHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>LUMEN Receipt</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif;background:#fff;display:flex;justify-content:center;padding:40px 20px}
.card{width:360px;border-radius:16px;border:1px solid #e5e5e5;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.logo{font-size:22px;font-weight:900;letter-spacing:-0.5px;margin-bottom:24px;color:#1a1a1a}
.status{display:inline-block;background:#f0fdf4;color:#16a34a;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;margin-bottom:24px;text-transform:uppercase;letter-spacing:.05em}
.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f5f5f5;font-size:13px}
.row:last-child{border:none}.label{color:#6b7280}.value{font-weight:700;color:#1a1a1a}
.footer{margin-top:24px;font-size:10px;color:#9ca3af;text-align:center}
@media print{body{padding:0}@page{margin:20px}}</style></head>
<body><div class="card">
<div class="logo">LUMEN</div>
<div class="status">Pending Review</div>
<div class="row"><span class="label">Type</span><span class="value">${opLabel}</span></div>
<div class="row"><span class="label">Amount</span><span class="value">${amtFormatted}</span></div>
${data.recipient ? `<div class="row"><span class="label">Recipient</span><span class="value">${data.recipient}</span></div>` : ''}
<div class="row"><span class="label">Date & Time</span><span class="value">${dateStr}</span></div>
<div class="row"><span class="label">Transaction ID</span><span class="value">${txId}</span></div>
<div class="footer">LUMEN Bank — This is an official transaction receipt</div>
</div></body></html>`;
    const win = window.open('', '_blank', 'width=440,height=620');
    if (win) {
      win.document.write(receiptHtml);
      win.document.close();
      setTimeout(() => win.print(), 400);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6">
        <Icons.Check size={40} />
      </div>
      <h2 className="text-2xl font-bold text-lumen-black dark:text-white mb-2">{t('common.success')}</h2>
      <p className="text-gray-500 mb-8">{t('transfers.successDesc')}</p>
      
      <div className="w-full bg-gray-50 dark:bg-[#1C1C1E] rounded-3xl p-6 space-y-4 mb-8">
        <div className="flex justify-between text-sm"><span className="text-gray-500">{t('transfers.amount')}</span><span className="font-bold text-lumen-black dark:text-white">${parseFloat(data.amount).toLocaleString()}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">{t('transfers.recipient')}</span><span className="font-bold text-lumen-black dark:text-white">{data.recipient}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">{t('history.date')}</span><span className="font-bold text-lumen-black dark:text-white">{new Date().toLocaleDateString()}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">{t('history.txId')}</span><span className="font-mono font-bold text-lumen-black dark:text-white">{txId}</span></div>
      </div>

      <div className="w-full space-y-3">
        <button onClick={handleShare} className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold flex items-center justify-center gap-2">
          <Icons.Share size={20} /> {t('common.share')}
        </button>
        <button onClick={onBack} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-lumen-black dark:text-white rounded-2xl font-bold">
          {t('common.done')}
        </button>
      </div>
    </motion.div>
  );
};

export default function Transfers({ onNavigate, showToast }) {
  const { t, addTransaction } = useApp();
  const { cards: pbCards, submitOperation } = usePbClient();
  const [transferType, setTransferType] = useState('card'); // 'card' or 'iban'
  const [selectedCardIdx, setSelectedCardIdx] = useState(0);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [ibanDetails, setIbanDetails] = useState({ name: '', iban: '', bank: '', swift: '' });
  const [note, setNote] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fiatCards = pbCards.filter(c => !c.type || c.type === 'fiat' || c.type === 'virtual' || c.type === 'credit');
  const activeCard = fiatCards[selectedCardIdx];

  const handleCardInput = (val) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 16);
    setRecipient(cleaned);
  };

  const cardBalance = activeCard?.available_balance ?? activeCard?.balance ?? Infinity;

  const isFormValid = () => {
    if (!activeCard) return false;
    if (transferType === 'card') {
      return recipient.length === 16 && parseFloat(amount) > 0 && parseFloat(amount) <= cardBalance;
    } else {
      return ibanDetails.iban.length > 10 && ibanDetails.name.length > 2 && parseFloat(amount) > 0 && parseFloat(amount) <= cardBalance;
    }
  };

  const handleOTPVerify = async () => {
    setShowOTP(false);
    setIsSuccess(true);
    showToast(t('common.success'));
    addTransaction({
      type: 'outgoing',
      title: transferType === 'card' ? `Transfer to card ...${recipient.slice(-4)}` : `Transfer to ${ibanDetails.name}`,
      description: note || 'Transfer',
      amount: -parseFloat(amount),
      category: 'transfer',
      status: 'pending'
    });
    try {
      const opType = transferType === 'card' ? 'CARD_TRANSFER' : 'IBAN_TRANSFER';
      await submitOperation(opType, {
        amount: parseFloat(amount),
        currency: 'USD',
        details: transferType === 'card'
          ? { recipient_card: recipient, note }
          : { ...ibanDetails, note },
      });
    } catch {}
  };

  if (isSuccess) return <SuccessReceipt data={{ amount, currency: activeCard?.currency || 'USD', recipient: transferType === 'card' ? recipient : ibanDetails.name, type: transferType === 'card' ? 'CARD_TRANSFER' : 'IBAN_TRANSFER' }} onBack={() => onNavigate('/')} t={t} />;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate('/')}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
          <h2 className="text-base font-bold text-lumen-black dark:text-white">{t('transfers.title')}</h2>
          <div className="w-6" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-6 pb-28">
        {/* Transfer Type Selection */}
        <div className="flex gap-2 p-1 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl">
          <button onClick={() => setTransferType('card')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${transferType === 'card' ? 'bg-white dark:bg-gray-800 text-lumen-black dark:text-white shadow-sm' : 'text-gray-400'}`}>BY CARD</button>
          <button onClick={() => setTransferType('iban')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${transferType === 'iban' ? 'bg-white dark:bg-gray-800 text-lumen-black dark:text-white shadow-sm' : 'text-gray-400'}`}>FULL DETAILS (IBAN)</button>
        </div>

        {/* Source Card Dropdown */}
        <div className="relative">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">From</label>
          {fiatCards.length === 0 ? (
            <div className="w-full mt-2 p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl text-sm text-gray-400">No fiat cards available</div>
          ) : (
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full mt-2 p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl flex items-center justify-between border-2 border-transparent focus:border-blue-500/30">
            <div className="flex items-center gap-3">
              <Icons.CreditCard size={18} className="text-gray-400" />
              <div className="text-left">
                <p className="text-sm font-bold text-lumen-black dark:text-white">{activeCard?.label || activeCard?.name || 'Card'} {activeCard?.number_last4 ? `•••• ${activeCard.number_last4}` : ''}</p>
                <p className="text-[10px] text-gray-500 font-bold">{activeCard?.currency || 'USD'} {(activeCard?.available_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <Icons.ChevronDown size={18} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          )}
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
                {fiatCards.map((card, idx) => (
                  <button key={card.id} onClick={() => { setSelectedCardIdx(idx); setIsDropdownOpen(false); }}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 border-b last:border-0 border-gray-50 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <Icons.CreditCard size={18} className="text-gray-400" />
                      <span className="text-sm font-bold text-lumen-black dark:text-white">{card.label || card.name || 'Card'} {card.number_last4 ? `•••• ${card.number_last4}` : ''}</span>
                    </div>
                    <span className="text-sm font-bold text-lumen-black dark:text-white">{card.currency || 'USD'} {(card.available_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recipient Details */}
        <div className="space-y-4">
          {transferType === 'card' ? (
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Card Number</label>
              <LumenCardNumberInput value={recipient} onChange={val => setRecipient(val)} />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Recipient Name</label>
                <input type="text" value={ibanDetails.name} onChange={e => setIbanDetails({...ibanDetails, name: e.target.value})} placeholder="John Doe"
                  className="w-full mt-2 p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl text-sm font-bold text-lumen-black dark:text-white outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">IBAN / Account Number</label>
                <input type="text" value={ibanDetails.iban} onChange={e => setIbanDetails({...ibanDetails, iban: e.target.value.toUpperCase()})} placeholder="CA00 0000 0000 0000"
                  className="w-full mt-2 p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl text-sm font-mono font-bold text-lumen-black dark:text-white outline-none" />
              </div>
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</label>
          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">$</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
              className="w-full p-4 pl-10 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl text-3xl font-bold text-lumen-black dark:text-white outline-none border-2 border-transparent focus:border-blue-500/30" />
          </div>
          {activeCard && parseFloat(amount) > cardBalance && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">Insufficient funds</p>}
        </div>

        <SlideToPay onComplete={() => setShowOTP(true)} label="Slide to Authorize" disabled={!isFormValid()} />
      </div>

      <AnimatePresence>
        {showOTP && <OTPModal onVerify={handleOTPVerify} onClose={() => setShowOTP(false)} t={t} />}
      </AnimatePresence>
    </div>
  );
}
