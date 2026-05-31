import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';

export default function Profile({ onNavigate, showToast }) {
  const { t, user, lang, setLang, darkMode, setDarkMode, biometric, setBiometric, twoFactor, setTwoFactor, notifications, setNotifications, kycStatus, setKycStatus, amlStatus, setAmlStatus, logout, changePin, installApp, deferredPrompt } = useApp();
  const [view, setView] = useState('main');
  const [kycForm, setKycForm] = useState({ fullName: '', dob: '', address: '', idType: 'passport', idNumber: '' });
  const [amlForm, setAmlForm] = useState({ occupation: '', sourceOfFunds: 'salary', monthlyIncome: '', purposeOfAccount: 'personal' });
  const [pinForm, setPinForm] = useState({ newPin: '', confirmPin: '' });
  const [pinMsg, setPinMsg] = useState('');

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
    <button type="button" onClick={onClick} style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }} className={`w-full flex items-center justify-between p-3.5 bg-transparent text-left active:bg-gray-50 dark:active:bg-white/5 ${border ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 dark:bg-[#2C2C2E] rounded-lg flex items-center justify-center text-lumen-black dark:text-white"><Icon size={16} /></div>
        <span className="text-sm font-medium text-lumen-black dark:text-white">{label}</span>
      </div>
      {right || <Icons.ChevronRight size={16} className="text-gray-300" />}
    </button>
  );

  // Change PIN view
  if (view === 'changePin') {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-black">
        <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
          <div className="flex items-center justify-between">
            <button onClick={() => { setView('main'); setPinMsg(''); setPinForm({ newPin: '', confirmPin: '' }); }}>
              <Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" />
            </button>
            <h2 className="text-base font-bold text-lumen-black dark:text-white">Change PIN</h2>
            <div className="w-6" />
          </div>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-500">Enter a new 4–6 digit PIN for your account.</p>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-2">New PIN</label>
            <input type="password" inputMode="numeric" maxLength={6} value={pinForm.newPin}
              onChange={e => setPinForm(f => ({ ...f, newPin: e.target.value.replace(/\D/g,'') }))}
              className="w-full bg-gray-100 dark:bg-[#1C1C1E] rounded-xl px-4 py-3 text-lumen-black dark:text-white text-lg font-mono tracking-[0.5em] text-center outline-none border-0"
              placeholder="••••" />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-2">Confirm PIN</label>
            <input type="password" inputMode="numeric" maxLength={6} value={pinForm.confirmPin}
              onChange={e => setPinForm(f => ({ ...f, confirmPin: e.target.value.replace(/\D/g,'') }))}
              className="w-full bg-gray-100 dark:bg-[#1C1C1E] rounded-xl px-4 py-3 text-lumen-black dark:text-white text-lg font-mono tracking-[0.5em] text-center outline-none border-0"
              placeholder="••••" />
          </div>
          {pinMsg && <p className={`text-sm font-medium ${pinMsg.startsWith('PIN') ? 'text-green-600' : 'text-red-500'}`}>{pinMsg}</p>}
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={async () => {
              if (pinForm.newPin.length < 4) { setPinMsg('PIN must be at least 4 digits'); return; }
              if (pinForm.newPin !== pinForm.confirmPin) { setPinMsg('PINs do not match'); return; }
              try {
                await changePin(pinForm.newPin);
                setPinMsg('PIN changed successfully');
                setTimeout(() => { setView('main'); setPinMsg(''); setPinForm({ newPin: '', confirmPin: '' }); }, 1500);
              } catch (e) { setPinMsg('Error: ' + (e.message || 'try again')); }
            }}
            className="w-full py-3.5 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm">
            Set New PIN
          </motion.button>
        </div>
      </div>
    );
  }

  // KYC Form View
  if (view === 'kyc') {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-black">
        <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
          <div className="flex items-center justify-between">
            <button onClick={() => setView('main')}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
            <h2 className="text-base font-bold text-lumen-black dark:text-white">{t('profile.kycForm.title')}</h2>
            <div className="w-6" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-4 pb-10">
          {[
            { key: 'fullName', label: t('profile.kycForm.fullName'), type: 'text' },
            { key: 'dob', label: t('profile.kycForm.dob'), type: 'date' },
            { key: 'address', label: t('profile.kycForm.address'), type: 'text' },
            { key: 'idNumber', label: t('profile.kycForm.idNumber'), type: 'text' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{f.label}</label>
              <input type={f.type} value={kycForm[f.key]} onChange={e => setKycForm({ ...kycForm, [f.key]: e.target.value })}
                className="w-full mt-1 p-3.5 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl text-sm text-lumen-black dark:text-white border-0 outline-none" />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('profile.kycForm.idType')}</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {['passport', 'driverLicense', 'nationalId'].map(type => (
                <button key={type} onClick={() => setKycForm({ ...kycForm, idType: type })}
                  className={`py-2.5 rounded-xl text-xs font-semibold ${kycForm.idType === type ? 'bg-lumen-black dark:bg-white text-white dark:text-black' : 'bg-gray-50 dark:bg-[#1C1C1E] text-gray-600 dark:text-gray-400'}`}>
                  {t(`profile.kycForm.${type}`)}
                </button>
              ))}
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => { setKycStatus('pending'); localStorage.setItem('lumen_kyc', 'pending'); setView('main'); showToast(t('common.success')); }}
            disabled={!kycForm.fullName || !kycForm.idNumber}
            className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold disabled:opacity-30">
            {t('profile.kycForm.submit')}
          </motion.button>
        </div>
      </div>
    );
  }

  // AML Form View
  if (view === 'aml') {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-black">
        <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
          <div className="flex items-center justify-between">
            <button onClick={() => setView('main')}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
            <h2 className="text-base font-bold text-lumen-black dark:text-white">{t('profile.amlForm.title')}</h2>
            <div className="w-6" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-4 pb-10">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('profile.amlForm.occupation')}</label>
            <input type="text" value={amlForm.occupation} onChange={e => setAmlForm({ ...amlForm, occupation: e.target.value })}
              className="w-full mt-1 p-3.5 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl text-sm text-lumen-black dark:text-white border-0 outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('profile.amlForm.sourceOfFunds')}</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {['salary', 'business', 'investments', 'other'].map(src => (
                <button key={src} onClick={() => setAmlForm({ ...amlForm, sourceOfFunds: src })}
                  className={`py-2.5 rounded-xl text-xs font-semibold ${amlForm.sourceOfFunds === src ? 'bg-lumen-black dark:bg-white text-white dark:text-black' : 'bg-gray-50 dark:bg-[#1C1C1E] text-gray-600 dark:text-gray-400'}`}>
                  {t(`profile.amlForm.${src}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('profile.amlForm.monthlyIncome')}</label>
            <input type="text" value={amlForm.monthlyIncome} onChange={e => setAmlForm({ ...amlForm, monthlyIncome: e.target.value })} placeholder="$0 - $10,000"
              className="w-full mt-1 p-3.5 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl text-sm text-lumen-black dark:text-white border-0 outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('profile.amlForm.purposeOfAccount')}</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {['personal', 'businessUse', 'savings'].map(p => (
                <button key={p} onClick={() => setAmlForm({ ...amlForm, purposeOfAccount: p })}
                  className={`py-2.5 rounded-xl text-xs font-semibold ${amlForm.purposeOfAccount === p ? 'bg-lumen-black dark:bg-white text-white dark:text-black' : 'bg-gray-50 dark:bg-[#1C1C1E] text-gray-600 dark:text-gray-400'}`}>
                  {t(`profile.amlForm.${p}`)}
                </button>
              ))}
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => { setAmlStatus('pending'); localStorage.setItem('lumen_aml', 'pending'); setView('main'); showToast(t('common.success')); }}
            disabled={!amlForm.occupation}
            className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold disabled:opacity-30">
            {t('profile.amlForm.submit')}
          </motion.button>
        </div>
      </div>
    );
  }

  // Main Settings View
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

        {/* Security */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{t('profile.security')}</h4>
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl overflow-hidden">
            <SettingRow icon={Icons.Fingerprint} label={t('profile.biometric')} right={<Toggle value={biometric} onChange={setBiometric} />} />
            <SettingRow icon={Icons.Shield} label={t('profile.twoFactor')} right={<Toggle value={twoFactor} onChange={setTwoFactor} />} />
            <SettingRow icon={Icons.Bell} label={t('profile.notifications')} right={<Toggle value={notifications} onChange={setNotifications} />} />
            <SettingRow icon={Icons.Lock} label="Change PIN" onClick={() => setView('changePin')} border={false} />
          </div>
        </div>

        {/* Verification */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{t('profile.verification')}</h4>
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl overflow-hidden">
            <SettingRow icon={Icons.Shield} label="Verification & KYC" onClick={() => onNavigate('/verification')}
              right={<Icons.ChevronRight size={14} className="text-gray-300" />} />
            <SettingRow icon={Icons.FileText} label="Settlement Orders" onClick={() => onNavigate('/contracts')}
              right={<Icons.ChevronRight size={14} className="text-gray-300" />} border={false} />
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
            <SettingRow icon={Icons.Eye} label={t('profile.darkMode')} right={<Toggle value={darkMode} onChange={setDarkMode} />} />
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
