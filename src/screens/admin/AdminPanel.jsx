import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../../assets/Icons';
import ObservationDashboard from './ObservationDashboard';
import { useApp } from '../../context/AppContext';

export default function AdminPanel({ onNavigate }) {
  const { t } = useApp();
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [creditRequests, setCreditRequests] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [pushText, setPushText] = useState('');
  const [targetUserId, setTargetUserId] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await fetchUsers();
    await fetchTransactions();
    await fetchCreditRequests();
    await fetchDocuments();
  };

  const fetchUsers = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const res = await fetch(`${backendUrl}/admin/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch { setUsers([]); }
  };

  const fetchTransactions = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const res = await fetch(`${backendUrl}/admin/transactions`);
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch { setTransactions([]); }
  };

  const fetchCreditRequests = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const res = await fetch(`${backendUrl}/admin/credit-requests`);
      const data = await res.json();
      setCreditRequests(Array.isArray(data) ? data : []);
    } catch { setCreditRequests([]); }
  };

  const fetchDocuments = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const res = await fetch(`${backendUrl}/admin/documents`);
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch { setDocuments([]); }
  };

  const updateStatus = async (userId, status) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    await fetch(`${backendUrl}/admin/user/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchUsers();
  };

  const updateBalance = async (userId, balance) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    await fetch(`${backendUrl}/admin/user/${userId}/balance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ balance: Number(balance) })
    });
    fetchUsers();
  };

  const handleTxStatus = async (txId, status) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    await fetch(`${backendUrl}/admin/transaction/${txId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchTransactions();
  };

  const handleCreditStatus = async (reqId, status) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    await fetch(`${backendUrl}/admin/credit-request/${reqId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchCreditRequests();
    fetchUsers();
  };

  const handleDocStatus = async (docId, status) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    await fetch(`${backendUrl}/admin/document/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchDocuments();
    fetchUsers();
  };

  const sendPush = async () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    await fetch(`${backendUrl}/admin/chat/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: pushText, userId: targetUserId || null })
    });
    setPushText('');
    setTargetUserId('');
    alert(t('common.success'));
  };

  const tabs = [
    { id: 'users', label: t('admin.tabs.users') },
    { id: 'txs', label: t('admin.tabs.txs') },
    { id: 'credits', label: t('admin.tabs.credits') },
    { id: 'docs', label: t('admin.tabs.docs') },
    { id: 'chat', label: t('admin.tabs.chat') },
    { id: 'controls', label: t('admin.tabs.controls') },
  ];

  return (
    <div className="h-full bg-gray-50 dark:bg-black overflow-y-auto scrollbar-hide">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-lumen-black dark:text-white tracking-tighter uppercase">{t('admin.title')}</h1>
            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Management & Surveillance Console</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <nav className="flex gap-1 bg-white dark:bg-[#1C1C1E] p-1.5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
              {tabs.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-tight ${activeTab === tab.id ? 'bg-lumen-black dark:bg-white text-white dark:text-black shadow-lg' : 'text-gray-400 hover:text-lumen-black dark:hover:text-white'}`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            <button 
              onClick={async () => {
                if (confirm('Seed demo data?')) {
                  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
                  await fetch(`${backendUrl}/admin/seed`, { method: 'POST' });
                  fetchAllData();
                }
              }}
              className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
              title="Seed Demo Data"
            >
              <Icons.Plus size={20} />
            </button>
          </div>
        </div>

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 gap-4">
            {users.map(user => (
              <motion.div 
                key={user._id} 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1C1C1E] p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">
                    {user.name ? user.name[0] : '?'}
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="font-bold text-lumen-black dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        user.status === 'approved' ? 'bg-green-100 text-green-600' : 
                        user.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>{t('profile.' + user.status)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        user.kycStatus === 'verified' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>{user.kycStatus === 'verified' ? t('profile.approved') : t('profile.pending')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-black/20 px-3 py-1.5 rounded-lg">
                    <span className="text-xs text-gray-400">{t('admin.user.balance')}:</span>
                    <input 
                      type="number" 
                      defaultValue={user.balance} 
                      onBlur={(e) => updateBalance(user._id, e.target.value)}
                      className="w-20 bg-transparent text-sm font-bold text-lumen-black dark:text-white outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(user._id, 'approved')} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      <Icons.Check size={16} />
                    </button>
                    <button onClick={() => updateStatus(user._id, 'blocked')} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                      <Icons.X size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'txs' && (
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-sm overflow-x-auto scrollbar-hide">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-gray-50 dark:bg-black/20 text-gray-500 uppercase text-[10px] font-bold">
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4">{t('history.txId')}</th>
                  <th className="px-6 py-4">{t('admin.tabs.users')}</th>
                  <th className="px-6 py-4">{t('transfers.amount')}</th>
                  <th className="px-6 py-4">{t('history.status')}</th>
                  <th className="px-6 py-4">{t('common.confirm')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {transactions.map(tx => (
                  <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{tx.txId}</td>
                    <td className="px-6 py-4 font-medium text-lumen-black dark:text-white">{tx.userId?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 font-bold text-lumen-black dark:text-white">${tx.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-600' : 
                        tx.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {tx.status === 'completed' ? t('history.completed') : tx.status === 'rejected' ? t('profile.rejected') : t('history.pending')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleTxStatus(tx._id, 'completed')} className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600">
                          <Icons.Check size={14} />
                        </button>
                        <button onClick={() => handleTxStatus(tx._id, 'rejected')} className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600">
                          <Icons.X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'credits' && (
          <div className="grid grid-cols-1 gap-4">
            {creditRequests.map(req => (
              <motion.div key={req._id} className="bg-white dark:bg-[#1C1C1E] p-5 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-lumen-black dark:text-white">{req.userId?.name}</p>
                  <p className="text-xs text-gray-500">{t('transfers.amount')}: ${req.amount} | {t('admin.credits.term') || 'Term'}: {req.term} | {t('admin.credits.rate') || 'Rate'}: {req.rate}%</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tight">{req.collateral}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleCreditStatus(req._id, 'approved')} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"><Icons.Check size={16} /></button>
                  <button onClick={() => handleCreditStatus(req._id, 'rejected')} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><Icons.X size={16} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="grid grid-cols-1 gap-4">
            {documents.map(doc => (
              <motion.div key={doc._id} className="bg-white dark:bg-[#1C1C1E] p-5 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400"><Icons.FileText size={20} /></div>
                  <div>
                    <p className="font-bold text-lumen-black dark:text-white">{doc.userId?.name}</p>
                    <p className="text-xs text-gray-500 uppercase font-bold">{doc.type} • {doc.status}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDocStatus(doc._id, 'approved')} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"><Icons.Check size={16} /></button>
                  <button onClick={() => handleDocStatus(doc._id, 'rejected')} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><Icons.X size={16} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-2xl shadow-sm space-y-6 max-w-2xl">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-lumen-black dark:text-white">{t('admin.chat.title')}</h3>
              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder={t('admin.chat.placeholder')}
                  value={targetUserId}
                  onChange={e => setTargetUserId(e.target.value)}
                  className="w-full p-4 bg-gray-50 dark:bg-black/20 rounded-xl text-sm outline-none border border-transparent focus:border-blue-500/50 text-lumen-black dark:text-white transition-all"
                />
                <textarea 
                  placeholder={t('admin.chat.messagePlaceholder')}
                  value={pushText}
                  onChange={e => setPushText(e.target.value)}
                  className="w-full p-4 bg-gray-50 dark:bg-black/20 rounded-xl text-sm outline-none border border-transparent focus:border-blue-500/50 text-lumen-black dark:text-white h-40 resize-none transition-all"
                />
                <motion.button 
                  whileTap={{ scale: 0.98 }} 
                  onClick={sendPush}
                  className="w-full py-4 bg-lumen-black dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-lg"
                >
                  {t('admin.chat.send')}
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'controls' && (
          <ObservationDashboard />
        )}
      </div>
    </div>
  );
}
