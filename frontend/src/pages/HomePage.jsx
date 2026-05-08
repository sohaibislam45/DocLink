import React from 'react';
import HeroSection from '../components/Hero/HeroSection';
import StatsSection from '../components/Stats/StatsSection';
import SpecialtiesSection from '../components/Specialties/SpecialtiesSection';
import FeaturedDoctorsSection from '../components/Doctors/FeaturedDoctorsSection';
import HowItWorksSection from '../components/HowItWorks/HowItWorksSection';
import TestimonialSection from '../components/Testimonial/TestimonialSection';
import CtaSection from '../components/Cta/CtaSection';

const HomePage = () => {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <StatsSection />
      <SpecialtiesSection />
      <FeaturedDoctorsSection />
      <HowItWorksSection />
      <TestimonialSection />
      <CtaSection />
    </div>
  );
};

export default HomePage;
