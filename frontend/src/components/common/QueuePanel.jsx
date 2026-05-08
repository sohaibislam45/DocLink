import React from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import useCountdown from '../../hooks/useCountdown';
import YourTurnCard from './YourTurnCard';
import { showConfirm, showWarning } from '../../lib/swal';

const QueuePanel = ({ doctor, queueState, onLeave }) => {
  const { secondsRemaining, isFinished } = useCountdown(queueState.totalWaitSeconds, queueState.isInQueue);

  const formatTime = (seconds) => {
    if (seconds > 60) {
      return `~${Math.round(seconds / 60)} mins`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLeaveClick = async () => {
    const confirmed = await showConfirm({
      title: 'Leave the queue?',
      text: "If you leave, you'll lose your current position. You can rejoin, but you'll be placed at the end of the queue.",
      confirmText: 'Yes, Leave',
      cancelText: 'Stay in Queue',
      icon: 'warning',
    });
    if (confirmed) {
      onLeave();
      showWarning("You've left the queue. You can rejoin at any time.");
    }
  };

  if (isFinished) {
    return <YourTurnCard doctorName={doctor.name} />;
  }

  const isUrgent = secondsRemaining <= 60;

  return (
    <Card className="bg-background-secondary/50 backdrop-blur-xl border-border/50 overflow-hidden rounded-3xl w-full">
      <CardContent className="p-8 space-y-8">
        
        {/* Queue Position Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-6xl font-bold text-blue-500"
          >
            #{queueState.queuePosition}
          </motion.div>
          <p className="text-text-secondary">Your position in queue</p>
        </div>

        {/* Estimated Wait Time */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-text-primary">Estimated Wait Time</p>
          <motion.div
            animate={{ 
              color: isUrgent ? '#fbbf24' : '#06b6d4',
              scale: isUrgent ? [1, 1.05, 1] : 1
            }}
            transition={isUrgent ? { repeat: Infinity, duration: 1 } : {}}
            className="text-3xl font-bold"
          >
            {formatTime(secondsRemaining)}
          </motion.div>
        </div>

        {/* Anonymized Queue List */}
        <div className="space-y-4">
          <h3 className="text-sm text-text-secondary font-medium">Patients Ahead of You</h3>
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="space-y-3"
          >
            {queueState.patientsAhead.map((patient) => (
              <motion.div 
                key={patient.id}
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 }
                }}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-background-primary border border-blue-500/30 text-text-primary">
                      #{patient.id}
                    </span>
                    <span className="text-sm text-text-primary">{patient.label}</span>
                  </div>
                  <span className="text-xs text-text-secondary bg-background-tertiary px-2 py-1 rounded-md">
                    ~{patient.waitMins} mins
                  </span>
                </div>
                {/* Thin progress bar */}
                <div className="h-1 w-full bg-background-tertiary rounded-full overflow-hidden">
                  <div className="h-full bg-border/50 rounded-full w-full"></div>
                </div>
              </motion.div>
            ))}

            {/* Your Queue Info Row */}
            <motion.div 
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1 }
              }}
              className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mt-4"
            >
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500 text-white">
                  #{queueState.queuePosition}
                </span>
                <span className="text-sm font-medium text-text-primary">You joined just now</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Leave Queue Button */}
        <div className="pt-4 flex justify-center">
          <motion.div whileHover={{ scale: 1.05 }} className="w-full">
            <Button 
              variant="ghost" 
              className="w-full text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
              onClick={handleLeaveClick}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave Queue
            </Button>
          </motion.div>
        </div>

      </CardContent>
    </Card>
  );
};

export default QueuePanel;
