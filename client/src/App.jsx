import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import Revenue from './pages/Revenue';
import Outreach from './pages/Outreach';
import AddLeads from './pages/AddLeads';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0f1a] flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/:id" element={<LeadDetail />} />
            <Route path="/add" element={<AddLeads />} />
            <Route path="/outreach" element={<Outreach />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
