import express from "express";
import { queryDB } from "../server.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const result = await queryDB(`
    SELECT 
      COUNT(*) as total_leads,
      SUM(CASE WHEN Status = 'PRIORITY' THEN 1 ELSE 0 END) as priority_leads,
      SUM(CASE WHEN Status = 'CONTACTED' THEN 1 ELSE 0 END) as contacted_leads,
      SUM(CASE WHEN Status = 'RESPONDED' THEN 1 ELSE 0 END) as responded_leads,
      SUM(CASE WHEN Status = 'INTERESTED' THEN 1 ELSE 0 END) as interested_leads,
      SUM(CASE WHEN Status = 'CLOSED' THEN 1 ELSE 0 END) as closed_leads,
      SUM(CASE WHEN Status = 'BACKLOG' THEN 1 ELSE 0 END) as backlog_leads
    FROM Leads
  `);
  
  if (result.success) {
    const metrics = result.data[0];
    const revenue = {
      projected_low: metrics.priority_leads * 100,
      projected_med: metrics.priority_leads * 300,
      projected_high: metrics.priority_leads * 800,
      closed: metrics.closed_leads * 300
    };
    res.json({ ...metrics, ...revenue });
  } else {
    res.status(500).json({ error: result.error });
  }
});

router.get("/by-city", async (req, res) => {
  const result = await queryDB(`
    SELECT 
      City,
      COUNT(*) as total_leads,
      SUM(CASE WHEN Status = 'PRIORITY' THEN 1 ELSE 0 END) as priority_leads,
      SUM(CASE WHEN Status = 'CLOSED' THEN 1 ELSE 0 END) as closed_leads,
      AVG(LeadScore) as avg_score,
      MAX(LeadScore) as max_score
    FROM Leads
    GROUP BY City
    ORDER BY total_leads DESC
  `);
  
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(500).json({ error: result.error });
  }
});

router.post("/close", async (req, res) => {
  const { leadId, dealValue = 300 } = req.body;
  
  const updateLead = await queryDB(
    "UPDATE Leads SET Status = 'CLOSED', ClosedAt = GETDATE() WHERE LeadID = @leadId",
    { leadId: parseInt(leadId) }
  );
  
  if (!updateLead.success) {
    return res.status(500).json({ error: updateLead.error });
  }
  
  const insertRevenue = await queryDB(`
    INSERT INTO Revenue (LeadID, DealValue, Stage, PaymentStatus, PaidAt)
    VALUES (@leadId, @dealValue, 'CLOSED_WON', 'PAID', GETDATE())
  `, { leadId: parseInt(leadId), dealValue });
  
  res.json({ success: true, dealValue });
});

export default router;
