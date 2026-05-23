import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../../assets/Icons';

export default function UserManagement() {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - will be replaced with API call
  const [users] = useState([
    { id: 1, name: 'User_4532', email: 'user4532@lumen.test', balance: 12500, status: 'active', currentScreen: '/home', lastActive: '2 min ago' },
    { id: 2, name: 'User_8821', email: 'user8821@lumen.test', balance: 8300, status: 'active', currentScreen: '/cards', lastActive: '5 min ago' },
    { id: 3, name: 'User_1129', email: 'user1129@lumen.test', balance: 45000, status: 'paused', currentScreen: '/transfers', lastActive: '1 hour ago' },
    { id: 4, name: 'User_7743', email: 'user7743@lumen.test', balance: 2100, status: 'active', currentScreen: '/crypto', lastActive: '15 min ago' },
  ]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-lumen-black dark:text-white tracking-tight">USERS</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all theater participants</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-lumen-black dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-lg"
        >
          <Icons.Plus size={20} />
          Create User
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Icons.Users, color: 'bg-blue-500' },
          { label: 'Active Now', value: '3', icon: Icons.TrendingUp, color: 'bg-green-500' },
          { label: 'Total Balance', value: '$67,900', icon: Icons.DollarSign, color: 'bg-purple-500' },
          { label: 'Scenarios Active', value: '2', icon: Icons.Play, color: 'bg-orange-500' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-lumen-black dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Icons.Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#1C1C1E] rounded-xl border border-gray-200 dark:border-gray-800 text-lumen-black dark:text-white outline-none focus:border-lumen-accent transition-all"
        />
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-black/20">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Current Screen</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Active</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
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
                  onClick={() => navigate(`/director/user/${user.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-lumen-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-lumen-black dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-lumen-black dark:text-white">${user.balance.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      user.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-orange-500'}`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs font-mono text-lumen-accent bg-blue-500/10 px-2 py-1 rounded">{user.currentScreen}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.lastActive}</td>
                  <td className="px-6 py-4 text-right">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/director/user/${user.id}`);
                      }}
                    >
                      <Icons.ChevronRight size={20} className="text-gray-500" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1C1C1E] rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-lumen-black dark:text-white">Create New User</h2>
                <button onClick={() => setShowCreateForm(false)}>
                  <Icons.X size={24} className="text-gray-500" />
                </button>
              </div>
              {/* Form will be implemented in CreateUserForm component */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-lumen-black dark:text-white mb-2">Name</label>
                  <input type="text" placeholder="User name" className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 text-lumen-black dark:text-white outline-none focus:border-lumen-accent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-lumen-black dark:text-white mb-2">Email</label>
                  <input type="email" placeholder="user@example.com" className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 text-lumen-black dark:text-white outline-none focus:border-lumen-accent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-lumen-black dark:text-white mb-2">Initial Balance</label>
                  <input type="number" placeholder="10000" className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 text-lumen-black dark:text-white outline-none focus:border-lumen-accent transition-all" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-xl font-bold"
                  onClick={() => setShowCreateForm(false)}
                >
                  Create User
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}