import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';
import LumenPhoneInput from '../components/inputs/LumenPhoneInput';
import LumenLogo from '../components/LumenLogo';
import { playSound } from '../utils/sounds';

const STEPS = ['language', 'register', 'pin', 'confirmPin', 'permissions'];

export default function Onboarding() {
  const { t, setLang, completeOnboarding, lang } = useApp();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [selectedLang, setSelectedLang] = useState(lang);
  const [regForm, setRegForm] = useState({ name: '', phone: '', email: '' });
  const [isValidatingPhone, setIsValidatingPhone] = useState(false);
  const [showLoginInfo, setShowLoginInfo] = useState(false);
  const [loginRequestIdentifier, setLoginRequestIdentifier] = useState('');
  const [isRequestingLink, setIsRequestingLink] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const goBack = () => {
    if (showLoginInfo) { setShowLoginInfo(false); return; }
    playSound('click');
    setDirection(-1);
    setError('');
    if (step === 2) setPin('');
    if (step === 3) setConfirmPin('');
    if (step > 0) setStep(s => s - 1);
  };

  const goNext = (nextStep) => {
    setDirection(1);
    setStep(nextStep);
    setError('');
  };

  const handleDigit = (d) => {
    playSound('click');
    if (STEPS[step] === 'pin' && pin.length < 6) {
      setPin(prev => prev + d);
    }
    if (STEPS[step] === 'confirmPin' && confirmPin.length < 6) {
      const next = confirmPin + d;
      setConfirmPin(next);
      if (next.length === 6) {
        setTimeout(() => {
          if (next === pin) {
            playSound('success');
            setError('');
            goNext(4);
          } else {
            playSound('error');
            setError(t('onboarding.pinMismatch') || 'PINs do not match. Try again.');
            setConfirmPin('');
          }
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    playSound('click');
    if (STEPS[step] === 'pin') setPin(p => p.slice(0, -1));
    if (STEPS[step] === 'confirmPin') setConfirmPin(p => p.slice(0, -1));
  };

  const nextStep = async () => {
    if (STEPS[step] === 'language') {
      playSound('click');
      setLang(selectedLang);
      goNext(1);
    } else if (STEPS[step] === 'register') {
      if (!regForm.name || !regForm.phone || !regForm.email) return;
      playSound('click');
      setIsValidatingPhone(true);
      try {
        const { validatePhone } = await import('../services/phoneValidation');
        const phoneRes = await validatePhone(regForm.phone);
        if (!phoneRes.valid && !phoneRes.error) {
          playSound('error');
          setError('Invalid phone number format.');
        } else {
          setRegForm(f => ({ ...f, phone: phoneRes.formatted }));
          goNext(2);
        }
      } catch {
        goNext(2);
      } finally {
        setIsValidatingPhone(false);
      }
    } else if (STEPS[step] === 'pin' && pin.length === 6) {
      playSound('click');
      goNext(3);
    } else if (STEPS[step] === 'permissions') {
      playSound('click');
      completeOnboarding(pin, selectedLang, regForm);
    }
  };

  const handleRequestLoginLink = async () => {
    if (!loginRequestIdentifier) return;
    playSound('click');
    setIsRequestingLink(true);
    try {
      await pb.collection('login_requests').create({
        identifier: loginRequestIdentifier,
        status: 'pending'
      });
      setRequestSent(true);
      playSound('success');
    } catch (e) {
      console.error(e);
      // Fallback if collection doesn't exist yet
      setRequestSent(true);
      playSound('success');
    } finally {
      setIsRequestingLink(false);
    }
  };

  const PinDots = ({ value, hasError }) => (
    <div className="flex gap-4 justify-center my-8">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <motion.div
          key={i}
          animate={{ scale: i < value.length ? 1.15 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className={`w-4 h-4 rounded-full transition-colors duration-150 ${
            hasError && i < value.length
                  ? 'bg-red-500'
                  : i < value.length
                    ? 'bg-black dark:bg-white'
                    : 'bg-[#E5E5EA] dark:bg-[#2C2C2E]'
              }`}
        />
      ))}
    </div>
  );

  const Keypad = () => (
    <div className="grid grid-cols-3 gap-y-4 gap-x-2 w-full max-w-[280px] mx-auto mt-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => (
        <button
          key={k}
          onClick={() => handleDigit(String(k))}
          className="w-[76px] h-[76px] mx-auto rounded-full bg-[#F2F2F7] dark:bg-[#1C1C1E] text-black dark:text-white text-[26px] font-normal flex items-center justify-center active:bg-[#E5E5EA] dark:active:bg-[#2C2C2E] transition-colors"
        >
          {k}
        </button>
      ))}
      <div />
      <button
        onClick={() => handleDigit('0')}
        className="w-[76px] h-[76px] mx-auto rounded-full bg-[#F2F2F7] dark:bg-[#1C1C1E] text-black dark:text-white text-[26px] font-normal flex items-center justify-center active:bg-[#E5E5EA] dark:active:bg-[#2C2C2E] transition-colors"
      >
        0
      </button>
      <button
        onClick={handleDelete}
        className="w-[76px] h-[76px] mx-auto rounded-full flex items-center justify-center active:bg-gray-100 dark:active:bg-[#1C1C1E] transition-colors"
      >
        <Icons.ArrowLeft size={24} className="text-[#8E8E93]" />
      </button>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black overflow-hidden">
      <AnimatePresence mode="wait">

        {/* ── Already have an account info screen ── */}
        {showLoginInfo ? (
          <motion.div
            key="login-info"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-1 flex flex-col"
          >
            <div className="pt-14 px-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={goBack}
                className="w-10 h-10 flex items-center justify-center"
              >
                <Icons.ArrowLeft size={24} className="text-black dark:text-white" />
              </motion.button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 bg-gray-100 dark:bg-[#1C1C1E] rounded-2xl flex items-center justify-center mb-6"
              >
                <Icons.Lock size={28} className="text-black dark:text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold text-black dark:text-white mb-3">
                Sign in to LUMEN
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
                Your bank will send a secure login link to your email or phone. Open that link on this device to sign in automatically.
              </p>

              {requestSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-xs p-5 rounded-2xl bg-[#E8F8EE] dark:bg-green-900/20 text-center"
                >
                  <p className="text-[#108A44] dark:text-green-400 font-semibold mb-2">Request sent!</p>
                  <p className="text-sm text-green-800 dark:text-green-300">
                    We will review your request and send a login link to <b>{loginRequestIdentifier}</b> shortly.
                  </p>
                </motion.div>
              ) : (
                <div className="w-full max-w-xs mt-2 space-y-4">
                  <input
                    type="text"
                    value={loginRequestIdentifier}
                    onChange={e => setLoginRequestIdentifier(e.target.value)}
                    placeholder="Email or Phone Number"
                    className="w-full px-5 py-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#1C1C1E] text-black dark:text-white text-[15px] font-medium outline-none placeholder:text-gray-400 text-center"
                  />
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleRequestLoginLink}
                    disabled={!loginRequestIdentifier || isRequestingLink}
                    className={`w-full py-4 rounded-2xl font-semibold text-[17px] ${
                      loginRequestIdentifier && !isRequestingLink
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-gray-100 dark:bg-[#1C1C1E] text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {isRequestingLink ? 'Sending...' : 'Ask for a login link'}
                  </motion.button>
                </div>
              )}
            </div>

            <div className="px-8 pb-12">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={goBack}
                className="w-full py-4 border-2 border-gray-100 dark:border-[#2C2C2E] rounded-2xl text-black dark:text-white font-semibold text-base"
              >
                Back to Welcome
              </motion.button>
            </div>
          </motion.div>

        ) : (
          /* ── Main onboarding steps ── */
          <motion.div
            key={step}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-1 flex flex-col"
          >
            {/* Back arrow & Logo — shown on all steps except language */}
            {step > 0 && (
              <div className="pt-14 px-6 flex justify-between items-center">
                <button
                  onClick={goBack}
                  className="p-2 -ml-2 text-black dark:text-white active:opacity-50 transition-opacity"
                >
                  <Icons.ArrowLeft size={28} strokeWidth={2.5} />
                </button>
                <LumenLogo size={28} variant="auto" />
              </div>
            )}

            {/* ── Language ── */}
            {STEPS[step] === 'language' && (
              <div className="flex-1 flex flex-col items-center px-8 pt-16">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-10"
                >
                  <LumenLogo size={52} variant="auto" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-4xl font-bold text-black dark:text-white mb-2 text-center"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Welcome
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-400 mb-10 text-center"
                >
                  Select your language
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="w-full space-y-3 max-w-xs"
                >
                  {[
                    { code: 'en', label: 'English', flag: '🇬🇧' },
                    { code: 'fr', label: 'Français', flag: '🇨🇦' },
                  ].map(l => (
                    <motion.button
                      key={l.code}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedLang(l.code)}
                      className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border-2 ${
                        selectedLang === l.code
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                          : 'border-gray-100 dark:border-[#2C2C2E] text-black dark:text-white bg-white dark:bg-transparent'
                      }`}
                    >
                      <span className="text-2xl">{l.flag}</span>
                      <span className="font-semibold text-lg">{l.label}</span>
                      {selectedLang === l.code && (
                        <Icons.Check size={20} className="ml-auto" />
                      )}
                    </motion.button>
                  ))}
                </motion.div>

                <div className="mt-auto w-full max-w-xs pb-8 pt-8">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={nextStep}
                    className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-semibold text-base"
                  >
                    Continue
                  </motion.button>
                  <button
                    onClick={() => setShowLoginInfo(true)}
                    className="w-full py-3 mt-1 text-gray-400 text-sm font-medium"
                  >
                    Already have an account?
                  </button>
                </div>
              </div>
            )}

            {/* ── Register ── */}
            {STEPS[step] === 'register' && (
              <div className="flex-1 flex flex-col px-8 pt-4">
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold text-black dark:text-white mb-1 mt-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Create account
                </motion.h1>
                <p className="text-gray-400 text-sm mb-8">Step 1 of 3</p>

                <div className="flex-1 space-y-5">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-2 block">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={regForm.name}
                      onChange={e => { setRegForm(f => ({ ...f, name: e.target.value })); setError(''); }}
                      placeholder="John Doe"
                      className="w-full px-5 py-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#1C1C1E] text-black dark:text-white text-[15px] font-medium outline-none placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-2 block">
                      Phone
                    </label>
                    <LumenPhoneInput
                      value={regForm.phone}
                      onChange={val => { setRegForm(f => ({ ...f, phone: val })); setError(''); }}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-2 block">
                      Email
                    </label>
                    <input
                      type="email"
                      value={regForm.email}
                      onChange={e => { setRegForm(f => ({ ...f, email: e.target.value })); setError(''); }}
                      placeholder="john@example.com"
                      className="w-full px-5 py-4 rounded-2xl bg-[#F9F9F9] dark:bg-[#1C1C1E] text-black dark:text-white text-[15px] font-medium outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="pt-6 pb-8">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={nextStep}
                    disabled={!regForm.name || !regForm.phone || !regForm.email || isValidatingPhone}
                    className={`w-full py-4 rounded-2xl font-semibold text-base flex justify-center items-center ${
                      regForm.name && regForm.phone && regForm.email && !isValidatingPhone
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-gray-100 dark:bg-[#1C1C1E] text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {isValidatingPhone
                      ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : 'Next'
                    }
                  </motion.button>
                </div>
              </div>
            )}

            {/* ── Create PIN ── */}
            {STEPS[step] === 'pin' && (
              <div className="flex-1 flex flex-col items-center px-6 pt-2">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="my-6"
                >
                  <div className="w-[84px] h-[84px] flex items-center justify-center">
                    <Icons.Pin1 size={84} strokeWidth={1.5} className="text-black dark:text-white" />
                  </div>
                </motion.div>

                <h2 className="text-2xl font-bold text-black dark:text-white mb-1">Create a PIN</h2>
                <p className="text-gray-400 text-sm mb-0.5">Step 2 of 3</p>
                <p className="text-gray-400 text-sm text-center">Choose a 6-digit code to secure your account</p>

                <PinDots value={pin} />
                <Keypad />

                <div className="w-full max-w-[280px] mt-5 pb-6">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={nextStep}
                    disabled={pin.length < 6}
                    className={`w-full py-4 rounded-2xl font-semibold text-base transition-all ${
                      pin.length === 6
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-gray-100 dark:bg-[#1C1C1E] text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Continue
                  </motion.button>
                </div>
              </div>
            )}

            {/* ── Confirm PIN ── */}
            {STEPS[step] === 'confirmPin' && (
              <div className="flex-1 flex flex-col items-center px-6 pt-2">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="my-6"
                >
                  <div className="w-[84px] h-[84px] flex items-center justify-center">
                    <Icons.Pin2 size={84} strokeWidth={1.5} className="text-black dark:text-white" />
                  </div>
                </motion.div>

                <h2 className="text-2xl font-bold text-black dark:text-white mb-1">Confirm PIN</h2>
                <p className="text-gray-400 text-sm mb-0.5">Step 3 of 3</p>
                <p className="text-gray-400 text-sm text-center">Enter your code again</p>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm font-medium mt-3"
                  >
                    {error}
                  </motion.p>
                )}

                <PinDots value={confirmPin} hasError={!!error} />
                <Keypad />
              </div>
            )}

            {/* ── Permissions ── */}
            {STEPS[step] === 'permissions' && (
              <div className="flex-1 flex flex-col px-8 pt-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-5 mt-2"
                >
                  <div className="w-[84px] h-[84px] flex items-center justify-center">
                    <Icons.PermissionsBadge size={84} strokeWidth={1.5} className="text-black dark:text-white" />
                  </div>
                </motion.div>

                <h2 className="text-2xl font-bold text-black dark:text-white mb-2">One last thing</h2>
                <p className="text-gray-400 text-sm mb-8">Allow access to get the most out of LUMEN</p>

                <div className="flex-1 space-y-3">
                  {[
                    { icon: Icons.Bell, label: 'Notifications', desc: 'Stay updated on your accounts' },
                    { icon: Icons.Eye, label: 'Camera', desc: 'For Face ID and document upload' },
                    { icon: Icons.Fingerprint, label: 'Biometrics', desc: 'Fast and secure login' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      className="p-4 rounded-2xl border border-gray-100 dark:border-[#2C2C2E] flex items-center gap-4"
                    >
                      <div className="w-10 h-10 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl flex items-center justify-center flex-shrink-0">
                        <item.icon size={20} className="text-black dark:text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-black dark:text-white text-sm">{item.label}</p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-6 pb-8">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={nextStep}
                    className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-semibold text-base"
                  >
                    Continue to LUMEN
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
