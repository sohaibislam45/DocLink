import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import * as Lucide from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { cn } from "../../lib/utils";

const SidebarItem = ({ icon: Icon, label, href, active }) => (
  <Link to={href}>
    <motion.div
      whileHover={{ x: 4 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
        active 
          ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/20" 
          : "text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
      )}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
        />
      )}
      <Icon className={cn("w-5 h-5", active ? "text-white" : "group-hover:text-accent-primary")} />
      <span className="font-medium">{label}</span>
    </motion.div>
  </Link>
);

const PatientDashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: Lucide.LayoutDashboard, label: "Overview", href: "/patient/dashboard" },
    { icon: Lucide.CreditCard, label: "Payment History", href: "/patient/payments" },
    { icon: Lucide.Stethoscope, label: "My Consultations", href: "/patient/consultations" },
    { icon: Lucide.FileText, label: "My Prescriptions", href: "/patient/prescriptions" },
    { icon: Lucide.UserCircle, label: "Profile & Settings", href: "/patient/profile" },
  ];

  const sidebarVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        duration: 0.4
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-background-primary flex flex-col pt-20 transition-colors duration-300">
      <div className="flex-1 flex container mx-auto px-4 gap-6 pb-8">
        {/* Sidebar */}
        <motion.aside
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
          className="w-[280px] hidden lg:flex flex-col gap-6 sticky top-24 h-[calc(100vh-120px)]"
        >
          {/* User Info */}
          <div className="bg-background-secondary border border-border rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
            <Avatar className="w-20 h-20 mb-4 border-2 border-accent-primary/30">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback className="bg-gradient-to-br from-accent-primary to-accent-secondary text-white text-2xl">
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-text-primary font-semibold truncate w-full px-2">
              {user?.displayName || "Guest User"}
            </h3>
            <p className="text-text-secondary text-xs truncate w-full px-2">
              {user?.email}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex-1 bg-background-secondary border border-border rounded-2xl p-4 flex flex-col gap-2 overflow-y-auto shadow-sm">
            {navItems.map((item) => (
              <motion.div key={item.label} variants={itemVariants}>
                <SidebarItem
                  {...item}
                  active={location.pathname === item.href}
                />
              </motion.div>
            ))}

            <div className="my-4 border-t border-border" />

            <motion.div variants={itemVariants}>
              <Link to="/doctors">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-text-primary hover:bg-background-tertiary transition-all group">
                  <Lucide.Search className="w-5 h-5 group-hover:text-accent-primary" />
                  <span className="font-medium">Find Doctors</span>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Sign Out */}
          <motion.div variants={itemVariants}>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-background-secondary border border-border text-text-secondary hover:text-danger hover:bg-danger/5 transition-all group shadow-sm"
            >
              <Lucide.LogOut className="w-5 h-5" />
              <span className="font-semibold">Sign Out</span>
            </button>
          </motion.div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-full">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background-secondary border border-border rounded-3xl p-8 min-h-[calc(100vh-120px)] shadow-sm"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboardLayout;
