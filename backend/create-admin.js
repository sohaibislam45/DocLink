import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

async function ensureAdminUser() {
  const email = "admin@doclink.com";
  const password = "password123";
  try {
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      console.log(`User ${email} already exists. Updating password...`);
      await admin.auth().updateUser(userRecord.uid, { password });
      console.log("Password updated successfully.");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        console.log(`User ${email} not found. Creating...`);
        await admin.auth().createUser({
          email,
          password,
          emailVerified: true,
          displayName: "System Admin"
        });
        console.log("Admin user created successfully.");
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error("Error ensuring admin user:", error);
  }
}

ensureAdminUser();
