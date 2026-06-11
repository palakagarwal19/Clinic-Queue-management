import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ReceptionistDashboard from './pages/ReceptionistDashboard.jsx';
import PatientDisplay from './pages/PatientDisplay.jsx';

function NavLink({ to, children }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-teal-600 text-white shadow-sm'
          : 'bg-white text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </Link>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Clinic Queue System</h1>
            <p className="text-sm text-slate-500">Real-time patient queue management</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            <NavLink to="/">Receptionist</NavLink>
            <NavLink to="/display">Patient Display</NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<ReceptionistDashboard />} />
          <Route path="/display" element={<PatientDisplay />} />
        </Routes>
      </main>
    </div>
  );
}
