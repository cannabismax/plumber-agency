#!/usr/bin/env python3
"""
Run All Phases
Executes all phases in sequence.
"""

import os
import sys
import subprocess
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent


def run_phase(phase_num, phase_name):
    """Run a single phase script."""
    print(f"\n{'=' * 60}")
    print(f"PHASE {phase_num}: {phase_name}")
    print("=" * 60)

    script_path = (
        SCRIPT_DIR / f"phase{phase_num}_{phase_name.lower().replace(' ', '_')}.py"
    )

    if not script_path.exists():
        print(f"⚠️  Script not found: {script_path}")
        return False

    try:
        result = subprocess.run(
            [sys.executable, str(script_path)], cwd=str(SCRIPT_DIR.parent), check=False
        )
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error running phase: {e}")
        return False


def main():
    """Run all phases."""
    print("🚀 PLUMBING AGENCY - RUN ALL PHASES")
    print("=" * 60)

    phases = [
        (1, "Discovery"),
        (2, "Scoring"),
        (3, "Prioritization"),
        (4, "Demo Generator"),
        (5, "Assets"),
        (6, "Outreach"),
        (7, "Pricing"),
        (8, "CRM"),
        (9, "AI Trigger"),
        (10, "Booking"),
        (11, "Reports"),
        (12, "Dashboard"),
        (13, "Revenue"),
        (14, "Failsafe"),
    ]

    results = {}

    for num, name in phases:
        success = run_phase(num, name)
        results[num] = success

        if not success:
            print(f"\n⚠️  Phase {num} had issues, continuing...")

    print(f"\n{'=' * 60}")
    print("EXECUTION COMPLETE")
    print("=" * 60)

    for num, success in results.items():
        status = "✅" if success else "❌"
        print(f"  Phase {num}: {status}")

    print(f"\nOutput files: {SCRIPT_DIR.parent / 'output'}")
    print(
        "Dashboards: " + str(SCRIPT_DIR.parent / "dashboard" / "global" / "index.html")
    )


if __name__ == "__main__":
    main()
