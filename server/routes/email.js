import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

router.post("/send", async (req, res) => {
  const { to, subject, body, leadId } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing required fields: to, subject, body" 
    });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(500).json({ 
      success: false, 
      error: "SMTP not configured. Set SMTP_USER and SMTP_PASS in .env" 
    });
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: body,
      html: body.replace(/\n/g, "<br>"),
    });

    console.log(`Email sent to ${to} for lead ${leadId}`);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/test", async (req, res) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(500).json({ 
      success: false, 
      error: "SMTP not configured" 
    });
  }

  try {
    await transporter.verify();
    res.json({ success: true, message: "SMTP connection verified" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
