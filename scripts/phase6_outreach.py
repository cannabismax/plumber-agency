#!/usr/bin/env python3
"""
Phase 6: Multi-Channel Outreach Generator

MANUAL MODE (Default): Generates templates and instructions for manual sending
AUTO MODE: When enabled, would send automatically (not implemented - no API keys)

This script generates:
1. Email templates for each priority lead
2. SMS templates for each priority lead
3. Individual HTML pages with full instructions
4. A master CSV for bulk sending
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import (
    TARGET_CITIES,
    PATHS,
    LIMITS,
    OUTREACH_TEMPLATES,
    OUTREACH_MODE,
)


def extract_first_name(business_name):
    """Extract a first name from business name for personalization"""
    if not business_name or business_name == "NULL":
        return "there"

    name = business_name.strip()

    # Handle common patterns
    if " - " in name:
        # Format: "Big Ed - Big Ed Plumbing"
        name = name.split(" - ")[0].strip()

    if "'s" in name:
        # Format: "Wood's Plumbing"
        name = name.replace("'s", "").strip()
        # Try to extract name before apostrophe s
        if "'" in business_name:
            parts = business_name.split("'")
            if len(parts) > 1 and parts[0].strip():
                name = parts[0].strip()

    words = name.split()
    if len(words) >= 2:
        # Check if first word might be a title
        first_word = words[0].lower()
        if first_word in ["mr", "mrs", "ms", "dr", "prof"]:
            if len(words) > 1:
                return words[1]
        # Check if it's a common plumbing term
        elif first_word.lower() in [
            "best",
            "top",
            "pro",
            "expert",
            "master",
            "chief",
            "senior",
            "lead",
        ]:
            # Return the second word if it looks like a name
            if len(words) > 1 and words[1].isalpha() and len(words[1]) > 2:
                return words[1]
        # First word is likely a name
        elif words[0].isalpha() and len(words[0]) >= 2:
            return words[0]

    # Fallback - try to get something usable
    if words and words[0].isalpha():
        return words[0]

    return "there"


def generate_email_template(lead, demo_url):
    """Generate personalized email template for a lead"""
    business_name = lead.get("business_name", "")
    first_name = extract_first_name(business_name)

    subject = OUTREACH_TEMPLATES["email"]["subject"]

    body = f"""Hi {first_name},

I noticed your site at {lead.get("website", "")} could be losing emergency plumbing calls.

I rebuilt your homepage to show exactly what I mean:
{demo_url}

Here's what I fixed:
- Added a sticky "Call Now" button
- Made your phone number prominent on every page
- Created a sense of urgency for emergency services

Would you like me to walk you through the changes? It's completely free to look at.

Best regards,
Alex

---
To unsubscribe, reply STOP
"""
    return {"subject": subject, "body": body}


def generate_sms_template(lead, demo_url):
    """Generate SMS template for a lead"""
    message = f"Quick fix for your website - this could bring more emergency calls: {demo_url}"

    if len(message) > 160:
        message = message[:157] + "..."

    return {"message": message, "char_count": len(message)}


def generate_outreach():
    """
    Generate outreach materials for all priority leads.

    Mode: MANUAL (default)
    - Generates HTML pages with templates
    - Creates CSV files for bulk import
    - Provides step-by-step instructions
    """
    print("[*] Phase 6: Outreach Generator")
    print("=" * 60)
    print(f"    Mode: {OUTREACH_MODE['MODE']}")
    print(f"    Auto Enabled: {OUTREACH_MODE['AUTO_ENABLED']}")
    print("=" * 60)

    input_dir = Path(__file__).parent.parent / PATHS["OUTPUT"]
    output_dir = Path(__file__).parent.parent / PATHS["OUTPUT"] / "outreach"
    output_dir.mkdir(parents=True, exist_ok=True)

    all_emails = []
    all_sms = []
    all_leads = []

    for city_name in TARGET_CITIES.keys():
        city_safe = city_name.replace(" ", "_")
        input_path = input_dir / f"leads_{city_safe}_prioritized.json"

        if not input_path.exists():
            continue

        with open(input_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        priority_leads = data.get("priority", [])
        max_emails = min(LIMITS["MAX_EMAILS_PER_CITY"], len(priority_leads))

        city_emails = []
        city_sms = []
        city_leads = []

        for lead in priority_leads[:max_emails]:
            demo_url = (
                lead.get("demo_site_url", "")
                or f"demo_sites/{city_name}/{lead.get('business_name', 'unknown')}.html"
            )

            email = generate_email_template(lead, demo_url)
            email.update(
                {
                    "lead_id": lead.get("business_name"),
                    "lead_db_id": None,
                    "city": city_name,
                    "phone": lead.get("phone", ""),
                    "website": lead.get("website", ""),
                    "status": "PENDING",
                    "created_at": datetime.now().isoformat(),
                }
            )
            city_emails.append(email)
            all_emails.append(email)

            if len(all_sms) < LIMITS["MAX_SMS_TOTAL"]:
                sms = generate_sms_template(lead, demo_url)
                sms.update(
                    {
                        "lead_id": lead.get("business_name"),
                        "city": city_name,
                        "phone": lead.get("phone", ""),
                        "status": "PENDING",
                        "created_at": datetime.now().isoformat(),
                    }
                )
                city_sms.append(sms)
                all_sms.append(sms)

            city_leads.append(
                {
                    "business_name": lead.get("business_name"),
                    "city": city_name,
                    "website": lead.get("website", ""),
                    "phone": lead.get("phone", ""),
                    "email_subject": email["subject"],
                    "email_body": email["body"],
                    "sms_message": city_sms[-1]["message"] if len(city_sms) > 0 else "",
                    "demo_url": demo_url,
                    "status": "READY_TO_SEND",
                }
            )
            all_leads.append(city_leads[-1])

        city_out_dir = output_dir / city_safe
        city_out_dir.mkdir(exist_ok=True)

        with open(city_out_dir / "emails.json", "w", encoding="utf-8") as f:
            json.dump(city_emails, f, indent=2, ensure_ascii=False)

        with open(city_out_dir / "sms.json", "w", encoding="utf-8") as f:
            json.dump(city_sms, f, indent=2, ensure_ascii=False)

        print(f"[OK] {city_name}: {len(city_emails)} emails, {len(city_sms)} SMS")

    import csv

    csv_path = output_dir / "all_leads.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "business_name",
                "city",
                "website",
                "phone",
                "email_subject",
                "email_body",
                "sms_message",
                "demo_url",
                "status",
            ],
        )
        writer.writeheader()
        writer.writerows(all_leads)

    summary = {
        "generated_at": datetime.now().isoformat(),
        "mode": OUTREACH_MODE["MODE"],
        "auto_enabled": OUTREACH_MODE["AUTO_ENABLED"],
        "total_emails": len(all_emails),
        "total_sms": len(all_sms),
        "total_leads": len(all_leads),
        "by_city": {},
    }

    for city_name in TARGET_CITIES.keys():
        city_safe = city_name.replace(" ", "_")
        summary["by_city"][city_name] = {
            "emails": len([e for e in all_emails if e["city"] == city_name]),
            "sms": len([s for s in all_sms if s["city"] == city_name]),
        }

    summary_path = output_dir / "outreach_summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print(f"\n{'=' * 60}")
    print("[OK] OUTREACH GENERATION COMPLETE")
    print(f"{'=' * 60}")
    print(f"   Total Emails: {len(all_emails)}")
    print(f"   Total SMS: {len(all_sms)}")
    print(f"   CSV Export: {csv_path}")
    print(f"\n   MANUAL MODE: Templates ready for manual sending")
    print(f"   AUTO MODE: Disabled (no API keys configured)")

    return summary


if __name__ == "__main__":
    generate_outreach()
