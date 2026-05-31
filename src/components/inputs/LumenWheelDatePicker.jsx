import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const ITEM_H = 44;
const VISIBLE = 5;

function WheelColumn({ items, selected, onSelect }) {
  const listRef = useRef(null);
  const idx = items.indexOf(selected);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = idx * ITEM_H;
    }
  }, [idx]);

  const handleScroll = () => {
    if (!listRef.current) return;
    const nearest = Math.round(listRef.current.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(nearest, items.length - 1));
    if (items[clamped] !== selected) onSelect(items[clamped]);
  };

  return (
    <div className="flex-1 relative overflow-hidden" style={{ height: ITEM_H * VISIBLE }}>
      {/* Selection highlight */}
      <div className="absolute left-0 right-0 pointer-events-none z-10"
        style={{ top: ITEM_H * 2, height: ITEM_H, background: 'rgba(0,0,0,0.06)', borderRadius: 8 }} />
      <div ref={listRef} onScroll={handleScroll}
        className="h-full overflow-y-scroll scrollbar-hide snap-y snap-mandatory"
        style={{ paddingTop: ITEM_H * 2, paddingBottom: ITEM_H * 2 }}>
        {items.map(item => (
          <div key={item} onClick={() => onSelect(item)}
            className={`flex items-center justify-center cursor-pointer snap-center transition-all select-none`}
            style={{ height: ITEM_H }}>
            <span className={`text-sm font-semibold transition-all ${item === selected ? 'text-lumen-black dark:text-white text-base' : 'text-gray-300 dark:text-gray-600'}`}>
              {typeof item === 'number' && item < 10 ? String(item).padStart(2, '0') : item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LumenWheelDatePicker({ value, onChange, minYear, maxYear, label }) {
  const now = new Date();
  const parsed = value ? new Date(value) : null;

  const [day,   setDay]   = useState(parsed ? parsed.getDate()          : now.getDate());
  const [month, setMonth] = useState(parsed ? parsed.getMonth() + 1     : now.getMonth() + 1);
  const [year,  setYear]  = useState(parsed ? parsed.getFullYear()       : now.getFullYear());

  const minY = minYear ?? 1920;
  const maxY = maxYear ?? now.getFullYear();

  const daysInMonth = new Date(year, month, 0).getDate();
  const days   = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years  = Array.from({ length: maxY - minY + 1 }, (_, i) => maxY - i);

  const safeDay = Math.min(day, daysInMonth);

  useEffect(() => {
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
    onChange?.(iso);
  }, [safeDay, month, year]);

  return (
    <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl overflow-hidden">
      {label && <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-4 pt-3">{label}</p>}
      <div className="flex items-center px-4 py-2">
        <WheelColumn items={days}   selected={safeDay} onSelect={setDay}   />
        <div className="w-px h-10 bg-gray-200 dark:bg-gray-700 mx-1" />
        <WheelColumn items={months} selected={month}   onSelect={setMonth} />
        <div className="w-px h-10 bg-gray-200 dark:bg-gray-700 mx-1" />
        <WheelColumn items={years}  selected={year}    onSelect={setYear}  />
      </div>
      <div className="flex justify-between px-5 pb-2">
        <span className="text-[10px] text-gray-400">Day</span>
        <span className="text-[10px] text-gray-400">Month</span>
        <span className="text-[10px] text-gray-400">Year</span>
      </div>
    </div>
  );
}
