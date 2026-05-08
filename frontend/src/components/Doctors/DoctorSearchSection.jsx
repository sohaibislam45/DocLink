import React from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';
import { useDoctorSearch } from '../../context/DoctorSearchContext';

const DoctorSearchSection = () => {
  const { searchQuery, setSearchQuery, sortBy, setSortBy, filteredDoctors } = useDoctorSearch();

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex flex-col md:flex-row items-center gap-4 bg-background-secondary/50 backdrop-blur-xl p-4 rounded-3xl border border-border/50 shadow-lg"
    >
      <div className="relative flex-grow w-full group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-accent-primary transition-colors" />
        <input 
          type="text"
          placeholder="Search by name, specialty, or hospital..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-background-tertiary/50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-text-primary focus:ring-2 focus:ring-accent-primary/20 transition-all outline-none"
        />
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="relative w-full md:w-48">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full appearance-none bg-background-tertiary/50 border-none rounded-2xl py-3.5 pl-4 pr-10 text-sm font-medium focus:ring-2 focus:ring-accent-primary/20 transition-all outline-none cursor-pointer"
          >
            <option value="relevance">Relevance</option>
            <option value="rating">Top Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
        </div>

        <div className="hidden lg:block h-8 w-px bg-border/50 mx-2" />
        
        <div className="hidden lg:block whitespace-nowrap text-sm text-text-secondary font-medium">
          <span className="text-text-primary font-bold">{filteredDoctors.length}</span> results
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorSearchSection;
