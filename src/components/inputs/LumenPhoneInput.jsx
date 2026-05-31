import React, { useState } from 'react';

const PREFIXES = [
  { code: '+1',   label: 'CA/US' },
  { code: '+44',  label: 'UK' },
  { code: '+49',  label: 'DE' },
  { code: '+33',  label: 'FR' },
  { code: '+7',   label: 'RU' },
  { code: '+380', label: 'UA' },
  { code: '+370', label: 'LT' },
];

function formatPhoneDisplay(digits, prefix) {
  if (prefix === '+1') {
    const d = digits.slice(0, 10);
    const area = d.slice(0, 3);
    const mid  = d.slice(3, 6);
    const end  = d.slice(6, 10);
    if (!d) return '';
    if (d.length <= 3) return `(${area}`;
    if (d.length <= 6) return `(${area}) ${mid}`;
    return `(${area}) ${mid}-${end}`;
  }
  return digits;
}

export default function LumenPhoneInput({ value, onChange, prefix: externalPrefix, onPrefixChange, disabled }) {
  const [prefix, setPrefix] = useState(externalPrefix || '+1');
  const [showPicker, setShowPicker] = useState(false);
  const digits = (value || '').replace(/\D/g, '');
  const maxDigits = prefix === '+1' ? 10 : 12;

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, maxDigits);
    onChange?.(raw);
  };

  const selectPrefix = (p) => {
    setPrefix(p);
    onPrefixChange?.(p);
    setShowPicker(false);
  };

  const e164 = `${prefix}${digits}`;

  return (
    <div className="relative">
      <div className="flex gap-2">
        {/* Prefix selector */}
        <button type="button" onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-1.5 px-4 py-4 bg-[#F9F9F9] dark:bg-[#1C1C1E] rounded-2xl text-[15px] font-medium text-black dark:text-white whitespace-nowrap min-w-[70px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{PREFIXES.find(p => p.code === prefix)?.label || 'INT'}</span>
          <span>{prefix}</span>
        </button>
        {/* Number input */}
        <input type="tel" inputMode="tel"
          value={formatPhoneDisplay(digits, prefix)}
          onChange={handleChange}
          disabled={disabled}
          placeholder={prefix === '+1' ? '(000) 000-0000' : 'Phone number'}
          className="flex-1 p-4 px-5 bg-[#F9F9F9] dark:bg-[#1C1C1E] rounded-2xl text-[15px] font-mono font-bold tracking-wide text-black dark:text-white border-0 outline-none placeholder:font-sans placeholder:font-medium placeholder:text-gray-400 placeholder:tracking-normal disabled:opacity-50" />
      </div>

      {/* E.164 hint */}
      {digits.length >= 7 && (
        <p className="text-[10px] text-gray-400 mt-1 px-1">{e164}</p>
      )}

      {/* Prefix picker dropdown */}
      {showPicker && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-xl z-50 w-44 py-1 border border-gray-100 dark:border-gray-700">
          {PREFIXES.map(p => (
            <button key={p.code} onClick={() => selectPrefix(p.code)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-[#2C2C2E] ${prefix === p.code ? 'font-bold text-lumen-black dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
              <span className="text-xs font-bold w-8">{p.label}</span>
              <span className="ml-auto text-xs text-gray-400">{p.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
