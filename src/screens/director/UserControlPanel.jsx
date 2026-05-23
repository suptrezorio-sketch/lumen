import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Icons } from '../../assets/Icons';

const CONTROL_TABS = [
  { id: 'overview', icon: Icons.User, label: 'Overview' },
  { id: 'chat', icon: Icons.Chat, label: 'Chat' },
  { id: 'notifications', icon: Icons.Bell, label: 'Notifications' },
  { id: 'contracts', icon: Icons.Shield, label: 'Smart Contracts' },
  { id: 'financial', icon: Icons.CreditCard, label: 'Financial' },
  { id: 'data', icon: Icons.FileText, label: 'Data' },
];

export default function UserControlPanel() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user data - will be replaced with API call
  const user = {
    id: userId,
    name: 'User_4532',
    email: 'user4532@lumen.test',
    balance: 12500,
    status: 'active',
    currentScreen: '/home',
    lastActive: '2 min ago',
    phone: '+1 234 567 8900',
    cards: [
      { id: 1, type: 'Virtual', last4: '4532', status: 'active', balance: 8000 },
      { id: 2, type: 'Physical', last4: '8821', status: 'active', balance: 4500 },
    ],
    transactions: [
      { id: 1, type: 'transfer', amount: -500, date: '2024-01-15', description: 'Transfer to User_8821' },
      { id: 2, type: 'deposit', amount: 2000, date: '2024-01-14', description: 'Top up' },
    ],
    activeContracts: [
      { id: 1, type: 'freeze', description: 'Card freeze due to suspicious activity', status: 'active' },
    ],
  };

  return (
    <div className="space-y-6">
      {/* User Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-lumen-accent/10 to-lumen-accent/5 rounded-2xl p-6 border border-lumen-accent/20"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-lumen-accent rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-lumen-black dark:text-white">{user.name}</h1>
                <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${
                  user.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-orange-500'}`} />
                  {user.status}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-gray-500">Current screen: <code className="text-lumen-accent font-mono">{user.currentScreen}</code></span>
                <span className="text-gray-500">Last active: {user.lastActive}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-lumen-black dark:text-white">${user.balance.toLocaleString()}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Total Balance</p>
          </div>
        </div>
      </motion.div>

      {/* Control Tabs */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-1 border border-gray-200 dark:border-gray-800">
        <div className="flex gap-1">
          {CONTROL_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 rounded-xl transition-all flex-1 justify-center ${
                  isActive ? 'text-white' : 'text-gray-500 hover:text-lumen-black dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="controlPill"
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

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                <p className="text-2xl font-black text-lumen-black dark:text-white">{user.cards.length}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Active Cards</p>
              </div>
              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                <p className="text-2xl font-black text-lumen-black dark:text-white">{user.transactions.length}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Transactions</p>
              </div>
              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                <p className="text-2xl font-black text-lumen-black dark:text-white">{user.activeContracts.length}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Active Contracts</p>
              </div>
            </div>

            {/* Cards */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-lumen-black dark:text-white mb-4">Cards</h3>
              <div className="space-y-3">
                {user.cards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Icons.CreditCard size={20} className="text-lumen-accent" />
                      <div>
                        <p className="font-bold text-lumen-black dark:text-white">{card.type} •••• {card.last4}</p>
                        <p className="text-xs text-gray-500">Balance: ${card.balance.toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${card.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {card.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-lumen-black dark:text-white mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {user.transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        {tx.type === 'deposit' ? (
                          <Icons.Plus size={20} className="text-green-500" />
                        ) : (
                          <Icons.Minus size={20} className="text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-lumen-black dark:text-white">{tx.description}</p>
                        <p className="text-xs text-gray-500">{tx.date}</p>
                      </div>
                    </div>
                    <p className={`font-bold ${tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 h-96 flex items-center justify-center"
          >
            <div className="text-center text-gray-500">
              <Icons.Chat size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-bold">Chat Control</p>
              <p className="text-sm">Full chat management interface will be implemented here</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 h-96 flex items-center justify-center"
          >
            <div className="text-center text-gray-500">
              <Icons.Bell size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-bold">Notifications Control</p>
              <p className="text-sm">Push, Email, SMS management will be implemented here</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'contracts' && (
          <motion.div
            key="contracts"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 h-96 flex items-center justify-center"
          >
            <div className="text-center text-gray-500">
              <Icons.Shield size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-bold">Smart Contracts Control</p>
              <p className="text-sm">Contract management will be implemented here</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'financial' && (
          <motion.div
            key="financial"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 h-96 flex items-center justify-center"
          >
            <div className="text-center text-gray-500">
              <Icons.CreditCard size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-bold">Financial Control</p>
              <p className="text-sm">Transaction and card management will be implemented here</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'data' && (
          <motion.div
            key="data"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 h-96 flex items-center justify-center"
          >
            <div className="text-center text-gray-500">
              <Icons.FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-bold">User Data</p>
              <p className="text-sm">Profile and activity data will be implemented here</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}