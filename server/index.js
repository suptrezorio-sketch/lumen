require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const db = require('./db');
const { User, Card, Transaction, Document, AuditLog, CreditRequest, Message } = db;
const { initializeSocket } = require('./socket');
const { scenarioEngine } = require('./scenarioEngine');
const { initAblyBridge, publishToStudent } = require('./ablyBridge');
const { generateReceiptImage } = require('./services/receipt');
const { emitPush } = require('./services/push');

initAblyBridge();

const FRONTEND_URL = process.env.FRONTEND_URL || '*';
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({ dest: UPLOAD_DIR });

const app = express();
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));

(async () => {
  if (db.useSupabase) {
    await db.connect();
    console.log('✅ Using Supabase database');
    const t = await db.getThresholds();
    require('./scenarioEngine').updateThresholds(t);
  } else if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } else {
    console.warn('⚠️  No database — set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in server/.env');
  }
})();

function isValidId(id) {
  if (!id || id === 'guest') return false;
  if (mongoose.Types.ObjectId.isValid(id)) return true;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

async function hashPin(pin) {
  return bcrypt.hash(String(pin), 10);
}

async function verifyPin(pin, stored) {
  if (!stored) return false;
  if (stored.startsWith('$2')) return bcrypt.compare(String(pin), stored);
  return String(pin) === String(stored);
}

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);
const io = initializeSocket(server);
app.set('io', io);
app.use('/api/v1', scenarioEngine(io));

// --- ADMIN AUTH ---
const ADMIN_LOGIN = process.env.ADMIN_LOGIN || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'lumen2026';

app.post('/admin/login', (req, res) => {
  const { login, password } = req.body;
  if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
    // Simple token for demo - in production use JWT
    const token = Buffer.from(`${login}:${Date.now()}`).toString('base64');
    res.json({ token, adminId: login });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Middleware for admin auth
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  // Simple check - in production use JWT verify
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    if (!decoded.includes(ADMIN_LOGIN)) throw new Error('Invalid');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- ADMIN API ---

// Список всех пользователей
app.get('/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (e) { 
    require('fs').appendFileSync('error_debug.log', e.message + '\n' + e.stack + '\n\n');
    res.status(500).json({ error: e.message }); 
  }
});

// Обновление пользователя (статус, kycStatus, и другие поля)
app.patch('/admin/user/:id', adminAuth, async (req, res) => {
  try {
    const allowed = ['status', 'kycStatus', 'amlStatus', 'name', 'phone', 'email', 'kycSettings', 'smartContract', 'lang', 'creditStatus'];
    const update = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
    if (update.status === 'active') update.status = 'approved';
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Обновление баланса пользователя
app.patch('/admin/user/:id/balance', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { balance: req.body.balance }, { new: true });
    
    // Notify client via socket
    const io = app.get('io');
    if (io) {
      io.emit('adminCommand', { targetUserId: user._id.toString(), command: 'UPDATE_BALANCE', data: user.balance });
    }
    publishToStudent(user._id.toString(), 'adminCommand', { targetUserId: user._id.toString(), command: 'UPDATE_BALANCE', data: user.balance });
    
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin sends message to specific user (chat)
app.post('/admin/message', adminAuth, async (req, res) => {
  try {
    const msg = await Message.create({ ...req.body, receiverId: req.body.userId, isAdmin: true });
    const io = app.get('io');
    const uid = req.body.userId;
    if (uid) {
      if (io) {
        io.to(`student:${uid}`).emit('CHAT_MESSAGE', { text: req.body.text, sender: 'agent' });
        io.to(`student:${uid}`).emit('adminMessage', { text: req.body.text });
      }
      publishToStudent(uid, 'CHAT_MESSAGE', { text: req.body.text, sender: 'agent' });
      emitPush(uid, { title: 'LUMEN Support', body: req.body.text });
    }
    res.status(201).json(msg);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Список всех транзакций (с опциональной фильтрацией по userId)
app.get('/admin/transactions', adminAuth, async (req, res) => {
  try {
    const filter = req.query.userId ? { userId: req.query.userId } : {};
    const txs = await Transaction.find(filter).populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(txs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Обновление статуса транзакции
app.patch('/admin/transaction/:id', adminAuth, async (req, res) => {
  try {
    const tx = await Transaction.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(tx);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Удаление транзакции
app.delete('/admin/transaction/:id', adminAuth, async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Список документов
app.get('/admin/documents', adminAuth, async (req, res) => {
  try {
    const docs = await Document.find().populate('userId').sort({ uploadedAt: -1 });
    res.json(docs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Одобрение/Отклонение документа
app.patch('/admin/document/:id', adminAuth, async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (doc.type === 'passport' && req.body.status === 'approved') {
      await User.findByIdAndUpdate(doc.userId, { kycStatus: 'verified' });
    }
    res.json(doc);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Список заявок на кредит
app.get('/admin/credit-requests', adminAuth, async (req, res) => {
  try {
    const requests = await CreditRequest.find();
    res.json(requests);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Одобрение/Отклонение кредита
app.patch('/admin/credit-request/:id', adminAuth, async (req, res) => {
  try {
    const request = await CreditRequest.findByIdAndUpdate(req.params.id, { status: req.body.status });
    const io = app.get('io');
    
    if (req.body.status === 'approved') {
      const user = await User.findByIdAndUpdate(
        request.userId,
        { $inc: { balance: request.amount }, creditStatus: 'approved' },
        { new: true }
      );
      
      const uid = request.userId?.toString?.() || request.userId;
      const modal = {
        type: 'success',
        title: 'Credit Approved',
        message: `Your credit request for $${request.amount} has been approved and added to your balance.`,
      };
      if (io) {
        io.emit('adminCommand', { targetUserId: uid, command: 'UPDATE_BALANCE', data: user.balance });
        io.emit('adminCommand', { targetUserId: uid, command: 'CREDIT_STATUS', data: 'approved' });
        io.emit('adminCommand', { targetUserId: uid, command: 'show_modal', data: modal });
      }
      publishToStudent(uid, 'adminCommand', { targetUserId: uid, command: 'UPDATE_BALANCE', data: user.balance });
      publishToStudent(uid, 'adminCommand', { targetUserId: uid, command: 'CREDIT_STATUS', data: 'approved' });
      publishToStudent(uid, 'adminCommand', { targetUserId: uid, command: 'show_modal', data: modal });
      emitPush(uid, { title: 'Credit Approved', body: `+$${request.amount} added to your balance` });
    } else if (req.body.status === 'rejected') {
      await User.findByIdAndUpdate(request.userId, { creditStatus: 'rejected' });
      if (io) {
        io.emit('adminCommand', { targetUserId: request.userId.toString(), command: 'CREDIT_STATUS', data: 'rejected' });
        io.emit('adminCommand', { 
          targetUserId: request.userId.toString(), 
          command: 'show_modal', 
          data: { 
            type: 'error', 
            title: 'Credit Rejected', 
            message: `Your credit request for $${request.amount} has been declined. Please contact support for more information.` 
          } 
        });
      }
    }
    res.json(request);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Отправка Push сообщения
app.post('/admin/chat/send', adminAuth, async (req, res) => {
  try {
    const msg = await Message.create({
      text: req.body.text,
      receiverId: req.body.userId || null,
      isAdmin: true,
    });
    const io = app.get('io');
    const uid = req.body.userId;
    if (uid) {
      if (io) io.to(`student:${uid}`).emit('CHAT_MESSAGE', { text: req.body.text, sender: 'agent' });
      publishToStudent(uid, 'CHAT_MESSAGE', { text: req.body.text, sender: 'agent' });
      emitPush(uid, { title: 'LUMEN Bank', body: req.body.text });
    }
    res.status(201).json(msg);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Seed Demo Data
app.post('/admin/seed', adminAuth, async (req, res) => {
  try {
    const count = parseInt(req.body?.count) || 3;
    const createdUsers = [];
    
    for (let i = 1; i <= count; i++) {
      const email = `student${i}@demo.lumen.com`;
      const exists = await User.findOne({ email });
      
      if (!exists) {
        const demoPin = await hashPin('111111');
        const user = await User.create({
          name: `Student ${i}`,
          email,
          password: demoPin,
          pin: demoPin,
          balance: 5000,
          lang: 'en',
          status: 'approved',
          kycStatus: 'verified'
        });
        createdUsers.push(user.name);
        
        await Card.create({
          userId: user._id,
          type: 'fiat',
          name: 'LUMEN Black',
          number: `**** **** **** ${1000+i}`,
          expiry: '12/28',
          cvv: '123',
          balance: 5000,
          currency: 'CAD',
          status: 'active'
        });

        // Add a demo transaction
        await Transaction.create({
          userId: user._id,
          type: 'incoming',
          txId: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          amount: 500,
          status: 'completed',
          title: 'Initial Deposit',
          category: 'income'
        });
      }
    }

    if (createdUsers.length > 0) {
      await AuditLog.create({
        adminId: req.user?.id || 'admin',
        action: 'SEED_STUDENTS',
        targetUserId: 'ALL',
        details: { count: createdUsers.length }
      });
    }

    res.json({ message: `Created ${createdUsers.length} students`, users: createdUsers });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete user
app.delete('/admin/user/:id', adminAuth, async (req, res) => {
  try {
    const id = req.params.id;
    await Card.deleteMany({ userId: id });
    await Transaction.deleteMany({ userId: id });
    await Document.deleteMany({ userId: id });
    await CreditRequest.deleteMany({ userId: id });
    await User.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

async function syncTestUserHandler(req, res) {
  try {
    if (req.body.pin && req.body.pin !== '1388') {
      return res.status(403).json({ error: 'Invalid sync pin' });
    }
    const testEmail = 'test@lumen.local';
    const hashedTestPin = await hashPin('1388');
    const user = await User.findOneAndUpdate(
      { email: testEmail },
      {
        $set: {
          name: req.body.name || 'Test Account',
          pin: hashedTestPin,
          password: hashedTestPin,
          balance: req.body.balance || 12450.80,
          lang: 'en',
          status: 'approved',
          kycStatus: 'none',
        },
        $setOnInsert: { email: testEmail },
      },
      { upsert: true, new: true }
    );
    res.json({ message: 'Test user synced', userId: user._id, user });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

app.post('/api/sync-test-user', syncTestUserHandler);
app.post('/admin/sync-test-user', adminAuth, syncTestUserHandler);

// Scenario Engine Thresholds
app.get('/admin/thresholds', adminAuth, async (req, res) => {
  res.json(await db.getThresholds());
});

app.post('/admin/thresholds', adminAuth, async (req, res) => {
  if (req.body) {
    const t = await db.updateThresholds(req.body);
    AuditLog.create({
      adminId: 'admin',
      action: 'UPDATE_THRESHOLDS',
      targetUserId: 'ALL',
      details: req.body
    }).catch(console.error);
    return res.json(t);
  }
  res.json(await db.getThresholds());
});

// Audit Logs
app.get('/admin/audit-logs', adminAuth, async (req, res) => {
  try {
    const logs = await AuditLog.find();
    res.json(logs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Banners Admin
app.get('/admin/banners', adminAuth, async (req, res) => {
  try {
    const banners = await Banner.find();
    res.json(banners);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/admin/banners', adminAuth, async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json(banner);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/admin/banners/:id', adminAuth, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body);
    res.json(banner);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/admin/banners/:id', adminAuth, async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- PUBLIC API ---

app.get('/api/me', async (req, res) => {
  try {
    const id = req.query.userId;
    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Valid userId required' });
    }
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    const cards = await Card.find({ userId: id });
    const txs = await Transaction.find({ userId: id }).sort({ createdAt: -1 }).limit(50);
    res.json({ user, cards, transactions: txs });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const { userId, pin } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const ok = await verifyPin(pin, user.pin);
    if (!ok) return res.status(401).json({ error: 'Invalid PIN' });
    res.json({ userId: user._id, user: { name: user.name, email: user.email, balance: user.balance, btc: user.btc, eth: user.eth, usdt: user.usdt } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/credit/request', async (req, res) => {
  try {
    const { userId, amount, term, rate, employment, income, purpose, collateral } = req.body;
    if (!isValidId(userId)) {
      return res.status(400).json({ error: 'Valid userId required' });
    }
    const request = await CreditRequest.create({
      userId,
      amount,
      term,
      rate: rate || 7.95,
      employment,
      income,
      purpose,
      collateral: collateral || 'None',
      status: 'pending',
    });
    await User.findByIdAndUpdate(userId, { creditStatus: 'pending' });
    res.status(201).json(request);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/v1/onboarding', adminAuth, async (req, res) => {
  try {
    const { name, pin, lang, email, balance } = req.body;
    if (!name || !pin) return res.status(400).json({ error: 'name and pin required' });
    const userEmail = email || `${name.toLowerCase().replace(/\s+/g, '.')}@demo.lumen.com`;
    const exists = await User.findOne({ email: userEmail });
    if (exists) return res.status(409).json({ error: 'Email already exists' });
    const hashedPin = await hashPin(pin);
    const user = await User.create({
      name,
      email: userEmail,
      password: hashedPin,
      pin: hashedPin,
      balance: balance ?? 5000,
      lang: lang || 'en',
      status: 'approved',
      kycStatus: 'none',
    });
    await Card.create({
      userId: user._id,
      type: 'fiat',
      name: 'LUMEN Card',
      number: `**** **** **** ${String(1000 + Math.floor(Math.random() * 8999))}`,
      expiry: '12/28',
      cvv: '123',
      balance: user.balance,
      currency: 'CAD',
      status: 'active',
    });
    res.status(201).json({ userId: user._id, user });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/v1/kyc-submit', async (req, res) => {
  try {
    const { userId, ...form } = req.body;
    if (!isValidId(userId)) {
      return res.status(400).json({ error: 'Valid userId required' });
    }
    await User.findByIdAndUpdate(userId, {
      kycStatus: 'pending',
      name: form.fullName || form.name,
      kycSettings: Object.keys(form),
    });
    const doc = await Document.create({
      userId,
      type: 'other',
      fileUrl: form.documentUrl || 'kyc-form-submission',
      status: 'pending',
    });
    res.status(201).json({ ok: true, documentId: doc._id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    const { userId, type } = req.body;
    if (!isValidId(userId)) {
      return res.status(400).json({ error: 'Valid userId required' });
    }
    const fileUrl = req.file
      ? `/uploads/${req.file.filename}`
      : (req.body.fileUrl || 'uploaded-document');
    const doc = await Document.create({
      userId,
      type: type || 'other',
      fileUrl,
      status: 'pending',
    });
    await User.findByIdAndUpdate(userId, { kycStatus: 'pending' });
    res.status(201).json({ fileUrl, documentId: doc._id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/banners', async (req, res) => {
  try {
    const banners = await Banner.find({ active: true });
    res.json(banners);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/chat', async (req, res) => {
  try {
    const messages = await Message.find({
      receiverId: req.query.userId,
    });
    res.json(messages);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/chat', async (req, res) => {
  try {
    const msg = await Message.create({ ...req.body, isAdmin: false });
    const io = req.app.get('io');
    if (io) io.to('admins').emit('adminChatMessage', { userId: req.body.senderId || req.body.userId, text: req.body.text, sender: 'user' });
    res.status(201).json(msg);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/register', async (req, res) => {
  try {
    const body = { ...req.body, status: 'pending' };
    if (body.pin) body.pin = await hashPin(body.pin);
    if (body.password) body.password = body.pin || await hashPin(body.password);
    const user = await User.create(body);
    res.status(201).json({ userId: user._id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/v1/transfers', async (req, res) => {
  try {
    const { amount, userId, lang, title, description, type, recipientAccount } = req.body;
    const io = req.app.get('io');

    // Save transaction as PENDING — admin must approve
    const txId = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const txPayload = {
      type: type || 'outgoing',
      title: title || `Transfer $${amount}`,
      description: description || 'Bank transfer',
      amount: parseFloat(amount) || 0,
      txId,
      status: 'processing',
      category: 'transfer',
    };

    // Only assign userId if it is a valid 24-character hex string (Mongoose ObjectId)
    if (isValidId(userId)) {
      txPayload.userId = userId;
      txPayload.recipientAccount = recipientAccount;
    }

    const tx = await Transaction.create(txPayload);

    // Notify admin immediately about new pending transaction
    if (io) {
      io.emit('admin:newTransaction', {
        tx: tx.toObject(),
        userId,
        amount,
        message: `New transfer: $${amount} from user ${userId || 'unknown'}`,
      });
    }

    res.status(201).json({ ...tx.toObject(), message: 'Transfer submitted for review' });
  } catch (e) { 
    console.error('[transfers]', e.message);
    res.status(500).json({ error: e.message }); 
  }
});

app.post('/api/receipt/generate', async (req, res) => {
  try {
    const { amount, recipient, txId } = req.body;
    const receipt = await generateReceiptImage({
      amount,
      recipient,
      txId: txId || `TX-${Date.now()}`,
      date: new Date().toLocaleString('en-CA'),
    });
    if (!receipt) return res.status(503).json({ error: 'Receipt generation unavailable' });
    res.json(receipt);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: create transaction for student
app.post('/admin/transactions', adminAuth, async (req, res) => {
  try {
    const tx = await Transaction.create({ ...req.body, status: req.body.status || 'completed' });
    res.status(201).json(tx);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: full user update
app.put('/admin/user/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body);
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/health', (req, res) => res.json({
  status: 'ok',
  db: db.useSupabase ? 'supabase' : 'mongo',
  timestamp: new Date().toISOString(),
}));

app.get('/', (req, res) => res.send('Lumen Bank API Running...'));

server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT} at 0.0.0.0`));
