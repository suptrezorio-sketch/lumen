import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';
import socket from '../services/socketService';
import { useNavigate } from 'react-router-dom';

export default function Profile({ onNavigate, showToast }) {
  const navigate = useNavigate();
  const {
    t, user, lang, setLang, darkMode, setDarkMode,
    biometric, setBiometric, notifications, setNotifications,
    kycStatus, setKycStatus, amlStatus, setAmlStatus,
    logout, installApp, deferredPrompt
  } = useApp();
  const [view, setView] = useState('main');

  // PIN change state
  const deviceCurrentPin = localStorage.getItem('lumen_current_pin') || '';
  const [changeCurrentPin, setChangeCurrentPin] = useState('');
  const [changeNewPin, setChangeNewPin] = useState('');
  const [changeError, setChangeError] = useState('');
  const pinChangeLockedUntil = Number(localStorage.getItem('lumen_pin_change_locked_until') || '0');
  const isPinChangeLocked = pinChangeLockedUntil > Date.now();

  // Bank phone (local for now)
  const [bankPhone, setBankPhone] = useState(() => localStorage.getItem('lumen_bank_phone') || '');
  const [phoneEditing, setPhoneEditing] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState('');

  const Toggle = ({ value, onChange }) => (
    <button onClick={() => onChange(!value)}
      className={`w-12 h-7 rounded-full transition-colors relative ${value ? 'bg-lumen-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <div className={`w-5 h-5 rounded-full bg-white dark:bg-black absolute top-1 transition-all duration-300 ${value ? 'left-[24px]' : 'left-[4px]'}`} />
    </button>
  );

  const StatusBadge = ({ status }) => {
    const colors = { none: 'bg-gray-200 text-gray-600', pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
    const labels = { none: '—', pending: t('profile.pending'), approved: t('profile.approved'), rejected: t('profile.rejected') };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[status]}`}>{labels[status]}</span>;
  };

  const SettingRow = ({ icon: Icon, label, right, onClick, border = true }) => (
    <div onClick={onClick} className={`w-full flex items-center justify-between p-3.5 cursor-pointer active:bg-gray-50 dark:active:bg-white/5 ${border ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 dark:bg-[#2C2C2E] rounded-lg flex items-center justify-center text-lumen-black dark:text-white"><Icon size={16} /></div>
        <span className="text-sm font-medium text-lumen-black dark:text-white">{label}</span>
      </div>
      {right || <Icons.ChevronRight size={16} className="text-gray-300" />}
    </div>
  );

  const handleChangePin = () => {
    setChangeError('');
    if (changeCurrentPin !== deviceCurrentPin) {
      setChangeError(t('profile.pinMismatch'));
      setTimeout(() => setChangeError(''), 1200);
      return;
    }
    if (!/^\d{6}$/.test(changeNewPin)) {
      setChangeError(t('profile.newPinInvalid'));
      return;
    }
    const pinStateRaw = localStorage.getItem('lumen_accounts_by_pin');
    const pinState = pinStateRaw ? JSON.parse(pinStateRaw) : {};
    const entry = pinState[deviceCurrentPin];
    if (entry) {
      pinState[changeNewPin] = { ...entry };
      delete pinState[deviceCurrentPin];
      localStorage.setItem('lumen_accounts_by_pin', JSON.stringify(pinState));
    }
    localStorage.setItem('lumen_current_pin', changeNewPin);
    setChangeCurrentPin('');
    setChangeNewPin('');
    showToast(t('common.success'));
    setView('main');
  };



  // ─── Security View ────────────────────────────────────────
  if (view === 'security') return (
    <div className="h-full flex flex-col bg-white dark:bg-black">
      <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('main')}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
          <h2 className="text-base font-bold text-lumen-black dark:text-white">Security</h2>
          <div className="w-6" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-5 pb-10">

        {/* Face ID / Biometric */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{t('profile.biometric')}</h4>
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl overflow-hidden">
            <SettingRow icon={Icons.Fingerprint} label={t('profile.biometric')} border={false}
              right={<Toggle value={biometric} onChange={setBiometric} />} />
          </div>
        </div>

        {/* Change PIN */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{t('profile.changePin')}</h4>
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4 space-y-3">
            {isPinChangeLocked && (
              <p className="text-xs text-red-500 font-bold text-center">{t('profile.pinChangeLocked')}</p>
            )}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('profile.currentPin')}</label>
              <input inputMode="numeric" type="password" value={changeCurrentPin}
                onChange={e => setChangeCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={isPinChangeLocked}
                className="w-full p-3.5 bg-white dark:bg-black rounded-xl text-sm border border-gray-200 dark:border-gray-800 outline-none text-lumen-black dark:text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('profile.newPin')}</label>
              <input inputMode="numeric" type="password" value={changeNewPin}
                onChange={e => setChangeNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={isPinChangeLocked}
                placeholder="6 digits"
                className="w-full p-3.5 bg-white dark:bg-black rounded-xl text-sm border border-gray-200 dark:border-gray-800 outline-none text-lumen-black dark:text-white" />
            </div>
            {changeError && <p className="text-red-500 text-xs font-bold text-center">{changeError}</p>}
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleChangePin} disabled={isPinChangeLocked}
              className="w-full py-3.5 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold disabled:opacity-30">
              {t('profile.savePin')}
            </motion.button>
          </div>
        </div>

        {/* Bank Phone Number */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Bank Phone Number</h4>
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4 space-y-3">
            <p className="text-xs text-gray-500">Used for verification and bank communications (Telegram coming soon)</p>
            {phoneEditing ? (
              <div className="space-y-2">
                <input type="tel" value={phoneDraft} onChange={e => setPhoneDraft(e.target.value)} placeholder="+1 (555) 000-0000"
                  className="w-full p-3.5 bg-white dark:bg-black rounded-xl text-sm border border-gray-200 dark:border-gray-800 outline-none text-lumen-black dark:text-white" />
                <div className="flex gap-2">
                  <button onClick={() => { setBankPhone(phoneDraft); localStorage.setItem('lumen_bank_phone', phoneDraft); setPhoneEditing(false); showToast(t('common.success')); }}
                    className="flex-1 py-3 bg-lumen-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm">Save</button>
                  <button onClick={() => setPhoneEditing(false)} className="flex-1 py-3 bg-gray-200 dark:bg-gray-800 text-lumen-black dark:text-white rounded-xl font-bold text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-lumen-black dark:text-white">{bankPhone || 'Not set'}</span>
                <button onClick={() => { setPhoneDraft(bankPhone); setPhoneEditing(true); }}
                  className="text-xs font-bold text-blue-500 hover:text-blue-600">Edit</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Main View ────────────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-28">
      <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
        <h2 className="text-lg font-bold text-lumen-black dark:text-white text-center">{t('profile.title')}</h2>
      </div>

      <div className="p-5 space-y-5">
        {/* Avatar */}
        <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-lumen-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xl font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-lumen-black dark:text-white">{user?.name}</h3>
            <span className="text-xs text-gray-500">{user?.email}</span>
          </div>
        </div>

        {/* Security section */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{t('profile.security')}</h4>
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl overflow-hidden">
            <SettingRow icon={Icons.Shield} label={t('profile.security')} onClick={() => setView('security')} />
            <SettingRow icon={Icons.Bell} label={t('profile.notifications')} border={false}
              right={<Toggle value={notifications} onChange={setNotifications} />} />
          </div>
        </div>

        {/* Verification */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{t('profile.verification')}</h4>
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl overflow-hidden">
            <SettingRow icon={Icons.FileText} label={t('profile.kyc')} onClick={() => navigate('/kyc')}
              right={<div className="flex items-center gap-2"><StatusBadge status={kycStatus} /><Icons.ChevronRight size={14} className="text-gray-300" /></div>} />
            <SettingRow icon={Icons.Shield} label={t('profile.aml')} onClick={() => navigate('/kyc')} border={false}
              right={<div className="flex items-center gap-2"><StatusBadge status={amlStatus} /><Icons.ChevronRight size={14} className="text-gray-300" /></div>} />
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{t('profile.preferences')}</h4>
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl overflow-hidden">
            <SettingRow icon={Icons.Globe} label={t('profile.language')}
              right={
                <div className="flex bg-gray-200 dark:bg-[#2C2C2E] rounded-lg p-0.5">
                  {['en', 'fr'].map(l => (
                    <button key={l} onClick={() => setLang(l)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${lang === l ? 'bg-lumen-black dark:bg-white text-white dark:text-black' : 'text-gray-500'}`}>
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              } />
            <SettingRow icon={Icons.Eye} label={t('profile.darkMode')} right={<Toggle value={darkMode} onChange={setDarkMode} />} border={!deferredPrompt} />
            {deferredPrompt && (
              <SettingRow icon={Icons.Download} label={t('profile.installApp')} onClick={installApp} border={false} />
            )}
          </div>
        </div>

        {/* Sign Out */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={logout}
          className="w-full py-3.5 rounded-2xl border border-red-200 dark:border-red-800 text-red-600 font-semibold flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/10">
          <Icons.LogOut size={17} /> {t('profile.signOut')}
        </motion.button>
      </div>
    </div>
  );
}
