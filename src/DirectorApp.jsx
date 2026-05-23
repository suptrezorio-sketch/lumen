import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DirectorLayout from './components/director/DirectorLayout';
import DirectorNav from './components/director/DirectorNav';
import UserManagement from './screens/director/UserManagement';
import UserControlPanel from './screens/director/UserControlPanel';
import ScenarioBuilder from './screens/director/ScenarioBuilder';
import AudioLibrary from './screens/director/AudioLibrary';

// Placeholder components for other tabs
const Placeholder = ({ title }) => (
  <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-12 border border-gray-200 dark:border-gray-800 flex items-center justify-center h-96">
    <div className="text-center text-gray-500">
      <p className="text-lg font-bold">{title}</p>
      <p className="text-sm mt-2">Coming soon</p>
    </div>
  </div>
);

function DirectorContent() {
  const location = useLocation();

  return (
    <>
      <DirectorNav />
      <Routes>
        <Route path="/" element={<UserManagement />} />
        <Route path="/user/:userId" element={<UserControlPanel />} />
        <Route path="/scenarios" element={<Placeholder title="Scenarios Management" />} />
        <Route path="/builder" element={<ScenarioBuilder />} />
        <Route path="/audio" element={<AudioLibrary />} />
        <Route path="/monitoring" element={<Placeholder title="Live Monitoring" />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />
        <Route path="*" element={<Navigate to="/director" replace />} />
      </Routes>
    </>
  );
}

export default function DirectorApp() {
  const isAdminAuthenticated = localStorage.getItem('director_token') === 'authenticated';

  if (!isAdminAuthenticated) {
    return (
      <div className="h-screen bg-lumen-black dark:bg-white text-white dark:text-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-white dark:bg-lumen-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <img 
              src="https://img.icons8.com/?size=100&id=80t6WVLmSeOM&format=png&color=ffffff" 
              width={40} 
              className="dark:invert" 
              alt="LUMEN Logo" 
            />
          </div>
          <h1 className="text-3xl font-bold mb-4 tracking-tight">DIRECTOR CONSOLE</h1>
          <p className="text-gray-400 mb-8">Authentication required</p>
          <button 
            onClick={() => {
              const pin = prompt('Enter Director PIN:');
              if (pin === 'THEATER2024') {
                localStorage.setItem('director_token', 'authenticated');
                window.location.reload();
              }
            }}
            className="px-8 py-4 bg-white dark:bg-lumen-black text-lumen-black dark:text-white rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform"
          >
            Authenticate
          </button>
        </div>
      </div>
    );
  }

  return (
    <DirectorLayout subtitle="Theater Control Panel">
      <DirectorContent />
    </DirectorLayout>
  );
}
