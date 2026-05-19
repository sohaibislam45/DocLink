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
    socket.on("queue:done", async ({ doctorId, entryId }) => {
      const room = `doctor-${doctorId}`;

      try {
        const entry = await QueueEntry.findById(entryId);
        if (!entry) return;

        const donePosition = entry.position;
        entry.status = "completed";
        entry.completedAt = new Date();
        await entry.save();

        // Recalculate positions for remaining patients
        await QueueEntry.updateMany(
          { 
            doctorId, 
            position: { $gt: donePosition }, 
            status: { $in: ["waiting", "called"] } 
          },
          { $inc: { position: -1 } }
        );

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
          await QueueEntry.updateMany(
            { 
              doctorId, 
              position: { $gt: oldPosition, $lte: maxPosition }, 
              status: "waiting" 
            },
            { $inc: { position: -1 } }
          );

          entry.position = maxPosition;
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
