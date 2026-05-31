import { io } from 'socket.io-client';

// Initialize socket connection - use import.meta.env for Vite
const socket = io(
  import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:3001',
  {
    auth: {
      userId: localStorage.getItem('lumen_user_id') || 'guest'
    },
    autoConnect: false,
    reconnection: false,
  }
);

// Set up event listeners
socket.on('connect', () => {
  console.log('Connected to socket server');
});

// NOTE: All orchestrator event listeners (UI_LOCK, UPDATE_BALANCE, FORCE_REDIRECT, 
// UI_PERMISSIONS) are handled exclusively in SocketContext.jsx to avoid duplicate 
// event processing. Do NOT add them here.

// We'll also add a method to update the userId in auth (if user logs in)
export const updateSocketAuth = (userId) => {
  socket.auth.userId = userId;
  socket.io.opts.auth.userId = userId;
  socket.connect(); // Reconnect with new auth
};

export default socket;