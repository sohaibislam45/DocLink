import React from 'react';
import DoctorsHero from '../components/Doctors/DoctorsHero';
import DoctorsContent from '../components/Doctors/DoctorsContent';

const DoctorsPage = () => {
  return (
    <div className="flex flex-col">
      <DoctorsHero />
      <DoctorsContent />
    </div>
  );
};

export default DoctorsPage;
