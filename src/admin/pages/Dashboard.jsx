import React, { useEffect, useState } from 'react';
import pb from '../../lib/pb';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  pending:  { bg: 'rgba(255,204,0,0.12)',  color: '#FFCC00' },
  approved: { bg: 'rgba(52,199,89,0.12)',  color: '#34C759' },
  blocked:  { bg: 'rgba(255,59,48,0.12)',  color: '#FF3B30' },
  rejected: { bg: 'rgba(255,59,48,0.12)',  color: '#FF3B30' },
};

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: '#111', border: '1px solid #1a1a1a',
      borderRadius: 12, padding: '20px 24px',
    }}>
      <div style={{ fontSize: 11, color: '#444', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: accent || '#fff', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#555', marginTop: 8 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ clients: 0, pending: 0, pendingOps: 0, kyc: 0 });
  const [recentClients, setRecentClients] = useState([]);
  const [recentOps, setRecentOps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [allClients, pendingClients, pendingOps, kycReqs, recentC, recentO] = await Promise.all([
          pb.collection('clients').getList(1, 1),
          pb.collection('clients').getList(1, 1, { filter: "account_status = 'pending'" }),
          pb.collection('operations').getList(1, 1, { filter: "status = 'Pending' || status = 'Under Review'" }),
          pb.collection('kyc_requests').getList(1, 1, { filter: "status = 'submitted'" }),
          pb.collection('clients').getList(1, 5, { sort: '-created' }),
          pb.collection('operations').getList(1, 5, { sort: '-created' }),
        ]);
        setStats({
          clients:    allClients.totalItems,
          pending:    pendingClients.totalItems,
          pendingOps: pendingOps.totalItems,
          kyc:        kycReqs.totalItems,
        });
        setRecentClients(recentC.items);
        setRecentOps(recentO.items);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <div style={{ color: '#333', fontSize: 13 }}>Loading…</div>;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Clients"  value={stats.clients}    sub="registered accounts" />
        <StatCard label="Pending Approval" value={stats.pending} sub="awaiting review" accent="#FFCC00" />
        <StatCard label="Pending Operations" value={stats.pendingOps} sub="require action" accent="#FF9F0A" />
        <StatCard label="KYC Submitted" value={stats.kyc} sub="awaiting review" accent="#007AFF" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Clients */}
        <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Recent Clients</span>
            <button onClick={() => navigate('/admin/clients')} style={{ fontSize: 12, color: '#007AFF', background: 'none', border: 'none', cursor: 'pointer' }}>View all</button>
          </div>
          {recentClients.length === 0
            ? <div style={{ padding: '20px', fontSize: 13, color: '#444' }}>No clients yet</div>
            : recentClients.map(c => {
              const st = STATUS_COLORS[c.account_status] || STATUS_COLORS.pending;
              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/admin/clients/${c.id}`)}
                  style={{ padding: '12px 20px', borderBottom: '1px solid #151515', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{c.first_name} {c.last_name}</div>
                    <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{c.email}</div>
                  </div>
                  <span style={{ ...st, fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {c.account_status || 'pending'}
                  </span>
                </div>
              );
            })
          }
        </div>

        {/* Recent Operations */}
        <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Recent Operations</span>
            <button onClick={() => navigate('/admin/operations')} style={{ fontSize: 12, color: '#007AFF', background: 'none', border: 'none', cursor: 'pointer' }}>View all</button>
          </div>
          {recentOps.length === 0
            ? <div style={{ padding: '20px', fontSize: 13, color: '#444' }}>No operations yet</div>
            : recentOps.map(op => (
              <div key={op.id} style={{ padding: '12px 20px', borderBottom: '1px solid #151515', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{op.type?.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{new Date(op.created).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{op.amount} {op.currency || 'USD'}</div>
                  <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{op.status}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
