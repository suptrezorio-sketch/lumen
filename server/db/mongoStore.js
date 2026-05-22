const mongoose = require('mongoose');
const models = require('../models');
const { CreditRequest } = require('../models/credit');
const { Message } = require('../models/chat');
const { thresholds, updateThresholds } = require('../scenarioEngine');

module.exports = {
  isSupabase: false,
  connect: async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) return false;
    await mongoose.connect(uri);
    return true;
  },
  User: models.User,
  Card: models.Card,
  Transaction: models.Transaction,
  Document: models.Document,
  Banner: models.Banner,
  AuditLog: models.AuditLog,
  CreditRequest,
  Message,
  getThresholds: () => thresholds,
  updateThresholds,
};
