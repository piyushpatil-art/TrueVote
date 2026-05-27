import React from 'react';
import { cn } from '../lib/cn';

export default function Badge({ children, variant = 'primary', className = '' }) {
  const variants = {
    primary: 'bg-violet-500/20 text-violet-200 border-violet-500/35',
    success: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
    error: 'bg-red-500/15 text-red-200 border-red-500/30',
    blue: 'bg-blue-500/15 text-blue-200 border-blue-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
