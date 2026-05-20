import React from 'react';

export default function Badge({ children, variant = 'primary', className = '' }) {
  const variantClass = {
    primary: 'bg-purple-500/30 text-purple-200 border border-purple-500/50',
    success: 'bg-green-500/30 text-green-200 border border-green-500/50',
    warning: 'bg-yellow-500/30 text-yellow-200 border border-yellow-500/50',
    error: 'bg-red-500/30 text-red-200 border border-red-500/50',
    blue: 'bg-blue-500/30 text-blue-200 border border-blue-500/50',
  }[variant];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm ${variantClass} ${className}`}>
      {children}
    </span>
  );
}
