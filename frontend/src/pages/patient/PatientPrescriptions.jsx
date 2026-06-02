import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";
import { Link } from "react-router-dom";
import { fetchMyPrescriptions } from "../../api/prescriptions";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import PrescriptionPreviewCard from "../../components/common/PrescriptionPreviewCard";
import { downloadPrescriptionPDF } from "../../utils/prescriptionPdf";
import Pagination from "../../components/common/Pagination";

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
  const [page, setPage]                   = useState(1);
  const [total, setTotal]                 = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchMyPrescriptions({ page, limit: 10 });
        setPrescriptions(data.prescriptions || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [page]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-1">My Prescriptions</h2>
        <p className="text-text-secondary">Access and download your digital prescriptions.</p>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-12">
        {loading ? (
          <div className="space-y-8">
            <Skeleton className="h-[700px] w-full rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-background-secondary border border-border rounded-2xl">
            <Lucide.AlertCircle className="w-10 h-10 text-red-500 mb-4" />
            <p className="text-text-secondary">Failed to load prescriptions.</p>
          </div>
        ) : prescriptions.length > 0 ? (
          <>
            {/* LATEST PRESCRIPTION SECTION */}
            {page === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 px-1">
                  <div className="p-2 bg-accent-primary/10 rounded-lg">
                    <Lucide.Star className="w-5 h-5 text-accent-primary fill-accent-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">Latest Prescription</h3>
                    <p className="text-xs text-text-secondary">Your most recent medical record from the doctor</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <PrescriptionPreviewCard {...toCardProps(prescriptions[0])} />
                  <div className="flex justify-end">
                    <Button
                      onClick={() => downloadPrescriptionPDF(toCardProps(prescriptions[0]))}
                      className="bg-accent-primary hover:brightness-110 text-white border-none px-8 py-3 h-auto text-sm font-bold flex items-center gap-2 active:scale-95 transition-all shadow-xl shadow-accent-primary/20 rounded-2xl"
                    >
                      <Lucide.Download className="w-5 h-5" />
                      Download Official PDF
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PREVIOUS HISTORY SECTION */}
            {(prescriptions.length > 1 || page > 1) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 pt-6"
              >
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background-tertiary rounded-lg">
                      <Lucide.History className="w-5 h-5 text-text-secondary" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary">Medical History</h3>
                  </div>
                  <span className="text-xs font-semibold text-text-secondary bg-background-tertiary px-3 py-1 rounded-full border border-border">
                    {total - (page === 1 ? 1 : 0)} Total Records
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {prescriptions.slice(page === 1 ? 1 : 0).map((rx) => {
                    const props = toCardProps(rx);
                    return (
                      <motion.div
                        key={rx.id || rx._id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-background-secondary border border-border/80 rounded-2xl p-5 hover:border-accent-primary/40 transition-all group shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-3 bg-accent-primary/10 text-accent-primary rounded-xl shrink-0">
                            <Lucide.ClipboardCheck className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-text-primary font-bold truncate group-hover:text-accent-primary transition-colors">
                              {props.doctorName}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                              <span className="flex items-center gap-1 font-medium">
                                <Lucide.Calendar className="w-3.5 h-3.5" />
                                {props.dateStr}
                              </span>
                              <span className="flex items-center gap-1 font-medium">
                                <Lucide.Stethoscope className="w-3.5 h-3.5" />
                                {props.form.diagnosis}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <Button
                            variant="ghost"
                            onClick={() => downloadPrescriptionPDF(props)}
                            className="bg-background-tertiary hover:bg-accent-primary/10 text-text-secondary hover:text-accent-primary border-none text-xs font-bold flex-1 md:flex-none shadow-none"
                          >
                            <Lucide.Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <div className="pt-8 text-center pb-20">
              <Pagination 
                page={page} 
                total={total} 
                limit={10} 
                onPageChange={setPage} 
              />
            </div>
          </>
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

export default PatientPrescriptions;
