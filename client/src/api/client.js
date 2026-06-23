// In production (same origin), use relative URLs. In dev, use the env var.
const API_BASE = import.meta.env.VITE_API_URL || '';

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

  removePatient: (id) =>
    request(`/api/patients/${id}`, {
      method: 'DELETE',
    }),

  callNext: () =>
    request('/api/queue/next', {
      method: 'POST',
    }),

  resetQueue: () =>
    request('/api/queue/reset', {
      method: 'POST',
    }),

  setConsultationTime: (minutes) =>
    request('/api/settings/consultation-time', {
      method: 'PUT',
      body: JSON.stringify({ minutes }),
    }),

  getQueueState: () => request('/api/queue/state'),
};
