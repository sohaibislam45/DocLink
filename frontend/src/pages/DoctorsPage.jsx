import React, { useEffect } from 'react';
import DoctorsHero from '../components/Doctors/DoctorsHero';
import DoctorsContent from '../components/Doctors/DoctorsContent';

const DoctorsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col">
      <DoctorsHero />
      <DoctorsContent />
    </div>
  );
};

export default DoctorsPage;
