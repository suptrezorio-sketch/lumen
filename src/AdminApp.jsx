import AdminPanel from './screens/admin/AdminPanel';
import { useApp } from './context/AppContext';

export default function AdminApp() {
  const { t } = useApp();
  const handleLogout = () => {
    localStorage.removeItem('lumen_admin_token');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="bg-white dark:bg-[#1C1C1E] shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-lumen-black dark:text-white">LUMEN Bank - {t('admin.title')}</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            {t('profile.signOut')}
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6">
        <AdminPanel onNavigate={() => {}} />
      </div>
    </div>
  );
}
