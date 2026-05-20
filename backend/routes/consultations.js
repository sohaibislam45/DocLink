import express from "express";
import mongoose from "mongoose";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

const consultationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientUid: { type: String, required: true },  // Firebase UID
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  doctorInitials: { type: String },
  specialty: { type: String },
  date: { type: String, required: true },
  duration: { type: String },
  status: { type: String, enum: ["Completed", "Cancelled", "In Progress"], default: "Completed" },
  summary: { type: String, default: "" },
  prescriptionId: { type: String, default: null },
}, { timestamps: true });

const Consultation = mongoose.model("Consultation", consultationSchema);

// GET /api/consultations/my - Requires Auth
router.get("/my", verifyToken, async (req, res) => {
  try {
    const consultations = await Consultation.find({
      $or: [{ patientUid: req.user.uid }, { doctorId: req.user.uid }]
    }).sort({ createdAt: -1 });
    res.json(consultations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/consultations - Requires Auth
router.post("/", verifyToken, async (req, res) => {
  try {
    const newConsultation = new Consultation({
      ...req.body,
      patientUid: req.user.uid,
    });
    await newConsultation.save();
    res.status(201).json(newConsultation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
export { Consultation };
