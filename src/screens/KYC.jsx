import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';

export default function KYC({ onNavigate }) {
  const { t, kycStatus, setKycStatus, amlStatus, setAmlStatus } = useApp();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    // Имитация загрузки документа на сервер
    try {
      const userId = localStorage.getItem('lumen_user_id');
      await fetch('http://localhost:5001/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'passport',
          fileUrl: 'simulated_url_to_document.jpg',
          status: 'pending'
        })
      });
      
      setKycStatus('pending');
      localStorage.setItem('lumen_kyc', 'pending');
      alert('Documents uploaded successfully. Please wait for verification.');
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black">
      <div className="sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate('profile')}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
          <h2 className="text-base font-bold text-lumen-black dark:text-white">{t('kyc.title')}</h2>
          <div className="w-6" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="text-center space-y-2 mb-8">
          <div className="w-16 h-16 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center mx-auto">
            <Icons.ShieldCheck size={32} />
          </div>
          <h3 className="text-xl font-bold text-lumen-black dark:text-white">{t('kyc.verifyNow')}</h3>
          <p className="text-sm text-gray-500">{t('kyc.description')}</p>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border-2 transition-all ${kycStatus === 'verified' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-dashed border-gray-300 dark:border-gray-700'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icons.FileText size={20} className="text-gray-400" />
                <span className="text-sm font-medium text-lumen-black dark:text-white">Passport / ID Card</span>
              </div>
              {kycStatus === 'verified' ? (
                <span className="text-xs font-bold text-green-600 uppercase">Verified</span>
              ) : (
                <input type="file" onChange={e => setFile(e.target.files[0])} className="hidden" id="kyc-upload" />
              )}
            </div>
            {kycStatus !== 'verified' && (
              <label htmlFor="kyc-upload" className="mt-3 block text-center py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-semibold text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors">
                {file ? 'Change File' : 'Upload Document'}
              </label>
            )}
          </div>

          <div className={`p-4 rounded-2xl border-2 transition-all ${amlStatus === 'verified' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-dashed border-gray-300 dark:border-gray-700'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icons.Home size={20} className="text-gray-400" />
                <span className="text-sm font-medium text-lumen-black dark:text-white">Proof of Address</span>
              </div>
              {amlStatus === 'verified' ? (
                <span className="text-xs font-bold text-green-600 uppercase">Verified</span>
              ) : (
                <span className="text-xs text-gray-400">Optional</span>
              )}
            </div>
          </div>
        </div>

        {kycStatus !== 'verified' && (
          <motion.button 
            whileTap={{ scale: 0.97 }} 
            onClick={handleUpload}
            disabled={uploading}
            className={`w-full py-4 rounded-2xl font-bold transition-all ${uploading ? 'bg-gray-400' : 'bg-lumen-black dark:bg-white text-white dark:text-black'}`}
          >
            {uploading ? 'Uploading...' : 'Submit for Verification'}
          </motion.button>
        )}
      </div>
    </div>
  );
}
