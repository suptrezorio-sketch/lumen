import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../../lib/pb';
import { processOperationStatus } from '../utils/operationProcessor';

const STATUS_COLORS = {
  Pending:     { bg: 'rgba(255,204,0,0.12)',  color: '#FFCC00' },
  'Under Review': { bg: 'rgba(0,122,255,0.12)', color: '#007AFF' },
  Processing:  { bg: 'rgba(0,122,255,0.12)',  color: '#007AFF' },
  Completed:   { bg: 'rgba(52,199,89,0.12)',  color: '#34C759' },
  Rejected:    { bg: 'rgba(255,59,48,0.12)',  color: '#FF3B30' },
  Submitted:   { bg: 'rgba(255,204,0,0.12)',  color: '#FFCC00' },
};

function Badge({ value }) {
  const s = STATUS_COLORS[value] || { bg: 'rgba(99,99,102,0.12)', color: '#636366' };
  return <span style={{ ...s, fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>{value}</span>;
}

const FILTER_OPTS = ['All','Pending','Under Review','Submitted','Processing'];

export default function PendingOperations() {
  const navigate = useNavigate();
  const [ops, setOps] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const f = filter === 'All'
        ? "status = 'Pending' || status = 'Under Review' || status = 'Submitted'"
        : `status = '${filter}'`;
      const res = await pb.collection('operations').getList(1, 100, { filter: f, sort: '-created' });
      setOps(res.items);
      setTotal(res.totalItems);
    } catch {}
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const act = async (opId, status) => {
    setSaving(opId);
    try {
      await processOperationStatus(opId, status);
      load();
    } catch {}
    setSaving('');
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {FILTER_OPTS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 14px', borderRadius: 8, fontSize: 12,
            border: filter === f ? '1px solid #FFCC00' : '1px solid #222',
            background: filter === f ? 'rgba(255,204,0,0.08)' : '#111',
            color: filter === f ? '#FFCC00' : '#666', cursor: 'pointer',
          }}>{f}</button>
        ))}
        <span style={{ fontSize: 12, color: '#444', marginLeft: 'auto' }}>{total} operations</span>
      </div>

      <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
              {['Client','Type','Amount','Risk','Status','Date','Actions'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#444', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#333', fontSize: 13 }}>Loading…</td></tr>}
            {!loading && ops.length === 0 && <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#444', fontSize: 13 }}>No pending operations</td></tr>}
            {ops.map(op => {
              const canAct = ['Pending','Under Review','Submitted'].includes(op.status);
              return (
                <tr key={op.id} style={{ borderBottom: '1px solid #151515' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <button onClick={() => navigate(`/admin/clients/${op.client}`)} style={{ background: 'none', border: 'none', color: '#007AFF', fontSize: 12, cursor: 'pointer', padding: 0 }}>
                      {op.client?.slice(0, 8)}…
                    </button>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 500 }}>{op.type?.replace(/_/g, ' ')}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700 }}>{op.amount} {op.currency || 'USD'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <Badge value={op.risk_level || 'low'} />
                  </td>
                  <td style={{ padding: '12px 14px' }}><Badge value={op.status} /></td>
                  <td style={{ padding: '12px 14px', fontSize: 11, color: '#555' }}>{new Date(op.created).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 14px' }}>
                    {canAct && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => act(op.id, 'Completed')} disabled={saving === op.id} style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', background: 'rgba(52,199,89,0.15)', color: '#34C759', cursor: 'pointer' }}>Approve</button>
                        <button onClick={() => act(op.id, 'Rejected')} disabled={saving === op.id} style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', background: 'rgba(255,59,48,0.15)', color: '#FF3B30', cursor: 'pointer' }}>Reject</button>
                        <button onClick={() => act(op.id, 'Under Review')} disabled={saving === op.id} style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', background: 'rgba(0,122,255,0.15)', color: '#007AFF', cursor: 'pointer' }}>Hold</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
