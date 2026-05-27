import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import GlassCard from '../GlassCard';

const ChartTooltip = ({ active, payload }) => {
  if (active && payload && payload[0]) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/90 border border-violet-500/50 rounded-lg p-3 backdrop-blur-xl"
      >
        <p className="text-xs text-white/70">{payload[0].name}</p>
        <p className="text-sm font-bold text-violet-400">{payload[0].value}</p>
      </motion.div>
    );
  }
  return null;
};

export default function AnalyticsCharts({ elections = [] }) {
  // Calculate vote distribution data
  const voteDistributionData = useMemo(() => {
    if (elections.length === 0) {
      return [
        { name: 'Vote A', value: 45 },
        { name: 'Vote B', value: 30 },
        { name: 'Vote C', value: 25 },
      ];
    }

    const candidates = new Map();
    elections.forEach((election) => {
      // Mock data - in real scenario, aggregate actual candidate votes
      if (!candidates.has(election.title)) {
        candidates.set(election.title, Math.floor(Math.random() * 100) + 10);
      }
    });

    return Array.from(candidates.entries())
      .map(([name, votes]) => ({
        name,
        value: votes,
      }))
      .slice(0, 5);
  }, [elections]);

  // Calculate election participation data
  const participationData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        participation: Math.floor(Math.random() * 100) + 20,
        target: 80,
      });
    }
    return data;
  }, []);

  // Calculate status distribution data
  const statusData = [
    { name: 'Active', value: elections.filter((e) => e.status === 1).length },
    { name: 'Draft', value: elections.filter((e) => e.status === 0).length },
    { name: 'Ended', value: elections.filter((e) => e.status === 2).length },
  ];

  const COLORS = ['#8b5cf6', '#3b82f6', '#ec4899'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Vote Distribution */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard hover={false} className="!p-6 h-full">
          <h3 className="text-lg font-bold text-white mb-1">Vote Distribution</h3>
          <p className="text-sm text-white/50 mb-6">Top candidates by vote count</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={voteDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </motion.div>

      {/* Participation Trend */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard hover={false} className="!p-6 h-full">
          <h3 className="text-lg font-bold text-white mb-1">Participation Trend</h3>
          <p className="text-sm text-white/50 mb-6">7-day voter participation rate</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={participationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="participation" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="target" stroke="rgba(139, 92, 246, 0.2)" strokeWidth={1} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </motion.div>

      {/* Status Distribution */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GlassCard hover={false} className="!p-6 h-full">
          <h3 className="text-lg font-bold text-white mb-1">Election Status</h3>
          <p className="text-sm text-white/50 mb-6">Distribution across states</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </motion.div>

      {/* Quick Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <GlassCard hover={false} className="!p-6 h-full">
          <h3 className="text-lg font-bold text-white mb-1">Quick Metrics</h3>
          <p className="text-sm text-white/50 mb-6">Platform overview</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm text-white/70">Avg. Voter Turnout</span>
              <span className="text-xl font-bold text-emerald-400">68%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm text-white/70">Total Transactions</span>
              <span className="text-xl font-bold text-blue-400">247</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm text-white/70">Gas Spent (ETH)</span>
              <span className="text-xl font-bold text-violet-400">2.34</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm text-white/70">Platform Uptime</span>
              <span className="text-xl font-bold text-cyan-400">99.8%</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
