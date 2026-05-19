import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";
import { fetchMyPayments, cancelPayment } from "../../api/payments";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { showSuccess, showError, showConfirm } from "../../lib/swal";
import { cn } from "../../lib/utils";

const PatientPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [processingId, setProcessingId] = useState(null);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await fetchMyPayments();
      setPayments(data || []);
      setError(null);
    } catch (err) {
      console.error("Error loading payments:", err);
      setError(err?.message || "Failed to retrieve payment history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleCancelPayment = async (paymentId) => {
    const confirmed = await showConfirm({
      title: "Cancel this checkout transaction?",
      text: "This will mark the payment session as cancelled. You can always restart checkout later by connecting to the doctor again.",
      confirmText: "Yes, Cancel Session",
      cancelText: "Keep Active",
      icon: "warning",
    });

    if (!confirmed) return;

    try {
      setProcessingId(paymentId);
      await cancelPayment(paymentId);
      showSuccess("Transaction session cancelled successfully.");
      // Refresh local payments history
      await loadPayments();
    } catch (err) {
      console.error("Cancellation error:", err);
      showError(err?.message || "Could not cancel payment session.");
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSuccess("Stripe session ID copied to clipboard!");
  };

  // Metric summaries
  const totalSuccessful = payments.filter((p) => p.status === "completed");
  const totalPending = payments.filter((p) => p.status === "pending");
  const totalFailedOrCancelled = payments.filter(
    (p) => p.status === "failed" || p.status === "cancelled"
  );

  const totalAmountPaid = totalSuccessful.reduce(
    (sum, p) => sum + (p.amountPaid || 0),
    0
  );

  // Filter payments based on activeTab
  const filteredPayments = payments.filter((p) => {
    if (activeTab === "successful") return p.status === "completed";
    if (activeTab === "pending") return p.status === "pending";
    if (activeTab === "failed") {
      return p.status === "failed" || p.status === "cancelled";
    }
    return true; // "all"
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10 flex items-center gap-1 w-fit">
            <Lucide.CheckCircle className="w-3 h-3" /> Successful
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/10 flex items-center gap-1 w-fit">
            <Lucide.Clock className="w-3 h-3 animate-pulse" /> Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/10 flex items-center gap-1 w-fit">
            <Lucide.XCircle className="w-3 h-3" /> Unsuccessful
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/10 flex items-center gap-1 w-fit">
            <Lucide.AlertCircle className="w-3 h-3" /> Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const tabs = [
    { id: "all", label: "All Payments", count: payments.length },
    { id: "successful", label: "Successful", count: totalSuccessful.length },
    { id: "pending", label: "Pending", count: totalPending.length },
    { id: "failed", label: "Failed & Cancelled", count: totalFailedOrCancelled.length },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-1">Payment History</h2>
        <p className="text-text-secondary">Track and manage your diagnostic and consultation invoice history.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-secondary border border-border p-6 rounded-2xl flex flex-col gap-3 shadow-sm"
        >
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <Lucide.CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-text-primary">৳ {totalAmountPaid.toLocaleString()}</h4>
            <p className="text-text-secondary text-sm">
              Total Successful ({totalSuccessful.length} invoices)
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-background-secondary border border-border p-6 rounded-2xl flex flex-col gap-3 shadow-sm"
        >
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
            <Lucide.Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-text-primary">{totalPending.length}</h4>
            <p className="text-text-secondary text-sm">Pending Transactions</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background-secondary border border-border p-6 rounded-2xl flex flex-col gap-3 shadow-sm"
        >
          <div className="p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 w-fit">
            <Lucide.XCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-text-primary">{totalFailedOrCancelled.length}</h4>
            <p className="text-text-secondary text-sm">Unsuccessful & Cancelled</p>
          </div>
        </motion.div>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="bg-background-tertiary p-1 rounded-xl flex flex-wrap gap-1 self-start w-full md:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 md:flex-none",
                activeTab === tab.id
                  ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-background-secondary"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-semibold shrink-0",
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-background-secondary text-text-secondary"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Contents List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl bg-background-tertiary" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center bg-background-secondary rounded-2xl border border-border">
              <Lucide.AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
              <p className="text-text-secondary">{error}</p>
              <Button onClick={loadPayments} className="mt-4 bg-accent-primary hover:brightness-110">
                Retry Loading
              </Button>
            </div>
          ) : filteredPayments.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-hidden border border-border rounded-2xl bg-background-secondary">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-background-tertiary text-text-secondary text-xs font-semibold uppercase tracking-wider">
                      <th className="p-4">Transaction / Stripe ID</th>
                      <th className="p-4">Consultant Doctor</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredPayments.map((p) => {
                      const isCancellable = p.status === "pending" || p.status === "failed";
                      const dateStr = p.createdAt
                        ? new Date(p.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Unknown Date";

                      return (
                        <tr key={p._id} className="hover:bg-background-tertiary transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-accent-primary max-w-[150px] truncate block" title={p.stripeSessionId}>
                                {p.stripeSessionId || "N/A"}
                              </span>
                              {p.stripeSessionId && (
                                <button
                                  onClick={() => copyToClipboard(p.stripeSessionId)}
                                  className="text-text-secondary hover:text-text-primary transition-colors"
                                  title="Copy Stripe ID"
                                >
                                  <Lucide.Copy className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-text-primary">
                            Dr. {p.doctorName || "Medical Specialist"}
                          </td>
                          <td className="p-4 text-sm text-text-secondary">
                            {dateStr}
                          </td>
                          <td className="p-4 font-black text-text-primary">
                            ৳ {p.amountPaid || 0}
                          </td>
                          <td className="p-4">
                            {getStatusBadge(p.status)}
                          </td>
                          <td className="p-4 text-right">
                            {isCancellable && (
                              <Button
                                variant="outline"
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs px-3 py-1.5 h-auto rounded-lg"
                                disabled={processingId === p._id}
                                onClick={() => handleCancelPayment(p._id)}
                              >
                                {processingId === p._id ? (
                                  <Lucide.Loader2 className="w-3.5 h-3.5 animate-spin mr-1 inline" />
                                ) : (
                                  <Lucide.Trash2 className="w-3.5 h-3.5 mr-1 inline" />
                                )}
                                Cancel
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="lg:hidden space-y-4">
                {filteredPayments.map((p) => {
                  const isCancellable = p.status === "pending" || p.status === "failed";
                  const dateStr = p.createdAt
                    ? new Date(p.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Unknown Date";

                  return (
                    <motion.div
                      layout
                      key={p._id}
                      className="bg-background-secondary border border-border rounded-2xl p-5 space-y-4 hover:border-accent-primary/20 transition-all shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-text-primary text-base">Dr. {p.doctorName}</h4>
                          <span className="text-xs text-text-secondary">{dateStr}</span>
                        </div>
                        <span className="font-extrabold text-text-primary text-lg">৳ {p.amountPaid}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-border py-3">
                        <div>
                          <span className="text-text-secondary block">Stripe Session ID</span>
                          <span className="font-mono text-accent-primary truncate block max-w-[140px]" title={p.stripeSessionId}>
                            {p.stripeSessionId || "N/A"}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-text-secondary block mb-0.5">Status</span>
                          {getStatusBadge(p.status)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-1">
                        {p.stripeSessionId ? (
                          <Button
                            variant="ghost"
                            onClick={() => copyToClipboard(p.stripeSessionId)}
                            className="text-xs h-9 text-text-secondary hover:text-text-primary px-3"
                          >
                            <Lucide.Copy className="w-3.5 h-3.5 mr-1.5" />
                            Copy ID
                          </Button>
                        ) : (
                          <div />
                        )}

                        {isCancellable && (
                          <Button
                            variant="outline"
                            className="border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 text-xs h-9 px-4 rounded-xl"
                            disabled={processingId === p._id}
                            onClick={() => handleCancelPayment(p._id)}
                          >
                            {processingId === p._id ? (
                              <Lucide.Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 inline" />
                            ) : (
                              <Lucide.Trash2 className="w-3.5 h-3.5 mr-1.5 inline" />
                            )}
                            Cancel Checkout
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-text-secondary bg-background-secondary border border-border rounded-2xl italic">
              No payments found matching the selection criteria.
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PatientPayments;
