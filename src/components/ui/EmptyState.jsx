import React from 'react';
import { motion } from 'framer-motion';
import Button from '../Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-premium rounded-2xl p-12 text-center border border-white/10"
    >
      {Icon && (
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30 flex items-center justify-center">
          <Icon size={32} className="text-purple-300" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/50 text-sm max-w-md mx-auto mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </motion.div>
  );
}
