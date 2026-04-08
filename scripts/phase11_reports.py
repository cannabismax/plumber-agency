#!/usr/bin/env python3`n`nimport os, sys; os.environ["PYTHONIOENCODING"] = "utf-8"; sys.stdout.reconfigure(encoding="utf-8", errors="replace") if sys.stdout.encoding != "utf-8" else None
"""
Phase 11: Client Reporting
Generates HTML reports for each lead.
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import TARGET_CITIES, PATHS, REVENUE_TIERS


REPORT_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lead Report - {business_name}</title>
    <style>
        body {{ font-family: -apple-system, sans-serif; background: #0f172a; color: white; padding: 20px; }}
        .container {{ max-width: 900px; margin: 0 auto; }}
        h1 {{ border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }}
        .meta {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }}
        .meta-card {{ background: #1e293b; padding: 15px; border-radius: 8px; }}
        .meta-card h3 {{ color: #94a3b8; font-size: 0.9rem; margin-bottom: 5px; }}
        .meta-card p {{ font-size: 1.3rem; font-weight: bold; }}
        .section {{ background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .section h2 {{ color: #3b82f6; margin-bottom: 15px; }}
        .issue-list, .fix-list {{ list-style: none; }}
        .issue-list li, .fix-list li {{ padding: 8px 0; border-bottom: 1px solid #334155; }}
        .impact {{ background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .impact h3 {{ margin-bottom: 10px; }}
        .screenshot-placeholder {{ background: #334155; height: 200px; display: flex; align-items: center; justify-content: center; border-radius: 8px; margin: 10px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>{business_name}</h1>
        <p style="color: #94a3b8;">Generated: {generated_at}</p>
        
        <div class="meta">
            <div class="meta-card">
                <h3>Lead Score</h3>
                <p style="color: #fbbf24;">{lead_score}</p>
            </div>
            <div class="meta-card">
                <h3>Status</h3>
                <p style="color: #3b82f6;">{status}</p>
            </div>
            <div class="meta-card">
                <h3>City</h3>
                <p>{city}</p>
            </div>
        </div>
        
        <div class="section">
            <h2>Issues Found</h2>
            <ul class="issue-list">
                {issues_html}
            </ul>
        </div>
        
        <div class="section">
            <h2>Fixes Applied</h2>
            <ul class="fix-list">
                {fixes_html}
            </ul>
        </div>
        
        <div class="screenshot-placeholder">
            [Screenshot: Before/After Comparison]
        </div>
        
        <div class="impact">
            <h3>Expected Conversion Gain</h3>
            <p><strong>Monthly Emergency Calls:</strong> +{additional_calls}</p>
            <p><strong>Revenue Impact:</strong> +${revenue_impact}/month</p>
            <p><strong>ROI Timeline:</strong> {roi_timeline}</p>
        </div>
        
        <div class="section">
            <h2>Contact Information</h2>
            <p><strong>Website:</strong> <a href="{website}" style="color: #3b82f6;">{website}</a></p>
            <p><strong>Phone:</strong> {phone}</p>
            <p><strong>Email:</strong> {email}</p>
        </div>
    </div>
</body>
</html>
"""


def generate_reports():
    """
    Generates HTML report for each PRIORITY lead.
    """
    print("🚀 Phase 11: Client Report Generator")
    print("=" * 60)

    input_dir = Path(__file__).parent.parent / PATHS["OUTPUT"]
    output_dir = Path(__file__).parent.parent / PATHS["REPORTS"]
    output_dir.mkdir(parents=True, exist_ok=True)

    count = 0

    for city_name in TARGET_CITIES.keys():
        city_safe = city_name.replace(" ", "_")
        input_path = input_dir / f"leads_{city_safe}_prioritized.json"

        if not input_path.exists():
            continue

        with open(input_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        priority_leads = data.get("priority", [])

        for lead in priority_leads:
            if lead.get("status") != "PRIORITY":
                continue

            business_name = lead.get("business_name", "Unknown").replace(" ", "_")
            safe_name = "".join(c for c in business_name if c.isalnum() or c in "_-")

            issues = lead.get("issues", [])
            issues_html = (
                "\n".join([f"<li>❌ {issue}</li>" for issue in issues])
                if issues
                else "<li>No major issues found</li>"
            )

            fixes = [
                'Added sticky "Call Now" button',
                "Prominent phone number placement",
                "Emergency service emphasis in hero",
                "Clear service offerings grid",
                "Mobile-optimized design",
                "Compelling headline",
            ]
            fixes_html = "\n".join([f"<li>✅ {fix}</li>" for fix in fixes])

            lead_score = lead.get("lead_score", 0)
            additional_calls = max(10, lead_score // 2)
            revenue_impact = additional_calls * 50
            roi_timeline = "1-2 months"

            html = REPORT_TEMPLATE.format(
                business_name=lead.get("business_name", "Unknown"),
                generated_at=datetime.now().strftime("%Y-%m-%d %H:%M"),
                lead_score=lead_score,
                status=lead.get("status", "PRIORITY"),
                city=city_name,
                issues_html=issues_html,
                fixes_html=fixes_html,
                additional_calls=additional_calls,
                revenue_impact=revenue_impact,
                roi_timeline=roi_timeline,
                website=lead.get("website", ""),
                phone=lead.get("phone", "N/A"),
                email=lead.get("email", "N/A"),
            )

            output_path = output_dir / f"{safe_name}_report.html"
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(html)

            count += 1

    print(f"\n✅ Generated {count} client reports")
    print(f"   Output: {output_dir}")
    print("=" * 60)

    return count


if __name__ == "__main__":
    generate_reports()
