import express from "express";
import mongoose from "mongoose";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// --- SCHEMA & MODEL ---
const queueEntrySchema = new mongoose.Schema({
  doctorId: { type: String, required: true },      // Doctor's unique ID
  patientUid: { type: String, required: true },    // Firebase UID
  patientName: { type: String, required: true },   // from intake form
  reason: { type: String, required: true },        // reason for visit
  position: { type: Number, required: true },      // 1-based queue position
  status: {
    type: String,
    enum: ["waiting", "called", "in-consultation", "completed", "left"],
    default: "waiting"
  },
  estimatedWaitMins: { type: Number, default: 0 }, // calculated on join
  joinedAt: { type: Date, default: Date.now },
  calledAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

// Index for performance and uniqueness: one active entry per patient
queueEntrySchema.index({ patientUid: 1, status: 1 }, { 
  unique: true, 
  partialFilterExpression: { status: { $in: ["waiting", "called", "in-consultation"] } } 
});

export const QueueEntry = mongoose.model("QueueEntry", queueEntrySchema);

// --- REST ENDPOINTS ---

// GET /api/queues/:doctorId - Get active queue for a doctor
router.get("/:doctorId", async (req, res) => {
  try {
    const queue = await QueueEntry.find({
      doctorId: req.params.doctorId,
      status: { $in: ["waiting", "called", "in-consultation"] }
    }).sort({ position: 1 });
    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/queues/my-entry - Get current patient's active entry
router.get("/my-entry", verifyToken, async (req, res) => {
  try {
    const entry = await QueueEntry.findOne({
      patientUid: req.user.uid,
      status: { $in: ["waiting", "called", "in-consultation"] }
    });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/queues/join - Patient joins a doctor's queue
router.post("/join", verifyToken, async (req, res) => {
  const { doctorId, patientName, reason } = req.body;
  const patientUid = req.user.uid;

  try {
    // 1. Check if patient is already in an active queue
    const existing = await QueueEntry.findOne({
      patientUid,
      status: { $in: ["waiting", "called", "in-consultation"] }
    });
    if (existing) {
      return res.status(400).json({ error: "You are already in an active queue" });
    }

    // 2. Count current active entries for this doctor to determine position
    const count = await QueueEntry.countDocuments({
      doctorId,
      status: { $in: ["waiting", "called", "in-consultation"] }
    });

    // 3. Calculate estimatedWaitMins
    // Simple logic: each patient ahead adds ~10 mins
    const estimatedWaitMins = count * (Math.floor(Math.random() * 8) + 8);

    // 4. Create entry
    const newEntry = new QueueEntry({
      doctorId,
      patientUid,
      patientName,
      reason,
      position: count + 1,
      estimatedWaitMins
    });

    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/queues/leave - Patient leaves the queue
router.delete("/leave", verifyToken, async (req, res) => {
  try {
    const entry = await QueueEntry.findOne({
      patientUid: req.user.uid,
      status: { $in: ["waiting", "called", "in-consultation"] }
    });

    if (!entry) {
      return res.status(404).json({ error: "Queue entry not found" });
    }

    const removedPosition = entry.position;
    const doctorId = entry.doctorId;

    entry.status = "left";
    await entry.save();

    // Recalculate positions for remaining entries
    await QueueEntry.updateMany(
      { 
        doctorId, 
        position: { $gt: removedPosition }, 
        status: { $in: ["waiting", "called"] } 
      },
      { $inc: { position: -1 } }
    );

    res.json({ message: "Left queue successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
