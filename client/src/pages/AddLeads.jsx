import { useState } from "react";
import { Search, Plus, Globe, Phone, Mail, Building, MapPin, Loader2, Check, X, Sparkles, Edit3, Link as LinkIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:3001/api";

const PRESET_CITIES = [
  { name: "Tucson", state: "AZ" },
  { name: "Phoenix", state: "AZ" },
  { name: "Dallas", state: "TX" },
  { name: "Tampa", state: "FL" },
  { name: "Las Vegas", state: "NV" },
  { name: "Houston", state: "TX" },
];

function Toast({ message, type, onClose }) {
  if (!message) return null;
  
  return (
    <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl z-50 animate-slide-up ${
      type === "success" 
        ? "bg-green-500/90 text-white" 
        : "bg-red-500/90 text-white"
    }`}>
      {type === "success" ? <Check size={20} /> : <X size={20} />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X size={16} />
      </button>
    </div>
  );
}

export default function AddLeads() {
  const [mode, setMode] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState(PRESET_CITIES[0]);
  const [customCity, setCustomCity] = useState("");
  const [customState, setCustomState] = useState("");
  const [useCustomCity, setUseCustomCity] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedUrls, setSavedUrls] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    businessName: "",
    website: "",
    phone: "",
    email: "",
    city: selectedCity.name,
    state: selectedCity.state,
    services: "",
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const getCity = () => {
    if (useCustomCity) return { name: customCity, state: customState };
    return selectedCity;
  };

  async function handleSearch(e) {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResults([]);
    const city = getCity();

    try {
      const res = await fetch(`${API_BASE}/discovery/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: searchQuery,
          city: city.name,
          state: city.state
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      } else {
        showToast("error", "Search failed");
      }
    } catch (err) {
      showToast("error", "Connection error");
    } finally {
      setSearching(false);
    }
  }

  async function saveLead(lead) {
    if (savedUrls.has(lead.url)) return;
    
    setSaving(true);
    const city = getCity();
    
    try {
      const res = await fetch(`${API_BASE}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: lead.name || lead.title,
          website: lead.url,
          phone: lead.phone || null,
          email: lead.email || null,
          city: lead.city || city.name,
          state: lead.state || city.state,
          services: lead.services || null,
          status: "DISCOVERED"
        })
      });

      if (res.ok) {
        setSavedUrls(prev => new Set([...prev, lead.url]));
        showToast("success", `Saved: ${lead.name}`);
      } else {
        showToast("error", "Failed to save lead");
      }
    } catch (err) {
      showToast("error", "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleManualSubmit(e) {
    e.preventDefault();
    
    if (!formData.businessName.trim()) {
      showToast("error", "Business name is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showToast("success", "Lead added successfully!");
        setFormData({
          businessName: "",
          website: "",
          phone: "",
          email: "",
          city: formData.city,
          state: formData.state,
          services: "",
        });
      } else {
        showToast("error", "Failed to add lead");
      }
    } catch (err) {
      showToast("error", "Failed to add lead");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Toast {...toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Add New Leads</h1>
        <p className="text-slate-400">Discover plumbing businesses or enter them manually</p>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-3 p-1.5 bg-slate-800/50 rounded-2xl max-w-md mx-auto">
        <button
          onClick={() => setMode("discover")}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium transition-all ${
            mode === "discover"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles size={18} />
          Discover
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium transition-all ${
            mode === "manual"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Edit3 size={18} />
          Manual
        </button>
      </div>

      {/* Discover Mode */}
      {mode === "discover" && (
        <div className="space-y-6">
          {/* Search Form */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Search Query</label>
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., plumbing companies, emergency plumber..."
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || !searchQuery.trim()}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  {searching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                  Search
                </button>
              </form>
            </div>

            {/* City Selection */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Location</label>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex gap-2">
                  {PRESET_CITIES.map(city => (
                    <button
                      key={city.name}
                      onClick={() => { setUseCustomCity(false); setSelectedCity(city); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        !useCustomCity && selectedCity.name === city.name
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                      }`}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUseCustomCity(!useCustomCity)}
                    className={`text-sm font-medium transition-all ${
                      useCustomCity ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {useCustomCity ? "Using custom location" : "+ Custom city"}
                  </button>
                </div>
              </div>
              
              {useCustomCity && (
                <div className="flex gap-3 mt-3">
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    placeholder="City name"
                    className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={customState}
                    onChange={(e) => setCustomState(e.target.value.toUpperCase())}
                    placeholder="ST"
                    maxLength={2}
                    className="w-20 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-center placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          {searching && (
            <div className="text-center py-16">
              <Loader2 size={48} className="mx-auto text-blue-400 mb-4 animate-spin" />
              <p className="text-slate-400 text-lg">Searching for plumbing businesses...</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Found {searchResults.length} results in {getCity().name}
                </h2>
                <button
                  onClick={() => setSearchResults([])}
                  className="text-sm text-slate-400 hover:text-white"
                >
                  Clear results
                </button>
              </div>
              <div className="grid gap-3">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4 hover:border-slate-600 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                      <Globe size={20} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{result.name}</h3>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:underline flex items-center gap-1 truncate"
                      >
                        {result.url}
                        <LinkIcon size={12} />
                      </a>
                    </div>
                    <button
                      onClick={() => saveLead(result)}
                      disabled={saving || savedUrls.has(result.url)}
                      className={`px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 flex-shrink-0 transition-all ${
                        savedUrls.has(result.url)
                          ? "bg-green-500/20 text-green-400"
                          : "bg-blue-600 hover:bg-blue-500 text-white"
                      }`}
                    >
                      {savedUrls.has(result.url) ? (
                        <>
                          <Check size={18} />
                          Saved
                        </>
                      ) : (
                        <>
                          <Plus size={18} />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!searching && searchResults.length === 0 && (
            <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <Search size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg mb-2">Enter a search query to discover leads</p>
              <p className="text-slate-500 text-sm">Try "plumbing companies" or "emergency plumber" with your selected city</p>
            </div>
          )}
        </div>
      )}

      {/* Manual Mode */}
      {mode === "manual" && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Enter Lead Details</h2>
          <form onSubmit={handleManualSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="text-sm text-slate-400 mb-2 block">
                  <Building size={14} className="inline mr-2" />
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  placeholder="ABC Plumbing Services"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-slate-400 mb-2 block">
                  <Globe size={14} className="inline mr-2" />
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">
                  <Phone size={14} className="inline mr-2" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">
                  <Mail size={14} className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@example.com"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">
                  <MapPin size={14} className="inline mr-2" />
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Houston"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                  placeholder="TX"
                  maxLength={2}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white text-center placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-slate-400 mb-2 block">Services</label>
                <input
                  type="text"
                  value={formData.services}
                  onChange={(e) => setFormData(prev => ({ ...prev, services: e.target.value }))}
                  placeholder="Plumbing, Drain Cleaning, Water Heater..."
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Add Lead
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Footer CTA */}
      <div className="text-center pt-6">
        <Link
          to="/leads"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
        >
          View all leads
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
