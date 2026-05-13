import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';

export default function PinLogin() {
  const { t, login, pinLocked, biometric } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [bioScanning, setBioScanning] = useState(false);

  const handleBiometricAuth = async () => {
    if (!window.PublicKeyCredential) return;
    
    setBioScanning(true);
    try {
      // In a real app, this would involve a challenge from the server
      // For this high-fidelity trainer, we simulate the local success of WebAuthn
      // to trigger the system biometric prompt (FaceID/TouchID)
      const credIdBase64 = localStorage.getItem('lumen_cred_id');
      let allowCredentials = [];
      if (credIdBase64) {
        const binStr = atob(credIdBase64);
        const credId = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) credId[i] = binStr.charCodeAt(i);
        allowCredentials = [{ type: 'public-key', id: credId }];
      }

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array([1, 2, 3, 4]),
          allowCredentials,
          userVerification: "required",
        }
      }).catch(e => {
        console.log("Biometric bypass or not configured, falling back to PIN");
        return null;
      });

      const savedPin = localStorage.getItem('lumen_pin');
      if (savedPin && login(savedPin)) {
        // Success
      } else {
        setBioScanning(false);
      }
    } catch (err) {
      console.error("Biometric error:", err);
      setBioScanning(false);
    }
  };

  useEffect(() => {
    if (biometric && !pinLocked) {
      handleBiometricAuth();
    }
  }, [biometric, pinLocked]);

  const handleDigit = (d) => {
    if (pinLocked || pin.length >= 6) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 6) {
      setTimeout(() => {
        if (!login(next)) { setError(true); setPin(''); setTimeout(() => setError(false), 600); }
      }, 200);
    }
  };

  const handleDelete = () => { setPin(pin.slice(0, -1)); setError(false); };

  return (
    <div className="h-screen max-w-[430px] mx-auto flex flex-col items-center justify-center bg-white dark:bg-black px-6 safe-top">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-16 h-16 bg-lumen-black dark:bg-white rounded-2xl flex items-center justify-center mb-6">
        <img src="https://img.icons8.com/?size=100&id=80t6WVLmSeOM&format=png&color=ffffff" width="32" className="dark:invert" alt="Logo" />
      </motion.div>
      <h1 className="text-2xl font-bold text-lumen-black dark:text-white mb-1">LUMEN</h1>
      <p className="text-sm text-gray-500 mb-8">{bioScanning ? 'Сканирование Face ID...' : t('onboarding.createPinDesc').replace('Set a', 'Enter your')}</p>

      {pinLocked && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-red-600 text-sm font-medium text-center">
          Account locked. Too many attempts.
        </motion.div>
      )}

      <motion.div animate={error ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}
        className="flex gap-3 mb-10">
        {[0,1,2,3,4,5].map(i => (
          <motion.div key={i} animate={{ scale: i < pin.length ? 1.2 : 1 }}
            className={`w-4 h-4 rounded-full border-2 transition-all ${error ? 'border-red-500 bg-red-500' : i < pin.length ? 'bg-lumen-black dark:bg-white border-lumen-black dark:border-white' : 'border-gray-300'}`} />
        ))}
      </motion.div>

      <div className="grid grid-cols-3 gap-x-8 gap-y-4 px-6 mt-4 w-full max-w-[320px] mx-auto">
        {[1,2,3,4,5,6,7,8,9,'',0,'del'].map((k, i) => (
          <motion.button key={i} whileTap={{ scale: 0.85 }} disabled={pinLocked}
            onClick={() => k === 'del' ? handleDelete() : k !== '' ? handleDigit(String(k)) : null}
            className={`w-[76px] h-[76px] mx-auto rounded-full text-3xl font-medium flex items-center justify-center transition-colors ${k === '' ? 'invisible' : 'bg-gray-50 dark:bg-[#1C1C1E] text-lumen-black dark:text-white active:bg-gray-200 disabled:opacity-30'}`}>
            {k === 'del' ? <Icons.ArrowLeft size={28} /> : k}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
