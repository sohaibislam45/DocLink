import express from "express";
import mongoose from "mongoose";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import { Doctor } from "./doctors.js";
import { Patient } from "./patients.js";
import { Payment } from "./payments.js";
import { Consultation } from "./consultations.js";
import { Prescription } from "./prescriptions.js";
import { QueueEntry } from "./queues.js";

const router = express.Router();

// --- SETTING MODEL ---
const settingsSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

const Setting = mongoose.model("Setting", settingsSchema);

// --- ROUTES ---

// POST /api/admin/verify-login
router.post("/verify-login", verifyAdmin, (req, res) => {
  res.json({
    success: true,
    admin: {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name || "Admin",
    }
  });
});

// GET /api/admin/stats
router.get("/stats", verifyAdmin, async (req, res) => {
  try {
    const [
      totalDoctors, totalPatients,
      totalPayments, revenueResult,
      pendingDoctors
    ] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Payment.countDocuments({ status: "completed" }),
      Payment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      Doctor.countDocuments({ verified: false }),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      totalDoctors,
      totalPatients,
      totalPayments,
      totalRevenue,         // in cents
      pendingDoctors,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DOCTOR CRUD ---

// GET /api/admin/doctors
router.get("/doctors", verifyAdmin, async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const query = search
      ? { $or: [
          { name: { $regex: search, $options: "i" } },
          { specialty: { $regex: search, $options: "i" } }
        ]}
      : {};
    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ doctors, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/doctors
router.post("/doctors", verifyAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.create({
      ...req.body,
      id: `doc-${Date.now()}`,
      verified: true,
    });
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/admin/doctors/:id
router.patch("/doctors/:id", verifyAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admin/doctors/:id
router.delete("/doctors/:id", verifyAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndDelete({ id: req.params.id });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    await QueueEntry.deleteMany({ doctorId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/doctors/:id/verify
router.patch("/doctors/:id/verify", verifyAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { id: req.params.id },
      { verified: true },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PATIENT CRUD ---

// GET /api/admin/patients
router.get("/patients", verifyAdmin, async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const query = search
      ? { $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]}
      : {};
    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ patients, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/patients/:uid
router.patch("/patients/:uid", verifyAdmin, async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { uid: req.params.uid },
      req.body,
      { new: true }
    );
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admin/patients/:uid
router.delete("/patients/:uid", verifyAdmin, async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({ uid: req.params.uid });
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    await Consultation.deleteMany({ patientUid: req.params.uid });
    await Prescription.deleteMany({ patientUid: req.params.uid });
    await QueueEntry.deleteMany({ patientUid: req.params.uid });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PAYMENTS ---

// GET /api/admin/payments
router.get("/payments", verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};
    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ payments, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SETTINGS ---

// GET /api/admin/settings
router.get("/settings", verifyAdmin, async (req, res) => {
  try {
    const settings = await Setting.find();
    const result = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    res.json({
      platformFee: result.platformFee ?? 2,
      maintenanceMode: result.maintenanceMode ?? false,
      announcementBanner: result.announcementBanner ?? "",
      ...result,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/settings
router.patch("/settings", verifyAdmin, async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await Setting.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/public-settings (Public)
router.get("/public-settings", async (req, res) => {
  try {
    const settings = await Setting.find({
      key: { $in: ["announcementBanner", "maintenanceMode"] }
    });
    const result = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
export { Setting };
