import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/utils";
import useConsultationTimer from "../../hooks/useConsultationTimer";
import useAuth from "../../hooks/useAuth";
import { useSocketQueue } from "../../hooks/useSocketQueue";
import { createRoom } from "../../api/rooms";
import { showSuccess, showError, showInfo, showConfirm } from "../../lib/swal";

const DoctorQueuePage = () => {
  const navigate = useNavigate();
  const { user, socket } = useAuth();
  
  // Initialize real-time queue
  // In this app, doctorId usually corresponds to the user.uid
  const { queue, loading, error: queueError } = useSocketQueue({ id: user?.uid });
  
  const [currentPatient, setCurrentPatient] = useState(null);
  const [completedPatients, setCompletedPatients] = useState([]);

  // Sync current patient from queue
  useEffect(() => {
    const active = queue.find(p => p.status === "called" || p.status === "in-consultation");
    setCurrentPatient(active || null);
  }, [queue]);

  const { formattedTime, reset: resetTimer } = useConsultationTimer(!!currentPatient);

  const handleCallNext = async () => {
    if (!socket || waitingPatients.length === 0) return;
    
    const nextPatient = waitingPatients[0]; // the one being called

    // 1. Emit Socket.io queue event
    socket.emit("queue:call-next", { doctorId: user.uid });
    resetTimer();

    try {
      // 2. Create Daily.co room
      const { roomId, roomName, roomUrl } = await createRoom({
        doctorId: user.uid,
        patientUid: nextPatient.patientUid,
      });

      // 3. Notify patient via Socket.io
      socket.emit("call:start", {
        doctorId: user.uid,
        patientUid: nextPatient.patientUid,
        roomId,
        roomUrl,
      });

      // 4. Navigate doctor to call room
      navigate(`/room/${roomId}`);
    } catch (err) {
      console.error("Failed to create room:", err);
      const isAuthError = err.message?.includes("authentication-error");
      const errorMsg = isAuthError 
        ? "Invalid Daily.co API key. Please configure a valid DAILY_API_KEY in your backend .env file."
        : (err.message || "Failed to create video room.");
      showError(errorMsg, "Error");
    }
  };



  const endConsultation = () => {
    if (!currentPatient || !socket) return;
    const duration = formattedTime;
    
    socket.emit("queue:done", { doctorId: user.uid, entryId: currentPatient._id });
    
    setCompletedPatients((prev) => [...prev, { ...currentPatient, duration }]);
    setCurrentPatient(null);
    resetTimer();
  };

  const handleMarkAsDone = async () => {
    const isConfirmed = await showConfirm(
      "This will mark the session as complete and move to the next patient.",
      "End Consultation?",
      "warning",
      "End Session"
    );
    if (isConfirmed) {
      endConsultation();
    }
  };

  const waitingPatients = queue.filter(p => p.status === "waiting");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Lucide.Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-1">Queue Management</h2>
        <p className="text-text-secondary">Manage your patient queue and active consultations in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Queue List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-text-primary font-semibold text-lg">Waiting Patients</h3>
              <p className="text-text-secondary text-sm">Click 'Call Next' to start the next consultation</p>
            </div>
            <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-sm font-semibold px-3 py-1 rounded-full">
              {waitingPatients.length} waiting
            </span>
          </div>

          {/* Queue rows */}
          <div className="space-y-3">
            <AnimatePresence>
              {waitingPatients.map((patient, idx) => (
                <motion.div
                  key={patient._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="bg-background-secondary border border-border rounded-2xl p-4 flex items-center gap-4"
                >
                  <span className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-sm font-bold shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary font-semibold text-sm">{patient.patientName}</p>
                    <p className="text-text-secondary text-xs truncate">{patient.reason}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-text-secondary text-xs hidden sm:flex items-center gap-1">
                      <Lucide.Clock className="w-3 h-3" />
                      {new Date(patient.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-text-secondary/60 text-xs hidden md:block">~{patient.estimatedWaitMins} min wait</span>

                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty state */}
            {waitingPatients.length === 0 && !currentPatient && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center bg-background-secondary/50 border border-border rounded-2xl"
              >
                <Lucide.CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
                <h4 className="text-text-primary font-semibold mb-1">All caught up!</h4>
                <p className="text-text-secondary text-sm">No patients waiting.</p>
                {completedPatients.length > 0 && (
                  <p className="text-gray-600 text-xs mt-2">
                    Great session today! You've seen {completedPatients.length} patient{completedPatients.length !== 1 ? "s" : ""}.
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Right: Current Consultation Panel */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!currentPatient ? (
              /* Idle state */
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-background-secondary border border-border rounded-2xl p-8 flex flex-col items-center text-center gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <Lucide.UserCheck className="w-10 h-10 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-text-primary font-semibold text-lg">Ready to Start</h3>
                  <p className="text-text-secondary text-sm mt-1">Click on &quot;Join the call&quot; to begin the consultation</p>
                </div>
                <Button
                  onClick={handleCallNext}
                  disabled={waitingPatients.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-600/20 h-12 font-semibold"
                >
                  <Lucide.PhoneCall className="w-5 h-5 mr-2" />
                  Join the Call
                </Button>
              </motion.div>
            ) : (
              /* Active consultation */
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-background-secondary border border-accent-primary/30 rounded-2xl overflow-hidden"
              >
                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
                <div className="p-6 space-y-6">
                  {/* In Consultation badge */}
                  <div className="flex justify-end">
                    <span className="flex items-center gap-2 bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-semibold px-3 py-1.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      In Consultation
                    </span>
                  </div>

                  {/* Patient info */}
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                      {currentPatient.patientName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-text-primary text-xl font-semibold">{currentPatient.patientName}</p>
                      <p className="text-text-secondary text-sm">{currentPatient.reason}</p>
                      <p className="text-text-secondary/60 text-xs mt-1 flex items-center justify-center gap-1">
                        <Lucide.Clock className="w-3 h-3" />
                        Joined at {new Date(currentPatient.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="text-center">
                    <p className="text-5xl font-bold text-blue-400 tabular-nums">{formattedTime}</p>
                    <p className="text-gray-500 text-sm mt-1">Consultation in progress</p>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(
                          `/doctor/prescriptions/new?patient=${encodeURIComponent(currentPatient.patientName)}&reason=${encodeURIComponent(currentPatient.reason)}&uid=${encodeURIComponent(currentPatient.patientUid)}`
                        )
                      }
                      className="w-full bg-background-secondary border-border text-text-primary hover:bg-background-tertiary h-11"
                    >
                      <Lucide.FilePlus className="w-4 h-4 mr-2" />
                      Write Prescription
                    </Button>
                    <Button
                      onClick={handleMarkAsDone}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-600/20 h-11 font-semibold"
                    >
                      <Lucide.CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Done
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Completed Sessions Log */}
      {completedPatients.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-text-primary font-semibold">Today's Completed Sessions</h3>
            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">
              {completedPatients.length}
            </span>
          </div>
          <div className="bg-background-secondary border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-border text-xs text-text-secondary font-medium uppercase tracking-wider">
              <span>Patient</span>
              <span>Reason</span>
              <span>Duration</span>
              <span className="text-right">Action</span>
            </div>
            <div className="divide-y divide-border">
              <AnimatePresence>
                {completedPatients.map((p, idx) => (
                  <motion.div
                    key={`${p._id}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-4 gap-4 px-6 py-4 items-center"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {p.patientName.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="text-text-primary text-sm font-medium truncate">{p.patientName}</span>
                    </div>
                    <span className="text-text-secondary text-sm truncate">{p.reason}</span>
                    <span className="text-accent-primary font-semibold text-sm tabular-nums">{p.duration}</span>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          showInfo("Patient records coming soon.", "Coming Soon")
                        }
                        className="text-text-secondary hover:text-text-primary text-xs border border-border hover:border-text-secondary/20 h-8 px-3"
                      >
                        View Record
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorQueuePage;
