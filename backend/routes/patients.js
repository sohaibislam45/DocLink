import express from "express";
import mongoose from "mongoose";
import { verifyToken } from "../middleware/verifyToken.js";

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

export default router;
export { Patient };
