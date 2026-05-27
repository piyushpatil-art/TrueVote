import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/cn';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  delay = 0,
  glow = false,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'glass-premium rounded-2xl p-6 transition-all duration-300',
        hover && 'hover:border-violet-500/25 hover:shadow-glow',
        glow && 'glow-ring border-violet-500/30',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
