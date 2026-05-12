const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { User, Card, Transaction, Document } = require('./models');
const http = require('http');
const { initializeSocket } = require('./socket');
const { scenarioEngine } = require('./scenarioEngine');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://df2b2026_db_user:WTQZpGMZH1bbw5ct@cluster0.wq5gboe.mongodb.net/lumen_bank?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);
const io = initializeSocket(server);
app.set('io', io);
app.use('/api/v1', scenarioEngine(io));

// --- ADMIN API ---

// Список всех пользователей
app.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Обновление статуса пользователя (approve/block)
app.patch('/admin/user/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Обновление баланса пользователя
app.patch('/admin/user/:id/balance', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { balance: req.body.balance }, { new: true });
    
    // Notify client via socket
    const io = app.get('io');
    if (io) {
      io.emit('adminCommand', { targetUserId: user._id.toString(), command: 'UPDATE_BALANCE', data: user.balance });
    }
    
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Список всех транзакций
app.get('/admin/transactions', async (req, res) => {
  try {
    const txs = await Transaction.find().populate('userId').sort({ date: -1 });
    res.json(txs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Обновление статуса транзакции
app.patch('/admin/transaction/:id', async (req, res) => {
  try {
    const tx = await Transaction.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(tx);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Список документов
app.get('/admin/documents', async (req, res) => {
  try {
    const docs = await Document.find().populate('userId').sort({ uploadedAt: -1 });
    res.json(docs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Одобрение/Отклонение документа
app.patch('/admin/document/:id', async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (doc.type === 'passport' && req.body.status === 'approved') {
      await User.findByIdAndUpdate(doc.userId, { kycStatus: 'verified' });
    }
    res.json(doc);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Список заявок на кредит
app.get('/admin/credit-requests', async (req, res) => {
  try {
    const { CreditRequest } = require('./models/credit');
    const requests = await CreditRequest.find().populate('userId').sort({ createdAt: -1 });
    res.json(requests);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Одобрение/Отклонение кредита
app.patch('/admin/credit-request/:id', async (req, res) => {
  try {
    const { CreditRequest } = require('./models/credit');
    const request = await CreditRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    
    if (req.body.status === 'approved') {
      const user = await User.findByIdAndUpdate(request.userId, { $inc: { balance: request.amount } }, { new: true });
      
      // Notify client via socket
      const io = app.get('io');
      if (io) {
        // Send balance update
        io.emit('adminCommand', { targetUserId: request.userId.toString(), command: 'UPDATE_BALANCE', data: user.balance });
        // Show success modal
        io.emit('adminCommand', { 
          targetUserId: request.userId.toString(), 
          command: 'show_modal', 
          data: { 
            type: 'success', 
            title: 'Credit Approved', 
            message: `Your credit request for $${request.amount} has been approved and added to your balance.` 
          } 
        });
      }
    }
    res.json(request);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Отправка Push сообщения
app.post('/admin/chat/send', async (req, res) => {
  try {
    const { Message } = require('./models/chat');
    const msg = new Message({
      text: req.body.text,
      receiverId: req.body.userId || null,
      isAdmin: true,
    });
    await msg.save();
    res.status(201).json(msg);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Seed Demo Data
app.post('/admin/seed', async (req, res) => {
  try {
    const { CreditRequest } = require('./models/credit');
    
    // Clear existing demo data (optional, but keeps it clean)
    // await User.deleteMany({ email: /demo/ });
    
    const demoUsers = [
      { name: 'John Doe', email: 'john.demo@lumen.com', balance: 50000, status: 'approved', kycStatus: 'verified' },
      { name: 'Sarah Smith', email: 'sarah.demo@lumen.com', balance: 1200, status: 'pending', kycStatus: 'pending' },
      { name: 'Mike Ross', email: 'mike.demo@lumen.com', balance: 0, status: 'blocked', kycStatus: 'pending' }
    ];

    for (const u of demoUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const user = new User(u);
        await user.save();
        
        // Add a demo transaction for each
        const tx = new Transaction({
          userId: user._id,
          txId: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          amount: 250,
          status: 'completed',
          title: 'Initial Deposit',
          category: 'income'
        });
        await tx.save();

        // Add a credit request
        const cred = new CreditRequest({
          userId: user._id,
          amount: 10000,
          term: 24,
          rate: 5.5,
          collateral: 'Car Title',
          status: 'pending'
        });
        await cred.save();
      }
    }
    res.json({ message: 'Demo data seeded successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- PUBLIC API ---

app.get('/api/chat', async (req, res) => {
  try {
    const { Message } = require('./models/chat');
    const messages = await Message.find({
      $or: [{ receiverId: req.query.userId }, { senderId: req.query.userId }, { receiverId: null }]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { Message } = require('./models/chat');
    const msg = new Message({ ...req.body, isAdmin: false });
    await msg.save();
    res.status(201).json(msg);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/register', async (req, res) => {
  try {
    const user = new User({ ...req.body, status: 'pending' });
    await user.save();
    res.status(201).json({ userId: user._id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/v1/transfers', async (req, res) => {
  try {
    const tx = new Transaction(req.body);
    tx.status = 'completed';
    await tx.save();
    res.status(201).json(tx);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/', (req, res) => res.send('Lumen Bank API Running...'));

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
