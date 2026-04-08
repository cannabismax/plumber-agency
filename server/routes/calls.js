import express from "express";
import { queryDB } from "../server.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { leadId, type } = req.query;
  
  let query = "SELECT * FROM Calls WHERE 1=1";
  const params = {};
  
  if (leadId) {
    query += " AND LeadID = @leadId";
    params.leadId = parseInt(leadId);
  }
  if (type) {
    query += " AND CallType = @type";
    params.type = type;
  }
  
  query += " ORDER BY CreatedAt DESC";
  
  const result = await queryDB(query, params);
  res.json(result.success ? result.data : []);
});

router.post("/", async (req, res) => {
  const { LeadID, CallType, PhoneNumber, Outcome, Result, Summary } = req.body;
  
  const result = await queryDB(`
    INSERT INTO Calls (LeadID, CallType, PhoneNumber, Outcome, Result, Summary, StartedAt)
    VALUES (@LeadID, @CallType, @PhoneNumber, @Outcome, @Result, @Summary, GETDATE())
  `, { LeadID: parseInt(LeadID), CallType, PhoneNumber, Outcome, Result, Summary });
  
  res.json({ success: result.success, error: result.error });
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
    `UPDATE Calls SET ${setClauses} WHERE CallID = @id`,
    params
  );
  
  res.json({ success: result.success });
});

router.post("/:id/end", async (req, res) => {
  const { id } = req.params;
  const { Outcome, Result, DurationSeconds, Summary } = req.body;
  
  const result = await queryDB(`
    UPDATE Calls SET 
      Outcome = @Outcome,
      Result = @Result,
      DurationSeconds = @DurationSeconds,
      Summary = @Summary,
      EndedAt = GETDATE()
    WHERE CallID = @id
  `, { Outcome, Result, DurationSeconds, id: parseInt(id), Summary });
  
  res.json({ success: result.success });
});

export default router;
