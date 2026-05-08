import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select";
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
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import Swal from "sweetalert2";

const FREQ_OPTIONS = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "As needed",
];

const emptyMedicine = () => ({
  id: crypto.randomUUID(),
  name: "",
  dosage: "",
  frequency: "Once daily",
  duration: "",
});

const todayFormatted = () => {
  const d = new Date();
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const DoctorPrescriptionWriter = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    patientName: searchParams.get("patient") || "",
    age: "",
    gender: "",
    diagnosis: searchParams.get("reason") || "",
    notes: "",
  });
  const [medicines, setMedicines] = useState([emptyMedicine()]);
  const [generated, setGenerated] = useState(false);
  const [errors, setErrors] = useState({});
  const [showClearDialog, setShowClearDialog] = useState(false);

  const doctorName = user?.displayName || "Doctor";
  const dateStr = todayFormatted();

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleMedChange = (id, field, value) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
    setErrors((prev) => ({ ...prev, [`med-${id}-${field}`]: undefined }));
  };

  const addMedicine = () => {
    setMedicines((prev) => [...prev, emptyMedicine()]);
  };

  const removeMedicine = (id) => {
    if (medicines.length === 1) return;
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.patientName.trim()) newErrors.patientName = true;
    if (!form.diagnosis.trim()) newErrors.diagnosis = true;
    const validMeds = medicines.filter((m) => m.name.trim() && m.dosage.trim());
    if (validMeds.length === 0) {
      newErrors.medicines = true;
      medicines.forEach((m) => {
        if (!m.name.trim()) newErrors[`med-${m.id}-name`] = true;
        if (!m.dosage.trim()) newErrors[`med-${m.id}-dosage`] = true;
      });
    }
    return newErrors;
  };

  const handleGenerate = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Swal.fire({
        title: "Validation Error",
        text: "Please fill all required fields before generating.",
        icon: "warning",
        background: "#0A0F1E",
        color: "#fff",
        confirmButtonColor: "#2563eb",
      });
      return;
    }
    setGenerated(true);
  };

  const handleClear = () => {
    setForm({ patientName: "", age: "", gender: "", diagnosis: "", notes: "" });
    setMedicines([emptyMedicine()]);
    setGenerated(false);
    setErrors({});
    setShowClearDialog(false);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("DocLink - Medical Prescription", 20, 22);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${dateStr}`, pageWidth - 20, 22, { align: "right" });
    doc.line(20, 28, pageWidth - 20, 28);

    // Doctor
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Prescribed by: Dr. ${doctorName}`, 20, 38);
    doc.setFont("helvetica", "normal");

    // Patient
    doc.setFontSize(11);
    doc.text(`Patient: ${form.patientName}`, 20, 50);
    if (form.age) doc.text(`Age: ${form.age}`, 20, 57);
    if (form.gender) doc.text(`Gender: ${form.gender}`, 80, 57);
    doc.setFont("helvetica", "bold");
    doc.text(`Diagnosis: ${form.diagnosis}`, 20, 67);
    doc.setFont("helvetica", "normal");

    // Medicines
    doc.line(20, 74, pageWidth - 20, 74);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Medicines:", 20, 82);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    let y = 92;
    medicines.forEach((med, idx) => {
      if (!med.name) return;
      doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}. ${med.name}`, 25, y);
      doc.setFont("helvetica", "normal");
      doc.text(`   ${med.dosage} — ${med.frequency} for ${med.duration || "—"}`, 25, y + 6);
      y += 16;
    });

    // Notes
    if (form.notes) {
      doc.line(20, y, pageWidth - 20, y);
      y += 8;
      doc.setFont("helvetica", "bold");
      doc.text("Notes:", 20, y);
      doc.setFont("helvetica", "italic");
      const splitNotes = doc.splitTextToSize(form.notes, pageWidth - 40);
      doc.text(splitNotes, 20, y + 7);
    }

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Generated by DocLink Telemedicine Portal", 20, 280);

    const safeName = form.patientName.replace(/\s+/g, "_");
    const safeDate = dateStr.replace(/\s+/g, "_");
    doc.save(`DocLink_Rx_${safeName}_${safeDate}.pdf`);
  };

  const handleIssueToPatient = () => {
    Swal.fire({
      title: "Prescription Sent",
      text: "Prescription sent to patient's dashboard!",
      icon: "success",
      background: "#0A0F1E",
      color: "#fff",
      confirmButtonColor: "#2563eb",
    });
  };

  const notesMax = 500;
  const notesCount = form.notes.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Prescription Writer</h2>
        <p className="text-gray-500">Create and issue digital prescriptions to your patients.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-11 gap-6">
        {/* Left: Form */}
        <div className="xl:col-span-6 space-y-5">
          {/* Section 1: Patient Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Lucide.UserCircle className="w-5 h-5 text-cyan-400" />
              Patient Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-sm text-gray-400 font-medium">
                  Patient Name <span className="text-red-400">*</span>
                </label>
                <Input
                  value={form.patientName}
                  onChange={(e) => handleFormChange("patientName", e.target.value)}
                  placeholder="Full name"
                  className={cn(
                    "bg-white/5 border-white/10 text-white h-11",
                    errors.patientName && "border-red-500/60 focus:ring-red-500/20"
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-400 font-medium">Age</label>
                <Input
                  type="number"
                  value={form.age}
                  onChange={(e) => handleFormChange("age", e.target.value)}
                  placeholder="e.g. 32"
                  className="bg-white/5 border-white/10 text-white h-11"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-400 font-medium">Gender</label>
                <Select value={form.gender} onValueChange={(v) => handleFormChange("gender", v)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-11">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1F2E] border-white/10 text-white">
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Non-binary">Non-binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-sm text-gray-400 font-medium">
                  Diagnosis <span className="text-red-400">*</span>
                </label>
                <Input
                  value={form.diagnosis}
                  onChange={(e) => handleFormChange("diagnosis", e.target.value)}
                  placeholder="e.g. Mild hypertension"
                  className={cn(
                    "bg-white/5 border-white/10 text-white h-11",
                    errors.diagnosis && "border-red-500/60"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Medicines */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Lucide.Pill className="w-5 h-5 text-cyan-400" />
              Medicines
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {medicines.map((med, idx) => (
                  <motion.div
                    key={med.id}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                        Medicine #{idx + 1}
                      </span>
                      {medicines.length > 1 && (
                        <button
                          onClick={() => removeMedicine(med.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10"
                        >
                          <Lucide.Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">
                          Medicine Name <span className="text-red-400">*</span>
                        </label>
                        <Input
                          value={med.name}
                          onChange={(e) => handleMedChange(med.id, "name", e.target.value)}
                          placeholder="e.g. Metformin"
                          className={cn(
                            "bg-white/5 border-white/10 text-white h-9 text-sm",
                            errors[`med-${med.id}-name`] && "border-red-500/60"
                          )}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">
                          Dosage <span className="text-red-400">*</span>
                        </label>
                        <Input
                          value={med.dosage}
                          onChange={(e) => handleMedChange(med.id, "dosage", e.target.value)}
                          placeholder="e.g. 500mg"
                          className={cn(
                            "bg-white/5 border-white/10 text-white h-9 text-sm",
                            errors[`med-${med.id}-dosage`] && "border-red-500/60"
                          )}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Frequency</label>
                        <Select
                          value={med.frequency}
                          onValueChange={(v) => handleMedChange(med.id, "frequency", v)}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1A1F2E] border-white/10 text-white">
                            {FREQ_OPTIONS.map((f) => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Duration</label>
                        <Input
                          value={med.duration}
                          onChange={(e) => handleMedChange(med.id, "duration", e.target.value)}
                          placeholder="e.g. 30 days"
                          className="bg-white/5 border-white/10 text-white h-9 text-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <Button
              variant="ghost"
              onClick={addMedicine}
              className="w-full border border-dashed border-white/15 text-gray-400 hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-cyan-400/5 h-10"
            >
              <Lucide.Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
          </div>

          {/* Section 3: Notes */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Lucide.StickyNote className="w-5 h-5 text-cyan-400" />
              Additional Notes
            </h3>
            <textarea
              value={form.notes}
              onChange={(e) =>
                handleFormChange("notes", e.target.value.slice(0, notesMax))
              }
              placeholder="Additional notes, lifestyle advice, follow-up instructions..."
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 min-h-[110px] focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all text-sm resize-none placeholder:text-gray-600"
            />
            <p className="text-xs text-gray-500 text-right">
              {notesCount} / {notesMax}
            </p>
          </div>

          {/* Section 4: Doctor signature */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 flex items-center gap-3">
            <Lucide.UserCheck className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-gray-400 text-sm">
                Prescribed by:{" "}
                <span className="text-white font-semibold">Dr. {doctorName}</span>
              </p>
              <p className="text-gray-600 text-xs">{dateStr}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-none h-12 font-semibold shadow-lg shadow-blue-600/20"
            >
              <Lucide.FileCheck className="w-5 h-5 mr-2" />
              Generate Prescription
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(true)}
              className="bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 h-12 px-5"
            >
              <Lucide.RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="xl:col-span-5">
          <div className="sticky top-24">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-3 font-medium">
              Prescription Preview
            </p>

            <AnimatePresence mode="wait">
              {generated ? (
                <motion.div
                  key="generated"
                  initial={{ scale: 0.97, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Preview card with generated badge */}
                  <div className="relative">
                    <PreviewCard form={form} medicines={medicines} doctorName={doctorName} dateStr={dateStr} />
                    <span className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-semibold px-3 py-1.5 rounded-full">
                      <Lucide.Check className="w-3 h-3" />
                      Generated
                    </span>
                  </div>
                  <Button
                    onClick={handleDownloadPDF}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-none h-11 font-semibold shadow-lg shadow-emerald-600/20"
                  >
                    <Lucide.Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleIssueToPatient}
                    className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 h-11"
                  >
                    <Lucide.Send className="w-4 h-4 mr-2" />
                    Issue to Patient
                  </Button>
                  <button
                    onClick={() => setGenerated(false)}
                    className="w-full text-center text-gray-500 hover:text-cyan-400 text-sm underline underline-offset-4 transition-colors"
                  >
                    Edit Prescription
                  </button>
                </motion.div>
              ) : (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <PreviewCard form={form} medicines={medicines} doctorName={doctorName} dateStr={dateStr} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Clear confirmation dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="bg-[#0D1526] border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Form?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              All entered information will be lost. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleClear} className="bg-red-600 hover:bg-red-700 text-white border-none">
              Clear Form
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Live preview card component
const PreviewCard = ({ form, medicines, doctorName, dateStr }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 font-mono text-sm">
    {/* Header */}
    <div className="flex items-center justify-between border-b border-white/10 pb-4">
      <div>
        <p className="text-cyan-400 font-bold text-base tracking-tight">DocLink Rx</p>
        <p className="text-gray-500 text-xs">Telemedicine Prescription</p>
      </div>
      <p className="text-gray-500 text-xs">{dateStr}</p>
    </div>

    {/* Patient info */}
    <div className="space-y-1">
      <div className="flex gap-2">
        <span className="text-gray-500 text-xs w-20">Patient</span>
        <span className="text-white font-semibold">{form.patientName || "—"}</span>
      </div>
      <div className="flex gap-2">
        <span className="text-gray-500 text-xs w-20">Age / Gender</span>
        <span className="text-white">
          {form.age || "—"} / {form.gender || "—"}
        </span>
      </div>
      <div className="flex gap-2">
        <span className="text-gray-500 text-xs w-20">Diagnosis</span>
        <span className="text-amber-400 font-medium">{form.diagnosis || "—"}</span>
      </div>
    </div>

    {/* Medicines */}
    <div className="border-t border-white/10 pt-3">
      <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Medicines</p>
      {medicines.filter((m) => m.name).length === 0 ? (
        <p className="text-gray-600 italic text-xs">No medicines added yet</p>
      ) : (
        <div className="space-y-2">
          {medicines.map((med, idx) =>
            med.name ? (
              <div key={med.id} className="text-xs">
                <span className="text-white font-semibold">
                  {idx + 1}. {med.name}
                </span>{" "}
                <span className="text-gray-400">
                  {med.dosage && `(${med.dosage})`} — {med.frequency}
                  {med.duration && `, ${med.duration}`}
                </span>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>

    {/* Notes */}
    {form.notes && (
      <div className="border-t border-white/10 pt-3">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Notes</p>
        <p className="text-gray-300 text-xs italic leading-relaxed line-clamp-4">{form.notes}</p>
      </div>
    )}

    {/* Signature */}
    <div className="border-t border-white/10 pt-3">
      <p className="text-gray-500 text-xs">Dr. {doctorName}</p>
      <p className="text-gray-600 text-xs">DocLink Medical Provider</p>
    </div>
  </div>
);

export default DoctorPrescriptionWriter;
