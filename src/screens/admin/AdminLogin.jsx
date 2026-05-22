import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../../assets/Icons';

export default function AdminLogin() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
    
    try {
      const res = await fetch(`${backendUrl}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      });
      
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('lumen_admin_token', data.token);
        window.location.href = '/admin/AdminPanel';
      } else {
        setError('Invalid credentials');
      }
    } catch (e) {
      setError('Connection error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-2xl p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-lumen-black dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icons.Shield size={32} className="text-white dark:text-lumen-black" />
          </div>
          <h1 className="text-2xl font-black text-lumen-black dark:text-white uppercase tracking-tight">Admin Access</h1>
          <p className="text-xs text-gray-500 mt-2 uppercase font-bold tracking-widest">Lumen Bank Console</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Login</label>
            <input
              type="text"
              value={login}
              onChange={e => setLogin(e.target.value)}
              className="w-full p-4 bg-gray-50 dark:bg-black/20 rounded-xl text-sm outline-none border border-transparent focus:border-blue-500/50 text-lumen-black dark:text-white transition-all"
              placeholder="admin"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-50 dark:bg-black/20 rounded-xl text-sm outline-none border border-transparent focus:border-blue-500/50 text-lumen-black dark:text-white transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-bold text-center">{error}</p>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-lg"
          >
            Sign In
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}