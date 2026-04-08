import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, Globe, Phone, Mail, MapPin, Star,
  ExternalLink, MessageSquare, Calendar, DollarSign,
  CheckCircle, XCircle
} from "lucide-react";

const API_BASE = "http://localhost:3001/api";

function SectionCard({ title, children }) {
  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value, icon: Icon, href }) {
  if (!value) return null;
  
  const content = (
    <div className="flex items-center gap-3">
      {Icon && <Icon size={16} className="text-slate-400" />}
      <span className="text-white">{value}</span>
    </div>
  );
  
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0">
      <span className="text-slate-400">{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
          {content}
          <ExternalLink size={14} />
        </a>
      ) : content}
    </div>
  );
}

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeadData();
  }, [id]);

  async function fetchLeadData() {
    try {
      const [leadRes, activitiesRes] = await Promise.all([
        fetch(`${API_BASE}/leads/${id}`),
        fetch(`${API_BASE}/activities?leadId=${id}`)
      ]);
      
      if (leadRes.ok) {
        const leadData = await leadRes.json();
        setLead(leadData);
      } else {
        navigate("/leads");
      }
      
      if (activitiesRes.ok) {
        setActivities(await activitiesRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch lead:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(newStatus) {
    try {
      const res = await fetch(`${API_BASE}/leads/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setLead(prev => ({ ...prev, Status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  async function closeDeal() {
    try {
      const res = await fetch(`${API_BASE}/revenue/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: parseInt(id) })
      });
      
      if (res.ok) {
        setLead(prev => ({ ...prev, Status: "CLOSED" }));
      }
    } catch (err) {
      console.error("Failed to close deal:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading lead details...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="card text-center">
        <p className="text-red-400">Lead not found</p>
        <Link to="/leads" className="text-blue-400 hover:underline mt-2 inline-block">Back to Leads</Link>
      </div>
    );
  }

  const statusFlow = ["PRIORITY", "CONTACTED", "RESPONDED", "INTERESTED", "CLOSED"];
  const currentStage = statusFlow.indexOf(lead.Status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/leads")} className="btn-secondary">
          <ArrowLeft size={18} className="inline mr-2" />
          Back
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{lead.BusinessName}</h1>
          <p className="text-slate-400">{lead.City}{lead.State ? `, ${lead.State}` : ""}</p>
        </div>
        <div className="text-right">
          <span className={`text-3xl font-bold ${
            lead.LeadScore >= 70 ? 'text-yellow-400' :
            lead.LeadScore >= 40 ? 'text-blue-400' : 'text-slate-400'
          }`}>
            {lead.LeadScore || 0}
          </span>
          <p className="text-xs text-slate-400">Lead Score</p>
        </div>
      </div>

      {/* Status Pipeline */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Pipeline Progress</h2>
        <div className="flex items-center justify-between">
          {statusFlow.map((status, index) => (
            <div key={status} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                index <= currentStage 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {index < currentStage ? (
                  <CheckCircle size={16} />
                ) : index === currentStage ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-500" />
                )}
                <span className="text-sm font-medium">{status}</span>
              </div>
              {index < statusFlow.length - 1 && (
                <div className={`w-8 h-0.5 ${
                  index < currentStage ? 'bg-blue-600' : 'bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-3 mt-6">
          {lead.Status === "PRIORITY" && (
            <button onClick={() => updateStatus("CONTACTED")} className="btn-primary">
              Mark Contacted
            </button>
          )}
          {lead.Status === "CONTACTED" && (
            <button onClick={() => updateStatus("RESPONDED")} className="btn-primary">
              Mark Responded
            </button>
          )}
          {lead.Status === "RESPONDED" && (
            <button onClick={() => updateStatus("INTERESTED")} className="btn-primary">
              Mark Interested
            </button>
          )}
          {["PRIORITY", "CONTACTED", "RESPONDED", "INTERESTED"].includes(lead.Status) && (
            <button onClick={() => updateStatus("LOST")} className="btn-danger">
              <XCircle size={18} className="inline mr-2" />
              Lost
            </button>
          )}
          {lead.Status === "INTERESTED" && (
            <button onClick={closeDeal} className="btn-success">
              <DollarSign size={18} className="inline mr-2" />
              Close Deal ($300)
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Info */}
        <SectionCard title="Business Information">
          <InfoRow label="Website" value={lead.Website} icon={Globe} href={lead.Website} />
          <InfoRow label="Phone" value={lead.Phone} icon={Phone} href={`tel:${lead.Phone}`} />
          <InfoRow label="Email" value={lead.Email} icon={Mail} href={`mailto:${lead.Email}`} />
          <InfoRow label="Address" value={lead.Address} icon={MapPin} />
          {lead.GoogleRating && (
            <InfoRow 
              label="Google Rating" 
              value={`${lead.GoogleRating} / 5`} 
              icon={Star} 
            />
          )}
        </SectionCard>

        {/* Scoring Breakdown */}
        <SectionCard title="Score Breakdown">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">No Click-to-Call</span>
              <span className={`font-medium ${lead.HasClickToCall ? 'text-red-400' : 'text-green-400'}`}>
                {lead.HasClickToCall ? '+0' : '+30'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">No Sticky CTA</span>
              <span className={`font-medium ${lead.HasStickyCTA ? 'text-red-400' : 'text-green-400'}`}>
                {lead.HasStickyCTA ? '+0' : '+25'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Weak Headline</span>
              <span className={`font-medium ${lead.HasWeakHeadline ? 'text-red-400' : 'text-green-400'}`}>
                {lead.HasWeakHeadline ? '+0' : '+20'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Poor Mobile</span>
              <span className={`font-medium ${lead.HasPoorMobile ? 'text-red-400' : 'text-green-400'}`}>
                {lead.HasPoorMobile ? '+0' : '+10'}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-700 pt-3">
              <span className="text-white font-medium">Total Score</span>
              <span className="text-xl font-bold text-yellow-400">{lead.LeadScore || 0}</span>
            </div>
          </div>
        </SectionCard>

        {/* Demo Site */}
        <SectionCard title="Demo Site">
          {lead.DemoSitePath ? (
            <div className="space-y-3">
              <p className="text-slate-300">Demo site generated for this lead.</p>
              <a 
                href={lead.DemoSiteURL || lead.DemoSitePath} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                <ExternalLink size={16} />
                View Demo Site
              </a>
            </div>
          ) : (
            <p className="text-slate-400">No demo site generated yet. Run Phase 4 to create one.</p>
          )}
        </SectionCard>

        {/* Activity Timeline */}
        <SectionCard title="Activity Timeline">
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.ActivityID} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{activity.ActivityType}</span>
                      <span className={`badge text-xs ${
                        activity.Status === 'SENT' ? 'bg-blue-500/20 text-blue-400' :
                        activity.Status === 'OPENED' ? 'bg-green-500/20 text-green-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {activity.Status}
                      </span>
                    </div>
                    {activity.Subject && (
                      <p className="text-sm text-slate-300 mt-1">{activity.Subject}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(activity.CreatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No activities recorded yet.</p>
          )}
        </SectionCard>
      </div>

      {/* Notes */}
      {lead.Notes && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Notes</h2>
          <p className="text-slate-300 whitespace-pre-wrap">{lead.Notes}</p>
        </div>
      )}
    </div>
  );
}
