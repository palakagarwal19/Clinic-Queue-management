import { useSocket } from '../hooks/useSocket.js';
import AddPatientForm from '../components/AddPatientForm.jsx';
import QueueControls from '../components/QueueControls.jsx';
import WaitingQueueList from '../components/WaitingQueueList.jsx';
import LiveClock from '../components/LiveClock.jsx';

function StatCard({ label, value, sub, color = 'slate' }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-black tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs opacity-60">{sub}</p>}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="skeleton h-64 rounded-2xl lg:col-span-2" />
        <div className="skeleton h-64 rounded-2xl lg:col-span-3" />
      </div>
      <div className="skeleton h-72 rounded-2xl" />
    </div>
  );
}

function formatWait(minutes) {
  if (!minutes || minutes <= 0) return '—';
  if (minutes < 60) return `~${minutes}m`;
  return `~${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function ReceptionistDashboard() {
  const { queueState, connected, loading } = useSocket();

  if (loading && !queueState) return <Skeleton />;

  const totalToday = (queueState?.tokensAhead ?? 0) + (queueState?.currentToken ? 1 : 0);

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Receptionist Dashboard</h1>
          <p className="text-sm text-slate-400">Manage patient flow in real time</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveClock />
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
            connected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-500 live-dot' : 'bg-amber-400'}`} />
            {connected ? 'Live' : 'Reconnecting'}
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Now Serving"
          value={queueState?.currentToken != null ? `#${queueState.currentToken}` : '—'}
          sub={queueState?.currentPatientName ?? 'No patient'}
          color="teal"
        />
        <StatCard
          label="Waiting"
          value={queueState?.tokensAhead ?? 0}
          sub="patients in queue"
          color="amber"
        />
        <StatCard
          label="Est. Wait"
          value={formatWait(queueState?.estimatedWaitMinutes)}
          sub="for last in queue"
          color="indigo"
        />
        <StatCard
          label="Avg. Visit"
          value={`${queueState?.consultationTimeMinutes ?? 10}m`}
          sub="per consultation"
          color="slate"
        />
      </div>

      {/* ── Degraded warning ── */}
      {queueState?.queueHealth === 'degraded' && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 border border-red-200">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
          </svg>
          Queue sync issue detected — click Call Next to reconcile
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="grid gap-5 lg:grid-cols-5">

        {/* Add Patient */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Register Patient</h2>
              <p className="text-xs text-slate-400">Assign a token number</p>
            </div>
          </div>
          <AddPatientForm />
        </div>

        {/* Queue Controls */}
        <div className="card p-5 lg:col-span-3">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Queue Controls</h2>
              <p className="text-xs text-slate-400">Call tokens and manage session</p>
            </div>
          </div>
          <QueueControls consultationTime={queueState?.consultationTimeMinutes} />
        </div>
      </div>

      {/* ── Waiting queue ── */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Waiting Queue</h2>
              <p className="text-xs text-slate-400">All patients currently in line</p>
            </div>
          </div>
          {(queueState?.tokensAhead ?? 0) > 0 && (
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
              {queueState.tokensAhead} waiting
            </span>
          )}
        </div>
        <WaitingQueueList patients={queueState?.waitingQueue} />
      </div>

    </div>
  );
}
