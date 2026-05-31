import React, { useEffect, useState } from 'react';
import pb from '../../lib/pb';

export default function SupportChat() {
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await pb.collection('support_threads').getList(1, 50, { sort: '-created' });
        setThreads(res.items);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const openThread = async (thread) => {
    setSelected(thread);
    try {
      const res = await pb.collection('support_messages').getList(1, 100, {
        filter: `thread = '${thread.id}'`, sort: 'created',
      });
      setMessages(res.items);
    } catch { setMessages([]); }
  };

  const send = async () => {
    if (!text.trim() || !selected) return;
    setSending(true);
    try {
      const msg = await pb.collection('support_messages').create({
        thread: selected.id, sender_type: 'admin',
        sender_id: pb.authStore.model?.id,
        text,
      });
      setMessages(m => [...m, msg]);
      setText('');
    } catch {}
    setSending(false);
  };

  return (
    <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 160px)', background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
      {/* Thread list */}
      <div style={{ width: 260, borderRight: '1px solid #1a1a1a', overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #1a1a1a', fontSize: 12, fontWeight: 600, color: '#666', letterSpacing: 1, textTransform: 'uppercase' }}>Support Threads</div>
        {loading && <div style={{ padding: 16, fontSize: 13, color: '#333' }}>Loading…</div>}
        {!loading && threads.length === 0 && <div style={{ padding: 16, fontSize: 13, color: '#444' }}>No threads</div>}
        {threads.map(t => (
          <div
            key={t.id}
            onClick={() => openThread(t)}
            style={{
              padding: '12px 16px', cursor: 'pointer',
              background: selected?.id === t.id ? '#1a1a1a' : 'transparent',
              borderBottom: '1px solid #151515',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 500 }}>Client {t.client?.slice(0,8)}…</div>
            <div style={{ fontSize: 10, color: t.status === 'open' ? '#34C759' : '#555', marginTop: 3 }}>{t.status}</div>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!selected
          ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 13 }}>Select a thread</div>
          : (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #151515', fontSize: 12, fontWeight: 500 }}>
                Thread: {selected.client?.slice(0,8)}… · <span style={{ color: selected.status === 'open' ? '#34C759' : '#555' }}>{selected.status}</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.length === 0 && <div style={{ fontSize: 13, color: '#333' }}>No messages yet</div>}
                {messages.map(m => (
                  <div key={m.id} style={{ display: 'flex', flexDirection: m.sender_type === 'admin' ? 'row-reverse' : 'row', gap: 8 }}>
                    <div style={{
                      maxWidth: '70%', padding: '9px 14px', borderRadius: 10, fontSize: 13,
                      background: m.sender_type === 'admin' ? 'rgba(0,122,255,0.15)' : '#1a1a1a',
                      color: m.sender_type === 'admin' ? '#007AFF' : '#ccc',
                    }}>
                      {m.text}
                      <div style={{ fontSize: 10, color: '#444', marginTop: 4 }}>{new Date(m.created).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 16px', borderTop: '1px solid #151515', display: 'flex', gap: 10 }}>
                <input
                  value={text} onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Type message…"
                  style={{ flex: 1, background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none' }}
                />
                <button onClick={send} disabled={sending || !text.trim()} style={{ padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', background: 'rgba(0,122,255,0.2)', color: '#007AFF', cursor: 'pointer' }}>Send</button>
              </div>
            </>
          )
        }
      </div>
    </div>
  );
}
