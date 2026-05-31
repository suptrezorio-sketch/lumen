import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../../lib/pb';

const STATUS_COLORS = {
  Draft:                      '#9ca3af',
  'Waiting for verification': '#f59e0b',
  'Waiting for signature':    '#f59e0b',
  'Waiting for funding':      '#f97316',
  Processing:                 '#3b82f6',
  Pending:                    '#f59e0b',
  Active:                     '#22c55e',
  'Under review':             '#60a5fa',
  Completed:                  '#16a34a',
  Rejected:                   '#ef4444',
  Frozen:                     '#93c5fd',
  Cancelled:                  '#6b7280',
  Expired:                    '#f87171',
};

const ALL_STATUSES = Object.keys(STATUS_COLORS);
const EMPTY_FORM = {
  client: '',
  order_id: '',
  issuer: '',
  beneficiary: '',
  asset: 'BTC',
  asset_amount: '',
  fiat_equivalent: '',
  output_asset_amount: '',
  output_fiat_equivalent: '',
  status: 'Pending',
  aml_status: 'Pending',
  preauth_status: 'Pending',
  confirmation_blocks: 0,
  live_progress: 0,
  due_date: '',
  required_input_condition_json: '',
  action_buttons_json: '[]',
  activity_log_json: '[]',
};

export default function SmartContracts() {
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // null = create, else contract id
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sc, cl] = await Promise.all([
        pb.collection('smart_contracts').getList(1, 100, { sort: '-created', expand: 'client' }),
        pb.collection('clients').getList(1, 200, { sort: 'first_name' }),
      ]);
      setContracts(sc.items);
      setClients(cl.items);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (c) => {
    setEditing(c.id);
    setForm({
      client: c.client || '',
      order_id: c.order_id || '',
      issuer: c.issuer || '',
      beneficiary: c.beneficiary || '',
      asset: c.asset || 'BTC',
      asset_amount: c.asset_amount || '',
      fiat_equivalent: c.fiat_equivalent || '',
      output_asset_amount: c.output_asset_amount || '',
      output_fiat_equivalent: c.output_fiat_equivalent || '',
      status: c.status || 'Pending',
      aml_status: c.aml_status || 'Pending',
      preauth_status: c.preauth_status || 'Pending',
      confirmation_blocks: c.confirmation_blocks ?? 0,
      live_progress: c.live_progress ?? 0,
      due_date: c.due_date ? c.due_date.slice(0, 10) : '',
      required_input_condition_json: c.required_input_condition_json || '',
      action_buttons_json: c.action_buttons_json || '[]',
      activity_log_json: c.activity_log_json || '[]',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        ...form,
        title: form.order_id || form.issuer || 'Settlement Order',
        asset_amount: parseFloat(form.asset_amount) || 0,
        fiat_equivalent: parseFloat(form.fiat_equivalent) || 0,
        output_asset_amount: parseFloat(form.output_asset_amount) || 0,
        output_fiat_equivalent: parseFloat(form.output_fiat_equivalent) || 0,
        confirmation_blocks: parseInt(form.confirmation_blocks) || 0,
        live_progress: parseInt(form.live_progress) || 0,
        due_date: form.due_date || null,
        amount: parseFloat(form.asset_amount) || 0,
        currency: form.asset || 'BTC',
      };
      if (editing) {
        await pb.collection('smart_contracts').update(editing, data);
        flash('Updated');
      } else {
        await pb.collection('smart_contracts').create(data);
        flash('Created');
      }
      setShowForm(false);
      load();
    } catch (e) { flash('Error: ' + (e.message || 'unknown')); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contract?')) return;
    try { await pb.collection('smart_contracts').delete(id); load(); } catch {}
  };

  const filtered = contracts.filter(c => {
    const q = search.toLowerCase();
    const match = !q || (c.order_id || '').toLowerCase().includes(q) ||
      (c.issuer || '').toLowerCase().includes(q) ||
      (c.expand?.client?.first_name || '').toLowerCase().includes(q);
    const status = filterStatus === 'all' || c.status === filterStatus;
    return match && status;
  });

  const S = {
    page: { padding: '24px', minHeight: '100vh', background: '#0a0a0a', color: '#f1f1f1' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 22, fontWeight: 700, letterSpacing: -0.5 },
    btn: { padding: '8px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: '#fff', color: '#000' },
    btnDanger: { padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444' },
    btnSecondary: { padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,0.06)', color: '#bbb' },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, marginBottom: 6 },
    input: { width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f1f1', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
    label: { display: 'block', fontSize: 11, color: '#666', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 40, overflowY: 'auto' },
    modalBox: { background: '#111', borderRadius: 16, padding: 28, width: 600, maxWidth: '96vw', marginBottom: 40 },
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <span style={S.title}>Settlement Orders</span>
        <button style={S.btn} onClick={openCreate}>+ New Contract</button>
      </div>

      {msg && <div style={{ background: 'rgba(255,255,255,0.07)', padding: '10px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>{msg}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order / issuer / client..."
          style={{ ...S.input, width: 260 }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ ...S.input, width: 180 }}>
          <option value="all">All Statuses</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#444' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#444' }}>No contracts found</div>
      ) : (
        <div>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 120px', gap: 8, padding: '0 16px 8px', fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
            <span>Order / Client</span><span>Asset</span><span>Fiat Equiv.</span><span>Status</span><span>Due</span><span />
          </div>
          {filtered.map(c => {
            const cl = c.expand?.client;
            const color = STATUS_COLORS[c.status] || '#9ca3af';
            return (
              <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 120px', gap: 8, alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{c.order_id || c.id.slice(0, 10)}</div>
                  <div style={{ fontSize: 11, color: '#666' }}>{cl ? `${cl.first_name} ${cl.last_name}` : '—'}</div>
                </div>
                <div style={{ fontSize: 13 }}>{c.asset_amount} {c.asset}</div>
                <div style={{ fontSize: 13 }}>{c.fiat_equivalent ? `$${Number(c.fiat_equivalent).toLocaleString()}` : '—'}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color }}>{c.status}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{c.due_date ? new Date(c.due_date).toLocaleDateString() : '—'}</div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button style={S.btnSecondary} onClick={() => navigate(`/admin/clients/${c.client}`)}>Client</button>
                  <button style={S.btnSecondary} onClick={() => openEdit(c)}>Edit</button>
                  <button style={S.btnDanger} onClick={() => handleDelete(c.id)}>Del</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div style={S.modal} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={S.modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{editing ? 'Edit Contract' : 'New Contract'}</span>
              <button onClick={() => setShowForm(false)} style={S.btnSecondary}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={S.grid2}>
                <div>
                  <label style={S.label}>Client</label>
                  <select value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} style={S.input}>
                    <option value="">— Select client —</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({c.email})</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Order ID</label>
                  <input value={form.order_id} onChange={e => setForm(f => ({ ...f, order_id: e.target.value }))} style={S.input} placeholder="ORD-2026-001" />
                </div>
              </div>

              <div style={S.grid2}>
                <div>
                  <label style={S.label}>Issuer / Origin</label>
                  <input value={form.issuer} onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))} style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Beneficiary</label>
                  <input value={form.beneficiary} onChange={e => setForm(f => ({ ...f, beneficiary: e.target.value }))} style={S.input} />
                </div>
              </div>

              <div style={S.grid2}>
                <div>
                  <label style={S.label}>Asset</label>
                  <input value={form.asset} onChange={e => setForm(f => ({ ...f, asset: e.target.value }))} style={S.input} placeholder="BTC / ETH / USDT" />
                </div>
                <div>
                  <label style={S.label}>Asset Amount</label>
                  <input type="number" value={form.asset_amount} onChange={e => setForm(f => ({ ...f, asset_amount: e.target.value }))} style={S.input} />
                </div>
              </div>

              <div style={S.grid2}>
                <div>
                  <label style={S.label}>Fiat Equivalent ($)</label>
                  <input type="number" value={form.fiat_equivalent} onChange={e => setForm(f => ({ ...f, fiat_equivalent: e.target.value }))} style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Output Amount</label>
                  <input type="number" value={form.output_asset_amount} onChange={e => setForm(f => ({ ...f, output_asset_amount: e.target.value }))} style={S.input} />
                </div>
              </div>

              <div style={S.grid2}>
                <div>
                  <label style={S.label}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={S.input}>
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>AML Status</label>
                  <input value={form.aml_status} onChange={e => setForm(f => ({ ...f, aml_status: e.target.value }))} style={S.input} />
                </div>
              </div>

              <div style={S.grid2}>
                <div>
                  <label style={S.label}>Confirmation Blocks (0-3)</label>
                  <input type="number" min={0} max={3} value={form.confirmation_blocks} onChange={e => setForm(f => ({ ...f, confirmation_blocks: e.target.value }))} style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Live Progress (%)</label>
                  <input type="number" min={0} max={100} value={form.live_progress} onChange={e => setForm(f => ({ ...f, live_progress: e.target.value }))} style={S.input} />
                </div>
              </div>

              <div>
                <label style={S.label}>Due Date</label>
                <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} style={S.input} />
              </div>

              <div>
                <label style={S.label}>Required Input Condition (JSON)</label>
                <textarea value={form.required_input_condition_json} onChange={e => setForm(f => ({ ...f, required_input_condition_json: e.target.value }))}
                  rows={2} style={{ ...S.input, resize: 'vertical' }} placeholder='{"payment_confirmed": true}' />
              </div>

              <div>
                <label style={S.label}>Action Buttons (JSON array)</label>
                <textarea value={form.action_buttons_json} onChange={e => setForm(f => ({ ...f, action_buttons_json: e.target.value }))}
                  rows={3} style={{ ...S.input, resize: 'vertical' }}
                  placeholder='[{"label_en":"Sign Agreement","url":"","enabled":true}]' />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button onClick={() => setShowForm(false)} style={S.btnSecondary}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ ...S.btn, opacity: saving ? 0.5 : 1 }}>
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
