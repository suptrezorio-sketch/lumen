import * as Ably from 'ably';

const ABLY_KEY = import.meta.env.VITE_ABLY_KEY;
let client = null;

export const initAbly = (clientId) => {
  if (!ABLY_KEY) {
    console.warn('No Ably key provided');
    return null;
  }

  if (!client) {
    client = new Ably.Realtime({
      key: ABLY_KEY,
      clientId: clientId || 'anonymous',
    });

    client.connection.on('connected', () => {
      console.log('Ably connected');
    });
  }
  return client;
};

export const subscribeToNotifications = (clientId, onMessage) => {
  if (!client) initAbly(clientId);
  if (!client) return null;

  const channel = client.channels.get(`client:${clientId}:notifications`);
  
  channel.subscribe((message) => {
    onMessage(message.data);
  });

  return () => {
    channel.unsubscribe();
  };
};

export const publishNotification = async (targetClientId, payload) => {
  if (!client) initAbly('admin');
  if (!client) return false;

  const channel = client.channels.get(`client:${targetClientId}:notifications`);
  try {
    await channel.publish('notification', payload);
    return true;
  } catch (error) {
    console.error('Failed to publish to Ably:', error);
    return false;
  }
};
