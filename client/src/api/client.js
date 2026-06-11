const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  addPatient: (name) =>
    request('/api/patients', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  callNext: () =>
    request('/api/queue/next', {
      method: 'POST',
    }),

  setConsultationTime: (minutes) =>
    request('/api/settings/consultation-time', {
      method: 'PUT',
      body: JSON.stringify({ minutes }),
    }),

  getQueueState: () => request('/api/queue/state'),
};
