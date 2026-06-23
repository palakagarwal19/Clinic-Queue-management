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
const IS_PROD = process.env.NODE_ENV === 'production';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: IS_PROD ? '*' : CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.set('io', io);
app.use(cors({ origin: IS_PROD ? '*' : CLIENT_URL }));
app.use(express.json());

// API routes
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/patients', patientsRouter);
app.use('/api/queue', queueRouter);
app.use('/api/settings', settingsRouter);

// Serve React build in production
if (IS_PROD) {
  // On Render: cwd = /opt/render/project/src/server
  // client/dist is at   /opt/render/project/src/client/dist
  const clientDist = resolve(process.cwd(), '..', 'client', 'dist');
  console.log('Serving static from:', clientDist);
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(resolve(clientDist, 'index.html'));
  });
}

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
