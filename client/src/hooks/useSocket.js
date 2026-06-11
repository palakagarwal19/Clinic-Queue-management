import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { api } from '../api/client.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
const POLL_INTERVAL_MS = 5000;

export function useSocket() {
  const [queueState, setQueueState] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshFromApi = useCallback(async () => {
    try {
      const state = await api.getQueueState();
      setQueueState(state);
    } catch (error) {
      console.error('Failed to fetch queue state:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let pollTimer;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => {
      setConnected(true);
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = undefined;
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
      refreshFromApi();
      pollTimer = setInterval(refreshFromApi, POLL_INTERVAL_MS);
    });

    socket.on('queue:state', (state) => {
      setQueueState(state);
      setLoading(false);
    });

    refreshFromApi();

    return () => {
      socket.disconnect();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [refreshFromApi]);

  return { queueState, connected, loading, refreshFromApi };
}
