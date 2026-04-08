import express from "express";
import cors from "cors";
import sql from "mssql";
import dotenv from "dotenv";
import leadsRouter from "./routes/leads.js";
import revenueRouter from "./routes/revenue.js";
import activitiesRouter from "./routes/activities.js";
import callsRouter from "./routes/calls.js";
import appointmentsRouter from "./routes/appointments.js";
import dashboardRouter from "./routes/dashboard.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  user: process.env.PLUMBER_DB_USER || "sa",
  password: process.env.PLUMBER_DB_PASSWORD || "",
  server: process.env.PLUMBER_DB_SERVER || "localhost",
  database: process.env.PLUMBER_DB_DATABASE || "PlumbingAgency",
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

export async function queryDB(query, params = {}) {
  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();
    
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
    
    const result = await request.query(query);
    return { success: true, data: result.recordset, rowCount: result.rowsAffected[0] };
  } catch (error) {
    console.error("Database error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function executeDB(storedProcedure, params = {}) {
  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();
    
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
    
    const result = await request.execute(storedProcedure);
    return { success: true, data: result.recordset, rowCount: result.rowsAffected[0] };
  } catch (error) {
    console.error("Database error:", error.message);
    return { success: false, error: error.message };
  }
}

app.use("/api/leads", leadsRouter);
app.use("/api/revenue", revenueRouter);
app.use("/api/activities", activitiesRouter);
app.use("/api/calls", callsRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/dashboard", dashboardRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Plumbing Agency Server running on port ${PORT}`);
});
