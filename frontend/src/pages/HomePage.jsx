import React from 'react';
import HeroSection from '../components/Hero/HeroSection';
import StatsSection from '../components/Stats/StatsSection';
import SpecialtiesSection from '../components/Specialties/SpecialtiesSection';
import FeaturedDoctorsSection from '../components/Doctors/FeaturedDoctorsSection';
import HowItWorksSection from '../components/HowItWorks/HowItWorksSection';
import TestimonialSection from '../components/Testimonial/TestimonialSection';
import CtaSection from '../components/Cta/CtaSection';
import ScrollToTopButton from '../components/ui/ScrollToTopButton';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicSettings } from '../api/admin';
import { Megaphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage = () => {
  const [showBanner, setShowBanner] = React.useState(true);
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: fetchPublicSettings,
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  const bannerText = settings?.announcementBanner;

  return (
    <div className="flex flex-col">
      <AnimatePresence>
        {showBanner && bannerText && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500 text-white py-2 px-4 relative flex items-center justify-center gap-3 overflow-hidden z-[60]"
          >
            <Megaphone className="w-4 h-4 shrink-0" />
            <p className="text-sm font-semibold text-center">{bannerText}</p>
            <button 
              onClick={() => setShowBanner(false)}
              className="absolute right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <HeroSection />
      <StatsSection />
      <SpecialtiesSection />
      <FeaturedDoctorsSection />
      <HowItWorksSection />
      <TestimonialSection />
      <CtaSection />
      <ScrollToTopButton />
    </div>
  );
};

export default HomePage;
