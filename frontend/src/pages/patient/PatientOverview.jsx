import React from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchPatientStats } from "../../api/patients";
import { fetchMyQueueEntry } from "../../api/queues";
import { formatDistanceToNow } from "date-fns";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    variants={{
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 }
    }}
    className="bg-background-secondary border border-border p-6 rounded-2xl flex flex-col gap-4 group hover:border-accent-primary/30 transition-all cursor-default"
  >
    <div className={cn("p-3 rounded-xl w-fit", color)}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h4 className="text-3xl font-bold text-text-primary mb-1">{value}</h4>
      <p className="text-text-secondary text-sm">{label}</p>
    </div>
  </motion.div>
);

const PatientOverview = () => {
  const { user } = useAuth();
  const { data, isLoading: isStatsLoading } = useQuery({
    queryKey: ["patient-stats"],
    queryFn: fetchPatientStats,
  });

  const { data: queueEntry, isLoading: isQueueLoading } = useQuery({
    queryKey: ["patient-queue-entry"],
    queryFn: fetchMyQueueEntry,
    refetchInterval: 10000, // Refresh every 10 seconds to keep position updated
  });

  const isLoading = isStatsLoading || isQueueLoading;

  const stats = [
    { icon: Lucide.Activity, label: "Total Consultations", value: data?.stats?.totalConsultations || 0, color: "bg-accent-primary/10 text-accent-primary" },
    { icon: Lucide.FileText, label: "Prescriptions", value: data?.stats?.totalPrescriptions || 0, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    { icon: Lucide.Users, label: "Doctors Visited", value: data?.stats?.totalDoctors || 0, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { icon: Lucide.Star, label: "Avg. Rating Given", value: data?.stats?.avgRating || "0", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  ];

  const getActivityConfig = (type) => {
    switch (type) {
      case "completed":
        return { icon: Lucide.CheckCircle2, color: "text-green-600 dark:text-green-400 bg-green-500/10" };
      case "prescription":
        return { icon: Lucide.FileText, color: "text-blue-600 dark:text-blue-400 bg-blue-500/10" };
      default:
        return { icon: Lucide.Activity, color: "text-gray-600 bg-gray-500/10" };
    }
  };

  const activities = (data?.activities || []).map(act => ({
    ...act,
    ...getActivityConfig(act.type),
    time: act.createdAt ? formatDistanceToNow(new Date(act.createdAt), { addSuffix: true }) : act.date
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-1">Health Overview</h2>
        <p className="text-text-secondary">Welcome back, {user?.displayName?.split(' ')[0] || "Patient"}! Here's what's happening with your health profile.</p>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background-secondary border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-text-primary font-semibold flex items-center gap-2">
                <Lucide.History className="w-5 h-5 text-accent-primary" />
                Recent Activity
              </h3>
              <button className="text-xs text-accent-primary hover:underline">View All</button>
            </div>
            <div className="p-6 space-y-6">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/5 rounded" />
                      <div className="h-3 w-1/4 bg-gray-200 dark:bg-white/5 rounded" />
                    </div>
                  </div>
                ))
              ) : activities.length === 0 ? (
                <p className="text-center text-text-secondary py-4 italic">No recent activities found.</p>
              ) : (
                activities.map((activity, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.08 }}
                    className="flex items-start gap-4 relative"
                  >
                    {idx !== activities.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-border/40" />
                    )}
                    <div className={cn("p-2 rounded-full shadow-sm shrink-0", activity.color)}>
                      <activity.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-text-primary text-sm font-medium leading-relaxed mb-0.5">{activity.text}</p>
                      <p className="text-text-secondary/60 text-xs">{activity.time}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Queue Status Card */}
          <div className="bg-gradient-to-br from-accent-primary/10 to-blue-600/10 border border-accent-primary/30 rounded-2xl p-6 shadow-sm">
            <h3 className="text-text-primary font-semibold mb-2 flex items-center gap-2">
              <Lucide.Clock className={cn("w-5 h-5 text-accent-primary", queueEntry && "animate-pulse")} />
              Active Queue
            </h3>
            
            {queueEntry && queueEntry._id ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-accent-primary/10">
                  <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Your Position</span>
                  <span className="text-2xl font-black text-accent-primary">#{queueEntry.position}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-accent-primary/10">
                  <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Doctor</span>
                  <span className="text-sm font-bold text-text-primary">Dr. {queueEntry.doctorId?.replace('doc-', 'Doctor ') || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Estimated Wait</span>
                  <span className="text-sm font-bold text-emerald-500">~{queueEntry.estimatedWaitMins} mins</span>
                </div>
                <Button className="w-full bg-white dark:bg-white/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary hover:text-white transition-all py-2 h-auto text-xs font-bold" asChild>
                  <Link to={`/doctors/${queueEntry.doctorId}`}>View Status</Link>
                </Button>
              </div>
            ) : (
              <>
                <p className="text-text-secondary text-sm mb-4 italic">You have no active queue. Find a doctor to get started.</p>
                <Button className="w-full bg-accent-primary hover:brightness-110 text-white border-none shadow-lg shadow-accent-primary/20 py-2.5 h-auto text-sm" asChild>
                  <Link to="/doctors">Find a Doctor</Link>
                </Button>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-background-secondary border border-border rounded-2xl p-6">
            <h3 className="text-text-primary font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Lucide.Search, label: "Find Doctor", href: "/doctors" },
                { icon: Lucide.FileText, label: "Prescriptions", href: "/patient/prescriptions" },
                { icon: Lucide.Stethoscope, label: "Consults", href: "/patient/consultations" },
                { icon: Lucide.UserCircle, label: "Profile", href: "/patient/profile" },
              ].map((action, idx) => (
                <Link
                  key={idx}
                  to={action.href}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-background-tertiary border border-border hover:border-accent-primary/30 hover:bg-accent-primary/5 group transition-all"
                >
                  <action.icon className="w-6 h-6 text-text-secondary group-hover:text-accent-primary mb-2 transition-colors" />
                  <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientOverview;
