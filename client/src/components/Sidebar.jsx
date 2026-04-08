import { NavLink, useLocation } from 'react-router-dom';
import {
  Search, List, Star, Mail, MessageSquare,
  Handshake, CheckCircle, Send, DollarSign, LayoutDashboard, RefreshCw
} from 'lucide-react';
import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:3001/api';

const PIPELINE_LINKS = [
  { to: '/add', label: 'Discover', icon: Search, countKey: null },
  { to: '/leads',     label: 'All Leads', icon: List,   countKey: 'total_leads' },
];

const STAGE_LINKS = [
  { to: '/leads?status=PRIORITY',   label: 'Priority',   icon: Star,          countKey: 'priority_leads',   countColor: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  { to: '/leads?status=CONTACTED',  label: 'Contacted',  icon: Mail,          countKey: 'contacted_leads',  countColor: 'bg-blue-500/20 text-blue-400' },
  { to: '/leads?status=RESPONDED',  label: 'Responded',  icon: MessageSquare, countKey: 'responded_leads',  countColor: 'bg-cyan-500/20 text-cyan-400' },
  { to: '/leads?status=INTERESTED', label: 'Interested', icon: Handshake,     countKey: 'interested_leads', countColor: 'bg-purple-500/20 text-purple-400' },
  { to: '/leads?status=CLOSED',     label: 'Closed',     icon: CheckCircle,   countKey: 'closed_leads',     countColor: 'bg-green-500/20 text-green-400 border border-green-500/30' },
];

const TOOL_LINKS = [
  { to: '/outreach',  label: 'Outreach',  icon: Send },
  { to: '/revenue',   label: 'Revenue',   icon: DollarSign },
  { to: '/',          label: 'Dashboard', icon: LayoutDashboard, end: true },
];

function SidebarLink({ to, label, icon: Icon, countKey, countColor, metrics, end = false }) {
  const location = useLocation();
  const count = countKey ? (metrics[countKey] ?? null) : null;

  // For links with query params (e.g. /leads?status=PRIORITY), match both pathname and search
  const [toPath, toSearch] = to.split('?');
  const isActive = toSearch
    ? location.pathname === toPath && location.search === `?${toSearch}`
    : end
      ? location.pathname === toPath
      : location.pathname.startsWith(toPath);

  return (
    <NavLink
      to={to}
      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-600/15 border border-blue-500/30 text-white'
          : 'text-slate-400 hover:bg-slate-700/50 hover:text-white border border-transparent'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon size={16} />
        <span>{label}</span>
      </div>
      {count !== null && (
        <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${countColor || 'bg-slate-700 text-slate-300'}`}>
          {count}
        </span>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const [metrics, setMetrics] = useState({});

  async function fetchMetrics() {
    try {
      const res = await fetch(`${API_BASE}/dashboard/metrics`);
      if (res.ok) setMetrics(await res.json());
    } catch {
      // sidebar counts fail silently
    }
  }

  useEffect(() => { fetchMetrics(); }, []);

  return (
    <aside className="w-56 flex-shrink-0 bg-[#0d1829] border-r border-slate-700/50 flex flex-col h-screen sticky top-0">

      {/* Brand */}
      <div className="px-4 py-4 border-b border-slate-700/50">
        <img src="/logo.png" alt="PipeFlowOps" className="h-10 w-auto" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">

        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-2">Pipeline</p>
        {PIPELINE_LINKS.map(link => (
          <SidebarLink key={link.to} {...link} metrics={metrics} end={link.to === '/leads'} />
        ))}

        <div className="border-t border-slate-700/40 my-3" />
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-2">Stages</p>
        {STAGE_LINKS.map(link => (
          <SidebarLink key={link.to} {...link} metrics={metrics} />
        ))}

        <div className="border-t border-slate-700/40 my-3" />
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-2">Tools</p>
        {TOOL_LINKS.map(link => (
          <SidebarLink key={link.to} {...link} metrics={metrics} end={link.end} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700/50">
        <button
          onClick={fetchMetrics}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <RefreshCw size={12} />
          Refresh counts
        </button>
      </div>
    </aside>
  );
}
