import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../assets/Icons';
import { useApp } from '../context/AppContext';

export default function SmartContractView({ contract, onBack }) {
  const { user } = useApp();
  const sc = user?.smartContract || {};

  if (!contract) return null;

  // Defaults based on screenshot
  const orderId = sc.orderId || '#530e134a1cfe4563';
  const fullOrderId = sc.fullOrderId || '0XAADEC72E51BC6305EDE2F7D358A051BB2B59292C';
  const cryptoAmount = sc.cryptoAmount || '10 ETH';
  const fiatAmount = sc.fiatAmount || '30991,79 CAD';
  const beneficiary = sc.to || user?.name || 'KORBEN DALLAS';
  const origin = sc.from || 'CYSEC I.C.F.';
  const orderStatus = sc.status || 'Under Verification';
  const dueDate = sc.dueDate || '25 May 2026';
  const amount = sc.fiatAmount || '30991,79 CAD';
  const recipient = sc.recipient || 'LUMEN Bank';
  const accountNumber = sc.accountNumber || orderId;
  const purpose = sc.purpose || 'Personal Order';
  const fluxarium = sc.fluxarium || 'Required';
  const amlProof = sc.amlProof || 'Required';
  const preAuth = sc.preAuth || 'required';
  const taxFee = sc.taxFee || '0%';
  const blocks = Number(sc.blocksCompleted) || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 bg-white z-50 overflow-y-auto pb-24 font-sans text-lumen-black"
    >
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-5 py-4 z-10">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <Icons.ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold">Smart Contract</h2>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Top Card */}
        <div className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-[#F5F6F8] to-[#E8EAEF] border border-gray-200">
          <div className="absolute top-0 right-0 p-6 opacity-30">
             {/* ETH logo representation via SVG */}
             <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
               <path d="M15.925 23.969l-9.819-5.794L15.925 32l9.831-13.825-9.831 5.794z" fill="#1C1C1E" />
               <path d="M15.925 0L6.106 16.313l9.819 5.8 9.831-5.8L15.925 0z" fill="#1C1C1E" />
             </svg>
          </div>

          <div className="relative z-10">
            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Smart Contract</p>
            <h3 className="text-xl font-bold tracking-tight text-black mb-4">{orderId}</h3>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full shadow-sm mb-6">
              <div className="w-2 h-2 rounded-full bg-purple-200 border-2 border-purple-400" />
              <span className="text-xs font-bold text-gray-600">Pending</span>
            </div>

            <div className="text-right mb-6">
              <h1 className="text-4xl font-extrabold tracking-tight text-black">{cryptoAmount}</h1>
              <p className="text-sm font-bold text-gray-500">{fiatAmount}</p>
            </div>

            <div className="mb-6">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
              <p className="text-[10px] text-gray-500 font-mono tracking-wider break-all underline decoration-gray-300 underline-offset-4">{fullOrderId}</p>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Beneficiary</p>
                <p className="text-sm font-bold text-black uppercase">{beneficiary}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Origin</p>
                <p className="text-sm font-bold text-black uppercase">{origin}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        <div className="border border-gray-300 rounded-full py-2.5 px-4 text-center">
          <p className="text-[11px] text-gray-600">This transaction is efficient, {blocks} blocks detected. Awaiting activation.</p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center justify-between px-2 pt-2 pb-4">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${blocks >= 1 ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-gray-100 text-gray-400'}`}>
              <Icons.Check size={24} strokeWidth={3} />
            </div>
            <span className="text-[10px] text-gray-600 font-medium">Agreement</span>
          </div>

          <div className="h-[2px] flex-1 bg-gray-200 mx-1 mb-6 border-t-2 border-dashed border-gray-300"></div>

          <div className="flex flex-col items-center flex-1">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${blocks >= 2 ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-100 text-gray-400'}`}>
               <Icons.Lock size={20} />
            </div>
            <span className="text-[10px] text-gray-600 font-medium">Verification</span>
          </div>

          <div className="h-[2px] flex-1 bg-gray-200 mx-1 mb-6 border-t-2 border-dashed border-gray-300"></div>

          <div className="flex flex-col items-center flex-1">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${blocks >= 3 ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-100 text-gray-400'}`}>
               <Icons.Lock size={20} />
            </div>
            <span className="text-[10px] text-gray-600 font-medium">Settlement</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 pb-8">
          {[
            { label: 'ORDER STATUS', value: orderStatus },
            { label: 'DUE DATE', value: dueDate },
            { label: 'AMOUNT', value: amount },
            { label: 'RECIPIENT', value: recipient },
            { label: 'ACCOUNT NUMBER', value: accountNumber },
            { label: 'PURPOSE', value: purpose },
            { label: 'FROM', value: origin },
            { label: 'TO', value: beneficiary },
            { label: 'FLUXARIUM', value: fluxarium },
            { label: 'AML PROOF', value: amlProof },
            { label: 'PRE-AUTHORIZATION', value: preAuth },
            { label: 'INTERNATIONAL TAX FEE', value: taxFee }
          ].map((item, i) => (
            <div key={i} className="border-[1.5px] border-dashed border-gray-300 rounded-2xl p-3.5 bg-gray-50/50">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-[13px] font-bold text-black leading-tight">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}