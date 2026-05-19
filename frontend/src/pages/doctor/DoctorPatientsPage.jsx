import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDoctorProfile } from "../../context/DoctorProfileContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/utils";
import { fetchPatients } from "../../api/patients";

const DoctorPatientsPage = () => {
  const navigate = useNavigate();
  const { doctor } = useDoctorProfile();
  const [query, setQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Replace with actual API calls
        const patientsData = await fetchPatients();
        setPatients(patientsData || []);
        
        // Mocking fetching specialties from API
        setSpecialties([
          { id: 1, name: "Cardiology" },
          { id: 2, name: "Dermatology" },
          { id: 3, name: "Neurology" },
          { id: 4, name: "Pediatrics" },
          { id: 5, name: "Psychiatry" },
          { id: 6, name: "Medicine" }
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-1">Patient Records</h2>
        <p className="text-text-secondary">View and manage your consultation history.</p>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <Lucide.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by patient name or diagnosis..."
          className="pl-11 bg-background-secondary border-border text-text-primary placeholder:text-text-secondary/50 h-12 focus:ring-accent-primary/30"
        />
      </motion.div>

      {/* Patient List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((patient, idx) => (
              <motion.div
                key={patient.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-background-secondary border border-border rounded-2xl p-4 flex flex-wrap items-center gap-4 hover:border-accent-primary/20 transition-all"
              >
                {/* Left: Avatar + name */}
                <div className="flex items-center gap-3 min-w-[160px]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {patient.initials}
                  </div>
                  <div>
                    <p className="text-text-primary font-semibold text-sm">{patient.name}</p>
                    <p className="text-text-secondary text-xs">
                      {patient.age} yrs · {patient.gender}
                    </p>
                  </div>
                </div>

                {/* Center: Visit info */}
                <div className="flex items-center gap-3 flex-wrap flex-1">
                  <span className="text-xs text-text-secondary flex items-center gap-1 bg-background-tertiary px-3 py-1.5 rounded-full border border-border">
                    <Lucide.Calendar className="w-3 h-3" />
                    {patient.lastVisit}
                  </span>
                  <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 text-xs font-medium px-3 py-1.5 rounded-full">
                    {patient.diagnosis}
                  </span>
                </div>

                {/* Right: Duration + Rx + button */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-text-secondary text-xs flex items-center gap-1 hidden sm:flex">
                    <Lucide.Clock className="w-3 h-3" />
                    {patient.consultationDuration}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-semibold px-3 py-1.5 rounded-full border",
                      patient.prescriptionIssued
                        ? "bg-green-500/15 text-green-400 border-green-500/20"
                        : "bg-gray-500/15 text-gray-400 border-gray-500/20"
                    )}
                  >
                    {patient.prescriptionIssued ? "Rx Issued" : "No Rx"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPatient(patient)}
                    className="bg-background-secondary border-border text-text-primary hover:bg-background-tertiary text-xs h-9 px-4"
                  >
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center bg-background-secondary/50 border border-border rounded-2xl"
            >
              <Lucide.SearchX className="w-12 h-12 text-text-secondary/30 mb-4" />
              <p className="text-text-secondary font-medium">No patients found matching</p>
              <p className="text-text-secondary/60 text-sm mt-1">"{query}"</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
        <DialogContent className="bg-background-secondary border border-border text-text-primary max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {selectedPatient?.initials}
              </div>
              <div>
                <p className="text-text-primary font-semibold">{selectedPatient?.name}</p>
                <p className="text-text-secondary text-xs font-normal">
                  {selectedPatient?.age} yrs · {selectedPatient?.gender}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-5 mt-2">
              {/* Key Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-background-tertiary rounded-xl p-3">
                  <p className="text-text-secondary text-xs mb-1">Last Visit</p>
                  <p className="text-text-primary font-medium">{selectedPatient.lastVisit}</p>
                </div>
                <div className="bg-background-tertiary rounded-xl p-3">
                  <p className="text-text-secondary text-xs mb-1">Duration</p>
                  <p className="text-text-primary font-medium">{selectedPatient.consultationDuration}</p>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <p className="text-xs text-amber-400/70 uppercase tracking-wider mb-1">Diagnosis</p>
                <p className="text-amber-300 font-semibold">{selectedPatient.diagnosis}</p>
              </div>

              {/* Notes */}
              <div className="bg-background-tertiary border border-border rounded-xl p-4">
                <p className="text-xs text-text-secondary uppercase tracking-wider mb-2">Clinical Notes</p>
                <p className="text-text-secondary text-sm leading-relaxed">{selectedPatient.notes}</p>
              </div>

              {/* Prescription status */}
              <div className="flex items-center gap-2">
                {selectedPatient.prescriptionIssued ? (
                  <span className="flex items-center gap-2 bg-green-500/15 text-green-400 border border-green-500/20 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <Lucide.CheckCircle2 className="w-3 h-3" />
                    Prescription Issued
                  </span>
                ) : (
                  <span className="flex items-center gap-2 bg-gray-500/15 text-gray-400 border border-gray-500/20 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <Lucide.XCircle className="w-3 h-3" />
                    No Prescription Issued
                  </span>
                )}
              </div>

              {/* Actions */}
              <Button
                onClick={() => {
                  setSelectedPatient(null);
                  navigate(
                    `/doctor/prescriptions/new?patient=${encodeURIComponent(selectedPatient.name)}`
                  );
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none h-11 font-semibold"
              >
                <Lucide.FilePlus className="w-4 h-4 mr-2" />
                Issue New Prescription
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorPatientsPage;
