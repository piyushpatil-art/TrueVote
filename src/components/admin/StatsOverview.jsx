import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Users, Vote, Eye } from 'lucide-react';

const StatsOverviewItem = ({ icon: Icon, label, value, change, color = 'violet', delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof value !== 'number' || value === 0) return;
    
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.floor(increment * step);
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const colorClasses = {
    violet: 'from-violet-600 to-violet-400 text-violet-400',
    blue: 'from-blue-600 to-cyan-400 text-blue-400',
    pink: 'from-pink-600 to-rose-400 text-pink-400',
    emerald: 'from-emerald-600 to-teal-400 text-emerald-400',
  };

  const bgClasses = {
    violet: 'from-violet-600/15 to-purple-600/5 border-violet-500/20',
    blue: 'from-blue-600/15 to-cyan-600/5 border-blue-500/20',
    pink: 'from-pink-600/15 to-rose-600/5 border-pink-500/20',
    emerald: 'from-emerald-600/15 to-teal-600/5 border-emerald-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
      whileHover={{ y: -4 }}
      className={`group relative rounded-2xl p-6 bg-gradient-to-br ${bgClasses[color]} border overflow-hidden`}
    >
      {/* Animated background glow */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colorClasses[color]} opacity-0`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} bg-opacity-10`}>
            <Icon size={24} className={`text-${color}-400`} />
          </div>
          {change !== undefined && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/30"
            >
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">{change}%</span>
            </motion.div>
          )}
        </div>

        <div className="mb-2">
          <motion.h3 className="text-3xl lg:text-4xl font-bold text-white">
            {displayValue.toLocaleString()}
          </motion.h3>
        </div>

        <p className="text-sm text-white/60">{label}</p>
      </div>

      {/* Hover effect border */}
      <motion.div
        className={`absolute inset-0 rounded-2xl border-2 border-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
        style={{
          borderImage: `linear-gradient(135deg, var(--color-1), var(--color-2)) 1`,
        }}
      />
    </motion.div>
  );
};

export default function StatsOverview({ stats }) {
  const items = [
    {
      icon: Vote,
      label: 'Total Elections',
      value: stats?.totalElections || 0,
      color: 'violet',
      change: stats?.electionsChange,
    },
    {
      icon: Zap,
      label: 'Active Elections',
      value: stats?.activeElections || 0,
      color: 'blue',
      change: stats?.activeChange,
    },
    {
      icon: Users,
      label: 'Total Candidates',
      value: stats?.totalCandidates || 0,
      color: 'pink',
      change: stats?.candidatesChange,
    },
    {
      icon: TrendingUp,
      label: 'Total Votes Cast',
      value: stats?.totalVotes || 0,
      color: 'emerald',
      change: stats?.votesChange,
    },
    {
      icon: Eye,
      label: 'Approved Voters',
      value: stats?.approvedVoters || 0,
      color: 'violet',
      change: stats?.votersChange,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {items.map((item, index) => (
        <StatsOverviewItem key={item.label} {...item} delay={index} />
      ))}
    </div>
  );
}
