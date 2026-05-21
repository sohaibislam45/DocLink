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
  email: { type: String, lowercase: true },
  verified: { type: Boolean, default: false },
  phone: { type: String, default: "" },
  languages: { type: [String], default: ["English"] },
  workingHours: {
    type: Object,
    default: {
      Monday: { enabled: true, from: "09:00", to: "17:00" },
      Tuesday: { enabled: true, from: "09:00", to: "17:00" },
      Wednesday: { enabled: true, from: "09:00", to: "17:00" },
      Thursday: { enabled: true, from: "09:00", to: "17:00" },
      Friday: { enabled: true, from: "09:00", to: "17:00" },
      Saturday: { enabled: false, from: "09:00", to: "17:00" },
      Sunday: { enabled: false, from: "09:00", to: "17:00" },
    }
  },
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
    let query = { verified: true };
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

// GET /api/doctors/my/dashboard - Get doctor dashboard stats & profile details (Requires Auth)
router.get("/my/dashboard", verifyToken, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ id: req.user.uid });
    
    // Count consultations completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const consultationsTodayCount = await mongoose.model("Consultation").countDocuments({
      doctorId: req.user.uid,
      createdAt: { $gte: today }
    });

    // Calculate average wait time from active queue entries
    const queueEntries = await mongoose.model("QueueEntry").find({ doctorId: req.user.uid });
    const waitingEntries = queueEntries.filter(entry => entry.status === "waiting");
    let avgWait = 15; // default fallback
    if (waitingEntries.length > 0) {
      const sum = waitingEntries.reduce((acc, curr) => acc + (curr.estimatedWaitMins || 0), 0);
      avgWait = Math.round(sum / waitingEntries.length);
    }

    res.json({
      doctor,
      stats: {
        patientsInQueue: waitingEntries.length,
        todayConsultations: consultationsTodayCount,
        avgWaitTime: avgWait,
        rating: doctor ? doctor.rating : 5.0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/doctors/my/profile - Update doctor's own profile (Requires Auth)
router.patch("/my/profile", verifyToken, async (req, res) => {
  try {
    const { name, specialty, experience, fee, education, experienceDetails, bio, avatar, gender, phone, languages, isOnline } = req.body;
    
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (specialty !== undefined) updateFields.specialty = specialty;
    if (experience !== undefined) updateFields.experience = Number(experience);
    if (fee !== undefined) updateFields.fee = Number(fee);
    if (education !== undefined) updateFields.education = education;
    if (experienceDetails !== undefined) updateFields.experienceDetails = experienceDetails;
    if (bio !== undefined) updateFields.bio = bio;
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (gender !== undefined) updateFields.gender = gender;
    if (phone !== undefined) updateFields.phone = phone;
    if (languages !== undefined) updateFields.languages = languages;
    if (isOnline !== undefined) updateFields.isOnline = isOnline;

    // Recalculate initials if name changed
    if (name) {
      updateFields.initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
    }

    const doctor = await Doctor.findOneAndUpdate(
      { id: req.user.uid },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!doctor) return res.status(404).json({ error: "Doctor profile not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/doctors/my/availability - Update doctor's working hours (Requires Auth)
router.patch("/my/availability", verifyToken, async (req, res) => {
  try {
    const { workingHours } = req.body;
    if (!workingHours) return res.status(400).json({ error: "workingHours is required" });

    const doctor = await Doctor.findOneAndUpdate(
      { id: req.user.uid },
      { $set: { workingHours } },
      { new: true, runValidators: true }
    );

    if (!doctor) return res.status(404).json({ error: "Doctor profile not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/doctors/my/patients - Get all unique patients seen by this doctor (Requires Auth)
router.get("/my/patients", verifyToken, async (req, res) => {
  try {
    const doctorId = req.user.uid;

    // 1. Fetch all consultations for this doctor
    const { Consultation } = await import("./consultations.js");
    const { Prescription } = await import("./prescriptions.js");
    const { Patient } = await import("./patients.js");

    const consultations = await Consultation.find({ doctorId }).sort({ createdAt: -1 });

    // Group consultations by patientUid
    const patientGroups = {};
    for (const c of consultations) {
      if (!patientGroups[c.patientUid]) {
        patientGroups[c.patientUid] = [];
      }
      patientGroups[c.patientUid].push(c);
    }

    const uniquePatientUids = Object.keys(patientGroups);

    // 2. Fetch full patient profile details
    const patients = await Patient.find({ uid: { $in: uniquePatientUids } });
    const patientMap = {};
    patients.forEach(p => {
      patientMap[p.uid] = p;
    });

    // 3. Fetch all prescriptions for this doctor
    const prescriptions = await Prescription.find({ doctorId });
    const prescriptionPatientUids = new Set(prescriptions.map(p => p.patientUid));

    // 4. Map to frontend format
    const results = [];
    for (const patientUid of uniquePatientUids) {
      const patientCon = patientGroups[patientUid];
      const latestCon = patientCon[0]; // sorted by createdAt descending, so first is latest
      const dbPatient = patientMap[patientUid];

      const name = dbPatient ? dbPatient.name : (latestCon.patientName || "Unknown Patient");
      const initials = name ? name.split(" ").map(n => n[0]).join("").toUpperCase() : "PT";

      // Calculate age from dob (format e.g. YYYY-MM-DD or standard date)
      let age = 28; // fallback
      if (dbPatient && dbPatient.dob) {
        const birthDate = new Date(dbPatient.dob);
        if (!isNaN(birthDate.getTime())) {
          const ageDifMs = Date.now() - birthDate.getTime();
          const ageDate = new Date(ageDifMs);
          age = Math.abs(ageDate.getUTCFullYear() - 1970);
        }
      }

      results.push({
        id: latestCon.id || `pt_${patientUid}`,
        patientUid: patientUid,
        name: name,
        initials: initials,
        age: age,
        gender: dbPatient && dbPatient.gender ? (dbPatient.gender.charAt(0).toUpperCase() + dbPatient.gender.slice(1)) : "Male",
        lastVisit: latestCon.date,
        diagnosis: latestCon.summary || "General Checkup",
        consultationDuration: latestCon.duration || "10 mins",
        prescriptionIssued: prescriptionPatientUids.has(patientUid) || !!latestCon.prescriptionId,
        notes: latestCon.summary || "No clinical notes entered.",
      });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/doctors/sync - Requires Auth (Auto-create on first login/registration)
router.post("/sync", verifyToken, async (req, res) => {
  try {
    let doctor = await Doctor.findOne({ id: req.user.uid });
    if (doctor) return res.json(doctor);

    doctor = new Doctor({
      id: req.user.uid,
      name: req.user.name || "Dr. User",
      email: req.user.email,
      specialty: "General Medicine",
      experience: 1,
      fee: 500,
      gender: "male",
      initials: req.user.name ? req.user.name.split(" ").map(n => n[0]).join("").toUpperCase() : "DR",
      verified: false,
    });

    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
export { Doctor };
