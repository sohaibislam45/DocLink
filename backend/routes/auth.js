import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { Patient } from "./patients.js";
import { Doctor } from "./doctors.js";

const router = express.Router();

router.post("/verify-role", verifyToken, async (req, res) => {
  try {
    const { role } = req.body;
    const uid = req.user.uid;
    const email = req.user.email;

    const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
    const isAdmin = adminEmails.includes(email);

    const isPatient = await Patient.findOne({ uid });
    const isDoctor = await Doctor.findOne({ id: uid });

    if (role === "admin") {
      if (!isAdmin) return res.status(403).json({ error: "Access denied. Not an admin." });
    } else if (role === "doctor") {
      if (isAdmin) return res.status(403).json({ error: "Admins cannot login as doctors." });
      if (isPatient) return res.status(403).json({ error: "Account registered as a Patient." });
    } else if (role === "patient") {
      if (isAdmin) return res.status(403).json({ error: "Admins cannot login as patients." });
      if (isDoctor) return res.status(403).json({ error: "Account registered as a Doctor." });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
