import { useEffect, useState } from "react";
import { Mail, MessageSquare, Download, Copy, Check, ExternalLink, Send, AlertCircle } from "lucide-react";

const API_BASE = "http://localhost:3001/api";

function StatusBadge({ status }) {
  const config = {
    PENDING: "bg-slate-500/20 text-slate-400",
    READY_TO_SEND: "bg-yellow-500/20 text-yellow-400",
    SENT: "bg-green-500/20 text-green-400",
    FAILED: "bg-red-500/20 text-red-400"
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[status] || config.PENDING}`}>
      {status}
    </span>
  );
}

export default function Outreach() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState("MANUAL");
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      const res = await fetch(`${API_BASE}/leads?limit=50`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  }

  function generateEmailContent(lead) {
    const firstName = lead.BusinessName?.split(" ")[0] || "there";
    return {
      subject: "Quick fix for your website - more emergency calls",
      body: `Hi ${firstName},

I noticed your site at ${lead.Website} could be losing emergency plumbing calls.

I rebuilt your homepage to show exactly what I mean:
[YOUR_DEMO_LINK]

Here's what I fixed:
- Added a sticky "Call Now" button
- Made your phone number prominent on every page
- Created a sense of urgency for emergency services

Would you like me to walk you through the changes? It's completely free to look at.

Best regards,
Alex

---
To unsubscribe, reply STOP`
    };
  }

  function generateSMSContent(lead) {
    return `[YOUR_DEMO_LINK] - Quick fix for your website - this could bring more emergency calls. Reply STOP to opt out.`;
  }

  async function copyToClipboard(text) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function sendEmail(lead) {
    const email = generateEmailContent(lead);
    setSending(true);
    setSendResult(null);
    
    try {
      const res = await fetch(`${API_BASE}/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: lead.Email || "contact@example.com",
          subject: email.subject,
          body: email.body,
          leadId: lead.LeadID
        })
      });
      
      const data = await res.json();
      setSendResult(data);
      
      if (data.success) {
        await fetch(`${API_BASE}/leads/${lead.LeadID}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CONTACTED" })
        });
        fetchLeads();
      }
    } catch (err) {
      setSendResult({ success: false, error: err.message });
    } finally {
      setSending(false);
    }
  }

  function downloadCSV() {
    const headers = ["Business Name", "Website", "Phone", "Email Subject", "Email Body", "SMS Message"];
    const rows = leads.map(lead => {
      const email = generateEmailContent(lead);
      const sms = generateSMSContent(lead);
      return [
        lead.BusinessName,
        lead.Website,
        lead.Phone || "",
        email.subject,
        email.body.replace(/\n/g, "\\n"),
        sms
      ];
    });
    
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(c => `"${(c || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "outreach_leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Outreach Manager</h1>
          <p className="text-slate-400 text-sm mt-1">
            {leads.length} leads ready for outreach
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => { setMode("MANUAL"); setAutoEnabled(false); }}
              className={`px-3 py-1 rounded text-sm ${mode === "MANUAL" ? "bg-blue-600 text-white" : "text-slate-400"}`}
            >
              Manual Mode
            </button>
            <button
              onClick={() => { setMode("AUTO"); setAutoEnabled(true); }}
              className={`px-3 py-1 rounded text-sm ${mode === "AUTO" ? "bg-green-600 text-white" : "text-slate-400"}`}
            >
              Auto Mode
            </button>
          </div>
          
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {mode === "MANUAL" && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-400 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium text-blue-400">Manual Mode Active</h3>
              <p className="text-sm text-slate-300 mt-1">
                Templates are generated and ready to copy. Click on any lead to see the full email and SMS templates.
                Copy the content and send manually through your email provider.
              </p>
            </div>
          </div>
        </div>
      )}

      {mode === "AUTO" && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Send className="text-green-400 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium text-green-400">Auto Mode Active (Gmail SMTP)</h3>
              <p className="text-sm text-slate-300 mt-1">
                Emails will be sent via Gmail SMTP. Make sure SMTP_USER and SMTP_PASS are configured in server/.env
              </p>
              {sendResult && (
                <div className={`mt-2 text-sm ${sendResult.success ? "text-green-400" : "text-red-400"}`}>
                  {sendResult.success ? "Email sent successfully!" : `Error: ${sendResult.error}`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h2 className="font-medium">Email Templates</h2>
            </div>
            <div className="divide-y divide-slate-700 max-h-[600px] overflow-y-auto">
              {leads.slice(0, 20).map((lead) => {
                const email = generateEmailContent(lead);
                return (
                  <div
                    key={lead.LeadID}
                    className={`p-4 hover:bg-slate-700/50 cursor-pointer ${selectedLead?.LeadID === lead.LeadID ? "bg-slate-700" : ""}`}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">{lead.BusinessName}</h3>
                        <p className="text-sm text-slate-400">{lead.City}</p>
                      </div>
                      <StatusBadge status={lead.Status === "CONTACTED" ? "SENT" : "READY_TO_SEND"} />
                    </div>
                    <p className="text-sm text-slate-300 mt-2 truncate">
                      Subject: {email.subject}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          {selectedLead ? (
            <div className="bg-slate-800 rounded-lg overflow-hidden sticky top-4">
              <div className="p-4 border-b border-slate-700">
                <h2 className="font-medium">{selectedLead.BusinessName}</h2>
                <p className="text-sm text-slate-400">{selectedLead.Website}</p>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-300">Email Subject</h3>
                    <button
                      onClick={() => copyToClipboard(generateEmailContent(selectedLead).subject)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="bg-slate-700 rounded p-2 text-sm">
                    {generateEmailContent(selectedLead).subject}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-300">Email Body</h3>
                    <button
                      onClick={() => copyToClipboard(generateEmailContent(selectedLead).body)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="bg-slate-700 rounded p-3 text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                    {generateEmailContent(selectedLead).body}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-300">SMS ({generateSMSContent(selectedLead).length}/160)</h3>
                    <button
                      onClick={() => copyToClipboard(generateSMSContent(selectedLead))}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="bg-slate-700 rounded p-3 text-sm">
                    {generateSMSContent(selectedLead)}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-700">
                  {mode === "MANUAL" ? (
                    <>
                      <h3 className="text-sm font-medium text-slate-300 mb-2">Manual Sending Instructions</h3>
                      <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                        <li>Copy the email subject and body</li>
                        <li>Open your email provider (Gmail, Outlook)</li>
                        <li>Compose new email to the lead</li>
                        <li>Replace [YOUR_DEMO_LINK] with actual demo URL</li>
                        <li>Send the email</li>
                        <li>Mark as contacted in the CRM</li>
                      </ol>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-medium text-slate-300 mb-2">Auto Send</h3>
                      <button
                        onClick={() => sendEmail(selectedLead)}
                        disabled={sending}
                        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                      >
                        <Send size={18} />
                        {sending ? "Sending..." : "Send Email Now"}
                      </button>
                      {selectedLead.Email && (
                        <p className="text-xs text-slate-500 mt-2">Sending to: {selectedLead.Email}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-lg p-8 text-center">
              <Mail className="mx-auto text-slate-500 mb-3" size={32} />
              <p className="text-slate-400">Select a lead to see templates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
