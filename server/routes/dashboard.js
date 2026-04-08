import express from "express";
import { queryDB } from "../server.js";

const router = express.Router();

router.get("/metrics", async (req, res) => {
  const result = await queryDB(`
    SELECT 
      COUNT(*) as total_leads,
      SUM(CASE WHEN Status = 'PRIORITY' THEN 1 ELSE 0 END) as priority_leads,
      SUM(CASE WHEN Status = 'CONTACTED' THEN 1 ELSE 0 END) as contacted_leads,
      SUM(CASE WHEN Status = 'RESPONDED' THEN 1 ELSE 0 END) as responded_leads,
      SUM(CASE WHEN Status = 'INTERESTED' THEN 1 ELSE 0 END) as interested_leads,
      SUM(CASE WHEN Status = 'CLOSED' THEN 1 ELSE 0 END) as closed_leads,
      AVG(LeadScore) as avg_score,
      MAX(LeadScore) as max_score
    FROM Leads
  `);
  
  if (result.success) {
    const metrics = result.data[0];
    const conversionRate = metrics.priority_leads > 0 
      ? ((metrics.closed_leads / metrics.priority_leads) * 100).toFixed(1)
      : 0;
    
    res.json({
      ...metrics,
      conversionRate,
      projectedRevenueLow: metrics.priority_leads * 100,
      projectedRevenueMed: metrics.priority_leads * 300,
      projectedRevenueHigh: metrics.priority_leads * 800,
      closedRevenue: metrics.closed_leads * 300
    });
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
      SUM(CASE WHEN Status = 'CONTACTED' THEN 1 ELSE 0 END) as contacted,
      SUM(CASE WHEN Status = 'CLOSED' THEN 1 ELSE 0 END) as closed,
      AVG(LeadScore) as avg_score,
      MAX(LeadScore) as max_score,
      MIN(LeadScore) as min_score
    FROM Leads
    GROUP BY City
    ORDER BY total_leads DESC
  `);
  
  res.json(result.success ? result.data : []);
});

router.get("/by-status", async (req, res) => {
  const result = await queryDB(`
    SELECT 
      Status,
      COUNT(*) as count,
      AVG(LeadScore) as avg_score
    FROM Leads
    GROUP BY Status
    ORDER BY count DESC
  `);
  
  res.json(result.success ? result.data : []);
});

router.get("/score-distribution", async (req, res) => {
  const result = await queryDB(`
    SELECT 
      CASE 
        WHEN LeadScore >= 80 THEN '80-100'
        WHEN LeadScore >= 60 THEN '60-79'
        WHEN LeadScore >= 40 THEN '40-59'
        WHEN LeadScore >= 20 THEN '20-39'
        ELSE '0-19'
      END as score_range,
      COUNT(*) as count
    FROM Leads
    GROUP BY 
      CASE 
        WHEN LeadScore >= 80 THEN '80-100'
        WHEN LeadScore >= 60 THEN '60-79'
        WHEN LeadScore >= 40 THEN '40-59'
        WHEN LeadScore >= 20 THEN '20-39'
        ELSE '0-19'
      END
    ORDER BY score_range DESC
  `);
  
  res.json(result.success ? result.data : []);
});

export default router;
