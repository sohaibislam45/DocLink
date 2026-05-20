import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";
import { jsPDF } from "jspdf";
import { Link } from "react-router-dom";
import { fetchMyPrescriptions } from "../../api/prescriptions";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";

const PrescriptionCard = ({ rx }) => {
  const doctorName = rx.doctorName || "Doctor";
  const doctorInitials = rx.doctorInitials || (doctorName ? doctorName.replace("Dr. ", "").split(" ").map(n => n[0]).join("").toUpperCase() : "DR");
  const specialty = rx.specialty || "Telehealth Specialist";
  const dateStr = rx.date || "May 20, 2026";
  const diagnosis = rx.diagnosis || "General Medical Checkup";
  const medicines = rx.medicines || [];
  const notes = rx.notes || "Take prescribed medicines as directed. Drink plenty of water and rest.";
  const isValid = rx.valid !== undefined ? rx.valid : true;

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Top Header Accent (Emerald Green)
      doc.setDrawColor(16, 185, 129); 
      doc.setLineWidth(1.5);
      doc.line(20, 15, 190, 15);
      
      // Clinic Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(16, 185, 129);
      doc.text("DOCLINK TELEMEDICINE NETWORK", 20, 22);

      // Doctor Info
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(doctorName, 20, 32);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(specialty, 20, 38);
      doc.text(`Registry No: DL-${(rx.id || "RX999").slice(-5).toUpperCase()}`, 20, 43);
      
      // Clinic Helpline
      doc.setFontSize(9);
      doc.text("Helpline: support@doclink.com", 140, 38);
      doc.text("Web: www.doclink.com", 140, 43);

      // Divider line
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.5);
      doc.line(20, 48, 190, 48);
      
      // Patient Info Grid
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(20, 52, 170, 20, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85); // slate-700
      doc.text("Patient Name:", 24, 60);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(rx.patientName || "Valued Patient", 50, 60);
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(51, 65, 85);
      doc.text("Date:", 135, 60);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(dateStr, 146, 60);

      doc.setFont("helvetica", "bold");
      doc.text("Diagnosis:", 24, 67);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(diagnosis, 43, 67);

      // Main content Rx Symbol (Emerald Green)
      doc.setFont("times", "bolditalic");
      doc.setFontSize(32);
      doc.setTextColor(16, 185, 129);
      doc.text("Rx", 20, 88);
      
      // Medicines
      let y = 98;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      
      medicines.forEach((med, index) => {
        if (y > 220) {
          doc.addPage();
          y = 30;
        }
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`${index + 1}. ${med.name || "Prescribed Medicine"}`, 25, y);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`${med.dosage || "1 Tab"} — ${med.frequency || "As directed"} (${med.duration || "Until recovery"})`, 30, y + 5.5);
        y += 15;
      });
      
      if (y > 230) {
        doc.addPage();
        y = 30;
      }
      
      doc.setDrawColor(226, 232, 240);
      doc.line(20, y + 5, 190, y + 5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text("Clinical Notes / Instructions:", 20, y + 14);
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      
      const splitNotes = doc.splitTextToSize(notes, 160);
      doc.text(splitNotes, 20, y + 20);
      
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.line(130, 255, 190, 255);
      
      doc.setFont("times", "bolditalic");
      doc.setFontSize(16);
      doc.setTextColor(16, 185, 129);
      doc.text(`Dr. ${doctorInitials}`, 145, 249);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("Authorized Signature", 142, 260);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text("This is an electronically generated prescription. Verified by DocLink HealthID.", 20, 280);
      
      const safeDocName = doctorName.replace(/\s+/g, '_');
      const safeDate = dateStr.replace(/\s+/g, '_');
      doc.save(`DocLink_Rx_${safeDocName}_${safeDate}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-background-secondary border border-border rounded-2xl overflow-hidden shadow-xl transition-all hover:shadow-2xl hover:border-accent-primary/20"
    >
      <div className="p-6 sm:p-10 relative">
        {/* Top styling band matching accent primary */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-primary to-accent-secondary" />
        
        {/* Pad Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-border pb-6 mb-6">
          <div>
            <span className="text-[10px] font-bold text-accent-primary uppercase tracking-widest bg-accent-primary/10 px-2.5 py-1 rounded-md">
              DocLink Telemedicine Network
            </span>
            <h3 className="text-text-primary font-bold text-2xl mt-2 tracking-tight">
              {doctorName}
            </h3>
            <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider mt-0.5">
              {specialty}
            </p>
            <p className="text-text-secondary/60 text-[11px] mt-1">
              Registry No: <span className="font-mono text-text-primary font-medium">DL-{(rx.id || "RX999").slice(-5).toUpperCase()}</span>
            </p>
          </div>
          
          <div className="text-left sm:text-right shrink-0">
            <p className="text-text-secondary/60 text-[11px] uppercase tracking-wider font-semibold">Date of Issue</p>
            <p className="text-text-primary font-bold text-sm mt-0.5">{dateStr}</p>
            <p className="text-text-secondary/60 text-[10px] mt-2">Case ID: <span className="font-mono text-text-primary font-medium">#{rx.id || "N/A"}</span></p>
          </div>
        </div>

        {/* Patient Metadata Box */}
        <div className="bg-background-tertiary border border-border rounded-xl p-4 sm:p-5 flex flex-wrap items-center gap-y-3 justify-between mb-8">
          <div className="min-w-[150px]">
            <p className="text-text-secondary/60 text-[10px] uppercase tracking-wider font-semibold">Patient Name</p>
            <p className="text-text-primary font-bold text-sm mt-0.5">{rx.patientName || "Valued Patient"}</p>
          </div>
          <div className="min-w-[100px]">
            <p className="text-text-secondary/60 text-[10px] uppercase tracking-wider font-semibold">Diagnosis</p>
            <span className="inline-block bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-semibold px-2.5 py-1 rounded-md mt-0.5">
              {diagnosis}
            </span>
          </div>
        </div>

        {/* Prescription Pad Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Rx Symbol Column */}
          <div className="md:col-span-1 flex justify-start md:justify-center items-start shrink-0">
            <span className="font-serif italic font-extrabold text-accent-primary text-5xl tracking-tighter leading-none select-none">
              Rx
            </span>
          </div>

          {/* Medicines & Dosage Column */}
          <div className="md:col-span-11 space-y-5">
            <h4 className="text-text-primary font-bold text-xs uppercase tracking-widest border-b border-border pb-2">
              Prescribed Medicines
            </h4>
            
            {medicines.length > 0 ? (
              <div className="space-y-4">
                {medicines.map((med, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-5 h-5 rounded-full bg-background-tertiary border border-border flex items-center justify-center text-text-secondary font-mono text-xs font-semibold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-text-primary font-bold text-sm leading-snug">{med.name || "Medicine Name"}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-text-secondary text-xs">
                        <span className="bg-background-tertiary border border-border text-text-secondary px-2 py-0.5 rounded font-medium">
                          {med.dosage || "1 Tab"}
                        </span>
                        <span className="text-text-secondary/40">•</span>
                        <span>{med.frequency || "Once daily"}</span>
                        <span className="text-text-secondary/40">•</span>
                        <span className="text-text-secondary/60 font-medium">Duration: {med.duration || "5 days"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary/50 text-xs italic">No medicines listed in this prescription.</p>
            )}
          </div>
        </div>

        {/* Doctor's Notes Section */}
        <div className="bg-background-tertiary border-l-4 border-accent-primary rounded-r-xl p-5 mb-8">
          <p className="text-text-secondary/60 text-[10px] uppercase tracking-wider font-bold mb-1">
            Clinical Notes / Instructions
          </p>
          <p className="text-text-primary text-sm italic leading-relaxed">
            "{notes}"
          </p>
        </div>

        {/* Footer Pad Row */}
        <div className="flex flex-col sm:flex-row items-end justify-between gap-6 pt-6 border-t border-border mt-10">
          <div className="flex items-center gap-2 shrink-0">
            {isValid ? (
              <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Active Prescription
              </span>
            ) : (
              <span className="inline-flex items-center bg-background-tertiary text-text-secondary border border-border text-xs font-semibold px-3 py-1.5 rounded-full">
                Expired
              </span>
            )}
            <span className="text-text-secondary/50 text-[10px] tracking-tight">Verified Digital Document</span>
          </div>

          {/* Doctor Signature Stamp */}
          <div className="flex flex-col items-center sm:items-end shrink-0 select-none">
            <div className="font-serif italic font-extrabold text-accent-primary text-lg leading-tight tracking-wider transform -rotate-2 bg-accent-primary/5 px-3 py-1 border border-accent-primary/10 rounded-lg">
              Dr. {doctorInitials}
            </div>
            <div className="w-32 h-[1px] bg-border mt-1" />
            <p className="text-text-secondary/50 text-[10px] uppercase mt-1">Authorized Signature</p>
          </div>
        </div>

        {/* Bottom Download & Share Bar */}
        <div className="flex justify-end mt-6">
          <Button 
            onClick={downloadPDF}
            className="bg-accent-primary hover:brightness-110 text-white border-none px-6 py-2.5 h-auto text-xs font-bold flex items-center gap-2 active:scale-95 transition-all shadow-lg shadow-accent-primary/20 rounded-xl"
          >
            <Lucide.Download className="w-4 h-4" />
            Download Official Copy
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <h2 className="text-2xl font-bold text-white mb-1">My Prescriptions</h2>
        <p className="text-gray-500">Access and download your digital prescriptions.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />
          ))
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 border border-white/10 rounded-2xl">
            <Lucide.AlertCircle className="w-10 h-10 text-red-500 mb-4" />
            <p className="text-text-secondary">Failed to load prescriptions.</p>
          </div>
        ) : prescriptions.length > 0 ? (
          prescriptions.map((rx) => (
            <PrescriptionCard key={rx.id} rx={rx} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 border border-white/10 rounded-2xl">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Lucide.FileX className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Prescriptions Yet</h3>
            <p className="text-gray-500 max-w-sm mb-6">
              Your digital prescriptions will appear here once your consultations are complete.
            </p>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white" asChild>
              <Link to="/doctors">Find a Doctor</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientPrescriptions;
