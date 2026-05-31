import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';
import pb from '../lib/pb';
import LumenWheelDatePicker from '../components/inputs/LumenWheelDatePicker';
import LumenPhoneInput from '../components/inputs/LumenPhoneInput';

const KYC_STATUS_COLORS = {
  'Not requested':          'text-gray-400',
  Required:                 'text-orange-500',
  'In progress':            'text-blue-500',
  Submitted:                'text-blue-400',
  'Under review':           'text-blue-500',
  Approved:                 'text-green-600',
  Rejected:                 'text-red-500',
  'More information required': 'text-yellow-500',
  'Retry available':        'text-orange-400',
  'Appeal submitted':       'text-blue-400',
  'Final rejected':         'text-red-600',
  Expired:                  'text-gray-500',
};

const QUESTION_TYPES = {
  text:                 { label: 'Text', component: 'input' },
  phone:                { label: 'Phone', component: 'input' },
  select:               { label: 'Select', component: 'select' },
  date:                 { label: 'Date', component: 'date' },
  boolean:              { label: 'Yes / No', component: 'boolean' },
  document_upload:      { label: 'Document Upload', component: 'upload' },
  training_secret_phrase: { label: 'Secret Phrase', component: 'secret' },
};

export default function Verification({ onNavigate, showToast }) {
  const { user } = useApp();
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSecret, setShowSecret] = useState({});

  const clientId = localStorage.getItem('lumen_pb_client_id');

  const load = useCallback(async () => {
    if (!clientId) { setLoading(false); return; }
    setLoading(true);
    try {
      // Re-auth if authStore empty (PWA restart clears in-memory token)
      if (!pb.authStore.isValid) {
        const email = JSON.parse(localStorage.getItem('lumen_user_data') || '{}').email;
        const pass = localStorage.getItem('lumen_pb_pass');
        if (email && pass) {
          try { await pb.collection('clients').authWithPassword(email, pass); } catch {}
        }
      }
      const res = await pb.collection('kyc_requests').getList(1, 20, {
        filter: `client = '${clientId}'`,
        sort: '-created',
        expand: 'client',
      });
      setRequests(res.items);
    } catch { setRequests([]); }
    setLoading(false);
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  const handleAnswer = (key, value) => setAnswers(prev => ({ ...prev, [key]: value }));
  const handleFile = (key, file) => setFiles(prev => ({ ...prev, [key]: file }));

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const questions = (() => { try { return JSON.parse(selected.questions_json || '[]'); } catch { return []; } })();
      
      // Validate phone inputs
      const { validatePhone } = await import('../services/phoneValidation');
      for (const q of questions) {
        const key = q.key || `q_${questions.indexOf(q)}`;
        if (q.type === 'phone' && answers[key]) {
          const res = await validatePhone(answers[key]);
          if (!res.valid && !res.error) {
            showToast(`Invalid phone number: ${q.label_en || q.label || key}`);
            setSubmitting(false);
            return;
          }
          answers[key] = res.formatted;
        }
      }

      const fd = new FormData();
      fd.append('status', 'Submitted');
      fd.append('answers_json', JSON.stringify(answers));
      fd.append('submitted_at', new Date().toISOString());
      Object.entries(files).forEach(([k, f]) => { if (f) fd.append(k, f); });
      await pb.collection('kyc_requests').update(selected.id, fd);
      showToast('Verification submitted — Under review');
      await load();
      setSelected(null);
      setAnswers({});
      setFiles({});
    } catch (e) { showToast('Error submitting: ' + (e.message || 'unknown')); }
    setSubmitting(false);
  };

  // ── Questionnaire view ────────────────────────────────────────
  if (selected) {
    const req = selected;
    const statusColor = KYC_STATUS_COLORS[req.status] || 'text-gray-400';
    const questions = (() => { try { return JSON.parse(req.questions_json || '[]'); } catch { return []; } })();
    const canSubmit = ['Required','In progress','More information required','Retry available'].includes(req.status);

    return (
      <div className="h-full overflow-y-auto scrollbar-hide pb-28 bg-white dark:bg-black">
        <div className="sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
          <div className="flex items-center justify-between">
            <button onClick={() => { setSelected(null); setAnswers({}); setFiles({}); }}>
              <Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" />
            </button>
            <h2 className="text-base font-bold text-lumen-black dark:text-white">Verification</h2>
            <div className="w-6" />
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Status banner */}
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Status</p>
              <p className={`text-sm font-bold ${statusColor}`}>{req.status || 'Pending'}</p>
            </div>
            {req.deadline && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Deadline</p>
                <p className="text-xs font-semibold text-lumen-black dark:text-white">{new Date(req.deadline).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {/* Rejection reason */}
          {req.rejection_reason && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4">
              <p className="text-xs font-semibold text-red-600 mb-1">Rejection Reason</p>
              <p className="text-sm text-red-700 dark:text-red-400">{req.rejection_reason}</p>
            </div>
          )}

          {/* Questions */}
          {questions.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-sm">No questions assigned yet</div>
          )}

          {questions.map((q, i) => {
            const key = q.key || `q_${i}`;
            const val = answers[key] ?? '';
            const qType = q.type || 'text';

            return (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {q.label_en || q.label || key.replace(/_/g, ' ')}
                  {q.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {/* Text / number */}
                {['text','number','email'].includes(qType) && (
                  <input type={qType} value={val} onChange={e => handleAnswer(key, e.target.value)}
                    disabled={!canSubmit}
                    placeholder={q.placeholder || ''}
                    className="w-full p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl text-sm text-lumen-black dark:text-white border-0 outline-none disabled:opacity-50" />
                )}

                {/* Phone */}
                {qType === 'phone' && (
                  <div className={`pt-1 ${!canSubmit && 'opacity-50 pointer-events-none'}`}>
                    <LumenPhoneInput value={val} onChange={d => handleAnswer(key, d)} />
                  </div>
                )}

                {/* Select */}
                {qType === 'select' && (
                  <select value={val} onChange={e => handleAnswer(key, e.target.value)}
                    disabled={!canSubmit}
                    className="w-full p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl text-sm text-lumen-black dark:text-white border-0 outline-none disabled:opacity-50">
                    <option value="">— Select —</option>
                    {(q.options || []).map(o => (
                      <option key={o.value || o} value={o.value || o}>{o.label_en || o.label || o}</option>
                    ))}
                  </select>
                )}

                {/* Date */}
                {qType === 'date' && (
                  <div className="pt-2">
                    <LumenWheelDatePicker 
                      value={val} 
                      onChange={d => handleAnswer(key, d)}
                    />
                  </div>
                )}

                {/* Boolean */}
                {qType === 'boolean' && (
                  <div className="flex gap-3">
                    {['Yes', 'No'].map(opt => (
                      <button key={opt} disabled={!canSubmit}
                        onClick={() => handleAnswer(key, opt)}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${val === opt ? 'bg-lumen-black dark:bg-white text-white dark:text-black' : 'bg-gray-50 dark:bg-[#1C1C1E] text-gray-600 dark:text-gray-300 disabled:opacity-50'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Document upload */}
                {qType === 'document_upload' && (
                  <div className="relative">
                    <input type="file" accept="image/*,.pdf" disabled={!canSubmit}
                      onChange={e => handleFile(key, e.target.files?.[0])}
                      className="absolute inset-0 opacity-0 w-full cursor-pointer" />
                    <div className={`p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl border-2 border-dashed ${files[key] ? 'border-green-500' : 'border-gray-200 dark:border-gray-700'} flex items-center gap-3`}>
                      <Icons.FileText size={20} className="text-gray-400" />
                      <span className="text-sm text-gray-500">{files[key]?.name || 'Tap to upload'}</span>
                      {files[key] && <Icons.Check size={16} className="text-green-500 ml-auto" />}
                    </div>
                  </div>
                )}

                {/* Secret phrase (training_secret_phrase) */}
                {qType === 'training_secret_phrase' && (
                  <div className="relative">
                    <input type={showSecret[key] ? 'text' : 'password'} value={val}
                      onChange={e => handleAnswer(key, e.target.value)}
                      disabled={!canSubmit}
                      placeholder="Enter phrase"
                      className="w-full p-4 pr-12 bg-gray-50 dark:bg-[#1C1C1E] rounded-xl text-sm font-mono text-lumen-black dark:text-white border-0 outline-none disabled:opacity-50" />
                    <button type="button" onClick={() => setShowSecret(s => ({ ...s, [key]: !s[key] }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showSecret[key] ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Submit */}
          {canSubmit && questions.length > 0 && (
            <motion.button whileTap={{ scale: 0.97 }} disabled={submitting}
              onClick={handleSubmit}
              className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold disabled:opacity-30 mt-4">
              {submitting ? 'Submitting…' : 'Submit Verification'}
            </motion.button>
          )}

          {/* Under review state */}
          {['Submitted', 'Under review', 'Appeal submitted'].includes(req.status) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-2">
                <Icons.Shield size={18} className="text-blue-500" />
              </div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Under Review</p>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">Our team is reviewing your submission</p>
            </div>
          )}

          {/* Approved state */}
          {req.status === 'Approved' && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-center">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-2">
                <Icons.Check size={18} className="text-green-600" />
              </div>
              <p className="text-sm font-bold text-green-700 dark:text-green-400">Verification Approved</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Request list ──────────────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-28 bg-white dark:bg-black">
      <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate('/profile')}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
          <h2 className="text-base font-bold text-lumen-black dark:text-white">Verification & KYC</h2>
          <div className="w-6" />
        </div>
      </div>

      <div className="p-5 space-y-3">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-lumen-black dark:border-t-white rounded-full animate-spin" />
          </div>
        )}

        {!loading && requests.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <div className="w-14 h-14 bg-gray-100 dark:bg-[#1C1C1E] rounded-2xl flex items-center justify-center mx-auto">
              <Icons.Shield size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">No verification requests</p>
            <p className="text-xs text-gray-400 px-8">Your advisor will send verification requests when required</p>
          </div>
        )}

        {requests.map((req, i) => {
          const statusColor = KYC_STATUS_COLORS[req.status] || 'text-gray-400';
          const isActionable = ['Required', 'In progress', 'More information required', 'Retry available'].includes(req.status);
          return (
            <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              onClick={() => setSelected(req)}
              className="p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl cursor-pointer active:bg-gray-100 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActionable ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-gray-100 dark:bg-[#2C2C2E]'}`}>
                    <Icons.Shield size={16} className={isActionable ? 'text-orange-500' : 'text-gray-400'} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-lumen-black dark:text-white">
                      {req.request_type || 'KYC Verification'}
                    </p>
                    <p className="text-[10px] text-gray-400">{new Date(req.created).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold ${statusColor}`}>{req.status || 'Pending'}</span>
              </div>
              {req.deadline && (
                <p className="text-xs text-orange-500 pl-12">
                  Deadline: {new Date(req.deadline).toLocaleDateString()}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
