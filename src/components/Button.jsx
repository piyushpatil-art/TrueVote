import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/cn';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const sizes = {
    sm: 'px-3.5 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-sm rounded-xl',
    lg: 'px-8 py-4 text-base rounded-xl',
  };

  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-secondary border-red-500/30 text-red-200 hover:border-red-400/50',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      className={cn(
        variants[variant],
        sizes[size],
        'inline-flex items-center justify-center gap-2',
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
