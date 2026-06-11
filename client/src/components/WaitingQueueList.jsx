import { useState } from 'react';
import { api } from '../api/client.js';

function formatWait(minutes) {
  if (minutes <= 0) return 'Now';
  if (minutes < 60) return `~${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `~${hours}h ${mins}m` : `~${hours}h`;
}

export default function WaitingQueueList({ patients = [], onRemoved }) {
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');

  async function handleRemove(patient) {
    const confirmed = window.confirm(
      `Remove ${patient.name} (token #${patient.tokenNumber}) from the queue?`
    );
    if (!confirmed) return;

    setError('');
    setRemovingId(patient.id);

    try {
      await api.removePatient(patient.id);
      onRemoved?.(patient);
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingId(null);
    }
  }

  if (patients.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">
        No patients waiting
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {patients.map((patient) => (
          <li
            key={patient.id}
            className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="shrink-0 font-semibold text-teal-700">#{patient.tokenNumber}</span>
              <span className="truncate text-slate-700">{patient.name}</span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs text-slate-500">
                {formatWait(patient.estimatedWaitMinutes ?? 0)}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(patient)}
                disabled={removingId === patient.id}
                className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                title="Remove no-show or mistaken entry"
              >
                {removingId === patient.id ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
