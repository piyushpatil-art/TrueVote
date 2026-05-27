import React from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from './ui/AnimatedCounter';
import { cn } from '../lib/cn';

export default function StatCard({ label, value, icon: Icon, color = 'purple', delay = 0 }) {
  const iconGrad = {
    purple: 'from-violet-600 to-purple-500',
    blue: 'from-blue-600 to-cyan-500',
    cyan: 'from-cyan-600 to-teal-500',
    pink: 'from-fuchsia-600 to-pink-500',
  }[color];

  const numeric = typeof value === 'number' ? value : parseInt(String(value).replace(/\D/g, ''), 10) || 0;
  const isNumeric = typeof value === 'number' || /^\d+$/.test(String(value).replace(/,/g, ''));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      whileHover={{ y: -4 }}
      className="glass-premium rounded-2xl p-5 md:p-6 group hover:border-violet-500/20 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-white/45 text-xs font-medium uppercase tracking-wider mb-2">{label}</p>
          <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {isNumeric ? <AnimatedCounter value={numeric} /> : value}
          </h3>
        </div>
        {Icon && (
          <div
            className={cn(
              'p-3 rounded-xl bg-gradient-to-br shadow-lg shrink-0',
              iconGrad,
              'group-hover:shadow-glow-sm transition-shadow',
            )}
          >
            <Icon size={22} className="text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
