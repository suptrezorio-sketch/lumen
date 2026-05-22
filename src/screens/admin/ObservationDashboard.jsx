import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import socket, { updateSocketAuth } from '../../services/socketService';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../assets/Icons';

export default function ObservationDashboard() {
  const { t } = useApp();

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [activityLog, setActivityLog] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const [pendingCardRequests, setPendingCardRequests] = useState([]);
  const [balanceInput, setBalanceInput] = useState('');
  const [modalType, setModalType] = useState('otp_verification');
  
  const [thresholds, setThresholds] = useState({ callTriggerAmount: 100, suspiciousAmount: 50000 });
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  const fetchThresholds = async () => {
    try {
      const res = await fetch(`${backendUrl}/admin/thresholds`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}` }
      });
      if (res.ok) setThresholds(await res.json());
    } catch(e) {}
  };

  useEffect(() => {
    fetchThresholds();
  }, []);

  const updateThreshold = async (key, val) => {
    const newVal = parseInt(val) || 0;
    setThresholds(p => ({ ...p, [key]: newVal }));
  };

  const saveThresholds = async () => {
    try {
      await fetch(`${backendUrl}/admin/thresholds`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}` 
        },
        body: JSON.stringify(thresholds)
      });
      addToLog('SYSTEM', 'ALL', 'Scenario thresholds updated');
    } catch(e) {}
  };

  const addToLog = useCallback((type, userId, message) => {
    setActivityLog((prev) => [
      {
        id: Date.now(),
        type,
        userId: userId?.substring(0, 8),
        message,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 29),
    ]);
  }, []);

  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    // Ensure admin auth payload is correct (server middleware checks isAdmin)
    // Avoid reconnect storms: disconnect -> set auth -> connect, only once.
    socket.disconnect();
    socket.auth = { isAdmin: 'true', userId: 'admin' };
    socket.io.opts.auth = { isAdmin: 'true', userId: 'admin' };
    socket.connect();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onStudentList = (list) => setStudents(list);
    const onStudentUpdate = (s) => {
      setStudents((prev) => {
        const exists = prev.find((p) => p.userId === s.userId);
        return exists ? prev.map((p) => (p.userId === s.userId ? s : p)) : [...prev, s];
      });
    };
    const onStudentOffline = ({ userId }) => {
      setStudents((prev) => prev.map((s) => (s.userId === userId ? { ...s, online: false } : s)));
      addToLog('OFFLINE', userId, 'Disconnected');
    };
    const onStudentAction = (data) => {
      addToLog('ACTION', data.userId, `${data.type}: ${JSON.stringify(data.data || {})}`);

      if (
        data?.type &&
        typeof data.type === 'string' &&
        data.type.startsWith('card_') &&
        data.type.endsWith('_request')
      ) {
        setPendingCardRequests((prev) => {
          const next = [
            {
              id: `${data.userId}_${data.type}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
              userId: data.userId,
              type: data.type,
              data: data.data || {},
              receivedAt: Date.now(),
            },
            ...prev,
          ];
          return next.slice(0, 50);
        });
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('STUDENT_LIST', onStudentList);
    socket.on('STUDENT_UPDATE', onStudentUpdate);
    socket.on('STUDENT_OFFLINE', onStudentOffline);
    socket.on('STUDENT_ACTION', onStudentAction);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('STUDENT_LIST', onStudentList);
      socket.off('STUDENT_UPDATE', onStudentUpdate);
      socket.off('STUDENT_OFFLINE', onStudentOffline);
      socket.off('STUDENT_ACTION', onStudentAction);
    };
  }, [addToLog]);

  const pendingForSelected = useMemo(() => {
    if (!selectedStudent) return [];
    return pendingCardRequests.filter((r) => r.userId === selectedStudent.userId).slice(0, 20);
  }, [pendingCardRequests, selectedStudent]);

  const sendCommand = (event, data) => {
    if (!selectedStudent) return;
    socket.emit('sendToStudent', {
      targetUserId: selectedStudent.userId,
      event,
      data,
    });
  };

  const handleUpdateBalance = () => {
    const amt = parseFloat(balanceInput);
    if (Number.isFinite(amt)) {
      sendCommand('UPDATE_BALANCE', amt);
      setBalanceInput('');
      addToLog('CONTROL', selectedStudent.userId, `Balance updated to $${amt}`);
    }
  };

  const approveCardRequest = (req) => {
    if (!req || !selectedStudent) return;

    const payload = req.data || {};

    if (req.type === 'card_block_request') {
      const cardId = payload.cardId;
      const blocked = Boolean(payload.blocked);
      sendCommand('CARD_BLOCK_SET', { cardId, blocked });
      addToLog('CONTROL', selectedStudent.userId, `Approved CARD_BLOCK_SET for ${cardId}`);
    }

    if (req.type === 'card_limit_request') {
      const { cardId, dailyLimit, monthlyLimit } = payload;
      sendCommand('CARD_LIMIT_SET', { cardId, dailyLimit, monthlyLimit });
      addToLog('CONTROL', selectedStudent.userId, `Approved CARD_LIMIT_SET for ${cardId}`);
    }

    if (req.type === 'card_add_request') {
      const { cardId } = payload;
      sendCommand('CARD_ADD_APPROVED', { cardId });
      addToLog('CONTROL', selectedStudent.userId, `Approved CARD_ADD_APPROVED for ${cardId || ''}`);
    }

    setPendingCardRequests((prev) => prev.filter((p) => p.id !== req.id));
  };

  const rejectCardRequest = (req) => {
    if (!req) return;
    addToLog('CONTROL', selectedStudent?.userId, `Rejected ${req.type}`);
    setPendingCardRequests((prev) => prev.filter((p) => p.id !== req.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}
          />
          <span className="text-sm font-bold text-lumen-black dark:text-white uppercase tracking-wider">
            {isConnected ? 'System Online' : 'System Offline'}
          </span>
        </div>
        <div className="text-xs font-bold text-gray-400">
          ACTIVE STUDENTS: {students.filter((s) => s.online).length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Connected Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase border-b border-gray-50 dark:border-gray-800">
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Balance</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">
                        No active connections...
                      </td>
                    </tr>
                  ) : (
                    students.map((s) => (
                      <tr
                        key={s.userId}
                        onClick={() => setSelectedStudent(s)}
                        className={`cursor-pointer transition-all ${
                          selectedStudent?.userId === s.userId
                            ? 'bg-blue-50 dark:bg-blue-900/10'
                            : 'hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <td className="px-6 py-4 font-mono text-xs font-bold text-lumen-black dark:text-white">
                          {s.userId?.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-blue-500">
                          {s.currentRoute || '/'}
                        </td>
                        <td className="px-6 py-4 font-bold text-lumen-black dark:text-white">
                          ${s.balance?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                              s.online ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {s.online ? 'Online' : 'Offline'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Scenario Thresholds</h3>
              <button onClick={saveThresholds} className="text-[10px] font-bold bg-lumen-black text-white dark:bg-white dark:text-black px-3 py-1.5 rounded-lg">SAVE</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Call Trigger Amount</label>
                <input type="number" value={thresholds.callTriggerAmount} onChange={e => updateThreshold('callTriggerAmount', e.target.value)} className="w-full mt-1 p-2 bg-gray-50 dark:bg-black/20 rounded-lg text-sm border border-transparent focus:border-blue-500/50 outline-none font-bold text-lumen-black dark:text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Suspicious Total (Daily)</label>
                <input type="number" value={thresholds.suspiciousAmount} onChange={e => updateThreshold('suspiciousAmount', e.target.value)} className="w-full mt-1 p-2 bg-gray-50 dark:bg-black/20 rounded-lg text-sm border border-transparent focus:border-blue-500/50 outline-none font-bold text-lumen-black dark:text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Intercepted Actions</h3>
              <button onClick={() => setActivityLog([])} className="text-[10px] font-bold text-red-500 hover:underline">
                CLEAR
              </button>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2 space-y-1 font-mono text-[11px]">
              {activityLog.length === 0 && (
                <div className="text-center py-10 text-gray-300 italic uppercase">Monitoring packets...</div>
              )}
              {activityLog.map((log) => (
                <div
                  key={log.id}
                  className="flex gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-white/5 group border-l-2 border-transparent hover:border-blue-500"
                >
                  <span className="text-gray-400 shrink-0">{log.timestamp}</span>
                  <span
                    className={`font-bold shrink-0 ${
                      log.type === 'ACTION' ? 'text-purple-500' : 'text-blue-500'
                    }`}
                  >
                    [{log.type}]
                  </span>
                  <span className="text-lumen-black dark:text-white font-bold shrink-0">{log.userId}:</span>
                  <span className="text-gray-600 dark:text-gray-400 truncate">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedStudent ? (
              <motion.div
                key="control"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-lg border-2 border-lumen-black dark:border-white p-6 space-y-6 sticky top-6"
              >
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h3 className="text-lg font-black text-lumen-black dark:text-white uppercase tracking-tighter">
                      Command Panel
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400">TARGET: {selectedStudent.userId}</p>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <Icons.X size={20} className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => sendCommand('UI_LOCK', true)}
                      className="flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors uppercase tracking-widest"
                    >
                      <Icons.Lock size={14} /> Lock UI
                    </button>
                    <button
                      onClick={() => sendCommand('UI_LOCK', false)}
                      className="flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors uppercase tracking-widest"
                    >
                      <Icons.Shield size={14} /> Unlock UI
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        sendCommand('TRIGGER_CALL', {
                          callerName: 'LUMEN Security',
                          callerNumber: '+1 (800) 932-1102',
                        })
                      }
                      className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors uppercase tracking-widest"
                    >
                      <Icons.Phone size={14} /> Start Call
                    </button>
                    <button
                      onClick={() => sendCommand('CALL_ENDED', {})}
                      className="flex items-center justify-center gap-2 py-3 bg-gray-600 text-white rounded-xl text-xs font-bold hover:bg-gray-700 transition-colors uppercase tracking-widest"
                    >
                      <Icons.LogOut size={14} /> End Call
                    </button>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-black/20 rounded-2xl space-y-3 border border-gray-100 dark:border-gray-800">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inject Modal</label>
                    <div className="flex gap-2">
                      <select
                        value={modalType}
                        onChange={(e) => setModalType(e.target.value)}
                        className="flex-1 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-xl px-3 text-xs font-bold outline-none"
                      >
                        <option value="otp_verification">OTP Verification</option>
                        <option value="warning">Security Warning</option>
                        <option value="error">Critical Error</option>
                      </select>
                      <button
                        onClick={() => sendCommand('show_modal', { modalType, title: 'Security Alert', message: 'Verification required.' })}
                        className="px-4 py-3 bg-lumen-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold uppercase"
                      >
                        Push
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-black/20 rounded-2xl space-y-3 border border-gray-100 dark:border-gray-800">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Override Balance</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={balanceInput}
                        onChange={(e) => setBalanceInput(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-xl px-4 text-sm font-bold outline-none"
                      />
                      <button
                        onClick={handleUpdateBalance}
                        className="px-4 py-3 bg-lumen-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold uppercase"
                      >
                        Update
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Force Navigation</label>
                    <div className="flex flex-wrap gap-2">
                      {['/home', '/cards', '/crypto', '/transfers', '/history'].map((path) => (
                        <button
                          key={path}
                          onClick={() => sendCommand('FORCE_REDIRECT', path)}
                          className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] font-bold hover:bg-lumen-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase"
                        >
                          {path}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pending card requests */}
                  <div className="p-4 bg-gray-50 dark:bg-black/20 rounded-2xl space-y-3 border border-gray-100 dark:border-gray-800">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Card Requests</label>

                    {pendingForSelected.length === 0 ? (
                      <div className="text-xs text-gray-400 italic">No pending card actions.</div>
                    ) : (
                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {pendingForSelected.map((req) => (
                          <div key={req.id} className="bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-gray-800 rounded-xl p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-lumen-black dark:text-white truncate">
                                  {req.type}
                                </div>
                                <div className="text-[10px] text-gray-500 font-mono break-words">
                                  {JSON.stringify(req.data || {})}
                                </div>
                              </div>
                              <div className="text-[10px] text-gray-400 font-bold">{new Date(req.receivedAt).toLocaleTimeString()}</div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => approveCardRequest(req)}
                                className="flex-1 px-2 py-2 bg-green-500 text-white rounded-lg text-[10px] font-black uppercase"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => rejectCardRequest(req)}
                                className="flex-1 px-2 py-2 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[400px] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center text-center p-10 space-y-4"
              >
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-300">
                  <Icons.User size={32} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Intercept Mode</h4>
                  <p className="text-xs text-gray-400 mt-1">Select a student from the active list to gain control over their session.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
