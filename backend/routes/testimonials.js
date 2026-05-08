import express from "express";
import mongoose from "mongoose";

const router = express.Router();

const testimonialSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  initials: { type: String, required: true },
  text: { type: String, required: true },
  rating: { type: Number, required: true },
  date: { type: String, required: true }
});

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

// GET /api/testimonials
router.get("/", async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
export { Testimonial };
