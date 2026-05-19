import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { motion } from "framer-motion";
import {
  LayoutDashboard, UserCheck, Users, CreditCard,
  Settings, LogOut, Shield
} from "lucide-react";
import { swalConfirm } from "../../lib/swal.js";
import { ThemeToggleButton } from "../common/ThemeToggleButton.jsx";

const navItems = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/admin/doctors",   icon: UserCheck,       label: "Manage Doctors" },
  { to: "/admin/patients",  icon: Users,           label: "Manage Patients" },
  { to: "/admin/payments",  icon: CreditCard,      label: "Payments" },
  { to: "/admin/settings",  icon: Settings,        label: "System Settings" },
];

export default function AdminDashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await swalConfirm("Sign Out?", "You will be logged out of the admin panel.", "Sign Out");
    if (result.isConfirmed) {
      await logout();
      navigate("/login/admin");
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0A0F1E]">

      {/* ── Sidebar ── */}
      <motion.aside
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 shrink-0 sticky top-0 h-screen flex flex-col
                   bg-[#F0FDF9] dark:bg-[#0D1526]
                   border-r border-red-500/10 dark:border-red-500/10"
      >
        {/* Logo */}
        {/* <div className="flex items-center gap-2 px-6 py-5
                        border-b border-red-500/10 dark:border-red-500/10">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center
                          justify-center border border-red-500/20">
            <Shield className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="font-bold text-sm text-[#0F172A] dark:text-white">DocLink</p>
            <p className="text-xs text-red-500 font-medium">Admin Panel</p>
          </div>
        </div> */}

        {/* Admin info */}
        <div className="px-6 py-4 border-b border-red-500/10 dark:border-red-500/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center
                            justify-center border border-red-500/20 text-sm font-bold text-red-500">
              {user?.email?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-[#0F172A] dark:text-white truncate">
                {user?.displayName || "Administrator"}
              </p>
              <p className="text-xs text-[#475569] dark:text-[#8B9FC4] truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                   font-medium transition-colors ${
                    isActive
                      ? "bg-red-500/10 text-red-500 border-l-2 border-red-500"
                      : "text-[#475569] dark:text-[#8B9FC4] hover:bg-red-500/5 hover:text-red-500"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-4 py-4 border-t border-red-500/10 dark:border-red-500/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                       font-medium w-full text-left
                       text-[#475569] dark:text-[#8B9FC4]
                       hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between
                        px-8 py-4 border-b
                        bg-white/80 dark:bg-[#0A0F1E]/80
                        border-red-500/10 dark:border-red-500/10
                        backdrop-blur-md">
          <p className="text-sm font-medium text-[#475569] dark:text-[#8B9FC4]">
            Admin Panel
          </p>
          <ThemeToggleButton />
        </div>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
