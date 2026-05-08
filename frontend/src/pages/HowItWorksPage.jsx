import React from 'react';
import HowItWorksSection from '../components/HowItWorks/HowItWorksSection';
import TestimonialSection from '../components/Testimonial/TestimonialSection';
import CtaSection from '../components/Cta/CtaSection';

const HowItWorksPage = () => {
  return (
    <div className="pt-20">
      <HowItWorksSection />
      <TestimonialSection />
      <CtaSection />
    </div>
  );
};

export default HowItWorksPage;
