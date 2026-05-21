import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";
import { fetchMyPayments, cancelPayment } from "../../api/payments";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { showSuccess, showError, showConfirm } from "../../lib/swal";
import { cn } from "../../lib/utils";
import { jsPDF } from "jspdf";

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

  const generateReceiptPDF = (payment) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // 1. Top Colored Bar
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, pageWidth, 8, 'F');
    
    // 2. INVOICE text on right
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text("Invoice", pageWidth - 20, 30, { align: 'right' });
    
    // 3. Logo & Company details on left
    doc.setFontSize(20);
    doc.setTextColor(100, 100, 100);
    doc.text("DocLink", 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.setFont(undefined, 'bold');
    doc.text("DocLink Inc.", 20, 45);
    doc.setFont(undefined, 'normal');
    doc.text("Uttara Sector 10", 20, 50);
    doc.text("Dhaka, Bangladesh", 20, 55);
    
    // 4. Contact details next to company info
    const contactX = 80;
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text("Phone", contactX, 45);
    doc.text("Email", contactX, 50);
    doc.text("Website", contactX, 55);
    
    doc.setFont(undefined, 'normal');
    doc.text("01968017308", contactX + 20, 45);
    doc.text("support@doclink.com", contactX + 20, 50);
    doc.text("www.doclink-sohaib.vercel.app", contactX + 20, 55);
    
    // 5. Grey Information Box
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 70, pageWidth - 40, 30, 'F');
    
    const dateStr = payment.paidAt 
      ? new Date(payment.paidAt).toLocaleDateString() 
      : new Date(payment.createdAt).toLocaleDateString();
      
    // Bill to
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text("Bill to", 25, 78);
    doc.setFont(undefined, 'normal');
    doc.text(payment.patientName || "Verified Patient", 25, 84);
    doc.text("Registered Patient", 25, 89);
    
    // Consultant
    doc.setFont(undefined, 'bold');
    doc.text("Consultant", 85, 78);
    doc.setFont(undefined, 'normal');
    doc.text(`Dr. ${payment.doctorName}`, 85, 84);
    doc.text("Medical Specialist", 85, 89);
    
    // Details
    doc.setFont(undefined, 'bold');
    doc.text("Details", 145, 78);
    doc.setFont(undefined, 'normal');
    doc.text("Invoice #", 145, 84);
    doc.text((payment.stripeSessionId || "").substring(0, 10) + "...", 165, 84);
    doc.text("Date", 145, 89);
    doc.text(dateStr, 165, 89);
    doc.text("Status", 145, 94);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text("PAID", 165, 94);
    doc.setTextColor(50, 50, 50);
    
    // 6. Table Header
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text("Service", 20, 115);
    doc.text("Description", 70, 115);
    doc.text("Qty", 140, 115, { align: 'center' });
    doc.text("Rate", 160, 115, { align: 'right' });
    doc.text("Amount", pageWidth - 20, 115, { align: 'right' });
    
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(20, 120, pageWidth - 20, 120);
    
    // 7. Table Content
    doc.setFont(undefined, 'normal');
    const consultFee = ((payment.consultationFee || 0) / 100).toFixed(2);
    const platformFee = ((payment.platformFee || 0) / 100).toFixed(2);
    const totalAmount = ((payment.totalAmount || 0) / 100).toFixed(2);
    
    let y = 130;
    
    // Item 1: Consultation
    doc.text("Consultation", 20, y);
    const splitReason = doc.splitTextToSize(payment.reason || "General Consultation", 60);
    doc.text(splitReason, 70, y);
    doc.text("1", 140, y, { align: 'center' });
    doc.text(`BDT ${consultFee}`, 160, y, { align: 'right' });
    doc.text(`BDT ${consultFee}`, pageWidth - 20, y, { align: 'right' });
    
    y += (splitReason.length * 5) + 5;
    
    // Item 2: Platform Fee
    doc.text("Platform Fee", 20, y);
    doc.text("Booking and maintenance fee", 70, y);
    doc.text("1", 140, y, { align: 'center' });
    doc.text(`BDT ${platformFee}`, 160, y, { align: 'right' });
    doc.text(`BDT ${platformFee}`, pageWidth - 20, y, { align: 'right' });
    
    y += 15;
    doc.line(20, y, pageWidth - 20, y);
    
    // 8. Bottom Section (Totals & Message)
    y += 15;
    
    // Left: Message
    doc.setFont(undefined, 'bold');
    doc.text("Customer message", 20, y);
    doc.setFont(undefined, 'normal');
    doc.text("Hello!", 20, y + 8);
    
    const msg = "Thank you for your purchase. Please retain this invoice for your records. If requested, present it during your consultation.";
    const splitMsg = doc.splitTextToSize(msg, 90);
    doc.text(splitMsg, 20, y + 16);
    doc.text("Thanks!", 20, y + 16 + (splitMsg.length * 5) + 5);
    
    // Right: Totals
    doc.setFont(undefined, 'bold');
    doc.text("Subtotal", 130, y);
    doc.setFont(undefined, 'normal');
    doc.text(`BDT ${totalAmount}`, pageWidth - 20, y, { align: 'right' });
    
    doc.setFont(undefined, 'bold');
    doc.text("Sales tax", 130, y + 8);
    doc.setFont(undefined, 'normal');
    doc.text("BDT 0.00", pageWidth - 20, y + 8, { align: 'right' });
    
    // Thick line before Total
    doc.setLineWidth(1.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(130, y + 15, pageWidth - 20, y + 15);
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Total", 130, y + 25);
    doc.text(`BDT ${totalAmount}`, pageWidth - 20, y + 25, { align: 'right' });
    
    // Open PDF in a new tab instead of forcing download
    window.open(doc.output('bloburl'), '_blank');
  };

  // Metric summaries
  const totalSuccessful = payments.filter((p) => p.status === "completed");
  const totalPending = payments.filter((p) => p.status === "pending");
  const totalFailedOrCancelled = payments.filter(
    (p) => p.status === "failed" || p.status === "cancelled"
  );

  const totalAmountPaid = totalSuccessful.reduce(
    (sum, p) => sum + ((p.totalAmount || 0) / 100),
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
                      <th className="p-4">Receipt</th>
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
                            ৳ {(p.totalAmount || 0) / 100}
                          </td>
                          <td className="p-4">
                            {getStatusBadge(p.status)}
                          </td>
                          <td className="p-4 text-right flex items-center justify-end gap-2">
                            {p.status === "completed" && p.stripeSessionId && (
                              <Button
                                variant="outline"
                                className="border-blue-500/30 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 text-xs px-3 py-1.5 h-auto rounded-lg"
                                onClick={() => generateReceiptPDF(p)}
                              >
                                <Lucide.FileText className="w-3.5 h-3.5 mr-1 inline" />
                                Receipt
                              </Button>
                            )}
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
                        <span className="font-extrabold text-text-primary text-lg">৳ {(p.totalAmount || 0) / 100}</span>
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

                        <div className="flex items-center gap-2">
                          {p.status === "completed" && p.stripeSessionId && (
                            <Button
                              variant="outline"
                              onClick={() => generateReceiptPDF(p)}
                              className="border-blue-500/30 text-blue-500 hover:bg-blue-500/10 text-xs h-9 px-4 rounded-xl"
                            >
                              <Lucide.FileText className="w-3.5 h-3.5 mr-1.5 inline" />
                              Receipt
                            </Button>
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
