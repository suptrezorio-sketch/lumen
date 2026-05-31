import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../../lib/pb';

const FILTERS = [
  { label: 'All',            value: '' },
  { label: 'Pending',        value: "account_status = 'pending'" },
  { label: 'Approved',       value: "account_status = 'approved'" },
  { label: 'Blocked',        value: "account_status = 'blocked'" },
  { label: 'KYC Required',   value: "kyc_status = 'required'" },
  { label: 'KYC Submitted',  value: "kyc_status = 'submitted'" },
];

const STATUS_COLORS = {
  pending:   { bg: 'rgba(255,204,0,0.12)',  color: '#FFCC00' },
  approved:  { bg: 'rgba(52,199,89,0.12)',  color: '#34C759' },
  blocked:   { bg: 'rgba(255,59,48,0.12)',  color: '#FF3B30' },
  rejected:  { bg: 'rgba(255,59,48,0.12)',  color: '#FF3B30' },
  none:      { bg: 'rgba(99,99,102,0.12)',  color: '#636366' },
  required:  { bg: 'rgba(255,204,0,0.12)',  color: '#FFCC00' },
  submitted: { bg: 'rgba(0,122,255,0.12)',  color: '#007AFF' },
};

function Badge({ value }) {
  const s = STATUS_COLORS[value] || STATUS_COLORS.none;
  return (
    <span style={{
      ...s, fontSize: 10, padding: '3px 8px',
      borderRadius: 20, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: 0.8,
      whiteSpace: 'nowrap',
    }}>
      {value || '—'}
    </span>
  );
}

const EMPTY_FORM = {
  email: '', password: '', passwordConfirm: '',
  first_name: '', last_name: '', phone: '',
  account_status: 'pending', pin: '',
};

export default function ClientsList() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');
  const PER_PAGE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const parts = [];
      if (filter) parts.push(filter);
      if (search) parts.push(`(first_name ~ '${search}' || last_name ~ '${search}' || email ~ '${search}')`);
      const res = await pb.collection('clients').getList(page, PER_PAGE, {
        filter: parts.join(' && ') || undefined,
        sort: '-created',
      });
      setClients(res.items);
      setTotal(res.totalItems);
    } catch {}
    setLoading(false);
  }, [page, search, filter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const handleCreate = async () => {
    setFormErr('');
    if (!form.email || !form.password || !form.first_name) {
      setFormErr('Email, password and first name are required'); return;
    }
    if (form.password !== form.passwordConfirm) {
      setFormErr('Passwords do not match'); return;
    }
    setSaving(true);
    try {
      const rec = await pb.collection('clients').create({
        email: form.email,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        account_status: form.account_status,
        emailVisibility: true,
        pin: form.pin || '',
      });
      // Create client_application so client can log in via link
      try { await pb.collection('client_applications').create({ client: rec.id, status: 'submitted' }); } catch {}
      setShowCreate(false);
      setForm(EMPTY_FORM);
      load();
    } catch (e) {
      setFormErr(e.data?.message || e.message || 'Error creating client');
    }
    setSaving(false);
  };

  const S = {
    input: { width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none' },
    label: { display: 'block', fontSize: 11, color: '#666', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Search name, email…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{
            flex: 1, minWidth: 200, maxWidth: 320,
            background: '#111', border: '1px solid #222', borderRadius: 8,
            padding: '9px 14px', color: '#fff', fontSize: 13, outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1); }}
              style={{
                padding: '7px 12px', borderRadius: 8, fontSize: 12,
                border: filter === f.value ? '1px solid #007AFF' : '1px solid #222',
                background: filter === f.value ? 'rgba(0,122,255,0.1)' : '#111',
                color: filter === f.value ? '#007AFF' : '#666',
                cursor: 'pointer',
              }}
            >{f.label}</button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#444' }}>{total} clients</div>
        <button onClick={() => { setShowCreate(true); setFormErr(''); setForm(EMPTY_FORM); }}
          style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', background: '#fff', color: '#000', cursor: 'pointer' }}>
          + New Client
        </button>
      </div>

      {/* Create Client Modal */}
      {showCreate && (
        <div onClick={e => e.target === e.currentTarget && setShowCreate(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 32, width: 500, maxWidth: '95vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>New Client</span>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#666', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={S.grid2}>
                <div>
                  <label style={S.label}>First Name *</label>
                  <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Last Name</label>
                  <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} style={S.input} />
                </div>
              </div>

              <div>
                <label style={S.label}>Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={S.input} />
              </div>

              <div>
                <label style={S.label}>Phone</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={S.input} placeholder="+1 000 000 0000" />
              </div>

              <div style={S.grid2}>
                <div>
                  <label style={S.label}>Password *</label>
                  <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Confirm Password *</label>
                  <input type="password" value={form.passwordConfirm} onChange={e => setForm(f => ({ ...f, passwordConfirm: e.target.value }))} style={S.input} />
                </div>
              </div>

              <div style={S.grid2}>
                <div>
                  <label style={S.label}>Account Status</label>
                  <select value={form.account_status} onChange={e => setForm(f => ({ ...f, account_status: e.target.value }))}
                    style={{ ...S.input, cursor: 'pointer' }}>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>PIN (4–6 digits)</label>
                  <input type="text" inputMode="numeric" maxLength={6} value={form.pin}
                    onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g,'') }))}
                    style={S.input} placeholder="e.g. 1234" />
                </div>
              </div>

              {formErr && (
                <div style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 8, padding: '10px 14px', color: '#ff3b30', fontSize: 12 }}>
                  {formErr}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button onClick={() => setShowCreate(false)}
                  style={{ padding: '10px 20px', borderRadius: 8, fontSize: 13, border: '1px solid #333', background: 'transparent', color: '#888', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleCreate} disabled={saving}
                  style={{ padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', background: saving ? '#333' : '#fff', color: '#000', cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Creating…' : 'Create Client'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
              {['Client','Email','Status','KYC','AML','Risk','Joined'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#444', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#333', fontSize: 13 }}>Loading…</td></tr>
            )}
            {!loading && clients.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#444', fontSize: 13 }}>No clients found</td></tr>
            )}
            {clients.map(c => (
              <tr
                key={c.id}
                onClick={() => navigate(`/admin/clients/${c.id}`)}
                style={{ borderBottom: '1px solid #151515', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#161616'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{c.first_name} {c.last_name}</div>
                  <div style={{ fontSize: 11, color: '#444', marginTop: 1 }}>{c.phone || '—'}</div>
                </td>
                <td style={{ padding: '13px 16px', fontSize: 12, color: '#888' }}>{c.email}</td>
                <td style={{ padding: '13px 16px' }}><Badge value={c.account_status} /></td>
                <td style={{ padding: '13px 16px' }}><Badge value={c.kyc_status} /></td>
                <td style={{ padding: '13px 16px' }}><Badge value={c.aml_status} /></td>
                <td style={{ padding: '13px 16px' }}><Badge value={c.risk_level} /></td>
                <td style={{ padding: '13px 16px', fontSize: 11, color: '#555' }}>
                  {new Date(c.created).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} style={pBtnStyle(page === 1)}>← Prev</button>
          <span style={{ fontSize: 12, color: '#555', padding: '8px 0' }}>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} style={pBtnStyle(page === totalPages)}>Next →</button>
        </div>
      )}
    </div>
  );
}

const pBtnStyle = (disabled) => ({
  padding: '8px 16px', borderRadius: 8, fontSize: 12,
  border: '1px solid #222', background: disabled ? '#0a0a0a' : '#111',
  color: disabled ? '#333' : '#666', cursor: disabled ? 'not-allowed' : 'pointer',
});
