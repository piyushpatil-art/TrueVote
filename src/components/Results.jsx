import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Users, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContract } from '../contract';
import GlassCard from './GlassCard';
import Button from './Button';
import StatCard from './StatCard';
import Badge from './Badge';

const COLORS = ['#7c3aed', '#2563eb', '#06b6d4', '#ec4899', '#f59e0b'];

export default function Results({ address }) {
  const [candidates, setCandidates] = useState([]);
  const [electionName, setElectionName] = useState('');
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
    const interval = setInterval(loadResults, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadResults = async () => {
    try {
      const contract = await getContract();

      const election = await contract.election();
      setElectionName(election.name);

      const count = await contract.candidateCount();
      const list = [];
      let total = 0;

      for (let i = 1; i <= count; i++) {
        const c = await contract.getCandidate(i);
        const votes = Number(c[2]);
        total += votes;
        list.push({
          id: i,
          name: c[0],
          party: c[1],
          votes,
        });
      }

      list.sort((a, b) => b.votes - a.votes);
      setCandidates(list);
      setTotalVotes(total);
      setLoading(false);
    } catch (err) {
      console.error('Error loading results:', err);
      if (loading) {
        toast.error('Failed to load results');
        setLoading(false);
      }
    }
  };

  const getPercentage = (votes) => {
    if (totalVotes === 0) return 0;
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <GlassCard className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading results...</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold mb-2">
            <span className="gradient-text">📊 Live Results</span>
          </h1>
          <p className="text-white/60 text-lg">{electionName || 'Election'} · {totalVotes} total votes</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            label="Total Votes"
            value={totalVotes}
            icon={Users}
            color="purple"
            delay={0}
          />
          <StatCard
            label="Active Candidates"
            value={candidates.length}
            icon={TrendingUp}
            color="blue"
            delay={0.1}
          />
          {candidates.length > 0 && (
            <StatCard
              label="Leading"
              value={candidates[0].name}
              icon={Trophy}
              color="cyan"
              delay={0.2}
            />
          )}
        </div>

        {/* Charts */}
        {candidates.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard className="h-full">
                <h3 className="text-xl font-bold text-white mb-6">Vote Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={candidates}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(26, 26, 46, 0.95)',
                        border: '1px solid rgba(124, 58, 237, 0.3)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="votes" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>
            </motion.div>

            {/* Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="h-full flex flex-col">
                <h3 className="text-xl font-bold text-white mb-6">Vote Percentage</h3>
                <div className="flex-1 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={candidates}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="votes"
                      >
                        {candidates.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(26, 26, 46, 0.95)',
                          border: '1px solid rgba(124, 58, 237, 0.3)',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}

        {/* Leader Board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Leaderboard</h3>
              <Badge variant="primary">Live</Badge>
            </div>

            {candidates.length === 0 ? (
              <p className="text-white/60 text-center py-8">No candidates yet.</p>
            ) : (
              <div className="space-y-3">
                {candidates.map((candidate, idx) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                      idx === 0
                        ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{idx + 1}</span>
                    </div>

                    {/* Photo */}
                    {candidate.photoUrl && (
                      <img
                        src={candidate.photoUrl}
                        alt={candidate.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}

                    {/* Info */}
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{candidate.name}</h4>
                      <p className="text-white/60 text-sm line-clamp-1">{candidate.description}</p>
                    </div>

                    {/* Votes */}
                    <div className="text-right">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">{candidate.votes}</span>
                        <span className="text-white/60 text-sm">votes</span>
                      </div>
                      <span className="text-purple-400 font-semibold text-sm">{getPercentage(candidate.votes)}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Refresh Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Button variant="secondary" onClick={loadResults}>
            🔄 Refresh Results
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
