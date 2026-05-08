import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ label = "Back", className = "" }) => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      onClick={() => navigate(-1)}
      className={`flex items-center gap-2 text-text-secondary hover:text-accent-primary transition-colors group ${className}`}
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      <span className="font-medium">{label}</span>
    </motion.button>
  );
};

export default BackButton;
