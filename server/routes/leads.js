import express from "express";
import { queryDB, executeDB } from "../server.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { city, status, limit = 100, offset = 0 } = req.query;
  
  let query = "SELECT * FROM Leads WHERE 1=1";
  const params = {};
  
  if (city) {
    query += " AND City = @city";
    params.city = city;
  }
  if (status) {
    query += " AND Status = @status";
    params.status = status;
  }
  
  query += " ORDER BY LeadScore DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY";
  params.limit = parseInt(limit);
  params.offset = parseInt(offset);
  
  const result = await queryDB(query, params);
  
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(500).json({ error: result.error });
  }
});

router.get("/:id", async (req, res) => {
  const result = await queryDB(
    "SELECT * FROM Leads WHERE LeadID = @id",
    { id: parseInt(req.params.id) }
  );
  
  if (result.success && result.data.length > 0) {
    res.json(result.data[0]);
  } else {
    res.status(404).json({ error: "Lead not found" });
  }
});

router.post("/", async (req, res) => {
  const { 
    businessName, website, phone, email, city, state, 
    services, status, googleRating 
  } = req.body;
  
  const result = await executeDB("sp_InsertLead", {
    BusinessName: businessName,
    Website: website,
    Phone: phone,
    Email: email,
    City: city,
    State: state,
    GoogleRating: googleRating,
    Services: services,
    Status: status || "DISCOVERED"
  });
  
  if (result.success) {
    res.json({ success: true, id: result.data[0]?.LeadID });
  } else {
    res.status(500).json({ error: result.error });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  
  const setClauses = Object.keys(fields)
    .map((key, i) => `${key} = @p${i}`)
    .join(", ");
  
  const params = {};
  Object.keys(fields).forEach((key, i) => {
    params[`p${i}`] = fields[key];
  });
  params.id = parseInt(id);
  
  const result = await queryDB(
    `UPDATE Leads SET ${setClauses}, UpdatedAt = GETDATE() WHERE LeadID = @id`,
    params
  );
  
  res.json({ success: result.success });
});

router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const timestampField = {
    "AUDITED": "AuditedAt",
    "CONTACTED": "ContactedAt",
    "RESPONDED": "RespondedAt",
    "INTERESTED": "InterestedAt",
    "CLOSED": "ClosedAt"
  };
  
  const timestampSet = timestampField[status] ? `${timestampField[status]} = GETDATE()` : "";
  
  const result = await queryDB(
    `UPDATE Leads SET Status = @status ${timestampSet ? `, ${timestampSet}` : ""}, UpdatedAt = GETDATE() WHERE LeadID = @id`,
    { status, id: parseInt(id) }
  );
  
  res.json({ success: result.success });
});

router.delete("/:id", async (req, res) => {
  const result = await queryDB(
    "DELETE FROM Leads WHERE LeadID = @id",
    { id: parseInt(req.params.id) }
  );
  
  res.json({ success: result.success });
});

router.post("/bulk", async (req, res) => {
  const { leads } = req.body;
  const results = [];
  
  for (const lead of leads) {
    const result = await executeDB("sp_InsertLead", lead);
    results.push({ lead: lead.BusinessName, success: result.success });
  }
  
  res.json({ results });
});

export default router;
