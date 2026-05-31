import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icons } from '../assets/Icons';
import { usePbClient } from '../hooks/usePbClient';
import pb from '../lib/pb';

export default function Cards({ onNavigate, showToast }) {
  const { t, cards: localCards, updateCard, user } = useApp();
  const { cards: pbCards, hasPbClient, refresh } = usePbClient();
  const [selectedCard, setSelectedCard] = useState(null);
  const [flippedId, setFlippedId] = useState(null);
  const [internetEnabled, setInternetEnabled] = useState({});
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitValue, setLimitValue] = useState('5000');
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [newCardType, setNewCardType] = useState('fiat');
  const [newCardCurrency, setNewCardCurrency] = useState('CAD');

  const CRYPTO_SYMBOLS = ['BTC','ETH','USDT','USDC','BNB','SOL','LTC','XRP','ADA','DOGE'];

  // Normalise a card from PB or local into a common shape
  const normalise = (card) => {
    const isCrypto = card.type === 'crypto' || CRYPTO_SYMBOLS.includes(card.currency?.toUpperCase());
    return {
      ...card,
      name:     card.label || card.name || 'LUMEN Card',
      number:   (card.number_last4 && card.number_last4 !== '0000')
                  ? `•••• •••• •••• ${card.number_last4}`
                  : (card.number || '•••• •••• •••• ••••'),
      balance:  card.available_balance ?? card.balance ?? 0,
      blocked:  card.status === 'frozen' || card.status === 'blocked' || card.blocked || false,
      currency: card.currency || 'CAD',
      type:     isCrypto ? 'crypto' : (card.type || 'fiat'),
    };
  };

  const displayCards = (hasPbClient && pbCards.length > 0 ? pbCards : localCards).map(normalise);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
    showToast(t('cards.copied'));
  };

  const handleBlockStep = (cardId, block) => {
    const card = displayCards.find(c => c.id === cardId);
    if (card && block === (card.blocksCompleted ?? 0) + 1) {
      updateCard(cardId, { blocksCompleted: block });
    }
  };

  const generateLumePass = async (id, balance, card) => {
    try {
      showToast('Generating Apple Wallet pass...');
      const cardLast4 = card.number_last4 || card.number?.slice(-4) || '****';
      const holderName = user?.name?.toUpperCase() || user?.first_name?.toUpperCase() || 'LUMEN CLIENT';
      const body = {
        barcodeValue: 'https://lumebank.netlify.app',
        barcodeFormat: 'QR',
        logoText: 'LUMEN',
        colorPreset: 'dark',
        color: '#000000',
        primaryFields: [{ label: `**** ${cardLast4}`, value: holderName }],
        secondaryFields: [
          { label: 'EXPIRY', value: card.expiry || '12/29' },
        ],
        headerFields: [
          { label: 'BALANCE', value: `${parseFloat(balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ${card.currency || 'CAD'}` }
        ],
      };
      const response = await fetch('https://api.walletwallet.dev/api/pkpass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ww_live_225f091d1ca8c9dfc1717baa5a51ca49',
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lumen-card.pkpass';
        a.click();
        window.URL.revokeObjectURL(url);
        showToast('Pass downloaded');
      } else {
        showToast('Apple Wallet not available');
      }
    } catch {
      showToast('Apple Wallet not available');
    }
  };

  const toggleCardStatus = async (card) => {
    if (card._pbCard) {
      // PB card — update status
      const newStatus = card.blocked ? 'active' : 'frozen';
      try {
        await pb.collection('cards').update(card.id, { status: newStatus });
        await refresh();
        showToast(card.blocked ? 'Card unblocked' : 'Card frozen');
      } catch { showToast('Error updating card'); }
    } else {
      // Local card fallback
      updateCard(card.id, { blocked: !card.blocked });
      showToast(card.blocked ? 'Card unblocked' : 'Card blocked');
    }
  };

  const createCard = async () => {
    try {
      showToast('Creating new card...');
      
      const clientId = localStorage.getItem('lumen_pb_client_id');
      if (!clientId) {
        showToast('Please login first');
        return;
      }

      // Generate random card number and last4
      const cardNumber = '4400' + Math.random().toString().slice(2, 18);
      const last4 = cardNumber.slice(-4);
      
      const cardData = {
        client: clientId,
        type: newCardType,
        currency: newCardCurrency,
        number_last4: last4,
        status: 'active',
        label: newCardType === 'crypto' ? `${newCardCurrency} Wallet` : 'LUMEN Debit',
        available_balance: 0,
        blocked: false,
        expiry: '12/29'
      };

      const card = await pb.collection('cards').create(cardData);
      await refresh();
      setShowCreateCardModal(false);
      showToast('Card created successfully');
    } catch (error) {
      console.error('Create card error:', error);
      showToast('Failed to create card');
    }
  };

  if (selectedCard) {
    const card = displayCards.find(c => c.id === selectedCard);
    if (!card) { setSelectedCard(null); return null; }
    const isSmart  = card.type === 'smart';
    const isCrypto = card.type === 'crypto';

    return (
      <div className="h-full overflow-y-auto scrollbar-hide pb-28">
        <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30">
          <div className="flex items-center justify-between">
            <button onClick={() => setSelectedCard(null)}><Icons.ArrowLeft size={22} className="text-lumen-black dark:text-white" /></button>
            <h2 className="text-base font-bold text-lumen-black dark:text-white">{card.label || card.name}</h2>
            <div className="w-6" />
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Card visual */}
          <div className="card-flip w-full aspect-[1.58/1]" onClick={() => !isSmart && setFlippedId(flippedId === card.id ? null : card.id)}>
            <div className={`card-flip-inner w-full h-full ${flippedId === card.id ? 'flipped' : ''}`}>
              <div className={`card-front w-full h-full p-5 flex flex-col justify-between rounded-2xl ${card.blocked ? 'border-2 border-dashed border-red-500 opacity-80' : ''}`}
                style={{ background: isSmart ? 'linear-gradient(135deg,#F0F0F5,#E8E8F0)' : 'linear-gradient(135deg,#1C1C1E,#2C2C2E)' }}>
                
                {card.blocked && (
                  <div className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center z-20">
                    <Icons.Lock size={32} className="text-red-500 mb-2" />
                    <span className="text-white font-black tracking-widest text-lg">BLOCKED</span>
                    <span className="text-white/70 text-[10px] uppercase font-bold mt-1">Contact support to unblock</span>
                  </div>
                )}

                <div className="flex justify-between relative z-10">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {isSmart ? t('cards.smartContract') : card.type === 'crypto' ? 'Crypto Wallet' : t('cards.debitCard')}
                    </span>
                    <h3 className={`text-lg font-bold ${isSmart ? 'text-lumen-black' : 'text-white'}`}>{card.name}</h3>
                  </div>
                  <Icons.CreditCard size={20} className={isSmart ? 'text-lumen-black/50' : 'text-white/50'} />
                </div>
                <div className="relative z-10">
                  <p className={`text-lg font-mono tracking-widest ${isSmart ? 'text-lumen-black/70' : 'text-white/70'}`}>{card.number}</p>
                  <div className="flex justify-between mt-4">
                    <div>
                      <span className={`text-[9px] ${isSmart ? 'text-lumen-black/40' : 'text-white/40'}`}>{t('cards.holder')}</span>
                      <p className={`text-xs font-semibold uppercase ${isSmart ? 'text-lumen-black' : 'text-white'}`}>{card.holder}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] ${isSmart ? 'text-lumen-black/40' : 'text-white/40'}`}>{t('cards.expiry')}</span>
                      <p className={`text-xs font-semibold ${isSmart ? 'text-lumen-black' : 'text-white'}`}>{card.expiry}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-back w-full h-full bg-[#1C1C1E] flex flex-col items-center justify-center rounded-2xl">
                <div className="w-full h-10 bg-lumen-black/80 mb-6" />
                <p className="text-white/50 text-xs mb-1">{t('cards.cvv')}</p>
                <p className="text-white text-3xl font-mono font-bold mb-4">{card.cvv}</p>
                <button onClick={(e) => { e.stopPropagation(); copyToClipboard(card.cvv); }}
                  className="flex items-center gap-1.5 text-blue-400 text-sm font-medium">
                  <Icons.Copy size={14} /> {t('cards.copy')}
                </button>
              </div>
            </div>
          </div>

          {/* Smart Contract Progress */}
          {isSmart && (
            <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-5">
              <h4 className="text-sm font-bold text-lumen-black dark:text-white mb-4">{t('cards.smartContract')}</h4>
              <div className="flex items-center gap-2 mb-4">
                {[1,2,3].map(block => {
                  const done = block <= card.blocksCompleted;
                  const next = block === card.blocksCompleted + 1;
                  return (
                    <React.Fragment key={block}>
                      {block > 1 && <div className={`flex-1 h-0.5 ${done ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                      <motion.div whileTap={next ? { scale: 0.9 } : {}}
                        onClick={() => handleBlockStep(card.id, block)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold cursor-pointer transition-all
                          ${done ? 'bg-green-500 text-white' : next ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                        {done ? <Icons.Check size={16} /> : block}
                      </motion.div>
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 px-1">
                <span>{t('cards.agreement')}</span>
                <span>{t('cards.verification')}</span>
                <span>{t('cards.settlement')}</span>
              </div>
            </div>
          )}

          {/* Card Actions */}
          {!isSmart && (
            <>
              <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4 space-y-3">
                <button onClick={() => copyToClipboard(card.number)}
                  className="w-full flex items-center justify-between p-3 bg-white dark:bg-[#2C2C2E] rounded-xl">
                  <div className="flex items-center gap-3">
                    <Icons.Copy size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-lumen-black dark:text-white">{t('cards.cardNumber')}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{card.number}</span>
                </button>
                {isCrypto && (
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-[#2C2C2E] rounded-xl">
                    <span className="text-sm font-medium text-lumen-black dark:text-white">Balance</span>
                    <span className="text-sm font-bold text-lumen-black dark:text-white">{parseFloat(card.balance || 0).toFixed(4)} {card.currency}</span>
                  </div>
                )}
              </div>

              {/* Limits and Blocking — fiat cards only */}
              {!isCrypto && <div className="bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icons.Globe size={18} className="text-blue-500" />
                    <div>
                      <h4 className="text-sm font-bold text-lumen-black dark:text-white">Internet Purchases</h4>
                      <p className="text-[10px] text-gray-400">Allow online payments</p>
                    </div>
                  </div>
                  <div
                    className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${(internetEnabled[card.id] ?? true) ? 'bg-green-500' : 'bg-gray-300'}`}
                    onClick={async () => {
                      const newVal = !(internetEnabled[card.id] ?? true);
                      setInternetEnabled(p => ({ ...p, [card.id]: newVal }));
                      try {
                        await pb.collection('cards').update(card.id, { internet_purchases: newVal });
                        showToast(`Internet Purchases ${newVal ? 'enabled' : 'disabled'}`);
                      } catch { showToast('Updated locally'); }
                    }}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${(internetEnabled[card.id] ?? true) ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>

                <div className="h-[1px] bg-gray-200 dark:bg-gray-800" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icons.ArrowUpDown size={18} className="text-purple-500" />
                    <div>
                      <h4 className="text-sm font-bold text-lumen-black dark:text-white">Transfer Limit</h4>
                      <p className="text-[10px] text-gray-400">Daily maximum</p>
                    </div>
                  </div>
                  <button onClick={() => { setLimitValue(card.transfer_limit || '5000'); setShowLimitModal(true); }}
                    className="text-sm font-bold text-lumen-black dark:text-white underline underline-offset-2">
                    ${parseFloat(card.transfer_limit || limitValue).toLocaleString()}
                  </button>
                </div>
              </div>}

              {/* Transfer Limit Modal — rendered via portal to avoid overflow clipping */}
              {showLimitModal && ReactDOM.createPortal(
                <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center px-5" onClick={() => setShowLimitModal(false)}>
                  <div className="w-full max-w-[400px] bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-bold text-lumen-black dark:text-white mb-5">Daily Transfer Limit</h3>
                    <input type="number" value={limitValue} onChange={e => setLimitValue(e.target.value)}
                      className="w-full p-4 bg-gray-50 dark:bg-[#2C2C2E] rounded-2xl text-2xl font-bold text-lumen-black dark:text-white outline-none mb-5"
                      autoFocus />
                    <div className="flex gap-3">
                      <button onClick={() => setShowLimitModal(false)}
                        className="flex-1 py-3 bg-gray-100 dark:bg-[#2C2C2E] rounded-2xl font-bold text-lumen-black dark:text-white">Cancel</button>
                      <button onClick={async () => {
                        try {
                          await pb.collection('cards').update(card.id, { transfer_limit: parseFloat(limitValue) });
                          await refresh();
                          showToast('Limit updated');
                        } catch { showToast('Updated locally'); }
                        setShowLimitModal(false);
                      }} className="flex-1 py-3 bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold">Save</button>
                    </div>
                  </div>
                </div>,
                document.body
              )}

              <div className="grid grid-cols-1 gap-3">
                <motion.button whileTap={{ scale: 0.98 }}
                  onClick={() => toggleCardStatus(card)}
                  className={`p-4 rounded-2xl flex items-center justify-center gap-2 ${card.blocked ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-gray-50 dark:bg-[#1C1C1E] text-lumen-black dark:text-white border-2 border-transparent hover:border-red-500/20'}`}>
                  <Icons.Lock size={20} className={card.blocked ? 'text-red-500' : 'text-gray-500'} />
                  <span className="text-sm font-bold">{card.blocked ? 'Unblock Card' : t('cards.blockCard')}</span>
                </motion.button>
              </div>

              {!isCrypto && (
                <div className="pt-2">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => generateLumePass(card.id, card.balance, card)}
                    className="bg-black dark:bg-white text-white dark:text-black rounded-2xl px-6 py-4 flex items-center justify-center gap-3 font-semibold w-full">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM19 19H5V9H19V19ZM19 7H5V5H19V7Z"/>
                    </svg>
                    {t('cards.addToWallet') || 'Add to Apple Wallet'}
                  </motion.button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-28">
      <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-5 py-3 z-30 flex items-center justify-between">
        <h2 className="text-lg font-bold text-lumen-black dark:text-white">{t('cards.title')}</h2>
        <button onClick={() => setShowCreateCardModal(true)} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Icons.Plus size={18} className="text-lumen-black dark:text-white" />
        </button>
      </div>
      <div className="p-5 space-y-5">
        {displayCards.map((card, i) => (
          <motion.div key={card.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            whileTap={{ scale: 0.97 }} onClick={() => setSelectedCard(card.id)}
            className={`w-full aspect-[1.58/1] rounded-2xl relative overflow-hidden cursor-pointer shadow-lg ${card.blocked ? 'border-2 border-dashed border-red-500 opacity-80' : ''}`}
            style={{ background: card.type === 'smart' ? 'linear-gradient(135deg,#F0F0F5,#E8E8F0)' : 'linear-gradient(135deg,#1C1C1E,#2C2C2E)' }}>
            
            {card.blocked && (
              <div className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center z-20">
                <Icons.Lock size={24} className="text-red-500 mb-1" />
                <span className="text-white font-black tracking-widest text-sm">BLOCKED</span>
              </div>
            )}

            <div className="relative z-10 p-5 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {card.type === 'smart' ? t('cards.smartContract') : card.type === 'crypto' ? 'Crypto Wallet' : t('cards.debitCard')}
                  </span>
                  <h3 className={`text-base font-bold mt-0.5 ${card.type === 'smart' ? 'text-lumen-black' : 'text-white'}`}>{card.name}</h3>
                </div>
                <Icons.CreditCard size={20} className={card.type === 'smart' ? 'text-lumen-black/50' : 'text-white/50'} />
              </div>
              <div>
                <span className={`text-sm font-mono tracking-widest ${card.type === 'smart' ? 'text-lumen-black/50' : 'text-white/50'}`}>{card.number}</span>
                <div className="flex justify-between items-end mt-2">
                  <p className={`text-2xl font-bold ${card.type === 'smart' ? 'text-lumen-black' : 'text-white'}`}>
                    {card.type === 'crypto'
                      ? `${parseFloat(card.balance || 0).toFixed(4)} ${card.currency}`
                      : card.type === 'smart'
                        ? `${card.blocksCompleted ?? 0}/${card.totalBlocks ?? 0}`
                        : `${card.currency} ${parseFloat(card.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  </p>
                  <span className={`text-[10px] uppercase font-bold ${card.type === 'smart' ? 'text-lumen-black/50' : 'text-white/50'}`}>{card.expiry}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Card Modal */}
      {showCreateCardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
          <div className="bg-white dark:bg-black rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-lumen-black dark:text-white mb-4">Create New Card</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Card Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setNewCardType('fiat')}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      newCardType === 'fiat' 
                        ? 'border-lumen-black dark:border-white bg-lumen-black/5 dark:bg-white/5' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Debit Card
                  </button>
                  <button
                    onClick={() => setNewCardType('crypto')}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      newCardType === 'crypto' 
                        ? 'border-lumen-black dark:border-white bg-lumen-black/5 dark:bg-white/5' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Crypto Wallet
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Currency</label>
                <select
                  value={newCardCurrency}
                  onChange={(e) => setNewCardCurrency(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-lumen-black dark:text-white outline-none"
                >
                  {newCardType === 'crypto' ? (
                    <>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                      <option value="USDT">USDT</option>
                      <option value="USDC">USDC</option>
                    </>
                  ) : (
                    <>
                      <option value="CAD">CAD</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateCardModal(false)}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-lumen-black dark:text-white rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createCard}
                className="flex-1 py-3 bg-lumen-black dark:bg-white text-white dark:text-black rounded-xl font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}