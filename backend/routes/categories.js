import express from "express";
import mongoose from "mongoose";

const router = express.Router();

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  count: { type: Number, default: 0 }
});

const Category = mongoose.model("Category", categorySchema);

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
export { Category };
