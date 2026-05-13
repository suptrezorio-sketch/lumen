import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';

const STEPS = ['language', 'register', 'pin', 'confirmPin', 'permissions'];

export default function Onboarding() {
  const { t, setLang, completeOnboarding, bypassOnboarding, lang, registerBiometric } = useApp();
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [selectedLang, setSelectedLang] = useState(lang);
  const [regForm, setRegForm] = useState({ name: '', phone: '', email: '' });

  const handleDigit = (d) => {
    if (STEPS[step] === 'pin' && pin.length < 6) setPin(pin + d);
    if (STEPS[step] === 'confirmPin' && confirmPin.length < 6) setConfirmPin(confirmPin + d);
  };

  const handleDelete = () => {
    if (STEPS[step] === 'pin') setPin(pin.slice(0, -1));
    if (STEPS[step] === 'confirmPin') setConfirmPin(confirmPin.slice(0, -1));
  };

  const nextStep = async () => {
    if (STEPS[step] === 'language') {
      setLang(selectedLang);
      setStep(1);
    } else if (STEPS[step] === 'register') {
      if (regForm.name && regForm.phone) setStep(2);
    } else if (STEPS[step] === 'pin' && pin.length === 6) {
      setStep(3);
    } else if (STEPS[step] === 'confirmPin') {
      if (confirmPin === pin) { setStep(4); setError(''); }
      else { setError(t('onboarding.pinMismatch')); setConfirmPin(''); }
    } else if (STEPS[step] === 'permissions') {
      await registerBiometric();
      completeOnboarding(pin, selectedLang, regForm);
    }
  };

  const PinDots = ({ value }) => (
    <div className="flex gap-3 justify-center my-8">
      {[0,1,2,3,4,5].map(i => (
        <motion.div key={i} animate={{ scale: i < value.length ? 1.2 : 1 }}
          className={`w-4 h-4 rounded-full border-2 transition-all ${i < value.length ? 'bg-lumen-black dark:bg-white border-lumen-black dark:border-white' : 'border-gray-300'}`} />
      ))}
    </div>
  );

  const Keypad = () => (
    <div className="grid grid-cols-3 gap-x-8 gap-y-4 px-6 mt-4 w-full max-w-[320px] mx-auto">
      {[1,2,3,4,5,6,7,8,9,'',0,'del'].map((k, i) => (
        <motion.button key={i} whileTap={{ scale: 0.9 }}
          onClick={() => k === 'del' ? handleDelete() : k !== '' ? handleDigit(String(k)) : null}
          className={`w-[76px] h-[76px] mx-auto rounded-full text-3xl font-medium flex items-center justify-center ${k === '' ? 'invisible' : 'bg-gray-50 dark:bg-[#1C1C1E] text-lumen-black dark:text-white active:bg-gray-200'}`}>
          {k === 'del' ? <Icons.ArrowLeft size={28} /> : k}
        </motion.button>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black safe-top">
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }} className="flex-1 flex flex-col">
          
          {STEPS[step] === 'language' && (
            <div className="flex-1 flex flex-col items-center justify-center px-8">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 bg-lumen-black dark:bg-white rounded-2xl flex items-center justify-center mb-6">
                <img src="https://img.icons8.com/?size=100&id=80t6WVLmSeOM&format=png&color=ffffff" width="32" className="dark:invert" alt="Logo" />
              </motion.div>
              <h1 className="text-3xl font-bold text-lumen-black dark:text-white text-center">{t('onboarding.welcome')}</h1>
              <p className="text-sm text-gray-500 mt-2 text-center">{t('onboarding.subtitle')}</p>
              <div className="w-full mt-10 space-y-3">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('onboarding.selectLanguage')}</p>
                {[{code:'en',label:'English',flag:'🇨🇦'},{code:'fr',label:'Français',flag:'🇫🇷'}].map(l => (
                  <button key={l.code} onClick={() => setSelectedLang(l.code)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 text-left transition-all ${selectedLang === l.code ? 'bg-lumen-black text-white' : 'bg-gray-50 dark:bg-[#1C1C1E] text-lumen-black dark:text-white'}`}>
                    <span className="text-2xl">{l.flag}</span>
                    <span className="font-semibold">{l.label}</span>
                    {selectedLang === l.code && <Icons.Check size={20} className="ml-auto" />}
                  </button>
                ))}
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={nextStep}
                className="w-full mt-8 py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-base">
                {t('onboarding.continue')}
              </motion.button>
              
              <button onClick={() => bypassOnboarding()} className="mt-4 text-xs font-black text-gray-400 uppercase tracking-widest active:text-lumen-black dark:active:text-white">
                {t('common.login') || 'Sign In'}
              </button>
            </div>
          )}

          {STEPS[step] === 'register' && (
            <div className="flex-1 flex flex-col pt-12 px-8">
              <h1 className="text-2xl font-bold text-lumen-black dark:text-white mb-2">{t('register.title')}</h1>
              <p className="text-sm text-gray-500 mb-8">{t('register.subtitle')}</p>
              
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">{t('register.fullName')}</label>
                  <input type="text" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} placeholder="John Doe"
                    className="w-full mt-1 p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl text-[16px] text-lumen-black dark:text-white outline-none" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">{t('register.phone')}</label>
                  <input type="tel" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} placeholder="+1 000 000 0000"
                    className="w-full mt-1 p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl text-[16px] text-lumen-black dark:text-white outline-none" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">{t('register.email')}</label>
                  <input type="email" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} placeholder="john@example.com"
                    className="w-full mt-1 p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl text-[16px] text-lumen-black dark:text-white outline-none" />
                </div>
              </div>
              
              <div className="mt-auto mb-8 w-full flex flex-col gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={nextStep} disabled={!regForm.name || !regForm.phone}
                  className={`w-full py-4 rounded-2xl font-bold ${regForm.name && regForm.phone ? 'bg-lumen-black dark:bg-white text-white dark:text-black' : 'bg-gray-200 dark:bg-[#1C1C1E] text-gray-400'}`}>
                  {t('common.next')}
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => bypassOnboarding()}
                  className="w-full py-4 bg-gray-50 dark:bg-[#1C1C1E] text-lumen-black dark:text-white rounded-2xl font-bold">
                  Already have an account? Log In
                </motion.button>
              </div>
            </div>
          )}

          {STEPS[step] === 'pin' && (
            <div className="flex-1 flex flex-col items-center pt-20 px-6">
              <div className="w-14 h-14 bg-lumen-black dark:bg-white rounded-2xl flex items-center justify-center mb-4">
                <Icons.Lock size={24} className="text-white dark:text-black" />
              </div>
              <h2 className="text-2xl font-bold text-lumen-black dark:text-white">{t('onboarding.createPin')}</h2>
              <p className="text-sm text-gray-500 mt-1">{t('onboarding.createPinDesc')}</p>
              <PinDots value={pin} />
              <Keypad />
              {pin.length === 6 && (
                <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.97 }} onClick={nextStep}
                  className="mt-6 px-10 py-3.5 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold">
                  {t('common.next')}
                </motion.button>
              )}
            </div>
          )}

          {STEPS[step] === 'confirmPin' && (
            <div className="flex-1 flex flex-col items-center pt-20 px-6">
              <div className="w-14 h-14 bg-lumen-black dark:bg-white rounded-2xl flex items-center justify-center mb-4">
                <Icons.Shield size={24} className="text-white dark:text-black" />
              </div>
              <h2 className="text-2xl font-bold text-lumen-black dark:text-white">{t('onboarding.confirmPin')}</h2>
              <p className="text-sm text-gray-500 mt-1">{t('onboarding.confirmPinDesc')}</p>
              {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
              <PinDots value={confirmPin} />
              <Keypad />
              {confirmPin.length === 6 && (
                <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.97 }} onClick={nextStep}
                  className="mt-6 px-10 py-3.5 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold">
                  {t('common.confirm')}
                </motion.button>
              )}
            </div>
          )}

          {STEPS[step] === 'permissions' && (
            <div className="flex-1 flex flex-col items-center justify-center px-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                className="w-24 h-24 bg-gray-50 dark:bg-[#1C1C1E] rounded-[24px] flex items-center justify-center mb-6">
                <Icons.Shield size={48} className="text-lumen-black dark:text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-lumen-black dark:text-white text-center">{t('permissions.title')}</h2>
              <p className="text-sm text-gray-500 mt-2 text-center mb-6">
                {t('permissions.description')}
              </p>
              
              <div className="w-full bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4 space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center"><Icons.Bell size={16}/></div>
                  <div className="text-sm font-medium text-lumen-black dark:text-white">{t('permissions.notifications')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center"><Icons.Eye size={16}/></div>
                  <div className="text-sm font-medium text-lumen-black dark:text-white">{t('permissions.camera')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center"><Icons.Fingerprint size={16}/></div>
                  <div className="text-sm font-medium text-lumen-black dark:text-white">{t('permissions.biometric')}</div>
                </div>
              </div>
              
              <motion.button whileTap={{ scale: 0.97 }} onClick={nextStep}
                className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold">
                {t('permissions.grantAccess')}
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
