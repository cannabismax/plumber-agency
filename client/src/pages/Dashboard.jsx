import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, Target, DollarSign, TrendingUp,
  Phone, Mail, AlertCircle, CheckCircle, Star, Handshake, MessageSquare, PlusCircle
} from "lucide-react";
import FunnelBar from "../components/FunnelBar";

const API_BASE = "http://localhost:3001/api";

function MetricCard({ title, value, subtitle, icon: Icon, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    purple: "bg-purple-500/20 text-purple-400",
    red: "bg-red-500/20 text-red-400"
  };
  
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    PRIORITY: "badge-priority",
    CONTACTED: "badge-contacted",
    RESPONDED: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    INTERESTED: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    CLOSED: "badge-closed",
    BACKLOG: "badge-backlog",
    DISCOVERED: "bg-slate-500/20 text-slate-400 border border-slate-500/30"
  };
  
  return (
    <span className={`badge ${statusConfig[status] || "badge-backlog"}`}>
      {status}
    </span>
  );
}

function NextActions({ metrics }) {
  const actions = [];

  if ((metrics.priority_leads || 0) > 0) {
    actions.push({
      icon: Star,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
      text: `${metrics.priority_leads} leads ready for outreach`,
      to: "/leads?status=PRIORITY"
    });
  }
  if ((metrics.interested_leads || 0) > 0) {
    actions.push({
      icon: Handshake,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
      text: `${metrics.interested_leads} interested leads — close the deal`,
      to: "/leads?status=INTERESTED"
    });
  }
  if ((metrics.responded_leads || 0) > 0) {
    actions.push({
      icon: MessageSquare,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
      text: `${metrics.responded_leads} leads responded — follow up`,
      to: "/leads?status=RESPONDED"
    });
  }
  if (actions.length === 0) {
    actions.push({
      icon: PlusCircle,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      text: "All caught up! Add more leads to keep the pipeline moving.",
      to: "/add-leads"
    });
  }

  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Next Actions</h2>
      <div className="space-y-2">
        {actions.map((action, i) => (
          <Link
            key={i}
            to={action.to}
            className={`flex items-center gap-3 p-3 rounded-lg border ${action.bg} hover:opacity-80 transition-opacity`}
          >
            <action.icon size={18} className={action.color} />
            <span className={`text-sm font-medium ${action.color}`}>{action.text}</span>
            <span className="ml-auto text-slate-500 text-xs">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState({});
  const [cityData, setCityData] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [metricsRes, cityRes, leadsRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/metrics`),
        fetch(`${API_BASE}/dashboard/by-city`),
        fetch(`${API_BASE}/leads?limit=10`)
      ]);
      
      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (cityRes.ok) setCityData(await cityRes.json());
      if (leadsRes.ok) setRecentLeads(await leadsRes.json());
      
      setError(null);
    } catch (err) {
      setError("Failed to connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-500/50">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle size={24} />
          <div>
            <p className="font-medium">Connection Error</p>
            <p className="text-sm text-slate-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const conversionRate = metrics.conversionRate || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Control Panel</h1>
        <button onClick={fetchData} className="btn-secondary">
          Refresh
        </button>
      </div>

      <NextActions metrics={metrics} />

      <FunnelBar metrics={metrics} />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Leads"
          value={metrics.total_leads || 0}
          subtitle={`${metrics.backlog_leads || 0} in backlog`}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Priority Leads"
          value={metrics.priority_leads || 0}
          subtitle="Ready for outreach"
          icon={Target}
          color="yellow"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          subtitle={`${metrics.closed_leads || 0} closed`}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Closed Revenue"
          value={`$${metrics.closedRevenue || 0}`}
          subtitle={`$${metrics.projectedRevenueMed || 0} projected`}
          icon={DollarSign}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By City */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Leads by City</h2>
          {cityData.length > 0 ? (
            <div className="space-y-3">
              {cityData.map((city) => (
                <div key={city.City} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{city.City}</p>
                    <p className="text-xs text-slate-400">
                      {city.priority_leads} priority / {city.total_leads} total
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-400">{city.total_leads}</p>
                    <p className="text-xs text-slate-400">avg: {city.avg_score?.toFixed(0)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No city data yet</p>
          )}
        </div>

        {/* Recent Leads */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Priority Leads</h2>
            <Link to="/leads" className="text-blue-400 text-sm hover:underline">View All</Link>
          </div>
          {recentLeads.length > 0 ? (
            <div className="space-y-3">
              {recentLeads.slice(0, 5).map((lead) => (
                <Link 
                  key={lead.LeadID} 
                  to={`/leads/${lead.LeadID}`}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">{lead.BusinessName}</p>
                    <p className="text-xs text-slate-400">{lead.City}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={lead.Status} />
                    <span className="text-lg font-bold text-yellow-400">{lead.LeadScore}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No leads yet</p>
          )}
        </div>
      </div>

      {/* Revenue Projection */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Revenue Projection</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-400">Conservative (LOW)</p>
            <p className="text-2xl font-bold text-green-400 mt-1">
              ${metrics.projectedRevenueLow || 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">$100/lead</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4 text-center border-2 border-blue-500/30">
            <p className="text-sm text-slate-400">Expected (MED)</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              ${metrics.projectedRevenueMed || 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">$300/lead</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-400">Optimistic (HIGH)</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">
              ${metrics.projectedRevenueHigh || 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">$800/lead</p>
          </div>
        </div>
      </div>
    </div>
  );
}
