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
import useQueue from '../../hooks/useQueue';
import ConnectModal from '../common/ConnectModal';
import { Skeleton } from '../ui/Skeleton';
import { AlertCircle } from 'lucide-react';

const DoctorProfileContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showIntakeForm, setShowIntakeForm] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadDoctor = async () => {
      try {
        setLoading(true);
        const data = await fetchDoctorById(id);
        setDoctor(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDoctor();
  }, [id]);

  // Custom queue hook
  const queueState = useQueue(doctor);

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

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-background-primary pt-32 text-center flex flex-col items-center">
        <div className="bg-red-500/10 p-6 rounded-full mb-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{error || "Doctor not found"}</h2>
        <Button onClick={() => navigate('/doctors')} className="mt-4">
          Back to Doctors
        </Button>
      </div>
    );
  }

  const handleJoinQueue = (name, reason) => {
    queueState.joinQueue(name, reason);
    setShowIntakeForm(false);
  };

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

      <ConnectModal 
        open={showIntakeForm} 
        onClose={setShowIntakeForm} 
        onSubmit={handleJoinQueue}
        doctorName={doctor.name}
      />
    </DoctorProfileProvider>
  );
};

export default DoctorProfileContent;
