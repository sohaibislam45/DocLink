import { jsPDF } from "jspdf";

/**
 * Generates and downloads a branded prescription PDF.
 * Same logic for both Doctor and Patient sides.
 */
export const downloadPrescriptionPDF = ({
  form,
  medicines,
  doctorName,
  doctorSpeciality,
  dateStr,
  prescriptionId
}) => {
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

    // 3. Rx SECTION
    const rxSectionY = infoY + 18;

    // Left side: large italic "Rx" symbol
    doc.setTextColor(16, 185, 129);
    doc.setFont("times", "italic");
    doc.setFontSize(36);
    doc.text("Rx", 20, rxSectionY + 10);

    // Draw ECG wave line
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

    // 4. MEDICINES
    const medX = 75;
    let currentY = rxSectionY;
    doc.setTextColor(50, 50, 50);

    const validMeds = (medicines || []).filter(m => m && m.name);
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
    currentY = Math.max(currentY, rxSectionY + 38);

    // 5. ADDITIONAL NOTES
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

    // 6. SIGNATURE SECTION
    const sigY = 248;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 85, sigY, pageWidth - 20, sigY);

    doc.setFont("times", "italic");
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text(doctorName, pageWidth - 52.5, sigY - 4, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text("SIGNATURE", pageWidth - 52.5, sigY + 5, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(dateStr, pageWidth - 52.5, sigY + 9, { align: "center" });

    // 7. FOOTER
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 282, pageWidth, 15, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("DocLink Healthcare", 20, 291);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Uttara Sector 10, Dhaka  |  Phone: 01812345678", pageWidth - 20, 291, { align: "right" });

    const safeName = (form.patientName || "rx").replace(/\s+/g, "_");
    const safeDate = (dateStr || "date").replace(/\s+/g, "_");
    doc.save(`DocLink_Rx_${safeName}_${safeDate}.pdf`);
  } catch (err) {
    console.error(err);
    alert("Error generating PDF. Please try again.");
  }
};
