export default function WaitingQueueList({ patients = [] }) {
  if (patients.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">
        No patients waiting
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      {patients.map((patient) => (
        <li
          key={patient.id}
          className="flex items-center justify-between px-4 py-3 sm:px-5"
        >
          <span className="font-semibold text-teal-700">#{patient.tokenNumber}</span>
          <span className="text-slate-700">{patient.name}</span>
        </li>
      ))}
    </ul>
  );
}
