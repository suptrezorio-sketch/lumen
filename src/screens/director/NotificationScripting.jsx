import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../assets/Icons';

const NOTIFICATION_TEMPLATES = [
  {
    id: 'user_login',
    trigger: 'user_login',
    title: 'Welcome back, ${user_name}',
    body: 'Last login: ${location}, ${time}',
    sound: 'default',
    priority: 'normal'
  },
  {
    id: 'large_transaction',
    trigger: 'large_transaction',
    title: 'Large Transaction Alert',
    body: 'Transaction of $${amount} detected',
    sound: 'alert',
    priority: 'high'
  },
  {
    id: 'card_frozen',
    trigger: 'card_frozen',
    title: 'Card Temporarily Frozen',
    body: 'Contact security for details',
    sound: 'urgent',
    priority: 'critical'
  },
  {
    id: 'balance_update',
    trigger: 'balance_update',
    title: 'Balance Updated',
    body: 'Your balance has changed',
    sound: 'default',
    priority: 'normal'
  },
  {
    id: 'scenario_step',
    trigger: 'scenario_step',
    title: 'Progress Update',
    body: 'You completed step ${step} of ${total}',
    sound: 'success',
    priority: 'normal'
  },
];

const SMS_TEMPLATES = [
  {
    id: 'verification',
    type: 'verification',
    template: 'Your Lumen Bank code is: ${code}',
    auto_generate: true
  },
  {
    id: 'alert',
    type: 'alert',
    template: 'ALERT: ${alert_message}. Call ${phone_number}',
    admin_customizable: true
  },
  {
    id: 'security',
    type: 'security',
    template: 'SECURITY: ${security_message}. Action required.',
    admin_customizable: true
  },
];

const EMAIL_TEMPLATES = [
  {
    id: 'statement',
    type: 'statement',
    subject: 'Your Monthly Statement',
    template: 'Dear ${user_name}, your monthly statement is ready.'
  },
  {
    id: 'security_alert',
    type: 'security_alert',
    subject: 'Security Alert',
    template: 'We detected unusual activity on your account.'
  },
  {
    id: 'promotion',
    type: 'promotion',
    subject: 'Special Offer',
    template: 'Exclusive offer just for you!'
  },
];

export default function NotificationScripting() {
  const [activeTab, setActiveTab] = useState('push');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    body: '',
    sound: 'default',
    priority: 'normal',
    trigger: 'manual'
  });

  const tabs = [
    { id: 'push', label: 'Push Notifications', icon: Icons.Bell },
    { id: 'sms', label: 'SMS Simulation', icon: Icons.Chat },
    { id: 'email', label: 'Email Templates', icon: Icons.Mail },
    { id: 'history', label: 'History', icon: Icons.History },
  ];

  const handleSendTestNotification = (template) => {
    console.log('Sending test notification:', template);
    // TODO: Implement actual notification sending
  };

  const handleCreateNotification = () => {
    console.log('Creating custom notification:', newNotification);
    setShowCreateModal(false);
    setNewNotification({
      title: '',
      body: '',
      sound: 'default',
      priority: 'normal',
      trigger: 'manual'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-500';
      case 'high': return 'bg-orange-500/10 text-orange-500';
      case 'normal': return 'bg-green-500/10 text-green-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-lumen-black dark:text-white tracking-tight">NOTIFICATION CONTROL</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Full notification scripting and control system</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-lumen-black dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-lg"
        >
          <Icons.Plus size={20} />
          Create Custom Notification
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Push Templates', value: NOTIFICATION_TEMPLATES.length, icon: Icons.Bell, color: 'bg-blue-500' },
          { label: 'SMS Templates', value: SMS_TEMPLATES.length, icon: Icons.Chat, color: 'bg-green-500' },
          { label: 'Email Templates', value: EMAIL_TEMPLATES.length, icon: Icons.Mail, color: 'bg-purple-500' },
          { label: 'Sent Today', value: '1,234', icon: Icons.TrendingUp, color: 'bg-orange-500' },
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
                <p className="text-2xl font-black text-lumen-black dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon size={18} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-1 border border-gray-200 dark:border-gray-800">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-3 rounded-xl transition-all flex-1 justify-center ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-lumen-black dark:hover:text-white'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="notificationPill"
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
        {activeTab === 'push' && (
          <motion.div
            key="push"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
          >
            <h3 className="text-lg font-bold text-lumen-black dark:text-white mb-4">Push Notification Templates</h3>
            <div className="space-y-3">
              {NOTIFICATION_TEMPLATES.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold text-lumen-black dark:text-white">{template.title}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(template.priority)}`}>
                        {template.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{template.body}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-400">Trigger: {template.trigger}</span>
                      <span className="text-gray-400">Sound: {template.sound}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSendTestNotification(template)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                      title="Send Test"
                    >
                      <Icons.Send size={16} className="text-gray-500" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Icons.FileText size={16} className="text-gray-500" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'sms' && (
          <motion.div
            key="sms"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
          >
            <h3 className="text-lg font-bold text-lumen-black dark:text-white mb-4">SMS Simulation Templates</h3>
            <div className="space-y-3">
              {SMS_TEMPLATES.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold text-lumen-black dark:text-white">{template.type}</p>
                      {template.auto_generate && (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500">
                          Auto-generate
                        </span>
                      )}
                      {template.admin_customizable && (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-500">
                          Customizable
                        </span>
                      )}
                    </div>
                    <code className="text-sm text-gray-600 dark:text-gray-400">{template.template}</code>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Icons.FileText size={16} className="text-gray-500" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'email' && (
          <motion.div
            key="email"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
          >
            <h3 className="text-lg font-bold text-lumen-black dark:text-white mb-4">Email Templates</h3>
            <div className="space-y-3">
              {EMAIL_TEMPLATES.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex-1">
                    <p className="font-bold text-lumen-black dark:text-white">{template.subject}</p>
                    <code className="text-sm text-gray-600 dark:text-gray-400">{template.template}</code>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Icons.FileText size={16} className="text-gray-500" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-12 border border-gray-200 dark:border-gray-800 flex items-center justify-center h-96"
          >
            <div className="text-center text-gray-500">
              <Icons.History size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-bold">Notification History</p>
              <p className="text-sm mt-2">Coming soon - view all sent notifications</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Custom Notification Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1C1C1E] rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-lumen-black dark:text-white">Create Custom Notification</h2>
                <button onClick={() => setShowCreateModal(false)}>
                  <Icons.X size={24} className="text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-lumen-black dark:text-white mb-2">Title</label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    placeholder="Enter title..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 text-lumen-black dark:text-white outline-none focus:border-lumen-accent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-lumen-black dark:text-white mb-2">Body</label>
                  <textarea
                    value={newNotification.body}
                    onChange={(e) => setNewNotification({...newNotification, body: e.target.value})}
                    placeholder="Enter message..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 text-lumen-black dark:text-white outline-none focus:border-lumen-accent transition-all resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-lumen-black dark:text-white mb-2">Priority</label>
                    <select
                      value={newNotification.priority}
                      onChange={(e) => setNewNotification({...newNotification, priority: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 text-lumen-black dark:text-white outline-none focus:border-lumen-accent transition-all"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-lumen-black dark:text-white mb-2">Sound</label>
                    <select
                      value={newNotification.sound}
                      onChange={(e) => setNewNotification({...newNotification, sound: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 text-lumen-black dark:text-white outline-none focus:border-lumen-accent transition-all"
                    >
                      <option value="default">Default</option>
                      <option value="alert">Alert</option>
                      <option value="urgent">Urgent</option>
                      <option value="success">Success</option>
                    </select>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-xl font-bold"
                  onClick={handleCreateNotification}
                >
                  Create Notification
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}