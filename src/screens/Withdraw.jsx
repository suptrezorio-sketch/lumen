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
    canvas.width = 400; canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, 400, 600);
    ctx.fillStyle = '#000000'; ctx.font = 'bold 32px Arial'; ctx.textAlign = 'center'; ctx.fillText('LUMEN', 200, 60);
    ctx.font = '14px Arial'; ctx.fillStyle = '#666666'; ctx.fillText('BANK', 200, 85);
    
    ctx.strokeStyle = '#000000'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(40, 110); ctx.lineTo(360, 110); ctx.stroke();
    
    ctx.fillStyle = '#000000'; ctx.font = 'bold 24px Arial'; ctx.fillText('WITHDRAWAL RECEIPT', 200, 150);
    
    ctx.font = '14px Arial'; ctx.fillStyle = '#333333';
    ctx.fillText(now.toLocaleDateString('en-CA'), 200, 190);
    ctx.fillText(now.toLocaleTimeString('en-CA'), 200, 215);
    
    ctx.font = 'bold 48px Arial'; ctx.fillStyle = '#000000';
    ctx.fillText(`$${parseFloat(data.amount).toLocaleString()}`, 200, 290);
    
    ctx.font = '16px Arial'; ctx.fillStyle = '#666666'; ctx.fillText('ACCOUNT:', 200, 340);
    ctx.font = 'bold 18px Arial'; ctx.fillStyle = '#000000'; ctx.fillText(data.account, 200, 370);
    
    ctx.font = 'bold 20px Arial'; ctx.fillStyle = '#00AA00'; ctx.fillText('COMPLETED', 200, 430);
    
    ctx.font = '14px Arial'; ctx.fillStyle = '#333333'; ctx.fillText('Transaction ID:', 200, 480);
    ctx.font = 'bold 14px Arial'; ctx.fillText(txId, 200, 505);
    
    ctx.strokeStyle = '#CCCCCC'; ctx.lineWidth = 1; ctx.strokeRect(60, 530, 280, 50);
    ctx.font = '12px Arial'; ctx.fillStyle = '#999999'; ctx.fillText(`Generated: ${now.toISOString().slice(0, 10)}`, 200, 560);
    
    return canvas;
  };

  const handleShare = async () => {
    const canvas = generateReceiptImage();
    canvas.toBlob(async (blob) => {
      if (blob && navigator.share) {
        const file = new File([blob], `lumen-receipt-${txId}.png`, { type: 'image/png' });
        try {
          await navigator.share({ title: 'Lumen Bank - Withdrawal Receipt', text: `Withdrew $${data.amount}`, files: [file] });
        } catch (e) {}
      } else {
        navigator.share({ title: 'Withdrawal Receipt', text: `Withdrew $${data.amount} to account ${data.account}.\nTxID: ${txId}` }).catch(()=>{});
      }
    }, 'image/png');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full bg-white dark:bg-black relative z-50">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6">
        <Icons.Check size={40} />
      </div>
      <h2 className="text-2xl font-bold text-lumen-black dark:text-white mb-2">{t('common.success')}</h2>
      <p className="text-gray-500 mb-8">Withdrawal request processed successfully.</p>
      
      <div className="w-full bg-gray-50 dark:bg-[#1C1C1E] rounded-3xl p-6 space-y-4 mb-8">
        <div className="flex justify-between text-sm"><span className="text-gray-500">Amount</span><span className="font-bold text-lumen-black dark:text-white">${parseFloat(data.amount).toLocaleString()}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">Receiving Account</span><span className="font-bold text-lumen-black dark:text-white">{data.account}</span></div>
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

export default function Withdraw({ onNavigate, showToast }) {
  const { t, addTransaction } = useApp();
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isValid = account.length > 5 && parseFloat(amount) > 0;

  const handleOTPVerify = () => {
    setShowOTP(false);
    setIsSuccess(true);
    showToast(t('common.success'));
    
    addTransaction({ 
      type: 'outgoing', 
      title: `Withdrawal to ${account.substring(0, 4)}...`, 
      description: 'Funds Withdrawal', 
      amount: -parseFloat(amount), 
      category: 'transfer', 
      status: 'completed'
    });
  };

  if (isSuccess) return <SuccessReceipt data={{ amount, account }} onBack={() => onNavigate('/', { replace: true })} t={t} />;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black">
      <div className="sticky top-0 bg-white/90 dark:bg-black/90 border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate('/')}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
          <h2 className="text-base font-bold text-lumen-black dark:text-white">Withdraw Funds</h2>
          <div className="w-6" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-6 pb-28">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Receiving Account Number</label>
          <input type="text" value={account} onChange={e => setAccount(e.target.value)} placeholder="0000 0000 0000 0000"
            className="w-full mt-2 p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl text-lg font-mono font-bold text-lumen-black dark:text-white outline-none border-2 border-transparent focus:border-blue-500/30 transition-all" />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Withdrawal Amount</label>
          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">$</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
              className="w-full p-4 pl-10 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl text-3xl font-bold text-lumen-black dark:text-white outline-none border-2 border-transparent focus:border-blue-500/30 transition-all" />
          </div>
        </div>

        {isValid && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-5 space-y-3">
            <div className="flex justify-between text-xs font-bold"><span className="text-gray-400 uppercase">To Account</span><span className="text-lumen-black dark:text-white">{account}</span></div>
            <div className="flex justify-between text-sm font-black pt-3 border-t border-gray-100 dark:border-gray-800"><span className="text-lumen-black dark:text-white uppercase">Total</span><span className="text-lumen-black dark:text-white">${parseFloat(amount).toLocaleString()}</span></div>
          </motion.div>
        )}

        <SlideToPay onComplete={() => setShowOTP(true)} label="Slide to Withdraw" disabled={!isValid} />
      </div>

      <AnimatePresence>
        {showOTP && <OTPModal onVerify={handleOTPVerify} onClose={() => setShowOTP(false)} t={t} />}
      </AnimatePresence>
    </div>
  );
}
