import { QueueEntry } from "../routes/queues.js";
import admin from "firebase-admin";

export const initSocket = (io) => {
  // Middleware: verify Firebase token on socket connection
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.log("Socket connection attempt without token");
      return next(new Error("Unauthorized: No token provided"));
    }
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      socket.user = decoded; // { uid, email, name, etc. }
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Unauthorized: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // console.log(`Socket connected: ${socket.id} | User: ${socket.user.uid}`);
    console.log("Socket connected");

    // --- JOIN DOCTOR ROOM ---
    socket.on("join:room", async ({ doctorId }) => {
      const room = `doctor-${doctorId}`;
      socket.join(room);
      socket.data.doctorId = doctorId;
      console.log(`User ${socket.user.uid} joined room ${room}`);

      // Send initial state to the user
      const queue = await getActiveQueue(doctorId);
      socket.emit("queue:state", queue);
    });

    // --- PATIENT JOINS QUEUE ---
    socket.on("queue:join", async ({ doctorId }) => {
      const room = `doctor-${doctorId}`;
      const queue = await getActiveQueue(doctorId);
      io.to(room).emit("queue:updated", queue);
    });

    // --- DOCTOR CALLS NEXT PATIENT ---
    socket.on("queue:call-next", async ({ doctorId }) => {
      const room = `doctor-${doctorId}`;

      try {
        // Find the first waiting patient
        const nextPatient = await QueueEntry.findOne({
          doctorId,
          status: "waiting"
        }).sort({ position: 1 });

        if (!nextPatient) {
          socket.emit("queue:error", { message: "No patients waiting" });
          return;
        }

        // Update status to "called"
        nextPatient.status = "called";
        nextPatient.calledAt = new Date();
        await nextPatient.save();

        const queue = await getActiveQueue(doctorId);
        io.to(room).emit("queue:updated", queue);

        // Notify specific patient
        io.to(room).emit("queue:patient-called", {
          patientUid: nextPatient.patientUid,
          doctorId,
        });
      } catch (err) {
        console.error("Error in queue:call-next:", err);
        socket.emit("queue:error", { message: "Failed to call next patient" });
      }
    });

    // --- DOCTOR MARKS CONSULTATION DONE ---
    socket.on("queue:done", async ({ doctorId, entryId, patientUid }) => {
      const room = `doctor-${doctorId}`;

      try {
        let entry;
        if (entryId) {
          entry = await QueueEntry.findById(entryId);
        } else if (patientUid) {
          entry = await QueueEntry.findOne({ 
            doctorId, 
            patientUid, 
            status: { $in: ["called", "in-consultation"] } 
          });
        }
        
        if (!entry) return;

        const donePosition = entry.position;
        entry.status = "completed";
        entry.completedAt = new Date();
        await entry.save();

        // Create Consultation document automatically
        try {
          const { Doctor } = await import("../routes/doctors.js");
          const { Consultation } = await import("../routes/consultations.js");

          const doctor = await Doctor.findOne({ id: doctorId });
          const doctorName = doctor ? doctor.name : "Unknown Doctor";
          const specialty = doctor ? doctor.specialty : "General Medicine";
          const doctorInitials = doctor ? doctor.initials : "DR";

          const newConsultation = new Consultation({
            id: `cons_${Math.random().toString(36).substring(2, 9)}`,
            patientUid: entry.patientUid,
            doctorId: doctorId,
            doctorName: doctorName,
            doctorInitials: doctorInitials,
            specialty: specialty,
            date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
            duration: "10 mins",
            status: "Completed",
            summary: entry.reason || "General Consultation",
          });
          await newConsultation.save();
          console.log(`Successfully created Consultation document for ${entry.patientUid}`);
        } catch (consultationErr) {
          console.error("Error creating Consultation document on queue:done:", consultationErr);
        }

        // Recalculate positions and wait times for remaining patients
        const remainingEntries = await QueueEntry.find({
          doctorId,
          position: { $gt: donePosition },
          status: { $in: ["waiting", "called", "in-consultation"] }
        });

        for (const remEntry of remainingEntries) {
          remEntry.position -= 1;
          remEntry.estimatedWaitMins = (remEntry.position - 1) * 6;
          await remEntry.save();
        }

        const queue = await getActiveQueue(doctorId);
        io.to(room).emit("queue:updated", queue);
      } catch (err) {
        console.error("Error in queue:done:", err);
      }
    });

    // --- PATIENT LEAVES QUEUE ---
    socket.on("queue:leave", async ({ doctorId }) => {
      const room = `doctor-${doctorId}`;
      const queue = await getActiveQueue(doctorId);
      io.to(room).emit("queue:updated", queue);
    });

    // --- DOCTOR SKIPS PATIENT ---
    socket.on("queue:skip", async ({ doctorId, entryId }) => {
      const room = `doctor-${doctorId}`;

      try {
        const entry = await QueueEntry.findById(entryId);
        if (!entry) return;

        const oldPosition = entry.position;

        // Move to the end of the "waiting" list
        const maxEntry = await QueueEntry.findOne({
          doctorId,
          status: "waiting"
        }).sort({ position: -1 });

        const maxPosition = maxEntry ? maxEntry.position : oldPosition;

        if (maxPosition > oldPosition) {
            // Shift down entries between skipped position and end
            const shiftedEntries = await QueueEntry.find({
              doctorId,
              position: { $gt: oldPosition, $lte: maxPosition },
              status: "waiting"
            });

            for (const shiftEntry of shiftedEntries) {
              shiftEntry.position -= 1;
              shiftEntry.estimatedWaitMins = (shiftEntry.position - 1) * 6;
              await shiftEntry.save();
            }

          entry.position = maxPosition;
          entry.estimatedWaitMins = (maxPosition - 1) * 6;
          await entry.save();
        }

        const queue = await getActiveQueue(doctorId);
        io.to(room).emit("queue:updated", queue);
      } catch (err) {
        console.error("Error in queue:skip:", err);
      }
    });

    // ── DOCTOR STARTS CALL ───────────────────────────────────────────────────────
    // After creating Daily.co room, doctor emits this to notify patient
    socket.on("call:start", ({ doctorId, patientUid, roomId, roomUrl }) => {
      const room = `doctor-${doctorId}`;
      // Broadcast to all in doctor's room — patient client filters by patientUid
      io.to(room).emit("call:incoming", { patientUid, roomId, roomUrl, doctorId });
    });

    // ── DOCTOR ENDS CALL ─────────────────────────────────────────────────────────
    socket.on("call:end", ({ doctorId, patientUid }) => {
      const room = `doctor-${doctorId}`;
      io.to(room).emit("call:ended", { patientUid });
    });

    // ── DOCTOR IS WRITING PRESCRIPTION ──────────────────────────────────────────
    socket.on("call:writing-prescription", ({ doctorId, patientUid }) => {
      const room = `doctor-${doctorId}`;
      io.to(room).emit("call:doctor-writing", { patientUid });
    });

    // ── PRESCRIPTION ISSUED ──────────────────────────────────────────────────────
    socket.on("call:prescription-done", ({ doctorId, patientUid }) => {
      const room = `doctor-${doctorId}`;
      io.to(room).emit("call:prescription-issued", { patientUid });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

// Helper: fetch active queue sorted by position
const getActiveQueue = async (doctorId) => {
  return QueueEntry.find({
    doctorId,
    status: { $in: ["waiting", "called", "in-consultation"] }
  }).sort({ position: 1 });
};
