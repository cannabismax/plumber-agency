#!/usr/bin/env python3`n`nimport os, sys; os.environ["PYTHONIOENCODING"] = "utf-8"; sys.stdout.reconfigure(encoding="utf-8", errors="replace") if sys.stdout.encoding != "utf-8" else None
"""
Phase 7: Stripe Offer Layer
Generates payment links for service tiers.
"""

import os
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import PATHS, STRIPE_PRICING


def generate_pricing():
    """
    Generates pricing information and placeholder Stripe links.
    Note: Actual Stripe links require API integration.
    """
    print("🚀 Phase 7: Stripe Offer Layer")
    print("=" * 60)

    output_dir = Path(__file__).parent.parent / PATHS["OUTPUT"]
    output_dir.mkdir(parents=True, exist_ok=True)

    pricing = {
        "tiers": STRIPE_PRICING,
        "notes": {
            "entry": "Quick fix for single conversion issue (click-to-call, sticky CTA, etc.)",
            "standard": "Full conversion audit with implementation of top 5 fixes",
            "full": "Complete website rebuild optimized for emergency plumbing calls",
        },
        "stripe_setup_needed": True,
        "placeholder_links": {
            "entry": "https://buy.stripe.com/placeholder_entry",
            "standard": "https://buy.stripe.com/placeholder_standard",
            "full": "https://buy.stripe.com/placeholder_full",
        },
        "setup_instructions": [
            "1. Create Stripe account at stripe.com",
            "2. Create products in Stripe Dashboard",
            "3. Get price IDs and update config/settings.py",
            "4. Use Stripe Checkout for payment links",
        ],
    }

    output_path = output_dir / "pricing.json"
    with open(output_path, "w") as f:
        json.dump(pricing, f, indent=2)

    print("\n📦 Pricing Tiers:")
    for tier, info in STRIPE_PRICING.items():
        print(f"\n   {tier.upper()}: ${info['amount']}")
        print(f"   {info['name']}")

    print(f"\n✅ Pricing generated: {output_path}")
    print("\n⚠️  Note: Update Stripe links with real price IDs")
    print("=" * 60)

    return pricing


if __name__ == "__main__":
    generate_pricing()
