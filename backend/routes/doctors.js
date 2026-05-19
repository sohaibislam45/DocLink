import express from "express";
import mongoose from "mongoose";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

const doctorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  experience: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  fee: { type: Number, required: true },
  initials: { type: String, required: true },
  avatar: { type: String },
  gender: { type: String, enum: ["male", "female"] },
  isOnline: { type: Boolean, default: false },
  queueCount: { type: Number, default: 0 },
  availableToday: { type: Boolean, default: false },
  availableThisWeek: { type: Boolean, default: false },
  education: { type: String, default: "" },
  experienceDetails: { type: String, default: "" },
  bio: { type: String },
  verified: { type: Boolean, default: false },
  reviews: [{
    id: String,
    author: String,
    initials: String,
    rating: Number,
    date: String,
    text: String,
  }],
  availableSlots: [{
    date: String,
    times: [String],
  }],
}, { timestamps: true });

const Doctor = mongoose.model("Doctor", doctorSchema);

// GET /api/doctors - Filtering & Sorting
router.get("/", async (req, res) => {
  try {
    const { specialty, minRating, maxFee, availableToday, availableThisWeek, sortBy } = req.query;
    let query = {};
    if (specialty && specialty !== "All") query.specialty = specialty;
    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    if (maxFee) query.fee = { $lte: parseInt(maxFee) };
    if (availableToday === "true") query.availableToday = true;
    if (availableThisWeek === "true") query.availableThisWeek = true;

    let sort = {};
    if (sortBy === "rating") sort = { rating: -1 };
    else if (sortBy === "fee_asc") sort = { fee: 1 };
    else if (sortBy === "fee_desc") sort = { fee: -1 };

    const doctors = await Doctor.find(query).sort(sort);
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/doctors/:id
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ id: req.params.id });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/doctors/:id/status - Requires Auth
router.patch("/:id/status", verifyToken, async (req, res) => {
  try {
    const { isOnline } = req.body;
    const doctor = await Doctor.findOneAndUpdate(
      { id: req.params.id },
      { isOnline },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
export { Doctor };
