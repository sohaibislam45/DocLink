import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db/connect.js";
import doctorRoutes from "./routes/doctors.js";
import patientRoutes from "./routes/patients.js";
import consultationRoutes from "./routes/consultations.js";
import prescriptionRoutes from "./routes/prescriptions.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", service: "DocLink API" }));

// Routes
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`DocLink API running on port ${PORT}`));
});
