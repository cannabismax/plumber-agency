import express from "express";
import { queryDB } from "../server.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { leadId, status } = req.query;
  
  let query = "SELECT * FROM Appointments WHERE 1=1";
  const params = {};
  
  if (leadId) {
    query += " AND LeadID = @leadId";
    params.leadId = parseInt(leadId);
  }
  if (status) {
    query += " AND Status = @status";
    params.status = status;
  }
  
  query += " ORDER BY ScheduledDateTime ASC";
  
  const result = await queryDB(query, params);
  res.json(result.success ? result.data : []);
});

router.post("/", async (req, res) => {
  const { LeadID, CallID, ScheduledDateTime, DurationMinutes = 15, MeetingType = 'VIDEO', BookingLink } = req.body;
  
  const result = await queryDB(`
    INSERT INTO Appointments (LeadID, CallID, ScheduledDateTime, DurationMinutes, MeetingType, BookingLink)
    VALUES (@LeadID, @CallID, @ScheduledDateTime, @DurationMinutes, @MeetingType, @BookingLink)
  `, { 
    LeadID: parseInt(LeadID), 
    CallID: CallID ? parseInt(CallID) : null, 
    ScheduledDateTime: new Date(ScheduledDateTime), 
    DurationMinutes, 
    MeetingType, 
    BookingLink 
  });
  
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
    `UPDATE Appointments SET ${setClauses}, UpdatedAt = GETDATE() WHERE AppointmentID = @id`,
    params
  );
  
  res.json({ success: result.success });
});

router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const result = await queryDB(
    "UPDATE Appointments SET Status = @status, UpdatedAt = GETDATE() WHERE AppointmentID = @id",
    { status, id: parseInt(id) }
  );
  
  res.json({ success: result.success });
});

export default router;
