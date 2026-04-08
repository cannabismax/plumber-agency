import express from "express";
import { queryDB } from "../server.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { leadId, type } = req.query;
  
  let query = "SELECT * FROM Activities WHERE 1=1";
  const params = {};
  
  if (leadId) {
    query += " AND LeadID = @leadId";
    params.leadId = parseInt(leadId);
  }
  if (type) {
    query += " AND ActivityType = @type";
    params.type = type;
  }
  
  query += " ORDER BY CreatedAt DESC";
  
  const result = await queryDB(query, params);
  res.json(result.success ? result.data : []);
});

router.post("/", async (req, res) => {
  const { LeadID, ActivityType, Subject, Body, TemplateUsed, Status = 'PENDING' } = req.body;
  
  const result = await queryDB(`
    INSERT INTO Activities (LeadID, ActivityType, Subject, Body, TemplateUsed, Status)
    VALUES (@LeadID, @ActivityType, @Subject, @Body, @TemplateUsed, @Status)
  `, { LeadID: parseInt(LeadID), ActivityType, Subject, Body, TemplateUsed, Status });
  
  res.json({ success: result.success, error: result.error });
});

router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const timestampField = {
    "SENT": "SentAt",
    "DELIVERED": "DeliveredAt",
    "OPENED": "OpenedAt",
    "CLICKED": "ClickedAt"
  };
  
  const updatePart = timestampField[status] 
    ? `, ${timestampField[status]} = GETDATE()` 
    : "";
  
  const result = await queryDB(
    `UPDATE Activities SET Status = @status ${updatePart} WHERE ActivityID = @id`,
    { status, id: parseInt(id) }
  );
  
  res.json({ success: result.success });
});

export default router;
