import json
from pathlib import Path

output_dir = Path(__file__).parent.parent / "output"
sql_lines = []

sql_lines.append("USE PlumbingAgency;")
sql_lines.append("GO")
sql_lines.append("")

for city_file in output_dir.glob("leads_*_prioritized.json"):
    with open(city_file, encoding="utf-8") as f:
        data = json.load(f)

    for lead in data.get("priority", []):
        business = (lead.get("business_name") or "").replace("'", "''")
        website = (lead.get("website") or "").replace("'", "''")
        phone = (lead.get("phone") or "NULL").replace("'", "''")
        email = (lead.get("email") or "NULL").replace("'", "''")
        address = (lead.get("address") or "NULL").replace("'", "''")
        city = (lead.get("city") or "").replace("'", "''")
        state = (lead.get("state") or "NULL").replace("'", "''")
        services = (lead.get("services") or "NULL").replace("'", "''")
        score = lead.get("lead_score", 0)
        status = lead.get("status", "PRIORITY")
        has_ctc = 1 if lead.get("has_click_to_call") else 0
        has_sticky = 1 if lead.get("has_sticky_cta") else 0
        has_weak = 1 if lead.get("has_weak_headline") else 0
        has_poor = 1 if lead.get("has_poor_mobile") else 0

        sql = f"""INSERT INTO Leads (BusinessName, Website, Phone, Email, Address, City, State, Services, LeadScore, Status, HasClickToCall, HasStickyCTA, HasWeakHeadline, HasPoorMobile, CreatedAt, UpdatedAt, AuditedAt)
VALUES ('{business}', '{website}', '{phone}', '{email}', '{address}', '{city}', '{state}', '{services}', {score}, '{status}', {has_ctc}, {has_sticky}, {has_weak}, {has_poor}, GETDATE(), GETDATE(), GETDATE());"""
        sql_lines.append(sql)

output_path = output_dir.parent / "database" / "import_leads.sql"
with open(output_path, "w", encoding="utf-8") as f:
    f.write("\nGO\n".join([""]) + "\n".join(sql_lines))

print(f"Generated {len(sql_lines)} INSERT statements")
print(f"Output: {output_path}")
