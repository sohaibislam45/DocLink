import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import mongoose from "mongoose";
import fetch from "node-fetch";
import { Patient } from "./patients.js";

const router = express.Router();

// ── Room Schema ──────────────────────────────────────────────────────────────
const roomSchema = new mongoose.Schema({
  roomName: { type: String, required: true, unique: true },
  roomUrl: { type: String, required: true },
  doctorId: { type: String, required: true },
  patientUid: { type: String, required: true },
  status: {
    type: String,
    enum: ["created", "active", "ended"],
    default: "created"
  },
  createdAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
});

const Room = mongoose.model("Room", roomSchema);

// ── Create Room ──────────────────────────────────────────────────────────────
// Called by doctor when they click "Start Call" / "Call Next Patient"
// POST /api/rooms/create
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { doctorId, patientUid } = req.body;

    // Generate unique room name
    const roomName = `doclink-${doctorId}-${Date.now()}`;
    const roomUrl = `https://meet.jit.si/${roomName}`;

    // Save room to MongoDB
    const room = await Room.create({
      roomName,
      roomUrl,
      doctorId,
      patientUid,
    });

    res.json({ roomId: room._id, roomName: room.roomName, roomUrl: room.roomUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Generate Meeting Token ───────────────────────────────────────────────────
// Called by both doctor and patient before joining the room
// POST /api/rooms/token
router.post("/token", verifyToken, async (req, res) => {
  // Jitsi Meet public servers don't require tokens for our use-case.
  // We simply return a dummy token to keep frontend compatibility if needed, 
  // though we will remove the token requirement on the frontend.
  res.json({ token: "jitsi-dummy-token" });
});

// ── Get Room by ID ───────────────────────────────────────────────────────────
// GET /api/rooms/:roomId
router.get("/:roomId", verifyToken, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });
    
    const patient = await Patient.findOne({ uid: room.patientUid });
    const roomObj = room.toObject();
    roomObj.patientName = patient ? patient.name : "Patient";
    
    res.json(roomObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── End Room ─────────────────────────────────────────────────────────────────
// Called by doctor when they end the call
// PATCH /api/rooms/:roomId/end
router.patch("/:roomId/end", verifyToken, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.roomId,
      { status: "ended", endedAt: new Date() },
      { new: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
