require('dotenv').config();
const Ably = require('ably');
const webpush = require('web-push');
const fs = require('fs');

const {
  VITE_ABLY_KEY,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  VAPID_SUBJECT,
  VITE_PB_URL
} = process.env;

if (!VITE_ABLY_KEY || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('Missing required environment variables for Push Daemon.');
  process.exit(1);
}

// Configure Web Push
webpush.setVapidDetails(
  VAPID_SUBJECT || 'mailto:admin@lumen.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Initialize Ably client (admin)
const realtime = new Ably.Realtime({ key: VITE_ABLY_KEY, clientId: 'push-daemon' });

realtime.connection.on('connected', () => {
  console.log('Push Daemon connected to Ably.');
});

// We need to listen to a wildcard channel or specific admin channel for push requests
// For simplicity, let's assume the backend/admin sends push requests to a channel called 'admin:push'
const pushChannel = realtime.channels.get('admin:push');

pushChannel.subscribe('send', async (message) => {
  try {
    const { clientId, title, body, data } = message.data;
    if (!clientId) return;

    // We need to get the PushSubscription for this client.
    // In our App.jsx, we stored it in localStorage, but the daemon needs it.
    // Wait, the client needs to send their subscription to PocketBase!
    // I forgot to add the code in App.jsx to save the subscription to PocketBase.
    
    console.log(`Received push request for client ${clientId}`);
    
    // Fetch client from PocketBase
    const response = await fetch(`${VITE_PB_URL || 'http://127.0.0.1:80'}/api/collections/clients/records/${clientId}`);
    if (!response.ok) {
      console.error(`Client ${clientId} not found.`);
      return;
    }
    
    const client = await response.json();
    if (!client.push_subscription) {
      console.warn(`No push subscription for client ${clientId}`);
      return;
    }

    const subscription = JSON.parse(client.push_subscription);
    
    const payload = JSON.stringify({
      title: title || 'LUMEN Bank',
      body: body || 'You have a new notification.',
      data: data || {}
    });

    await webpush.sendNotification(subscription, payload);
    console.log(`Successfully sent push to ${clientId}`);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
});
