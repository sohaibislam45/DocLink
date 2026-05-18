import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPayment } from '../../api/payments';
import { Button } from '../../components/ui/Button';
import { 
  CheckCircle, 
  Clock, 
  User, 
  ArrowRight, 
  Printer, 
  FileText, 
  ShieldCheck, 
  HelpCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const sessionId = searchParams.get('session_id');
  const doctorId = searchParams.get('doctorId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 10;
  const RETRY_INTERVAL = 2000; // 2 seconds

  useEffect(() => {
    if (!sessionId) {
      setError("Invalid session parameters. Please navigate from your dashboard.");
      setLoading(false);
      return;
    }

    const pollPaymentStatus = async () => {
      try {
        const response = await verifyPayment(sessionId);
        
        // If the payment is completed and queue has been joined, stop polling
        if (response.payment && response.payment.status === 'completed' && response.payment.queueJoined) {
          setPaymentData(response.payment);
          setQueueData(response.queueEntry);
          setLoading(false);
        } else {
          // If still pending or queue not joined, retry if we haven't hit maximum attempts
          if (retryCount < MAX_RETRIES) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, RETRY_INTERVAL);
          } else {
            setPaymentData(response.payment); // Save partial payment data
            setError("Payment is taking longer than expected to process. Rest assured, your spot is being prepared.");
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Verification poll error:", err);
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, RETRY_INTERVAL);
        } else {
          setError(err?.message || "Failed to verify payment status. Please try refreshing.");
          setLoading(false);
        }
      }
    };

    pollPaymentStatus();
  }, [sessionId, retryCount]);

  const handlePrint = () => {
    window.print();
  };

  const handleManualRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount(0);
  };

  // --- LOADER STATE (Verification Polling) ---
  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-6 pt-24 pb-20">
        <div className="max-w-md w-full bg-background-secondary border border-border/30 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden">
          {/* Subtle backgrounds glowing */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full" />
          
          <div className="relative z-10 space-y-6">
            <div className="w-20 h-20 mx-auto relative flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <ShieldCheck className="w-8 h-8 text-blue-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-text-primary">Verifying Payment</h2>
              <p className="text-text-secondary text-sm leading-relaxed">
                Securing your consultation spot and syncing with our medical database. This will only take a moment...
              </p>
            </div>

            <div className="bg-background-primary/60 border border-border/20 rounded-2xl py-3 px-4 flex items-center justify-center gap-2.5 text-xs text-text-secondary">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Checking Stripe webhook status (Attempt {retryCount + 1}/{MAX_RETRIES})</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error && !paymentData) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-6 pt-24 pb-20">
        <div className="max-w-md w-full bg-background-secondary border border-border/30 rounded-[2.5rem] p-10 text-center shadow-2xl space-y-6">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-text-primary">Verification Issue</h2>
            <p className="text-text-secondary text-sm leading-relaxed">{error}</p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={handleManualRetry} className="w-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 rounded-xl py-3">
              <RefreshCw className="w-4 h-4" />
              Retry Verification
            </Button>
            <Button variant="ghost" onClick={() => navigate('/patient/dashboard')} className="w-full text-text-secondary">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatCents = (cents) => {
    return `৳ ${cents / 100}`;
  };

  const paymentDateStr = paymentData?.paidAt 
    ? new Date(paymentData.paidAt).toLocaleString() 
    : new Date().toLocaleString();

  // --- FULL SUCCESS STATE ---
  return (
    <div className="min-h-screen bg-background-primary pt-28 pb-20 px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Core Header Card */}
        <div className="bg-background-secondary border border-border/30 rounded-[2.5rem] p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full" />

          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl font-black text-text-primary tracking-tight">Booking Confirmed!</h1>
              <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
                Your payment was secure, and your intake record has been synchronized with the consultation registry.
              </p>
            </div>

            {/* Waiting Queue details card if joined successfully */}
            {queueData ? (
              <div className="mt-8 bg-blue-600/5 border border-blue-500/20 rounded-3xl p-6 grid grid-cols-2 gap-4 divide-x divide-border/20 max-w-lg mx-auto">
                <div className="text-center space-y-1">
                  <span className="text-xs uppercase font-semibold text-blue-400 tracking-wider">Queue Position</span>
                  <div className="text-3xl font-black text-blue-500">#{queueData.position}</div>
                  <span className="text-[10px] text-text-secondary block">patients ahead: {queueData.position - 1}</span>
                </div>
                <div className="text-center space-y-1 pl-4">
                  <span className="text-xs uppercase font-semibold text-blue-400 tracking-wider">Est. Wait Time</span>
                  <div className="text-3xl font-black text-blue-500 flex items-center justify-center gap-1.5">
                    <Clock className="w-6 h-6 text-blue-500 shrink-0" />
                    <span>{queueData.estimatedWaitMins ?? 0}m</span>
                  </div>
                  <span className="text-[10px] text-text-secondary block">based on typical queues</span>
                </div>
              </div>
            ) : (
              /* Warning if webhook delayed but payment succeeded */
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-left text-xs text-amber-400">
                <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Queue Assignment Processing</span>
                  Your payment is successful, but queue list placement is completing. Check the patient portal or refresh momentarily to see your updated position.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Invoice Receipt Card */}
        <div id="payment-receipt" className="bg-background-secondary border border-border/30 rounded-[2.5rem] p-8 shadow-xl space-y-6 print:border-none print:shadow-none">
          <div className="flex justify-between items-center border-b border-border/20 pb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="font-bold text-text-primary text-base">Diagnostic Consultation Receipt</span>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
              Paid
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <span className="text-text-secondary block text-xs font-semibold uppercase tracking-wider mb-0.5">Doctor</span>
              <span className="font-bold text-text-primary">Dr. {paymentData?.doctorName || 'Medical Expert'}</span>
            </div>
            <div>
              <span className="text-text-secondary block text-xs font-semibold uppercase tracking-wider mb-0.5">Patient Name</span>
              <span className="font-semibold text-text-primary">{paymentData?.patientName || 'Verified Patient'}</span>
            </div>
            <div>
              <span className="text-text-secondary block text-xs font-semibold uppercase tracking-wider mb-0.5">Transaction ID</span>
              <span className="font-mono text-xs text-text-primary truncate block max-w-[200px]" title={paymentData?.stripeSessionId}>
                {paymentData?.stripeSessionId || 'txn_stripe_xxx'}
              </span>
            </div>
            <div>
              <span className="text-text-secondary block text-xs font-semibold uppercase tracking-wider mb-0.5">Date & Time</span>
              <span className="font-medium text-text-primary">{paymentDateStr}</span>
            </div>
          </div>

          {/* Consultation reason summary */}
          <div className="bg-background-primary/40 border border-border/20 rounded-2xl p-4 space-y-1.5 text-sm">
            <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider block">Intake Symptoms</span>
            <p className="text-text-primary leading-relaxed">{paymentData?.reason || 'General checkup'}</p>
          </div>

          {/* Breakdown summary */}
          <div className="border-t border-border/20 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Consultation fee</span>
              <span className="font-semibold text-text-primary">
                {paymentData ? formatCents(paymentData.consultationFee) : '৳ 0.00'}
              </span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Platform service fee</span>
              <span className="font-semibold text-text-primary">
                {paymentData ? formatCents(paymentData.platformFee) : '৳ 0.00'}
              </span>
            </div>
            <div className="border-t border-border/20 pt-3 flex justify-between items-center text-base">
              <span className="font-bold text-text-primary">Total Paid Amount</span>
              <span className="text-xl font-black text-blue-500">
                {paymentData ? formatCents(paymentData.totalAmount) : '৳ 0.00'}
              </span>
            </div>
          </div>

          {/* Trust Stamp */}
          <div className="flex items-center justify-center gap-1.5 pt-4 text-[10px] text-text-secondary border-t border-border/20">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Secured by Stripe SSL Merchant Services. DocLink Inc.</span>
          </div>
        </div>

        {/* Dynamic Navigation Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => navigate(`/doctors/${doctorId || ''}`)} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,99,235,0.2)]"
          >
            <span>Enter Real-Time Queue</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button 
            onClick={handlePrint}
            variant="outline" 
            className="w-full border-border/40 hover:bg-background-secondary font-semibold py-5 rounded-2xl flex items-center justify-center gap-2 text-text-primary transition-all"
          >
            <Printer className="w-4 h-4 text-text-secondary" />
            <span>Print Receipt</span>
          </Button>
        </div>

      </div>
    </div>
  );
};

export default PaymentSuccessPage;
