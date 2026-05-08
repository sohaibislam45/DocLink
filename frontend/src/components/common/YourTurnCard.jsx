import React from 'react';
import { motion } from 'framer-motion';
import { Video } from 'lucide-react';
import { Button } from '../ui/Button';
import { showInfo } from '../../lib/swal';
import { Card, CardContent } from '../ui/Card';

const YourTurnCard = ({ doctorName }) => {
  const handleJoinCall = () => {
    showInfo('Video call feature coming soon! 🎉');
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-2xl z-0"></div>
      <Card className="relative z-10 bg-background-secondary/80 backdrop-blur-xl border border-blue-500/30 overflow-hidden rounded-3xl">
        <CardContent className="p-10 text-center flex flex-col items-center justify-center space-y-6">
          <div className="rounded-full bg-blue-500/20 p-6 animate-pulse">
            <Video className="w-16 h-16 text-blue-500" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-text-primary">It's Your Turn!</h2>
            <p className="text-text-secondary">
              Dr. {doctorName} is ready for you. Join the video call now.
            </p>
          </div>

          <div className="w-full pt-4 space-y-3">
            <Button 
              onClick={handleJoinCall}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse"
            >
              Join Call Now
            </Button>
            <p className="text-amber-400 text-sm">
              Dr. {doctorName} is waiting — don't keep them waiting!
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default YourTurnCard;
