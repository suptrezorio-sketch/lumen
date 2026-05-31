import React, { useEffect, useState, useCallback } from 'react';
import pb from '../../lib/pb';

const EMPTY = {
  title_en: '', title_fr: '',
  subtitle_en: '', subtitle_fr: '',
  bg_color: '#F0F0F5',
  active: true,
  sort_order: 0,
  target_url: '',
};

export default function PromoBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pb.collection('promo_banners').getList(1, 50, { sort: 'sort_order' });
      setBanners(res.items);
    } catch { setBanners([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (b) => {
    setEditing(b.id);
    setForm({
      title_en: b.title_en || '',
      title_fr: b.title_fr || '',
      subtitle_en: b.subtitle_en || '',
      subtitle_fr: b.subtitle_fr || '',
      bg_color: b.bg_color || '#F0F0F5',
      active: b.active ?? true,
      sort_order: b.sort_order ?? 0,
      target_url: b.target_url || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...form, sort_order: parseInt(form.sort_order) || 0 };
      if (editing) {
        await pb.collection('promo_banners').update(editing, data);
        flash('Updated');
      } else {
        await pb.collection('promo_banners').create(data);
        flash('Created');
      }
      setShowForm(false);
      load();
    } catch (e) { flash('Error: ' + (e.message || 'unknown')); }
    setSaving(false);
  };

  const toggleActive = async (b) => {
    try {
      await pb.collection('promo_banners').update(b.id, { active: !b.active });
      load();
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete banner?')) return;
    try { await pb.collection('promo_banners').delete(id); load(); } catch {}
  };

  const S = {
    page: { padding: '24px', minHeight: '100vh', background: '#0a0a0a', color: '#f1f1f1' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 22, fontWeight: 700, letterSpacing: -0.5 },
    btn: { padding: '8px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: '#fff', color: '#000' },
    btnDanger: { padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444' },
    btnSecondary: { padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,0.06)', color: '#bbb' },
    input: { width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f1f1', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
    label: { display: 'block', fontSize: 11, color: '#666', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 40, overflowY: 'auto' },
    modalBox: { background: '#111', borderRadius: 16, padding: 28, width: 560, maxWidth: '96vw', marginBottom: 40 },
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <span style={S.title}>Promo Banners</span>
        <button style={S.btn} onClick={openCreate}>+ New Banner</button>
      </div>

      {msg && <div style={{ background: 'rgba(255,255,255,0.07)', padding: '10px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>{msg}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#444' }}>Loading…</div>
      ) : banners.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#444' }}>No banners yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {banners.map(b => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, borderLeft: `4px solid ${b.bg_color || '#555'}` }}>
              {/* Preview swatch */}
              <div style={{ width: 48, height: 48, borderRadius: 10, background: b.bg_color || '#555', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{b.title_en || '—'}</div>
                <div style={{ fontSize: 11, color: '#666' }}>{b.subtitle_en}</div>
              </div>
              <div style={{ fontSize: 11, color: '#666', marginRight: 8 }}>#{b.sort_order}</div>
              {/* Active toggle */}
              <div onClick={() => toggleActive(b)} style={{ width: 36, height: 20, borderRadius: 10, background: b.active ? '#22c55e' : '#374151', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: b.active ? 19 : 3, transition: 'left .2s' }} />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={S.btnSecondary} onClick={() => openEdit(b)}>Edit</button>
                <button style={S.btnDanger} onClick={() => handleDelete(b.id)}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={S.modal} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={S.modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{editing ? 'Edit Banner' : 'New Banner'}</span>
              <button onClick={() => setShowForm(false)} style={S.btnSecondary}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={S.grid2}>
                <div>
                  <label style={S.label}>Title (EN)</label>
                  <input value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Title (FR)</label>
                  <input value={form.title_fr} onChange={e => setForm(f => ({ ...f, title_fr: e.target.value }))} style={S.input} />
                </div>
              </div>

              <div style={S.grid2}>
                <div>
                  <label style={S.label}>Subtitle (EN)</label>
                  <input value={form.subtitle_en} onChange={e => setForm(f => ({ ...f, subtitle_en: e.target.value }))} style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Subtitle (FR)</label>
                  <input value={form.subtitle_fr} onChange={e => setForm(f => ({ ...f, subtitle_fr: e.target.value }))} style={S.input} />
                </div>
              </div>

              <div style={S.grid2}>
                <div>
                  <label style={S.label}>Background Color</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="color" value={form.bg_color} onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))}
                      style={{ width: 44, height: 42, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'none' }} />
                    <input value={form.bg_color} onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))} style={{ ...S.input, flex: 1 }} />
                  </div>
                </div>
                <div>
                  <label style={S.label}>Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} style={S.input} />
                </div>
              </div>

              <div>
                <label style={S.label}>Target URL (optional)</label>
                <input value={form.target_url} onChange={e => setForm(f => ({ ...f, target_url: e.target.value }))} style={S.input} placeholder="https://..." />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ ...S.label, marginBottom: 0 }}>Active</label>
                <div onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                  style={{ width: 36, height: 20, borderRadius: 10, background: form.active ? '#22c55e' : '#374151', cursor: 'pointer', position: 'relative' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: form.active ? 19 : 3, transition: 'left .15s' }} />
                </div>
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
