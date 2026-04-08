import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Target, DollarSign, TrendingUp, Mail, Phone, Globe, ArrowRight, RefreshCw, Zap, Clock, CheckCircle } from "lucide-react";

const API_BASE = "http://localhost:3001/api";

function StatCard({ title, value, subtitle, icon: Icon, color, trend }) {
  const colors = {
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
    yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400" },
    green: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-4xl font-bold text-white mt-2">{value}</p>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={14} className="text-green-400" />
              <span className="text-xs text-green-400">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${c.bg} border ${c.border}`}>
          <Icon size={24} className={c.text} />
        </div>
      </div>
    </div>
  );
}

function PipelineStage({ label, count, color, href }) {
  return (
    <Link
      to={href}
      className="flex-1 text-center p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all group"
    >
      <p className="text-2xl font-bold text-white">{count || 0}</p>
      <p className={`text-xs mt-1 ${color}`}>{label}</p>
      <ArrowRight size={14} className="mx-auto mt-2 text-slate-600 group-hover:text-slate-400 transition-colors" />
    </Link>
  );
}

function RecentLeadCard({ lead }) {
  return (
    <Link
      to={`/leads/${lead.LeadID}`}
      className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-all"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center">
        <span className="text-lg font-bold text-blue-400">{lead.BusinessName?.[0] || "?"}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">{lead.BusinessName}</p>
        <p className="text-sm text-slate-400">{lead.City}, {lead.State}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-yellow-400">{lead.LeadScore || 0}</p>
        <p className="text-xs text-slate-500">score</p>
      </div>
    </Link>
  );
}

function QuickAction({ icon: Icon, title, description, href, color }) {
  const colors = {
    blue: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20",
    green: "bg-green-500/10 border-green-500/20 hover:bg-green-500/20",
    purple: "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20",
  };
  
  return (
    <Link
      to={href}
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${colors[color] || colors.blue}`}
    >
      <div className={`p-3 rounded-xl bg-slate-800/50`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <ArrowRight size={20} className="ml-auto text-slate-500" />
    </Link>
  );
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState({});
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchData() {
    setLoading(true);
    try {
      const [metricsRes, leadsRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/metrics`),
        fetch(`${API_BASE}/leads?limit=5`),
      ]);
      
      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (leadsRes.ok) setLeads(await leadsRes.json());
      setError(null);
    } catch (err) {
      setError("Cannot connect to server. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw size={20} className="animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
        <Zap size={48} className="mx-auto text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
        <p className="text-slate-400 mb-4">{error}</p>
        <button onClick={fetchData} className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium">
          Try Again
        </button>
      </div>
    );
  }

  const conversionRate = metrics.conversionRate || 0;
  const closedRevenue = (metrics.closed_leads || 0) * 300;
  const projectedRevenue = (metrics.interested_leads || 0) * 300;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Control Panel</h1>
          <p className="text-slate-400 mt-1">Your plumbing lead generation hub</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition-all"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={metrics.total_leads || 0}
          subtitle={`${metrics.backlog_leads || 0} in backlog`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Priority Leads"
          value={metrics.priority_leads || 0}
          subtitle="Ready for outreach"
          icon={Target}
          color="yellow"
        />
        <StatCard
          title="Closed Revenue"
          value={`$${closedRevenue.toLocaleString()}`}
          subtitle={`${metrics.closed_leads || 0} deals closed`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          subtitle={`$${projectedRevenue.toLocaleString()} potential`}
          icon={TrendingUp}
          color="purple"
          trend={`+${Math.round(conversionRate * 10)}% this month`}
        />
      </div>

      {/* Pipeline */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Pipeline</h2>
        <div className="flex gap-3">
          <PipelineStage label="All" count={metrics.total_leads} color="text-slate-300" href="/leads" />
          <PipelineStage label="Priority" count={metrics.priority_leads} color="text-yellow-400" href="/leads?status=PRIORITY" />
          <PipelineStage label="Contacted" count={metrics.contacted_leads} color="text-blue-400" href="/leads?status=CONTACTED" />
          <PipelineStage label="Responded" count={metrics.responded_leads} color="text-cyan-400" href="/leads?status=RESPONDED" />
          <PipelineStage label="Interested" count={metrics.interested_leads} color="text-purple-400" href="/leads?status=INTERESTED" />
          <PipelineStage label="Closed" count={metrics.closed_leads} color="text-green-400" href="/leads?status=CLOSED" />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            icon={Users}
            title="View All Leads"
            description={`${metrics.total_leads || 0} leads in database`}
            href="/leads"
            color="blue"
          />
          <QuickAction
            icon={Mail}
            title="Start Outreach"
            description="Send emails to priority leads"
            href="/outreach"
            color="green"
          />
          <QuickAction
            icon={Target}
            title="Add New Leads"
            description="Discover or enter manually"
            href="/add"
            color="purple"
          />
        </div>
      </div>

      {/* Recent Leads */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Priority Leads</h2>
          <Link to="/leads" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {leads.length > 0 ? (
            leads.slice(0, 5).map((lead) => (
              <RecentLeadCard key={lead.LeadID} lead={lead} />
            ))
          ) : (
            <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
              <Users size={40} className="mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400">No leads yet. Add some leads to get started!</p>
              <Link to="/add" className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">
                Add Leads
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
