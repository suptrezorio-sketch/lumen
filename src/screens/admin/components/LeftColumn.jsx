import React, { useState } from 'react';
import { Icons } from '../../../assets/Icons';

export default function LeftColumn({ user, kycOverride, setKycOverride, saveKyc, updateStatus, updateUserData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: user.name, phone: user.phone || '', email: user.email });
  const [showKycDocs, setShowKycDocs] = useState(false);

  const handleSave = async () => {
    await updateUserData(editData);
    setIsEditing(false);
  };

  return (
    <div className="w-[300px] shrink-0 border-r border-[#2A2A2A] p-6 overflow-y-auto space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-[#2A2A2A] mb-4 flex items-center justify-center text-3xl font-bold cursor-pointer relative group">
          {(user.name || '?').charAt(0).toUpperCase()}
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Icons.Camera size={24} className="text-white" />
          </div>
        </div>

        {isEditing ? (
          <input className="bg-[#2A2A2A] text-white text-center font-bold px-2 py-1 rounded w-full mb-2" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
        ) : (
          <h3 className="text-xl font-bold">{user.name || 'Unknown'}</h3>
        )}
        
        <p className="text-[#86868B] text-sm mb-3 font-mono">ID: {user._id.slice(-8)}</p>
        <button onClick={() => setShowKycDocs(true)} className="px-3 py-1 bg-white text-black text-xs font-bold rounded-full uppercase tracking-wider hover:bg-gray-200 transition">
          {user.kycStatus === 'verified' ? 'KYC Verified' : 'Unverified'}
        </button>
      </div>

      {/* Contact Details */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Contact Details</h4>
          <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="text-blue-500 text-xs font-bold">
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Icons.Mail size={16} className="text-[#86868B] shrink-0"/> 
            {isEditing ? <input className="bg-[#2A2A2A] px-2 py-1 rounded w-full text-white" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} /> : <span className="truncate">{user.email}</span>}
          </div>
          <div className="flex items-center gap-3">
            <Icons.Phone size={16} className="text-[#86868B] shrink-0"/> 
            {isEditing ? <input className="bg-[#2A2A2A] px-2 py-1 rounded w-full text-white" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} /> : <span>{user.phone || 'N/A'}</span>}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div>
        <h4 className="text-xs font-bold text-[#86868B] uppercase tracking-wider mb-3">Settings</h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#86868B] block mb-1">KYC Status</label>
            <select value={kycOverride} onChange={e => setKycOverride(e.target.value)}
              className="w-full bg-[#2A2A2A] rounded-lg px-3 py-2 text-sm border-none outline-none text-white">
              {['none','pending','verified','rejected'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
            <button onClick={saveKyc} className="mt-2 w-full py-2 bg-white text-black rounded-lg text-xs font-bold">Update KYC</button>
          </div>
          <div className="pt-2">
            {user.status === 'active' ? (
              <button onClick={() => updateStatus(user._id, 'blocked')} className="w-full py-2 border border-red-500/30 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/10 transition">BLOCK USER</button>
            ) : (
              <button onClick={() => updateStatus(user._id, 'active')} className="w-full py-2 border border-green-500/30 text-green-500 rounded-lg text-xs font-bold hover:bg-green-500/10 transition">ACTIVATE USER</button>
            )}
          </div>
          <div className="pt-2 space-y-2">
            <button onClick={() => {
              import('../../../services/socketService').then(m => {
                m.default.emit('adminCommand', { targetUserId: user._id, command: 'LOCK_DEVICE', data: {} });
              });
              alert('Device locked');
            }} className="w-full py-2 border border-yellow-500/30 text-yellow-500 rounded-lg text-xs font-bold hover:bg-yellow-500/10 transition">🔒 LOCK DEVICE</button>
            <button onClick={() => {
              import('../../../services/socketService').then(m => {
                m.default.emit('adminCommand', { targetUserId: user._id, command: 'UNLOCK_DEVICE', data: {} });
              });
              alert('Device unlocked');
            }} className="w-full py-2 border border-green-500/30 text-green-500 rounded-lg text-xs font-bold hover:bg-green-500/10 transition">🔓 UNLOCK DEVICE</button>
            <button onClick={() => {
              import('../../../services/socketService').then(m => {
                m.default.emit('adminCommand', { targetUserId: user._id, command: 'FORCE_SIGNOUT', data: {} });
              });
              alert('User signed out');
            }} className="w-full py-2 border border-red-500/30 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/10 transition">⛔ FORCE SIGN-OUT</button>
          </div>
        </div>
      </div>

      {/* Full KYC Modal (Mockup) */}
      {showKycDocs && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8 backdrop-blur-sm">
          <div className="bg-[#1C1C1E] rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#38383A]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">KYC & AML Dossier</h2>
              <button onClick={() => setShowKycDocs(false)} className="text-gray-400 hover:text-white"><Icons.X size={24} /></button>
            </div>
            <div className="space-y-6">
              <div className="bg-black rounded-xl p-4">
                <h3 className="text-sm text-gray-400 mb-2 font-bold uppercase tracking-wider">Submitted Questionnaire</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500 w-32 inline-block">Full Name:</span> {user.name}</p>
                  <p><span className="text-gray-500 w-32 inline-block">Date of Birth:</span> 1990-01-01</p>
                  <p><span className="text-gray-500 w-32 inline-block">Nationality:</span> US</p>
                  <p><span className="text-gray-500 w-32 inline-block">Source of Funds:</span> Salary</p>
                </div>
              </div>
              <div className="bg-black rounded-xl p-4">
                <h3 className="text-sm text-gray-400 mb-2 font-bold uppercase tracking-wider">Uploaded Documents</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-[1.6] bg-[#2C2C2E] rounded-lg border border-dashed border-[#444] flex items-center justify-center">
                    <span className="text-gray-500 font-bold">Passport Front</span>
                  </div>
                  <div className="aspect-[1.6] bg-[#2C2C2E] rounded-lg border border-dashed border-[#444] flex items-center justify-center">
                    <span className="text-gray-500 font-bold">Selfie</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
