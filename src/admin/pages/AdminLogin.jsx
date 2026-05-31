import React, { useState } from 'react';
import pb from '../../lib/pb';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // PocketBase v0.22 uses /api/admins/auth-with-password
      // SDK v0.27 changed to _superusers — use direct fetch for compatibility
      const pbUrl = import.meta.env.VITE_PB_URL || window.location.origin;
      const res = await fetch(`${pbUrl}/api/admins/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid credentials');
      // Manually save token to pb authStore so SDK works for subsequent requests
      pb.authStore.save(data.token, data.admin);
      onLogin(data.admin);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
    }}>
      <div style={{
        background: '#111',
        border: '1px solid #222',
        borderRadius: 16,
        padding: '48px 40px',
        width: 380,
        maxWidth: '90vw',
      }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <img src="/logo-light.png" style={{ height: 32 }} alt="LUMEN" />
            <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>LUMEN</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Bank Control Center</div>
          <div style={{ fontSize: 13, color: '#555', marginTop: 6 }}>Administrator access</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6, letterSpacing: 1 }}>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#1a1a1a', border: '1px solid #2a2a2a',
                borderRadius: 8, padding: '12px 14px',
                color: '#fff', fontSize: 15, outline: 'none',
              }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6, letterSpacing: 1 }}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#1a1a1a', border: '1px solid #2a2a2a',
                borderRadius: 8, padding: '12px 14px',
                color: '#fff', fontSize: 15, outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              color: '#ff3b30', fontSize: 13,
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px 0',
              background: loading ? '#333' : '#fff',
              color: '#000', border: 'none',
              borderRadius: 8, fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
