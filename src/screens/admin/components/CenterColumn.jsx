import React, { useState } from 'react';
import { Icons } from '../../../assets/Icons';

export default function CenterColumn({ user, chatHistory, sendChat, sendPush, sendEmail, sendSms }) {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMsg, setChatMsg] = useState('');
  const [pushMsg, setPushMsg] = useState('');
  const [pushToAll, setPushToAll] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [smsMsg, setSmsMsg] = useState('');

  return (
    <div className="flex-1 min-w-[400px] border-r border-[#2A2A2A] flex flex-col bg-[#0A0A0A]">
      {/* Tabs */}
      <div className="flex border-b border-[#2A2A2A] px-6 pt-6">
        {['chat', 'push', 'email', 'sms'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-bold text-sm uppercase tracking-wider border-b-2 transition-colors ${activeTab === tab ? 'border-white text-white' : 'border-transparent text-[#86868B] hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-black rounded-2xl p-4 border border-[#1C1C1E] overflow-y-auto space-y-3 mb-4">
              {chatHistory.length === 0 && <p className="text-xs text-center text-[#86868B] pt-10">No messages yet</p>}
              {chatHistory.map((m, i) => (
                <div key={i} className={`flex ${m.isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${m.isAdmin ? 'bg-white text-black' : 'bg-[#1C1C1E] text-white'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (sendChat(chatMsg), setChatMsg(''))}
                placeholder="Type a message to this client..."
                className="flex-1 bg-black px-4 py-3 rounded-xl border border-[#2A2A2A] text-sm outline-none text-white focus:border-white transition-colors" />
              <button onClick={() => { sendChat(chatMsg); setChatMsg(''); }}
                className="px-6 py-3 bg-white text-black rounded-xl font-bold text-sm">Send</button>
            </div>
          </div>
        )}

        {activeTab === 'push' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Send Push Notification</h3>
            <textarea value={pushMsg} onChange={e => setPushMsg(e.target.value)} placeholder="Notification body..." rows={4}
              className="w-full bg-black px-4 py-3 rounded-xl border border-[#2A2A2A] text-sm outline-none text-white focus:border-white transition-colors" />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="pushToAll" checked={pushToAll} onChange={e => setPushToAll(e.target.checked)} className="w-4 h-4" />
              <label htmlFor="pushToAll" className="text-sm text-[#86868B]">Send to ALL users (broadcast)</label>
            </div>
            <button onClick={() => { sendPush(pushMsg, pushToAll); setPushMsg(''); }} className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm">Send Push</button>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Send Email (HTML Supported)</h3>
            <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Subject"
              className="w-full bg-black px-4 py-3 rounded-xl border border-[#2A2A2A] text-sm outline-none text-white focus:border-white transition-colors" />
            <textarea value={emailMsg} onChange={e => setEmailMsg(e.target.value)} placeholder="HTML Body..." rows={8}
              className="w-full bg-black px-4 py-3 rounded-xl border border-[#2A2A2A] text-sm outline-none text-white focus:border-white transition-colors font-mono" />
            <button onClick={() => { sendEmail(emailSubject, emailMsg); setEmailMsg(''); setEmailSubject(''); }} className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm">Send Email via SMTP</button>
          </div>
        )}

        {activeTab === 'sms' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Send SMS Notification</h3>
            <p className="text-xs text-[#86868B] mb-2">Will be sent to: {user.phone || 'NO PHONE SET'}</p>
            <textarea value={smsMsg} onChange={e => setSmsMsg(e.target.value)} placeholder="SMS text..." rows={4}
              className="w-full bg-black px-4 py-3 rounded-xl border border-[#2A2A2A] text-sm outline-none text-white focus:border-white transition-colors" />
            <button onClick={() => { sendSms(smsMsg); setSmsMsg(''); }} className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm" disabled={!user.phone}>Send SMS via Webhook</button>
          </div>
        )}
      </div>
    </div>
  );
}
