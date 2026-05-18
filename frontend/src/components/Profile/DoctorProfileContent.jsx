import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import BackButton from '../ui/BackButton';
import { fetchDoctorById } from '../../api/doctors';
import DoctorInfoSection from './DoctorInfoSection';
import DoctorAboutSection from './DoctorAboutSection';
import DoctorReviewsSection from './DoctorReviewsSection';
import BookingSection from './BookingSection';
import { DoctorProfileProvider } from '../../context/DoctorProfileContext';
import { useSocketQueue } from '../../hooks/useSocketQueue';
import IntakeFormDialog from '../common/IntakeFormDialog';
import { Skeleton } from '../ui/Skeleton';
import { AlertCircle, Video, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

const DoctorProfileContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showIntakeForm, setShowIntakeForm] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { 
    data: doctor, 
    isLoading: loading, 
    error: queryError 
  } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => fetchDoctorById(id),
    enabled: !!id,
  });

  // Real-time socket queue hook
  const queueState = useSocketQueue(doctor);
  const { isCalled, setIsCalled, incomingCall } = queueState;

  useEffect(() => {
    if (incomingCall) {
      navigate(`/room/${incomingCall.roomId}`);
    }
  }, [incomingCall, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <Skeleton className="h-10 w-40 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-[300px] w-full rounded-2xl" />
              <Skeleton className="h-[200px] w-full rounded-2xl" />
              <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
            <Skeleton className="h-[500px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (queryError || !doctor) {
    return (
      <div className="min-h-screen bg-background-primary pt-32 text-center flex flex-col items-center">
        <div className="bg-red-500/10 p-6 rounded-full mb-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{queryError?.message || "Doctor not found"}</h2>
        <Button onClick={() => navigate('/doctors')} className="mt-4">
          Back to Doctors
        </Button>
      </div>
    );
  }

  return (
    <DoctorProfileProvider doctor={doctor}>
      <div className="min-h-screen bg-background-primary pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <BackButton label="Back to Doctors" className="mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <DoctorInfoSection />
              <DoctorAboutSection />
              <DoctorReviewsSection />
            </div>

            <BookingSection 
              queueState={queueState} 
              onOpenIntakeForm={() => setShowIntakeForm(true)} 
            />
          </div>
        </div>
      </div>

      <IntakeFormDialog 
        open={showIntakeForm} 
        onClose={setShowIntakeForm} 
        doctor={doctor}
      />


      {/* "Doctor is Calling You!" Full-Screen Overlay */}
      <AnimatePresence>
        {isCalled && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl"
          >
            <div className="max-w-md w-full bg-background-secondary/50 border border-white/10 p-10 rounded-[2.5rem] shadow-2xl text-center relative overflow-hidden">
              {/* Pulsing glow effect */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 blur-3xl rounded-full" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 blur-3xl rounded-full" />

              <div className="relative z-10">
                <button 
                  onClick={() => setIsCalled(false)}
                  className="absolute -top-4 -right-4 p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-25" />
                  <Video className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-3xl font-black text-white mb-4">Doctor is Calling!</h2>
                <p className="text-slate-400 mb-10 leading-relaxed">
                  Dr. <span className="text-white font-bold">{doctor.name}</span> is ready for your consultation. Please join the call now.
                </p>

                <Button 
                  onClick={() => {
                    if (incomingCall) {
                      navigate(`/room/${incomingCall.roomId}`);
                    }
                    setIsCalled(false);
                  }}
                  className="w-full py-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Join Call Now
                </Button>

                <button 
                  onClick={() => setIsCalled(false)}
                  className="mt-6 text-slate-500 text-sm font-medium hover:text-slate-300 transition-colors"
                >
                  Not ready yet
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DoctorProfileProvider>
  );
};

export default DoctorProfileContent;
