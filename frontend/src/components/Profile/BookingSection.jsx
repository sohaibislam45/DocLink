import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck, Clock, RefreshCw, WifiOff, Users } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useDoctorProfile } from '../../context/DoctorProfileContext';
import QueuePanel from '../common/QueuePanel';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../ui/Skeleton';

const BookingSection = ({ queueState, onOpenIntakeForm }) => {
  const { doctor } = useDoctorProfile();
  const navigate = useNavigate();

  // If loading the queue state, render a nice skeleton card to prevent CTA flashing
  if (queueState.loading) {
    return (
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <Card className="bg-background-secondary/80 backdrop-blur-2xl border-accent-primary/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-8 w-1/3 bg-slate-700/20" />
                <Skeleton className="h-4 w-1/4 bg-slate-700/20" />
              </div>
              <Skeleton className="h-24 w-full rounded-2xl bg-slate-700/20" />
              <Skeleton className="h-14 w-full rounded-2xl bg-slate-700/20 animate-pulse" />
              <div className="space-y-3 pt-6 border-t border-border/50">
                <Skeleton className="h-4 w-3/4 bg-slate-700/20" />
                <Skeleton className="h-4 w-2/3 bg-slate-700/20" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If in queue, render the QueuePanel directly. It's already a full card.
  if (queueState.isInQueue) {
    return (
      <div className="lg:col-span-1">
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="sticky top-24"
        >
          <QueuePanel 
            doctor={doctor} 
            queueState={queueState} 
            onLeave={queueState.leaveQueue} 
          />
        </motion.div>
      </div>
    );
  }

  // Calculate estimated wait time
  const estimatedTotalMins = queueState.queue.length * 12;

  return (
    <div className="lg:col-span-1">
      <motion.div 
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="sticky top-24"
      >
        <Card className="bg-background-secondary/80 backdrop-blur-2xl border-accent-primary/20 shadow-2xl shadow-accent-primary/5 rounded-3xl overflow-hidden">
          <CardContent className="p-8 space-y-8">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-4xl font-black text-accent-primary">৳{doctor.fee}</span>
                <span className="text-text-secondary ml-1 font-medium">/ session</span>
              </div>
            </div>

            {/* Offline State */}
            {!doctor.isOnline ? (
              <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
                <WifiOff className="w-12 h-12 text-slate-500" />
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-text-primary">Currently Offline</h3>
                  <p className="text-sm text-slate-500">
                    This doctor is not available for consultation right now.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/doctors')}
                  className="w-full mt-2 border-border/50 text-text-primary"
                >
                  Browse Online Doctors
                </Button>
              </div>
            ) : (
              /* Online, Connect CTA */
              <div className="flex flex-col items-center justify-center text-center space-y-6 py-2">
                <div className="space-y-2 w-full">
                  <h3 className="text-xl font-bold text-text-primary">Join the Queue</h3>
                  <p className="text-text-secondary">
                    {queueState.queue.length > 0 
                      ? <><span className="text-blue-600 font-bold">{queueState.queue.length}</span> patients ahead of you</>
                      : 'You will be the first in line'}
                  </p>
                </div>

                <div className="text-md font-semibold text-blue-500 bg-blue-500/10 px-4 py-2 rounded-lg w-full">
                  Estimated wait: ~{estimatedTotalMins > 0 ? estimatedTotalMins : 0} mins
                </div>

                <Button 
                  className="w-full py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all"
                  onClick={onOpenIntakeForm}
                >
                  Connect to Dr. {doctor.name.split(' ').pop()}
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>Verified & Certified Doctor</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <Clock className="w-4 h-4 text-accent-primary" />
                <span>Real-time Live Queue</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <RefreshCw className="w-4 h-4 text-accent-secondary" />
                <span>Leave & Rejoin anytime</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BookingSection;
