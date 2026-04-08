import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Target, Award } from "lucide-react";

const API_BASE = "http://localhost:3001/api";

function RevenueCard({ title, value, subtitle, icon: Icon, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    purple: "bg-purple-500/20 text-purple-400"
  };
  
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-4xl font-bold text-white mt-2">{value}</p>
          {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
          <Icon size={32} />
        </div>
      </div>
    </div>
  );
}

export default function Revenue() {
  const [metrics, setMetrics] = useState({});
  const [cityData, setCityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [metricsRes, cityRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/metrics`),
        fetch(`${API_BASE}/dashboard/by-city`)
      ]);
      
      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (cityRes.ok) setCityData(await cityRes.json());
    } catch (err) {
      console.error("Failed to fetch revenue data:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading revenue data...</div>
      </div>
    );
  }

  const totalClosed = metrics.closed_leads || 0;
  const totalRevenue = totalClosed * 300;
  const conversionRate = metrics.conversionRate || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Revenue Tracking</h1>

      {/* Main Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RevenueCard
          title="Closed Revenue"
          value={`$${metrics.closedRevenue || 0}`}
          subtitle={`${totalClosed} deals closed`}
          icon={DollarSign}
          color="green"
        />
        <RevenueCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          subtitle="Priority to closed"
          icon={TrendingUp}
          color="blue"
        />
        <RevenueCard
          title="Active Pipeline"
          value={`$${metrics.projectedRevenueMed || 0}`}
          subtitle={`${metrics.priority_leads || 0} priority leads`}
          icon={Target}
          color="yellow"
        />
        <RevenueCard
          title="Avg Deal Value"
          value="$300"
          subtitle="Standard tier"
          icon={Award}
          color="purple"
        />
      </div>

      {/* Revenue Breakdown by Tier */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Revenue by Tier</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-700/50 rounded-xl p-6 text-center">
            <p className="text-sm text-slate-400 mb-2">Entry Tier</p>
            <p className="text-2xl font-bold text-green-400">$99</p>
            <p className="text-xs text-slate-500 mt-1">per deal</p>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-6 text-center border-2 border-blue-500/30">
            <p className="text-sm text-slate-400 mb-2">Standard Tier</p>
            <p className="text-2xl font-bold text-blue-400">$299</p>
            <p className="text-xs text-slate-500 mt-1">recommended</p>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-6 text-center">
            <p className="text-sm text-slate-400 mb-2">Full Rebuild</p>
            <p className="text-2xl font-bold text-purple-400">$799</p>
            <p className="text-xs text-slate-500 mt-1">per deal</p>
          </div>
        </div>
      </div>

      {/* Revenue by City */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Revenue by City</h2>
        {cityData.length > 0 ? (
          <div className="space-y-4">
            {cityData.map((city) => {
              const cityRevenue = (city.closed || 0) * 300;
              const cityPotential = (city.priority_leads || 0) * 300;
              const pipelineValue = ((city.contacted || 0) + (city.priority_leads || 0)) * 300;
              
              return (
                <div key={city.City} className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white">{city.City}</h3>
                    <div className="flex gap-4 text-sm">
                      <span className="text-slate-400">
                        <span className="text-green-400">{city.closed || 0}</span> closed
                      </span>
                      <span className="text-slate-400">
                        <span className="text-yellow-400">{city.priority_leads || 0}</span> priority
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Closed</p>
                      <p className="text-lg font-bold text-green-400">${cityRevenue}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Pipeline</p>
                      <p className="text-lg font-bold text-blue-400">${pipelineValue}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Potential</p>
                      <p className="text-lg font-bold text-purple-400">${cityPotential}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-400">No city data yet. Add leads to see revenue breakdown.</p>
        )}
      </div>

      {/* Projection Scenarios */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Revenue Scenarios</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <div>
              <p className="text-green-400 font-medium">Conservative Scenario</p>
              <p className="text-sm text-slate-400">Close 10% of priority leads at $100</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">
                ${((metrics.priority_leads || 0) * 0.1 * 100).toFixed(0)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div>
              <p className="text-blue-400 font-medium">Expected Scenario</p>
              <p className="text-sm text-slate-400">Close 20% of priority leads at $300</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-400">
                ${((metrics.priority_leads || 0) * 0.2 * 300).toFixed(0)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div>
              <p className="text-purple-400 font-medium">Optimistic Scenario</p>
              <p className="text-sm text-slate-400">Close 30% of priority leads at $800</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-400">
                ${((metrics.priority_leads || 0) * 0.3 * 800).toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
