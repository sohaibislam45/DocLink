import express from "express";
import mongoose from "mongoose";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

const prescriptionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientUid: { type: String, required: true },  // Firebase UID
  patientName: { type: String },
  age: { type: String },
  gender: { type: String },
  weight: { type: String },
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
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      $or: [{ patientUid: req.user.uid }, { doctorId: req.user.uid }]
    };

    const total = await Prescription.countDocuments(query);
    const prescriptions = await Prescription.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      prescriptions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /api/prescriptions - Requires Auth
router.post("/", verifyToken, async (req, res) => {
  try {
    const patientUid = req.body.patientUid || req.user.uid;
    const doctorId = req.body.doctorId || req.user.uid;

    const newPrescription = new Prescription({
      ...req.body,
      id: req.body.id || `RX-${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
      patientUid,
      doctorId,
    });
    await newPrescription.save();
    res.status(201).json(newPrescription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
export { Prescription };
