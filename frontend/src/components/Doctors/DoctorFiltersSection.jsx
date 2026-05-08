import React from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import FilterSidebar from './FilterSidebar';
import { useDoctorSearch } from '../../context/DoctorSearchContext';

const DoctorFiltersSection = () => {
  const { filters, handleFilterChange, handleReset } = useDoctorSearch();

  return (
    <motion.aside 
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-full lg:w-72 flex-shrink-0"
    >
      <div className="sticky top-24 p-6 bg-background-secondary/50 backdrop-blur-xl border border-border/50 rounded-3xl shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <SlidersHorizontal className="w-5 h-5 text-accent-primary" />
          <h2 className="text-xl font-bold">Filters</h2>
        </div>
        <FilterSidebar 
          filters={filters} 
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />
      </div>
    </motion.aside>
  );
};

export default DoctorFiltersSection;
