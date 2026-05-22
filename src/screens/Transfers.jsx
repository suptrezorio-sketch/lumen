import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';

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

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1,2,3,4,5,6,7,8,9,'',0,'del'].map((k, i) => (
            <motion.button key={i} whileTap={{ scale: 0.9 }}
              onClick={() => k === 'del' ? handleDelete() : k !== '' ? handleDigit(String(k)) : null}
              className={`h-14 rounded-xl text-xl font-semibold flex items-center justify-center ${k === '' ? 'invisible' : 'bg-gray-50 dark:bg-[#2C2C2E] text-lumen-black dark:text-white active:bg-gray-200'}`}>
              {k === 'del' ? <Icons.ArrowLeft size={20} /> : k}
            </motion.button>
          ))}
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
  const now = new Date();
  
  const generateReceiptImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 400, 600);
    
    // Header
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('LUMEN', 200, 60);
    
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText('BANK', 200, 85);
    
    // Divider line
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 110);
    ctx.lineTo(360, 110);
    ctx.stroke();
    
    // Title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('TRANSFER RECEIPT', 200, 150);
    
    // Date/Time
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333333';
    ctx.fillText(now.toLocaleDateString('en-CA', { day: '2-digit', month: '2-digit', year: 'numeric' }), 200, 190);
    ctx.fillText(now.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 200, 215);
    
    // Amount (large)
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText(`$${parseFloat(data.amount).toLocaleString()}`, 200, 290);
    
    // Recipient
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText('TO:', 200, 340);
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText(data.recipient, 200, 370);
    
    // Status
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#00AA00';
    ctx.fillText('COMPLETED', 200, 430);
    
    // Transaction ID
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333333';
    ctx.fillText('Transaction ID:', 200, 480);
    ctx.font = 'bold 14px Arial';
    ctx.fillText(txId, 200, 505);
    
    // Bottom stamp
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    ctx.strokeRect(60, 530, 280, 50);
    ctx.font = '12px Arial';
    ctx.fillStyle = '#999999';
    ctx.fillText(`Generated: ${now.toISOString().slice(0, 10)}`, 200, 560);
    
    return canvas;
  };
  
  const handleShare = async () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:5001';
    let blob = null;
    try {
      const res = await fetch(`${backendUrl}/api/receipt/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: data.amount, recipient: data.recipient, txId }),
      });
      if (res.ok) {
        const { dataUrl, base64 } = await res.json();
        const src = dataUrl || `data:image/png;base64,${base64}`;
        const imgRes = await fetch(src);
        blob = await imgRes.blob();
      }
    } catch (e) {
      console.warn('Pollinations receipt fallback', e);
    }
    if (!blob) {
      const canvas = generateReceiptImage();
      blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    }
    if (blob && navigator.share) {
      const file = new File([blob], `lumen-receipt-${txId}.png`, { type: 'image/png' });
      try {
        await navigator.share({
          title: 'Lumen Bank - Transfer Receipt',
          text: `Successfully transferred $${data.amount} to ${data.recipient}`,
          files: [file],
        });
        return;
      } catch (e) {
        if (e.name !== 'AbortError') console.log('Share error:', e);
      }
    }
    if (navigator.share) {
      navigator.share({
        title: 'Transaction Receipt',
        text: `Successfully transferred $${data.amount} to ${data.recipient}.\nTxID: ${txId}`,
      }).catch(() => {});
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
  const { t, cards, addTransaction, user } = useApp();
  const [transferType, setTransferType] = useState('card'); // 'card' or 'iban'
  const [selectedCardIdx, setSelectedCardIdx] = useState(0);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [ibanDetails, setIbanDetails] = useState({ name: '', iban: '', bank: '', swift: '' });
  const [note, setNote] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fiatCards = cards.filter(c => c.type === 'fiat');
  const activeCard = fiatCards[selectedCardIdx];

  const handleCardInput = (val) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 16);
    setRecipient(cleaned);
  };

  const isFormValid = () => {
    if (transferType === 'card') {
      return recipient.length === 16 && parseFloat(amount) > 0 && parseFloat(amount) <= activeCard.balance;
    } else {
      return ibanDetails.iban.length > 10 && ibanDetails.name.length > 2 && parseFloat(amount) > 0 && parseFloat(amount) <= activeCard.balance;
    }
  };

  const handleOTPVerify = async () => {
    setShowOTP(false);
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:5001';
      const toAccount = transferType === 'card' ? recipient : ibanDetails.iban;

      const response = await fetch(`${backendUrl}/api/v1/transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?._id || localStorage.getItem('lumen_user_id'),
          recipientAccount: toAccount,
          amount: parseFloat(amount),
          title: transferType === 'card' ? `Transfer to card ...${recipient.slice(-4)}` : `Transfer to ${ibanDetails.name}`,
          description: note || 'Transfer',
          type: 'outgoing',
          status: 'completed'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        showToast(errorData.error || 'Transfer blocked pending verification');
        return; // Stop here, scenario engine is handling it
      }

      setIsSuccess(true);
      showToast(t('common.success'));
      
      addTransaction({ 
        type: 'outgoing', 
        title: transferType === 'card' ? `Transfer to card ...${recipient.slice(-4)}` : `Transfer to ${ibanDetails.name}`, 
        description: note || 'Transfer', 
        amount: -parseFloat(amount), 
        category: 'transfer', 
        status: 'completed'
      });
    } catch (e) {
      showToast('Network error');
    }
  };

  if (isSuccess) return <SuccessReceipt data={{ amount, recipient: transferType === 'card' ? recipient : ibanDetails.name }} onBack={() => onNavigate('/', { replace: true })} t={t} />;

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
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            className="w-full mt-2 p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl flex items-center justify-between border-2 border-transparent focus:border-blue-500/30">
            <div className="flex items-center gap-3">
              <Icons.CreditCard size={18} className="text-gray-400" />
              <div className="text-left">
                <p className="text-sm font-bold text-lumen-black dark:text-white">{activeCard.name}</p>
                <p className="text-[10px] text-gray-500 font-bold">${activeCard.balance.toLocaleString()}</p>
              </div>
            </div>
            <Icons.ChevronDown size={18} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
                {fiatCards.map((card, idx) => (
                  <button key={card.id} onClick={() => { setSelectedCardIdx(idx); setIsDropdownOpen(false); }}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 border-b last:border-0 border-gray-50 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <Icons.CreditCard size={18} className="text-gray-400" />
                      <span className="text-sm font-bold text-lumen-black dark:text-white">{card.name}</span>
                    </div>
                    <span className="text-sm font-bold text-lumen-black dark:text-white">${card.balance.toLocaleString()}</span>
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
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Card Number</label>
              <div className="relative mt-2">
                <input type="text" value={recipient.replace(/(\d{4})/g, '$1 ').trim()} onChange={e => handleCardInput(e.target.value)} placeholder="0000 0000 0000 0000"
                  className="w-full p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl text-lg font-mono font-bold text-lumen-black dark:text-white outline-none border-2 border-transparent focus:border-blue-500/30" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                   <div className="w-8 h-5 bg-orange-500 rounded-sm opacity-50" />
                   <div className="w-8 h-5 bg-red-500 rounded-sm opacity-50" />
                </div>
              </div>
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
          {parseFloat(amount) > activeCard.balance && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">Insufficient funds</p>}
        </div>

        <SlideToPay onComplete={() => setShowOTP(true)} label="Slide to Authorize" disabled={!isFormValid()} />
      </div>

      <AnimatePresence>
        {showOTP && <OTPModal onVerify={handleOTPVerify} onClose={() => setShowOTP(false)} t={t} />}
      </AnimatePresence>
    </div>
  );
}
