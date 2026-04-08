#!/usr/bin/env python3`n`nimport os, sys; os.environ["PYTHONIOENCODING"] = "utf-8"; sys.stdout.reconfigure(encoding="utf-8", errors="replace") if sys.stdout.encoding != "utf-8" else None
"""
Phase 1: Discovery + Audit
Discovers plumbing businesses in target cities using web search.
"""

import os
import sys
import json
import time
import random
import asyncio
import re
from pathlib import Path

os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import TARGET_CITIES, PATHS

sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))

try:
    import httpx
    from bs4 import BeautifulSoup
except ImportError:
    print("Installing required packages...")
    os.system("pip install httpx beautifulsoup4")
    import httpx
    from bs4 import BeautifulSoup


class LeadDiscovery:
    def __init__(self, city, state):
        self.city = city
        self.state = state
        self.leads = []
        self.session = httpx.Client(
            timeout=30.0,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
            },
        )

    def search_google(self, query, num_results=50):
        """Search Google for plumbing businesses"""
        search_url = f"https://www.google.com/search?q={query}&num={num_results}"

        try:
            response = self.session.get(search_url)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "html.parser")

            results = []
            for g in soup.find_all("div", class_="tF2Cxc")[:num_results]:
                link = g.find("a", href=True)
                title = g.find("h3")
                if link and title:
                    results.append({"url": link["href"], "title": title.text})

            if not results:
                for item in soup.find_all("div", class_="kvH3mc"):
                    link = item.find("a", href=True)
                    title = item.find("span")
                    if link:
                        results.append(
                            {
                                "url": link["href"],
                                "title": title.text if title else "Unknown",
                            }
                        )

            return results

        except Exception as e:
            print(f"  Search error: {e}")
            return []

    def extract_business_info(self, url):
        """Extract business information from website"""
        try:
            response = self.session.get(url, timeout=10)
            soup = BeautifulSoup(response.text, "html.parser")

            business_name = soup.find("title")
            business_name = (
                business_name.text.split("|")[0].split("-")[0].strip()
                if business_name
                else "Unknown"
            )

            phone_pattern = r"(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"
            phone = re.search(phone_pattern, response.text)
            phone = phone.group(0) if phone else None

            address_pattern = r"\d+\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Way|Place|Pl)"
            address = re.search(address_pattern, response.text, re.IGNORECASE)
            address = address.group(0) if address else None

            email_pattern = r"[\w.-]+@[\w.-]+\.\w+"
            email = re.search(email_pattern, response.text)
            email = email.group(0) if email else None

            services = []
            service_keywords = [
                "plumbing",
                "drain",
                "water heater",
                "sewer",
                "gas",
                "leak",
                "repair",
                "installation",
            ]
            for keyword in service_keywords:
                if keyword.lower() in response.text.lower():
                    services.append(keyword.title())

            return {
                "website": url,
                "business_name": business_name[:255]
                if len(business_name) > 255
                else business_name,
                "phone": phone,
                "address": address,
                "email": email,
                "services": ", ".join(services[:10]) if services else None,
            }

        except Exception as e:
            return {"website": url, "error": str(e)}

    def discover_leads(self, target_count=50):
        """Main discovery process"""
        print(f"\n[*] Discovering leads in {self.city}, {self.state}")
        print("=" * 50)

        search_queries = [
            f"plumbing services {self.city} {self.state}",
            f"emergency plumber {self.city} {self.state}",
            f"residential plumbing {self.city} {self.state}",
            f"commercial plumbing {self.city} {self.state}",
            f"24 hour plumber {self.city} {self.state}",
            f"plumber near me {self.city}",
            f"local plumbing companies {self.city} {self.state}",
            f"plumbing repair {self.city} {self.state}",
        ]

        all_urls = set()

        for query in search_queries:
            print(f"  Searching: {query[:50]}...")
            results = self.search_google(query, num_results=20)

            for result in results:
                if result["url"] and "google.com" not in result["url"]:
                    all_urls.add(result["url"])

            time.sleep(random.uniform(1, 3))

            if len(all_urls) >= target_count:
                break

        all_urls = list(all_urls)[:target_count]
        print(f"\n[*] Found {len(all_urls)} unique websites. Extracting info...")

        for i, url in enumerate(all_urls, 1):
            print(f"  [{i}/{len(all_urls)}] Analyzing: {url[:60]}...")

            info = self.extract_business_info(url)
            info["city"] = self.city
            info["state"] = self.state

            self.leads.append(info)

            time.sleep(random.uniform(0.5, 1.5))

        return self.leads

    def save_leads(self, output_dir):
        """Save discovered leads to JSON and CSV"""
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        city_safe = self.city.replace(" ", "_")
        json_path = output_dir / f"leads_{city_safe}.json"
        csv_path = output_dir / f"leads_{city_safe}.csv"

        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(self.leads, f, indent=2, ensure_ascii=False)

        if self.leads:
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
                writer.writerows(self.leads)

        print(f"\n[OK] Saved {len(self.leads)} leads to:")
        print(f"   - {json_path}")
        print(f"   - {csv_path}")

        return json_path, csv_path

    def close(self):
        """Close HTTP session"""
        self.session.close()


def run_discovery():
    """Run discovery for all cities"""
    output_dir = Path(__file__).parent.parent / PATHS["OUTPUT"]

    all_leads = []

    for city_name, city_info in TARGET_CITIES.items():
        print(f"\n{'=' * 60}")
        print(f"[DISCOVERY] {city_name}")
        print(f"{'=' * 60}")

        discoverer = LeadDiscovery(city_name, city_info["state"])

        try:
            leads = discoverer.discover_leads(target_count=50)
            all_leads.extend(leads)

            discoverer.save_leads(output_dir)

        except Exception as e:
            print(f"\n[!] Error in {city_name}: {e}")
            continue
        finally:
            discoverer.close()

        print(f"\n[*] Waiting before next city...")
        time.sleep(random.uniform(5, 10))

    print(f"\n{'=' * 60}")
    print(f"[COMPLETE] DISCOVERY")
    print(f"{'=' * 60}")
    print(f"Total leads discovered: {len(all_leads)}")
    print(f"Output directory: {output_dir}")

    return all_leads


if __name__ == "__main__":
    print("[*] Starting Plumbing Lead Discovery - Phase 1")
    print("=" * 60)

    leads = run_discovery()

    print("\n[OK] Phase 1 complete!")
    print(f"   Next step: Run Phase 2 (scoring) to score the discovered leads")
