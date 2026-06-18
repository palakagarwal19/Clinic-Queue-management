export default function TokenDisplay({ token, label = 'Current Token' }) {
  return (
    <div className="py-2 text-center">
      {label && (
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      )}
      <div className={`font-black tabular-nums leading-none text-5xl sm:text-6xl ${
        token == null ? 'text-slate-200' : 'text-teal-600'
      }`}>
        {token != null ? `#${token}` : '—'}
      </div>
    </div>
  );
}
