import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import ConfirmModal from './ConfirmModal.jsx';

export default function QueueControls({ consultationTime, onUpdated }) {
  const [minutes, setMinutes] = useState(consultationTime ?? 10);
  const [calling, setCalling] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // { type: 'callNext' | 'reset' }

  useEffect(() => {
    if (consultationTime != null) setMinutes(consultationTime);
  }, [consultationTime]);

  function showMessage(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  }

  async function doCallNext() {
    setModal(null);
    setError(''); setMessage('');
    setCalling(true);
    try {
      const result = await api.callNext();
      if (result.patient) {
        showMessage(`Now serving #${result.patient.tokenNumber} · ${result.patient.name}`);
      } else {
        showMessage('Queue is empty — no patients waiting');
      }
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setCalling(false);
    }
  }

  async function doReset() {
    setModal(null);
    setError(''); setMessage('');
    setResetting(true);
    try {
      await api.resetQueue();
      showMessage('Session reset — tokens start from #101');
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setResetting(false);
    }
  }

  async function handleSaveTime(e) {
    e.preventDefault();
    setError(''); setMessage('');
    const parsed = Number(minutes);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 120) {
      setError('Enter a whole number between 1 and 120');
      return;
    }
    setSaving(true);
    try {
      await api.setConsultationTime(parsed);
      showMessage('Consultation time saved');
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const busy = calling || resetting;

  return (
    <>
      <ConfirmModal
        open={modal === 'callNext'}
        title="Call next patient?"
        message="The current token will be marked complete and the next patient in line will be called."
        confirmLabel="Yes, call next"
        confirmClass="bg-amber-500 hover:bg-amber-600 text-white"
        onConfirm={doCallNext}
        onCancel={() => setModal(null)}
      />
      <ConfirmModal
        open={modal === 'reset'}
        title="Reset queue session?"
        message="All waiting and serving patients will be cleared. Token numbering will restart from #101. This cannot be undone."
        confirmLabel="Reset session"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        onConfirm={doReset}
        onCancel={() => setModal(null)}
      />

      <div className="space-y-4">
        {/* Call Next — hero button */}
        <button
          onClick={() => setModal('callNext')}
          disabled={busy}
          className="group relative w-full overflow-hidden rounded-xl bg-amber-500 px-6 py-4 text-base font-bold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center gap-2">
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

        {/* Consultation time */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <form onSubmit={handleSaveTime}>
            <label htmlFor="consult-time" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Avg. Consultation Time
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  id="consult-time"
                  type="number"
                  min="1"
                  max="120"
                  step="1"
                  value={minutes}
                  onChange={e => setMinutes(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-12 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">min</span>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 disabled:opacity-50"
              >
                {saving ? '...' : 'Save'}
              </button>
            </div>
          </form>
        </div>

        {/* Reset */}
        <button
          onClick={() => setModal('reset')}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resetting ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          )}
          Reset Queue (New Session)
        </button>

        {/* Feedback */}
        {message && (
          <div className="flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2.5 text-xs font-medium text-teal-700 ring-1 ring-teal-200">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {message}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700 ring-1 ring-red-200">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {error}
          </div>
        )}
      </div>
    </>
  );
}
