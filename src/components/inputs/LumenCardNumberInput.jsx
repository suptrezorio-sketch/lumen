import React, { useState } from 'react';
import { Icons } from '../../assets/Icons';

function luhn(num) {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = parseInt(num[i], 10);
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function detectScheme(digits) {
  if (!digits) return null;
  if (/^4/.test(digits) && [13, 16, 19].includes(digits.length)) return 'Visa';
  if (/^3[47]/.test(digits) && digits.length === 15) return 'Amex';
  if (/^(5[1-5]|2[2-7])/.test(digits) && digits.length === 16) return 'Mastercard';
  if (/^(6011|65|64[4-9])/.test(digits) && [16, 19].includes(digits.length)) return 'Discover';
  if (/^62/.test(digits) && digits.length >= 16 && digits.length <= 19) return 'UnionPay';
  return null;
}

function groupDigits(digits, scheme) {
  if (scheme === 'Amex') {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean).join(' ');
  }
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

const SCHEME_ICONS = {
  Visa:       'VISA',
  Mastercard: 'MC',
  Amex:       'AMEX',
  Discover:   'DISC',
  UnionPay:   'UP',
};

export default function LumenCardNumberInput({ value, onChange, disabled, placeholder = '0000 0000 0000 0000' }) {
  const [focused, setFocused] = useState(false);
  const digits = (value || '').replace(/\D/g, '').slice(0, 19);
  const scheme = detectScheme(digits);
  const maxLen = scheme === 'Amex' ? 15 : 19;
  const isValid = digits.length >= 13 && luhn(digits);
  const hasError = digits.length >= 13 && !luhn(digits);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, maxLen);
    onChange?.(raw);
  };

  return (
    <div className={`relative rounded-2xl transition-all ${focused ? 'ring-2 ring-blue-500/40' : ''} ${hasError ? 'ring-2 ring-red-400/40' : ''}`}>
      <input
        type="text"
        inputMode="numeric"
        value={groupDigits(digits, scheme)}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full p-4 pr-14 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl text-base font-mono font-bold text-lumen-black dark:text-white border-0 outline-none placeholder-gray-300 disabled:opacity-50"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {scheme && (
          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-[#2C2C2E] px-1.5 py-0.5 rounded">
            {SCHEME_ICONS[scheme] || scheme}
          </span>
        )}
        {isValid && <Icons.Check size={16} className="text-green-500" />}
        {hasError && <Icons.X size={16} className="text-red-500" />}
      </div>
      {hasError && (
        <p className="text-xs text-red-500 mt-1 px-1">Invalid card number</p>
      )}
    </div>
  );
}
