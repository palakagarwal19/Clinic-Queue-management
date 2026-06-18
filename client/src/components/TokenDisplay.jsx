export default function TokenDisplay({ token, label = 'Current Token', size = 'lg' }) {
  const sizeClasses =
    size === 'xl'
      ? 'text-7xl sm:text-8xl md:text-9xl'
      : 'text-5xl sm:text-6xl';

  return (
    <div className="text-center py-4">
      {label && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </p>
      )}
      <div
        className={`font-black tabular-nums leading-none ${sizeClasses} ${
          token == null
            ? 'text-slate-200'
            : 'bg-gradient-to-br from-teal-500 to-teal-700 bg-clip-text text-transparent'
        }`}
      >
        {token != null ? `#${token}` : '—'}
      </div>
      {token != null && (
        <div className="mt-3 flex justify-center">
          <span className="inline-block h-1 w-16 rounded-full bg-gradient-to-r from-teal-400 to-teal-600" />
        </div>
      )}
    </div>
  );
}
