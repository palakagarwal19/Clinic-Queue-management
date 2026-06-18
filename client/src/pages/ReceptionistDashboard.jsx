import { useSocket } from '../hooks/useSocket.js';
import AddPatientForm from '../components/AddPatientForm.jsx';
import QueueControls from '../components/QueueControls.jsx';
import WaitingQueueList from '../components/WaitingQueueList.jsx';
import TokenDisplay from '../components/TokenDisplay.jsx';

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-5 w-48 rounded-full bg-slate-200" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-56 rounded-2xl bg-slate-100" />
        <div className="h-56 rounded-2xl bg-slate-100" />
      </div>
      <div className="h-72 rounded-2xl bg-slate-100" />
    </div>
  );
}

export default function ReceptionistDashboard() {
  const { queueState, connected, loading } = useSocket();

  if (loading && !queueState) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
          connected
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
            : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
        }`}>
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-amber-400 live-dot'}`} />
          {connected ? 'Live updates' : 'Offline — polling every 5s'}
        </div>

        {queueState?.queueHealth === 'degraded' && (
          <div className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 ring-1 ring-red-200">
            <span>⚠️</span>
            Queue sync issue — use Call Next to reconcile
          </div>
        )}
      </div>

      {/* Top Row: Add Patient + Queue Controls */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-card rounded-2xl border border-white/80 p-6 shadow-xl shadow-slate-200/60">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100">
              <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Add Patient</h2>
              <p className="text-xs text-slate-500">Register a new patient to the queue</p>
            </div>
          </div>
          <AddPatientForm />
        </section>

        <section className="glass-card rounded-2xl border border-white/80 p-6 shadow-xl shadow-slate-200/60">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
              <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Queue Controls</h2>
              <p className="text-xs text-slate-500">Manage patient flow and session</p>
            </div>
          </div>
          <QueueControls consultationTime={queueState?.consultationTimeMinutes} />
        </section>
      </div>

      {/* Bottom Row: Now Serving + Waiting Queue */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="glass-card rounded-2xl border border-white/80 p-6 shadow-xl shadow-slate-200/60 lg:col-span-1">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Now Serving</h2>
              <p className="text-xs text-slate-500">Current patient</p>
            </div>
          </div>
          <TokenDisplay token={queueState?.currentToken} />
          {queueState?.currentPatientName && (
            <p className="mt-3 text-center text-sm font-medium text-slate-600">{queueState.currentPatientName}</p>
          )}
        </section>

        <section className="glass-card rounded-2xl border border-white/80 p-6 shadow-xl shadow-slate-200/60 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100">
                <svg className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Waiting Queue</h2>
                <p className="text-xs text-slate-500">Patients in line</p>
              </div>
            </div>
            <span className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-rose-200">
              {queueState?.tokensAhead ?? 0} waiting
            </span>
          </div>
          <WaitingQueueList patients={queueState?.waitingQueue} />
        </section>
      </div>
    </div>
  );
}
