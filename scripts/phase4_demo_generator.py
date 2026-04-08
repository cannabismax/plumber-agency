#!/usr/bin/env python3
"""
Phase 4: Demo Site Generator
Generates simplified landing pages for PRIORITY leads.
"""

import os
import sys
import json
from pathlib import Path

os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import TARGET_CITIES, PATHS

import random

DEMO_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{business_name} - Emergency Plumbing Services</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
        
        .sticky-cta {{
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #dc2626;
            padding: 12px 20px;
            z-index: 1000;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 -4px 12px rgba(0,0,0,0.15);
        }}
        .sticky-cta span {{ color: white; font-weight: 600; }}
        .sticky-cta a {{
            background: white;
            color: #dc2626;
            padding: 8px 20px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 600;
        }}
        
        .hero {{
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 80px 20px 40px;
            text-align: center;
        }}
        .hero h1 {{
            font-size: 2.5rem;
            margin-bottom: 10px;
        }}
        .hero p {{
            font-size: 1.2rem;
            opacity: 0.9;
        }}
        
        .cta-section {{
            background: #fef3c7;
            padding: 40px 20px;
            text-align: center;
        }}
        .cta-section h2 {{ color: #92400e; margin-bottom: 20px; }}
        .cta-phone {{
            font-size: 2rem;
            color: #dc2626;
            font-weight: bold;
            text-decoration: none;
        }}
        
        .services {{
            padding: 40px 20px;
            max-width: 1000px;
            margin: 0 auto;
        }}
        .services h2 {{ text-align: center; margin-bottom: 30px; }}
        .services-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }}
        .service-card {{
            background: #f1f5f9;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }}
        .service-card h3 {{ color: #1e40af; margin-bottom: 8px; }}
        
        .contact {{
            background: #1e293b;
            color: white;
            padding: 40px 20px;
            text-align: center;
        }}
        .contact h2 {{ margin-bottom: 20px; }}
        .contact-info p {{ margin: 8px 0; font-size: 1.1rem; }}
        
        .badge {{
            position: absolute;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
        }}
        
        @media (max-width: 600px) {{
            .hero h1 {{ font-size: 1.8rem; }}
            .cta-phone {{ font-size: 1.5rem; }}
        }}
    </style>
</head>
<body>
    <div class="sticky-cta">
        <span>Need Emergency Help?</span>
        <a href="tel:{phone}">CALL NOW</a>
    </div>
    
    <div class="hero">
        <h1>{headline}</h1>
        <p>Professional {city} Plumbers - Available 24/7</p>
    </div>
    
    <div class="cta-section">
        <h2>Same-Day Service Available</h2>
        <a href="tel:{phone}" class="cta-phone">{phone}</a>
        <p style="margin-top: 15px; color: #92400e;">No Extra Charges for Nights & Weekends</p>
    </div>
    
    <div class="services">
        <h2>Our Services</h2>
        <div class="services-grid">
            {services_html}
        </div>
    </div>
    
    <div class="contact">
        <h2>Contact Us</h2>
        <div class="contact-info">
            <p>Phone: {phone}</p>
            <p>Address: {address}</p>
            <p>Hours: Available 24/7</p>
        </div>
    </div>
</body>
</html>
"""

SERVICE_CARD = """
    <div class="service-card">
        <h3>{name}</h3>
        <p>Professional service</p>
    </div>
"""


def generate_demo_sites():
    print("[*] Phase 4: Demo Site Generator")
    print("=" * 60)

    input_dir = Path(__file__).parent.parent / PATHS["OUTPUT"]
    output_base = Path(__file__).parent.parent / PATHS["DEMO_SITES"]

    results = {}

    for city_name in TARGET_CITIES.keys():
        city_safe = city_name.replace(" ", "_")
        input_path = input_dir / f"leads_{city_safe}_prioritized.json"

        if not input_path.exists():
            continue

        with open(input_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        priority_leads = data.get("priority", [])

        city_output = output_base / city_safe
        city_output.mkdir(parents=True, exist_ok=True)

        count = 0
        for lead in priority_leads:
            if lead.get("status") != "PRIORITY":
                continue

            business_name = lead.get("business_name", "Unknown").replace(" ", "_")
            safe_name = "".join(c for c in business_name if c.isalnum() or c in "_-")

            services = lead.get("services", "").split(", ")[:6]
            if not services or services == [""]:
                services = [
                    "Emergency Plumbing",
                    "Drain Cleaning",
                    "Water Heater",
                    "Sewer Line",
                    "Gas Line",
                    "Leak Detection",
                ]

            services_html = "\n".join(
                [SERVICE_CARD.format(name=s.strip()) for s in services if s.strip()]
            )

            headlines = [
                f"24/7 Emergency Plumbing in {city_name}",
                f"Fast {city_name} Plumbers - Same Day Service",
                f"Professional Plumbing Services in {city_name}",
                f"Expert Plumbers in {city_name} - Call Now",
            ]

            html = DEMO_TEMPLATE.format(
                business_name=lead.get("business_name", "Plumbing Services"),
                headline=random.choice(headlines),
                phone=lead.get("phone", "(555) 123-4567"),
                address=lead.get("address", city_name),
                city=city_name,
                services_html=services_html,
            )

            output_path = city_output / f"{safe_name}.html"
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(html)

            lead["demo_site_path"] = str(output_path)
            lead["demo_site_url"] = f"file://{output_path.absolute()}"
            count += 1

        with open(input_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        results[city_name] = count
        print(f"[OK] {city_name}: Generated {count} demo sites")

    print(f"\n{'=' * 60}")
    print("[OK] DEMO SITE GENERATION COMPLETE")
    print("=" * 60)

    return results


if __name__ == "__main__":
    generate_demo_sites()
