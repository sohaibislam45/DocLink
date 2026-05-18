import express from "express";
import mongoose from "mongoose";
import Stripe from "stripe";
import { verifyToken } from "../middleware/verifyToken.js";
import { Doctor } from "./doctors.js";
import { QueueEntry } from "./queues.js";
import { getIO } from "../server.js";

const router = express.Router();

// --- MONGOOSE PAYMENT SCHEMA & MODEL ---
const paymentSchema = new mongoose.Schema({
  stripeSessionId: { type: String, required: true, unique: true },
  patientUid:      { type: String, required: true },   // Firebase UID
  patientName:     { type: String, required: true },   // from intake form
  doctorId:        { type: String, required: true },   // e.g. "doc-001"
  doctorName:      { type: String, required: true },
  reason:          { type: String, required: true },   // reason for visit
  consultationFee: { type: Number, required: true },   // in BDT cents/poisha
  platformFee:     { type: Number, required: true },   // in BDT cents/poisha
  totalAmount:     { type: Number, required: true },   // consultationFee + platformFee
  currency:        { type: String, default: "bdt" },
  status:          {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending"
  },
  queueJoined:     { type: Boolean, default: false },  // true after auto-join
  paidAt:          { type: Date, default: null },
}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);

// Initialize Stripe (using the exported getter or fallback during testing)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const PLATFORM_FEE_BDT = 50; // ৳50 platform charge

// --- REST ROUTE: CREATE CHECKOUT SESSION ---
router.post("/create-checkout-session", verifyToken, async (req, res) => {
  try {
    const { doctorId, patientName, reason } = req.body;
    const patientUid = req.user.uid;

    if (!doctorId || !patientName || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1. Fetch doctor to get fee and name
    const doctor = await Doctor.findOne({ id: doctorId });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    if (!doctor.isOnline) return res.status(400).json({ error: "Doctor is not online" });

    // 2. Check patient not already in an active queue for this doctor
    const existingEntry = await QueueEntry.findOne({
      patientUid,
      doctorId,
      status: { $in: ["waiting", "called", "in-consultation"] }
    });
    if (existingEntry) {
      return res.status(400).json({ error: "You are already in this doctor's queue" });
    }

    // 3. (Optional duplicate checks relaxed for seamless user navigation)

    const consultationFeeCents = doctor.fee * 100;   // e.g. 1000 BDT -> 100000 poisha
    const platformFeeCents = PLATFORM_FEE_BDT * 100; // 50 BDT -> 5000 poisha
    const totalCents = consultationFeeCents + platformFeeCents;

    // 4. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Consultation with Dr. ${doctor.name}`,
              description: `${doctor.specialty} — ${reason}`,
            },
            unit_amount: consultationFeeCents,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: "DocLink Platform Fee",
              description: "Service and support fee",
            },
            unit_amount: platformFeeCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&doctorId=${doctorId}`,
      cancel_url: `${process.env.FRONTEND_URL}/doctors/${doctorId}?payment=cancelled`,
      metadata: {
        patientUid,
        patientName,
        doctorId,
        doctorName: doctor.name,
        reason,
        consultationFeeCents: String(consultationFeeCents),
        platformFeeCents: String(platformFeeCents),
      },
      customer_email: req.user.email || undefined,
    });

    // 5. Save pending payment record in MongoDB
    await Payment.create({
      stripeSessionId: session.id,
      patientUid,
      patientName,
      doctorId,
      doctorName: doctor.name,
      reason,
      consultationFee: consultationFeeCents,
      platformFee: platformFeeCents,
      totalAmount: totalCents,
      status: "pending",
    });

    // 6. Return session URL to frontend
    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- REST ROUTE: VERIFY PAYMENT (called by success page) ---
router.get("/verify", verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId parameter" });
    }

    let payment = await Payment.findOne({
      stripeSessionId: sessionId,
      patientUid: req.user.uid,  // security: only return own payment
    });

    if (!payment) return res.status(404).json({ error: "Payment not found" });

    // --- BULLETPROOF WEBHOOK FALLBACK ---
    // If Stripe webhook was delayed/lost/failed (still 'pending' in database),
    // query Stripe directly to verify payment status and resolve queue placement.
    if (payment.status === "pending") {
      try {
        console.log(`Fallback: Checking Stripe directly for session: ${sessionId}`);
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session && session.payment_status === "paid") {
          console.log("Stripe confirms paid! Performing direct queue placement inline.");

          // 1. Update payment status to completed
          payment = await Payment.findOneAndUpdate(
            { stripeSessionId: sessionId },
            {
              status: "completed",
              paidAt: new Date(),
            },
            { new: true }
          );

          // 2. Auto-join queue if they are not already in it
          const existingEntry = await QueueEntry.findOne({
            patientUid: req.user.uid,
            doctorId: payment.doctorId,
            status: { $in: ["waiting", "called", "in-consultation"] }
          });

          if (!existingEntry) {
            const { patientName, reason } = session.metadata || {};
            const activeEntries = await QueueEntry.countDocuments({
              doctorId: payment.doctorId,
              status: { $in: ["waiting", "called", "in-consultation"] }
            });

            const position = activeEntries + 1;
            
            // Assign random wait time per patient ahead (8–15 mins)
            const estimatedWaitMins = Array.from({ length: activeEntries })
              .reduce((sum) => sum + Math.floor(Math.random() * 8) + 8, 0);

            await QueueEntry.create({
              doctorId: payment.doctorId,
              patientUid: req.user.uid,
              patientName: patientName || payment.patientName || "Patient",
              reason: reason || payment.reason || "Consultation",
              position,
              status: "waiting",
              estimatedWaitMins,
            });
            console.log("Fallback: Inline Queue entry created successfully.");
          }

          // 3. Mark payment as queue joined
          payment = await Payment.findOneAndUpdate(
            { stripeSessionId: sessionId },
            { queueJoined: true },
            { new: true }
          );

          // 4. Emit live socket update
          const io = getIO();
          if (io) {
            const queueList = await QueueEntry.find({
              doctorId: payment.doctorId,
              status: { $in: ["waiting", "called", "in-consultation"] }
            }).sort({ position: 1 });
            
            io.to(`doctor-${payment.doctorId}`).emit("queue:updated", queueList);
          }
        }
      } catch (stripeErr) {
        console.error("Direct Stripe verification fallback error:", stripeErr);
      }
    }

    // Also fetch their current queue entry
    const queueEntry = await QueueEntry.findOne({
      patientUid: req.user.uid,
      doctorId: payment.doctorId,
      status: { $in: ["waiting", "called", "in-consultation"] }
    });

    res.json({ payment, queueEntry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REST ROUTE: GET PATIENT PAYMENT HISTORY ---
router.get("/my", verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({ patientUid: req.user.uid })
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REST ROUTE: CANCEL/DELETE PAYMENT (only if pending or failed) ---
router.post("/:paymentId/cancel", verifyToken, async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Find the payment and ensure it belongs to this patient
    const payment = await Payment.findOne({
      _id: paymentId,
      patientUid: req.user.uid
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment record not found." });
    }

    if (payment.status === "completed") {
      return res.status(400).json({ error: "Successful payments cannot be cancelled." });
    }

    payment.status = "cancelled";
    await payment.save();

    res.json({ message: "Payment cancelled successfully.", payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- NAMED EXPORT: STRIPE WEBHOOK HANDLER (Stripe calls this, not frontend) ---
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,                              // raw body (not parsed JSON)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const {
      patientUid, patientName, doctorId,
      doctorName, reason,
      consultationFeeCents, platformFeeCents
    } = session.metadata;

    try {
      // 1. Update payment status to completed
      await Payment.findOneAndUpdate(
        { stripeSessionId: session.id },
        {
          status: "completed",
          paidAt: new Date(),
        }
      );

      // 2. Auto-join the queue
      const activeEntries = await QueueEntry.countDocuments({
        doctorId,
        status: { $in: ["waiting", "called", "in-consultation"] }
      });

      const position = activeEntries + 1;

      // Assign random wait time per patient ahead (8–15 mins)
      const estimatedWaitMins = Array.from({ length: activeEntries })
        .reduce((sum) => sum + Math.floor(Math.random() * 8) + 8, 0);

      const newEntry = await QueueEntry.create({
        doctorId,
        patientUid,
        patientName,
        reason,
        position,
        status: "waiting",
        estimatedWaitMins,
      });

      // 3. Mark payment as queue-joined
      await Payment.findOneAndUpdate(
        { stripeSessionId: session.id },
        { queueJoined: true }
      );

      // 4. Emit socket event to update doctor + other patients in real time
      const io = getIO();
      if (io) {
        const queueList = await QueueEntry.find({
          doctorId,
          status: { $in: ["waiting", "called", "in-consultation"] }
        }).sort({ position: 1 });
        
        io.to(`doctor-${doctorId}`).emit("queue:updated", queueList);
      }

      console.log(`✅ Payment completed + queue joined: ${patientName} -> ${doctorName}`);
    } catch (err) {
      console.error("Webhook processing error:", err);
      // Return 200 anyway - Stripe will retry on non-200
    }
  }

  res.json({ received: true });
};

export default router;
