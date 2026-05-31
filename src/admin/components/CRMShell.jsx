import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const NAV = [
  { path: '/admin/dashboard',   label: 'Dashboard',    icon: '⬡' },
  { path: '/admin/clients',     label: 'Clients',      icon: '◉' },
  { path: '/admin/operations',  label: 'Operations',   icon: '◈' },
  { path: '/admin/kyc',         label: 'KYC / AML',    icon: '◎' },
  { path: '/admin/contracts',   label: 'Contracts',    icon: '◆' },
  { path: '/admin/scenarios',   label: 'Scenarios',    icon: '◧' },
  { path: '/admin/banners',     label: 'Banners',      icon: '◰' },
  { path: '/admin/chat',        label: 'Support',      icon: '◫' },
  { path: '/admin/notifications', label: 'Notifications', icon: '◬' },
  { path: '/admin/audit',       label: 'Audit Log',    icon: '◩' },
];

const S = {
  shell: {
    display: 'flex', minHeight: '100vh',
    background: '#000',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
    color: '#fff',
  },
  sidebar: {
    width: 220, flexShrink: 0,
    background: '#0a0a0a', borderRight: '1px solid #1a1a1a',
    display: 'flex', flexDirection: 'column',
    position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
  },
  logo: {
    padding: '24px 20px 20px',
    borderBottom: '1px solid #1a1a1a',
  },
  logoLabel: { fontSize: 10, letterSpacing: 4, color: '#444', marginBottom: 4, textTransform: 'uppercase' },
  logoName:  { fontSize: 15, fontWeight: 700, color: '#fff' },
  nav: { flex: 1, padding: '12px 0' },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 20px', fontSize: 13, fontWeight: 500,
    color: active ? '#fff' : '#555',
    background: active ? '#151515' : 'transparent',
    borderLeft: `2px solid ${active ? '#007AFF' : 'transparent'}`,
    textDecoration: 'none', transition: 'all 0.15s',
    cursor: 'pointer',
  }),
  navIcon: { fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0 },
  footer: {
    padding: '16px 20px', borderTop: '1px solid #1a1a1a',
  },
  adminLabel: { fontSize: 11, color: '#444', marginBottom: 4 },
  adminEmail: { fontSize: 12, color: '#666', marginBottom: 12, wordBreak: 'break-all' },
  logoutBtn: {
    width: '100%', padding: '8px 0',
    background: 'transparent', border: '1px solid #2a2a2a',
    borderRadius: 6, color: '#666', fontSize: 12,
    cursor: 'pointer', transition: 'all 0.15s',
  },
  main: {
    flex: 1, minWidth: 0, overflowY: 'auto',
    display: 'flex', flexDirection: 'column',
  },
  header: {
    padding: '16px 28px',
    borderBottom: '1px solid #111',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#050505',
    position: 'sticky', top: 0, zIndex: 10,
  },
  headerTitle: { fontSize: 14, fontWeight: 600, color: '#fff' },
  content: { flex: 1, padding: '28px' },
};

function getTitle(path) {
  const found = NAV.find(n => path.startsWith(n.path));
  return found ? found.label : 'Control Center';
}

export default function CRMShell({ admin, onLogout, children }) {
  const location = useLocation();
  const title = getTitle(location.pathname);

  return (
    <div style={S.shell}>
      <aside style={S.sidebar}>
        <div style={S.logo}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <img src="/logo-light.png" style={{ height: 24 }} alt="LUMEN" />
            <span style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>LUMEN</span>
          </div>
          <div style={S.logoName}>Bank Control Center</div>
        </div>

        <nav style={S.nav}>
          {NAV.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => S.navItem(isActive)}
            >
              <span style={S.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={S.footer}>
          <div style={S.adminLabel}>ADMIN</div>
          <div style={S.adminEmail}>{admin?.email || 'admin'}</div>
          <button style={S.logoutBtn} onClick={onLogout}>Sign Out</button>
        </div>
      </aside>

      <main style={S.main}>
        <div style={S.header}>
          <span style={S.headerTitle}>{title}</span>
          <span style={{ fontSize: 11, color: '#333' }}>
            {new Date().toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}
          </span>
        </div>
        <div style={S.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
