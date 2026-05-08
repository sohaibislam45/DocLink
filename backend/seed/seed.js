import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });
import mongoose from "mongoose";
import { connectDB } from "../db/connect.js";
import { doctorsSeedData, consultationsSeedData, prescriptionsSeedData } from "./seedData.js";
import { specialtiesSeedData, testimonialsSeedData, categoriesSeedData } from "./seedDataExtra.js";
import { Doctor } from "../routes/doctors.js";
import { Consultation } from "../routes/consultations.js";
import { Prescription } from "../routes/prescriptions.js";
import { Specialty } from "../routes/specialties.js";
import { Testimonial } from "../routes/testimonials.js";
import { Category } from "../routes/categories.js";

dotenv.config();

const seed = async () => {
  await connectDB();
  console.log("🌱 Starting seed...");

  try {
    // Clear existing data
    await Doctor.deleteMany({});
    await Consultation.deleteMany({});
    await Prescription.deleteMany({});
    await Specialty.deleteMany({});
    await Testimonial.deleteMany({});
    await Category.deleteMany({});
    console.log("🗑️  Cleared existing collections");

    // Insert seed data
    await Doctor.insertMany(doctorsSeedData);
    console.log(`✅ Seeded ${doctorsSeedData.length} doctors`);

    await Consultation.insertMany(consultationsSeedData);
    console.log(`✅ Seeded ${consultationsSeedData.length} consultations`);

    await Prescription.insertMany(prescriptionsSeedData);
    console.log(`✅ Seeded ${prescriptionsSeedData.length} prescriptions`);

    await Specialty.insertMany(specialtiesSeedData);
    console.log(`✅ Seeded ${specialtiesSeedData.length} specialties`);

    await Testimonial.insertMany(testimonialsSeedData);
    console.log(`✅ Seeded ${testimonialsSeedData.length} testimonials`);

    await Category.insertMany(categoriesSeedData);
    console.log(`✅ Seeded ${categoriesSeedData.length} categories`);

    console.log("🎉 Seed complete!");
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    process.exit(0);
  }
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
