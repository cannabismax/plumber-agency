#!/usr/bin/env python3`n`nimport os, sys; os.environ["PYTHONIOENCODING"] = "utf-8"; sys.stdout.reconfigure(encoding="utf-8", errors="replace") if sys.stdout.encoding != "utf-8" else None
"""
Phase 5: Before/After Assets
Generates visual comparison references for PRIORITY leads.
"""

import os
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import TARGET_CITIES, PATHS


BEFORE_AFTER_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Before/After Analysis - {business_name}</title>
    <style>
        body {{ font-family: -apple-system, sans-serif; background: #0f172a; color: white; padding: 20px; }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
        h1 {{ text-align: center; margin-bottom: 30px; }}
        .comparison {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }}
        .panel {{ background: #1e293b; border-radius: 12px; padding: 20px; }}
        .panel h2 {{ text-align: center; margin-bottom: 15px; }}
        .panel.before {{ border: 2px solid #ef4444; }}
        .panel.after {{ border: 2px solid #22c55e; }}
        .screenshot {{ background: #334155; height: 300px; display: flex; align-items: center; justify-content: center; border-radius: 8px; margin-bottom: 15px; }}
        .issues {{ margin-top: 15px; }}
        .issue {{ background: #ef4444/20; padding: 8px 12px; margin: 4px 0; border-radius: 4px; }}
        .fix {{ background: #22c55e/20; padding: 8px 12px; margin: 4px 0; border-radius: 4px; }}
        .score {{ font-size: 2rem; font-weight: bold; text-align: center; margin-top: 20px; }}
        .score.before {{ color: #ef4444; }}
        .score.after {{ color: #22c55e; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>{business_name} - Before/After Analysis</h1>
        
        <div class="comparison">
            <div class="panel before">
                <h2>BEFORE (Current Site)</h2>
                <div class="screenshot">
                    <p>Screenshot of {original_url}</p>
                </div>
                <p><strong>Issues Found:</strong></p>
                <div class="issues">
                    {issues_html}
                </div>
                <div class="score before">
                    Score: {before_score}
                </div>
            </div>
            
            <div class="panel after">
                <h2>AFTER (Proposed Fix)</h2>
                <div class="screenshot">
                    <p>Demo site preview</p>
                </div>
                <p><strong>Improvements:</strong></p>
                <div class="issues">
                    {fixes_html}
                </div>
                <div class="score after">
                    Score: {after_score}
                </div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <h3>Expected Impact</h3>
            <p>Conversion Rate Increase: +{conversion_increase}%</p>
            <p>Additional Emergency Calls: ~{additional_calls}/month</p>
            <p>Monthly Revenue Impact: +${revenue_impact}</p>
        </div>
    </div>
</body>
</html>
"""


def generate_assets():
    """
    For each PRIORITY lead:
    1. Load lead data
    2. Create before/after comparison HTML
    3. Save to outreach_assets/[CITY]/
    """
    print("🚀 Phase 5: Before/After Asset Generator")
    print("=" * 60)

    input_dir = Path(__file__).parent.parent / PATHS["OUTPUT"]
    output_base = Path(__file__).parent.parent / PATHS["ASSETS"]

    results = {}

    for city_name in TARGET_CITIES.keys():
        city_safe = city_name.replace(" ", "_")
        input_path = input_dir / f"leads_{city_safe}_prioritized.json"

        if not input_path.exists():
            continue

        with open(input_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        priority_leads = data.get("priority", [])

        city_output = output_base / city_name.replace(" ", "_")
        city_output.mkdir(parents=True, exist_ok=True)

        count = 0
        for lead in priority_leads:
            if lead.get("status") != "PRIORITY":
                continue

            business_name = lead.get("business_name", "Unknown").replace(" ", "_")
            safe_name = "".join(c for c in business_name if c.isalnum() or c in "_-")

            issues = lead.get("issues", [])
            issues_html = (
                "\n".join([f'<div class="issue">❌ {issue}</div>' for issue in issues])
                if issues
                else '<div class="issue">No major issues</div>'
            )

            fixes = [
                '✓ Added sticky "Call Now" button',
                "✓ Prominent phone number throughout",
                "✓ Emergency service emphasis",
                "✓ Clear service offerings",
                "✓ Mobile-optimized design",
                "✓ Compelling headline",
            ]
            fixes_html = "\n".join([f'<div class="fix">{fix}</div>' for fix in fixes])

            before_score = lead.get("lead_score", 0)
            after_score = min(100, before_score + 35)
            conversion_increase = int((after_score - before_score) / 2)
            additional_calls = conversion_increase * 5
            revenue_impact = additional_calls * 50

            html = BEFORE_AFTER_TEMPLATE.format(
                business_name=lead.get("business_name", "Unknown"),
                original_url=lead.get("website", ""),
                issues_html=issues_html,
                fixes_html=fixes_html,
                before_score=before_score,
                after_score=after_score,
                conversion_increase=conversion_increase,
                additional_calls=additional_calls,
                revenue_impact=revenue_impact,
            )

            output_path = city_output / f"{safe_name}_analysis.html"
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(html)

            count += 1

        results[city_name] = count
        print(f"\n✅ {city_name}: Generated {count} before/after analyses")

    print(f"\n{'=' * 60}")
    print("✅ ASSET GENERATION COMPLETE")
    print("=" * 60)

    return results


if __name__ == "__main__":
    generate_assets()
