import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function QueueControls({ consultationTime, onUpdated }) {
  const [minutes, setMinutes] = useState(consultationTime ?? 10);

  useEffect(() => {
    if (consultationTime != null) {
      setMinutes(consultationTime);
    }
  }, [consultationTime]);
  const [calling, setCalling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleCallNext() {
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

  async function handleSaveTime(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      await api.setConsultationTime(Number(minutes));
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
      <div>
        <button
          onClick={handleCallNext}
          disabled={calling}
          className="w-full rounded-xl bg-amber-500 px-6 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {calling ? 'Calling...' : 'Call Next Token'}
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
