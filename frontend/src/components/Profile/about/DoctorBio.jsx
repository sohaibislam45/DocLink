import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../ui/Card';
import { useDoctorProfile } from '../../../context/DoctorProfileContext';
import { cn } from '../../../lib/utils';

const DoctorBio = () => {
  const { doctor } = useDoctorProfile();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!doctor.bio) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold text-text-primary">
        About Dr. {doctor.name.split(' ').pop()}
      </h2>
      <Card className="bg-background-secondary/30 border-border/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="relative">
            <p className={cn(
              "text-text-secondary leading-relaxed transition-all duration-300",
              !isExpanded && "line-clamp-4"
            )}>
              {doctor.bio}
            </p>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-accent-primary font-bold text-sm mt-3 hover:underline focus:outline-none flex items-center gap-1 group"
            >
              {isExpanded ? "Show Less" : "Read Full Bio"}
              <span className={cn(
                "transition-transform duration-300",
                isExpanded ? "rotate-180" : ""
              )}>↓</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DoctorBio;
