import React, { useEffect, useState } from 'react';
import pb from '../../lib/pb';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PER_PAGE = 50;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await pb.collection('audit_logs').getList(page, PER_PAGE, { sort: '-created' });
        setLogs(res.items);
        setTotal(res.totalItems);
      } catch {}
      setLoading(false);
    })();
  }, [page]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <div style={{ fontSize: 12, color: '#444', marginBottom: 16 }}>{total} records</div>
      <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
              {['Action','Entity','Client','Admin','Date'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#444', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#333', fontSize: 13 }}>Loading…</td></tr>}
            {!loading && logs.length === 0 && <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#444', fontSize: 13 }}>No audit records yet</td></tr>}
            {logs.map(l => (
              <tr key={l.id} style={{ borderBottom: '1px solid #151515' }}>
                <td style={{ padding: '11px 16px', fontSize: 12, fontWeight: 600, color: '#007AFF' }}>{l.action_type}</td>
                <td style={{ padding: '11px 16px', fontSize: 11, color: '#555' }}>
                  {l.entity_type && <span>{l.entity_type}</span>}
                  {l.entity_id && <span style={{ color: '#333' }}> · {l.entity_id.slice(0,8)}…</span>}
                </td>
                <td style={{ padding: '11px 16px', fontSize: 11, color: '#555' }}>{l.client_id?.slice(0,8) || '—'}</td>
                <td style={{ padding: '11px 16px', fontSize: 11, color: '#555' }}>{l.admin_id?.slice(0,8) || '—'}</td>
                <td style={{ padding: '11px 16px', fontSize: 11, color: '#444' }}>{new Date(l.created).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, border: '1px solid #222', background: '#111', color: page === 1 ? '#333' : '#666', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>← Prev</button>
          <span style={{ fontSize: 12, color: '#444', padding: '8px 0' }}>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, border: '1px solid #222', background: '#111', color: page === totalPages ? '#333' : '#666', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>Next →</button>
        </div>
      )}
    </div>
  );
}
