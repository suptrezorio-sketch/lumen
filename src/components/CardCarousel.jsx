import React from 'react'
import { motion } from 'framer-motion'
import { Icons } from '../assets/Icons'

const CardCarousel = ({ cards, onSelectCard }) => {
  return (
    <div className="relative w-full px-5 py-2">
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCard(card)}
            className="min-w-[280px] h-[170px] rounded-2xl relative overflow-hidden snap-center cursor-pointer shadow-lg"
            style={{
              background: card.type === 'smart' 
                ? 'linear-gradient(135deg, #F0F0F5 0%, #E8E8F0 100%)' 
                : `url('${card.image}') center/cover no-repeat, #F5F5F7`
            }}
          >
            <div className="absolute inset-0 bg-black/5" />
            <div className="relative z-10 p-5 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-lumen-black/60 uppercase tracking-wider">{card.type === 'smart' ? 'Smart Contract' : 'Debit Card'}</span>
                  <h3 className="text-lg font-bold text-lumen-black mt-0.5">{card.name}</h3>
                </div>
                {card.type === 'crypto' ? <Icons.Bitcoin size={20} className="text-lumen-black/70" /> :
                 card.type === 'smart' ? <Icons.Code size={20} className="text-lumen-black/70" /> : 
                 <Icons.CreditCard size={20} className="text-lumen-black/70" />}
              </div>
              
              <div>
                <span className="text-sm font-mono tracking-wider text-lumen-black/70">{card.number}</span>
                <div className="flex justify-between items-end mt-2">
                  <div>
                    <span className="text-[10px] text-lumen-black/50">Balance</span>
                    <p className="text-lg font-bold text-lumen-black">
                      {card.type === 'crypto' ? `${card.balance} ${card.currency}` : 
                       card.type === 'smart' ? `${card.blocksCompleted}/${card.totalBlocks}` : 
                       `$${card.balance.toLocaleString()}`}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-lumen-black/60">{card.expiry}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-2">
        {cards.map((_, i) => (
          <div key={i} className="h-1.5 rounded-full bg-lumen-black/20 transition-all" style={{ width: i === 0 ? '16px' : '6px' }} />
        ))}
      </div>
    </div>
  )
}

export default CardCarousel