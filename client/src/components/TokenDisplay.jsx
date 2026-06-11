export default function TokenDisplay({ token, label = 'Current Token', size = 'lg' }) {
  const sizeClasses =
    size === 'xl'
      ? 'text-7xl sm:text-8xl md:text-9xl'
      : 'text-5xl sm:text-6xl';

  return (
    <div className="text-center">
      <p className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-500 sm:text-base">
        {label}
      </p>
      <div
        className={`font-bold tabular-nums text-teal-600 ${sizeClasses} ${
          token == null ? 'text-slate-300' : ''
        }`}
      >
        {token != null ? `#${token}` : '—'}
      </div>
    </div>
  );
}
