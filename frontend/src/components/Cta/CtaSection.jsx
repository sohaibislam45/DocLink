import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

const CtaSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background-primary via-background-secondary to-accent-primary/20 -z-10" />
      
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-12 lg:p-20 text-center flex flex-col items-center gap-8 border-accent-primary/20"
        >
          <h2 className="text-4xl lg:text-6xl font-bold max-w-3xl leading-tight">
            Ready to See a <span className="text-accent-primary">Doctor</span> Today?
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl">
            Join thousands of satisfied patients who have found reliable healthcare through DocLink. Start your first consultation in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Button size="lg" className="h-16 px-10 text-xl" asChild>
              <Link to="/register/patient">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 text-xl" asChild>
              <Link to="/doctors">View Specialties</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
