/**
 * Realtime layer: Socket.IO (default) or Ably when VITE_USE_ABLY=true
 */
import socket, { updateSocketAuth } from '../services/socketService';

let ablyClient = null;
let ablyChannel = null;

export async function connectRealtime(userId) {
  const ablyKey = import.meta.env.VITE_ABLY_API_KEY;
  const useAbly = ablyKey && (import.meta.env.VITE_USE_ABLY !== 'false');
  if (useAbly) {
    const Ably = (await import('ably')).default;
    ablyClient = new Ably.Realtime({ key: import.meta.env.VITE_ABLY_API_KEY, clientId: userId || 'guest' });
    ablyChannel = ablyClient.channels.get(`student:${userId || 'guest'}`);
    ablyChannel.subscribe((msg) => {
      window.dispatchEvent(new CustomEvent('LUMEN_ABLY_EVENT', { detail: { name: msg.name, data: msg.data } }));
    });
    return { mode: 'ably' };
  }
  updateSocketAuth(userId);
  return { mode: 'socket', socket };
}

export function disconnectRealtime() {
  if (ablyChannel) {
    ablyChannel.unsubscribe();
    ablyChannel = null;
  }
  if (ablyClient) {
    ablyClient.close();
    ablyClient = null;
  }
}

export default connectRealtime;
