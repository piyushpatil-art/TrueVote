import React from 'react';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen mesh-bg relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute w-[520px] h-[520px] rounded-full blur-[120px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.6) 0%, transparent 70%)',
            top: '-12%',
            right: '-8%',
          }}
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)',
            bottom: '-5%',
            left: '-5%',
          }}
          animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)',
            top: '40%',
            left: '35%',
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 14, repeat: Infinity }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
