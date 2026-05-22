import React, { useState, useEffect } from 'react';
import { Icons } from '../../../assets/Icons';
import LeftColumn from './LeftColumn';
import CenterColumn from './CenterColumn';
import RightColumn from './RightColumn';

export default function CustomerView({ user, onBack, backendUrl, authHeaders, updateStatus }) {
  const [userTxs, setUserTxs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [kycOverride, setKycOverride] = useState(user.kycStatus || 'none');

  useEffect(() => {
    fetchUserData();
  }, [user._id]);

  const fetchUserData = async () => {
    try {
      // Fetch Txs
      const res = await fetch(`${backendUrl}/admin/transactions?userId=${user._id}`, { headers: authHeaders() });
      const data = await res.json();
      setUserTxs(Array.isArray(data) ? data : []);

      // Fetch Logs
      const logsRes = await fetch(`${backendUrl}/admin/audit-logs`, { headers: authHeaders() });
      const logsData = await logsRes.json();
      setAuditLogs(Array.isArray(logsData) ? logsData.filter(l => l.targetUserId === user._id) : []);

      // Fetch Chat
      const chatRes = await fetch(`${backendUrl}/api/chat?userId=${user._id}`);
      const chatData = await chatRes.json();
      setChatHistory(Array.isArray(chatData) ? chatData : []);
    } catch (e) {
      console.error(e);
    }
  };

  const updateUserData = async (data) => {
    await fetch(`${backendUrl}/admin/user/${user._id}`, {
      method: 'PATCH', headers: authHeaders(),
      body: JSON.stringify(data)
    });
    // Optimistic UI update could go here, but for now parent handles refresh
  };

  const saveKyc = async () => {
    await updateUserData({ kycStatus: kycOverride });
    alert('KYC updated');
  };

  const updateBalance = async (newBalance) => {
    await fetch(`${backendUrl}/admin/user/${user._id}/balance`, {
      method: 'PATCH', headers: authHeaders(),
      body: JSON.stringify({ balance: Number(newBalance) })
    });
    alert('Balance updated');
  };

  const createTxForUser = async (newTx) => {
    if (!newTx.title || !newTx.amount) return;
    const txId = `TX-ADM-${Date.now()}`;
    const res = await fetch(`${backendUrl}/api/v1/transfers`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user._id,
        title: newTx.title,
        amount: newTx.type === 'outgoing' ? -Math.abs(Number(newTx.amount)) : Math.abs(Number(newTx.amount)),
        type: newTx.type,
        status: newTx.status,
        txId,
      })
    });
    if (res.ok) {
      fetchUserData();
    }
  };

  const sendChat = async (text) => {
    if (!text.trim()) return;
    const res = await fetch(`${backendUrl}/admin/message`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ text, userId: user._id })
    });
    if (res.ok) {
      const msg = await res.json();
      setChatHistory(prev => [...prev, msg]);
    }
  };

  const sendPush = async (text, toAll) => {
    if (!text.trim()) return;
    // Save to DB
    await fetch(`${backendUrl}/admin/chat/send`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ text, userId: toAll ? null : user._id })
    });
    // Emit real-time to client via socket
    const io = await import('../../../services/socketService').then(m => m.default);
    io.emit('adminCommand', {
      targetUserId: toAll ? 'all' : user._id,
      command: 'SHOW_ALERT',
      data: { title: 'LUMEN Bank', text }
    });
    alert('Push sent and delivered to client!');
  };

  const sendEmail = async (subject, html) => {
    if (!subject.trim() || !html.trim()) return;
    // Emit as a visible alert to the client (simulated email)
    const io = await import('../../../services/socketService').then(m => m.default);
    io.emit('adminCommand', {
      targetUserId: user._id,
      command: 'SHOW_ALERT',
      data: { title: `📧 ${subject}`, text: html.substring(0, 200) }
    });
    alert('Email notification delivered to client!');
  };

  const sendSms = async (text) => {
    if (!text.trim()) return;
    // Emit as a visible alert to the client (simulated SMS)
    const io = await import('../../../services/socketService').then(m => m.default);
    io.emit('adminCommand', {
      targetUserId: user._id,
      command: 'SHOW_ALERT',
      data: { title: '💬 SMS', text }
    });
    alert('SMS notification delivered to client!');
  };

  const deleteTx = async (txId) => {
    if (!confirm('Delete this transaction?')) return;
    await fetch(`${backendUrl}/admin/transaction/${txId}`, {
      method: 'DELETE', headers: authHeaders()
    });
    fetchUserData();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#111111] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-[#2A2A2A] shrink-0">
        <button onClick={onBack} className="text-[#86868B] hover:text-white transition-colors">
          <Icons.ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">Command Center: {user.name}</h2>
      </div>

      <div className="flex flex-1 overflow-hidden overflow-x-auto">
        <LeftColumn user={user} kycOverride={kycOverride} setKycOverride={setKycOverride} saveKyc={saveKyc} updateStatus={updateStatus} updateUserData={updateUserData} />
        
        <CenterColumn user={user} chatHistory={chatHistory} sendChat={sendChat} sendPush={sendPush} sendEmail={sendEmail} sendSms={sendSms} />
        
        <RightColumn user={user} userTxs={userTxs} createTxForUser={createTxForUser} updateBalance={updateBalance} auditLogs={auditLogs} updateUserData={updateUserData} deleteTx={deleteTx} />
      </div>
    </div>
  );
}
