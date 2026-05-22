const { publishToStudent, publishToAdmins } = require('../ablyBridge');

function emitPush(userId, payload) {
  const data = {
    type: 'push',
    title: payload.title || 'LUMEN Bank',
    body: payload.body || payload.text || '',
    ...payload,
  };
  if (userId && userId !== 'all') {
    publishToStudent(userId, 'PUSH_NOTIFICATION', data);
    publishToStudent(userId, 'CHAT_MESSAGE', { text: data.body, sender: 'agent' });
  } else {
    publishToAdmins('PUSH_BROADCAST', data);
  }
}

module.exports = { emitPush };
