import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/AlertDialog";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/utils";
import useConsultationTimer from "../../hooks/useConsultationTimer";
import Swal from "sweetalert2";

const initialQueue = [
  { id: "q-001", name: "Patient A", reason: "Chest discomfort", joinedAt: "9:02 AM", waitMins: 12 },
  { id: "q-002", name: "Patient B", reason: "Skin rash follow-up", joinedAt: "9:14 AM", waitMins: 9 },
  { id: "q-003", name: "Patient C", reason: "Anxiety consultation", joinedAt: "9:23 AM", waitMins: 11 },
  { id: "q-004", name: "Patient D", reason: "Blood pressure check", joinedAt: "9:31 AM", waitMins: 8 },
];

const DoctorQueuePage = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState(initialQueue);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [completedPatients, setCompletedPatients] = useState([]);
  const [skipTarget, setSkipTarget] = useState(null);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [completedDurations, setCompletedDurations] = useState([]);

  const { formattedTime, elapsed, reset: resetTimer } = useConsultationTimer(!!currentPatient);

  const callNext = () => {
    if (queue.length === 0) return;
    const [next, ...rest] = queue;
    setCurrentPatient(next);
    setQueue(rest);
    resetTimer();
  };

  const confirmSkip = () => {
    if (!skipTarget) return;
    setQueue((prev) => {
      const idx = prev.findIndex((p) => p.id === skipTarget.id);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated.splice(idx, 1);
      updated.push(skipTarget);
      return updated;
    });
    setSkipTarget(null);
  };

  const endConsultation = () => {
    if (!currentPatient) return;
    const duration = formattedTime;
    setCompletedPatients((prev) => [...prev, { ...currentPatient, duration }]);
    setCurrentPatient(null);
    resetTimer();
    setShowEndDialog(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Queue Management</h2>
        <p className="text-gray-500">Manage your patient queue and active consultations in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Queue List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-lg">Waiting Patients</h3>
              <p className="text-gray-500 text-sm">Click 'Call Next' to start the next consultation</p>
            </div>
            <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-sm font-semibold px-3 py-1 rounded-full">
              {queue.length} waiting
            </span>
          </div>

          {/* Queue rows */}
          <div className="space-y-3">
            <AnimatePresence>
              {queue.map((patient, idx) => (
                <motion.div
                  key={patient.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4"
                >
                  <span className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-sm font-bold shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{patient.name}</p>
                    <p className="text-gray-500 text-xs truncate">{patient.reason}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-gray-500 text-xs hidden sm:flex items-center gap-1">
                      <Lucide.Clock className="w-3 h-3" />
                      {patient.joinedAt}
                    </span>
                    <span className="text-gray-600 text-xs hidden md:block">~{patient.waitMins} min wait</span>
                    <button
                      onClick={() => setSkipTarget(patient)}
                      className="p-2 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-400/10 transition-all"
                      title="Skip patient"
                    >
                      <Lucide.SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty state */}
            {queue.length === 0 && !currentPatient && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center bg-white/[0.02] border border-white/5 rounded-2xl"
              >
                <Lucide.CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
                <h4 className="text-white font-semibold mb-1">All caught up!</h4>
                <p className="text-gray-500 text-sm">No patients waiting.</p>
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
                className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <Lucide.UserCheck className="w-10 h-10 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Ready to Start</h3>
                  <p className="text-gray-500 text-sm mt-1">Call the next patient to begin the consultation</p>
                </div>
                <Button
                  onClick={callNext}
                  disabled={queue.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-600/20 h-12 font-semibold"
                >
                  <Lucide.PhoneCall className="w-5 h-5 mr-2" />
                  Call Next Patient
                </Button>
              </motion.div>
            ) : (
              /* Active consultation */
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 border border-cyan-500/30 rounded-2xl overflow-hidden"
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
                      {currentPatient.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-white text-xl font-semibold">{currentPatient.name}</p>
                      <p className="text-gray-400 text-sm">{currentPatient.reason}</p>
                      <p className="text-gray-500 text-xs mt-1 flex items-center justify-center gap-1">
                        <Lucide.Clock className="w-3 h-3" />
                        Joined at {currentPatient.joinedAt}
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
                          `/doctor/prescriptions/new?patient=${encodeURIComponent(currentPatient.name)}&reason=${encodeURIComponent(currentPatient.reason)}`
                        )
                      }
                      className="w-full bg-white/5 border-white/15 text-white hover:bg-white/10 h-11"
                    >
                      <Lucide.FilePlus className="w-4 h-4 mr-2" />
                      Write Prescription
                    </Button>
                    <Button
                      onClick={() => setShowEndDialog(true)}
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
            <h3 className="text-white font-semibold">Today's Completed Sessions</h3>
            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">
              {completedPatients.length}
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-white/10 text-xs text-gray-500 font-medium uppercase tracking-wider">
              <span>Patient</span>
              <span>Reason</span>
              <span>Duration</span>
              <span className="text-right">Action</span>
            </div>
            <div className="divide-y divide-white/5">
              <AnimatePresence>
                {completedPatients.map((p, idx) => (
                  <motion.div
                    key={`${p.id}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-4 gap-4 px-6 py-4 items-center"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {p.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="text-white text-sm font-medium truncate">{p.name}</span>
                    </div>
                    <span className="text-gray-400 text-sm truncate">{p.reason}</span>
                    <span className="text-cyan-400 font-semibold text-sm tabular-nums">{p.duration}</span>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          Swal.fire({
                            title: "Coming Soon",
                            text: "Patient records coming soon.",
                            icon: "info",
                            background: "#0A0F1E",
                            color: "#fff",
                            confirmButtonColor: "#2563eb",
                          })
                        }
                        className="text-gray-400 hover:text-white text-xs border border-white/10 hover:border-white/20 h-8 px-3"
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

      {/* Skip AlertDialog */}
      <AlertDialog open={!!skipTarget} onOpenChange={(open) => !open && setSkipTarget(null)}>
        <AlertDialogContent className="bg-[#0D1526] border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Skip this patient?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {skipTarget?.name} will be moved to the end of the queue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSkip}
              className="bg-amber-500 hover:bg-amber-600 text-white border-none"
            >
              Skip Patient
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* End Consultation AlertDialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent className="bg-[#0D1526] border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>End Consultation?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will mark the session as complete and move to the next patient.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={endConsultation}
              className="bg-blue-600 hover:bg-blue-700 text-white border-none"
            >
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DoctorQueuePage;
