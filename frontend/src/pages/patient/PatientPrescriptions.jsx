import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";
import { jsPDF } from "jspdf";
import { Link } from "react-router-dom";
import { fetchMyPrescriptions } from "../../api/prescriptions";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import PrescriptionPreviewCard from "../../components/common/PrescriptionPreviewCard";

// Map the backend prescription object to the PrescriptionPreviewCard props shape
const toCardProps = (rx) => ({
  form: {
    patientName: rx.patientName || "Valued Patient",
    age:         rx.age        || "",
    gender:      rx.gender     || "",
    weight:      rx.weight     || "",
    diagnosis:   rx.diagnosis  || "General Checkup",
    notes:       rx.notes      || "",
  },
  medicines:        rx.medicines     || [],
  doctorName:       rx.doctorName    || "Doctor",
  doctorSpeciality: rx.specialty     || rx.speciality || "",
  dateStr:          rx.date          || "",
  prescriptionId:   rx.id            || "",
});

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchMyPrescriptions();
        setPrescriptions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-1">My Prescriptions</h2>
        <p className="text-text-secondary">Access and download your digital prescriptions.</p>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {loading ? (
          [...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-[700px] w-full rounded-2xl" />
          ))
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-background-secondary border border-border rounded-2xl">
            <Lucide.AlertCircle className="w-10 h-10 text-red-500 mb-4" />
            <p className="text-text-secondary">Failed to load prescriptions.</p>
          </div>
        ) : prescriptions.length > 0 ? (
          prescriptions.map((rx) => {
            const props = toCardProps(rx);
            return (
              <motion.div
                key={rx.id || rx._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-3"
              >
                <PrescriptionPreviewCard {...props} />

                {/* Download button below each card */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => downloadPDF(rx, props)}
                    className="bg-accent-primary hover:brightness-110 text-white border-none px-6 py-2.5 h-auto text-xs font-bold flex items-center gap-2 active:scale-95 transition-all shadow-lg shadow-accent-primary/20 rounded-xl"
                  >
                    <Lucide.Download className="w-4 h-4" />
                    Download Official Copy
                  </Button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-background-secondary border border-border rounded-2xl">
            <div className="w-20 h-20 rounded-full bg-background-tertiary flex items-center justify-center mb-6">
              <Lucide.FileX className="w-10 h-10 text-text-secondary/40" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">No Prescriptions Yet</h3>
            <p className="text-text-secondary max-w-sm mb-6">
              Your digital prescriptions will appear here once your consultations are complete.
            </p>
            <Button className="bg-accent-primary hover:brightness-110 text-white" asChild>
              <Link to="/doctors">Find a Doctor</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// PDF generation kept in the page (not the shared card) so it stays optional
const downloadPDF = (rx, { form, medicines, doctorName, doctorSpeciality, dateStr, prescriptionId }) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. BRANDED HEADER SECTION
    // Teal accent gradient bar (solid block for printable reliability)
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
      if (prescriptionId) {
        doc.setFontSize(7);
        doc.text(`ID: ${prescriptionId}`, pageWidth - 20, 34, { align: "right" });
      }

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
    doc.text(form.patientName || "Valued Patient", 50, infoY);
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
    doc.text(String(form.age || ""), 32, infoY);
    doc.line(32, infoY + 2, 60, infoY + 2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("GENDER:", 70, infoY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(form.gender || "", 90, infoY);
    doc.line(90, infoY + 2, 130, infoY + 2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("WEIGHT:", 140, infoY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(form.weight ? `${form.weight} kg` : "—", 160, infoY);
    doc.line(160, infoY + 2, pageWidth - 20, infoY + 2);

    // Row 3: Diagnosis
    infoY += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("DIAGNOSIS:", 20, infoY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129); // Accent color for emphasis
    doc.text(form.diagnosis || "General checkup", 45, infoY);
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

    const validMeds = medicines.filter(m => m && m.name);
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
    if (form.notes) {
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
      const splitNotes = doc.splitTextToSize(form.notes, pageWidth - 40);
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

    const safeName = form.patientName.replace(/\s+/g, "_");
    const safeDate = dateStr.replace(/\s+/g, "_");
    doc.save(`DocLink_Rx_${safeName}_${safeDate}.pdf`);
  } catch (err) {
    console.error(err);
    alert("Error generating PDF. Please try again.");
  }
};

export default PatientPrescriptions;

