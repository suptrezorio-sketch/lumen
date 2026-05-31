import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';
import { usePbClient } from '../hooks/usePbClient';
import pb from '../lib/pb';

const TYPE_ICON = {
  operation:     { icon: Icons.ArrowUpDown, bg: 'bg-blue-100 dark:bg-blue-900/30',   color: 'text-blue-500' },
  kyc:           { icon: Icons.Shield,       bg: 'bg-orange-100 dark:bg-orange-900/30', color: 'text-orange-500' },
  card:          { icon: Icons.CreditCard,   bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-500' },
  contract:      { icon: Icons.FileText,     bg: 'bg-gray-100 dark:bg-gray-800',      color: 'text-gray-500' },
  support:       { icon: Icons.Chat,         bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-500' },
  system:        { icon: Icons.Bell,         bg: 'bg-gray-100 dark:bg-gray-800',      color: 'text-gray-400' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Notifications({ onNavigate, showToast }) {
  const { t } = useApp();
  const { notifications, refresh } = usePbClient();
  const [marking, setMarking] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    setMarking(true);
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => pb.collection('notifications').update(n.id, { read: true })));
      await refresh();
    } catch {}
    setMarking(false);
  };

  const markRead = async (id) => {
    try {
      await pb.collection('notifications').update(id, { read: true });
      await refresh();
    } catch {}
  };

  const grouped = notifications.reduce((acc, n) => {
    const d = new Date(n.created);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    let key = 'Earlier';
    if (d.toDateString() === today.toDateString()) key = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) key = 'Yesterday';
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  const sections = ['Today', 'Yesterday', 'Earlier'].filter(k => grouped[k]?.length);

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-28 bg-white dark:bg-black">
      <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate('/')}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-lumen-black dark:text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} disabled={marking}
              className="text-xs font-semibold text-blue-500 disabled:opacity-40">
              Mark all read
            </button>
          )}
          {unreadCount === 0 && <div className="w-16" />}
        </div>
      </div>

      <div className="p-5 space-y-6">
        {notifications.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <div className="w-14 h-14 bg-gray-100 dark:bg-[#1C1C1E] rounded-2xl flex items-center justify-center mx-auto">
              <Icons.Bell size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No notifications yet</p>
            <p className="text-xs text-gray-400">Updates about your operations and account will appear here</p>
          </div>
        )}

        {sections.map(section => (
          <div key={section}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{section}</p>
            <div className="space-y-2">
              {(grouped[section] || []).map((n, i) => {
                const meta = TYPE_ICON[n.type] || TYPE_ICON.system;
                const NIcon = meta.icon;
                return (
                  <motion.div key={n.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => { if (!n.read) markRead(n.id); }}
                    className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all ${!n.read ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-gray-50 dark:bg-[#1C1C1E]'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                      <NIcon size={18} className={meta.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold leading-snug ${!n.read ? 'text-lumen-black dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                          {n.title || n.message || 'Notification'}
                        </p>
                        {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                      </div>
                      {n.body && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.body}</p>}
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
