import React from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/Button";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    variants={{
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 }
    }}
    className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col gap-4 group hover:border-cyan-500/30 transition-all cursor-default"
  >
    <div className={cn("p-3 rounded-xl w-fit", color)}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h4 className="text-3xl font-bold text-white mb-1">{value}</h4>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  </motion.div>
);

const PatientOverview = () => {
  const stats = [
    { icon: Lucide.Activity, label: "Total Consultations", value: "8", color: "bg-cyan-500/10 text-cyan-400" },
    { icon: Lucide.FileText, label: "Prescriptions", value: "3", color: "bg-purple-500/10 text-purple-400" },
    { icon: Lucide.Users, label: "Doctors Visited", value: "5", color: "bg-blue-500/10 text-blue-400" },
    { icon: Lucide.Star, label: "Avg. Rating Given", value: "4.6", color: "bg-amber-500/10 text-amber-400" },
  ];

  const activities = [
    { type: "completed", icon: Lucide.CheckCircle2, color: "text-green-400 bg-green-400/10", text: "Consultation with Dr. Sarah Mitchell completed", time: "2 days ago" },
    { type: "prescription", icon: Lucide.FileText, color: "text-blue-400 bg-blue-400/10", text: "New prescription received from Dr. James Wilson", time: "3 days ago" },
    { type: "queue", icon: Lucide.Users, color: "text-amber-400 bg-amber-400/10", text: "Joined cardiology queue for Dr. Sarah Mitchell", time: "4 days ago" },
    { type: "completed", icon: Lucide.CheckCircle2, color: "text-green-400 bg-green-400/10", text: "Consultation with Dr. Elena Rodriguez completed", time: "1 week ago" },
    { type: "profile", icon: Lucide.UserCircle, color: "text-purple-400 bg-purple-400/10", text: "Profile information updated", time: "2 weeks ago" },
  ];

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
        <h2 className="text-2xl font-bold text-white mb-1">Health Overview</h2>
        <p className="text-gray-500">Welcome back! Here's what's happening with your health profile.</p>
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
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Lucide.History className="w-5 h-5 text-cyan-400" />
                Recent Activity
              </h3>
              <button className="text-xs text-cyan-400 hover:underline">View All</button>
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
                    <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-white/5" />
                  )}
                  <div className={cn("p-2 rounded-full", activity.color)}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-300 text-sm leading-tight mb-1">{activity.text}</p>
                    <p className="text-gray-500 text-xs">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Queue Status Card */}
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Lucide.Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
              Active Queue
            </h3>
            <p className="text-cyan-100/70 text-sm mb-4">No active queue. Find a doctor to get started.</p>
            <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white border-none shadow-lg shadow-cyan-500/20 py-2.5 h-auto text-sm" asChild>
              <Link to="/doctors">Find a Doctor</Link>
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
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
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 group transition-all"
                >
                  <action.icon className="w-6 h-6 text-gray-500 group-hover:text-cyan-400 mb-2 transition-colors" />
                  <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{action.label}</span>
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
