import { useRef, useState } from 'react';
import { api } from '../api/client.js';

export default function AddPatientForm({ onAdded }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmed = name.trim();
    if (!trimmed) { setError('Patient name is required'); return; }
    if (trimmed.length > 100) { setError('Name must be 100 characters or less'); return; }

    setLoading(true);
    try {
      const patient = await api.addPatient(trimmed);
      setName('');
      setSuccess(`Token #${patient.tokenNumber} — ${patient.name}`);
      onAdded?.(patient);
      setTimeout(() => setSuccess(''), 5000);
      inputRef.current?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="patient-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Patient Name
        </label>
        <input
          ref={inputRef}
          id="patient-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Priya Sharma"
          maxLength={100}
          autoComplete="off"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
          required
        />
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-slate-400">Enter the patient's full name</span>
          <span className={`text-xs ${name.length > 90 ? 'text-amber-500' : 'text-slate-300'}`}>{name.length}/100</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700 ring-1 ring-red-200">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Token assigned — {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Registering...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Register & Assign Token
          </>
        )}
      </button>
    </form>
  );
}
