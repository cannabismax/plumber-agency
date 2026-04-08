#!/usr/bin/env python3`n`nimport os, sys; os.environ["PYTHONIOENCODING"] = "utf-8"; sys.stdout.reconfigure(encoding="utf-8", errors="replace") if sys.stdout.encoding != "utf-8" else None
"""
Phase 2: Lead Scoring Engine
Scores leads based on website analysis criteria.
"""

import os
import sys
import json
import time
import re
from pathlib import Path

os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import TARGET_CITIES, PATHS, LEAD_SCORING

try:
    import httpx
    from bs4 import BeautifulSoup
except ImportError:
    os.system("pip install httpx beautifulsoup4")
    import httpx
    from bs4 import BeautifulSoup


class LeadScorer:
    def __init__(self):
        self.session = httpx.Client(timeout=30.0)

        self.scoring_weights = {
            "no_click_to_call": LEAD_SCORING["NO_CLICK_TO_CALL"],
            "no_sticky_cta": LEAD_SCORING["NO_STICKY_CTA"],
            "weak_headline": LEAD_SCORING["WEAK_HEADLINE"],
            "poor_mobile": LEAD_SCORING["POOR_MOBILE"],
        }

    def analyze_website(self, url):
        """Analyze website for conversion issues"""
        if not url or not isinstance(url, str):
            return {
                "has_click_to_call": False,
                "has_sticky_cta": False,
                "has_weak_headline": True,
                "has_poor_mobile": True,
                "score_breakdown": {},
                "issues": ["No valid URL provided"],
            }

        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15"
            }

            response = self.session.get(url, timeout=15, headers=headers)
            html = response.text

            analysis = {
                "has_click_to_call": self._check_click_to_call(html, url),
                "has_sticky_cta": self._check_sticky_cta(html),
                "has_weak_headline": self._check_weak_headline(html),
                "has_poor_mobile": self._check_poor_mobile(response.headers, html),
                "score_breakdown": {},
                "issues": [],
            }

            analysis["score_breakdown"] = {
                "no_click_to_call": 0
                if analysis["has_click_to_call"]
                else self.scoring_weights["no_click_to_call"],
                "no_sticky_cta": 0
                if analysis["has_sticky_cta"]
                else self.scoring_weights["no_sticky_cta"],
                "weak_headline": 0
                if analysis["has_weak_headline"]
                else self.scoring_weights["weak_headline"],
                "poor_mobile": 0
                if analysis["has_poor_mobile"]
                else self.scoring_weights["poor_mobile"],
            }

            for key, value in analysis["score_breakdown"].items():
                if value > 0:
                    issue_text = {
                        "no_click_to_call": "Missing click-to-call button",
                        "no_sticky_cta": "No sticky call-to-action",
                        "weak_headline": "Weak or missing headline",
                        "poor_mobile": "Poor mobile optimization",
                    }
                    analysis["issues"].append(issue_text.get(key, key))

            return analysis

        except Exception as e:
            return {
                "has_click_to_call": False,
                "has_sticky_cta": False,
                "has_weak_headline": True,
                "has_poor_mobile": True,
                "score_breakdown": {},
                "issues": [f"Analysis error: {str(e)}"],
            }

    def _check_click_to_call(self, html, url):
        """Check if website has click-to-call functionality"""
        patterns = [
            r"tel:",
            r"callto:",
            r'href="tel:',
            r"href='tel:",
            r"data-call",
            r'class="call',
            r'"phone".*?(?:href|link)',
        ]

        for pattern in patterns:
            if re.search(pattern, html, re.IGNORECASE):
                return True

        phone_patterns = [
            r"\(\d{3}\)\s*\d{3}[-.\s]?\d{4}",
            r"\d{3}[-.\s]\d{3}[-.\s]\d{4}",
        ]

        for pattern in phone_patterns:
            matches = re.findall(pattern, html)
            for match in matches:
                tel_pattern = rf'href=["\']?tel:{re.escape(match)}'
                if re.search(tel_pattern, html, re.IGNORECASE):
                    return True

        return False

    def _check_sticky_cta(self, html):
        """Check if website has a sticky CTA"""
        patterns = [
            r"position:\s*fixed",
            r"position:\s*sticky",
            r'class=".*?sticky.*?"',
            r'id=".*?sticky.*?"',
            r"data-sticky",
            r"\.sticky\s*\{",
            r'class=".*?cta.*?"',
            r'class=".*?call.*?now.*?"',
            r'id=".*?cta.*?"',
        ]

        for pattern in patterns:
            if re.search(pattern, html, re.IGNORECASE):
                return True

        return False

    def _check_weak_headline(self, html):
        """Check if headline is weak or missing"""
        soup = BeautifulSoup(html, "html.parser")

        h1_tags = soup.find_all("h1")
        if not h1_tags:
            return True

        for h1 in h1_tags:
            text = h1.get_text(strip=True)
            if len(text) < 5:
                return True

            weak_phrases = [
                "welcome",
                "home",
                "coming soon",
                "under construction",
                "placeholder",
                "default",
                "sample",
            ]

            text_lower = text.lower()
            if any(phrase in text_lower for phrase in weak_phrases):
                return True

        return False

    def _check_poor_mobile(self, headers, html):
        """Check if website has poor mobile performance"""
        if "viewport" not in html.lower():
            return True

        viewport_pattern = r'meta[^>]*name=["\']viewport["\'][^>]*content=["\'][^"\']*width=device-width'
        if not re.search(viewport_pattern, html, re.IGNORECASE):
            return True

        if "mobile-friendly" in html.lower() or "mobile optimized" in html.lower():
            return False

        style_tags = re.findall(
            r"<style[^>]*>(.*?)</style>", html, re.DOTALL | re.IGNORECASE
        )
        for style in style_tags:
            if "@media" in style and "(max-width" in style:
                return False

        return True

    def score_lead(self, lead):
        """Calculate total score for a lead"""
        url = lead.get("website")

        analysis = self.analyze_website(url)

        total_score = sum(analysis["score_breakdown"].values())

        google_rating = lead.get("google_rating") or lead.get("rating")
        if google_rating and 4.3 <= float(google_rating) <= 4.6:
            total_score += 15
            analysis["score_breakdown"]["ideal_rating"] = 15
        elif google_rating:
            analysis["score_breakdown"]["ideal_rating"] = 0

        return {
            **lead,
            "lead_score": min(100, total_score),
            "score_breakdown": analysis["score_breakdown"],
            "issues": analysis["issues"],
            "analysis_data": json.dumps(analysis),
            "has_click_to_call": analysis["has_click_to_call"],
            "has_sticky_cta": analysis["has_sticky_cta"],
            "has_weak_headline": analysis["has_weak_headline"],
            "has_poor_mobile": analysis["has_poor_mobile"],
        }

    def process_leads_file(self, input_path, output_path=None):
        """Process leads from a JSON file"""
        if output_path is None:
            input_path = Path(input_path)
            output_path = (
                input_path.parent / f"{input_path.stem}_scored{input_path.suffix}"
            )

        with open(input_path, "r", encoding="utf-8") as f:
            leads = json.load(f)

        scored_leads = []

        for i, lead in enumerate(leads, 1):
            print(
                f"  [{i}/{len(leads)}] Scoring: {lead.get('business_name', 'Unknown')[:40]}..."
            )

            scored = self.score_lead(lead)
            scored_leads.append(scored)

            time.sleep(0.5)

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(scored_leads, f, indent=2, ensure_ascii=False)

        print(f"\n[OK] Scored {len(scored_leads)} leads")
        print(f"   Output: {output_path}")

        stats = self.get_score_stats(scored_leads)
        print(f"\n[*] Score Distribution:")
        for range_name, count in stats.items():
            print(f"   {range_name}: {count}")

        return scored_leads, stats

    def get_score_stats(self, leads):
        """Get statistics about lead scores"""
        stats = {
            "80-100 (Excellent)": 0,
            "60-79 (Good)": 0,
            "40-59 (Average)": 0,
            "20-39 (Below Average)": 0,
            "0-19 (Poor)": 0,
        }

        for lead in leads:
            score = lead.get("lead_score", 0)

            if score >= 80:
                stats["80-100 (Excellent)"] += 1
            elif score >= 60:
                stats["60-79 (Good)"] += 1
            elif score >= 40:
                stats["40-59 (Average)"] += 1
            elif score >= 20:
                stats["20-39 (Below Average)"] += 1
            else:
                stats["0-19 (Poor)"] += 1

        return stats

    def close(self):
        """Close HTTP session"""
        self.session.close()


def run_scoring():
    """Run scoring for all discovered leads"""
    input_dir = Path(__file__).parent.parent / PATHS["OUTPUT"]
    scorer = LeadScorer()

    all_stats = {}

    for city_name in TARGET_CITIES.keys():
        city_safe = city_name.replace(" ", "_")
        input_path = input_dir / f"leads_{city_safe}.json"

        if not input_path.exists():
            print(f"\n[!] No leads file found for {city_name}")
            print(f"   Run Phase 1 first to discover leads")
            continue

        print(f"\n{'=' * 60}")
        print(f"[*] SCORING: {city_name}")
        print(f"{'=' * 60}")

        try:
            leads, stats = scorer.process_leads_file(input_path)
            all_stats[city_name] = stats

        except Exception as e:
            print(f"\n[!] Error scoring {city_name}: {e}")
            continue

        time.sleep(2)

    scorer.close()

    print(f"\n{'=' * 60}")
    print(f"[OK] SCORING COMPLETE")
    print(f"{'=' * 60}")

    return all_stats


if __name__ == "__main__":
    print("[*] Starting Lead Scoring - Phase 2")
    print("=" * 60)

    stats = run_scoring()

    print("\n[OK] Phase 2 complete!")
    print(f"   Next step: Run Phase 3 to prioritize top leads")
