import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import pb from '../lib/pb';
import AdminLogin from './pages/AdminLogin';
import CRMShell from './components/CRMShell';
import Dashboard from './pages/Dashboard';
import ClientsList from './pages/ClientsList';
import ClientCard from './pages/clients/ClientCard';
import PendingOperations from './pages/PendingOperations';
import KycReview from './pages/KycReview';
import ScenarioTemplates from './pages/ScenarioTemplates';
import AuditLog from './pages/AuditLog';
import SupportChat from './pages/SupportChat';
import NotificationsPage from './pages/NotificationsPage';
import SmartContracts from './pages/SmartContracts';
import PromoBanners from './pages/PromoBanners';

export default function CRMApp() {
  const [admin, setAdmin] = useState(pb.authStore.isValid ? pb.authStore.model : null);

  useEffect(() => {
    return pb.authStore.onChange((token, model) => {
      setAdmin(model);
    });
  }, []);

  if (!admin) {
    return <AdminLogin onLogin={setAdmin} />;
  }

  return (
    <CRMShell admin={admin} onLogout={() => { pb.authStore.clear(); setAdmin(null); }}>
      <Routes>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/clients" element={<ClientsList />} />
        <Route path="/admin/clients/:id" element={<ClientCard />} />
        <Route path="/admin/operations" element={<PendingOperations />} />
        <Route path="/admin/kyc" element={<KycReview />} />
        <Route path="/admin/scenarios" element={<ScenarioTemplates />} />
        <Route path="/admin/chat" element={<SupportChat />} />
        <Route path="/admin/notifications" element={<NotificationsPage />} />
        <Route path="/admin/audit" element={<AuditLog />} />
        <Route path="/admin/contracts" element={<SmartContracts />} />
        <Route path="/admin/banners" element={<PromoBanners />} />
        <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </CRMShell>
  );
}
