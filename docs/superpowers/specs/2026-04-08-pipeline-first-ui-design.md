# PipeFlowOps – Pipeline-First UI Redesign

**Date:** 2026-04-08  
**Scope:** Navigation overhaul + contextual actions + dashboard command center + branding

---

## Problem

The current UI is a set of isolated pages connected by a flat top nav bar. There is no sense of workflow — the app doesn't guide the user from discovering leads through to closing deals. Pages feel disconnected.

## Goal

Make the entire app feel like one cohesive pipeline journey: Discover → Priority → Contacted → Responded → Interested → Closed → Revenue.

---

## 1. Layout & Navigation

### Replace top nav with left sidebar

- Remove the current `<nav>` in `App.jsx` (top bar with horizontal NavLinks)
- Add a fixed left sidebar (~220px wide, `bg-[#0d1829]`, border-right)
- Main content area uses remaining width (`flex-1`)

### Sidebar structure (top to bottom)

**Brand header**
- Logo: `PipeFlowOps.png` (copy from `e:/playground/PipeFlowOps.png` to `client/public/logo.png`)
- Display as `<img src="/logo.png" />` at ~36px height
- Page `<title>` in `index.html` updated to "PipeFlowOps"

**Pipeline section** (label: "Pipeline")
- Discover → navigates to `/add-leads`
- All Leads → navigates to `/leads` (no filter), shows total count badge

**Stages section** (label: "Stages") — each navigates to `/leads?status=<STATUS>`
- Priority — yellow count badge
- Contacted — blue count badge
- Responded — cyan count badge
- Interested — purple count badge
- Closed — green count badge

**Tools section** (label: "Tools")
- Outreach → `/outreach`
- Revenue → `/revenue`
- Dashboard → `/`

**Footer**
- Small "↻ Refresh counts" button that re-fetches sidebar counts

### Active state

Active route gets `bg-blue-600/15 border border-blue-500/30 text-white`. All others are `text-slate-400 hover:bg-slate-700/50`.

### Sidebar counts

The sidebar fetches `/api/dashboard/metrics` on mount and on refresh click. It reads `priority_leads`, `contacted_leads`, `responded_leads`, `interested_leads`, `closed_leads`, `total_leads` to populate badges. No new API endpoint needed.

---

## 2. Leads Page — Contextual Action Buttons

The Leads page (`Leads.jsx`) gains a "next action" button per row based on `lead.Status`:

| Status | Button label | Button color | Action |
|--------|-------------|--------------|--------|
| PRIORITY | Send Outreach → | Blue | Navigate to `/outreach` (no pre-selection needed for now) |
| CONTACTED | Mark Interested → | Purple | PUT `/api/leads/:id/status` `{ status: "INTERESTED" }` then refresh |
| RESPONDED | Mark Interested → | Purple | Same as above |
| INTERESTED | Close Deal → | Green | PUT `/api/leads/:id/status` `{ status: "CLOSED" }` then refresh |
| CLOSED | (none) | — | Row dimmed with `opacity-60` |
| DISCOVERED / BACKLOG | (none) | — | No action button |

The existing "View" button stays. Action buttons sit to the left of "View".

### Funnel bar

Add the shared `FunnelBar` component at the top of the Leads page content (below filters):

```
All Leads (248) › Priority (42) › Contacted (18) › Responded (9) › Interested (5) › Closed (7) | Revenue $2,100
```

Each number is a clickable link that applies the corresponding status filter. Data comes from the same metrics fetch already used in Dashboard.

The funnel bar is extracted as a shared component `client/src/components/FunnelBar.jsx` and used in both Leads and Dashboard pages. It accepts a `metrics` prop.

---

## 3. Dashboard — Command Center

`Dashboard.jsx` gains a "Next Actions" panel rendered **above** the metrics grid.

### Next Actions panel

A card with a list of actionable items derived from existing `metrics` state:

- If `priority_leads > 0`: "⭐ {n} leads ready for outreach" → links to `/leads?status=PRIORITY`
- If `interested_leads > 0`: "🤝 {n} interested leads need follow-up" → links to `/leads?status=INTERESTED`
- If `responded_leads > 0`: "💬 {n} leads responded — follow up" → links to `/leads?status=RESPONDED`
- If all zero: "✅ All caught up! Add more leads to keep the pipeline moving." → links to `/add-leads`

Each item is a clickable row styled as an alert/action card.

### Funnel bar

Replace the current 5-column pipeline grid (`grid grid-cols-5`) with the shared `FunnelBar` component, passing the existing `metrics` state as a prop.

### Everything else unchanged

Metric cards, city breakdown, revenue projection — no changes.

---

## 4. Branding

- Copy `e:/playground/PipeFlowOps.png` → `e:/playground/Plumber/client/public/logo.png`
- Sidebar brand header uses `<img src="/logo.png" className="h-9 w-auto" />`
- `client/index.html` `<title>` → `PipeFlowOps`
- Remove "Plumbing CRM" text entirely (replaced by logo)

---

## 5. Routing

The Leads page must read `?status=` from the URL query string on mount and apply it as a filter. Currently filters are local state only.

Change in `Leads.jsx`:
- On mount, read `new URLSearchParams(window.location.search).get('status')`
- If present, initialize `filters.status` from it
- When sidebar or funnel bar links navigate to `/leads?status=PRIORITY`, the page loads pre-filtered

This is a read-only change to initialization — no change to the filter UI behavior.

---

## Out of Scope

- Mobile/responsive sidebar (hamburger menu)
- Lead pre-selection on Outreach page when clicking "Send Outreach →"
- Inline deal value prompt on "Close Deal →" (just sets status to CLOSED at $300 default)
- Any new backend endpoints

---

## Files Changed

| File | Change |
|------|--------|
| `client/src/App.jsx` | Remove top nav, add `Sidebar` component, update layout wrapper |
| `client/src/components/Sidebar.jsx` | New sidebar component with pipeline nav + count badges |
| `client/src/components/FunnelBar.jsx` | New shared funnel bar component |
| `client/src/pages/Dashboard.jsx` | Add Next Actions panel, replace pipeline grid with funnel bar |
| `client/src/pages/Leads.jsx` | Add funnel bar, add contextual action buttons, read `?status` from URL |
| `client/index.html` | Update `<title>` |
| `client/public/logo.png` | Copy logo file here |
