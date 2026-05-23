import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../assets/Icons';

// Mock real-time user data
const INITIAL_USERS = [
  {
    id: 'user_123',
    name: 'User_4532',
    email: 'user4532@lumen.test',
    current_screen: '/transfers',
    current_action: 'entering_amount',
    session_duration: '5m 32s',
    device: 'iPhone 15 Pro',
    location: 'Moscow, RU',
    scenario_progress: 'Step 4/9',
    scenario_name: 'Crypto Frozen Funds',
    last_activity: '2s ago',
    status: 'active',
    balance: 12500,
    online: true
  },
  {
    id: 'user_124',
    name: 'User_8821',
    email: 'user8821@lumen.test',
    current_screen: '/cards',
    current_action: 'viewing_card_details',
    session_duration: '12m 15s',
    device: 'iPhone 14',
    location: 'St. Petersburg, RU',
    scenario_progress: 'Step 2/5',
    scenario_name: 'Fraud Investigation',
    last_activity: '5s ago',
    status: 'active',
    balance: 8300,
    online: true
  },
  {
    id: 'user_125',
    name: 'User_1129',
    email: 'user1129@lumen.test',
    current_screen: '/home',
    current_action: 'idle',
    session_duration: '1m 45s',
    device: 'iPad Pro',
    location: 'Novosibirsk, RU',
    scenario_progress: 'Step 1/4',
    scenario_name: 'Large Inheritance',
    last_activity: '15s ago',
    status: 'paused',
    balance: 45000,
    online: true
  },
  {
    id: 'user_126',
    name: 'User_7743',
    email: 'user7743@lumen.test',
    current_screen: '/crypto',
    current_action: 'viewing_prices',
    session_duration: '8m 20s',
    device: 'iPhone 13',
    location: 'Kazan, RU',
    scenario_progress: 'No scenario',
    scenario_name: null,
    last_activity: '3s ago',
    status: 'active',
    balance: 2100,
    online: true
  },
];

export default function AdminMonitoringDashboard() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers(prev => prev.map(user => ({
        ...user,
        last_activity: `${Math.floor(Math.random() * 10) + 1}s ago`,
        session_duration: incrementDuration(user.session_duration)
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const incrementDuration = (duration) => {
    const [mins, secs] = duration.split(' ').map((d, i) => i === 0 ? parseInt(d) : parseInt(d));
    const totalSecs = mins * 60 + secs + 5;
    const newMins = Math.floor(totalSecs / 60);
    const newSecs = totalSecs % 60;
    return `${newMins}m ${newSecs}s`;
  };

  const filteredUsers = users.filter(user => {
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUserAction = (userId, action) => {
    console.log(`Action ${action} for user ${userId}`);
    // TODO: Implement actual actions via WebSocket
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-lumen-black dark:text-white tracking-tight">LIVE MONITORING</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time user control and intervention</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-bold text-green-500">LIVE</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Icons.Users, color: 'bg-blue-500' },
          { label: 'Online Now', value: users.filter(u => u.online).length, icon: Icons.TrendingUp, color: 'bg-green-500' },
          { label: 'In Scenarios', value: users.filter(u => u.scenario_name).length, icon: Icons.Play, color: 'bg-purple-500' },
          { label: 'Total Balance', value: `$${users.reduce((acc, u) => acc + u.balance, 0).toLocaleString()}`, icon: Icons.DollarSign, color: 'bg-yellow-500' },
          { label: 'Active Sessions', value: users.filter(u => u.status === 'active').length, icon: Icons.Zap, color: 'bg-orange-500' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-black text-lumen-black dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon size={18} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Icons.Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1C1C1E] rounded-xl border border-gray-200 dark:border-gray-800 text-lumen-black dark:text-white outline-none focus:border-lumen-accent transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-[#1C1C1E] rounded-xl border border-gray-200 dark:border-gray-800 text-lumen-black dark:text-white outline-none focus:border-lumen-accent transition-all"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      {/* User List */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-black/20">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Current Screen</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Scenario</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Device</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Session</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            <AnimatePresence>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-black/20 cursor-pointer transition-all"
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-lumen-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.name.charAt(0)}
                        </div>
                        {user.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#1C1C1E]" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-lumen-black dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <code className="text-xs font-mono text-lumen-accent bg-blue-500/10 px-2 py-1 rounded">{user.current_screen}</code>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-lumen-black dark:text-white">{user.current_action}</p>
                    <p className="text-xs text-gray-500">{user.last_activity}</p>
                  </td>
                  <td className="px-4 py-4">
                    {user.scenario_name ? (
                      <div>
                        <p className="text-sm font-bold text-lumen-black dark:text-white">{user.scenario_name}</p>
                        <p className="text-xs text-lumen-accent">{user.scenario_progress}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">No scenario</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Icons.Phone size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-lumen-black dark:text-white">{user.device}</p>
                        <p className="text-xs text-gray-500">{user.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-lumen-black dark:text-white">{user.session_duration}</p>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                      user.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserAction(user.id, 'view_screen');
                        }}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                        title="View Screen"
                      >
                        <Icons.Eye size={16} className="text-gray-500" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserAction(user.id, 'send_notification');
                        }}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                        title="Send Notification"
                      >
                        <Icons.Bell size={16} className="text-gray-500" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserAction(user.id, 'emergency_override');
                        }}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                        title="Emergency Override"
                      >
                        <Icons.Zap size={16} className="text-red-500" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1C1C1E] rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-lumen-accent rounded-2xl flex items-center justify-center text-white font-black text-2xl">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-lumen-black dark:text-white">{selectedUser.name}</h2>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedUser.online && (
                        <span className="flex items-center gap-1 text-green-500 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          Online
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{selectedUser.last_activity}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)}>
                  <Icons.X size={24} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Quick Actions */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { icon: Icons.Eye, label: 'View Screen', action: 'view_screen' },
                    { icon: Icons.Bell, label: 'Send Notification', action: 'send_notification' },
                    { icon: Icons.Chat, label: 'Send Message', action: 'send_message' },
                    { icon: Icons.Zap, label: 'Emergency', action: 'emergency_override' },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <motion.button
                        key={action.action}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUserAction(selectedUser.id, action.action)}
                        className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-black/20 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2C2C2E] transition-all"
                      >
                        <Icon size={24} className="text-lumen-accent" />
                        <span className="text-xs font-semibold text-lumen-black dark:text-white">{action.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* User Details */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-lumen-black dark:text-white">Session Info</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Current Screen</span>
                        <code className="text-sm font-mono text-lumen-accent">{selectedUser.current_screen}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Current Action</span>
                        <span className="text-lumen-black dark:text-white">{selectedUser.current_action}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Session Duration</span>
                        <span className="text-lumen-black dark:text-white">{selectedUser.session_duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Device</span>
                        <span className="text-lumen-black dark:text-white">{selectedUser.device}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location</span>
                        <span className="text-lumen-black dark:text-white">{selectedUser.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-lumen-black dark:text-white">Scenario Progress</h3>
                    {selectedUser.scenario_name ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Scenario</span>
                          <span className="text-lumen-black dark:text-white">{selectedUser.scenario_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Progress</span>
                          <span className="text-lumen-accent font-bold">{selectedUser.scenario_progress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status</span>
                          <span className={`font-bold ${selectedUser.status === 'active' ? 'text-green-500' : 'text-orange-500'}`}>
                            {selectedUser.status}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-lumen-accent h-2 rounded-full" style={{ width: '45%' }} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No active scenario</p>
                    )}
                  </div>
                </div>

                {/* Scenario Controls */}
                {selectedUser.scenario_name && (
                  <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 space-y-3">
                    <h3 className="text-lg font-bold text-lumen-black dark:text-white">Scenario Controls</h3>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-3 bg-lumen-accent text-white rounded-xl font-bold"
                        onClick={() => handleUserAction(selectedUser.id, 'pause_scenario')}
                      >
                        Pause Scenario
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-3 bg-white dark:bg-[#2C2C2E] text-lumen-black dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-bold"
                        onClick={() => handleUserAction(selectedUser.id, 'modify_scenario')}
                      >
                        Modify Steps
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold"
                        onClick={() => handleUserAction(selectedUser.id, 'cancel_scenario')}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}