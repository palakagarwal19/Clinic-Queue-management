import { useEffect, useState } from 'react';

export default function LiveClock({ dark = false }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateStr = time.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  if (dark) {
    return (
      <div className="text-right">
        <p className="font-mono text-5xl font-black tabular-nums text-white sm:text-6xl">{timeStr}</p>
        <p className="mt-1 text-sm font-medium text-slate-400">{dateStr}</p>
      </div>
    );
  }

  return (
    <div className="text-right">
      <p className="text-sm font-semibold tabular-nums text-slate-700">{timeStr}</p>
      <p className="text-xs text-slate-400">{dateStr}</p>
    </div>
  );
}
