import React from 'react';
import { motion } from 'framer-motion';

const DoctorsHero = () => {
  return (
    <section className="relative pt-32 pb-16 bg-background-secondary/30 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-accent-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-accent-secondary/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Find the Right <span className="text-accent-primary">Specialist</span>
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed">
            Browse through our network of certified healthcare professionals. Use filters to find a doctor that matches your needs, availability, and budget.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default DoctorsHero;
