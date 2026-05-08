import React from 'react';
import { motion } from 'framer-motion';
import { Star, Briefcase } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/Avatar';
import { useDoctorProfile } from '../../context/DoctorProfileContext';
import QueueStatusBadge from '../common/QueueStatusBadge';

const DoctorInfoSection = () => {
  const { doctor } = useDoctorProfile();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-background-secondary/50 backdrop-blur-xl border-border/50 overflow-hidden rounded-3xl">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <Avatar className="h-32 w-32 border-4 border-background-tertiary">
              <AvatarImage src={doctor.avatar} alt={doctor.name} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-accent-primary to-accent-secondary text-white text-4xl font-bold">
                {doctor.initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-grow space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-text-primary">{doctor.name}</h1>
                  <Badge variant="secondary" className="bg-accent-primary/10 text-accent-primary border-none px-3 py-1">
                    {doctor.specialty}
                  </Badge>
                </div>
                <QueueStatusBadge isOnline={doctor.isOnline} />
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5 font-bold">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  <span>{doctor.rating}</span>
                  <span className="text-text-secondary font-normal">({doctor.reviewCount} Reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <Briefcase className="w-4 h-4" />
                  <span>{doctor.experience} years experience</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DoctorInfoSection;
