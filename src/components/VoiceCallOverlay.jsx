import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import pb from '../lib/pb';

const AUDIO_BY_LANG = {
  en: '/lumenbankENG.mp3',
  fr: '/lumenbankFR.mp3',
};

const PhoneIcon = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const EndCallIcon = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
  </svg>
);

const KEYPAD = ['1','2','3','4','5','6','7','8','9','*','0','#'];

const KEY_HINTS = {
  '1': 'Confirm',
  '9': 'Deny',
  '#': 'Support',
};

const VoiceCallOverlay = () => {
  const { lang } = useApp();

  const [phase, setPhase] = useState('idle'); // idle | ringing | active | ended
  const [callRecord, setCallRecord] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [keyPressed, setKeyPressed] = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const clientId = localStorage.getItem('lumen_pb_client_id');

  // Subscribe to bank_call_scenarios via PocketBase realtime
  useEffect(() => {
    if (!clientId) return;
    let unsub;
    (async () => {
      try {
        unsub = await pb.collection('bank_call_scenarios').subscribe('*', (e) => {
          const rec = e.record;
          if (rec.client !== clientId) return;
          if (rec.status === 'ringing' || rec.status === 'active') {
            setCallRecord(rec);
            setPhase('ringing');
          } else if (rec.status === 'ended' || rec.status === 'cancelled') {
            endCall();
          }
        });
      } catch {}
    })();
    return () => { try { unsub?.(); } catch {} };
  }, [clientId]);

  const playAudio = useCallback((url) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
  }, []);

  const acceptCall = () => {
    const audioFile = AUDIO_BY_LANG[lang] || AUDIO_BY_LANG.en;
    setPhase('active');
    setCallDuration(0);
    timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    playAudio(audioFile);
    if (callRecord?.id) {
      pb.collection('bank_call_scenarios').update(callRecord.id, { status: 'active' }).catch(() => {});
    }
  };

  const handleKeyPress = (key) => {
    setKeyPressed(key);
    setTimeout(() => setKeyPressed(null), 300);

    if (callRecord?.id) {
      pb.collection('bank_call_scenarios').update(callRecord.id, {
        key_pressed: key,
        status: key === '9' ? 'denied' : key === '1' ? 'confirmed' : 'active',
      }).catch(() => {});
    }

    if (key === '1' || key === '9') {
      setTimeout(() => endCall(), 800);
    }
  };

  const endCall = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('idle');
    setCallRecord(null);
    setIsPlaying(false);
    setCallDuration(0);
    setKeyPressed(null);
  }, []);

  const formatDuration = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  if (phase === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div key="call-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] bg-[#0A0A0A] flex flex-col items-center justify-between py-16 px-6 safe-top safe-bottom">

        {/* Top — caller info */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center gap-4">
          <motion.div
            animate={phase === 'ringing' ? { scale: [1, 1.08, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="w-24 h-24 rounded-full bg-[#1C1C1E] border-2 border-white/10 flex items-center justify-center">
            <div className="text-white"><PhoneIcon /></div>
          </motion.div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">
              {callRecord?.caller_name || 'LUMEN Bank'}
            </h2>
            <p className="text-gray-400 text-base mt-1">
              {callRecord?.caller_number || '+1 800 586 360'}
            </p>
            {phase === 'ringing' && (
              <p className="text-[#007AFF] text-sm font-medium mt-2">Incoming call...</p>
            )}
            {phase === 'active' && (
              <p className="text-green-400 text-sm font-medium mt-2 font-mono">{formatDuration(callDuration)}</p>
            )}
          </div>
        </motion.div>

        {/* Middle — keypad (active only) */}
        {phase === 'active' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            {isPlaying && (
              <div className="flex items-center justify-center gap-2 mb-6">
                {[0,1,2,3,4].map(i => (
                  <motion.div key={i} className="w-1 bg-white rounded-full"
                    animate={{ height: [8, 24, 8] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }} />
                ))}
              </div>
            )}
            <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
              {KEYPAD.map(k => (
                <motion.button key={k}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => handleKeyPress(k)}
                  className={`h-16 rounded-2xl flex flex-col items-center justify-center transition-colors ${
                    keyPressed === k ? 'bg-white text-black' : 'bg-[#1C1C1E] text-white'
                  }`}>
                  <span className="text-xl font-bold">{k}</span>
                  {KEY_HINTS[k] && (
                    <span className="text-[9px] font-medium mt-0.5 opacity-60">{KEY_HINTS[k]}</span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom — action buttons */}
        <div className="flex items-center justify-center gap-10">
          {phase === 'ringing' && (
            <>
              {/* Decline */}
              <div className="flex flex-col items-center gap-2">
                <motion.button whileTap={{ scale: 0.9 }} onClick={endCall}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                  <EndCallIcon />
                </motion.button>
                <span className="text-xs text-gray-400">Decline</span>
              </div>
              {/* Accept */}
              <div className="flex flex-col items-center gap-2">
                <motion.button whileTap={{ scale: 0.9 }} onClick={acceptCall}
                  className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                  <PhoneIcon />
                </motion.button>
                <span className="text-xs text-gray-400">Accept</span>
              </div>
            </>
          )}
          {phase === 'active' && (
            <div className="flex flex-col items-center gap-2">
              <motion.button whileTap={{ scale: 0.9 }} onClick={endCall}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                <EndCallIcon />
              </motion.button>
              <span className="text-xs text-gray-400">End Call</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceCallOverlay;