import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import * as Lucide from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { cn } from "../../lib/utils";
import useDoctorOnlineStatus from "../../hooks/useDoctorOnlineStatus";

const SidebarItem = ({ icon: Icon, label, href, active, external, badge }) => {
  const content = (
    <motion.div
      whileHover={{ x: 4 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
        active
          ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/20"
          : "text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0", active ? "text-white" : "group-hover:text-accent-primary")} />
      <span className="font-medium">{label}</span>
      {badge && (
        <span className={cn(
          "ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
          active ? "bg-white text-accent-primary" : "bg-accent-primary text-white shadow-md shadow-accent-primary/30"
        )}>
          {badge}
        </span>
      )}
      {external && <Lucide.ExternalLink className="w-3 h-3 ml-auto opacity-50" />}
    </motion.div>
  );


  return <Link to={href}>{content}</Link>;
};

const DoctorDashboardLayout = () => {
  const { user, profile, socket, logout } = useAuth();
  const location = useLocation();
  const { isOnline, toggleOnline } = useDoctorOnlineStatus();
  const [queueCount, setQueueCount] = React.useState(0);

  React.useEffect(() => {
    if (!socket) return;

    // Handle initial state if already connected
    socket.on("queue:state", (queue) => {
      setQueueCount(queue.filter(e => e.status === "waiting").length);
    });

    socket.on("queue:updated", (queue) => {
      setQueueCount(queue.filter(e => e.status === "waiting").length);
    });

    return () => {
      socket.off("queue:state");
      socket.off("queue:updated");
    };
  }, [socket]);

  const navItems = [
    { icon: Lucide.LayoutDashboard, label: "Overview", href: "/doctor/dashboard" },
    { 
      icon: Lucide.Users, 
      label: "Queue Management", 
      href: "/doctor/queue",
      badge: queueCount > 0 ? queueCount : null 
    },
    { icon: Lucide.FolderOpen, label: "Patient Records", href: "/doctor/patients" },
    { icon: Lucide.FilePlus, label: "Prescription Writer", href: "/doctor/prescriptions/new" },
    { icon: Lucide.CalendarClock, label: "Availability & Profile", href: "/doctor/availability" },
  ];


  const sidebarVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        duration: 0.4,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };

  const displayName = profile?.name || user?.displayName || "Doctor";
  const photoURL = profile?.avatar || user?.photoURL;
  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "DR";

  return (
    <div className="min-h-screen bg-background-primary flex flex-col pt-20 transition-colors duration-300">
      <div className="flex-1 flex container mx-auto px-4 gap-6 pb-8">
        {/* Sidebar */}
        <motion.aside
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
          className="w-[260px] hidden lg:flex flex-col gap-4 sticky top-24 h-[calc(100vh-120px)]"
        >
          {/* Doctor Info */}
          <motion.div variants={itemVariants} className="bg-background-secondary border border-border rounded-2xl p-5 flex flex-col items-center text-center shadow-sm">
            <Avatar className="w-16 h-16 mb-3 border-2 border-accent-primary/30">
              <AvatarImage src={photoURL} />
              <AvatarFallback className="bg-gradient-to-br from-accent-primary to-accent-secondary text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-text-primary font-semibold truncate w-full px-2 text-sm">
              {displayName}
            </h3>
            <span className="mt-1.5 text-xs font-semibold bg-accent-primary/10 text-accent-primary px-3 py-1 rounded-full border border-accent-primary/20">
              Doctor
            </span>

            {/* Online / Offline Toggle */}
            <button
              onClick={toggleOnline}
              className={cn(
                "mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                isOnline
                  ? "bg-success/10 text-success border border-success/20 hover:bg-success/20"
                  : "bg-text-secondary/10 text-text-secondary border border-text-secondary/20 hover:bg-text-secondary/20"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", isOnline ? "bg-success animate-pulse" : "bg-text-secondary")} />
              {isOnline ? "Online" : "Offline"}
            </button>
          </motion.div>

          {/* Navigation */}
          <div className="flex-1 bg-background-secondary border border-border rounded-2xl p-4 flex flex-col gap-1 overflow-y-auto shadow-sm">
            {navItems.map((item) => (
              <motion.div key={item.label} variants={itemVariants}>
                <SidebarItem
                  {...item}
                  active={location.pathname === item.href || (item.href === "/doctor/prescriptions/new" && location.pathname.startsWith("/doctor/prescriptions"))}
                />
              </motion.div>
            ))}

            <div className="my-2 border-t border-border" />

            <motion.div variants={itemVariants}>
              <SidebarItem
                icon={Lucide.ExternalLink}
                label="View My Public Profile"
                href={`/doctors/${user?.uid}`}
                active={false}
                external
              />
            </motion.div>
          </div>

          {/* Sign Out */}
          <motion.div variants={itemVariants}>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-red-50/50 hover:bg-red-100/60 dark:bg-background-secondary border border-red-200/40 dark:border-border text-red-600 dark:text-text-secondary dark:hover:text-danger dark:hover:bg-danger/5 transition-all group shadow-sm"
            >
              <Lucide.LogOut className="w-5 h-5" />
              <span className="font-semibold">Sign Out</span>
            </button>
          </motion.div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-full min-w-0">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-background-secondary border border-border rounded-3xl p-6 lg:p-8 min-h-[calc(100vh-120px)] shadow-sm"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboardLayout;
