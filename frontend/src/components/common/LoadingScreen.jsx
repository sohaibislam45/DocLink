import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import searchDoctorLottie from '../../assets/animations/Search Doctor.lottie?url';

/**
 * A beautiful, full-screen loading component that handles light and dark themes.
 * Uses DotLottie for high-performance vector animations.
 * 
 * @param {boolean} show - Whether to display the loading screen.
 * @param {string} message - Optional message to display below the animation.
 */
const LoadingScreen = ({ show = true, message = "Loading..." }) => {
  const { isDarkMode } = useTheme();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background with Glassmorphism */}
          <div className={`absolute inset-0 transition-colors duration-500 ${
            isDarkMode 
              ? 'bg-slate-950/80 backdrop-blur-xl' 
              : 'bg-white/70 backdrop-blur-xl'
          }`} />

          {/* Content Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative z-10 flex flex-col items-center max-w-md px-6 text-center"
          >
            {/* DotLottie Animation */}
            <div className="w-64 h-64 md:w-80 md:h-80 mb-4 drop-shadow-2xl">
              <DotLottieReact
                src={searchDoctorLottie}
                loop
                autoplay
              />
            </div>

            {/* Loading Message */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-lg font-semibold tracking-wide ${
                isDarkMode ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              {message}
            </motion.p>
            
            {/* Subtle pulsating dot */}
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`mt-6 w-2 h-2 rounded-full ${
                isDarkMode ? 'bg-accent-primary' : 'bg-accent-secondary'
              }`}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
