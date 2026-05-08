import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";
import { Link } from "react-router-dom";
import { fetchMyConsultations } from "../../api/consultations";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { cn } from "../../lib/utils";

const ConsultationCard = ({ consultation }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all group"
  >
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left: Doctor Info */}
      <div className="flex items-center gap-4 min-w-[200px]">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shrink-0 border-2 border-white/5">
          {consultation.doctorInitials || "DR"}
        </div>
        <div>
          <h4 className="text-white font-semibold group-hover:text-cyan-400 transition-colors">
            {consultation.doctorName}
          </h4>
          <p className="text-gray-500 text-sm">{consultation.specialty}</p>
        </div>
      </div>

      {/* Center: Details */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1.5">
            <Lucide.Calendar className="w-4 h-4 text-cyan-500/50" />
            {consultation.date}
          </div>
          <div className="flex items-center gap-1.5">
            <Lucide.Clock className="w-4 h-4 text-cyan-500/50" />
            {consultation.duration}
          </div>
        </div>
        <p className="text-gray-400 text-sm italic line-clamp-2">
          "{consultation.summary}"
        </p>
      </div>

      {/* Right: Status & Actions */}
      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/10">
          {consultation.status}
        </Badge>
        {consultation.prescriptionId && (
          <Button variant="ghost" className="text-xs h-8 text-cyan-400 hover:text-white hover:bg-cyan-500/20 rounded-lg" asChild>
            <Link to="/patient/prescriptions">
              View Prescription
            </Link>
          </Button>
        )}
      </div>
    </div>
  </motion.div>
);

const PatientConsultations = () => {
  const [activeTab, setActiveTab] = useState("past");
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchMyConsultations();
        setConsultations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const tabs = [
    { id: "past", label: "Past Sessions", icon: Lucide.History },
    { id: "queue", label: "Queue History", icon: Lucide.Users },
  ];

  const queueHistory = [
    { id: "q-001", doctorName: "Dr. Sarah Mitchell", date: "April 20, 2025", position: "#4", waitTime: "~32 mins", status: "Consulted" },
    { id: "q-002", doctorName: "Dr. Marc Chen", date: "February 28, 2025", position: "#2", waitTime: "~15 mins", status: "Consulted" },
    { id: "q-003", doctorName: "Dr. Elena Rodriguez", date: "January 15, 2025", position: "#7", waitTime: "~45 mins", status: "Left Queue" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">My Consultations</h2>
          <p className="text-gray-500">View and manage your consultation history.</p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white/5 p-1 rounded-xl flex gap-1 self-start w-full md:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 md:flex-none ${
                activeTab === tab.id
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "past" ? (
          <motion.div
            key="past"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {loading ? (
              [...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 text-center bg-white/5 rounded-2xl border border-white/10">
                <Lucide.AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                <p className="text-text-secondary">Failed to load consultations.</p>
              </div>
            ) : consultations.length > 0 ? (
              consultations.map((consultation) => (
                <ConsultationCard key={consultation.id} consultation={consultation} />
              ))
            ) : (
              <div className="text-center py-20 text-text-secondary italic">
                No consultation history found.
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="queue"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {queueHistory.map((item) => (
              <motion.div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <Lucide.Users className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{item.doctorName}</h4>
                    <p className="text-gray-500 text-sm">{item.date}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
                  <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    Position {item.position}
                  </span>
                  <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    Wait: {item.waitTime}
                  </span>
                </div>
                <Badge className={cn(
                  "px-3 py-1",
                  item.status === "Consulted" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                )}>
                  {item.status}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientConsultations;
