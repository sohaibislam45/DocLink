import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import mongoose from "mongoose";
import fetch from "node-fetch";

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

    // Create room via Daily.co REST API
    const dailyRes = await fetch(`${process.env.DAILY_API_BASE_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: "private",           // only token holders can join
        properties: {
          exp: Math.floor(Date.now() / 1000) + 3600, // expires in 1 hour
          max_participants: 2,
          enable_chat: false,
          enable_screenshare: false,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    });

    const dailyRoom = await dailyRes.json();
    if (!dailyRes.ok) throw new Error(dailyRoom.error || "Daily.co room creation failed");

    // Save room to MongoDB
    const room = await Room.create({
      roomName: dailyRoom.name,
      roomUrl: dailyRoom.url,
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
  try {
    const { roomName, isOwner } = req.body;
    // isOwner: true for doctor (can end meeting), false for patient

    const tokenRes = await fetch(`${process.env.DAILY_API_BASE_URL}/meeting-tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          is_owner: isOwner,           // doctor is room owner
          enable_screenshare: false,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.error || "Token generation failed");

    res.json({ token: tokenData.token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get Room by ID ───────────────────────────────────────────────────────────
// GET /api/rooms/:roomId
router.get("/:roomId", verifyToken, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
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

    // Delete room from Daily.co (cleanup)
    await fetch(`${process.env.DAILY_API_BASE_URL}/rooms/${room.roomName}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${process.env.DAILY_API_KEY}` },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
