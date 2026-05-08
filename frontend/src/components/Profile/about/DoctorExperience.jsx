import React from 'react';
import { motion } from 'framer-motion';
import { useDoctorProfile } from '../../../context/DoctorProfileContext';
import * as Lucide from 'lucide-react';
import experienceData from '../../../data/experience.json';

const DoctorExperience = () => {
  const { doctor } = useDoctorProfile();

  const experiences = experienceData[doctor.id] || experienceData.default;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="space-y-6"
    >
      <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
        <Lucide.Briefcase className="w-5 h-5 text-accent-secondary" />
        Professional Experience
      </h2>
      
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {experiences.map((exp, index) => (
          <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background-secondary text-accent-secondary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Lucide.History className="w-5 h-5" />
            </div>
            {/* Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border/50 bg-background-secondary/20 backdrop-blur-sm shadow-sm hover:border-accent-secondary/30 transition-colors">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className="font-bold text-text-primary">{exp.role}</div>
                <time className="text-xs font-medium text-accent-secondary bg-accent-secondary/10 px-2 py-0.5 rounded-full">{exp.period}</time>
              </div>
              <div className="text-sm font-semibold text-text-secondary mb-2">{exp.institution}</div>
              <div className="text-sm text-text-secondary leading-relaxed">{exp.description}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default DoctorExperience;
