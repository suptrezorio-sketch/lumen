import React, { useState } from 'react';
import { Icons } from '../../../assets/Icons';

export default function RightColumn({ user, userTxs, createTxForUser, updateBalance, auditLogs, updateUserData, deleteTx }) {
  const [activeTab, setActiveTab] = useState('assets');
  const [newTx, setNewTx] = useState({ title: '', amount: '', type: 'incoming', status: 'completed' });
  const [editBalance, setEditBalance] = useState(user.balance || 0);

  // Smart Contract Order fields — matching reference design
  const [scOrder, setScOrder] = useState({
    orderId: user?.smartContract?.orderId || '#530e134a1cfe4563',
    fullOrderId: user?.smartContract?.fullOrderId || '0XAADEC72E51BC6305EDE2F7D358A051BB2B59292C',
    cryptoAmount: user?.smartContract?.cryptoAmount || '10 ETH',
    fiatAmount: user?.smartContract?.fiatAmount || '30991,79 CAD',
    to: user?.smartContract?.to || 'KORBEN DALLAS',
    from: user?.smartContract?.from || 'CYSEC I.C.F.',
    status: user?.smartContract?.status || 'Under Verification',
    dueDate: user?.smartContract?.dueDate || '25 May 2026',
    recipient: user?.smartContract?.recipient || 'LUMEN Bank',
    purpose: user?.smartContract?.purpose || 'Personal Order',
    fluxarium: user?.smartContract?.fluxarium || 'Required',
    amlProof: user?.smartContract?.amlProof || 'Required',
    preAuth: user?.smartContract?.preAuth || 'required',
    taxFee: user?.smartContract?.taxFee || '0%',
    blocksCompleted: user?.smartContract?.blocksCompleted || '1'
  });

  const updateField = (key, val) => setScOrder(prev => ({ ...prev, [key]: val }));

  const fieldRow = (label, key, opts = {}) => (
    <div className={opts.className || ''}>
      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">{label}</label>
      {opts.type === 'select' ? (
        <select value={scOrder[key]} onChange={e => updateField(key, e.target.value)}
          className="w-full bg-[#E8EDF2] dark:bg-[#1C1C1E] px-3 py-2.5 rounded-xl text-sm font-medium outline-none border border-[#D5DCE4] dark:border-[#2A2A2A] text-[#1D1D1F] dark:text-white">
          {(opts.options || []).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : opts.type === 'date' ? (
        <input type="date" value={scOrder[key]} onChange={e => updateField(key, e.target.value)}
          className="w-full bg-[#E8EDF2] dark:bg-[#1C1C1E] px-3 py-2.5 rounded-xl text-sm font-medium outline-none border border-[#D5DCE4] dark:border-[#2A2A2A] text-[#1D1D1F] dark:text-white" />
      ) : (
        <input type="text" value={scOrder[key]} onChange={e => updateField(key, e.target.value)}
          className="w-full bg-[#E8EDF2] dark:bg-[#1C1C1E] px-3 py-2.5 rounded-xl text-sm font-medium outline-none border border-[#D5DCE4] dark:border-[#2A2A2A] text-[#1D1D1F] dark:text-white" />
      )}
    </div>
  );

  return (
    <div className="w-[480px] shrink-0 p-6 overflow-y-auto bg-[#111111] flex flex-col min-w-0">
      {/* Tabs */}
      <div className="flex bg-[#1C1C1E] p-1 rounded-xl mb-6 shrink-0">
        {[{id:'assets', label:'Assets'}, {id:'txs', label:'Payments'}, {id:'smart', label:'Smart Contract'}, {id:'logs', label:'Logs'}].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === t.id ? 'bg-white text-black shadow' : 'text-[#86868B] hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {activeTab === 'assets' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-[#86868B] uppercase tracking-wider mb-3">Main Balance</h4>
              <div className="bg-[#1C1C1E] rounded-2xl p-4">
                <input type="number" value={editBalance} onChange={e => setEditBalance(e.target.value)}
                  className="w-full bg-black rounded-xl px-4 py-3 text-lg font-bold outline-none border border-[#2A2A2A] mb-3 text-white" />
                <button onClick={() => updateBalance(editBalance)} className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm">Update Balance</button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Cards & Accounts</h4>
                <button className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm">+</button>
              </div>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 border border-[#2A2A2A]">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Debit CAD</p>
                  <p className="text-lg font-bold text-white mb-2">**** 8573</p>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-green-400">${(user.balance || 0).toLocaleString()}</span>
                    <button className="text-blue-400">Edit</button>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-xl p-4 border border-blue-500/20">
                  <p className="text-xs text-blue-300 uppercase tracking-widest mb-1">Crypto BTC</p>
                  <p className="text-lg font-bold text-white mb-2">bc1q...x7k9</p>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">0.4521 BTC</span>
                    <button className="text-blue-400">Edit</button>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-xl p-4 border border-emerald-500/20">
                  <p className="text-xs text-emerald-300 uppercase tracking-widest mb-1">Smart Contract</p>
                  <p className="text-lg font-bold text-white mb-2">SC-0x7F3A</p>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">1/3 Blocks</span>
                    <button className="text-blue-400">Manage →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'txs' && (
          <div className="space-y-6">
            <div className="bg-[#1C1C1E] rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Create Payment / Transfer</h4>
              <div className="flex gap-2">
                <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})}
                  className="flex-1 bg-black rounded-xl px-3 py-2 text-sm font-bold outline-none border border-[#2A2A2A] text-white">
                  <option value="incoming">Incoming</option>
                  <option value="outgoing">Outgoing</option>
                </select>
                <select value={newTx.status} onChange={e => setNewTx({...newTx, status: e.target.value})}
                  className="flex-1 bg-black rounded-xl px-3 py-2 text-sm font-bold outline-none border border-[#2A2A2A] text-white">
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <input value={newTx.title} onChange={e => setNewTx({...newTx, title: e.target.value})} placeholder="Title (e.g. Salary)"
                className="w-full bg-black rounded-xl px-3 py-2 text-sm font-bold outline-none border border-[#2A2A2A] text-white" />
              <input type="number" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} placeholder="Amount"
                className="w-full bg-black rounded-xl px-3 py-2 text-sm font-bold outline-none border border-[#2A2A2A] text-white" />
              <button onClick={() => { createTxForUser(newTx); setNewTx({ title: '', amount: '', type: 'incoming', status: 'completed' }) }} 
                className="w-full py-2 bg-white text-black rounded-xl font-bold text-sm">Add Payment</button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#86868B] uppercase tracking-wider mb-3">Ledger History</h4>
              <div className="space-y-2">
                {userTxs.map(tx => (
                  <div key={tx._id} className="bg-[#1C1C1E] rounded-xl p-3 flex justify-between items-center group">
                    <div>
                      <p className="text-sm font-bold text-white">{tx.title}</p>
                      <p className="text-[10px] text-[#86868B] uppercase tracking-widest">{tx.status}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                      </p>
                      <div className="hidden group-hover:flex gap-2 justify-end mt-1">
                        <button className="text-[10px] font-bold text-blue-400">EDIT</button>
                        <button onClick={() => deleteTx(tx._id)} className="text-[10px] font-bold text-red-500">DEL</button>
                      </div>
                    </div>
                  </div>
                ))}
                {userTxs.length === 0 && <p className="text-xs text-[#86868B]">No transactions yet.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'smart' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Create New Order</h3>
            </div>

            {/* Row 1: OrderID, FullOrderId, Crypto, Fiat */}
            <div className="grid grid-cols-2 gap-3">
              {fieldRow('Order ID', 'orderId')}
              {fieldRow('Full Order ID', 'fullOrderId')}
              {fieldRow('Crypto Amount', 'cryptoAmount')}
              {fieldRow('Fiat Amount', 'fiatAmount')}
            </div>

            {/* Row 2: Status, Due Date, Recipient, Purpose */}
            <div className="grid grid-cols-2 gap-3">
              {fieldRow('Status', 'status')}
              {fieldRow('Due Date', 'dueDate')}
              {fieldRow('Recipient', 'recipient')}
              {fieldRow('Purpose', 'purpose')}
            </div>

            {/* Row 3: From, To, Fluxarium, AML */}
            <div className="grid grid-cols-2 gap-3">
              {fieldRow('From', 'from')}
              {fieldRow('To (Beneficiary)', 'to')}
              {fieldRow('Fluxarium', 'fluxarium')}
              {fieldRow('AML Proof', 'amlProof')}
            </div>

            {/* Row 4: PreAuth, TaxFee, Blocks */}
            <div className="grid grid-cols-2 gap-3">
              {fieldRow('Pre-Authorization', 'preAuth')}
              {fieldRow('Tax Fee', 'taxFee')}
              {fieldRow('Blocks Completed', 'blocksCompleted', { type: 'select', options: ['1', '2', '3'] })}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => updateUserData({ smartContract: scOrder })} className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors">Save</button>
              <button className="px-8 py-3 bg-[#2A2A2A] text-white rounded-xl font-bold text-sm hover:bg-[#3A3A3A] transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            <h4 className="text-xs font-bold text-[#86868B] uppercase tracking-wider mb-4">Activity Log</h4>
            <div className="space-y-4">
              {auditLogs.map(log => (
                <div key={log._id} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                    <p className="font-bold text-white">{log.action}</p>
                  </div>
                  <p className="text-xs text-[#86868B] pl-4">{log.details}</p>
                  <p className="text-xs text-[#555555] pl-4 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              ))}
              {auditLogs.length === 0 && <p className="text-xs text-[#86868B]">No recent activity recorded.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
