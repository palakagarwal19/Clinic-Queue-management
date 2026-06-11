import { useState } from 'react';
import { api } from '../api/client.js';

export default function AddPatientForm({ onAdded }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

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
      onAdded?.(patient);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="patient-name" className="mb-1 block text-sm font-medium text-slate-700">
          Patient Name
        </label>
        <input
          id="patient-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter patient name"
          maxLength={100}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {loading ? 'Adding...' : 'Add Patient'}
      </button>
    </form>
  );
}
