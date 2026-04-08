import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import Revenue from './pages/Revenue';
import Outreach from './pages/Outreach';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900">
        <nav className="bg-slate-900 border-b border-slate-700/60 px-6 py-0 sticky top-0 z-50 backdrop-blur-sm">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">P</div>
              <h1 className="text-base font-bold text-white tracking-tight">Plumbing CRM</h1>
            </div>
            <div className="flex">
              {[['/', 'Dashboard'], ['/leads', 'Leads'], ['/revenue', 'Revenue'], ['/outreach', 'Outreach']].map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `px-4 h-14 flex items-center text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? 'border-blue-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
        
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/:id" element={<LeadDetail />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/outreach" element={<Outreach />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
