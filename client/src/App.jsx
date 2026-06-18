import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ReceptionistDashboard from './pages/ReceptionistDashboard.jsx';
import PatientDisplay from './pages/PatientDisplay.jsx';

function NavLink({ to, children, icon }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/25'
          : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'
      }`}
    >
      <span>{icon}</span>
      {children}
    </Link>
  );
}

export default function App() {
  const location = useLocation();
  const isDisplayMode = location.pathname === '/display';

  return (
    <div className="min-h-screen">
      {!isDisplayMode && (
        <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl shadow-sm">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {/* Logo / Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg shadow-teal-500/30">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Clinic Queue</h1>
                <p className="text-xs text-slate-400">Real-time patient management</p>
              </div>
            </div>
            <nav className="flex flex-wrap gap-2">
              <NavLink to="/" icon="🏥">Receptionist</NavLink>
              <NavLink to="/display" icon="📺">Patient Display</NavLink>
            </nav>
          </div>
        </header>
      )}

      <main className={`mx-auto px-4 py-8 ${isDisplayMode ? 'max-w-5xl' : 'max-w-6xl'}`}>
        <Routes>
          <Route path="/" element={<ReceptionistDashboard />} />
          <Route path="/display" element={<PatientDisplay />} />
        </Routes>
      </main>
    </div>
  );
}
