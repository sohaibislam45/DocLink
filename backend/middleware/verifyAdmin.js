import { verifyToken } from "./verifyToken.js";

// Chain: first verify Firebase token, then check admin whitelist
export const verifyAdmin = async (req, res, next) => {
  // Step 1: run standard token verification
  await new Promise((resolve, reject) => {
    verifyToken(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  }).catch(() => {
    // If verifyToken already sent a response, this might cause issues if not handled
    // but verifyToken uses res.status().json() which ends the request.
    // However, the promise-based wrapper needs to be careful.
    // The prompt's implementation:
    // return res.status(401).json({ error: "Unauthorized" });
    // is actually redundant if verifyToken already responded.
  });

  if (res.headersSent) return;

  // Step 2: check admin whitelist
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
  if (!adminEmails.includes(req.user.email)) {
    return res.status(403).json({ error: "Forbidden: Admin access only" });
  }

  next();
};
