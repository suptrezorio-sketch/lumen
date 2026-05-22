import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';

export default function Chat({ onNavigate }) {
  const { t } = useApp();
  const [messages, setMessages] = useState([{ id: 1, text: t('chat.welcome'), sender: 'agent', time: '10:30' }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState('alpha');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, showKeyboard]);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
    const userId = localStorage.getItem('lumen_user_id');
    if (userId) {
      fetch(`${backendUrl}/api/chat?userId=${userId}`)
        .then((r) => r.ok ? r.json() : [])
        .then((rows) => {
          if (Array.isArray(rows) && rows.length) {
            setMessages(rows.map((m, i) => ({
              id: m._id || i,
              text: m.text,
              sender: m.isAdmin ? 'agent' : 'user',
              time: new Date(m.createdAt || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            })));
          }
        })
        .catch(() => {});
    }

    const onChat = (e) => {
      const msg = e.detail;
      setMessages((p) => [...p, {
        id: Date.now() + Math.random(),
        text: msg.text,
        sender: msg.sender || 'agent',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }]);
    };
    window.addEventListener('LUMEN_CHAT_MESSAGE', onChat);
    return () => window.removeEventListener('LUMEN_CHAT_MESSAGE', onChat);
  }, []);

  const quickReplies = [t('chat.quickBalance'), t('chat.quickCards'), t('chat.quickTransfer'), t('chat.quickOther')];

  const sendMsg = (text) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setMessages(p => [...p, { id: Date.now(), text, sender: 'user', time: now }]);
    setInput('');
    setShowKeyboard(false);
    
    // Send to backend via socket
    import('../services/socketService').then(({ default: socket }) => {
      const userId = localStorage.getItem('lumen_user_id') || 'guest';
      socket.emit('chatMessage', { text, sender: 'user', userId });
      fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, senderId: userId, userId }),
      }).catch(() => {});
    });
  };

  const handleKey = (key) => {
    if (key === 'del') setInput(p => p.slice(0, -1));
    else if (key === 'space') setInput(p => p + ' ');
    else if (key === 'enter') sendMsg(input);
    else if (key === 'shift') setKeyboardMode(p => p === 'alpha' ? 'alphaUpper' : 'alpha');
    else if (key === '123') setKeyboardMode('num');
    else if (key === 'ABC') setKeyboardMode('alpha');
    else if (key === '#+=') setKeyboardMode('sym');
    else setInput(p => p + key);
  };

  const renderKeyboard = () => {
    let rows = [];
    if (keyboardMode === 'alpha' || keyboardMode === 'alphaUpper') {
      const isUp = keyboardMode === 'alphaUpper';
      rows = [
        ['q','w','e','r','t','y','u','i','o','p'].map(k => isUp ? k.toUpperCase() : k),
        ['a','s','d','f','g','h','j','k','l'].map(k => isUp ? k.toUpperCase() : k),
        ['shift', ...['z','x','c','v','b','n','m'].map(k => isUp ? k.toUpperCase() : k), 'del'],
        ['123', 'space', 'enter']
      ];
    } else if (keyboardMode === 'num') {
      rows = [
        ['1','2','3','4','5','6','7','8','9','0'],
        ['-','/',':',';','(',')','$','&','@','"'],
        ['#+=', '.', ',', '?', '!', "'", 'del'],
        ['ABC', 'space', 'enter']
      ];
    } else if (keyboardMode === 'sym') {
      rows = [
        ['[',']','{','}','#','%','^','*','+','='],
        ['_','\\','|','~','<','>','$','£','¥','€'],
        ['123', '.', ',', '?', '!', "'", 'del'],
        ['ABC', 'space', 'enter']
      ];
    }

    return (
      <motion.div initial={{ y: 250 }} animate={{ y: 0 }} exit={{ y: 250 }} className="bg-gray-200 dark:bg-[#1C1C1E] p-2 safe-bottom border-t border-gray-300 dark:border-gray-800 flex-shrink-0">
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <div key={i} className={`flex justify-center gap-1.5 ${i === 1 ? 'px-4' : ''}`}>
              {row.map((k, j) => {
                let w = 'flex-1';
                if (k === 'space') w = 'w-[50%] flex-none';
                if (['shift', 'del', '123', 'ABC', '#+=', 'enter'].includes(k)) w = 'px-3 flex-none bg-gray-300 dark:bg-gray-600';
                
                return (
                  <motion.button key={`${k}-${j}`} whileTap={{ scale: 0.9 }} onClick={() => handleKey(k)}
                    className={`h-11 rounded-lg text-[17px] font-normal flex items-center justify-center text-black dark:text-white ${w} ${!['shift','del','123','ABC','#+=','enter'].includes(k) ? 'bg-white dark:bg-[#2C2C2E] shadow-sm' : ''}`}>
                    {k === 'del' ? <Icons.ArrowLeft size={20}/> : 
                     k === 'shift' ? '⇧' : 
                     k === 'space' ? 'Space' : 
                     k === 'enter' ? <Icons.Send size={18}/> : k}
                  </motion.button>
                )
              })}
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black">
      <div className="sticky top-0 bg-white/90 dark:bg-black/90 border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30 safe-top">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate('/')}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-lumen-black/10 dark:bg-white/10 rounded-xl flex items-center justify-center">
              <Icons.Chat size={18} className="text-lumen-black dark:text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-lumen-black dark:text-white">{t('chat.title')}</h2>
              <span className="text-[10px] text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {t('chat.online')}
              </span>
            </div>
          </div>
          <div className="w-9" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {messages.map(msg => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${msg.sender === 'user' ? 'bg-lumen-black text-white rounded-br-sm' : 'bg-gray-100 dark:bg-[#1C1C1E] text-lumen-black dark:text-white rounded-bl-sm'}`}>
              <p className="text-sm">{msg.text}</p>
              <span className="text-[9px] opacity-50 mt-1 block text-right">{msg.time}</span>
            </div>
          </motion.div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-[#1C1C1E] px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
              {[0,1,2].map(i => (
                <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                  className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick Replies */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {quickReplies.map((q, i) => (
            <button key={i} onClick={() => sendMsg(q)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-[#1C1C1E] rounded-full text-xs font-medium text-lumen-black dark:text-white whitespace-nowrap">
              {q}
            </button>
          ))}
        </div>
      )}

      <div className={`p-4 bg-white/90 dark:bg-black/90 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 ${showKeyboard ? '' : 'safe-bottom'}`}>
        <div className="flex gap-2">
          <div onClick={() => setShowKeyboard(true)}
            className="flex-1 bg-gray-100 dark:bg-[#1C1C1E] rounded-xl px-4 py-3 text-sm text-lumen-black dark:text-white flex items-center overflow-hidden whitespace-nowrap">
            {input || <span className="text-gray-400">{t('chat.placeholder')}</span>}
          </div>
          {showKeyboard && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowKeyboard(false)}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors bg-gray-100 dark:bg-[#1C1C1E] text-gray-400">
              <Icons.ChevronDown size={20} />
            </motion.button>
          )}
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => sendMsg(input)}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${input.trim() ? 'bg-lumen-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-[#1C1C1E] text-gray-300'}`}>
            <Icons.Send size={17} />
          </motion.button>
        </div>
      </div>
      {showKeyboard && renderKeyboard()}
    </div>
  );
}