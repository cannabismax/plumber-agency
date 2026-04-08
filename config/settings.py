TARGET_NICHE = "Plumbing"

OUTREACH_MODE = {
    "MODE": "MANUAL",  # Options: "MANUAL" or "AUTO"
    "AUTO_ENABLED": False,  # Set True to enable automatic sending
    "MANUAL_INSTRUCTIONS": True,  # Always True - generates templates and instructions
    "EMAIL_PROVIDER": "gmail",  # Options: "gmail", "sendgrid"
}

TARGET_CITIES = {
    "Tucson": {"state": "AZ", "zip": "85730"},
    "Phoenix": {"state": "AZ", "zip": ""},
    "Dallas": {"state": "TX", "zip": ""},
    "Tampa": {"state": "FL", "zip": ""},
    "Las Vegas": {"state": "NV", "zip": ""},
}

LIMITS = {
    "MAX_EMAILS_TOTAL": 50,
    "MAX_SMS_TOTAL": 30,
    "MAX_EMAILS_PER_CITY": 15,
    "MAX_TOP_LEADS_PER_CITY": 10,
}

PATHS = {
    "ASSETS": "outreach_assets",
    "DASHBOARDS": "dashboard",
    "DEMO_SITES": "demo_sites",
    "REPORTS": "reports",
    "OUTPUT": "output",
}

DATABASE = {
    "server": "localhost",
    "database": "PlumbingAgency",
    "user": "sa",
    "password": "",  # Set via environment variable PLUMBER_DB_PASSWORD
    "encrypt": False,
    "trustServerCertificate": True,
}

LEAD_SCORING = {
    "NO_CLICK_TO_CALL": 30,
    "NO_STICKY_CTA": 25,
    "WEAK_HEADLINE": 20,
    "RATING_IDEAL": 15,
    "POOR_MOBILE": 10,
}

REVENUE_TIERS = {"LOW": 100, "MEDIUM": 300, "HIGH": 800}

OUTREACH_TEMPLATES = {
    "email": {
        "subject": "Quick fix for your website - more emergency calls",
        "body": "Noticed your site is losing emergency calls. I rebuilt your homepage to show a fix: {demo_link}",
    },
    "sms": {
        "message": "Quick fix for your website—this could bring more emergency calls: {link}"
    },
}

STRIPE_PRICING = {
    "entry": {
        "price_id": "price_entry",
        "amount": 99,
        "name": "Conversion Fix Implementation - Entry",
    },
    "standard": {
        "price_id": "price_standard",
        "amount": 299,
        "name": "Conversion Fix Implementation - Standard",
    },
    "full": {
        "price_id": "price_full",
        "amount": 799,
        "name": "Conversion Fix Implementation - Full Rebuild",
    },
}

CRM_STATUSES = [
    "AUDITED",
    "PRIORITY",
    "CONTACTED",
    "RESPONDED",
    "INTERESTED",
    "CLOSED",
    "LOST",
]
