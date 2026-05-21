import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const corsConfig = [
  {
    origin: ["*"],
    method: ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"],
    responseHeader: ["*"],
    maxAgeSeconds: 3600
  }
];

async function setCors() {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    });

    // Check if storage bucket exists in env, fallback to project id .appspot.com
    let bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    if (!bucketName && process.env.FIREBASE_PROJECT_ID) {
      // In the console error, the bucket is: doclink-e09c7.firebasestorage.app
      // Wait, firebase storage bucket is usually doclink-e09c7.appspot.com or doclink-e09c7.firebasestorage.app
      bucketName = "doclink-e09c7.firebasestorage.app";
    }

    const bucket = admin.storage().bucket(bucketName);
    
    await bucket.setCorsConfiguration(corsConfig);
    console.log("Successfully set CORS configuration for Firebase Storage.");
  } catch (error) {
    console.error("Error setting CORS:", error);
  }
}

setCors();
