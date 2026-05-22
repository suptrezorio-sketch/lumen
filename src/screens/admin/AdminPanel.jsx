import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../assets/Icons';
import ObservationDashboard from './ObservationDashboard';
import { useApp } from '../../context/AppContext';
import socket from '../../services/socketService';
import CustomerView from './components/CustomerView';

export default function AdminPanel({ onNavigate }) {
  const { t } = useApp();
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [creditRequests, setCreditRequests] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [pushText, setPushText] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [seedCount, setSeedCount] = useState(5);
  const [adminMessages, setAdminMessages] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [banners, setBanners] = useState([]);
  const [newBanner, setNewBanner] = useState({ imageUrl: '', linkType: 'url', linkValue: '' });
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionStorage.getItem('lumen_admin_token')}`
  });

  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    const token = sessionStorage.getItem('lumen_admin_token');
    if (!token) {
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        window.location.href = '/admin/login';
      }
      return;
    }
    fetchAllData();

    const handleAdminChat = (msg) => setAdminMessages(prev => [...prev, msg]);
    socket.on('adminChatMessage', handleAdminChat);
    return () => socket.off('adminChatMessage', handleAdminChat);
  }, []);

  const fetchAllData = async () => {
    await fetchUsers();
    await fetchTransactions();
    await fetchCreditRequests();
    await fetchDocuments();
    await fetchAuditLogs();
    await fetchBanners();
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(`${backendUrl}/admin/audit-logs`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(Array.isArray(data) ? data : []);
      }
    } catch { setAuditLogs([]); }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/banners`);
      if (res.ok) {
        const data = await res.json();
        setBanners(Array.isArray(data) ? data : []);
      }
    } catch { setBanners([]); }
  };

  const handleCreateBanner = async () => {
    if (!newBanner.imageUrl) return alert('Image URL is required');
    const res = await fetch(`${backendUrl}/admin/banners`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(newBanner)
    });
    if (res.ok) {
      setNewBanner({ imageUrl: '', linkType: 'url', linkValue: '' });
      fetchBanners();
    }
  };

  const handleToggleBanner = async (id, active) => {
    await fetch(`${backendUrl}/admin/banners/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ active: !active })
    });
    fetchBanners();
  };

  const handleDeleteBanner = async (id) => {
    await fetch(`${backendUrl}/admin/banners/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    fetchBanners();
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${backendUrl}/admin/users`, { headers: authHeaders() });
      if (res.status === 401) { window.location.href = '/admin/login'; return; }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch { setUsers([]); }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${backendUrl}/admin/transactions`, { headers: authHeaders() });
      if (res.status === 401) { window.location.href = '/admin/login'; return; }
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch { setTransactions([]); }
  };

  const fetchCreditRequests = async () => {
    try {
      const res = await fetch(`${backendUrl}/admin/credit-requests`, { headers: authHeaders() });
      if (res.status === 401) { window.location.href = '/admin/login'; return; }
      const data = await res.json();
      setCreditRequests(Array.isArray(data) ? data : []);
    } catch { setCreditRequests([]); }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${backendUrl}/admin/documents`, { headers: authHeaders() });
      if (res.status === 401) { window.location.href = '/admin/login'; return; }
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch { setDocuments([]); }
  };

  const updateStatus = async (userId, status) => {
    await fetch(`${backendUrl}/admin/user/${userId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) });
    fetchUsers();
  };

  const updateBalance = async (userId, balance) => {
    await fetch(`${backendUrl}/admin/user/${userId}/balance`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ balance: Number(balance) }) });
    fetchUsers();
  };

  const handleTxStatus = async (txId, status) => {
    await fetch(`${backendUrl}/admin/transaction/${txId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) });
    fetchTransactions();
  };

  const handleCreditStatus = async (reqId, status) => {
    await fetch(`${backendUrl}/admin/credit-request/${reqId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) });
    fetchCreditRequests();
    fetchUsers();
  };

  const handleDocStatus = async (docId, status) => {
    await fetch(`${backendUrl}/admin/document/${docId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) });
    fetchDocuments();
    fetchUsers();
  };

  const sendPush = async () => {
    if (!pushText.trim()) return;
    const uid = targetUserId?.trim();
    if (uid) {
      await fetch(`${backendUrl}/admin/message`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ text: pushText, userId: uid }),
      });
    } else {
      await fetch(`${backendUrl}/admin/chat/send`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ text: pushText, userId: null }),
      });
    }
    setPushText('');
    setTargetUserId('');
    alert(t('common.success'));
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: <Icons.User size={18} /> },
    { id: 'txs', label: 'Transactions', icon: <Icons.History size={18} /> },
    { id: 'credits', label: 'Credits', icon: <Icons.DollarSign size={18} /> },
    { id: 'docs', label: 'KYC/AML', icon: <Icons.FileText size={18} /> },
    { id: 'chat', label: 'Push', icon: <Icons.Chat size={18} /> },
    { id: 'banners', label: 'Banners', icon: <Icons.Globe size={18} /> },
    { id: 'audit', label: 'Audit Log', icon: <Icons.Lock size={18} /> },
    { id: 'controls', label: 'Controls', icon: <Icons.Shield size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] font-sans">
      {/* Top Glassmorphic Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 dark:bg-black/70 border-b border-[#E5E5EA] dark:border-[#38383A]">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-lumen-black dark:bg-white flex items-center justify-center shadow-sm">
              <img src="https://img.icons8.com/?size=100&id=80t6WVLmSeOM&format=png&color=ffffff" width="22" className="dark:invert" alt="Logo" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">LUMEN CommandCenter</h1>
              <p className="text-[11px] font-medium text-[#86868B] tracking-widest uppercase">System Operations</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={async () => {
                const name = window.prompt('Enter Full Name for new user:');
                if (!name) return;
                const pin = window.prompt('Enter 6-digit PIN for new user (e.g. 123456):', '123456');
                if (!pin) return;
                const res = await fetch(`${backendUrl}/api/v1/onboarding`, {
                  method: 'POST',
                  headers: authHeaders(),
                  body: JSON.stringify({ name, pin, lang: 'en' })
                });
                if (res.ok) {
                  alert(`User ${name} created successfully!`);
                  fetchAllData();
                } else {
                  alert('Failed to create user');
                }
              }}
              className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 transition-colors shadow-sm"
            >
              + Create User
            </button>
            <button 
              onClick={async () => {
                const res = await fetch(`${backendUrl}/admin/sync-test-user`, { method: 'POST', headers: authHeaders() });
                if (res.ok) { alert('Test user 1388 synced!'); fetchAllData(); }
              }}
              className="px-4 py-2 bg-[#F5F5F7] dark:bg-[#1C1C1E] text-sm font-semibold rounded-full hover:bg-black hover:text-white transition-colors border border-[#E5E5EA] dark:border-[#38383A]"
            >
              Sync User 1388
            </button>
            <div className="flex items-center bg-[#E5E5EA]/50 dark:bg-[#1C1C1E] rounded-full p-1 border border-white/20">
              <input 
                type="number" 
                min="1" max="20" 
                value={seedCount}
                onChange={e => setSeedCount(Number(e.target.value))}
                className="w-12 bg-transparent text-center text-sm font-semibold border-none focus:ring-0"
              />
              <button 
                onClick={async () => {
                  if (confirm(`Seed ${seedCount} students?`)) {
                    await fetch(`${backendUrl}/admin/seed`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ count: seedCount }) });
                    fetchAllData();
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-sm"
              >
                Seed Demodata
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col md:flex-row gap-8 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 overflow-x-auto md:overflow-visible">
          <div className="md:sticky md:top-28 flex md:flex-col gap-2 pb-2 md:pb-0">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10 scale-[1.02]' 
                      : 'text-[#86868B] hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 md:p-8 shadow-sm border border-[#E5E5EA] dark:border-[#38383A] min-h-[70vh] overflow-x-auto"
            >
              {/* Users Tab */}
              {activeTab === 'users' && (() => {
                const [selectedUser, setSelectedUser] = React.useState(null);
                const [userTxs, setUserTxs] = React.useState([]);
                const [newTx, setNewTx] = React.useState({ title: '', amount: '', type: 'incoming', description: '', status: 'completed' });
                const [editBalance, setEditBalance] = React.useState('');
                const [chatMsg, setChatMsg] = React.useState('');
                const [chatHistory, setChatHistory] = React.useState([]);
                const [kycOverride, setKycOverride] = React.useState('');
                const [amlOverride, setAmlOverride] = React.useState('');
                const [kycSettings, setKycSettings] = React.useState([]);
                const [smartContract, setSmartContract] = React.useState({
                  dueDate: '', currency: 'USD', status: 'Pending', btcAmount: '0.190013', fiatAmount: '$12,560.66', 
                  from: 'CYSEC ICF', to: '', client: '', footerText: 'This transaction is efficient, 3 blocks detected', 
                  inputValue: '1 BNB', preAuth: 'required', mailbox: '', contactNumber: '', amlProof: 'Required', 
                  blockCount: '3', coinbaseLabel: 'Fluxarium', coinbase: 'Required', liveTransaction: '0%', 
                  step1Url: 'https://ic-fin.com/', step2Url: 'https://aml-secure.ct.ws/', step3Url: 'https://secureclaim.ct.ws/', taxFee: '0%'
                });

                const openUser = async (user) => {
                  setSelectedUser(user);
                  setEditBalance(user.balance);
                  setKycOverride(user.kycStatus || 'none');
                  setAmlOverride(user.amlStatus || 'none');
                  setKycSettings(user.kycSettings || []);
                  if (user.smartContract) setSmartContract(user.smartContract);
                  // Load user transactions
                  try {
                    const res = await fetch(`${backendUrl}/admin/transactions?userId=${user._id}`, { headers: authHeaders() });
                    const data = await res.json();
                    setUserTxs(Array.isArray(data) ? data.filter(t => {
                      const uid = t.userId?._id ? t.userId._id.toString() : t.userId?.toString();
                      return uid === user._id;
                    }) : []);
                  } catch { setUserTxs([]); }
                  // Load chat
                  try {
                    const r2 = await fetch(`${backendUrl}/api/chat?userId=${user._id}`);
                    const d2 = await r2.json();
                    setChatHistory(Array.isArray(d2) ? d2 : []);
                  } catch { setChatHistory([]); }
                };

                const saveBalance = async () => {
                  await fetch(`${backendUrl}/admin/user/${selectedUser._id}/balance`, {
                    method: 'PATCH', headers: authHeaders(),
                    body: JSON.stringify({ balance: Number(editBalance) })
                  });
                  setSelectedUser(u => ({ ...u, balance: Number(editBalance) }));
                  fetchUsers();
                };

                const saveKyc = async () => {
                  await fetch(`${backendUrl}/admin/user/${selectedUser._id}`, {
                    method: 'PATCH', headers: authHeaders(),
                    body: JSON.stringify({ kycStatus: kycOverride })
                  });
                  setSelectedUser(u => ({ ...u, kycStatus: kycOverride }));
                };

                const createTxForUser = async () => {
                  if (!newTx.title || !newTx.amount) return;
                  const txId = `TX-ADM-${Date.now()}`;
                  const res = await fetch(`${backendUrl}/api/v1/transfers`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userId: selectedUser._id,
                      title: newTx.title,
                      description: newTx.description,
                      amount: newTx.type === 'outgoing' ? -Math.abs(Number(newTx.amount)) : Math.abs(Number(newTx.amount)),
                      type: newTx.type,
                      status: newTx.status,
                      txId,
                    })
                  });
                  if (res.ok) {
                    const tx = await res.json();
                    setUserTxs(prev => [tx, ...prev]);
                    setNewTx({ title: '', amount: '', type: 'incoming', description: '', status: 'completed' });
                    // If completed and incoming, update balance display
                    if (newTx.status === 'completed' && newTx.type === 'incoming') {
                      const newBal = Number(selectedUser.balance) + Math.abs(Number(newTx.amount));
                      setEditBalance(newBal);
                      setSelectedUser(u => ({ ...u, balance: newBal }));
                      await fetch(`${backendUrl}/admin/user/${selectedUser._id}/balance`, {
                        method: 'PATCH', headers: authHeaders(),
                        body: JSON.stringify({ balance: newBal })
                      });
                    }
                  }
                };

                const sendChat = async () => {
                  if (!chatMsg.trim()) return;
                  const res = await fetch(`${backendUrl}/admin/message`, {
                    method: 'POST', headers: authHeaders(),
                    body: JSON.stringify({ text: chatMsg, userId: selectedUser._id })
                  });
                  if (res.ok) {
                    const msg = await res.json();
                    setChatHistory(prev => [...prev, msg]);
                    setChatMsg('');
                  }
                };

                // ── User detail page ───────────────────────────────────────
                if (selectedUser) return (
                  <CustomerView
                    user={selectedUser}
                    onBack={() => setSelectedUser(null)}
                    backendUrl={backendUrl}
                    authHeaders={authHeaders}
                    updateStatus={updateStatus}
                  />
                );

                // ── Users List ─────────────────────────────────────────────
                return (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">User Management</h2>
                    <div className="space-y-3">
                      {users.length === 0 && (
                        <div className="text-center py-12 text-[#86868B]">
                          <p className="text-4xl mb-3">👥</p>
                          <p className="font-semibold">No users yet. Click "Seed Demodata" to create test users.</p>
                        </div>
                      )}
                      {users.map(user => (
                        <button key={user._id} onClick={() => openUser(user)}
                          className="w-full text-left flex items-center gap-4 p-4 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-2xl hover:bg-[#E8E8ED] dark:hover:bg-[#38383A] transition-all group">
                          <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-bold shrink-0">
                            {(user.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold truncate">{user.name || 'Unknown'}</p>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                user.status === 'active' || user.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>{(user.status || 'pending').toUpperCase()}</span>
                            </div>
                            <p className="text-sm text-[#86868B] truncate">{user.email} · {user.phone || 'no phone'}</p>
                          </div>
                          <div className="text-right shrink-0 flex items-center gap-3">
                            <div>
                              <p className="font-bold">${(user.balance || 0).toLocaleString()}</p>
                              <p className="text-xs text-[#86868B]">KYC: {user.kycStatus || 'none'}</p>
                            </div>
                            <button onClick={async (e) => {
                              e.stopPropagation();
                              if (!window.confirm('Are you sure you want to delete this user?')) return;
                              const res = await fetch(`${backendUrl}/admin/user/${user._id}`, { method: 'DELETE', headers: authHeaders() });
                              if (res.ok) fetchAllData();
                            }} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors">
                              <Icons.X size={16} />
                            </button>
                            <span className="text-[#86868B] group-hover:text-black dark:group-hover:text-white text-lg ml-1">›</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}


              {/* Transactions Tab */}
              {activeTab === 'txs' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Transaction Ledger</h2>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-[#86868B] border-b border-[#E5E5EA] dark:border-[#38383A]">
                        <th className="pb-3 font-semibold">TX ID</th>
                        <th className="pb-3 font-semibold">User ID</th>
                        <th className="pb-3 font-semibold">Amount</th>
                        <th className="pb-3 font-semibold">Type</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5EA] dark:divide-[#38383A]">
                      {transactions.map(tx => {
                        const txUserId = tx.userId?._id ? tx.userId._id.toString() : (tx.userId?.toString() || '—');
                        const txUserName = tx.userId?.name || txUserId.slice(-6);
                        return (
                        <tr key={tx._id} className="hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors">
                          <td className="py-4 font-mono font-medium">{tx.txId || tx._id?.toString().slice(-8)}</td>
                          <td className="py-4 font-mono text-xs">{txUserName}</td>
                          <td className={`py-4 font-bold ${tx.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>${Math.abs(tx.amount)}</td>
                          <td className="py-4 capitalize">{tx.type}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              tx.status === 'completed' ? 'bg-green-100 text-green-700' : 
                              tx.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                              tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {tx.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 flex gap-2">
                            {(tx.status === 'pending' || tx.status === 'processing') && (
                              <>
                                <button onClick={() => handleTxStatus(tx._id, 'completed')} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200">APPROVE</button>
                                <button onClick={() => handleTxStatus(tx._id, 'rejected')} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200">REJECT</button>
                              </>
                            )}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Credits Tab */}
              {activeTab === 'credits' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Credit Requests</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {creditRequests.map(req => (
                      <div key={req._id} className="bg-[#F5F5F7] dark:bg-black p-5 rounded-2xl border border-[#E5E5EA] dark:border-[#38383A]">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-2xl font-bold">${req.amount}</p>
                            <p className="text-sm text-[#86868B]">{req.term} mo @ {req.rate}%</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${req.status === 'approved' ? 'bg-green-100 text-green-700' : req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {req.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-[#86868B] mb-4">User: {req.userId}</p>
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleCreditStatus(req._id, 'approved')} className="flex-1 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors">Approve</button>
                            <button onClick={() => handleCreditStatus(req._id, 'rejected')} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">Reject</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Docs/KYC Tab */}
              {activeTab === 'docs' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">KYC/AML Documents</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {documents.map(doc => (
                      <div key={doc._id} className="bg-[#F5F5F7] dark:bg-black p-6 rounded-2xl flex flex-col md:flex-row gap-6 border border-[#E5E5EA] dark:border-[#38383A]">
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-[#86868B] uppercase text-xs font-bold tracking-wider">{doc.type}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${doc.status === 'approved' ? 'bg-green-100 text-green-700' : doc.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{doc.status.toUpperCase()}</span>
                          </div>
                          <pre className="text-xs bg-white dark:bg-[#1C1C1E] p-4 rounded-xl overflow-x-auto border border-[#E5E5EA] dark:border-[#38383A]">
                            {JSON.stringify(doc.data, null, 2)}
                          </pre>
                        </div>
                        {doc.status === 'pending' && (
                          <div className="flex flex-col gap-2 justify-center shrink-0">
                            <button onClick={() => handleDocStatus(doc._id, 'approved')} className="w-32 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600">Approve</button>
                            <button onClick={() => handleDocStatus(doc._id, 'rejected')} className="w-32 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600">Reject</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Push Notifications Tab */}
              {activeTab === 'chat' && (
                <div className="max-w-2xl">
                  <h2 className="text-2xl font-bold mb-6">Send Push Notification</h2>
                  <div className="space-y-4 bg-[#F5F5F7] dark:bg-black p-6 rounded-3xl border border-[#E5E5EA] dark:border-[#38383A]">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Target User ID</label>
                      <input 
                        value={targetUserId} onChange={e => setTargetUserId(e.target.value)} 
                        placeholder="Leave empty to broadcast to all"
                        className="w-full px-4 py-3 rounded-xl border border-[#E5E5EA] dark:border-[#38383A] bg-white dark:bg-[#1C1C1E]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Message</label>
                      <textarea 
                        value={pushText} onChange={e => setPushText(e.target.value)} 
                        placeholder="Your message here..." rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-[#E5E5EA] dark:border-[#38383A] bg-white dark:bg-[#1C1C1E]"
                      />
                    </div>
                    <button onClick={sendPush} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                      Send Notification
                    </button>
                  </div>
                </div>
              )}

              {/* Banners Tab */}
              {activeTab === 'banners' && (
                <div>
                  <h2 className="text-2xl font-bold mb-2">Promotional Banners</h2>
                  <p className="text-sm text-gray-500 mb-6">Recommended size: 860x400px (or any 21:9 aspect ratio)</p>
                  <div className="bg-[#F5F5F7] dark:bg-black p-6 rounded-3xl mb-8 border border-[#E5E5EA] dark:border-[#38383A]">
                    <h3 className="font-bold mb-4">Create New Banner</h3>
                    <div className="flex gap-4">
                      <input 
                        placeholder="Image URL" value={newBanner.imageUrl} onChange={e => setNewBanner({...newBanner, imageUrl: e.target.value})}
                        className="flex-1 px-4 py-3 rounded-xl border border-[#E5E5EA] dark:border-[#38383A] bg-white dark:bg-[#1C1C1E]"
                      />
                      <select 
                        value={newBanner.linkType} onChange={e => setNewBanner({...newBanner, linkType: e.target.value})}
                        className="px-4 py-3 rounded-xl border border-[#E5E5EA] dark:border-[#38383A] bg-white dark:bg-[#1C1C1E]"
                      >
                        <option value="url">External URL</option>
                        <option value="internal">Internal Route</option>
                        <option value="none">None</option>
                      </select>
                      <input 
                        placeholder="Link Value" value={newBanner.linkValue} onChange={e => setNewBanner({...newBanner, linkValue: e.target.value})}
                        className="flex-1 px-4 py-3 rounded-xl border border-[#E5E5EA] dark:border-[#38383A] bg-white dark:bg-[#1C1C1E]"
                      />
                      <button onClick={handleCreateBanner} className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl">Add</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banners.map(b => (
                      <div key={b._id} className="relative rounded-2xl overflow-hidden aspect-[21/9] group border border-[#E5E5EA] dark:border-[#38383A]">
                        <img src={b.imageUrl} alt="Banner" className={`w-full h-full object-cover ${!b.active && 'grayscale opacity-50'}`} />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button onClick={() => handleToggleBanner(b._id, b.active)} className="px-4 py-2 bg-white text-black font-bold rounded-lg">
                            {b.active ? 'Disable' : 'Enable'}
                          </button>
                          <button onClick={() => handleDeleteBanner(b._id)} className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audit Log Tab */}
              {activeTab === 'audit' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Audit Log</h2>
                  <div className="overflow-hidden rounded-2xl border border-[#E5E5EA] dark:border-[#38383A]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#F5F5F7] dark:bg-black">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Timestamp</th>
                          <th className="px-4 py-3 font-semibold">Action</th>
                          <th className="px-4 py-3 font-semibold">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA] dark:divide-[#38383A]">
                        {auditLogs.map(log => (
                          <tr key={log._id} className="hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]">
                            <td className="px-4 py-3 text-xs text-[#86868B]">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400">{log.action}</td>
                            <td className="px-4 py-3 text-xs font-mono">{JSON.stringify(log.details)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Controls Tab */}
              {activeTab === 'controls' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Observation & Controls</h2>
                  <ObservationDashboard />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
