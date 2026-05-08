import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import DoctorCard from './DoctorCard';
import { useDoctorSearch } from '../../context/DoctorSearchContext';
import { Skeleton } from '../ui/Skeleton';

const DoctorGridSection = () => {
  const { filteredDoctors, handleReset, loading, error, retry } = useDoctorSearch();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-background-secondary rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2 flex-grow">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex justify-between items-center pt-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-background-secondary rounded-2xl border border-border-primary/50">
        <div className="bg-red-500/10 p-6 rounded-full mb-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">Something went wrong</h3>
        <p className="text-text-secondary max-w-xs mb-6">
          {error || "Failed to fetch doctors. Please check your connection and try again."}
        </p>
        <Button onClick={retry} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[400px]">
      <AnimatePresence mode="popLayout">
        {filteredDoctors.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <DoctorCard doctor={doctor} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="bg-background-tertiary p-6 rounded-full mb-4">
              <Users className="w-12 h-12 text-text-secondary opacity-50" />
            </div>
            <h3 className="text-xl font-bold mb-2">No doctors found</h3>
            <p className="text-text-secondary max-w-xs mb-6">
              Try adjusting your filters or search terms to find what you're looking for.
            </p>
            <Button onClick={handleReset}>Reset Filters</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorGridSection;
