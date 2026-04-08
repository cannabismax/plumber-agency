# Plumbing Agency - Lead Generation System

Autonomous revenue-generating agency system for plumbing leads across multiple cities.

## Quick Start

```bash
# Install Node.js dependencies
cd server && npm install

# Install Python dependencies  
cd ../scripts && pip install httpx beautifulsoup4

# Run Phase 1-2 (Discovery + Scoring)
python scripts/phase1_discovery.py
python scripts/phase2_scoring.py
```

## Project Structure

```
E:\playground\Plumber\
├── config/
│   └── settings.py           # Global configuration
├── database/
│   └── schema.sql            # MS SQL database schema
├── server/                   # Node.js backend
│   ├── server.js
│   ├── package.json
│   └── routes/
├── client/                    # React frontend
│   ├── src/
│   └── package.json
├── scripts/                  # Python automation
│   ├── phase1_discovery.py   # Find leads via web search
│   ├── phase2_scoring.py    # Score leads
│   ├── phase3_prioritization.py
│   └── ... (phases 3-14)
├── demo_sites/               # Generated demo landing pages
├── outreach_assets/          # Before/after comparisons
├── dashboard/                # HTML dashboards
├── reports/                  # Client reports
└── output/                   # Lead data exports
```

## Phase Overview

| Phase | Name | Description |
|-------|------|-------------|
| 1 | Discovery | Web search for 50 leads/city |
| 2 | Scoring | Score 0-100 based on criteria |
| 3 | Prioritization | Top 10 per city = PRIORITY |
| 4 | Demo Sites | Generate HTML landing pages |
| 5 | Assets | Before/after visual comparisons |
| 6 | Outreach | Email/SMS templates |
| 7 | Pricing | Stripe payment links |
| 8 | CRM | Database pipeline management |
| 9 | AI Calls | Voice agent integration (placeholder) |
| 10 | Booking | Appointment scheduling (placeholder) |
| 11 | Reports | Client HTML reports |
| 12 | Dashboards | Global + city dashboards |
| 13 | Revenue | Revenue projections |
| 14 | Failsafe | Error handling |

## Target Cities

- Tucson, AZ 85730
- Phoenix, AZ
- Dallas, TX
- Tampa, FL
- Las Vegas, NV

## Limits

- Max 50 emails/day
- Max 30 SMS/day
- Max 15 emails/city
- Max 10 priority leads/city

## Running the Control Panel

```bash
# Start backend (requires MS SQL)
cd server
npm start

# Start frontend (new terminal)
cd client
npm run dev
```

Frontend: http://localhost:3000
API: http://localhost:3001

## Database Setup

Run `database/schema.sql` in MS SQL Server Management Studio to create:
- Leads table
- Activities table
- Calls table
- Appointments table
- Revenue table

## Phase Execution

```bash
# Run all phases
python scripts/run_all.py

# Run specific phase
python scripts/phase1_discovery.py
python scripts/phase2_scoring.py
# etc.
```

## Scoring Criteria

| Criteria | Points |
|----------|--------|
| No click-to-call | +30 |
| No sticky CTA | +25 |
| Weak headline | +20 |
| Rating 4.3-4.6 | +15 |
| Poor mobile | +10 |

## Revenue Tiers

- Entry: $99
- Standard: $299
- Full Rebuild: $799

## TODO

- [ ] Set up MS SQL Server
- [ ] Configure database credentials in `.env`
- [ ] Create Stripe account for payment links
- [ ] Run Phase 1 discovery
- [ ] Import leads to database
- [ ] Start outreach
