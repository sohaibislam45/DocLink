import React from 'react';
import DoctorBio from './about/DoctorBio';
import DoctorEducation from './about/DoctorEducation';
import DoctorExperience from './about/DoctorExperience';

const DoctorAboutSection = () => {
  return (
    <div className="flex flex-col gap-12">
      <DoctorBio />
      <DoctorEducation />
      <DoctorExperience />
    </div>
  );
};

export default DoctorAboutSection;
