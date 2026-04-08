#!/usr/bin/env python3`n`nimport os, sys; os.environ["PYTHONIOENCODING"] = "utf-8"; sys.stdout.reconfigure(encoding="utf-8", errors="replace") if sys.stdout.encoding != "utf-8" else None
"""
Phase 8: CRM Pipeline Manager
Loads leads into database and tracks pipeline status.
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import TARGET_CITIES, PATHS, CRM_STATUSES


def load_into_crm():
    """
    1. Load all prioritized leads
    2. Insert into database (or generate SQL for manual insert)
    3. Track pipeline status transitions
    """
    print("🚀 Phase 8: CRM Pipeline Manager")
    print("=" * 60)

    input_dir = Path(__file__).parent.parent / PATHS["OUTPUT"]
    output_dir = Path(__file__).parent.parent / PATHS["OUTPUT"]
    output_dir.mkdir(parents=True, exist_ok=True)

    all_leads = []

    for city_name in TARGET_CITIES.keys():
        city_safe = city_name.replace(" ", "_")
        input_path = input_dir / f"leads_{city_safe}_prioritized.json"

        if not input_path.exists():
            continue

        with open(input_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        priority_leads = data.get("priority", [])
        backlog_leads = data.get("backlog", [])

        for lead in priority_leads + backlog_leads:
            lead["city"] = city_name
            lead["status"] = lead.get("status", "DISCOVERED")
            lead["audited_at"] = datetime.now().isoformat()
            all_leads.append(lead)

    crm_data = {
        "leads": all_leads,
        "statuses": CRM_STATUSES,
        "pipeline_stages": [
            {"stage": "DISCOVERED", "order": 1, "description": "Newly discovered lead"},
            {
                "stage": "AUDITED",
                "order": 2,
                "description": "Website analyzed and scored",
            },
            {
                "stage": "PRIORITY",
                "order": 3,
                "description": "High-potential, ready for outreach",
            },
            {"stage": "CONTACTED", "order": 4, "description": "Email/SMS sent"},
            {
                "stage": "RESPONDED",
                "order": 5,
                "description": "Lead responded to outreach",
            },
            {
                "stage": "INTERESTED",
                "order": 6,
                "description": "Lead interested in service",
            },
            {
                "stage": "CLOSED",
                "order": 7,
                "description": "Deal closed - payment received",
            },
            {
                "stage": "LOST",
                "order": 8,
                "description": "Lead not interested or unreachable",
            },
        ],
        "exported_at": datetime.now().isoformat(),
    }

    output_path = output_dir / "crm_leads.json"
    with open(output_path, "w") as f:
        json.dump(crm_data, f, indent=2)

    sql_statements = []
    for lead in all_leads:
        sql = f"""INSERT INTO Leads (BusinessName, Website, Phone, Email, City, State, Address, GoogleRating, Services, LeadScore, Status, HasClickToCall, HasStickyCTA, HasWeakHeadline, HasPoorMobile, DemoSitePath, DemoSiteURL, CreatedAt, AuditedAt)
VALUES ('{lead.get("business_name", "")}', '{lead.get("website", "")}', '{lead.get("phone", "")}', '{lead.get("email", "")}', '{lead.get("city", "")}', '{lead.get("state", "")}', '{lead.get("address", "")}', {lead.get("google_rating") or "NULL"}, '{lead.get("services", "")}', {lead.get("lead_score", 0)}, '{lead.get("status", "DISCOVERED")}', {1 if lead.get("has_click_to_call") else 0}, {1 if lead.get("has_sticky_cta") else 0}, {1 if lead.get("has_weak_headline") else 0}, {1 if lead.get("has_poor_mobile") else 0}, '{lead.get("demo_site_path", "")}', '{lead.get("demo_site_url", "")}', GETDATE(), GETDATE());"""
        sql_statements.append(sql)

    sql_path = output_dir / "crm_import.sql"
    with open(sql_path, "w") as f:
        f.write("\n\n".join(sql_statements))

    print(f"\n✅ CRM Data Exported:")
    print(f"   Leads: {len(all_leads)}")
    print(
        f"   Priority: {len([l for l in all_leads if l.get('status') == 'PRIORITY'])}"
    )
    print(f"   Backlog: {len([l for l in all_leads if l.get('status') == 'BACKLOG'])}")
    print(f"\n📁 Files:")
    print(f"   {output_path}")
    print(f"   {sql_path}")
    print("\n📝 Next: Run the SQL file in SSMS to import leads into database")
    print("=" * 60)

    return crm_data


if __name__ == "__main__":
    load_into_crm()
