import React from 'react'
import { motion } from 'framer-motion'
import { Icons } from '../assets/Icons'

const TransactionList = ({ transactions }) => {
  const getIcon = (category) => {
    switch(category) {
      case 'income': return <Icons.TrendingUp size={20} />
      case 'housing': return <Icons.Building size={20} />
      case 'utilities': return <Icons.Zap size={20} />
      case 'crypto': return <Icons.Bitcoin size={20} />
      case 'transfer': return <Icons.Send size={20} />
      case 'phone': return <Icons.Phone size={20} />
      case 'refund': return <Icons.Shield size={20} />
      default: return <Icons.Globe size={20} />
    }
  }

  const getCategoryColor = (category) => {
    switch(category) {
      case 'income': return 'bg-green-100 text-green-700'
      case 'housing': return 'bg-purple-100 text-purple-700'
      case 'utilities': return 'bg-orange-100 text-orange-700'
      case 'crypto': return 'bg-orange-100 text-orange-700'
      case 'transfer': return 'bg-blue-100 text-blue-700'
      case 'phone': return 'bg-blue-100 text-blue-700'
      case 'refund': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="px-5 pb-24">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-lumen-black">Recent Transactions</h3>
        <button className="text-sm font-medium text-lumen-accent">See All</button>
      </div>
      
      <div className="space-y-3">
        {transactions.map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(tx.category)}`}>
                {getIcon(tx.category)}
              </div>
              <div>
                <p className="text-sm font-semibold text-lumen-black">{tx.title}</p>
                <span className="text-xs text-lumen-black/50">{tx.description}</span>
              </div>
            </div>
            <span className={`text-sm font-bold ${tx.type === 'incoming' ? 'text-green-600' : 'text-lumen-black'}`}>
              {tx.type === 'incoming' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString()}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default TransactionList