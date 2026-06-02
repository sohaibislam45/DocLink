import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminPayments } from "../../api/admin.js";
import { motion } from "framer-motion";
import Pagination from "../../components/common/Pagination.jsx";

export default function AdminPayments() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments", page, statusFilter],
    queryFn: () => fetchAdminPayments({ page, limit: 20, status: statusFilter }),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Payments</h1>
        <p className="text-sm text-[#475569] dark:text-[#8B9FC4]">View and monitor platform transactions.</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6">
        {["", "completed", "pending", "failed"].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors border
              ${statusFilter === s
                ? "bg-red-500/10 text-red-500 border-red-500/20"
                : "bg-white dark:bg-[#0D1526] text-[#475569] dark:text-[#8B9FC4] border-red-500/10 dark:border-red-500/10 hover:bg-red-500/5"
              }`}
          >
            {s === "" ? "All Payments" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-red-500/10 dark:border-red-500/10 bg-white dark:bg-[#0D1526]">
        <table className="w-full text-sm">
          <thead className="bg-red-500/5 dark:bg-red-500/5 border-bottom border-red-500/10">
            <tr>
              {["Transaction ID", "Patient", "Doctor", "Amount", "Status", "Date"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#475569] dark:text-[#8B9FC4] uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-red-500/5 dark:divide-red-500/5">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-4 py-4 h-16 bg-gray-50/50 dark:bg-gray-800/10"></td>
                </tr>
              ))
            ) : data?.payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[#475569] dark:text-[#8B9FC4]">
                  No payments found for the selected status.
                </td>
              </tr>
            ) : (
              data?.payments.map(payment => (
                <tr key={payment._id} className="hover:bg-red-500/[0.02] transition-colors">
                  <td className="px-4 py-3 font-mono text-[10px] text-[#475569] dark:text-[#8B9FC4]">
                    {payment.stripeSessionId.slice(0, 12)}...
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#0F172A] dark:text-[#F0F4FF]">{payment.patientName}</p>
                    <p className="text-[10px] text-[#475569] dark:text-[#8B9FC4] truncate max-w-[120px]">{payment.patientUid}</p>
                  </td>
                  <td className="px-4 py-3 text-[#475569] dark:text-[#8B9FC4]">{payment.doctorName}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-[#0F172A] dark:text-[#F0F4FF]">
                       ৳{(payment.totalAmount / 100).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-[#475569] dark:text-[#8B9FC4]">
                      Fee: ৳{(payment.platformFee / 100).toFixed(2)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                      ${payment.status === "completed"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : payment.status === "pending"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                        : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                      }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#475569] dark:text-[#8B9FC4]">
                    {new Date(payment.createdAt).toLocaleDateString()}
                    <span className="block text-[10px] opacity-60">
                      {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data?.total > 20 && (
        <Pagination 
          page={page} 
          total={data?.total || 0} 
          limit={20} 
          onPageChange={setPage} 
        />
      )}
    </div>
  );
}
