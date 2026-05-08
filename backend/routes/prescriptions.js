import express from "express";
import mongoose from "mongoose";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

const prescriptionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientUid: { type: String, required: true },  // Firebase UID
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  doctorInitials: { type: String },
  specialty: { type: String },
  date: { type: String, required: true },
  diagnosis: { type: String, required: true },
  medicines: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
  }],
  notes: { type: String, default: "" },
  valid: { type: Boolean, default: true },
}, { timestamps: true });

const Prescription = mongoose.model("Prescription", prescriptionSchema);

// GET /api/prescriptions/my - Requires Auth
router.get("/my", verifyToken, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientUid: req.user.uid }).sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/prescriptions - Requires Auth
router.post("/", verifyToken, async (req, res) => {
  try {
    const newPrescription = new Prescription({
      ...req.body,
      patientUid: req.user.uid,
    });
    await newPrescription.save();
    res.status(201).json(newPrescription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
export { Prescription };
