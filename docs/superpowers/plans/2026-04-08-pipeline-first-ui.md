# Pipeline-First UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat top nav with a pipeline-first left sidebar, add contextual action buttons to lead rows, add a command-center Dashboard, and update branding to PipeFlowOps.

**Architecture:** New `Sidebar` and `FunnelBar` components extracted into `client/src/components/`. `App.jsx` adopts a flex layout (sidebar + main). `Leads.jsx` reads `?status` from the URL on mount and gains contextual action buttons. `Dashboard.jsx` gains a Next Actions panel above the metrics grid.

**Tech Stack:** React 18, React Router v6, Tailwind CSS, lucide-react

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `client/public/logo.png` | PipeFlowOps logo (copied from `e:/playground/PipeFlowOps.png`) |
| Create | `client/src/components/Sidebar.jsx` | Left sidebar with pipeline nav + live count badges |
| Create | `client/src/components/FunnelBar.jsx` | Horizontal funnel bar shared by Leads + Dashboard |
| Modify | `client/src/App.jsx` | Remove top nav, add sidebar, update layout to flex row |
| Modify | `client/index.html` | Update `<title>` to PipeFlowOps |
| Modify | `client/src/pages/Leads.jsx` | Read `?status` from URL, add contextual action buttons, add FunnelBar |
| Modify | `client/src/pages/Dashboard.jsx` | Add Next Actions panel, replace pipeline grid with FunnelBar |

---

### Task 1: Copy logo + update page title

**Files:**
- Create: `client/public/logo.png`
- Modify: `client/index.html`

- [ ] **Step 1: Copy the logo**

```bash
cp "e:/playground/PipeFlowOps.png" "e:/playground/Plumber/client/public/logo.png"
```

- [ ] **Step 2: Verify the file exists**

```bash
ls e:/playground/Plumber/client/public/logo.png
```

Expected: file listed.

- [ ] **Step 3: Update the page title**

In `client/index.html`, change:
```html
<title>Vite + React</title>
```
to:
```html
<title>PipeFlowOps</title>
```

- [ ] **Step 4: Commit**

```bash
git -C e:/playground/Plumber add client/public/logo.png client/index.html
git -C e:/playground/Plumber commit -m "feat: add PipeFlowOps logo and update page title"
```

---

### Task 2: Create FunnelBar component

**Files:**
- Create: `client/src/components/FunnelBar.jsx`

- [ ] **Step 1: Create the components directory**

```bash
mkdir -p e:/playground/Plumber/client/src/components
```

- [ ] **Step 2: Create FunnelBar.jsx**

Create `client/src/components/FunnelBar.jsx`:

```jsx
import { Link } from 'react-router-dom';

const STAGES = [
  { key: 'total_leads',      label: 'All Leads',  color: 'text-white',      href: '/leads' },
  { key: 'priority_leads',   label: 'Priority',   color: 'text-yellow-400', href: '/leads?status=PRIORITY' },
  { key: 'contacted_leads',  label: 'Contacted',  color: 'text-blue-400',   href: '/leads?status=CONTACTED' },
  { key: 'responded_leads',  label: 'Responded',  color: 'text-cyan-400',   href: '/leads?status=RESPONDED' },
  { key: 'interested_leads', label: 'Interested', color: 'text-purple-400', href: '/leads?status=INTERESTED' },
  { key: 'closed_leads',     label: 'Closed',     color: 'text-green-400',  href: '/leads?status=CLOSED' },
];

export default function FunnelBar({ metrics = {} }) {
  const closedRevenue = (metrics.closed_leads || 0) * 300;

  return (
    <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-4 flex items-center">
      {STAGES.map((stage, i) => (
        <div key={stage.key} className="flex items-center flex-1">
          <div className="flex-1 text-center">
            <p className="text-xs text-slate-500 mb-1">{stage.label}</p>
            <Link
              to={stage.href}
              className={`text-xl font-bold hover:opacity-75 transition-opacity ${stage.color}`}
            >
              {metrics[stage.key] ?? 0}
            </Link>
          </div>
          {i < STAGES.length - 1 && (
            <span className="text-slate-600 text-lg">›</span>
          )}
        </div>
      ))}
      <div className="flex-1 text-center border-l border-slate-700/50 ml-2 pl-2">
        <p className="text-xs text-slate-500 mb-1">Revenue</p>
        <p className="text-xl font-bold text-green-400">${closedRevenue.toLocaleString()}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git -C e:/playground/Plumber add client/src/components/FunnelBar.jsx
git -C e:/playground/Plumber commit -m "feat: add FunnelBar shared component"
```

---

### Task 3: Create Sidebar component

**Files:**
- Create: `client/src/components/Sidebar.jsx`

- [ ] **Step 1: Create Sidebar.jsx**

Create `client/src/components/Sidebar.jsx`:

```jsx
import { NavLink, useLocation } from 'react-router-dom';
import {
  Search, List, Star, Mail, MessageSquare,
  Handshake, CheckCircle, Send, DollarSign, LayoutDashboard, RefreshCw
} from 'lucide-react';
import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:3001/api';

const PIPELINE_LINKS = [
  { to: '/add-leads', label: 'Discover', icon: Search, countKey: null },
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
```

- [ ] **Step 2: Commit**

```bash
git -C e:/playground/Plumber add client/src/components/Sidebar.jsx
git -C e:/playground/Plumber commit -m "feat: add Sidebar component with pipeline nav and live counts"
```

---

### Task 4: Update App.jsx — remove top nav, add sidebar

**Files:**
- Modify: `client/src/App.jsx`

- [ ] **Step 1: Replace App.jsx**

Replace the entire contents of `client/src/App.jsx` with:

```jsx
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
      <div className="min-h-screen bg-slate-900 flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/:id" element={<LeadDetail />} />
            <Route path="/add-leads" element={<AddLeads />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/outreach" element={<Outreach />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 2: Verify the app loads in the browser**

With the dev server running (`cd client && npm run dev`), open http://localhost:3000 and confirm:
- Sidebar is visible on the left
- Logo appears in the sidebar header
- Navigation links work
- Main content renders on the right

- [ ] **Step 3: Commit**

```bash
git -C e:/playground/Plumber add client/src/App.jsx
git -C e:/playground/Plumber commit -m "feat: replace top nav with pipeline sidebar"
```

---

### Task 5: Update Leads.jsx — URL status filter + contextual action buttons + FunnelBar

**Files:**
- Modify: `client/src/pages/Leads.jsx`

- [ ] **Step 1: Add URL-based status initialization**

At the top of the `Leads` component, add `useLocation` and initialize filters from the URL:

Replace the existing imports line:
```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ChevronLeft, ChevronRight, ExternalLink, Mail, Phone } from "lucide-react";
```
with:
```jsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Filter, ChevronLeft, ChevronRight, ExternalLink, Mail, Phone } from "lucide-react";
import FunnelBar from "../components/FunnelBar";
```

- [ ] **Step 2: Read status from URL and add metrics state**

Replace:
```jsx
export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({ city: "All", status: "All", search: "" });
  const pageSize = 20;
```
with:
```jsx
export default function Leads() {
  const location = useLocation();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [metrics, setMetrics] = useState({});

  const initialStatus = new URLSearchParams(location.search).get("status") || "All";
  const [filters, setFilters] = useState({ city: "All", status: initialStatus, search: "" });
  const pageSize = 20;
```

- [ ] **Step 3: Fetch metrics for FunnelBar**

Inside the `fetchLeads` function, after the existing try/catch, add a `fetchMetrics` function and call it in `useEffect`:

After the closing brace of `fetchLeads`, add:
```jsx
  async function fetchMetrics() {
    try {
      const res = await fetch(`${API_BASE}/dashboard/metrics`);
      if (res.ok) setMetrics(await res.json());
    } catch {}
  }
```

And update the existing `useEffect` from:
```jsx
  useEffect(() => {
    fetchLeads();
  }, [page, filters.city, filters.status]);
```
to:
```jsx
  useEffect(() => {
    fetchLeads();
  }, [page, filters.city, filters.status]);

  useEffect(() => {
    fetchMetrics();
  }, []);
```

- [ ] **Step 4: Add inline status update handler**

After the `handleFilterChange` function, add:
```jsx
  async function updateLeadStatus(leadId, status) {
    try {
      await fetch(`${API_BASE}/leads/${leadId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      fetchLeads();
      fetchMetrics();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }
```

- [ ] **Step 5: Add FunnelBar above the leads table**

In the JSX, after the filters card and before the leads table card, add:
```jsx
      <FunnelBar metrics={metrics} />
```

- [ ] **Step 6: Add contextual action buttons to lead rows**

Replace the actions `<td>` in the table (currently just the View button):
```jsx
                    <td className="p-3 text-center">
                      <Link 
                        to={`/leads/${lead.LeadID}`}
                        className="btn-primary text-sm py-1 px-3"
                      >
                        View
                      </Link>
                    </td>
```
with:
```jsx
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {lead.Status === "PRIORITY" && (
                          <Link
                            to="/outreach"
                            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap"
                          >
                            Send Outreach →
                          </Link>
                        )}
                        {(lead.Status === "CONTACTED" || lead.Status === "RESPONDED") && (
                          <button
                            onClick={() => updateLeadStatus(lead.LeadID, "INTERESTED")}
                            className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap"
                          >
                            Mark Interested →
                          </button>
                        )}
                        {lead.Status === "INTERESTED" && (
                          <button
                            onClick={() => updateLeadStatus(lead.LeadID, "CLOSED")}
                            className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap"
                          >
                            Close Deal →
                          </button>
                        )}
                        <Link
                          to={`/leads/${lead.LeadID}`}
                          className="btn-primary text-sm py-1 px-3"
                        >
                          View
                        </Link>
                      </div>
                    </td>
```

- [ ] **Step 7: Dim closed rows**

In the `<tr>` element for each lead, add conditional dimming:
```jsx
                  <tr key={lead.LeadID} className={`border-b border-slate-700/50 hover:bg-slate-700/30 ${lead.Status === "CLOSED" ? "opacity-60" : ""}`}>
```

- [ ] **Step 8: Verify in browser**

- Navigate to http://localhost:3000/leads — FunnelBar should appear
- Click "Priority" in the funnel bar — page should reload filtered to PRIORITY leads
- Navigate to http://localhost:3000/leads?status=PRIORITY — page should load pre-filtered
- Click sidebar "Priority" stage — should navigate and filter correctly
- PRIORITY lead rows should show "Send Outreach →"
- CONTACTED rows show "Mark Interested →"
- INTERESTED rows show "Close Deal →"
- CLOSED rows are dimmed

- [ ] **Step 9: Commit**

```bash
git -C e:/playground/Plumber add client/src/pages/Leads.jsx
git -C e:/playground/Plumber commit -m "feat: add URL status filter, contextual action buttons, and FunnelBar to Leads page"
```

---

### Task 6: Update Dashboard.jsx — Next Actions panel + FunnelBar

**Files:**
- Modify: `client/src/pages/Dashboard.jsx`

- [ ] **Step 1: Add FunnelBar import**

Replace the existing imports:
```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Users, Target, DollarSign, TrendingUp, 
  Phone, Mail, AlertCircle, CheckCircle 
} from "lucide-react";
```
with:
```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Users, Target, DollarSign, TrendingUp, 
  Phone, Mail, AlertCircle, CheckCircle, Star, Handshake, MessageSquare, PlusCircle
} from "lucide-react";
import FunnelBar from "../components/FunnelBar";
```

- [ ] **Step 2: Add Next Actions panel component**

After the `StatusBadge` component (before `export default function Dashboard`), add:

```jsx
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
```

- [ ] **Step 3: Add Next Actions + FunnelBar to Dashboard JSX**

In the Dashboard return JSX, after the `<div className="flex items-center justify-between">` header block and before the metrics grid, add:

```jsx
      <NextActions metrics={metrics} />

      <FunnelBar metrics={metrics} />
```

- [ ] **Step 4: Remove the old pipeline grid**

Remove this entire block from the Dashboard JSX (the Sales Pipeline card with `grid grid-cols-5`):

```jsx
      {/* Pipeline Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Sales Pipeline</h2>
          <span className="text-xs text-slate-500">{metrics.total_leads || 0} total leads</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: 'Priority', value: metrics.priority_leads || 0, color: 'text-yellow-400', bg: 'bg-yellow-400' },
            { label: 'Contacted', value: metrics.contacted_leads || 0, color: 'text-blue-400', bg: 'bg-blue-400' },
            { label: 'Responded', value: metrics.responded_leads || 0, color: 'text-cyan-400', bg: 'bg-cyan-400' },
            { label: 'Interested', value: metrics.interested_leads || 0, color: 'text-purple-400', bg: 'bg-purple-400' },
            { label: 'Closed', value: metrics.closed_leads || 0, color: 'text-green-400', bg: 'bg-green-400' },
          ].map((stage, i) => {
            const total = metrics.total_leads || 1;
            const pct = Math.round((stage.value / total) * 100);
            return (
              <div key={stage.label} className="text-center">
                <p className={`text-2xl font-bold ${stage.color}`}>{stage.value}</p>
                <p className="text-xs text-slate-400 mt-0.5 mb-2">{stage.label}</p>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.bg} rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>
```

- [ ] **Step 5: Verify in browser**

- Open http://localhost:3000
- Next Actions panel appears at the top with colored action rows
- FunnelBar replaces the old pipeline grid
- Clicking a Next Actions item navigates to the correct filtered leads page
- Metrics grid, city breakdown, revenue projection all still display correctly

- [ ] **Step 6: Commit**

```bash
git -C e:/playground/Plumber add client/src/pages/Dashboard.jsx
git -C e:/playground/Plumber commit -m "feat: add Next Actions panel and FunnelBar to Dashboard"
```

---

### Task 7: Final verification

- [ ] **Step 1: Full flow test**

Walk through the complete workflow:

1. Open http://localhost:3000 — Dashboard shows Next Actions + FunnelBar + metrics
2. Click "X leads ready for outreach" in Next Actions → lands on `/leads?status=PRIORITY` pre-filtered
3. Click sidebar "Priority" → same result
4. On a PRIORITY lead row, click "Send Outreach →" → navigates to `/outreach`
5. Navigate to `/leads?status=CONTACTED` → "Mark Interested →" button visible on CONTACTED rows
6. Click "Mark Interested →" on a lead → status updates inline, row updates
7. Navigate to `/leads?status=INTERESTED` → "Close Deal →" button visible
8. Click "Close Deal →" → status updates inline, row dims
9. Sidebar counts refresh after clicking "↻ Refresh counts"
10. Logo displays correctly in sidebar header

- [ ] **Step 2: Clean up mockup files**

```bash
rm e:/playground/Plumber/mockup.html
rm e:/playground/Plumber/mockup-preview.png
```

- [ ] **Step 3: Final commit**

```bash
git -C e:/playground/Plumber add -A
git -C e:/playground/Plumber commit -m "chore: remove mockup files"
```
