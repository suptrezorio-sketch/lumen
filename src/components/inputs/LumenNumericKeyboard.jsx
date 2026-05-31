import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../../assets/Icons';

export default function LumenNumericKeyboard({ onKeyPress, onDelete, variant = 'default', biometricIcon = null, onBiometric = null }) {
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  // variant determines the bottom row layout
  // default: [empty, 0, del]
  // biometric: [FaceID/TouchID, 0, del]
  // amount: ['.', 0, del]

  let bottomLeft = null;
  if (variant === 'biometric' && biometricIcon) {
    bottomLeft = (
      <button onClick={onBiometric} className="h-14 flex items-center justify-center text-lumen-black dark:text-white">
        {biometricIcon}
      </button>
    );
  } else if (variant === 'amount') {
    bottomLeft = (
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => onKeyPress('.')}
        className="h-14 rounded-full text-2xl font-semibold flex items-center justify-center text-lumen-black dark:text-white active:bg-gray-100 dark:active:bg-gray-800">
        .
      </motion.button>
    );
  } else {
    bottomLeft = <div />; // empty placeholder
  }

  return (
    <div className="grid grid-cols-3 gap-x-6 gap-y-4 w-full mx-auto">
      {keys.map((k) => (
        <motion.button
          key={k}
          whileTap={{ scale: 0.9 }}
          onClick={() => onKeyPress(String(k))}
          className="h-14 rounded-full text-2xl font-semibold flex items-center justify-center text-lumen-black dark:text-white active:bg-gray-100 dark:active:bg-gray-800"
        >
          {k}
        </motion.button>
      ))}

      {bottomLeft}

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onKeyPress('0')}
        className="h-14 rounded-full text-2xl font-semibold flex items-center justify-center text-lumen-black dark:text-white active:bg-gray-100 dark:active:bg-gray-800"
      >
        0
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onDelete}
        className="h-14 rounded-full flex items-center justify-center text-lumen-black dark:text-white active:bg-gray-100 dark:active:bg-gray-800"
      >
        <Icons.Delete size={24} />
      </motion.button>
    </div>
  );
}
