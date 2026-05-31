import React, { useEffect, useState } from 'react';
import pb from '../../lib/pb';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ client: '', title: '', body: '', type: 'in_app' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [clients, setClients] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [notifs, cls] = await Promise.all([
          pb.collection('notifications').getList(1, 50, { sort: '-created' }),
          pb.collection('clients').getList(1, 200, { sort: 'first_name' }),
        ]);
        setNotifications(notifs.items);
        setClients(cls.items);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const send = async () => {
    if (!form.client || !form.title) return;
    setSaving(true);
    try {
      await pb.collection('notifications').create({
        ...form, sent_by: pb.authStore.model?.id,
      });
      await pb.collection('audit_logs').create({
        admin_id: pb.authStore.model?.id,
        action_type: 'send_notification',
        client_id: form.client,
        entity_type: 'notification',
        new_value: { title: form.title, body: form.body },
      });
      setMsg('Notification sent');
      setForm(f => ({ ...f, title: '', body: '' }));
      const res = await pb.collection('notifications').getList(1, 50, { sort: '-created' });
      setNotifications(res.items);
    } catch { setMsg('Error'); }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div>
      {msg && <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '12px 20px', fontSize: 13, color: '#fff', zIndex: 1000 }}>{msg}</div>}

      {/* Send form */}
      <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Send Notification</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <label style={labelStyle}>Client *</label>
              <select value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} style={{ ...inputStyle, width: 240 }}>
                <option value="">Select client…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({c.email})</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
                {['in_app','push','system'].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ ...inputStyle, width: 400 }} placeholder="Notification title" />
          </div>
          <div>
            <label style={labelStyle}>Message</label>
            <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} style={{ ...inputStyle, width: '100%', height: 70, resize: 'vertical' }} placeholder="Message body" />
          </div>
          <div>
            <button onClick={send} disabled={saving || !form.client || !form.title} style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', background: 'rgba(0,122,255,0.15)', color: '#007AFF', cursor: 'pointer' }}>
              {saving ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Log */}
      <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #1a1a1a', fontSize: 12, fontWeight: 600, color: '#666', letterSpacing: 1, textTransform: 'uppercase' }}>Sent Notifications</div>
        {loading && <div style={{ padding: 24, fontSize: 13, color: '#333' }}>Loading…</div>}
        {!loading && notifications.length === 0 && <div style={{ padding: 24, fontSize: 13, color: '#444' }}>No notifications sent yet</div>}
        {notifications.map(n => (
          <div key={n.id} style={{ padding: '12px 18px', borderBottom: '1px solid #151515', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{n.title}</div>
              {n.body && <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{n.body}</div>}
              <div style={{ fontSize: 10, color: '#444', marginTop: 4 }}>Client: {n.client?.slice(0,8)}…</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#444' }}>{new Date(n.created).toLocaleString()}</div>
              <div style={{ fontSize: 10, color: n.read ? '#34C759' : '#666', marginTop: 2 }}>{n.read ? 'Read' : 'Unread'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const labelStyle = { fontSize: 11, color: '#555', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 5 };
const inputStyle = { background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none', width: 160 };
