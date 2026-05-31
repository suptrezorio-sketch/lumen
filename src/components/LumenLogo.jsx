import React from 'react';

/**
 * Единый логотип LUMEN.
 * - variant="dark"  → белый кленовый лист + белый LUMEN  (на тёмном фоне)
 * - variant="light" → чёрный кленовый лист + чёрный LUMEN (на светлом фоне)
 * - variant="auto"  → переключается автоматически через dark: класс (default)
 * - size: высота логотипа в px (default 28)
 * - textSize: Tailwind класс для размера текста (default "text-xl")
 */
export default function LumenLogo({ variant = 'auto', size = 28, textSize = 'text-xl', className = '' }) {
  if (variant === 'dark') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img src="/logo-light.png" style={{ height: size }} alt="LUMEN" />
        <span style={{ fontSize: size * 0.75, lineHeight: 1 }} className="font-black tracking-tight text-white select-none">LUMEN</span>
      </div>
    );
  }
  if (variant === 'light') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img src="/logo-dark.png" style={{ height: size }} alt="LUMEN" />
        <span style={{ fontSize: size * 0.75, lineHeight: 1 }} className="font-black tracking-tight text-black select-none">LUMEN</span>
      </div>
    );
  }
  // auto — dark mode aware
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src="/logo-dark.png"  style={{ height: size }} alt="LUMEN" className="dark:hidden" />
      <img src="/logo-light.png" style={{ height: size }} alt="LUMEN" className="hidden dark:block" />
      <span style={{ fontSize: size * 0.75, lineHeight: 1 }} className="font-black tracking-tight text-black dark:text-white select-none">LUMEN</span>
    </div>
  );
}
