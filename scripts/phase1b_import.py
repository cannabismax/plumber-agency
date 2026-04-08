#!/usr/bin/env python3`n`nimport os, sys; os.environ["PYTHONIOENCODING"] = "utf-8"; sys.stdout.reconfigure(encoding="utf-8", errors="replace") if sys.stdout.encoding != "utf-8" else None
"""
Phase 1b: Lead Import from Web Search Data
Imports leads discovered via web search into the system.
"""

import os
import sys
import json
import re
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import TARGET_CITIES, PATHS


def extract_phone_from_text(text):
    """Extract phone number from text"""
    patterns = [
        r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",
        r"\+\d{1,3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0)
    return None


def generate_leads_from_search():
    """Generate leads from collected web search data"""

    leads_data = {
        "Tucson": [
            {
                "business_name": "A.S.G. Plumbing Enterprises",
                "website": "https://tucsonazplumber.com/",
                "phone": "(520) 333-2121",
                "address": "Tucson, AZ 85730",
                "services": "Emergency Plumbing, Drain Cleaning, Water Heater",
            },
            {
                "business_name": "Cummings Plumbing Heating and Cooling",
                "website": "https://cummingsplumbingtucsonaz.com/",
                "phone": "(520) 333-2121",
                "address": "Tucson, AZ",
                "services": "Plumbing, Heating, Cooling, Emergency",
            },
            {
                "business_name": "Wood's Plumbing",
                "website": "https://woodsplumbing.com/",
                "phone": "(520) 682-2233",
                "address": "Tucson, AZ",
                "services": "Emergency Plumbing, Drain, Water Services",
            },
            {
                "business_name": "Big Ed's Plumbing",
                "website": "https://bigedsplumbing.com/",
                "phone": None,
                "address": "Tucson, AZ 85730",
                "services": "Emergency Plumbing, 24/7 Service",
            },
            {
                "business_name": "Roto-Rooter Tucson",
                "website": "https://www.rotorooter.com/tucson/",
                "phone": "(520) 518-3769",
                "address": "Tucson, AZ",
                "services": "Emergency Plumbing, Drain Services",
            },
            {
                "business_name": "Al Coronado Plumbing",
                "website": "https://alcoronadoplumbing.com/",
                "phone": None,
                "address": "Tucson, AZ",
                "services": "Residential Plumbing, Commercial",
            },
            {
                "business_name": "Right Now Plumbing",
                "website": "https://rightnowplumbingtucson.com/",
                "phone": None,
                "address": "Tucson, AZ",
                "services": "Emergency Plumbing, Licensed, Insured",
            },
            {
                "business_name": "Tucson Plumbing & Heating",
                "website": "https://tucsonplumbing.com/",
                "phone": None,
                "address": "Tucson, AZ",
                "services": "Emergency Repairs, Drain Cleaning, Water Heater",
            },
            {
                "business_name": "Tucson Plumbing Pros",
                "website": "https://tucsonplumbingprosaz.com/",
                "phone": "(520) 438-6111",
                "address": "Tucson, AZ",
                "services": "24 Hour Plumbing, Same Day Service",
            },
            {
                "business_name": "Tucson 24 Hour Plumber and Drain",
                "website": "http://tucson24hourplumberanddrain.com/",
                "phone": "(520) 252-4044",
                "address": "7729 E. Clarence Pl - Tucson AZ 85715",
                "services": "Emergency, Water Heater, Drain Cleaning",
            },
            {
                "business_name": "On The Way Plumbing",
                "website": "https://otwplumbing.com/",
                "phone": None,
                "address": "Tucson, AZ",
                "services": "Plumbing Services",
            },
        ],
        "Phoenix": [
            {
                "business_name": "Roto-Rooter Phoenix",
                "website": "https://www.rotorooter.com/phoenix/",
                "phone": "(623) 915-0995",
                "address": "Phoenix, AZ",
                "services": "24 Hour Emergency Plumbing, Drain Cleaning",
            },
            {
                "business_name": "Pipe Masters",
                "website": "https://www.pipemastersaz.com/",
                "phone": "(480) 707-3067",
                "address": "Phoenix, AZ",
                "services": "Emergency Plumbing, 24/7 Service",
            },
            {
                "business_name": "Parker & Sons",
                "website": "https://www.parkerandsons.com/",
                "phone": None,
                "address": "Phoenix, AZ",
                "services": "Emergency Plumber, HVAC, Electrical",
            },
            {
                "business_name": "Dr. Pipes Phoenix",
                "website": "https://www.drpipes.com/az/maricopa/phoenix.html",
                "phone": None,
                "address": "Phoenix, AZ",
                "services": "24/7 Emergency Plumbing",
            },
            {
                "business_name": "Phoenix Plumbing",
                "website": "https://phoenixplumbing.co/",
                "phone": "(602) 834-1208",
                "address": "Phoenix, AZ",
                "services": "Emergency Plumbing, 60-Min Response",
            },
            {
                "business_name": "Simon's Plumbing",
                "website": "https://simonsplumbingaz.com/",
                "phone": "(602) 739-4117",
                "email": "simon@simonsplumbingaz.com",
                "address": "Phoenix, AZ",
                "services": "Full-Service Plumbing, 24/7",
            },
            {
                "business_name": "Quail Plumbing",
                "website": "https://www.quailplumbing.com/",
                "phone": "(602) 493-9822",
                "address": "Phoenix, AZ 85024",
                "services": "Drain Cleaning, 24 Hr Emergency",
            },
            {
                "business_name": "Sparkle Air",
                "website": "https://www.sparkleairaz.com/",
                "phone": "(480) 276-3254",
                "address": "Phoenix, AZ",
                "services": "Emergency Plumbing, HVAC",
            },
            {
                "business_name": "Howard Air & Plumbing",
                "website": "https://howardair.com/",
                "phone": "(480) 508-9866",
                "address": "Phoenix, AZ",
                "services": "Plumbing Repair, 24 Hour Emergency",
            },
            {
                "business_name": "Okane Plumbing",
                "website": "https://phoenix-az.okaneplumbingandelectrics.com/",
                "phone": "(833) 876-1141",
                "address": "Phoenix, AZ 85044",
                "services": "24 Hour Emergency Plumbing",
            },
            {
                "business_name": "Arizona Emergency Plumbers",
                "website": "https://arizonaemergencyplumbers.org/",
                "phone": None,
                "address": "Phoenix, AZ",
                "services": "24/7 Emergency Services, Licensed",
            },
            {
                "business_name": "Bridge Plumbing HVAC",
                "website": "https://bridgeplumbinghvac.com/",
                "phone": None,
                "address": "Phoenix, AZ",
                "services": "24/7 Plumbing and HVAC",
            },
            {
                "business_name": "The Aussie Plumber",
                "website": "https://theaussieplumber.com/",
                "phone": None,
                "address": "Phoenix, AZ",
                "services": "Plumbing, Repairs, Replacements",
            },
            {
                "business_name": "Rock Plumbing AZ",
                "website": "https://rockplumbingaz.com/",
                "phone": None,
                "address": "Phoenix, AZ",
                "services": "Emergency Plumbing, 24/7",
            },
        ],
        "Dallas": [
            {
                "business_name": "Baker Brothers Plumbing",
                "website": "https://bakerbrothersplumbing.com/",
                "phone": "(214) 296-2136",
                "address": "Dallas, TX",
                "services": "Emergency Plumbing, 24 Hour",
            },
            {
                "business_name": "Emergency Plumbing on Call",
                "website": "https://emergencyplumbingoncall.com/",
                "phone": "(972) 597-5959",
                "address": "Dallas, TX",
                "services": "24/7 Emergency, 20+ Years Experience",
            },
            {
                "business_name": "Lee's Air Plumbing",
                "website": "https://leesair.com/",
                "phone": None,
                "address": "Dallas, TX",
                "services": "Emergency Plumbing, HVAC",
            },
            {
                "business_name": "Pure Plumbing DFW",
                "website": "https://www.pureplumbingdfw.com/",
                "phone": None,
                "address": "Dallas, TX",
                "services": "24/7 Emergency Plumbing",
            },
            {
                "business_name": "448 Plumbing",
                "website": "https://www.448plumbing.com/",
                "phone": None,
                "address": "Dallas, TX",
                "services": "Emergency Plumbing, Licensed",
            },
            {
                "business_name": "Reliant Plumbing",
                "website": "https://reliantplumbing.com/",
                "phone": None,
                "address": "Dallas, TX",
                "services": "24 Hour Emergency Plumbing",
            },
            {
                "business_name": "Astar Air Conditioning",
                "website": "https://astardfw.com/",
                "phone": None,
                "address": "Dallas-Fort Worth, TX",
                "services": "Emergency Plumbing, Fast Response",
            },
            {
                "business_name": "Jerry's Plumbing Heating",
                "website": "https://jerrysplumbingheating.com/",
                "phone": None,
                "address": "Dallas, TX",
                "services": "Emergency Plumbing, Rapid Response",
            },
            {
                "business_name": "Dallas Plumbing & AC",
                "website": "https://dallasplumbing.com/",
                "phone": "(469) 213-2459",
                "address": "Dallas, TX",
                "services": "Emergency Plumber, Since 1903",
            },
            {
                "business_name": "1-800-Plumber Dallas",
                "website": "https://1800plumber.com/dallas-tx/",
                "phone": "(214) 935-8547",
                "address": "Dallas, TX",
                "services": "24/7 Emergency Plumbing",
            },
            {
                "business_name": "Glens Plumbing",
                "website": "http://glensplumbing.com/",
                "phone": "(214) 429-4634",
                "address": "Dallas, TX",
                "services": "Drain Cleaning, Sewer Repair, 4.9 Stars",
            },
            {
                "business_name": "Texas Rooter",
                "website": "https://www.texasrooter.com/",
                "phone": None,
                "address": "Dallas, TX",
                "services": "Plumbing, Drain Cleaning, 24-Hour",
            },
            {
                "business_name": "All Masters Plumbing",
                "website": "https://allmastersplumbing.com/",
                "phone": None,
                "address": "Dallas-Fort Worth, TX",
                "services": "24-Hour Emergency, Same-Day",
            },
            {
                "business_name": "Garza's Plumbing",
                "website": "https://garzasplumbing.com/",
                "phone": None,
                "address": "Dallas, TX",
                "services": "24/7 Emergency, Licensed Experts",
            },
        ],
        "Tampa": [
            {
                "business_name": "Roto-Rooter Tampa",
                "website": "https://www.rotorooter.com/tampa/",
                "phone": "(813) 980-6000",
                "address": "Tampa, FL",
                "services": "24/7 Emergency Plumbing",
            },
            {
                "business_name": "Benjamin Franklin Plumbing Tampa",
                "website": "https://www.benjaminfranklinplumbing.com/tampa/",
                "phone": None,
                "address": "Tampa, FL",
                "services": "Emergency Plumbing, Voted Best (Forbes)",
            },
            {
                "business_name": "Tampa Emergency Plumbing",
                "website": "https://emergencyplumbertampa.com/",
                "phone": "(813) 489-6968",
                "address": "Tampa, FL",
                "services": "24 Hour Plumbers, Reliable",
            },
            {
                "business_name": "All Hours Plumber Tampa",
                "website": "https://allhoursplumber.com/",
                "phone": None,
                "address": "Tampa, FL",
                "services": "24/7 Emergency, Tampa Bay Area",
            },
            {
                "business_name": "Everyday Plumber",
                "website": "https://everydayplumber.com/",
                "phone": None,
                "address": "Tampa, FL",
                "services": "Emergency, Residential, Commercial",
            },
            {
                "business_name": "1 Tom Plumber Tampa",
                "website": "https://www.1tomplumber.com/tampa-fl/",
                "phone": None,
                "address": "Tampa, FL",
                "services": "24 Hour Emergency, Every Day/Night",
            },
            {
                "business_name": "Grable Plumbing & Air",
                "website": "https://grableplumbing.com/",
                "phone": "(813) 239-3636",
                "address": "Tampa, FL",
                "services": "Emergency 24hr, Free Estimate",
            },
            {
                "business_name": "ABC Plumbing Tampa Bay",
                "website": "https://www.4abc.com/",
                "phone": "(813) 452-5952",
                "address": "Tampa Bay, FL",
                "services": "Emergency Plumbing Services",
            },
            {
                "business_name": "Stewart Bros Plumbing",
                "website": "https://stewartbrosplumbing.com/",
                "phone": "(813) 602-0700",
                "address": "Tampa, FL",
                "services": "24/7 Plumbing",
            },
            {
                "business_name": "Dr. Pipes Tampa",
                "website": "https://www.drpipes.com/fl/hillsborough/tampa.html",
                "phone": None,
                "address": "Tampa, FL",
                "services": "24/7 Emergency Plumbers",
            },
        ],
        "Las Vegas": [
            {
                "business_name": "Roto-Rooter Las Vegas",
                "website": "https://www.rotorooter.com/lasvegas/",
                "phone": "(702) 931-3831",
                "address": "Las Vegas, NV",
                "services": "24/7 Emergency, Fast Response",
            },
            {
                "business_name": "Anytime Plumbing Vegas",
                "website": "https://anytimeplumbingvegas.com/",
                "phone": "(725) 237-1727",
                "address": "Las Vegas, NV",
                "services": "24-Hour Emergency, Special Offers",
            },
            {
                "business_name": "Monkey Wrench Plumbing",
                "website": "https://www.monkeywrenchlv.com/",
                "phone": "(702) 900-5992",
                "address": "Las Vegas, NV",
                "services": "Emergency Plumbing, Free Quote",
            },
            {
                "business_name": "Code Red Emergency Plumbing",
                "website": "https://coderedplumbing.com/",
                "phone": "(702) 949-6599",
                "address": "Las Vegas, NV",
                "services": "Emergency, Las Vegas Favorite",
            },
            {
                "business_name": "Orchard Plumbing",
                "website": "https://orchardplumbing.vegas/",
                "phone": None,
                "address": "Las Vegas, NV",
                "services": "24-Hour Emergency, Licensed",
            },
            {
                "business_name": "Larkin Plumbing",
                "website": "https://www.larkinplumbingservice.com/",
                "phone": None,
                "address": "Las Vegas, NV",
                "services": "Since 1936, 24 Hour Emergency",
            },
            {
                "business_name": "24 HR Water Cleanup",
                "website": "https://24hrwatercleanup.com/",
                "phone": "(702) 978-0133",
                "address": "Las Vegas, NV",
                "services": "24 HR Emergency, Water Emergency",
            },
            {
                "business_name": "Sin City Plumbing",
                "website": "https://sincityplumbing.com/",
                "phone": "(702) 431-6502",
                "address": "Las Vegas, NV",
                "services": "24/7 Emergency, Fast Response",
            },
            {
                "business_name": "Precision Plumbing LV",
                "website": "https://www.precisionplumbinglv.com/",
                "phone": None,
                "address": "Las Vegas, NV",
                "services": "24/7 Plumbing, Las Vegas Valley",
            },
            {
                "business_name": "Dr. Pipes Las Vegas",
                "website": "https://www.drpipes.com/nv/las-vegas",
                "phone": None,
                "address": "Las Vegas, NV",
                "services": "24/7 Emergency Plumbers",
            },
            {
                "business_name": "Rodeo Plumbing and Drain",
                "website": "https://rodeo-plumbing.com/",
                "phone": None,
                "address": "Las Vegas, NV",
                "services": "Emergency Plumbing",
            },
            {
                "business_name": "247 Las Vegas Plumber",
                "website": "https://247lasvegasplumber.com/",
                "phone": None,
                "address": "Las Vegas, NV",
                "services": "24/7, 60 Minutes or FREE",
            },
            {
                "business_name": "Focus Plumbing",
                "website": "https://www.focusplumbing.com/",
                "phone": None,
                "address": "Las Vegas, NV",
                "services": "24-Hour Emergency, Same Day",
            },
        ],
    }

    output_dir = Path(__file__).parent.parent / PATHS["OUTPUT"]
    output_dir.mkdir(parents=True, exist_ok=True)

    total_leads = 0

    for city_name, city_info in TARGET_CITIES.items():
        city_safe = city_name.replace(" ", "_")
        city_leads = leads_data.get(city_name, [])

        for lead in city_leads:
            lead["city"] = city_name
            lead["state"] = city_info["state"]
            if "zip" in city_info and city_info["zip"]:
                lead["zip"] = city_info["zip"]

        json_path = output_dir / f"leads_{city_safe}.json"
        csv_path = output_dir / f"leads_{city_safe}.csv"

        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(city_leads, f, indent=2, ensure_ascii=False)

        if city_leads:
            import csv

            headers = [
                "business_name",
                "website",
                "phone",
                "email",
                "address",
                "city",
                "state",
                "services",
            ]
            with open(csv_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=headers, extrasaction="ignore")
                writer.writeheader()
                writer.writerows(city_leads)

        print(f"[OK] {city_name}: {len(city_leads)} leads")
        total_leads += len(city_leads)

    print(f"\n[COMPLETE] DISCOVERY")
    print(f"Total leads: {total_leads}")
    print(f"Output: {output_dir}")

    return total_leads


if __name__ == "__main__":
    print("[*] Importing leads from web search data...")
    generate_leads_from_search()
