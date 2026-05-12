import React from 'react'
import { motion } from 'framer-motion'
import { Icons } from '../assets/Icons'
import { useNavigate, useLocation } from 'react-router-dom'

const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const tabs = [
    { id: '/', icon: Icons.Home, label: 'Home' },
    { id: '/cards', icon: Icons.CreditCard, label: 'Cards' },
    { id: '/chat', icon: Icons.Chat, label: 'Chat' },
    { id: '/profile', icon: Icons.User, label: 'Profile' },
  ]

  return (
    <div className="fixed bottom-6 left-4 right-4 z-40">
      <div className="bg-lumen-black rounded-2xl p-2 flex items-center justify-around shadow-xl">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.id
          const Icon = tab.icon
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${isActive ? 'text-white' : 'text-gray-400'}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-lumen-dark rounded-xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <Icon size={20} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNav