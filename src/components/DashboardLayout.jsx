import React from 'react';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children, className = '' }) {
  return (
    <div className={`min-h-screen bg-web3-dark animated-bg relative overflow-hidden ${className}`}>
      {/* Floating Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-radial from-purple-500/20 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, 50, 100, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{ top: '10%', right: '10%' }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-gradient-radial from-blue-500/20 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, -100, 50, 0],
            y: [0, -50, -100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          style={{ bottom: '10%', left: '10%' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
