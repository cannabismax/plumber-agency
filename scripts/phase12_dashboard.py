#!/usr/bin/env python3`n`nimport os, sys; os.environ["PYTHONIOENCODING"] = "utf-8"; sys.stdout.reconfigure(encoding="utf-8", errors="replace") if sys.stdout.encoding != "utf-8" else None
"""
Phase 12: Dashboard Generator
Generates HTML dashboards for cities and global overview.
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import TARGET_CITIES, PATHS


GLOBAL_DASHBOARD = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plumbing Agency - Global Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, sans-serif; background: #0f172a; color: white; padding: 20px; }}
        .header {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }}
        h1 {{ color: #3b82f6; }}
        .date {{ color: #94a3b8; }}
        .metrics {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }}
        .metric {{ background: #1e293b; padding: 20px; border-radius: 12px; }}
        .metric h3 {{ color: #94a3b8; font-size: 0.9rem; margin-bottom: 8px; }}
        .metric .value {{ font-size: 2.5rem; font-weight: bold; }}
        .metric.green .value {{ color: #22c55e; }}
        .metric.blue .value {{ color: #3b82f6; }}
        .metric.yellow .value {{ color: #fbbf24; }}
        .metric.purple .value {{ color: #a855f7; }}
        .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }}
        .card {{ background: #1e293b; padding: 20px; border-radius: 12px; }}
        .card h2 {{ color: #3b82f6; margin-bottom: 15px; font-size: 1.1rem; }}
        .city-row {{ display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #334155; }}
        .city-row:last-child {{ border-bottom: none; }}
        .pipeline {{ display: flex; gap: 10px; margin-top: 15px; }}
        .pipeline-stage {{ flex: 1; text-align: center; padding: 10px; background: #334155; border-radius: 8px; }}
        .pipeline-stage span {{ display: block; font-size: 1.5rem; font-weight: bold; }}
        .pipeline-stage small {{ color: #94a3b8; font-size: 0.8rem; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Plumbing Agency - Global Dashboard</h1>
        <div class="date">{date}</div>
    </div>
    
    <div class="metrics">
        <div class="metric blue">
            <h3>Total Leads</h3>
            <div class="value">{total_leads}</div>
        </div>
        <div class="metric yellow">
            <h3>Priority Leads</h3>
            <div class="value">{priority_leads}</div>
        </div>
        <div class="metric green">
            <h3>Closed Revenue</h3>
            <div class="value">${closed_revenue}</div>
        </div>
        <div class="metric purple">
            <h3>Projected Revenue</h3>
            <div class="value">${projected_revenue}</div>
        </div>
    </div>
    
    <div class="grid">
        <div class="card">
            <h2>Leads by City</h2>
            {city_rows}
        </div>
        <div class="card">
            <h2>Pipeline Status</h2>
            <div class="pipeline">
                {pipeline_stages}
            </div>
        </div>
    </div>
    
    <div class="card" style="margin-top: 20px;">
        <h2>Score Distribution</h2>
        <canvas id="scoreChart"></canvas>
    </div>
    
    <script>
        const ctx = document.getElementById('scoreChart').getContext('2d');
        new Chart(ctx, {{
            type: 'bar',
            data: {{
                labels: ['80-100', '60-79', '40-59', '20-39', '0-19'],
                datasets: [{{
                    label: 'Leads',
                    data: [{score_distribution}],
                    backgroundColor: ['#22c55e', '#3b82f6', '#fbbf24', '#f97316', '#ef4444']
                }}]
            }},
            options: {{
                responsive: true,
                plugins: {{ legend: {{ display: false }} }}
            }}
        }});
    </script>
</body>
</html>
"""


def generate_dashboards():
    """
    Generates global and city-specific HTML dashboards.
    """
    print("🚀 Phase 12: Dashboard Generator")
    print("=" * 60)

    input_dir = Path(__file__).parent.parent / PATHS["OUTPUT"]
    output_dir = Path(__file__).parent.parent / PATHS["DASHBOARDS"]

    all_leads = []
    city_stats = {}

    for city_name in TARGET_CITIES.keys():
        city_safe = city_name.replace(" ", "_")
        input_path = input_dir / f"leads_{city_safe}_prioritized.json"

        if not input_path.exists():
            city_stats[city_name] = {"total": 0, "priority": 0, "closed": 0}
            continue

        with open(input_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        priority = data.get("priority", [])
        backlog = data.get("backlog", [])
        all_city = priority + backlog

        all_leads.extend(all_city)
        city_stats[city_name] = {
            "total": len(all_city),
            "priority": len(priority),
            "closed": len([l for l in all_city if l.get("status") == "CLOSED"]),
        }

    total_leads = len(all_leads)
    priority_leads = len([l for l in all_leads if l.get("status") == "PRIORITY"])
    closed_leads = len([l for l in all_leads if l.get("status") == "CLOSED"])
    closed_revenue = closed_leads * 300
    projected_revenue = priority_leads * 300

    city_rows = "\n".join(
        [
            f"""<div class="city-row">
            <span>{city}</span>
            <span>{stats["total"]} total / {stats["priority"]} priority</span>
        </div>"""
            for city, stats in city_stats.items()
        ]
    )

    status_counts = {
        "Priority": priority_leads,
        "Contacted": len([l for l in all_leads if l.get("status") == "CONTACTED"]),
        "Responded": len([l for l in all_leads if l.get("status") == "RESPONDED"]),
        "Interested": len([l for l in all_leads if l.get("status") == "INTERESTED"]),
        "Closed": closed_leads,
    }

    pipeline_stages = "\n".join(
        [
            f"""<div class="pipeline-stage">
            <span>{count}</span>
            <small>{stage}</small>
        </div>"""
            for stage, count in status_counts.items()
        ]
    )

    score_dist = [0, 0, 0, 0, 0]
    for lead in all_leads:
        score = lead.get("lead_score", 0)
        if score >= 80:
            score_dist[0] += 1
        elif score >= 60:
            score_dist[1] += 1
        elif score >= 40:
            score_dist[2] += 1
        elif score >= 20:
            score_dist[3] += 1
        else:
            score_dist[4] += 1

    html = GLOBAL_DASHBOARD.format(
        date=datetime.now().strftime("%Y-%m-%d %H:%M"),
        total_leads=total_leads,
        priority_leads=priority_leads,
        closed_revenue=closed_revenue,
        projected_revenue=projected_revenue,
        city_rows=city_rows,
        pipeline_stages=pipeline_stages,
        score_distribution=",".join(map(str, score_dist)),
    )

    global_dir = output_dir / "global"
    global_dir.mkdir(parents=True, exist_ok=True)

    with open(global_dir / "index.html", "w") as f:
        f.write(html)

    print(f"\n✅ Dashboard generated: {global_dir / 'index.html'}")
    print(f"   Total Leads: {total_leads}")
    print(f"   Priority: {priority_leads}")
    print(f"   Projected Revenue: ${projected_revenue}")
    print("=" * 60)

    return {
        "total_leads": total_leads,
        "priority": priority_leads,
        "revenue": projected_revenue,
    }


if __name__ == "__main__":
    generate_dashboards()
