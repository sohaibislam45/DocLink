import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// We'll dispatch a custom event to show a toast message
const ToastContainer = () => {
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    const handleToast = (e) => {
      setToast({ message: e.detail.message, type: e.detail.type || 'info' });
      setTimeout(() => setToast(null), 3000);
    };

    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 50, x: "-50%" }}
          className={cn(
            "fixed bottom-4 left-1/2 z-[100] flex items-center px-6 py-3 rounded-md shadow-lg font-medium text-sm text-white",
            toast.type === 'warning' ? "bg-amber-500" : "bg-blue-600"
          )}
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastContainer;
