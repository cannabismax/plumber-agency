#!/usr/bin/env python3`n`nimport os, sys; os.environ["PYTHONIOENCODING"] = "utf-8"; sys.stdout.reconfigure(encoding="utf-8", errors="replace") if sys.stdout.encoding != "utf-8" else None
"""
Phase 13: Revenue Tracking
Calculates and tracks revenue projections.
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import TARGET_CITIES, PATHS, REVENUE_TIERS


def track_revenue():
    """
    Calculates revenue projections based on lead pipeline.
    """
    print("🚀 Phase 13: Revenue Tracking")
    print("=" * 60)

    input_dir = Path(__file__).parent.parent / PATHS["OUTPUT"]
    output_dir = Path(__file__).parent.parent / PATHS["OUTPUT"]

    all_leads = []
    city_revenue = {}

    for city_name in TARGET_CITIES.keys():
        city_safe = city_name.replace(" ", "_")
        input_path = input_dir / f"leads_{city_safe}_prioritized.json"

        if not input_path.exists():
            city_revenue[city_name] = {
                "total": 0,
                "priority": 0,
                "closed": 0,
                "revenue": 0,
            }
            continue

        with open(input_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        all_city = data.get("priority", []) + data.get("backlog", [])
        all_leads.extend(all_city)

        closed = len([l for l in all_city if l.get("status") == "CLOSED"])
        priority = len([l for l in all_city if l.get("status") == "PRIORITY"])

        city_revenue[city_name] = {
            "total": len(all_city),
            "priority": priority,
            "contacted": len([l for l in all_city if l.get("status") == "CONTACTED"]),
            "interested": len([l for l in all_city if l.get("status") == "INTERESTED"]),
            "closed": closed,
            "revenue": closed * REVENUE_TIERS["MEDIUM"],
            "potential": priority * REVENUE_TIERS["HIGH"],
        }

    total_leads = len(all_leads)
    priority = len([l for l in all_leads if l.get("status") == "PRIORITY"])
    contacted = len([l for l in all_leads if l.get("status") == "CONTACTED"])
    interested = len([l for l in all_leads if l.get("status") == "INTERESTED"])
    closed = len([l for l in all_leads if l.get("status") == "CLOSED"])

    revenue = {
        "generated_at": datetime.now().isoformat(),
        "summary": {
            "total_leads": total_leads,
            "priority_leads": priority,
            "contacted_leads": contacted,
            "interested_leads": interested,
            "closed_leads": closed,
        },
        "revenue_tiers": REVENUE_TIERS,
        "projections": {
            "conservative": {
                "description": "Close 10% of priority at LOW tier",
                "revenue": int(priority * 0.1 * REVENUE_TIERS["LOW"]),
            },
            "expected": {
                "description": "Close 20% of priority at MEDIUM tier",
                "revenue": int(priority * 0.2 * REVENUE_TIERS["MEDIUM"]),
            },
            "optimistic": {
                "description": "Close 30% of priority at HIGH tier",
                "revenue": int(priority * 0.3 * REVENUE_TIERS["HIGH"]),
            },
        },
        "actual": {
            "closed_leads": closed,
            "closed_revenue": closed * REVENUE_TIERS["MEDIUM"],
        },
        "by_city": city_revenue,
    }

    output_path = output_dir / "revenue_tracking.json"
    with open(output_path, "w") as f:
        json.dump(revenue, f, indent=2)

    print("\n📊 Revenue Summary:")
    print(f"   Total Leads: {total_leads}")
    print(f"   Priority: {priority}")
    print(f"   Contacted: {contacted}")
    print(f"   Interested: {interested}")
    print(f"   Closed: {closed}")

    print("\n💰 Projections:")
    print(f"   Conservative: ${revenue['projections']['conservative']['revenue']:,}")
    print(f"   Expected: ${revenue['projections']['expected']['revenue']:,}")
    print(f"   Optimistic: ${revenue['projections']['optimistic']['revenue']:,}")

    print(f"\n✅ Revenue tracked: {output_path}")
    print("=" * 60)

    return revenue


if __name__ == "__main__":
    track_revenue()
