import { getQueueState } from '../services/queueService.js';

export async function broadcastQueueState(io) {
  const state = await getQueueState();
  io.emit('queue:state', state);
}

export function setupSocket(io) {
  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);

    try {
      const state = await getQueueState();
      socket.emit('queue:state', state);
    } catch (error) {
      console.error('Socket initial state error:', error);
    }

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}
