import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';
import { Star } from 'lucide-react';

const StatItem = ({ label, target, suffix = "", showStar = false }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const decimals = label === "Average Rating" ? 1 : 0;
  const count = useCountUp(isInView ? target : 0, 2000, 0, decimals);

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-4xl lg:text-5xl font-bold text-accent-primary">
          {typeof count === 'string' ? count : count.toLocaleString()}{suffix}
        </span>
        {showStar && <Star className="w-8 h-8 text-accent-primary fill-accent-primary" strokeWidth={2.25} />}
      </div>
      <span className="text-text-secondary uppercase tracking-widest text-xs font-bold">
        {label}
      </span>
    </div>
  );
};

const StatsSection = () => {
  const stats = [
    { label: "Patients Served", target: 1000, suffix: "+" },
    { label: "Verified Doctors", target: 50, suffix: "+" },
    { label: "Medical Specialties", target: 20, suffix: "+" },
    { label: "Average Rating", target: 4.9, suffix: "", showStar: true },
  ];

  return (
    <section className="py-20 bg-background-tertiary/50 border-y border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {stats.map((stat, index) => (
            <StatItem key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
