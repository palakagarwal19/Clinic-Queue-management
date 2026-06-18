import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function QueueControls({ consultationTime, onUpdated }) {
  const [minutes, setMinutes] = useState(consultationTime ?? 10);
  const [calling, setCalling] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (consultationTime != null) {
      setMinutes(consultationTime);
    }
  }, [consultationTime]);

  function showMessage(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  }

  async function handleCallNext() {
    const confirmed = window.confirm(
      'Call the next patient? The current token will be marked complete.'
    );
    if (!confirmed) return;

    setError('');
    setMessage('');
    setCalling(true);

    try {
      const result = await api.callNext();
      if (result.patient) {
        showMessage(`Called token #${result.patient.tokenNumber} — ${result.patient.name}`);
      } else {
        showMessage('No patients in the waiting queue');
      }
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setCalling(false);
    }
  }

  async function handleReset() {
    const confirmed = window.confirm(
      'Reset the queue for a new session? All waiting and serving patients will be cleared.'
    );
    if (!confirmed) return;

    setError('');
    setMessage('');
    setResetting(true);

    try {
      await api.resetQueue();
      showMessage('Queue reset — token numbering starts from #101');
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setResetting(false);
    }
  }

  async function handleSaveTime(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    const parsed = Number(minutes);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 120) {
      setError('Enter a whole number between 1 and 120');
      return;
    }

    setSaving(true);

    try {
      await api.setConsultationTime(parsed);
      showMessage('Consultation time updated');
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Call Next — primary action */}
      <button
        onClick={handleCallNext}
        disabled={calling || resetting}
        className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-6 py-4 text-lg font-bold text-white shadow-xl shadow-amber-400/30 transition-all hover:shadow-amber-400/50 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-center justify-center gap-2">
          {calling ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Calling...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Call Next Patient
            </>
          )}
        </div>
      </button>

      {/* Reset Queue */}
      <button
        onClick={handleReset}
        disabled={calling || resetting}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {resetting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            Resetting...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Reset Queue (New Session)
          </>
        )}
      </button>

      {/* Consultation Time */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <form onSubmit={handleSaveTime} className="space-y-3">
          <label htmlFor="consultation-time" className="block text-sm font-medium text-slate-700">
            Avg. Consultation Time
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:max-w-[140px]">
              <input
                id="consultation-time"
                type="number"
                min="1"
                max="120"
                step="1"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-14 text-slate-900 outline-none transition-all focus:border-teal-400 focus:ring-3 focus:ring-teal-100"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">min</span>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-60"
            >
              {saving ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Feedback messages */}
      {message && (
        <div className="flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700 ring-1 ring-teal-200">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {message}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
