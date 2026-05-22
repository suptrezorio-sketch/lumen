import { Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from './screens/admin/AdminPanel';
import AdminLogin from './screens/admin/AdminLogin';

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/AdminPanel" element={<AdminPanel onNavigate={() => {}} />} />
      <Route path="*" element={<Navigate to="/admin/AdminPanel" replace />} />
    </Routes>
  );
}
