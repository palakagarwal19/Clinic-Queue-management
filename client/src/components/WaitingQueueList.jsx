import { useState } from 'react';
import { api } from '../api/client.js';

function formatWait(minutes) {
  if (minutes <= 0) return 'Now';
  if (minutes < 60) return `~${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `~${hours}h ${mins}m` : `~${hours}h`;
}

// Color a row based on position in queue
function getRowAccent(index) {
  if (index === 0) return 'border-l-indigo-400 bg-indigo-50/40';
  if (index === 1) return 'border-l-teal-400 bg-teal-50/30';
  return 'border-l-slate-200 bg-white';
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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <p className="font-medium text-slate-500">No patients waiting</p>
        <p className="mt-1 text-xs text-slate-400">The queue is currently empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}
      <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {patients.map((patient, index) => (
          <li
            key={patient.id}
            className={`flex items-center justify-between gap-3 rounded-xl border-l-4 px-4 py-3 transition-all hover:shadow-sm ${getRowAccent(index)}`}
          >
            {/* Position badge + token + name */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500">
                {index + 1}
              </span>
              <span className={`shrink-0 text-sm font-bold ${index === 0 ? 'text-indigo-600' : 'text-teal-700'}`}>
                #{patient.tokenNumber}
              </span>
              <span className="truncate text-sm text-slate-700">{patient.name}</span>
            </div>

            {/* Wait time + remove */}
            <div className="flex shrink-0 items-center gap-3">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                index === 0
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {formatWait(patient.estimatedWaitMinutes ?? 0)}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(patient)}
                disabled={removingId === patient.id}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
                title="Remove patient from queue"
              >
                {removingId === patient.id ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" />
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
