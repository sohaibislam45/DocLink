import mongoose from "mongoose";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Init Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

// Minimal Schemas to insert
const patientSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
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

const doctorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  specialty: { type: String, required: true },
  experience: { type: Number, required: true },
  fee: { type: Number, required: true },
  verified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  bio: { type: String, default: "" },
  phone: { type: String, default: "" },
  education: { type: String, default: "" },
  avatar: { type: String, default: "" },
}, { timestamps: true });
const Doctor = mongoose.model("Doctor", doctorSchema);

async function createDemoUsers() {
  try {
    // 1. Create Demo Patient
    let patientUid;
    try {
      const pRecord = await admin.auth().getUserByEmail("patient@demo.com");
      patientUid = pRecord.uid;
      await admin.auth().updateUser(patientUid, { password: "password123", displayName: "Demo Patient" });
      console.log("Demo Patient Auth Updated.");
    } catch (err) {
      const pRecord = await admin.auth().createUser({
        email: "patient@demo.com",
        password: "password123",
        displayName: "Demo Patient",
      });
      patientUid = pRecord.uid;
      console.log("Demo Patient Auth Created.");
    }

    // Upsert Patient in DB
    await Patient.findOneAndUpdate(
      { uid: patientUid },
      {
        name: "Demo Patient",
        email: "patient@demo.com",
        phone: "+880 1234 567890",
        bloodType: "O+",
        gender: "Male"
      },
      { upsert: true, new: true }
    );
    console.log("Demo Patient DB Record Created.");

    // 2. Create Demo Doctor
    let doctorUid;
    try {
      const dRecord = await admin.auth().getUserByEmail("doctor@demo.com");
      doctorUid = dRecord.uid;
      await admin.auth().updateUser(doctorUid, { password: "password123", displayName: "Dr. Demo" });
      console.log("Demo Doctor Auth Updated.");
    } catch (err) {
      const dRecord = await admin.auth().createUser({
        email: "doctor@demo.com",
        password: "password123",
        displayName: "Dr. Demo",
      });
      doctorUid = dRecord.uid;
      console.log("Demo Doctor Auth Created.");
    }

    // Upsert Doctor in DB
    await Doctor.findOneAndUpdate(
      { id: doctorUid },
      {
        name: "Dr. Demo",
        email: "doctor@demo.com",
        specialty: "Cardiology",
        experience: 10,
        fee: 500,
        verified: true,
        rating: 4.8,
        reviews: 120,
        bio: "I am a demo doctor created for testing the application."
      },
      { upsert: true, new: true }
    );
    console.log("Demo Doctor DB Record Created.");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

createDemoUsers();
