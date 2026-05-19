import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "./db/connect.js";
import { Patient } from "./routes/patients.js";

dotenv.config();

const run = async () => {
  await connectDB();
  const patients = await Patient.find({}).lean();
  console.log("Patients in DB:", JSON.stringify(patients, null, 2));
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
