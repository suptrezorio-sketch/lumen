const mongoose = require('mongoose');

const creditRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  term: { type: String, required: true }, // e.g., '12 months'
  rate: { type: Number, required: true }, // Interest rate
  collateral: { type: String }, // Property, car, etc.
  collateralValue: { type: Number },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  CreditRequest: mongoose.model('CreditRequest', creditRequestSchema),
};
