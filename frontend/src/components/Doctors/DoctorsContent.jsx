import React from 'react';
import DoctorFiltersSection from './DoctorFiltersSection';
import DoctorSearchSection from './DoctorSearchSection';
import DoctorGridSection from './DoctorGridSection';

const DoctorsContent = () => {
  return (
    <div className="min-h-screen bg-background-primary pt-10 pb-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <DoctorFiltersSection />
          <main className="flex-grow space-y-6">
            <DoctorSearchSection />
            <DoctorGridSection />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DoctorsContent;
