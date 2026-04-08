import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Plus, ExternalLink, Mail, Phone, Globe, ChevronLeft, ChevronRight, Filter, SlidersHorizontal, X, RefreshCw, ArrowRight } from "lucide-react";

const API_BASE = "http://localhost:3001/api";

const CITIES = ["All", "Tucson", "Phoenix", "Dallas", "Tampa", "Las Vegas", "Houston"];
const STATUSES = ["DISCOVERED", "PRIORITY", "CONTACTED", "RESPONDED", "INTERESTED", "CLOSED", "LOST"];

function StatusBadge({ status }) {
  const config = {
    DISCOVERED: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
    PRIORITY: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    CONTACTED: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    RESPONDED: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
    INTERESTED: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    CLOSED: "bg-green-500/20 text-green-400 border border-green-500/30",
    LOST: "bg-red-500/20 text-red-400 border border-red-500/30",
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config[status] || config.DISCOVERED}`}>
      {status}
    </span>
  );
}

function LeadCard({ lead, onStatusChange }) {
  const scoreColor = lead.LeadScore >= 70 ? "text-yellow-400" : lead.LeadScore >= 40 ? "text-blue-400" : "text-slate-400";
  
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-800 hover:border-slate-600 transition-all group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-blue-400">{lead.BusinessName?.[0] || "?"}</span>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-lg truncate">{lead.BusinessName}</h3>
              <p className="text-sm text-slate-400">{lead.City}, {lead.State}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {lead.Website && (
              <a 
                href={lead.Website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors"
              >
                <Globe size={14} />
                <span className="truncate max-w-[150px]">{lead.Website?.replace(/^https?:\/\//, "")}</span>
                <ExternalLink size={12} />
              </a>
            )}
            {lead.Phone && (
              <a href={`tel:${lead.Phone}`} className="flex items-center gap-1.5 text-slate-400 hover:text-green-400 transition-colors">
                <Phone size={14} />
                {lead.Phone}
              </a>
            )}
            {lead.Email && (
              <a href={`mailto:${lead.Email}`} className="flex items-center gap-1.5 text-slate-400 hover:text-purple-400 transition-colors">
                <Mail size={14} />
                {lead.Email}
              </a>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className={`text-3xl font-bold ${scoreColor}`}>{lead.LeadScore || 0}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Score</p>
          </div>
          <StatusBadge status={lead.Status} />
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          {lead.Status === "PRIORITY" && (
            <button
              onClick={() => onStatusChange(lead.LeadID, "CONTACTED")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Mail size={14} />
              Mark Contacted
            </button>
          )}
          {(lead.Status === "CONTACTED" || lead.Status === "RESPONDED") && (
            <button
              onClick={() => onStatusChange(lead.LeadID, "INTERESTED")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Mark Interested
            </button>
          )}
          {lead.Status === "INTERESTED" && (
            <button
              onClick={() => onStatusChange(lead.LeadID, "CLOSED")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Close Deal
            </button>
          )}
          {lead.Status === "INTERESTED" && (
            <button
              onClick={() => onStatusChange(lead.LeadID, "LOST")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-colors"
            >
              Lost
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            to={`/outreach?lead=${lead.LeadID}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            <Mail size={14} />
            Outreach
          </Link>
          <Link
            to={`/leads/${lead.LeadID}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            Details
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Leads() {
  const location = useLocation();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  const initialStatus = new URLSearchParams(location.search).get("status") || "";
  const [filters, setFilters] = useState({
    city: "All",
    status: initialStatus,
    search: ""
  });
  
  const pageSize = 12;

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: pageSize,
        offset: page * pageSize
      });
      
      if (filters.city !== "All") params.append("city", filters.city);
      if (filters.status) params.append("status", filters.status);
      
      const res = await fetch(`${API_BASE}/leads?${params}`);
      if (res.ok) {
        const data = await res.json();
        let filtered = data;
        
        if (filters.search) {
          const search = filters.search.toLowerCase();
          filtered = data.filter(lead => 
            lead.BusinessName?.toLowerCase().includes(search) ||
            lead.Website?.toLowerCase().includes(search) ||
            lead.Phone?.includes(search)
          );
        }
        
        setLeads(filtered);
        setTotalLeads(data.length);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  }, [page, filters.city, filters.status, filters.search]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  async function updateLeadStatus(leadId, status) {
    try {
      await fetch(`${API_BASE}/leads/${leadId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      fetchLeads();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  function handleFilterChange(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  }

  function clearFilters() {
    setFilters({ city: "All", status: "", search: "" });
    setPage(0);
  }

  const hasActiveFilters = filters.city !== "All" || filters.status || filters.search;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Leads</h1>
          <p className="text-slate-400 mt-1">{totalLeads} leads in database</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/add"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all"
          >
            <Plus size={18} />
            Add Lead
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, website, or phone..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <SlidersHorizontal size={18} />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-white rounded-full"></span>
            )}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-3 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
        
        {showFilters && (
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-700/50">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">City</label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                {["", ...STATUSES].map(status => (
                  <button
                    key={status}
                    onClick={() => handleFilterChange("status", status)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      filters.status === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {status || "All"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leads Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw size={24} className="animate-spin text-blue-400 mr-3" />
          <span className="text-slate-400">Loading leads...</span>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/50">
          <Search size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No leads found</h3>
          <p className="text-slate-400 mb-6">
            {hasActiveFilters ? "Try adjusting your filters" : "Add some leads to get started"}
          </p>
          <Link
            to="/add"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium"
          >
            <Plus size={18} />
            Add Leads
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {leads.map((lead) => (
            <LeadCard key={lead.LeadID} lead={lead} onStatusChange={updateLeadStatus} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {leads.length > 0 && (
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-all"
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Page</span>
            <span className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg font-bold">{page + 1}</span>
            <span className="text-slate-400">of {Math.max(1, Math.ceil(totalLeads / pageSize))}</span>
          </div>
          
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={leads.length < pageSize}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-all"
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
