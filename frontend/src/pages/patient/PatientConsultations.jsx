import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";
import { Link } from "react-router-dom";
import { fetchMyConsultations } from "../../api/consultations";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { cn } from "../../lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/Avatar";

const ConsultationCard = ({ consultation }) => {
  const doctorInitials = consultation.doctorInitials || (consultation.doctorName ? consultation.doctorName.replace("Dr. ", "").split(" ").map(n => n[0]).join("").toUpperCase() : "DR");
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-background-secondary border border-border/80 rounded-2xl p-6 hover:border-accent-primary/40 transition-all group shadow-sm"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Doctor Info */}
        <div className="flex items-center gap-4 min-w-[200px]">
          <Avatar className="h-14 w-14 border-2 border-background-tertiary shrink-0">
            <AvatarImage src={consultation.doctorAvatar} alt={consultation.doctorName} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-accent-primary to-accent-secondary text-white font-bold text-lg">
              {doctorInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-text-primary font-semibold group-hover:text-accent-primary transition-colors">
              {consultation.doctorName}
            </h4>
            <p className="text-text-secondary/70 text-sm font-medium">{consultation.specialty}</p>
          </div>
        </div>

        {/* Center: Details */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <div className="flex items-center gap-1.5 font-medium">
              <Lucide.Calendar className="w-4 h-4 text-accent-primary/60" />
              {consultation.date}
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Lucide.Clock className="w-4 h-4 text-accent-primary/60" />
              {consultation.duration}
            </div>
          </div>
          <p className="text-text-secondary text-sm italic line-clamp-2 leading-relaxed">
            "{consultation.summary || "General checkup and consultation session."}"
          </p>
        </div>

        {/* Right: Status & Actions */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 hover:bg-green-500/10 font-bold px-3 py-1">
            {consultation.status}
          </Badge>
          {consultation.prescriptionId && (
            <Button variant="ghost" className="text-xs h-8 text-accent-primary hover:text-white hover:bg-accent-primary rounded-lg transition-all" asChild>
              <Link to="/patient/prescriptions">
                View Prescription
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

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
          <h2 className="text-2xl font-bold text-text-primary mb-1">My Consultations</h2>
          <p className="text-text-secondary">View and manage your consultation history.</p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-background-secondary border border-border p-1 rounded-xl flex gap-1 self-start w-full md:w-auto shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 md:flex-none ${
                activeTab === tab.id
                  ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
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
              <div className="flex flex-col items-center justify-center py-10 text-center bg-background-secondary rounded-2xl border border-border">
                <Lucide.AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                <p className="text-text-secondary">Failed to load consultations.</p>
              </div>
            ) : consultations.length > 0 ? (
              consultations.map((consultation) => (
                <ConsultationCard key={consultation.id} consultation={consultation} />
              ))
            ) : (
              <div className="text-center py-20 text-text-secondary italic bg-background-secondary border border-border rounded-2xl">
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
                className="bg-background-secondary border border-border/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-accent-primary/40 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center">
                    <Lucide.Users className="w-6 h-6 text-accent-primary" />
                  </div>
                  <div>
                    <h4 className="text-text-primary font-semibold">{item.doctorName}</h4>
                    <p className="text-text-secondary text-sm font-medium">{item.date}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-text-secondary font-medium">
                  <span className="bg-background-tertiary px-3 py-1 rounded-full border border-border">
                    Position {item.position}
                  </span>
                  <span className="bg-background-tertiary px-3 py-1 rounded-full border border-border">
                    Wait: {item.waitTime}
                  </span>
                </div>
                <Badge className={cn(
                  "px-3 py-1 font-bold",
                  item.status === "Consulted" 
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" 
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
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

