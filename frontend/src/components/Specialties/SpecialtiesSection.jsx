import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import specialtiesData from '../../data/specialties.json';
import { Card, CardContent } from '../ui/Card';

const SpecialtiesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <section id="specialties" className="py-24 bg-background-primary relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold mb-4"
          >
            Browse by <span className="text-accent-primary">Specialty</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary max-w-2xl"
          >
            Find the right expert for your health concerns from our wide range of medical specialties.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {specialtiesData.map((spec) => {
            const IconComponent = LucideIcons[spec.icon] || LucideIcons.Activity;
            return (
              <motion.div
                key={spec.id}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <Card className="group cursor-pointer hover:border-accent-primary/50 transition-all duration-300 h-full">
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-background-tertiary flex items-center justify-center mb-6 group-hover:bg-accent-primary/20 transition-colors duration-300">
                      <IconComponent className="w-8 h-8 text-accent-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-accent-primary transition-colors">
                      {spec.name}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {spec.doctorCount}+ Specialists
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default SpecialtiesSection;
