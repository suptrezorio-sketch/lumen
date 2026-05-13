import React from 'react'
import { motion } from 'framer-motion'
import { Icons } from '../assets/Icons'

const SmartContractView = ({ contract, onBack }) => {
  if (!contract) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 bg-white z-50 overflow-y-auto pb-24"
    >
      <div className="sticky top-0 bg-white/90 border-b border-gray-100 px-5 py-4 z-10">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <Icons.ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-bold text-lumen-black">Smart Contract</h2>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Contract Card */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-lumen-black/10 rounded-xl flex items-center justify-center">
                <Icons.ShieldCheck size={20} className="text-lumen-black/70" />
              </div>
              <div>
                <h3 className="font-bold text-lumen-black">SMART CONTRACT</h3>
                <p className="text-xs text-lumen-black/60">Verified escrow agreement</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">ACTIVE</span>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-lumen-black">{contract.balance} {contract.currency}</h1>
            <p className="text-sm text-lumen-black/60 mt-1">≈ €{contract.balance.toLocaleString() * 68000}</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-green-700">Verified</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-lumen-black/50">From</span>
              <p className="font-semibold text-lumen-black">CYSEC ICF</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-lumen-black/50">To</span>
              <p className="font-semibold text-lumen-black">{contract.holder}</p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-between px-2">
          {[
            { label: 'Agreement', step: 1 },
            { label: 'Verification', step: 2 },
            { label: 'Settlement', step: 3 }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 relative flex-1">
              {i < 2 && <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-200 -z-10" />}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border-2 ${item.step <= contract.blocksCompleted ? 'bg-lumen-black text-white border-lumen-black' : 'bg-white text-lumen-black/40 border-gray-200'}`}>
                {item.step <= contract.blocksCompleted ? item.step : <Icons.Lock size={18} />}
              </div>
              <span className="text-xs font-medium text-lumen-black/60">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-lumen-black">Detailed Terms</h3>
          
          {[
            { icon: <Icons.Lock size={20} />, label: 'Hardware wallet | Trezor', value: 'Connected' },
            { icon: <Icons.ShieldCheck size={20} />, label: 'AML verification', value: 'Approved', status: true },
            { icon: <Icons.Percent size={20} />, label: 'Tax reserve', value: '2.2%' }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-lumen-black/70">
                  {item.icon}
                </div>
                <span className="text-sm font-medium text-lumen-black">{item.label}</span>
              </div>
              {item.status ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-semibold text-green-700">{item.value}</span>
                </div>
              ) : (
                <span className="text-sm font-semibold text-lumen-black">{item.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default SmartContractView