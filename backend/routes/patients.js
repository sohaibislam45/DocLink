import express from "express";
import mongoose from "mongoose";
import { verifyToken } from "../middleware/verifyToken.js";
import { Consultation } from "./consultations.js";
import { Prescription } from "./prescriptions.js";

const router = express.Router();

const patientSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  dob: { type: String, default: "" },
  gender: { type: String, default: "" },
  bloodType: { type: String, default: "" },
  allergies: { type: String, default: "" },
  photoURL: { type: String, default: "" },
}, { timestamps: true });

const Patient = mongoose.model("Patient", patientSchema);

// GET /api/patients/me - Requires Auth
router.get("/me", verifyToken, async (req, res) => {
  try {
    const patient = await Patient.findOne({ uid: req.user.uid });
    if (!patient) return res.status(404).json({ error: "Patient profile not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/patients - Requires Auth (Auto-create on first login)
router.post("/", verifyToken, async (req, res) => {
  try {
    let patient = await Patient.findOne({ uid: req.user.uid });
    if (patient) return res.json(patient);

    patient = new Patient({
      uid: req.user.uid,
      name: req.body.name || req.user.name || "User",
      email: req.user.email,
      photoURL: req.user.picture || "",
    });

    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/patients/me - Requires Auth
router.patch("/me", verifyToken, async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { uid: req.user.uid },
      { $set: req.body },
      { new: true }
    );
    if (!patient) return res.status(404).json({ error: "Patient profile not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patients/stats - Requires Auth
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const patientUid = req.user.uid;

    const [
      totalConsultations,
      totalPrescriptions,
      consultations,
      prescriptions
    ] = await Promise.all([
      Consultation.countDocuments({ patientUid }),
      Prescription.countDocuments({ patientUid }),
      Consultation.find({ patientUid }).sort({ createdAt: -1 }).limit(10),
      Prescription.find({ patientUid }).sort({ createdAt: -1 }).limit(10),
    ]);

    // Aggregate unique doctors
    const uniqueDoctorIds = new Set(consultations.map(c => c.doctorId));
    const totalDoctors = uniqueDoctorIds.size;

    // Combine activities
    const activities = [
      ...consultations.map(c => ({
        type: "completed",
        text: `Consultation with Dr. ${c.doctorName} completed`,
        date: c.date,
        createdAt: c.createdAt,
      })),
      ...prescriptions.map(p => ({
        type: "prescription",
        text: `New prescription received from Dr. ${p.doctorName}`,
        date: p.date,
        createdAt: p.createdAt,
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

    res.json({
      stats: {
        totalConsultations,
        totalPrescriptions,
        totalDoctors,
        avgRating: "4.8", // Placeholder for now as rating system isn't implemented
      },
      activities
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
export { Patient };
