import { useSocket } from '../hooks/useSocket.js';
import TokenDisplay from '../components/TokenDisplay.jsx';

function formatWaitTime(minutes) {
  if (minutes <= 0) return 'No wait';
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `~${hours}h ${mins}m` : `~${hours}h`;
}

function LoadingDisplay() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-teal-100 border-t-teal-500" />
        <p className="text-lg font-medium text-slate-500">Loading queue...</p>
      </div>
    </div>
  );
}

export default function PatientDisplay() {
  const { queueState, connected, loading } = useSocket();
  const nextUp = queueState?.waitingQueue?.slice(0, 5) ?? [];
  const nextToken = nextUp[0]?.tokenNumber ?? null;

  if (loading && !queueState) {
    return <LoadingDisplay />;
  }

  return (
    <div className="min-h-[80vh] space-y-6">
      {/* Header with clinic name and live status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg shadow-teal-500/30">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Clinic Queue</h1>
            <p className="text-xs text-slate-400">Patient Information Display</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
          connected
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
            : 'bg-red-50 text-red-600 ring-1 ring-red-200'
        }`}>
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-400 live-dot'}`} />
          {connected ? 'Live' : 'Reconnecting...'}
        </div>
      </div>

      {/* Main Now Serving Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 p-8 shadow-2xl shadow-teal-900/30 sm:p-12 md:p-16">
        {/* Decorative circles */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute right-32 bottom-8 h-32 w-32 rounded-full bg-white/5" />

        <div className="relative text-center">
          <p className="text-base font-semibold uppercase tracking-[0.3em] text-teal-200 sm:text-lg">
            Now Serving
          </p>

          <div className="my-6">
            {queueState?.currentToken != null ? (
              <div className="inline-flex items-center justify-center">
                <span className="token-glow text-8xl font-black tabular-nums text-white sm:text-9xl md:text-[10rem]">
                  #{queueState.currentToken}
                </span>
              </div>
            ) : (
              <span className="text-8xl font-black text-teal-400/60 sm:text-9xl">—</span>
            )}
          </div>

          {queueState?.currentPatientName && (
            <p className="mt-2 text-xl font-medium text-teal-100">
              {queueState.currentPatientName}
            </p>
          )}

          <p className="mt-4 text-sm text-teal-300">Please proceed to the consultation room</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card rounded-2xl border border-white/80 p-6 shadow-lg shadow-slate-200/50 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Waiting</p>
          <p className="mt-1 text-5xl font-black tabular-nums text-slate-800 sm:text-6xl">
            {queueState?.tokensAhead ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-400">patients in queue</p>
        </div>

        <div className="glass-card rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 shadow-lg shadow-indigo-100 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
            <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Next Token</p>
          <p className="mt-1 text-5xl font-black tabular-nums text-indigo-800 sm:text-6xl">
            {nextToken != null ? `#${nextToken}` : '—'}
          </p>
          <p className="mt-1 text-xs text-indigo-400">up next</p>
        </div>

        <div className="glass-card rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50 p-6 shadow-lg shadow-teal-100 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100">
            <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">Est. Wait</p>
          <p className="mt-1 text-3xl font-black text-teal-800 sm:text-4xl">
            {formatWaitTime(queueState?.estimatedWaitMinutes ?? 0)}
          </p>
          <p className="mt-1 text-xs text-teal-500">
            {queueState?.consultationTimeMinutes ?? 10} min/visit
          </p>
        </div>
      </div>

      {/* Up Next Tokens */}
      {nextUp.length > 0 && (
        <div className="glass-card rounded-2xl border border-white/80 p-6 shadow-lg shadow-slate-200/50">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
            Coming Up Next
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {nextUp.map((patient, idx) => (
              <div
                key={patient.id}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-lg font-bold transition-transform hover:scale-105 ${
                  idx === 0
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                #{patient.tokenNumber}
              </div>
            ))}
            {(queueState?.waitingQueue?.length ?? 0) > 5 && (
              <div className="flex items-center rounded-2xl bg-slate-100 px-5 py-3 text-sm text-slate-500">
                +{queueState.waitingQueue.length - 5} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
