import React from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useSocketQueue } from "../../hooks/useSocketQueue";
import { getSocket } from "../../lib/socket";
import { cn } from "../../lib/utils";

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-background-secondary border border-border p-6 rounded-3xl shadow-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-3 rounded-2xl", color)}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className={cn(
          "text-xs font-bold px-2 py-1 rounded-lg",
          trend.startsWith("+") ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
        )}>
          {trend}
        </span>
      )}
    </div>
    <h4 className="text-text-secondary text-sm font-medium">{label}</h4>
    <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
  </motion.div>
);

const DoctorOverview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { queue, loading } = useSocketQueue({ id: user?.uid });
  const socket = getSocket();

  const waitingPatients = queue.filter(p => p.status === "waiting");
  const currentPatient = queue.find(p => p.status === "called" || p.status === "in-consultation");

  const callNext = () => {
    if (!socket) return;
    socket.emit("queue:call-next", { doctorId: user.uid });
  };

  const stats = [
    { icon: Lucide.Users, label: "Patients in Queue", value: waitingPatients.length.toString(), color: "bg-blue-500/10 text-blue-500" },
    { icon: Lucide.Activity, label: "Today's Consultations", value: "12", trend: "+15%", color: "bg-emerald-500/10 text-emerald-500" },
    { icon: Lucide.Clock, label: "Avg. Wait Time", value: "14 min", trend: "-5%", color: "bg-amber-500/10 text-amber-500" },
    { icon: Lucide.Star, label: "Patient Rating", value: "4.9", trend: "+0.2", color: "bg-purple-500/10 text-purple-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Welcome back, Dr. {user?.displayName?.split(" ")[1] || "Doc"}</h2>
          <p className="text-text-secondary mt-1">You have {waitingPatients.length} patients waiting in your queue today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={callNext}
            disabled={waitingPatients.length === 0 || !!currentPatient}
            className="bg-accent-primary hover:bg-accent-primary/90 text-white rounded-2xl px-6 h-12 font-semibold shadow-lg shadow-accent-primary/20"
          >
            <Lucide.PhoneCall className="w-5 h-5 mr-2" />
            Call Next Patient
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Queue Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Lucide.ListOrdered className="w-5 h-5 text-accent-primary" />
              Queue Preview
            </h3>
            <Link to="/doctor/queue" className="text-accent-primary text-sm font-semibold hover:underline">
              View Full Queue
            </Link>
          </div>

          <div className="bg-background-secondary border border-border rounded-3xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-8 flex justify-center">
                <Lucide.Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
              </div>
            ) : waitingPatients.length > 0 ? (
              <div className="divide-y divide-border">
                {waitingPatients.slice(0, 4).map((patient, idx) => (
                  <div key={patient._id} className="p-5 flex items-center gap-4 hover:bg-background-tertiary transition-colors">
                    <div className="w-10 h-10 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center font-bold text-sm">
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary font-semibold text-sm truncate">{patient.patientName}</p>
                      <p className="text-text-secondary text-xs truncate">{patient.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-text-primary font-medium text-xs">
                        {new Date(patient.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-text-secondary text-[10px]">~{patient.estimatedWaitMins} min wait</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lucide.CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h4 className="text-text-primary font-semibold">Queue is empty</h4>
                <p className="text-text-secondary text-sm mt-1">Take a break or update your availability.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Active Consultation */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-text-primary">Quick Actions</h3>
          <div className="grid gap-4">
            {currentPatient ? (
              <div className="bg-accent-primary rounded-3xl p-6 text-white shadow-xl shadow-accent-primary/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">
                  <Lucide.Activity className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <span className="inline-block bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-3 uppercase tracking-wider">
                    In Consultation
                  </span>
                  <h4 className="text-xl font-bold mb-1 truncate">{currentPatient.patientName}</h4>
                  <p className="text-white/80 text-sm mb-6">{currentPatient.reason}</p>
                  <Button className="w-full bg-white text-accent-primary hover:bg-white/90 border-none rounded-2xl font-bold">
                    Join Video Call
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-background-secondary border border-border border-dashed rounded-3xl p-6 text-center">
                <Lucide.Video className="w-10 h-10 text-text-secondary/30 mx-auto mb-3" />
                <p className="text-text-secondary text-sm">No active session</p>
              </div>
            )}

            <Button 
              variant="outline" 
              asChild
              className="w-full h-14 rounded-2xl border-border hover:bg-background-tertiary text-text-primary justify-start px-6"
            >
              <Link to="/doctor/prescriptions/new">
                <Lucide.FilePlus className="w-5 h-5 mr-3 text-accent-primary" />
                New Prescription
              </Link>
            </Button>

            <Button 
              variant="outline"
              asChild
              className="w-full h-14 rounded-2xl border-border hover:bg-background-tertiary text-text-primary justify-start px-6"
            >
              <Link to="/doctor/availability">
                <Lucide.Calendar className="w-5 h-5 mr-3 text-amber-500" />
                Update Availability
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorOverview;
