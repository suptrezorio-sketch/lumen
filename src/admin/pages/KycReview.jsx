import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../../lib/pb';

const STATUS_COLORS = {
  pending:  { bg: 'rgba(255,204,0,0.12)',  color: '#FFCC00' },
  submitted:{ bg: 'rgba(0,122,255,0.12)',  color: '#007AFF' },
  approved: { bg: 'rgba(52,199,89,0.12)',  color: '#34C759' },
  rejected: { bg: 'rgba(255,59,48,0.12)',  color: '#FF3B30' },
  more_info_required: { bg: 'rgba(255,159,10,0.12)', color: '#FF9F0A' },
};

function Badge({ value }) {
  const s = STATUS_COLORS[value] || { bg: 'rgba(99,99,102,0.12)', color: '#636366' };
  return <span style={{ ...s, fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>{value?.replace(/_/g,' ')}</span>;
}

export default function KycReview() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('submitted');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const f = filter === 'all' ? '' : `status = '${filter}'`;
      const res = await pb.collection('kyc_requests').getList(1, 100, { filter: f || undefined, sort: '-created' });
      setItems(res.items);
    } catch {}
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const act = async (id, status) => {
    setSaving(id);
    try {
      await pb.collection('kyc_requests').update(id, { status, reviewed_by: pb.authStore.model?.id });
      await pb.collection('audit_logs').create({
        admin_id: pb.authStore.model?.id,
        action_type: `kyc_${status}`,
        entity_type: 'kyc_request', entity_id: id,
        new_value: { status },
      });
      load();
    } catch {}
    setSaving('');
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all','pending','submitted','approved','rejected','more_info_required'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 12px', borderRadius: 8, fontSize: 12,
            border: filter === f ? '1px solid #007AFF' : '1px solid #222',
            background: filter === f ? 'rgba(0,122,255,0.08)' : '#111',
            color: filter === f ? '#007AFF' : '#666', cursor: 'pointer',
          }}>{f.replace(/_/g,' ')}</button>
        ))}
      </div>

      <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
              {['Client','Type','Status','Date','Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#444', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#333', fontSize: 13 }}>Loading…</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#444', fontSize: 13 }}>No KYC requests</td></tr>}
            {items.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #151515' }}>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => navigate(`/admin/clients/${r.client}`)} style={{ background: 'none', border: 'none', color: '#007AFF', fontSize: 12, cursor: 'pointer', padding: 0 }}>
                    {r.client?.slice(0,8)}…
                  </button>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{r.type}</td>
                <td style={{ padding: '12px 16px' }}><Badge value={r.status} /></td>
                <td style={{ padding: '12px 16px', fontSize: 11, color: '#555' }}>{new Date(r.created).toLocaleDateString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  {r.status === 'submitted' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => act(r.id,'approved')} disabled={saving===r.id} style={{ padding:'5px 10px', borderRadius:6, fontSize:11, fontWeight:600, border:'none', background:'rgba(52,199,89,0.15)', color:'#34C759', cursor:'pointer' }}>Approve</button>
                      <button onClick={() => act(r.id,'rejected')} disabled={saving===r.id} style={{ padding:'5px 10px', borderRadius:6, fontSize:11, fontWeight:600, border:'none', background:'rgba(255,59,48,0.15)', color:'#FF3B30', cursor:'pointer' }}>Reject</button>
                      <button onClick={() => act(r.id,'more_info_required')} disabled={saving===r.id} style={{ padding:'5px 10px', borderRadius:6, fontSize:11, fontWeight:600, border:'none', background:'rgba(255,159,10,0.15)', color:'#FF9F0A', cursor:'pointer' }}>More Info</button>
                    </div>
                  )}
                  {r.answers && <button onClick={() => alert(JSON.stringify(r.answers, null, 2))} style={{ padding:'5px 10px', borderRadius:6, fontSize:11, border:'1px solid #222', background:'#111', color:'#555', cursor:'pointer', marginLeft: r.status === 'submitted' ? 6 : 0 }}>View Answers</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
