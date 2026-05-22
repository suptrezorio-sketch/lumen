const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed
  pin: { type: String, required: true },
  balance: { type: Number, default: 0 },
  btc: { type: Number, default: 0 },
  eth: { type: Number, default: 0 },
  usdt: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'blocked'], default: 'pending' },
  kycStatus: { type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none' },
  amlStatus: { type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none' },
  creditStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  kycSettings: { type: [String], default: [] }, // Array of question IDs visible to the user
  smartContract: { type: mongoose.Schema.Types.Mixed, default: {} }, // Custom smart contract order details
  createdAt: { type: Date, default: Date.now },
});

const cardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['fiat', 'crypto', 'smart'], required: true },
  name: { type: String, required: true },
  number: { type: String, required: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, required: true },
  expiry: { type: String },
  holder: { type: String },
  cvv: { type: String },
  blocked: { type: Boolean, default: false },
  dailyLimit: { type: Number },
  monthlyLimit: { type: Number },
});

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['incoming', 'outgoing'], required: true },
  title: { type: String, required: true },
  description: { type: String },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  category: { type: String },
  fee: { type: Number, default: 0 },
  status: { type: String, enum: ['processing', 'completed', 'rejected'], default: 'processing' },
  txId: { type: String, unique: true },
});

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['passport', 'id', 'utility_bill', 'other'], required: true },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
});

const bannerSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true }, // Base64 or URL
  linkType: { type: String, enum: ['url', 'event'], default: 'url' },
  linkValue: { type: String }, // URL string or event name
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const auditLogSchema = new mongoose.Schema({
  adminId: { type: String, required: true },
  action: { type: String, required: true },
  targetUserId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Card: mongoose.model('Card', cardSchema),
  Transaction: mongoose.model('Transaction', transactionSchema),
  Document: mongoose.model('Document', documentSchema),
  Banner: mongoose.model('Banner', bannerSchema),
  AuditLog: mongoose.model('AuditLog', auditLogSchema),
};
