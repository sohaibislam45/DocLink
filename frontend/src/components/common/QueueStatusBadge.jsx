import React from 'react';
import { motion } from 'framer-motion';

const QueueStatusBadge = ({ isOnline }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="flex items-center gap-2 mt-2"
    >
      {isOnline ? (
        <>
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="text-sm font-medium text-emerald-400">Online — Accepting Patients</span>
        </>
      ) : (
        <>
          <div className="h-3 w-3 rounded-full bg-slate-500"></div>
          <span className="text-sm font-medium text-slate-500">Offline — Not Available</span>
        </>
      )}
    </motion.div>
  );
};

export default QueueStatusBadge;
