import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = true, delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={hover ? { y: -5, scale: 1.02 } : {}}
      className={`glass rounded-2xl p-6 backdrop-blur-xl border border-white/10 transition-all duration-300 ${hover ? 'hover:border-purple-500/50 hover:shadow-glow-lg' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
