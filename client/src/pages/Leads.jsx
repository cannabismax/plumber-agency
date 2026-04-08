import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ChevronLeft, ChevronRight, ExternalLink, Mail, Phone } from "lucide-react";

const API_BASE = "http://localhost:3001/api";

const CITIES = ["All", "Tucson", "Phoenix", "Dallas", "Tampa", "Las Vegas"];
const STATUSES = ["All", "DISCOVERED", "PRIORITY", "CONTACTED", "RESPONDED", "INTERESTED", "CLOSED", "BACKLOG"];

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

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({ city: "All", status: "All", search: "" });
  const pageSize = 20;

  useEffect(() => {
    fetchLeads();
  }, [page, filters.city, filters.status]);

  async function fetchLeads() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: pageSize,
        offset: page * pageSize
      });
      
      if (filters.city !== "All") params.append("city", filters.city);
      if (filters.status !== "All") params.append("status", filters.status);
      
      const res = await fetch(`${API_BASE}/leads?${params}`);
      if (res.ok) {
        let data = await res.json();
        
        if (filters.search) {
          const search = filters.search.toLowerCase();
          data = data.filter(lead => 
            lead.BusinessName?.toLowerCase().includes(search) ||
            lead.Website?.toLowerCase().includes(search) ||
            lead.Phone?.includes(search)
          );
        }
        
        setLeads(data);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Leads</h1>
        <div className="text-sm text-slate-400">
          Showing {leads.length} leads
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, website, or phone..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          
          <select
            value={filters.city}
            onChange={(e) => handleFilterChange("city", e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            {CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            {STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <button onClick={fetchLeads} className="btn-secondary">
            <Filter size={18} className="inline mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-3 text-slate-400 font-medium">Business</th>
                <th className="text-left p-3 text-slate-400 font-medium">City</th>
                <th className="text-left p-3 text-slate-400 font-medium">Contact</th>
                <th className="text-center p-3 text-slate-400 font-medium">Score</th>
                <th className="text-center p-3 text-slate-400 font-medium">Status</th>
                <th className="text-center p-3 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-400">
                    No leads found. Run Phase 1 discovery to find leads.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.LeadID} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-white">{lead.BusinessName}</p>
                        <a 
                          href={lead.Website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                        >
                          {lead.Website?.replace(/^https?:\/\//, "")?.slice(0, 30)}
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </td>
                    <td className="p-3 text-slate-300">{lead.City}</td>
                    <td className="p-3">
                      <div className="text-sm space-y-1">
                        {lead.Phone && lead.Phone !== 'NULL' ? (
                          <a href={`tel:${lead.Phone}`} className="text-slate-300 flex items-center gap-1 hover:text-blue-400 transition-colors">
                            <Phone size={12} /> {lead.Phone}
                          </a>
                        ) : null}
                        {lead.Email && lead.Email !== 'NULL' ? (
                          <a href={`mailto:${lead.Email}`} className="text-slate-300 flex items-center gap-1 hover:text-blue-400 transition-colors">
                            <Mail size={12} /> {lead.Email}
                          </a>
                        ) : null}
                        {(!lead.Phone || lead.Phone === 'NULL') && (!lead.Email || lead.Email === 'NULL') && (
                          <span className="text-slate-600 text-xs italic">No contact info</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-lg font-bold leading-none ${
                          lead.LeadScore >= 70 ? 'text-yellow-400' :
                          lead.LeadScore >= 40 ? 'text-blue-400' : 'text-slate-400'
                        }`}>
                          {lead.LeadScore || 0}
                        </span>
                        <div className="w-10 h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              lead.LeadScore >= 70 ? 'bg-yellow-400' :
                              lead.LeadScore >= 40 ? 'bg-blue-400' : 'bg-slate-500'
                            }`}
                            style={{ width: `${Math.min(100, (lead.LeadScore || 0))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={lead.Status} />
                    </td>
                    <td className="p-3 text-center">
                      <Link 
                        to={`/leads/${lead.LeadID}`}
                        className="btn-primary text-sm py-1 px-3"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} className="inline mr-1" />
            Previous
          </button>
          <span className="text-slate-400">Page {page + 1}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={leads.length < pageSize}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight size={18} className="inline ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
