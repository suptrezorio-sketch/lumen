import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DirectorConsole from './screens/director/DirectorConsole';

export default function DirectorApp() {
  const isAdminAuthenticated = localStorage.getItem('director_token') === 'authenticated';

  if (!isAdminAuthenticated) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Director Console</h1>
          <p className="text-zinc-400 mb-6">Authentication required</p>
          <button 
            onClick={() => {
              const pin = prompt('Enter Director PIN:');
              if (pin === 'THEATER2024') {
                localStorage.setItem('director_token', 'authenticated');
                window.location.reload();
              }
            }}
            className="px-6 py-3 bg-white text-black rounded-lg font-semibold"
          >
            Authenticate
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/director" element={<DirectorConsole />} />
        <Route path="/director/*" element={<DirectorConsole />} />
        <Route path="*" element={<Navigate to="/director" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
