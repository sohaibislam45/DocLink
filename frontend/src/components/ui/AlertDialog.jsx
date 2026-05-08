import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

const AlertDialog = ({ open, onOpenChange, children }) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-background-secondary border border-border/50 shadow-lg sm:rounded-lg p-6"
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

const AlertDialogHeader = ({ className, children }) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}>
    {children}
  </div>
);

const AlertDialogTitle = ({ className, children }) => (
  <h2 className={cn("text-lg font-semibold text-text-primary", className)}>
    {children}
  </h2>
);

const AlertDialogDescription = ({ className, children }) => (
  <p className={cn("text-sm text-text-secondary mt-2", className)}>
    {children}
  </p>
);

const AlertDialogFooter = ({ className, children }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6", className)}>
    {children}
  </div>
);

const AlertDialogAction = ({ className, children, onClick, ...props }) => (
  <button
    onClick={onClick}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-accent-primary text-white hover:brightness-110",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

const AlertDialogCancel = ({ className, children, onClick, ...props }) => (
  <button
    onClick={onClick}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-background-tertiary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

// Pass-through wrapper — the modal chrome lives in <AlertDialog> itself
const AlertDialogContent = ({ className, children }) => (
  <div className={cn("space-y-2", className)}>{children}</div>
);

export { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel };
