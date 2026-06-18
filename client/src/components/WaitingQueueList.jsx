import { useState } from 'react';
import { api } from '../api/client.js';
import ConfirmModal from './ConfirmModal.jsx';

function formatWait(minutes) {
  if (minutes <= 0) return 'Now';
  if (minutes < 60) return `~${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
}

export default function WaitingQueueList({ patients = [], onRemoved }) {
  const [removingId, setRemovingId] = useState(null);
  const [confirmPatient, setConfirmPatient] = useState(null);
  const [error, setError] = useState('');

  async function doRemove() {
    const patient = confirmPatient;
    setConfirmPatient(null);
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
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500">Queue is empty</p>
        <p className="mt-0.5 text-xs text-slate-400">Register a patient above to get started</p>
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        open={!!confirmPatient}
        title="Remove patient?"
        message={confirmPatient ? `Remove ${confirmPatient.name} (token #${confirmPatient.tokenNumber}) from the queue? Mark as no-show.` : ''}
        confirmLabel="Remove"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        onConfirm={doRemove}
        onCancel={() => setConfirmPatient(null)}
      />

      <div className="space-y-1.5">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700 ring-1 ring-red-200">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {error}
          </div>
        )}

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-2 px-3 pb-1">
          <span className="col-span-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">#</span>
          <span className="col-span-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Token</span>
          <span className="col-span-5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Patient</span>
          <span className="col-span-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Est. Wait</span>
          <span className="col-span-1" />
        </div>

        <ul className="max-h-64 space-y-1 overflow-y-auto">
          {patients.map((patient, index) => (
            <li
              key={patient.id}
              className={`grid grid-cols-12 items-center gap-2 rounded-xl px-3 py-2.5 transition hover:bg-slate-50 ${
                index === 0 ? 'bg-teal-50 ring-1 ring-teal-200' : 'bg-white ring-1 ring-slate-100'
              }`}
            >
              <span className="col-span-1 text-xs font-bold text-slate-400">{index + 1}</span>
              <span className={`col-span-2 text-sm font-black tabular-nums ${index === 0 ? 'text-teal-700' : 'text-slate-700'}`}>
                #{patient.tokenNumber}
              </span>
              <span className="col-span-5 truncate text-sm text-slate-800">{patient.name}</span>
              <span className={`col-span-3 text-xs font-semibold ${index === 0 ? 'text-teal-600' : 'text-slate-500'}`}>
                {index === 0 ? '🔔 Up next' : formatWait(patient.estimatedWaitMinutes ?? 0)}
              </span>
              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmPatient(patient)}
                  disabled={removingId === patient.id}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-100 hover:text-red-500 disabled:opacity-40"
                  title="Remove (no-show)"
                >
                  {removingId === patient.id ? (
                    <span className="h-3 w-3 animate-spin rounded-full border border-slate-300 border-t-slate-500" />
                  ) : (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
