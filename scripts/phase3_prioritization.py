#!/usr/bin/env python3`n`nimport os, sys; os.environ["PYTHONIOENCODING"] = "utf-8"; sys.stdout.reconfigure(encoding="utf-8", errors="replace") if sys.stdout.encoding != "utf-8" else None
"""
Phase 3: Prioritization Engine
Selects TOP 10 leads per city based on LeadScore.
"""

import os
import sys
import json
from pathlib import Path

os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import TARGET_CITIES, PATHS, LIMITS


def prioritize_leads():
    """
    For each city:
    1. Load scored leads
    2. Sort by LeadScore DESC
    3. Select TOP 10 -> Status = 'PRIORITY'
    4. Rest -> Status = 'BACKLOG'
    """
    print("[*] Phase 3: Lead Prioritization")
    print("=" * 60)

    input_dir = Path(__file__).parent.parent / PATHS["OUTPUT"]
    max_per_city = LIMITS["MAX_TOP_LEADS_PER_CITY"]

    results = {}

    for city_name in TARGET_CITIES.keys():
        city_safe = city_name.replace(" ", "_")
        input_path = input_dir / f"leads_{city_safe}_scored.json"

        if not input_path.exists():
            print(f"\n[!] No scored leads for {city_name}")
            continue

        with open(input_path, "r", encoding="utf-8") as f:
            leads = json.load(f)

        sorted_leads = sorted(leads, key=lambda x: x.get("lead_score", 0), reverse=True)

        priority_leads = []
        backlog_leads = []

        for i, lead in enumerate(sorted_leads):
            if i < max_per_city:
                lead["status"] = "PRIORITY"
                priority_leads.append(lead)
            else:
                lead["status"] = "BACKLOG"
                backlog_leads.append(lead)

        output_path = input_path.parent / f"leads_{city_safe}_prioritized.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(
                {"priority": priority_leads, "backlog": backlog_leads},
                f,
                indent=2,
                ensure_ascii=False,
            )

        results[city_name] = {
            "total": len(leads),
            "priority": len(priority_leads),
            "backlog": len(backlog_leads),
            "min_priority_score": priority_leads[-1]["lead_score"]
            if priority_leads
            else 0,
        }

        print(f"\n[OK] {city_name}:")
        print(
            f"   Priority: {len(priority_leads)} leads (score >= {results[city_name]['min_priority_score']})"
        )
        print(f"   Backlog: {len(backlog_leads)} leads")

    print(f"\n{'=' * 60}")
    print("[OK] PRIORITIZATION COMPLETE")
    print("=" * 60)

    return results


if __name__ == "__main__":
    prioritize_leads()
