import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../ui/Card';
import { useDoctorProfile } from '../../../context/DoctorProfileContext';
import * as Lucide from 'lucide-react';

const DoctorEducation = () => {
  const { doctor } = useDoctorProfile();
  
  // Extract qualifications from education field, falling back to bio parsing or defaults
  const qualifications = doctor.education
    ? doctor.education.split(',').map(q => q.trim()).filter(Boolean)
    : (doctor.bio ? doctor.bio.split('.')[0].split(',').map(q => q.trim()).filter(Boolean) : ["Certified Professional"]);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="space-y-4"
    >
      <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
        <Lucide.GraduationCap className="w-5 h-5 text-accent-primary" />
        Education & Qualifications
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {qualifications.map((qual, index) => (
          <Card key={index} className="bg-background-secondary/30 border-border/30 hover:border-accent-primary/30 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center shrink-0">
                <Lucide.Award className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <p className="font-bold text-text-primary leading-tight">{qual}</p>
                <p className="text-xs text-text-secondary mt-1">Certified Professional</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default DoctorEducation;
