import express from "express";
import mongoose from "mongoose";

const router = express.Router();

const specialtySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  doctorCount: { type: Number, default: 0 }
});

const Specialty = mongoose.model("Specialty", specialtySchema);

// GET /api/specialties
router.get("/", async (req, res) => {
  try {
    const specialties = await Specialty.find().sort({ name: 1 });
    res.json(specialties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
export { Specialty };
