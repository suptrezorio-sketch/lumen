import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';
import pb from '../lib/pb';

const DOC_TYPES = [
  { id: 'passport', label: 'Passport', icon: 'FileText', desc: 'International passport (photo page)' },
  { id: 'national_id', label: 'National ID', icon: 'CreditCard', desc: 'Government-issued ID card (front & back)' },
  { id: 'driver_license', label: "Driver's License", icon: 'Car', desc: "Valid driver's license" },
  { id: 'proof_of_address', label: 'Proof of Address', icon: 'Home', desc: 'Utility bill or bank statement (≤ 3 months)' },
  { id: 'selfie', label: 'Selfie with ID', icon: 'Camera', desc: 'Hold your ID next to your face' },
];

function StatusBadge({ status }) {
  const map = {
    none:     { label: 'Not Submitted',  cls: 'bg-gray-100 dark:bg-gray-800 text-gray-500' },
    pending:  { label: 'Under Review',   cls: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
    approved: { label: 'Verified ✓',     cls: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
    rejected: { label: 'Rejected',       cls: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
  };
  const { label, cls } = map[status] || map.none;
  return (
    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${cls}`}>{label}</span>
  );
}

export default function KYC({ onNavigate }) {
  const { t } = useApp();
  const [kycRequest, setKycRequest] = useState(null);
  const [kycDocs, setKycDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null); // docType being uploaded
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRefs = useRef({});

  const clientId = localStorage.getItem('lumen_pb_client_id');

  const load = async () => {
    if (!clientId || clientId.startsWith('USER_')) { setLoading(false); return; }
    try {
      const [reqs, docs] = await Promise.all([
        pb.collection('kyc_requests').getList(1, 1, { filter: `client = '${clientId}'`, sort: '-created' }).catch(() => ({ items: [] })),
        pb.collection('kyc_documents').getList(1, 20, { filter: `client = '${clientId}'`, sort: '-created' }).catch(() => ({ items: [] })),
      ]);
      setKycRequest(reqs.items[0] || null);
      setKycDocs(docs.items);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [clientId]);

  const uploadDoc = async (docType, file) => {
    if (!file || !clientId) return;
    setUploading(docType);
    setMsg('');
    try {
      const formData = new FormData();
      formData.append('client', clientId);
      formData.append('doc_type', docType);
      formData.append('status', 'pending');
      formData.append('file', file);
      await pb.collection('kyc_documents').create(formData);
      setMsg('Document uploaded successfully');
      await load();
    } catch (e) {
      setMsg('Upload failed: ' + (e.message || 'unknown error'));
    }
    setUploading(null);
    setTimeout(() => setMsg(''), 4000);
  };

  const submitKyc = async () => {
    if (!clientId) return;
    setSubmitting(true);
    try {
      if (kycRequest) {
        await pb.collection('kyc_requests').update(kycRequest.id, { status: 'pending', submitted_at: new Date().toISOString() });
      } else {
        await pb.collection('kyc_requests').create({
          client: clientId,
          status: 'pending',
          request_type: 'full_kyc',
          submitted_at: new Date().toISOString(),
        });
      }
      setMsg('KYC submitted for review. Our team will check within 24h.');
      await load();
    } catch (e) {
      setMsg('Error: ' + (e.message || 'unknown'));
    }
    setSubmitting(false);
    setTimeout(() => setMsg(''), 5000);
  };

  const getDocForType = (type) => kycDocs.find(d => d.doc_type === type);

  const overallStatus = kycRequest?.status || 'none';
  const canSubmit = kycDocs.length > 0 && overallStatus !== 'approved' && overallStatus !== 'pending';

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lumen-black dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate('profile')}>
            <Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" />
          </button>
          <h2 className="text-base font-bold text-lumen-black dark:text-white">Identity Verification</h2>
          <div className="w-6" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-6 pb-28">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
          <div className="w-16 h-16 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Icons.ShieldCheck size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-lumen-black dark:text-white">KYC / AML Check</h3>
            <p className="text-sm text-gray-500 mt-1">Upload documents to verify your identity and unlock full banking features.</p>
          </div>
          <StatusBadge status={overallStatus} />
          {kycRequest?.reviewed_at && (
            <p className="text-xs text-gray-400">Reviewed: {new Date(kycRequest.reviewed_at).toLocaleDateString()}</p>
          )}
          {kycRequest?.rejection_reason && overallStatus === 'rejected' && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-left">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">Rejection reason:</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">{kycRequest.rejection_reason}</p>
            </div>
          )}
        </motion.div>

        {/* Document List */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Required Documents</h4>
          {DOC_TYPES.map((docType, i) => {
            const existing = getDocForType(docType.id);
            const isUploading = uploading === docType.id;
            const docStatus = existing?.status || 'none';
            return (
              <motion.div key={docType.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  docStatus === 'approved' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' :
                  docStatus === 'rejected' ? 'border-red-400 bg-red-50 dark:bg-red-900/10' :
                  existing ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10' :
                  'border-dashed border-gray-300 dark:border-gray-700 bg-transparent'
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${existing ? 'bg-lumen-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                      <Icons.FileText size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-lumen-black dark:text-white">{docType.label}</p>
                      <p className="text-[10px] text-gray-500">{docType.desc}</p>
                    </div>
                  </div>
                  <StatusBadge status={docStatus} />
                </div>

                {overallStatus !== 'approved' && (
                  <>
                    <input
                      ref={el => fileRefs.current[docType.id] = el}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      id={`kyc-file-${docType.id}`}
                      onChange={e => uploadDoc(docType.id, e.target.files[0])}
                    />
                    <label
                      htmlFor={`kyc-file-${docType.id}`}
                      className={`mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        isUploading ? 'bg-blue-100 text-blue-600' :
                        existing ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' :
                        'bg-lumen-black dark:bg-white text-white dark:text-black'
                      }`}
                    >
                      {isUploading ? (
                        <><div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Uploading...</>
                      ) : existing ? (
                        <><Icons.RefreshCw size={12} /> Replace</>
                      ) : (
                        <><Icons.Upload size={12} /> Upload</>
                      )}
                    </label>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Status message */}
        <AnimatePresence>
          {msg && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-700 dark:text-blue-300 text-center font-medium">
              {msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        {canSubmit && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={submitKyc} disabled={submitting}
            className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold uppercase tracking-widest disabled:opacity-40 shadow-lg">
            {submitting ? 'Submitting...' : 'Submit for Verification'}
          </motion.button>
        )}

        {overallStatus === 'pending' && (
          <div className="text-center py-4 text-sm text-gray-500">
            <Icons.Clock size={24} className="mx-auto mb-2 text-yellow-500" />
            Your documents are under review. We'll notify you within 24 hours.
          </div>
        )}

        {overallStatus === 'approved' && (
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl text-center">
            <Icons.ShieldCheck size={32} className="mx-auto text-green-600 mb-2" />
            <p className="text-sm font-bold text-green-700 dark:text-green-400">Identity Verified</p>
            <p className="text-xs text-gray-500 mt-1">Your account has full KYC clearance.</p>
          </motion.div>
        )}

        {!clientId || clientId.startsWith('USER_') ? (
          <div className="text-center text-sm text-gray-400 py-6">
            Please complete registration to submit KYC documents.
          </div>
        ) : null}
      </div>
    </div>
  );
}
