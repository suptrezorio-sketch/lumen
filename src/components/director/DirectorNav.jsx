import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '../../assets/Icons';

const DIRECTOR_TABS = [
  { id: 'users', path: '/director', icon: Icons.Users, label: 'Users' },
  { id: 'scenarios', path: '/director/scenarios', icon: Icons.Play, label: 'Scenarios' },
  { id: 'builder', path: '/director/builder', icon: Icons.Script, label: 'Builder' },
  { id: 'audio', path: '/director/audio', icon: Icons.Bell, label: 'Audio' },
  { id: 'notifications', path: '/director/notifications', icon: Icons.Mail, label: 'Notifications' },
  { id: 'monitoring', path: '/director/monitoring', icon: Icons.TrendingUp, label: 'Live' },
  { id: 'settings', path: '/director/settings', icon: Icons.Settings, label: 'Settings' },
];

export default function DirectorNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = DIRECTOR_TABS.find(tab => location.pathname === tab.path)?.id || 
                   DIRECTOR_TABS.find(tab => location.pathname.startsWith(tab.path))?.id || 'users';

  return (
    <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-[#1C1C1E] rounded-2xl">
          {DIRECTOR_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button 
                key={tab.id} 
                onClick={() => navigate(tab.path)}
                className={`relative flex items-center gap-2 px-5 py-3 rounded-xl transition-all ${
                  isActive ? 'text-white' : 'text-gray-500 hover:text-lumen-black dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="navPill"
                    className="absolute inset-0 bg-lumen-black dark:bg-white rounded-xl shadow-lg"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-2">
                  <Icon size={18} />
                  <span className="text-sm font-semibold">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}