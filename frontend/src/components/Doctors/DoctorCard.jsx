import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/Avatar';

const DoctorCard = ({ doctor }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="group overflow-hidden flex flex-col h-full border-border/50 hover:border-accent-primary/50 transition-all duration-300">
        <CardContent className="p-6 flex flex-col gap-4 flex-grow">
          <div className="flex justify-between items-start">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-background-tertiary">
                <AvatarImage src={doctor.avatar} alt={doctor.name} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-accent-primary to-accent-secondary text-white text-2xl">
                  {doctor.initials}
                </AvatarFallback>
              </Avatar>
              {doctor.availableToday && (
                <div className="absolute -bottom-1 -right-1 bg-success h-5 w-5 rounded-full border-4 border-background-secondary" />
              )}
            </div>
            <Badge variant="outline" className="bg-background-tertiary text-accent-secondary border-none">
              {doctor.experience} Yrs Exp
            </Badge>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{doctor.name}</h3>
              <Lucide.ShieldCheck className="w-5 h-5 text-accent-primary" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-md font-medium px-2 py-0">
                {doctor.specialty}
              </Badge>
              <div className="flex items-center gap-1">
                <Lucide.Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-bold">{doctor.rating}</span>
                <span className="text-xs text-text-secondary">({doctor.reviewCount})</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-text-secondary line-clamp-2">
            {doctor.bio}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Consultation</span>
              <span className="text-2xl font-black text-accent-primary flex items-baseline gap-1">
                ৳{doctor.fee}
                <span className="text-xs text-text-secondary font-medium tracking-normal lowercase">/session</span>
              </span>
            </div>
            <Button size="sm" className="px-6 rounded-xl font-bold" asChild>
              <Link to={`/doctors/${doctor.id}`}>View profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DoctorCard;
