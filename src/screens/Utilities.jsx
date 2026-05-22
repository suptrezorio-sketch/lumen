import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[80] flex items-end justify-center">
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        className="w-full max-w-[430px] bg-white dark:bg-[#1C1C1E] rounded-t-3xl p-6 pb-10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-lumen-black dark:text-white">{t('otp.title')}</h3>
          <button onClick={onClose}><Icons.X size={24} className="text-gray-400" /></button>
        </div>
        
        <div className="flex gap-2 justify-center mb-8">
          {[0,1,2,3,4,5].map(i => (
            <div key={i} className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all
              ${i < code.length ? 'border-lumen-black dark:border-white bg-gray-50 dark:bg-[#2C2C2E] text-lumen-black dark:text-white' : 'border-gray-200 dark:border-gray-600'}`}>
              {code[i] || ''}
            </div>
          ))}
        </div>

        {showBtn && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => setCode(generatedCode)}
            className="w-full py-3 mb-6 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl text-sm font-bold">
            {t('otp.showCode')}: {generatedCode}
          </motion.button>
        )}

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[1,2,3,4,5,6,7,8,9,'',0,'del'].map((k, i) => (
            <motion.button key={i} whileTap={{ scale: 0.95 }}
              onClick={() => k === 'del' ? handleDelete() : k !== '' ? handleDigit(String(k)) : null}
              className={`h-14 rounded-xl text-xl font-bold flex items-center justify-center ${k === '' ? 'invisible' : 'bg-gray-50 dark:bg-[#2C2C2E] text-lumen-black dark:text-white'}`}>
              {k === 'del' ? <Icons.ArrowLeft size={24} /> : k}
            </motion.button>
          ))}
        </div>

        <button onClick={() => onVerify(code)} disabled={code.length < 6}
          className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold disabled:opacity-30">
          {t('otp.verify')}
        </button>
      </motion.div>
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
    
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, 400, 600);
    ctx.fillStyle = '#000000'; ctx.font = 'bold 32px Arial'; ctx.textAlign = 'center'; ctx.fillText('LUMEN', 200, 60);
    ctx.font = '14px Arial'; ctx.fillStyle = '#666666'; ctx.fillText('BANK', 200, 85);
    
    ctx.strokeStyle = '#000000'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(40, 110); ctx.lineTo(360, 110); ctx.stroke();
    
    ctx.fillStyle = '#000000'; ctx.font = 'bold 24px Arial'; ctx.fillText('UTILITY RECEIPT', 200, 150);
    
    ctx.font = '14px Arial'; ctx.fillStyle = '#333333';
    ctx.fillText(now.toLocaleDateString('en-CA'), 200, 190);
    ctx.fillText(now.toLocaleTimeString('en-CA'), 200, 215);
    
    ctx.font = 'bold 48px Arial'; ctx.fillStyle = '#000000';
    ctx.fillText(`$${parseFloat(data.amount).toLocaleString()}`, 200, 290);
    
    ctx.font = '16px Arial'; ctx.fillStyle = '#666666'; ctx.fillText('PAYMENT TO:', 200, 340);
    ctx.font = 'bold 18px Arial'; ctx.fillStyle = '#000000'; ctx.fillText(data.recipient, 200, 370);
    
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
          await navigator.share({ title: 'Lumen Bank - Utility Receipt', text: `Paid $${data.amount} for ${data.recipient}`, files: [file] });
        } catch (e) {}
      } else {
        navigator.share({ title: 'Utility Receipt', text: `Paid $${data.amount} for ${data.recipient}.\nTxID: ${txId}` }).catch(()=>{});
      }
    }, 'image/png');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full bg-white dark:bg-black relative z-50">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6">
        <Icons.Check size={40} />
      </div>
      <h2 className="text-2xl font-bold text-lumen-black dark:text-white mb-2">{t('common.success')}</h2>
      <p className="text-gray-500 mb-8">Your utility payment has been successfully processed.</p>
      
      <div className="w-full bg-gray-50 dark:bg-[#1C1C1E] rounded-3xl p-6 space-y-4 mb-8">
        <div className="flex justify-between text-sm"><span className="text-gray-500">{t('transfers.amount')}</span><span className="font-bold text-lumen-black dark:text-white">${parseFloat(data.amount).toLocaleString()}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">Service</span><span className="font-bold text-lumen-black dark:text-white">{data.recipient}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">{t('history.txId')}</span><span className="font-mono font-bold text-lumen-black dark:text-white">{txId}</span></div>
      </div>

      <div className="w-full space-y-3 mt-auto">
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

export default function Utilities({ onNavigate, showToast }) {
  const { t, addTransaction } = useApp();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const categories = [
    { id: 'phone', icon: 'Phone', color: 'bg-blue-500' },
    { id: 'internet', icon: 'Wifi', color: 'bg-purple-500' },
    { id: 'electricity', icon: 'Zap', color: 'bg-yellow-500' },
    { id: 'water', icon: 'Droplets', color: 'bg-cyan-500' },
    { id: 'housing', icon: 'Home', color: 'bg-orange-500' }
  ];

  const handlePay = () => {
    if (!selectedCategory || !phone || !amount) return;
    setShowOtp(true);
  };

  const verifyOtp = () => {
    setShowOtp(false);
    setIsDone(true);
    showToast(t('common.success'));
    
    addTransaction({
      type: 'outgoing',
      title: t('history.' + selectedCategory),
      description: phone,
      amount: -parseFloat(amount),
      category: selectedCategory,
      status: 'completed'
    });

    // Show receipt instead of navigating away automatically
  };

  if (isDone) {
    return <SuccessReceipt data={{ amount, recipient: t('history.' + selectedCategory) + ' - ' + phone }} onBack={() => onNavigate('/', { replace: true })} t={t} />;
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black">
      <div className="sticky top-0 bg-white/80 dark:bg-black/80 px-5 py-4 flex items-center gap-4 z-20">
        <button onClick={() => onNavigate('/')}><Icons.ArrowLeft size={24} className="text-lumen-black dark:text-white" /></button>
        <h2 className="text-xl font-bold text-lumen-black dark:text-white">{t('utilities_screen.title')}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 pb-32">
        <div className="grid grid-cols-3 gap-3">
          {categories.map(cat => {
            const Icon = Icons[cat.icon];
            const active = selectedCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border-2 ${active ? 'border-lumen-black dark:border-white bg-lumen-black dark:bg-white text-white dark:text-black' : 'border-transparent bg-gray-50 dark:bg-[#1C1C1E] text-gray-500'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? 'bg-white/20' : cat.color + ' text-white'}`}>
                  <Icon size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{t('history.' + cat.id)}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('transfers.recipient')}</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="000-000-0000"
              className="w-full p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl text-sm font-bold text-lumen-black dark:text-white outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('transfers.amount')}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">$</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                className="w-full p-4 pl-10 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl text-2xl font-bold text-lumen-black dark:text-white outline-none" />
            </div>
          </div>
        </div>

        <button onClick={handlePay} disabled={!selectedCategory || !phone || !amount || isDone}
          className="w-full py-5 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-lg shadow-xl disabled:opacity-30 uppercase tracking-widest">
          {isDone ? 'COMPLETED' : t('common.confirm')}
        </button>
      </div>

      <AnimatePresence>
        {showOtp && <OTPModal onVerify={verifyOtp} onClose={() => setShowOtp(false)} t={t} />}
      </AnimatePresence>
    </div>
  );
}
