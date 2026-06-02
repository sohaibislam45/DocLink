import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminStats } from "../../api/admin.js";
import { motion } from "framer-motion";
import { UserCheck, Users, CreditCard, TrendingUp, Landmark } from "lucide-react";

const fmt = (cents) => `৳ ${(cents / 100).toFixed(2)}`;

export default function AdminOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
  });

  const cards = [
    { label: "Total Doctors",      value: stats?.totalDoctors,       icon: UserCheck,  color: "text-blue-500",    bg: "bg-blue-500/10"   },
    { label: "Total Patients",     value: stats?.totalPatients,      icon: Users,      color: "text-[#12CB8E]",   bg: "bg-[#12CB8E]/10"  },
    { label: "Total Payments",     value: stats?.totalPayments,      icon: CreditCard, color: "text-amber-500",   bg: "bg-amber-500/10"  },
    { label: "Total Transactions",      value: stats?.totalRevenue  != null ? fmt(stats.totalRevenue)     : "৳0.00", icon: TrendingUp, color: "text-red-500",   bg: "bg-red-500/10"  },
    { label: "Platform Fee Earned",value: stats?.totalPlatformFee != null ? fmt(stats.totalPlatformFee) : "৳0.00", icon: Landmark,   color: "text-violet-500", bg: "bg-violet-500/10" },
  ];


  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-1">
        Overview
      </h1>
      <p className="text-sm text-[#475569] dark:text-[#8B9FC4] mb-6">
        Platform-wide statistics at a glance.
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-xl border
                       bg-[#F0FDF9] dark:bg-[#0D1526]
                       border-red-500/10 dark:border-red-500/10"
          >
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center
                            justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            {isLoading
              ? <div className="h-7 w-16 rounded bg-gray-200 dark:bg-[#111D35] animate-pulse mb-1" />
              : <p className={`text-2xl font-bold ${color}`}>{value ?? 0}</p>
            }
            <p className="text-xs text-[#475569] dark:text-[#8B9FC4] mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Pending doctor verifications alert */}
      {stats?.pendingDoctors > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5
                     flex items-center justify-between"
        >
          <div>
            <p className="font-semibold text-amber-600 dark:text-amber-400 text-sm">
              {stats.pendingDoctors} doctor{stats.pendingDoctors > 1 ? "s" : ""} pending verification
            </p>
            <p className="text-xs text-[#475569] dark:text-[#8B9FC4] mt-0.5">
              Review and approve new doctor registrations.
            </p>
          </div>
          <motion.a 
             href="/admin/doctors"
             whileHover={{ x: 3 }}
             className="text-xs font-semibold text-amber-600 dark:text-amber-400
                        hover:underline shrink-0 ml-4">
            Review →
          </motion.a>
        </motion.div>
      )}
    </div>
  );
}
