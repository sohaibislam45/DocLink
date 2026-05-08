import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog, DialogContent } from '../ui/Dialog';

const doctorSlides = [
  {
    id: 1,
    name: "Prof. Dr. Shishir Basak",
    specialty: "Medicine and Cardiology",
    image: "https://www.daktars.com/uploads/doctor/avatar/12/28shisir.png"
  },
  {
    id: 2,
    name: "Prof. Dr. Md. Nazrul Islam",
    specialty: "Neuro Medicine Specialist",
    image: "https://www.daktars.com/uploads/doctor/avatar/18/40najrul.png"
  },
  {
    id: 3,
    name: "Dr. Md Baqi Billah",
    specialty: "Orthopaedics Specialist",
    image: "https://www.daktars.com/uploads/doctor/avatar/31/baqi_billah.jpg"
  },
  {
    id: 4,
    name: "Prof. Dr. Syed Alamgir Safwath",
    specialty: "Medicine & Liver Specialist",
    image: "https://www.daktars.com/uploads/doctor/avatar/21/09safawath-e1563256347277.png"
  },
  {
    id: 5,
    name: "Prof. Dr. Shamsun Nahar Begum",
    specialty: "Gyecologist",
    image: "https://www.daktars.com/uploads/doctor/avatar/277/hena-madam-173x260.jpg"
  }
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % doctorSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden flex items-center">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-secondary/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-8"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-background-tertiary border border-border px-4 py-2 rounded-full w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
            </span>
            <span className="text-sm font-medium text-text-secondary">Available 24/7 Virtual Care</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-bold leading-tight">
            Healthcare at Your <span className="text-accent-primary">Fingertips</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg text-text-secondary max-w-xl">
            Connect with top-rated doctors in minutes. Secure, professional, and convenient medical consultations from the comfort of your home.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <Button size="lg" className="h-14 px-8 text-lg" asChild>
              <Link to="/doctors">Find a Doctor</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-8 text-lg gap-2"
              onClick={() => setIsVideoModalOpen(true)}
            >
              <Lucide.Play className="w-5 h-5 fill-current" /> How It Works
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-8 pt-8 border-t border-border mt-4">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-text-primary">1k+</span>
              <span className="text-sm text-text-secondary">Patients</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-text-primary">50+</span>
              <span className="text-sm text-text-secondary">Doctors</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-text-primary">4.9★</span>
              <span className="text-sm text-text-secondary">Rating</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Content - Doctor Photo Slider */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative h-[500px] lg:h-[600px] w-full max-w-[500px] mx-auto"
        >
          {/* Main Slider Container */}
          <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-accent-primary/30 shadow-2xl shadow-accent-primary/10 bg-background-tertiary">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0"
              >
                <img 
                  src={doctorSlides[currentSlide].image} 
                  alt={doctorSlides[currentSlide].name}
                  className="w-full h-full object-cover object-top"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background-primary via-background-primary/40 to-transparent" />
                
                {/* Doctor Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center text-center">
                  <h3 className="text-3xl font-bold text-primary mb-4">{doctorSlides[currentSlide].name}</h3>
                  <div className="inline-flex items-center gap-2 bg-accent-primary/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-accent-primary/50">
                    <Lucide.ShieldCheck className="w-4 h-4 text-accent-primary" />
                    <span className="text-accent-primary font-semibold text-sm uppercase tracking-wider">{doctorSlides[currentSlide].specialty}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slider Indicators */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
            {doctorSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-accent-primary w-8' : 'bg-border hover:bg-text-secondary'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Floating decorative elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -right-6 glass-card p-4 z-20 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="bg-success/20 p-2 rounded-lg">
                <Lucide.Star className="w-6 h-6 fill-success text-success" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-text-secondary">Top Rated</span>
                <span className="text-sm font-bold">Doctors</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none shadow-none">
          <div className="relative pt-[56.25%] w-full bg-black rounded-xl overflow-hidden shadow-2xl">
            <button 
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
            >
              <Lucide.X className="w-5 h-5" />
            </button>
            <iframe 
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/rPHEhagMx94?autoplay=1" 
              title="DocLink Video"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Hero;
