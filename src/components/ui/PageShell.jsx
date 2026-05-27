import React from 'react';
import { motion } from 'framer-motion';
import BlockchainBackground from '../shared/BlockchainBackground';
import { cn } from '../../lib/cn';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

export default function PageShell({
  title,
  subtitle,
  badge,
  children,
  className = '',
  maxWidth = 'max-w-5xl',
  showBg = true,
}) {
  return (
    <div className={cn('relative py-10 md:py-14 px-4 sm:px-6', className)}>
      {showBg && <BlockchainBackground className="opacity-60" />}
      <div className={cn('relative z-10 mx-auto', maxWidth)}>
        {(title || subtitle) && (
          <motion.header {...fadeUp} className="mb-8 md:mb-10">
            {badge}
            {title && (
              <h1 className="text-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                <span className="gradient-text">{title}</span>
              </h1>
            )}
            {subtitle && (
              <p className="text-white/55 text-base md:text-lg mt-3 max-w-2xl">{subtitle}</p>
            )}
          </motion.header>
        )}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
