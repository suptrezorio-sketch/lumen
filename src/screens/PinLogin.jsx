import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';
import LumenLogo from '../components/LumenLogo';
import pb from '../lib/pb';
import LumenNumericKeyboard from '../components/inputs/LumenNumericKeyboard';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.35, ease: 'easeOut' }
};

const pulseScale = {
  animate: { scale: [1, 1.05, 1] },
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
};

export default function PinLogin() {
  const { t, login, pinLocked, resetPinLock } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [bioScanning, setBioScanning] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [recoverMsg, setRecoverMsg] = useState('');
  const [hasPin, setHasPin] = useState(!!localStorage.getItem('lumen_pin'));

  const handleBiometricAuth = useCallback(async () => {
    if (!window.PublicKeyCredential) return;

    setBioScanning(true);
    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array([1, 2, 3, 4]),
          allowCredentials: [],
          userVerification: 'required',
        }
      }).catch(() => null);

      const savedPin = localStorage.getItem('lumen_pin');
      if (savedPin) {
        const ok = await login(savedPin);
        if (!ok) setBioScanning(false);
      } else {
        setBioScanning(false);
      }
    } catch (err) {
      console.error('Biometric error:', err);
      setBioScanning(false);
    }
  }, [login]);

  useEffect(() => {
    if (!pinLocked && !hasPin) {
      handleBiometricAuth();
    }
  }, [pinLocked, hasPin, handleBiometricAuth]);

  const handleForgotPin = async () => {
    setRecovering(true);
    setRecoverMsg('');
    try {
      const clientId = localStorage.getItem('lumen_pb_client_id');
      if (!clientId) {
        setRecoverMsg('No account linked. Please re-register.');
        setRecovering(false);
        return;
      }
      const res = await fetch(`${pb.baseUrl}/api/collections/clients/records/${clientId}`);
      const data = await res.json();
      const recoveredPin = data?.pin;
      if (recoveredPin) {
        localStorage.setItem('lumen_pin', recoveredPin);
        resetPinLock();
        setRecoverMsg('');
      } else {
        setRecoverMsg('No PIN on server. Ask admin to set it.');
      }
    } catch {
      setRecoverMsg('Could not reach server. Try again.');
    }
    setRecovering(false);
  };

  const handleDigit = (d) => {
    if (pinLocked || pin.length >= 6) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 6) {
      setTimeout(async () => {
        const ok = await login(next);
        if (!ok) {
          setError(true);
          setPin('');
          setTimeout(() => setError(false), 700);
        }
      }, 200);
    }
  };

  const handleDelete = () => { setPin(pin.slice(0, -1)); setError(false); };

  const showFaceId = window.PublicKeyCredential && !pinLocked && !hasPin;

  return (
    <div className="h-screen max-w-[430px] mx-auto flex flex-col items-center justify-center bg-white dark:bg-black safe-top">
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ x: [-8, 8, -8, 8, 0] }}
              transition={{ duration: 0.4 }}
              className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-6"
            >
              <Icons.X size={32} className="text-red-500" />
            </motion.div>
            <p className="text-red-500 font-medium text-center">Incorrect PIN</p>
          </motion.div>
        ) : (
          <motion.div key="pin" {...fadeIn} className="flex flex-col items-center">
            {/* Logo */}
            <div className="mb-8">
              <LumenLogo size={40} className="mx-auto" />
            </div>

            {/* Face ID animation */}
            {showFaceId && (
              <motion.div
                {...pulseScale}
                className="w-20 h-20 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl flex items-center justify-center mb-6"
              >
                <Icons.Fingerprint size={40} className="text-lumen-black dark:text-white" />
              </motion.div>
            )}

            <h2 className="text-2xl font-bold text-lumen-black dark:text-white mb-2">
              {pinLocked ? 'Account Locked' : 'Welcome back'}
            </h2>
            <p className="text-gray-400 mb-10">
              {pinLocked
                ? 'Too many failed attempts'
                : showFaceId
                  ? 'Use Face ID or enter PIN'
                  : 'Enter your PIN to continue'
              }
            </p>

            {/* PIN dots */}
            <motion.div
              animate={error ? { x: [-6, 6, -6, 6, 0] } : {}}
              transition={{ duration: 0.35 }}
              className="flex gap-3 mb-8"
            >
              {[0, 1, 2, 3, 4, 5].map(i => (
                <motion.div
                  key={i}
                  animate={{ scale: i < pin.length ? 1.25 : 1, opacity: i < pin.length ? 1 : 0.2 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`w-3.5 h-3.5 rounded-full ${
                    error && i === pin.length
                      ? 'bg-red-500 border-2 border-red-500'
                      : i < pin.length
                        ? 'bg-lumen-black dark:bg-white'
                        : 'bg-gray-300 dark:bg-white/20'
                  }`}
                />
              ))}
            </motion.div>

            {/* Locked state */}
            {pinLocked && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3 mb-6"
              >
                <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-xl px-5 py-3 text-sm text-gray-500 font-medium text-center">
                  {recoverMsg || 'Please recover your PIN from the server'}
                </div>
                <button
                  onClick={handleForgotPin}
                  disabled={recovering}
                  className="text-sm font-semibold text-lumen-black dark:text-white underline underline-offset-2 disabled:opacity-50"
                >
                  {recovering ? 'Recovering…' : 'Recover PIN'}
                </button>
              </motion.div>
            )}

            {/* Keypad */}
            {!pinLocked && (
              <div className="w-full max-w-[320px] mx-auto mt-2">
                <LumenNumericKeyboard
                  onKeyPress={handleDigit}
                  onDelete={handleDelete}
                  variant={showFaceId ? 'biometric' : 'default'}
                  biometricIcon={<Icons.Fingerprint size={32} />}
                  onBiometric={handleBiometricAuth}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
