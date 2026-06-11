import { useSocket } from '../hooks/useSocket.js';
import TokenDisplay from '../components/TokenDisplay.jsx';

function formatWaitTime(minutes) {
  if (minutes <= 0) return 'No wait';
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `~${hours}h ${mins}m` : `~${hours}h`;
}

export default function PatientDisplay() {
  const { queueState, connected } = useSocket();

  return (
    <div className="min-h-[70vh]">
      <div className="mb-6 flex items-center justify-center gap-2">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            connected ? 'bg-emerald-500' : 'bg-red-400 animate-pulse'
          }`}
        />
        <span className="text-sm text-slate-500">
          {connected ? 'Live' : 'Reconnecting...'}
        </span>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-10 md:p-14">
        <div className="mb-10 text-center">
          <p className="text-lg font-medium uppercase tracking-widest text-slate-500 sm:text-xl">
            Now Serving
          </p>
          <div className="mt-4">
            <TokenDisplay
              token={queueState?.currentToken}
              label=""
              size="xl"
            />
          </div>
          {queueState?.currentPatientName && (
            <p className="mt-4 text-xl text-slate-600 sm:text-2xl">
              {queueState.currentPatientName}
            </p>
          )}
        </div>

        <div className="grid gap-6 border-t border-slate-200 pt-8 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-6 text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
              Tokens Ahead
            </p>
            <p className="mt-2 text-5xl font-bold tabular-nums text-slate-800 sm:text-6xl">
              {queueState?.tokensAhead ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-teal-50 p-6 text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-teal-700">
              Estimated Wait
            </p>
            <p className="mt-2 text-4xl font-bold text-teal-800 sm:text-5xl">
              {formatWaitTime(queueState?.estimatedWaitMinutes ?? 0)}
            </p>
            <p className="mt-2 text-sm text-teal-600">
              Based on {queueState?.consultationTimeMinutes ?? 10} min per consultation
            </p>
          </div>
        </div>

        {queueState?.waitingQueue?.length > 0 && (
          <div className="mt-8 border-t border-slate-200 pt-8">
            <p className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-slate-500">
              Up Next
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {queueState.waitingQueue.slice(0, 5).map((patient) => (
                <span
                  key={patient.id}
                  className="rounded-full bg-slate-100 px-4 py-2 text-lg font-semibold text-slate-700"
                >
                  #{patient.tokenNumber}
                </span>
              ))}
              {queueState.waitingQueue.length > 5 && (
                <span className="rounded-full bg-slate-100 px-4 py-2 text-lg text-slate-500">
                  +{queueState.waitingQueue.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
