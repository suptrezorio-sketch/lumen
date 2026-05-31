import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';
import pb from '../lib/pb';

const STATUS_COLORS = {
  Draft:                    'text-gray-400',
  'Waiting for verification': 'text-yellow-500',
  'Waiting for signature':  'text-yellow-500',
  'Waiting for funding':    'text-orange-500',
  Processing:               'text-blue-500',
  Pending:                  'text-yellow-500',
  Active:                   'text-green-500',
  'Under review':           'text-blue-400',
  Completed:                'text-green-600',
  Rejected:                 'text-red-500',
  Frozen:                   'text-blue-300',
  Cancelled:                'text-gray-500',
  Expired:                  'text-red-400',
};

const STATUS_BG = {
  Active:    'bg-green-50 dark:bg-green-900/20',
  Completed: 'bg-green-50 dark:bg-green-900/20',
  Pending:   'bg-yellow-50 dark:bg-yellow-900/20',
  Processing:'bg-blue-50 dark:bg-blue-900/20',
  Frozen:    'bg-blue-50 dark:bg-blue-900/20',
  Rejected:  'bg-red-50 dark:bg-red-900/20',
};

export default function SmartContract({ onNavigate, showToast }) {
  const { user } = useApp();
  const [contracts, setContracts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const clientId = localStorage.getItem('lumen_pb_client_id');

  const load = useCallback(async () => {
    if (!clientId) { setLoading(false); return; }
    setLoading(true);
    try {
      if (!pb.authStore.isValid) {
        const email = JSON.parse(localStorage.getItem('lumen_user_data') || '{}').email;
        const pass = localStorage.getItem('lumen_pb_pass');
        if (email && pass) { try { await pb.collection('clients').authWithPassword(email, pass); } catch {} }
      }
      const res = await pb.collection('smart_contracts').getList(1, 20, {
        filter: `client = '${clientId}'`,
        sort: '-created',
      });
      setContracts(res.items);
    } catch { setContracts([]); }
    setLoading(false);
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  // ── Detail view ───────────────────────────────────────────────
  if (selected) {
    const c = selected;
    const statusColor = STATUS_COLORS[c.status] || 'text-gray-400';
    const statusBg = STATUS_BG[c.status] || 'bg-gray-50 dark:bg-[#1C1C1E]';
    const blocks = c.confirmation_blocks || 0;
    const totalBlocks = 3;
    const log = (() => { try { return JSON.parse(c.activity_log_json || '[]'); } catch { return []; } })();
    const buttons = (() => { try { return JSON.parse(c.action_buttons_json || '[]'); } catch { return []; } })();

    return (
      <div className="h-full overflow-y-auto scrollbar-hide pb-28 bg-white dark:bg-black">
        <div className="sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
          <div className="flex items-center justify-between">
            <button onClick={() => setSelected(null)}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
            <h2 className="text-base font-bold text-lumen-black dark:text-white truncate mx-3">Settlement Order</h2>
            <div className="w-6" />
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Contract card visual */}
          <div className={`rounded-2xl p-5 ${statusBg} border border-gray-100 dark:border-gray-800`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Settlement Order</p>
                <p className="text-xs font-mono text-gray-500 mt-0.5">{c.order_id || c.id}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg bg-white/60 dark:bg-black/30 ${statusColor}`}>
                {c.status || 'Pending'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] text-gray-400 uppercase">Asset</p>
                <p className="text-base font-bold text-lumen-black dark:text-white">{c.asset_amount || '—'} {c.asset || '—'}</p>
                <p className="text-xs text-gray-500">{c.fiat_equivalent ? `≈ $${Number(c.fiat_equivalent).toLocaleString()}` : ''}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-gray-400 uppercase">Output</p>
                <p className="text-base font-bold text-lumen-black dark:text-white">{c.output_asset_amount || '—'}</p>
                <p className="text-xs text-gray-500">{c.output_fiat_equivalent ? `≈ $${Number(c.output_fiat_equivalent).toLocaleString()}` : ''}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4 space-y-3">
            {[
              { label: 'Issuer / Origin', value: c.issuer || '—' },
              { label: 'Beneficiary', value: c.beneficiary || user?.name || '—' },
              { label: 'AML Status', value: c.aml_status || 'Not checked' },
              { label: 'Pre-authorization', value: c.preauth_status || 'Pending' },
              { label: 'Due Date', value: c.due_date ? new Date(c.due_date).toLocaleDateString() : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-xs text-gray-400">{label}</span>
                <span className="text-xs font-semibold text-lumen-black dark:text-white">{value}</span>
              </div>
            ))}
          </div>

          {/* Condition */}
          {c.required_input_condition_json && (() => {
            try {
              const cond = JSON.parse(c.required_input_condition_json);
              return (
                <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Required Condition</p>
                  {Object.entries(cond).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1">
                      <span className="text-xs text-gray-500">{k.replace(/_/g, ' ')}</span>
                      <span className="text-xs font-bold text-lumen-black dark:text-white">{String(v)}</span>
                    </div>
                  ))}
                </div>
              );
            } catch { return null; }
          })()}

          {/* Confirmation blocks progress */}
          <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Confirmation Progress</p>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalBlocks }).map((_, idx) => {
                const done = idx < blocks;
                const active = idx === blocks;
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && <div className={`flex-1 h-0.5 ${done ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      done ? 'bg-green-500 text-white' : active ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-[#2C2C2E] text-gray-400'
                    }`}>
                      {done ? <Icons.Check size={14} /> : idx + 1}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-2 px-1">
              <span>Verification</span><span>Signature</span><span>Settlement</span>
            </div>
          </div>

          {/* Live progress */}
          {c.live_progress != null && (
            <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-400">Processing Progress</span>
                <span className="text-xs font-bold text-lumen-black dark:text-white">{c.live_progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${c.live_progress}%` }}
                  className="h-full bg-blue-500 rounded-full" transition={{ duration: 1 }} />
              </div>
            </div>
          )}

          {/* Action buttons (admin-configured) */}
          {buttons.length > 0 && (
            <div className="space-y-2">
              {buttons.filter(b => b.enabled !== false).map((btn, i) => (
                <motion.button key={i} whileTap={{ scale: 0.97 }}
                  onClick={() => btn.url ? window.open(btn.url, '_blank') : showToast(btn.label_en || 'Action')}
                  className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm">
                  {btn.label_en || `Action ${i + 1}`}
                </motion.button>
              ))}
            </div>
          )}

          {/* Activity log */}
          {log.length > 0 && (
            <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Activity Log</p>
              <div className="space-y-2">
                {log.map((entry, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-lumen-black dark:text-white">{entry.message || entry}</p>
                      {entry.date && <p className="text-[10px] text-gray-400">{new Date(entry.date).toLocaleDateString()}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Support CTA */}
          <button onClick={() => onNavigate('/chat')}
            className="w-full py-3 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-300">
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-28 bg-white dark:bg-black">
      <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate('/')}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
          <h2 className="text-base font-bold text-lumen-black dark:text-white">Settlement Orders</h2>
          <div className="w-6" />
        </div>
      </div>

      <div className="p-5 space-y-3">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-lumen-black dark:border-t-white rounded-full animate-spin" />
          </div>
        )}

        {!loading && contracts.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <div className="w-14 h-14 bg-gray-100 dark:bg-[#1C1C1E] rounded-2xl flex items-center justify-center mx-auto">
              <Icons.FileText size={24} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No settlement orders assigned</p>
            <p className="text-xs text-gray-400">Your advisor will assign orders to your account</p>
          </div>
        )}

        {contracts.map((c, i) => {
          const statusColor = STATUS_COLORS[c.status] || 'text-gray-400';
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              onClick={() => setSelected(c)}
              className="p-4 bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl cursor-pointer active:bg-gray-100 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Settlement Order</p>
                  <p className="text-sm font-bold text-lumen-black dark:text-white mt-0.5">{c.order_id || c.id.slice(0, 12)}</p>
                </div>
                <span className={`text-xs font-bold ${statusColor}`}>{c.status || 'Pending'}</span>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-[9px] text-gray-400">Asset</p>
                  <p className="text-sm font-bold text-lumen-black dark:text-white">{c.asset_amount || '—'} {c.asset || '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-gray-400">Fiat Equivalent</p>
                  <p className="text-sm font-bold text-lumen-black dark:text-white">
                    {c.fiat_equivalent ? `$${Number(c.fiat_equivalent).toLocaleString()}` : '—'}
                  </p>
                </div>
              </div>
              {c.due_date && (
                <p className="text-[10px] text-gray-400">Due: {new Date(c.due_date).toLocaleDateString()}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
