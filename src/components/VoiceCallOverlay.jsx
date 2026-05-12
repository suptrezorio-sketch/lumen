import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useOrchestratorStore from '../store/orchestratorStore';
import socket from '../services/socketService';

// DTMF frequencies for each key
const DTMF_FREQUENCIES = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
};

// AudioContext for DTMF tones
class DTMFGenerator {
  constructor() {
    this.audioContext = null;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  playTone(key, duration = 0.2) {
    const ctx = this.init();
    const frequencies = DTMF_FREQUENCIES[key];
    if (!frequencies) return;

    const [f1, f2] = frequencies;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.frequency.value = f1;
    osc2.frequency.value = f2;
    osc1.type = 'sine';
    osc2.type = 'sine';

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + duration);
    osc2.stop(ctx.currentTime + duration);
  }
}

const dtmfGenerator = new DTMFGenerator();

// Audio files for call scenarios (place in public/audio/)
const AUDIO_FILES = {
  intro: '/audio/call-intro.mp3',
  verification: '/audio/call-verification.mp3',
  success: '/audio/call-success.mp3',
  failed: '/audio/call-failed.mp3',
};

const VoiceCallOverlay = () => {
  const callState = useOrchestratorStore(state => state.callState);
  const setCallState = useOrchestratorStore(state => state.setCallState);
  
  const [isActive, setIsActive] = useState(false);
  const [callData, setCallData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showKeypad, setShowKeypad] = useState(false);
  const [inputDigits, setInputDigits] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);

  // Listen for TRIGGER_CALL socket event
  useEffect(() => {
    socket.on('TRIGGER_CALL', (data) => {
      console.log('TRIGGER_CALL received:', data);
      setCallData(data);
      setIsActive(true);
      setCurrentStep(0);
      setInputDigits('');
      setShowKeypad(false);
      setCallState(data);
      
      startCallSequence(data);
    });

    return () => {
      socket.off('TRIGGER_CALL');
    };
  }, [setCallState]);

  const startCallSequence = async (data) => {
    await playAudio(AUDIO_FILES.intro);
    setShowKeypad(true);
  };

  const playAudio = useCallback(async (audioUrl) => {
    return new Promise((resolve) => {
      setIsPlaying(true);
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        resolve();
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        setTimeout(resolve, 2000);
      };
      
      audio.play().catch(() => {
        setIsPlaying(false);
        setTimeout(resolve, 2000);
      });
    });
  }, []);

  const handleKeyPress = (digit) => {
    dtmfGenerator.playTone(digit);
    
    const newDigits = inputDigits + digit;
    setInputDigits(newDigits);
    
    socket.emit('DTMF_INPUT', {
      digit,
      fullInput: newDigits,
      callId: callData?.callId,
    });
    
    if (newDigits.length >= 4) {
      socket.emit('VERIFY_CODE', {
        code: newDigits,
        callId: callData?.callId,
      });
    }
  };

  const handleEndCall = () => {
    setIsActive(false);
    setCallData(null);
    setCurrentStep(0);
    setInputDigits('');
    setShowKeypad(false);
    setCallState(null);
    
    socket.emit('CALL_ENDED', { callId: callData?.callId });
  };

  useEffect(() => {
    socket.on('CALL_STEP', (data) => {
      setCurrentStep(data.step);
      if (data.audio) playAudio(data.audio);
      if (data.showKeypad !== undefined) setShowKeypad(data.showKeypad);
    });

    socket.on('CALL_VERIFICATION_SUCCESS', () => {
      playAudio(AUDIO_FILES.success);
      setTimeout(handleEndCall, 2000);
    });

    socket.on('CALL_VERIFICATION_FAILED', () => {
      playAudio(AUDIO_FILES.failed);
      setInputDigits('');
    });

    return () => {
      socket.off('CALL_STEP');
      socket.off('CALL_VERIFICATION_SUCCESS');
      socket.off('CALL_VERIFICATION_FAILED');
    };
  }, [playAudio]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] bg-gradient-to-b from-blue-900 to-black flex flex-col items-center justify-center"
      >
        {/* Caller Info */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {callData?.callerName || 'Security Department'}
          </h2>
          <p className="text-blue-300 text-lg">
            {callData?.callerNumber || '+1 800-SECURITY'}
          </p>
        </motion.div>

        {/* Call Status */}
        <div className="mb-8">
          {isPlaying && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex items-center gap-2 text-blue-300"
            >
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span>Playing...</span>
            </motion.div>
          )}
        </div>

        {/* Input Display */}
        {showKeypad && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <div className="bg-black/30 rounded-xl px-8 py-4 text-center">
              <p className="text-gray-400 text-sm mb-2">Enter verification code</p>
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 ${
                      inputDigits.length > i ? 'bg-green-500 border-green-500' : 'border-gray-500'
                    }`}
                  />
                ))}
              </div>
              <p className="text-white text-lg mt-2 font-mono">{inputDigits}</p>
            </div>
          </motion.div>
        )}

        {/* DTMF Keypad */}
        {showKeypad && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="grid grid-cols-3 gap-3"
          >
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKeyPress(key)}
                className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl font-bold flex items-center justify-center transition-colors"
              >
                {key}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* End Call Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleEndCall}
          className="absolute bottom-8 w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
          </svg>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceCallOverlay;