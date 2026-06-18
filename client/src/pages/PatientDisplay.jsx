import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../hooks/useSocket.js';
import LiveClock from '../components/LiveClock.jsx';

function formatWaitTime(minutes) {
  if (!minutes || minutes <= 0) return 'No wait';
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
}

function TokenNumber({ token }) {
  const [key, setKey] = useState(0);
  const prev = useRef(token);

  useEffect(() => {
    if (token !== prev.current) {
      setKey(k => k + 1);
      prev.current = token;
    }
  }, [token]);

  return (
    <div key={key} className="token-animate token-glow inline-block font-mono text-[clamp(5rem,18vw,12rem)] font-black tabular-nums leading-none text-emerald-400">
      {token != null ? `#${token}` : '—'}
    </div>
  );
}

function Loading() {
  return (
    <div className="display-page flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-emerald-900 border-t-emerald-400" />
        <p className="text-lg font-medium text-slate-500">Connecting to queue...</p>
      </div>
    </div>
  );
}

export default function PatientDisplay() {
  const { queueState, connected, loading } = useSocket();
  const nextUp = queueState?.waitingQueue?.slice(0, 6) ?? [];
  const nextToken = nextUp[0]?.tokenNumber ?? null;
  const extra = (queueState?.waitingQueue?.length ?? 0) - 6;

  if (loading && !queueState) return <Loading />;

  return (
    <div className="display-page flex min-h-screen flex-col text-white">

      {/* ── Top bar ── */}
      <header className="flex items-center justify-between border-b border-white/5 px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 ring-1 ring-teal-500/30">
            <svg className="h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white">CureQ</p>
            <p className="text-[10px] text-slate-500">Patient Waiting Display</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${
            connected
              ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
              : 'bg-red-500/10 text-red-400 ring-red-500/20'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-400 live-dot' : 'bg-red-400'}`} />
            {connected ? 'LIVE' : 'RECONNECTING'}
          </div>
          <LiveClock dark />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-8">

        {/* Now serving hero */}
        <div className="w-full max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] px-10 py-14 text-center backdrop-blur-sm">

            {/* Subtle background glow */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="h-96 w-96 rounded-full bg-emerald-400 blur-3xl" />
            </div>

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-slate-500">
                Now Serving
              </p>

              <div className="my-6 flex items-center justify-center">
                <TokenNumber token={queueState?.currentToken} />
              </div>

              {queueState?.currentPatientName ? (
                <p className="text-xl font-semibold text-slate-300">
                  {queueState.currentPatientName}
                </p>
              ) : (
                <p className="text-sm text-slate-600">No patient currently being served</p>
              )}

              <div className="mt-6 flex items-center justify-center gap-2">
                <div className="h-px w-12 bg-emerald-800" />
                <p className="text-xs font-medium text-slate-600">Please proceed to the consultation room when called</p>
                <div className="h-px w-12 bg-emerald-800" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid w-full max-w-4xl grid-cols-3 gap-4">
          {/* Waiting */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Waiting</p>
            <p className="mt-2 text-5xl font-black tabular-nums text-white">
              {queueState?.tokensAhead ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-600">patients in queue</p>
          </div>

          {/* Next token */}
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-6 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">Next Token</p>
            <p className="mt-2 text-5xl font-black tabular-nums text-indigo-300">
              {nextToken != null ? `#${nextToken}` : '—'}
            </p>
            <p className="mt-1 text-xs text-indigo-500">get ready</p>
          </div>

          {/* Est wait */}
          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/10 p-6 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-400">Est. Wait</p>
            <p className="mt-2 text-3xl font-black text-teal-300">
              {formatWaitTime(queueState?.estimatedWaitMinutes)}
            </p>
            <p className="mt-1 text-xs text-teal-600">{queueState?.consultationTimeMinutes ?? 10} min/visit</p>
          </div>
        </div>

        {/* Up next tokens */}
        {nextUp.length > 0 && (
          <div className="mt-6 w-full max-w-4xl">
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-8 py-5">
              <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Coming Up
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {nextUp.map((p, i) => (
                  <div
                    key={p.id}
                    className={`rounded-xl px-5 py-2.5 text-base font-bold tabular-nums ${
                      i === 0
                        ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30'
                        : 'bg-white/5 text-slate-400 ring-1 ring-white/5'
                    }`}
                  >
                    #{p.tokenNumber}
                  </div>
                ))}
                {extra > 0 && (
                  <div className="rounded-xl bg-white/5 px-5 py-2.5 text-sm text-slate-500 ring-1 ring-white/5">
                    +{extra} more
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Bottom ticker ── */}
      <footer className="border-t border-white/5 py-3 overflow-hidden">
        <div className="relative whitespace-nowrap">
          <span className="marquee inline-block text-xs font-medium text-slate-600">
            Welcome to our clinic &nbsp;·&nbsp; Please keep your token slip ready &nbsp;·&nbsp;
            Kindly maintain silence in the waiting area &nbsp;·&nbsp;
            For emergencies, please inform the receptionist immediately &nbsp;·&nbsp;
            Thank you for your patience &nbsp;·&nbsp;
            Welcome to our clinic &nbsp;·&nbsp; Please keep your token slip ready
          </span>
        </div>
      </footer>

    </div>
  );
}
