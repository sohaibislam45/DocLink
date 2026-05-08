import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Lucide from 'lucide-react';
import { fetchCategories } from '../../api/common';
import { Skeleton } from '../ui/Skeleton';

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      setCategories(data);
      setLoading(false);
    };
    loadCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-background-primary">
        <div className="container mx-auto px-6">
          <div className="h-10 w-48 bg-white/5 rounded-lg mb-12 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-white/5 rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background-primary">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              Explore by <span className="text-accent-primary">Category</span>
            </h2>
            <p className="text-text-secondary max-w-xl">
              Find specialized care across our wide range of medical categories and health services.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat, index) => {
            const Icon = Lucide[cat.icon] || Lucide.Stethoscope;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="p-8 rounded-3xl bg-background-secondary/50 border border-border/50 backdrop-blur-xl hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all duration-300 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-background-tertiary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-accent-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">
                      {cat.count} Doctors
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
