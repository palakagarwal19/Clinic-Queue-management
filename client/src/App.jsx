import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ReceptionistDashboard from './pages/ReceptionistDashboard.jsx';
import PatientDisplay from './pages/PatientDisplay.jsx';

function NavLink({ to, children }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
        active
          ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/30'
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      {children}
    </Link>
  );
}

export default function App() {
  const location = useLocation();
  const isDisplay = location.pathname === '/display';

  if (isDisplay) {
    return (
      <Routes>
        <Route path="/display" element={<PatientDisplay />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar layout */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">CureQ</p>
              <p className="text-[10px] text-slate-400">Queue Management</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Views</p>
            <NavLink to="/">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Receptionist
            </NavLink>
            <NavLink to="/display">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Patient Display
            </NavLink>
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-100 px-5 py-4">
            <p className="text-[10px] text-slate-400">Queue Cure '26 · Wooble</p>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-sm font-bold text-slate-900">CureQ</span>
            </div>
            <nav className="flex gap-1">
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/display">Display</NavLink>
            </nav>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8">
            <Routes>
              <Route path="/" element={<ReceptionistDashboard />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
