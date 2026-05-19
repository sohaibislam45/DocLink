import express from "express";
import mongoose from "mongoose";
import { Doctor } from "./doctors.js";

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
    const specsData = await Doctor.aggregate([
      {
        $group: {
          _id: "$specialty",
          doctorCount: { $sum: 1 }
        }
      },
      {
        $sort: { doctorCount: -1, _id: 1 }
      }
    ]);

    const iconMap = {
      "Cardiology": "Heart",
      "Neurology": "Brain",
      "Dermatology": "Sparkles",
      "Pediatrics": "Baby",
      "Orthopedics": "Bone",
      "General Medicine": "Stethoscope",
      "Gastroenterology": "Activity",
      "Psychiatry": "Smile",
    };

    const specialties = specsData
      .filter(item => item._id)
      .map((item, index) => ({
        id: `spec-${index}`,
        name: item._id,
        icon: iconMap[item._id] || "Activity",
        doctorCount: item.doctorCount
      }));

    res.json(specialties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
export { Specialty };
