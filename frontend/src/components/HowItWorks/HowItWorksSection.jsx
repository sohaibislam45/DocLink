import React from 'react';
import { motion } from 'framer-motion';
import * as Lucide from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      id: 1,
      title: "Search & Filter",
      description: "Find the best specialist based on specialty, experience, rating, or fee.",
      icon: <Lucide.Search className="w-8 h-8 text-accent-primary" />,
    },
    {
      id: 2,
      title: "Book a Slot",
      description: "Select a convenient date and time for your virtual consultation.",
      icon: <Lucide.CalendarCheck className="w-8 h-8 text-accent-secondary" />,
    },
    {
      id: 3,
      title: "Join Video Call",
      description: "Connect with your doctor via our secure, high-quality video platform.",
      icon: <Lucide.Video className="w-8 h-8 text-success" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-background-primary relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold mb-4"
          >
            How <span className="text-accent-primary">DocLink</span> Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary max-w-2xl"
          >
            Three simple steps to get the professional medical care you need.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-accent-primary via-accent-secondary to-success opacity-20 -translate-y-1/2" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex flex-col items-center text-center relative z-10"
              >
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full bg-background-tertiary border-2 border-border flex items-center justify-center shadow-lg shadow-accent-primary/10 group hover:border-accent-primary transition-colors duration-500">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-background-primary border-2 border-border flex items-center justify-center font-bold text-accent-primary">
                    {step.id}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
