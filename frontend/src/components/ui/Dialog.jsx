import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

const Dialog = ({ open, onOpenChange, children }) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-background-secondary border border-border/50 shadow-lg sm:rounded-lg p-6"
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

const DialogHeader = ({ className, children }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}>
    {children}
  </div>
);

const DialogTitle = ({ className, children }) => (
  <h2 className={cn("text-xl font-semibold leading-none tracking-tight text-text-primary", className)}>
    {children}
  </h2>
);

const DialogDescription = ({ className, children }) => (
  <p className={cn("text-sm text-text-secondary mt-1", className)}>
    {children}
  </p>
);

const DialogContent = ({ children, className }) => (
  <div className={cn("relative", className)}>
    {children}
  </div>
);

export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent };
