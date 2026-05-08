import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../db/connect.js";
import { doctorsSeedData, consultationsSeedData, prescriptionsSeedData } from "./seedData.js";
import { Doctor } from "../routes/doctors.js";
import { Consultation } from "../routes/consultations.js";
import { Prescription } from "../routes/prescriptions.js";

dotenv.config();

const seed = async () => {
  await connectDB();
  console.log("🌱 Starting seed...");

  try {
    // Clear existing data
    await Doctor.deleteMany({});
    await Consultation.deleteMany({});
    await Prescription.deleteMany({});
    console.log("🗑️  Cleared existing collections");

    // Insert seed data
    await Doctor.insertMany(doctorsSeedData);
    console.log(`✅ Seeded ${doctorsSeedData.length} doctors`);

    await Consultation.insertMany(consultationsSeedData);
    console.log(`✅ Seeded ${consultationsSeedData.length} consultations`);

    await Prescription.insertMany(prescriptionsSeedData);
    console.log(`✅ Seeded ${prescriptionsSeedData.length} prescriptions`);

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
