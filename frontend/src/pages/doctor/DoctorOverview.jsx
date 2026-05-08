import React from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/Button";

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const StatCard = ({ icon: Icon, label, value, trend, trendColor }) => (
  <motion.div
    variants={cardVariants}
    className="bg-background-secondary border border-border rounded-2xl p-6 flex flex-col gap-4 hover:border-accent-primary/30 transition-all cursor-default group shadow-sm"
  >
    <div className="flex items-center justify-between">
      <div className="p-3 rounded-xl bg-accent-primary/10">
        <Icon className="w-6 h-6 text-accent-primary" />
      </div>
      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", trendColor)}>{trend}</span>
    </div>
    <div>
      <h4 className="text-3xl font-bold text-text-primary mb-1">{value}</h4>
      <p className="text-text-secondary text-sm">{label}</p>
    </div>
  </motion.div>
);

const queuePatients = [
  { pos: 1, name: "Patient A", reason: "Chest pain", wait: "~5 mins", status: "In Consultation" },
  { pos: 2, name: "Patient B", reason: "Skin rash", wait: "~18 mins", status: "Waiting" },
  { pos: 3, name: "Patient C", reason: "Follow-up", wait: "~30 mins", status: "Waiting" },
];

const statusStyle = {
  "In Consultation": "bg-accent-primary/15 text-accent-primary border border-accent-primary/30",
  Waiting: "bg-warning/15 text-warning border border-warning/30",
  Completed: "bg-success/15 text-success border border-success/30",
};

const activities = [
  { icon: Lucide.CheckCircle2, color: "text-success bg-success/10", text: "Consultation with Patient A completed", time: "18 mins ago" },
  { icon: Lucide.FileText, color: "text-accent-primary bg-accent-primary/10", text: "Prescription issued to Patient B", time: "42 mins ago" },
  { icon: Lucide.Clock, color: "text-warning bg-warning/10", text: "Patient C joined the queue", time: "1 hour ago" },
  { icon: Lucide.CheckCircle2, color: "text-success bg-success/10", text: "Consultation with Patient D completed", time: "2 hours ago" },
];

const DoctorOverview = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: Lucide.Users, label: "Total Patients", value: "142", trend: "+8 this week", trendColor: "bg-success/10 text-success" },
    { icon: Lucide.Stethoscope, label: "Consultations Today", value: "6", trend: "3 remaining", trendColor: "bg-warning/10 text-warning" },
    { icon: Lucide.FileText, label: "Prescriptions Issued", value: "38", trend: "+3 today", trendColor: "bg-success/10 text-success" },
    { icon: Lucide.Star, label: "Average Rating", value: "4.8", trend: "Based on 214 reviews", trendColor: "bg-text-secondary/10 text-text-secondary" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-1">Doctor Dashboard</h2>
        <p className="text-text-secondary">Welcome back! Here's your clinical overview for today.</p>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Today's Queue Snapshot */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 bg-background-secondary border border-border rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-text-primary font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Today's Queue
            </h3>
            <Button
              size="sm"
              onClick={() => navigate("/doctor/queue")}
              className="bg-accent-primary hover:bg-accent-primary/90 text-white border-none text-xs h-8 px-4 shadow-lg shadow-accent-primary/20"
            >
              Manage Queue
            </Button>
          </div>
          <div className="p-4 space-y-3">
            {queuePatients.map((p) => (
              <div
                key={p.pos}
                className="flex items-center gap-4 p-4 bg-background-primary border border-border rounded-xl"
              >
                <span className="w-8 h-8 rounded-full bg-accent-primary/20 text-accent-primary flex items-center justify-center text-sm font-bold shrink-0">
                  #{p.pos}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary font-semibold text-sm truncate">{p.name}</p>
                  <p className="text-text-secondary text-xs truncate">{p.reason}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-text-secondary text-xs hidden sm:block">{p.wait}</span>
                  <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", statusStyle[p.status])}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-background-secondary border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-text-primary font-semibold flex items-center gap-2">
              <Lucide.History className="w-5 h-5 text-accent-primary" />
              Recent Activity
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {activities.map((activity, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.08 }}
                className="flex items-start gap-4 relative"
              >
                {idx !== activities.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-border" />
                )}
                <div className={cn("p-2 rounded-full shrink-0", activity.color)}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm leading-tight mb-1">{activity.text}</p>
                  <p className="text-text-secondary text-xs">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorOverview;
