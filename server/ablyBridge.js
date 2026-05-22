/**
 * Optional Ably publish bridge — set ABLY_API_KEY in server/.env
 */
let rest = null;

function initAblyBridge() {
  const key = process.env.ABLY_API_KEY;
  if (!key) return null;
  try {
    const Ably = require('ably');
    rest = new Ably.Rest(key);
    console.log('✅ Ably bridge enabled');
    return rest;
  } catch (e) {
    console.warn('Ably bridge failed:', e.message);
    return null;
  }
}

function publishToStudent(userId, eventName, data) {
  if (!rest || !userId) return;
  const channel = rest.channels.get(`student:${userId}`);
  channel.publish(eventName, data).catch((err) => console.warn('[Ably]', err.message));
}

function publishToAdmins(eventName, data) {
  if (!rest) return;
  rest.channels.get('admin:room').publish(eventName, data).catch((err) => console.warn('[Ably]', err.message));
}

module.exports = { initAblyBridge, publishToStudent, publishToAdmins };
