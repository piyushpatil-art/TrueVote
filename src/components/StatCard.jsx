import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon: Icon, color = 'purple', trend }) {
  const colorClass = {
    purple: 'from-purple-600 to-purple-400',
    blue: 'from-blue-600 to-blue-400',
    cyan: 'from-cyan-600 to-cyan-400',
    pink: 'from-pink-600 to-pink-400',
  }[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/60 text-sm font-medium mb-2">{label}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`bg-gradient-to-br ${colorClass} p-3 rounded-xl`}>
            <Icon size={24} className="text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
