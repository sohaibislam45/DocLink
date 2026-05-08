import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

// Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    console.log("Firebase Admin initialized");
  } catch (error) {
    console.error("Firebase Admin initialization error:", error.message);
  }
}

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // { uid, email, name, ... }
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
