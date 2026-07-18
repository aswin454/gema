import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverEffect = true, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      className={`glass-card rounded-2xl p-6 border border-zinc-800/50 shadow-glass ${
        hoverEffect ? 'glass-card-hover cursor-pointer' : ''
      } ${className}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
