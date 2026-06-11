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
        setMessage(`Called token #${result.patient.tokenNumber} — ${result.patient.name}`);
      } else {
        setMessage('No patients in the waiting queue');
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
      setMessage('Queue reset — token numbering starts from #101');
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
      setMessage('Consultation time updated');
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <button
          onClick={handleCallNext}
          disabled={calling || resetting}
          className="w-full rounded-xl bg-amber-500 px-6 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {calling ? 'Calling...' : 'Call Next Token'}
        </button>

        <button
          onClick={handleReset}
          disabled={calling || resetting}
          className="w-full rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resetting ? 'Resetting...' : 'Reset Queue (New Session)'}
        </button>
      </div>

      <form onSubmit={handleSaveTime} className="space-y-3">
        <label htmlFor="consultation-time" className="block text-sm font-medium text-slate-700">
          Avg. Consultation Time (minutes)
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            id="consultation-time"
            type="number"
            min="1"
            max="120"
            step="1"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 sm:max-w-[160px]"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>

      {message && <p className="text-sm text-teal-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
