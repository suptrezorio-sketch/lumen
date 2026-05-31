import React, { useEffect, useState } from 'react';
import pb from '../../lib/pb';

export default function ScenarioTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', steps: '', active: true });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await pb.collection('scenario_templates').getList(1, 50, { sort: '-created' });
      setTemplates(res.items);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setSaving(true);
    try {
      let steps = null;
      if (form.steps.trim()) {
        steps = JSON.parse(form.steps);
      }
      await pb.collection('scenario_templates').create({ name: form.name, description: form.description, steps, active: form.active });
      setMsg('Scenario created');
      setForm({ name: '', description: '', steps: '', active: true });
      setCreating(false);
      load();
    } catch { setMsg('Error — check JSON steps format'); }
    setSaving(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const toggle = async (id, active) => {
    try {
      await pb.collection('scenario_templates').update(id, { active: !active });
      load();
    } catch {}
  };

  const del = async (id) => {
    if (!confirm('Delete this scenario template?')) return;
    try {
      await pb.collection('scenario_templates').delete(id);
      load();
    } catch {}
  };

  return (
    <div>
      {msg && <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '12px 20px', fontSize: 13, color: '#fff', zIndex: 1000 }}>{msg}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button onClick={() => setCreating(!creating)} style={{ padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', background: 'rgba(0,122,255,0.15)', color: '#007AFF', cursor: 'pointer' }}>
          + New Template
        </button>
      </div>

      {creating && (
        <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>New Scenario Template</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: '#555', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={{ background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', width: 360 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#555', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', width: 360 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#555', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
                Steps (JSON array, optional)
              </label>
              <textarea
                value={form.steps}
                onChange={e => setForm(f => ({ ...f, steps: e.target.value }))}
                style={{ background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 12, outline: 'none', width: '100%', height: 120, resize: 'vertical', fontFamily: 'monospace' }}
                placeholder='[{"step": 1, "type": "kyc", "label": "Identity Verification"}]'
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={create} disabled={saving || !form.name} style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', background: 'rgba(52,199,89,0.15)', color: '#34C759', cursor: 'pointer' }}>
                {saving ? 'Saving…' : 'Create'}
              </button>
              <button onClick={() => setCreating(false)} style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, border: '1px solid #222', background: '#111', color: '#555', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading && <div style={{ color: '#333', fontSize: 13 }}>Loading…</div>}

      {!loading && templates.length === 0 && (
        <div style={{ color: '#444', fontSize: 13, padding: '20px 0' }}>No scenario templates yet. Create your first one.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {templates.map(t => (
          <div key={t.id} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</span>
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8,
                  background: t.active ? 'rgba(52,199,89,0.12)' : 'rgba(99,99,102,0.12)',
                  color: t.active ? '#34C759' : '#636366',
                }}>{t.active ? 'Active' : 'Inactive'}</span>
              </div>
              {t.description && <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>{t.description}</div>}
              {t.steps && (
                <div style={{ fontSize: 11, color: '#444' }}>
                  {Array.isArray(t.steps) ? `${t.steps.length} step(s)` : 'Has steps'}
                </div>
              )}
              <div style={{ fontSize: 10, color: '#333', marginTop: 6 }}>{new Date(t.created).toLocaleDateString()}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 16 }}>
              <button onClick={() => toggle(t.id, t.active)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: 'none', background: 'rgba(99,99,102,0.12)', color: '#636366', cursor: 'pointer' }}>
                {t.active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => del(t.id)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: 'none', background: 'rgba(255,59,48,0.1)', color: '#FF3B30', cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
