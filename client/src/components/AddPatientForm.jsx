import { useState } from 'react';
import { api } from '../api/client.js';

export default function AddPatientForm({ onAdded }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Patient name is required');
      return;
    }

    if (trimmed.length > 100) {
      setError('Name must be 100 characters or less');
      return;
    }

    setLoading(true);

    try {
      const patient = await api.addPatient(trimmed);
      setName('');
      setSuccess(`Token #${patient.tokenNumber} assigned to ${patient.name}`);
      onAdded?.(patient);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="patient-name" className="mb-1.5 block text-sm font-medium text-slate-700">
          Patient Name
        </label>
        <input
          id="patient-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter full patient name"
          maxLength={100}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-teal-400 focus:bg-white focus:ring-3 focus:ring-teal-100"
          required
        />
        <p className="mt-1 text-right text-xs text-slate-400">{name.length}/100</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-600 hover:to-teal-700 hover:shadow-teal-500/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Adding...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add to Queue
          </>
        )}
      </button>
    </form>
  );
}
