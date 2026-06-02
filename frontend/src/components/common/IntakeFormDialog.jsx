import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { intakeSchema } from '../../schemas/intakeSchema';
import { useAuth } from '../../context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/Dialog';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { createCheckoutSession } from '../../api/payments';
import { 
  ShieldCheck, 
  CreditCard, 
  User, 
  FileText, 
  ChevronRight, 
  ArrowLeft, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicSettings } from '../../api/admin';

const IntakeFormDialog = ({ open, onClose, doctor }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const maxChars = 300;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      patientName: '',
      reason: '',
    },
    mode: 'onChange',
  });

  const patientNameValue = watch('patientName') || '';
  const reasonValue = watch('reason') || '';

  // Reset state on open/close
  useEffect(() => {
    if (open) {
      setStep(1);
      setError(null);
      setLoading(false);
      reset({
        patientName: user?.displayName || user?.email?.split('@')[0] || '',
        reason: '',
      });
    }
  }, [open, reset]);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (isValid) {
      setStep(2);
    }
  };

  const handlePaymentSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await createCheckoutSession({
        doctorId: doctor.id,
        patientName: patientNameValue,
        reason: reasonValue,
      });

      if (response && response.url) {
        // Redirect to Stripe checkout
        window.location.href = response.url;
      } else {
        throw new Error("Unable to generate Stripe checkout session");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err?.message || "Failed to initialize secure checkout. Please try again.");
      setLoading(false);
    }
  };

  const { data: settings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: fetchPublicSettings,
  });

  const platformFee = settings?.platformFee || 50;
  const consultationFee = doctor?.fee || 0;
  const totalAmount = consultationFee + platformFee;

  return (
    <Dialog open={open} onOpenChange={() => !loading && onClose(false)}>
      <DialogContent className="sm:max-w-[480px] max-h-[92vh] overflow-y-auto bg-background-secondary border border-border/40 rounded-[2rem] p-0 shadow-2xl">
        
        {/* Step Indicator Header Banner */}
        <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-b border-border/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-full">
              Consultation Booking
            </span>
            <span className="text-xs text-text-secondary">
              Step {step} of 2
            </span>
          </div>
          
          <div className="flex gap-2">
            <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", 
              step >= 1 ? "bg-blue-600" : "bg-border/20")} 
            />
            <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", 
              step >= 2 ? "bg-blue-600" : "bg-border/20")} 
            />
          </div>
        </div>

        <div className="p-6 pt-2">
          {step === 1 ? (
            /* --- STEP 1: PATIENT INTAKE FORM --- */
            <form onSubmit={handleNextStep} className="space-y-5">
              <DialogHeader className="text-left space-y-1">
                <DialogTitle className="text-xl font-bold text-text-primary">
                  Who is this consultation for?
                </DialogTitle>
                <DialogDescription className="text-sm text-text-secondary">
                  Please provide the details below to initialize your intake record.
                </DialogDescription>
              </DialogHeader>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Full Name field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-text-primary tracking-wide uppercase">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    Patient's Full Name
                  </label>
                  <Input
                    placeholder="Enter full name"
                    className={cn(
                      "bg-background-primary border-border/40 focus:border-blue-500 text-sm py-5 rounded-xl",
                      errors.patientName && "border-red-500/50 focus:border-red-500"
                    )}
                    {...register('patientName')}
                  />
                  {errors.patientName && (
                    <p className="text-red-400 text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3" />
                      {errors.patientName.message}
                    </p>
                  )}
                </div>

                {/* Common Symptoms Select Box */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-text-primary tracking-wide uppercase">
                    <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                    Select Common Symptom
                  </label>
                  <Select
                    onValueChange={(val) => {
                      const currentReason = reasonValue.trim();
                      if (val === "None") return;
                      const updated = currentReason 
                        ? `${val}, ${currentReason}`
                        : val;
                      reset({ ...watch(), reason: updated });
                    }}
                  >
                    <SelectTrigger className="bg-background-primary border-border/40 focus:ring-blue-500/20">
                      <SelectValue placeholder="Choose a common symptom..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background-secondary border-border/40">
                      {[
                        "Fever", "Cough", "Headache", "Sore Throat", 
                        "Body Ache", "Fatigue", "Nausea", "Dizziness", 
                        "Chest Pain", "Breathing Issue"
                      ].map((symptom) => (
                        <SelectItem key={symptom} value={symptom}>
                          {symptom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Symptom Description / Others textarea */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-text-primary tracking-wide uppercase">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    Detailed Description / Others
                  </label>
                  <textarea
                    className={cn(
                      "flex min-h-[100px] w-full rounded-xl border border-border/40 bg-background-primary px-3 py-2.5 text-sm ring-offset-background placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 resize-none text-text-primary transition-all",
                      errors.reason && "border-red-500/50 focus-visible:ring-red-500"
                    )}
                    placeholder="Details about your symptoms or other concerns..."
                    maxLength={maxChars}
                    {...register('reason')}
                  />
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-red-400 font-medium">
                      {errors.reason?.message}
                    </span>
                    <span className="text-text-secondary shrink-0">
                      {reasonValue.length} / {maxChars}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={!isValid}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
                >
                  Continue to Payment
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onClose(false)}
                  className="w-full text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            /* --- STEP 2: SECURE FEE SUMMARY & STRIPE REDIRECT --- */
            <div className="space-y-5">
              <DialogHeader className="text-left space-y-1">
                <DialogTitle className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  Review Payment Details
                </DialogTitle>
                <DialogDescription className="text-sm text-text-secondary">
                  Connecting with Dr. <span className="font-semibold text-text-primary">{doctor?.name}</span>
                </DialogDescription>
              </DialogHeader>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Consultation Details Invoice Card */}
              <div className="bg-background-primary border border-border/30 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Consultation Fee</span>
                  <span className="font-semibold text-text-primary">৳ {consultationFee}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    Platform Service Fee
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  </span>
                  <span className="font-semibold text-text-primary">৳ {platformFee}</span>
                </div>

                <div className="border-t border-border/20 pt-4 flex justify-between items-center">
                  <span className="text-base font-bold text-text-primary">Total Amount Due</span>
                  <span className="text-2xl font-black text-blue-500">৳ {totalAmount}</span>
                </div>
              </div>

              {/* Secure checkout badges & Trust seals */}
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-3 text-xs text-text-secondary leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-blue-400 block mb-0.5">Secure Checkout Guaranteed</span>
                  Your payment details are protected by industry-standard AES 256-bit SSL encryption and securely processed directly on Stripe Checkout.
                </div>
              </div>

              {/* Speed / Queue assurance indicator */}
              <div className="flex items-center gap-2.5 px-1 py-1 text-xs text-text-secondary">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Once paid, you will be placed into the waitlist queue automatically.
                </span>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={handlePaymentSubmit}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(37,99,235,0.2)] disabled:bg-blue-600/50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Redirecting to Stripe...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Pay Securely & Join Queue
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => !loading && setStep(1)}
                  disabled={loading}
                  variant="ghost"
                  className="w-full text-text-secondary hover:text-text-primary flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Intake Details
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IntakeFormDialog;
