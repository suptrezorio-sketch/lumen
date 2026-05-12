const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null if from admin
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null if broadcast
  text: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  Message: mongoose.model('Message', messageSchema),
};
