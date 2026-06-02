import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";
import PrescriptionPreviewCard from "../../components/common/PrescriptionPreviewCard";
import { useSearchParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import { showSuccess, showError, showConfirm } from "../../lib/swal";
import { medicineSchema, prescriptionSchema } from "../../schemas/prescriptionSchema";
import { createPrescription } from "../../api/prescriptions";

const FREQ_OPTIONS = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "As needed",
];

const todayFormatted = () => {
  const d = new Date();
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const DoctorPrescriptionWriter = () => {
  const { user, profile, socket } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [generated, setGenerated] = useState(false);
  const [rxId] = useState(() => `RX-${Math.random().toString(16).substring(2, 10).toUpperCase()}`);

  const doctorName = user?.displayName || "Doctor";
  const doctorSpeciality = profile?.speciality || "";
  const dateStr = todayFormatted();
  const patientUid = searchParams.get("uid") || "demo_patient_uid";
  const roomId = searchParams.get("roomId") || null;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientName: searchParams.get("patient") || "",
      age: "",
      gender: "",
      weight: "",
      diagnosis: searchParams.get("reason") || "",
      notes: "",
      medicines: [
        { name: "", dosage: "", frequency: "Once daily", duration: "" }
      ],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medicines",
  });

  const formValues = watch();
  const medicinesValue = formValues.medicines || [];
  const notesMax = 500;
  const notesCount = (formValues.notes || "").length;

  const addMedicine = () => {
    append({ name: "", dosage: "", frequency: "Once daily", duration: "" });
  };

  const removeMedicine = (index) => {
    if (fields.length === 1) return;
    remove(index);
  };

  const handleGenerate = async (data) => {
    try {
      const payload = {
        id: rxId,
        patientUid: patientUid,
        doctorId: user.uid,
        doctorName: doctorName,
        date: dateStr,
        diagnosis: data.diagnosis,
        medicines: data.medicines.map(m => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
        })),
        notes: data.notes,
      };
      await createPrescription(payload);
      setGenerated(true);
      reset(data);
      showSuccess("Prescription issued and sent to patient's dashboard successfully!", "Prescription Sent");

      // Notify the patient that prescription is ready (removes "Doctor is writing" screen)
      if (socket) {
        socket.emit("call:prescription-done", {
          doctorId: user.uid,
          patientUid: patientUid,
        });

        // Also mark the queue entry as done to clear them from the queue
        socket.emit("queue:done", {
          doctorId: user.uid,
          patientUid: patientUid,
        });
      }
    } catch (err) {
      showError("Failed to issue prescription.", "Error");
    }
  };

  const onInvalid = (errors) => {
    showError("Please fill all required fields before generating.", "Validation Error");
  };

  const handleClear = () => {
    reset({
      patientName: "",
      age: "",
      gender: "",
      weight: "",
      diagnosis: "",
      notes: "",
      medicines: [
        { name: "", dosage: "", frequency: "Once daily", duration: "" }
      ],
    });
    setGenerated(false);
  };

  const triggerClear = async () => {
    const isConfirmed = await showConfirm(
      "All entered information will be lost. Are you sure?",
      "Clear Form?",
      "warning",
      "Clear Form"
    );
    if (isConfirmed) {
      handleClear();
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // 1. BRANDED HEADER SECTION
      doc.setFillColor(16, 185, 129); // #10B981
      doc.rect(0, 0, pageWidth, 45, "F");

      // Doctor info on header
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text(`Dr. ${doctorName.replace("Dr. ", "")}`, 20, 22);

      if (doctorSpeciality) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(doctorSpeciality.toUpperCase(), 20, 30);
      }

      // Top right doclink text badge
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("DocLink", pageWidth - 20, 20, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text("OFFICIAL DIGITAL PRESCRIPTION", pageWidth - 20, 27, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255, 0.7);
      doc.text(`ID: ${rxId}`, pageWidth - 20, 34, { align: "right" });

      // 2. PATIENT INFO GRID (Underlined fields)
      doc.setTextColor(50, 50, 50);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);

      let infoY = 62;
      // Row 1: Patient Name & Date
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("PATIENT NAME:", 20, infoY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(formValues.patientName || "Valued Patient", 50, infoY);
      doc.line(50, infoY + 2, 130, infoY + 2);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("DATE:", 140, infoY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(dateStr || "", 155, infoY);
      doc.line(155, infoY + 2, pageWidth - 20, infoY + 2);

      // Row 2: Age, Gender, Weight
      infoY += 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("AGE:", 20, infoY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(String(formValues.age || ""), 32, infoY);
      doc.line(32, infoY + 2, 60, infoY + 2);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("GENDER:", 70, infoY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(formValues.gender || "", 90, infoY);
      doc.line(90, infoY + 2, 130, infoY + 2);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("WEIGHT:", 140, infoY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(formValues.weight ? `${formValues.weight} kg` : "—", 160, infoY);
      doc.line(160, infoY + 2, pageWidth - 20, infoY + 2);

      // Row 3: Diagnosis
      infoY += 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("DIAGNOSIS:", 20, infoY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(16, 185, 129); // Accent color for emphasis
      doc.text(formValues.diagnosis || "General checkup", 45, infoY);
      doc.line(45, infoY + 2, pageWidth - 20, infoY + 2);

      // 3. Rx SECTION — left column: Rx symbol + ECG, right column: medicines
      const rxSectionY = infoY + 18;

      // Left side: large italic "Rx" symbol
      doc.setTextColor(16, 185, 129);
      doc.setFont("times", "italic");
      doc.setFontSize(36);
      doc.text("Rx", 20, rxSectionY + 10);

      // Draw ECG wave line below Rx symbol
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(1.2);
      const ex = 20, ey = rxSectionY + 18;
      doc.line(ex, ey, ex + 10, ey);
      doc.line(ex + 10, ey, ex + 14, ey - 10);
      doc.line(ex + 14, ey - 10, ex + 19, ey + 10);
      doc.line(ex + 19, ey + 10, ex + 24, ey - 5);
      doc.line(ex + 24, ey - 5, ex + 28, ey + 2);
      doc.line(ex + 28, ey + 2, ex + 32, ey);
      doc.line(ex + 32, ey, ex + 47, ey);

      // 4. MEDICINES — listed to the right of the Rx symbol, starting at x=75
      const medX = 75;
      let currentY = rxSectionY;
      doc.setTextColor(50, 50, 50);

      const validMeds = medicinesValue.filter(m => m && m.name);
      if (validMeds.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text("No medicines prescribed.", medX, currentY + 6);
        currentY += 20;
      } else {
        validMeds.forEach((med) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(16, 185, 129);
          doc.text(med.name, medX, currentY + 6);

          if (med.dosage) {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(50, 50, 50);
            const nameWidth = doc.getTextWidth(med.name);
            doc.text(med.dosage, medX + nameWidth + 4, currentY + 6);
          }

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(80, 80, 80);
          const detailStr = `${med.frequency}${med.duration ? ` for ${med.duration}` : ""}`;
          doc.text(detailStr, medX, currentY + 12.5);

          currentY += 18;
        });
      }
      // Advance below whichever is taller: Rx column or medicines column
      currentY = Math.max(currentY, rxSectionY + 38);


      // 5. ADDITIONAL NOTES SECTION
      if (formValues.notes) {
        currentY += 4;
        doc.setDrawColor(240, 240, 240);
        doc.line(20, currentY, pageWidth - 20, currentY);
        currentY += 8;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(120, 120, 120);
        doc.text("ADDITIONAL NOTES:", 20, currentY);

        doc.setFont("times", "italic");
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const splitNotes = doc.splitTextToSize(formValues.notes, pageWidth - 40);
        doc.text(splitNotes, 20, currentY + 5.5);
      }

      // 6. DOCTOR SIGNATURE SECTION (Times Italic simulates Autograph)
      const sigY = 248;
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.5);
      doc.line(pageWidth - 85, sigY, pageWidth - 20, sigY);

      doc.setFont("times", "italic");
      doc.setFontSize(16);
      doc.setTextColor(16, 185, 129); // Signature accent color
      doc.text(doctorName, pageWidth - 52.5, sigY - 4, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text("SIGNATURE", pageWidth - 52.5, sigY + 5, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(dateStr, pageWidth - 52.5, sigY + 9, { align: "center" });

      // 7. BRANDED FOOTER BAR
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 282, pageWidth, 15, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("DocLink Healthcare", 20, 291);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Uttara Sector 10, Dhaka  |  Phone: 01812345678", pageWidth - 20, 291, { align: "right" });

      const safeName = formValues.patientName.replace(/\s+/g, "_");
      const safeDate = dateStr.replace(/\s+/g, "_");
      doc.save(`DocLink_Rx_${safeName}_${safeDate}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF. Please try again.");
    }
  };



  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-1">Prescription Writer</h2>
        <p className="text-text-secondary">Create and issue digital prescriptions to your patients.</p>
      </div>

      <form onSubmit={handleSubmit(handleGenerate, onInvalid)} className="grid grid-cols-1 xl:grid-cols-11 gap-6">
        {/* Left: Form */}
        <div className="xl:col-span-6 space-y-5">
          {/* Section 1: Patient Info */}
          <div className="bg-background-secondary border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-text-primary font-semibold flex items-center gap-2">
              <Lucide.UserCircle className="w-5 h-5 text-accent-primary" />
              Patient Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-sm text-gray-400 font-medium">
                  Patient Name <span className="text-red-400">*</span>
                </label>
                <Input
                  {...register("patientName")}
                  placeholder="Full name"
                  className={cn(
                    "bg-background-tertiary border-border text-text-primary h-11",
                    errors.patientName && "border-red-500/60 focus:ring-red-500/20"
                  )}
                />
                {errors.patientName && <p className="text-red-400 text-xs">{errors.patientName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-400 font-medium">Age</label>
                <Input
                  type="number"
                  min={0}
                  max={150}
                  {...register("age")}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
                  }}
                  placeholder="e.g. 32"
                  className={cn(
                    "bg-background-tertiary border-border text-text-primary h-11",
                    errors.age && "border-red-500/60"
                  )}
                />
                {errors.age && <p className="text-red-400 text-xs">{errors.age.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-400 font-medium">Gender</label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-background-tertiary border-border text-text-primary h-11">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-background-secondary border-border text-text-primary">
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Non-binary">Non-binary</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-400 font-medium">Weight <span className="text-gray-500 font-normal">(kg)</span></label>
                <Input
                  type="number"
                  min={0}
                  {...register("weight")}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
                  }}
                  placeholder="e.g. 70"
                  className={cn(
                    "bg-background-tertiary border-border text-text-primary h-11",
                    errors.weight && "border-red-500/60"
                  )}
                />
                {errors.weight && <p className="text-red-400 text-xs">{errors.weight.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400 font-medium">
                Diagnosis <span className="text-red-400">*</span>
              </label>
              <Input
                {...register("diagnosis")}
                placeholder="e.g. Mild hypertension"
                className={cn(
                  "bg-background-tertiary border-border text-text-primary h-11",
                  errors.diagnosis && "border-red-500/60"
                )}
              />
              {errors.diagnosis && <p className="text-red-400 text-xs">{errors.diagnosis.message}</p>}
            </div>
          </div>

          {/* Section 2: Medicines */}
          <div className="bg-background-secondary border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-text-primary font-semibold flex items-center gap-2">
              <Lucide.Pill className="w-5 h-5 text-accent-primary" />
              Medicines
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {fields.map((field, idx) => (
                  <motion.div
                    key={field.id}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-background-tertiary border border-border rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                        Medicine #{idx + 1}
                      </span>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedicine(idx)}
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
                          {...register(`medicines.${idx}.name`)}
                          placeholder="e.g. Metformin"
                          className={cn(
                            "bg-background-secondary border-border text-text-primary h-9 text-sm",
                            errors.medicines?.[idx]?.name && "border-red-500/60"
                          )}
                        />
                        {errors.medicines?.[idx]?.name && (
                          <p className="text-red-400 text-[10px] mt-0.5">{errors.medicines[idx].name.message}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">
                          Dosage <span className="text-red-400">*</span>
                        </label>
                        <Input
                          {...register(`medicines.${idx}.dosage`)}
                          placeholder="e.g. 500mg"
                          className={cn(
                            "bg-background-secondary border-border text-text-primary h-9 text-sm",
                            errors.medicines?.[idx]?.dosage && "border-red-500/60"
                          )}
                        />
                        {errors.medicines?.[idx]?.dosage && (
                          <p className="text-red-400 text-[10px] mt-0.5">{errors.medicines[idx].dosage.message}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Frequency</label>
                        <Controller
                          name={`medicines.${idx}.frequency`}
                          control={control}
                          render={({ field: selectField }) => (
                            <Select
                              value={selectField.value}
                              onValueChange={selectField.onChange}
                            >
                              <SelectTrigger className="bg-background-secondary border-border text-text-primary h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                               <SelectContent className="bg-background-secondary border-border text-text-primary">
                                {FREQ_OPTIONS.map((f) => (
                                  <SelectItem key={f} value={f}>{f}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Duration</label>
                        <Input
                          {...register(`medicines.${idx}.duration`)}
                          placeholder="e.g. 30 days"
                          className="bg-background-secondary border-border text-text-primary h-9 text-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={addMedicine}
              className="w-full border border-dashed border-border text-text-secondary hover:text-accent-primary hover:border-accent-primary/40 hover:bg-accent-primary/5 h-10"
            >
              <Lucide.Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
            {errors.medicines?.message && (
              <p className="text-red-400 text-xs text-center">{errors.medicines.message}</p>
            )}
          </div>

          {/* Section 3: Notes */}
          <div className="bg-background-secondary border border-border rounded-2xl p-6 space-y-3">
            <h3 className="text-text-primary font-semibold flex items-center gap-2">
              <Lucide.StickyNote className="w-5 h-5 text-accent-primary" />
              Additional Notes
            </h3>
            <textarea
              {...register("notes")}
              maxLength={notesMax}
              placeholder="Additional notes, lifestyle advice, follow-up instructions..."
              className={cn(
                "w-full bg-background-tertiary border border-border text-text-primary rounded-xl p-3 min-h-[110px] focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all text-sm resize-none placeholder:text-text-secondary/50",
                errors.notes && "border-red-500/60"
              )}
            />
            <div className="flex justify-between text-xs">
              <span className="text-red-400">{errors.notes?.message}</span>
              <span className="text-gray-500">{notesCount} / {notesMax}</span>
            </div>
          </div>

          {/* Section 4: Doctor signature */}
          <div className="bg-background-secondary/50 border border-border rounded-2xl p-4 flex items-center gap-3">
            <Lucide.UserCheck className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-text-secondary text-sm">
                Prescribed by:{" "}
                <span className="text-text-primary font-semibold">Dr. {doctorName}</span>
              </p>
              <p className="text-text-secondary/50 text-xs">{dateStr}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-none h-12 font-semibold shadow-lg shadow-blue-600/20 disabled:opacity-50"
              disabled={!isDirty}
            >
              <Lucide.Send className="w-5 h-5 mr-2" />
              Send to Patient
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={triggerClear}
              className="bg-background-secondary border-border text-text-secondary hover:text-text-primary hover:bg-background-tertiary h-12 px-5"
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
                  <PrescriptionPreviewCard form={formValues} medicines={medicinesValue} doctorName={doctorName} doctorSpeciality={doctorSpeciality} dateStr={dateStr} prescriptionId={rxId} />
                    <span className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-semibold px-3 py-1.5 rounded-full z-30">
                      <Lucide.Check className="w-3 h-3" />
                      Issued & Sent
                    </span>
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-start gap-3">
                    <Lucide.CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-text-primary text-sm font-semibold">Prescription Issued!</p>
                      <p className="text-text-secondary text-xs mt-1">This prescription has been sent directly to the patient's dashboard.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={handleDownloadPDF}
                      className="flex-1 bg-white border border-white/10 text-black hover:bg-white/10 h-11"
                    >
                      <Lucide.Download className="w-4 h-4 mr-2" />
                      Download Copy
                    </Button>
                    <Button
                      type="button"
                      onClick={() => navigate("/doctor/dashboard")}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-none h-11 font-semibold"
                    >
                      Dashboard
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGenerated(false)}
                    className="w-full text-center text-gray-500 hover:text-cyan-400 text-sm underline underline-offset-4 transition-colors"
                  >
                    Edit / Revise
                  </button>
                </motion.div>
              ) : (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <PrescriptionPreviewCard form={formValues} medicines={medicinesValue} doctorName={doctorName} doctorSpeciality={doctorSpeciality} dateStr={dateStr} prescriptionId={rxId} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </form>
    </div>
  );
};
export default DoctorPrescriptionWriter;
