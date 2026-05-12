import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useOrchestratorStore from '../store/orchestratorStore';
import socket from '../services/socketService';

const ModalOverlay = () => {
  const [modal, setModal] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    // Listen for show_modal events from Scenario Engine
    socket.on('show_modal', (data) => {
      console.log('show_modal received:', data);
      setModal(data);
      
      // Handle countdown if duration is specified
      if (data.duration) {
        setCountdown(Math.ceil(data.duration / 1000));
      }
    });

    return () => {
      socket.off('show_modal');
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      handleModalClose();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleModalClose = () => {
    setModal(null);
    setInputValue('');
    setCountdown(null);
    
    // Notify server
    socket.emit('MODAL_CLOSED', { modalType: modal?.modalType });
  };

  const handleConfirm = () => {
    socket.emit('MODAL_CONFIRM', { 
      modalType: modal?.modalType, 
      input: inputValue 
    });
    handleModalClose();
  };

  const handleCancel = () => {
    socket.emit('MODAL_CANCEL', { modalType: modal?.modalType });
    handleModalClose();
  };

  if (!modal) return null;

  const renderContent = () => {
    switch (modal.modalType) {
      case 'otp_verification':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{modal.title}</h3>
            <p className="text-gray-600 mb-4">{modal.message}</p>
            
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl tracking-widest mb-4"
              maxLength={6}
            />
            
            {countdown !== null && (
              <p className="text-sm text-gray-500 mb-4">
                Time remaining: {countdown}s
              </p>
            )}
          </div>
        );

      case 'warning':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{modal.title}</h3>
            <p className="text-gray-600 mb-6">{modal.message}</p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{modal.title}</h3>
            <p className="text-gray-600 mb-4">{modal.message}</p>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{modal.title}</h3>
            <p className="text-gray-600">{modal.message}</p>
          </div>
        );
    }
  };

  const showButtons = ['warning', 'error', 'otp_verification'].includes(modal.modalType);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9997] bg-black/50 flex items-center justify-center p-4"
        onClick={handleModalClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {renderContent()}
          
          {showButtons && (
            <div className="flex gap-3 mt-6">
              {modal.modalType === 'warning' && (
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium"
                >
                  {modal.cancelText || 'Cancel'}
                </button>
              )}
              
              <button
                onClick={modal.modalType === 'warning' ? handleConfirm : handleModalClose}
                className={`flex-1 px-4 py-3 rounded-xl font-medium ${
                  modal.modalType === 'warning' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-lumen-black text-white'
                }`}
              >
                {modal.modalType === 'warning' 
                  ? (modal.confirmText || 'Confirm') 
                  : 'OK'
                }
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalOverlay;