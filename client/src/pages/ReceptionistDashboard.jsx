import { useSocket } from '../hooks/useSocket.js';
import AddPatientForm from '../components/AddPatientForm.jsx';
import QueueControls from '../components/QueueControls.jsx';
import WaitingQueueList from '../components/WaitingQueueList.jsx';
import TokenDisplay from '../components/TokenDisplay.jsx';

export default function ReceptionistDashboard() {
  const { queueState, connected } = useSocket();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            connected ? 'bg-emerald-500' : 'bg-red-400'
          }`}
        />
        <span className="text-sm text-slate-500">
          {connected ? 'Connected — live updates' : 'Connecting...'}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Add Patient</h2>
          <AddPatientForm />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Queue Controls</h2>
          <QueueControls
            consultationTime={queueState?.consultationTimeMinutes}
          />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Now Serving</h2>
          <TokenDisplay token={queueState?.currentToken} />
          {queueState?.currentPatientName && (
            <p className="mt-3 text-center text-slate-600">{queueState.currentPatientName}</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Waiting Queue</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {queueState?.tokensAhead ?? 0} waiting
            </span>
          </div>
          <WaitingQueueList patients={queueState?.waitingQueue} />
        </section>
      </div>
    </div>
  );
}
