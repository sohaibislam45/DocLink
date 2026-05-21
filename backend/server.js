import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./db/connect.js";
import { initSocket } from "./socket/index.js";

import doctorRoutes from "./routes/doctors.js";
import patientRoutes from "./routes/patients.js";
import consultationRoutes from "./routes/consultations.js";
import prescriptionRoutes from "./routes/prescriptions.js";
import specialtyRoutes from "./routes/specialties.js";
import testimonialRoutes from "./routes/testimonials.js";
import categoryRoutes from "./routes/categories.js";
import queueRoutes from "./routes/queues.js";
import roomRoutes from "./routes/rooms.js";
import paymentRoutes, { handleWebhook } from "./routes/payments.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);

let _io = null;

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
_io = io;

initSocket(io);

export const getIO = () => _io;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));

// Stripe webhook requires raw body for signature verification - must be BEFORE express.json()
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", service: "DocLink API" }));

// Routes
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/specialties", specialtyRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);


// 404 handler
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  httpServer.listen(PORT, () => console.log(`DocLink server running on port ${PORT}`));
});

