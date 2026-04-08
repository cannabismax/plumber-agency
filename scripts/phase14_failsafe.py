#!/usr/bin/env python3`n`nimport os, sys; os.environ["PYTHONIOENCODING"] = "utf-8"; sys.stdout.reconfigure(encoding="utf-8", errors="replace") if sys.stdout.encoding != "utf-8" else None
"""
Phase 14: Failsafe + Control
Error handling and safety checks.
"""

import os
import sys
import time
import random
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))


class Failsafe:
    CAPTCHA_DETECTED = "captcha"
    SQL_ERROR = "sql_error"
    CITY_FAILURE = "city_failure"
    RATE_LIMIT = "rate_limit"
    NETWORK_ERROR = "network_error"

    @staticmethod
    def handle_error(error_type, context=None, action="continue"):
        """
        Handle errors based on type.

        CAPTCHA → sleep 600s
        SQL ERROR → STOP
        City failure → skip city, continue
        """
        print(f"\n⚠️  Error: {error_type}")

        if context:
            print(f"   Context: {context}")

        if error_type == Failsafe.CAPTCHA_DETECTED:
            print("   Action: Sleeping 10 minutes before retry...")
            time.sleep(600)
            return "retry"

        elif error_type == Failsafe.SQL_ERROR:
            print("   Action: STOPPING - Database error")
            return "stop"

        elif error_type == Failsafe.CITY_FAILURE:
            print("   Action: Skipping city, continuing to next...")
            return "skip"

        elif error_type == Failsafe.RATE_LIMIT:
            print("   Action: Waiting 60 seconds...")
            time.sleep(60)
            return "retry"

        elif error_type == Failsafe.NETWORK_ERROR:
            print("   Action: Waiting 30 seconds...")
            time.sleep(30)
            return "retry"

        return action

    @staticmethod
    def check_health():
        """Run health checks."""
        checks = {
            "output_dir": Path(__file__).parent.parent / "output",
            "config_dir": Path(__file__).parent.parent / "config",
        }

        all_ok = True
        for name, path in checks.items():
            if not path.exists():
                print(f"❌ Missing: {name} ({path})")
                all_ok = False

        if all_ok:
            print("✅ Health check passed")

        return all_ok


def run_failsafe_tests():
    """Test the failsafe system."""
    print("🚀 Phase 14: Failsafe + Control Tests")
    print("=" * 60)

    failsafe = Failsafe()

    print("\n📋 Health Check:")
    failsafe.check_health()

    print("\n📋 Error Handling Tests:")

    test_cases = [
        (Failsafe.CAPTCHA_DETECTED, "Google search blocked"),
        (Failsafe.RATE_LIMIT, "Too many requests"),
        (Failsafe.NETWORK_ERROR, "Connection timeout"),
    ]

    for error_type, context in test_cases:
        print(f"\n   Testing {error_type}...")
        result = failsafe.handle_error(error_type, context)
        print(f"   Result: {result}")

    print(f"\n✅ Failsafe system ready")
    print("=" * 60)


if __name__ == "__main__":
    run_failsafe_tests()
