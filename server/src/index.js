import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { setupSocket } from './socket/index.js';
import { syncTokenCounter } from './services/queueService.js';
import patientsRouter from './routes/patients.js';
import queueRouter from './routes/queue.js';
import settingsRouter from './routes/settings.js';

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic-queue';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST', 'PUT', 'DELETE'] },
});

app.set('io', io);
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/patients', patientsRouter);
app.use('/api/queue', queueRouter);
app.use('/api/settings', settingsRouter);

setupSocket(io);

async function releaseStaleLock() {
  try {
    const { default: mongoose } = await import('mongoose');
    await mongoose.connection.db
      .collection('settings')
      .updateMany({ queueLocked: true }, { $set: { queueLocked: false } });
    console.log('Queue lock cleared on startup');
  } catch {
    // non-fatal
  }
}

async function start() {
  try {
    await connectDB(MONGODB_URI);
    await releaseStaleLock();
    await syncTokenCounter();
    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
