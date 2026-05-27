import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Trophy, RefreshCw, TrendingUp, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { getReadContract, parseContractError } from '../../contract';
import {
  fetchAllElections,
  fetchCandidatesForElection,
  parseElection,
  getStatusMeta,
  formatDateTime,
} from '../../utils/electionHelpers';
import ElectionSelector from '../shared/ElectionSelector';
import Badge from '../Badge';
import Button from '../Button';
import GlassCard from '../GlassCard';
import PageShell from '../ui/PageShell';
import AnimatedCounter from '../ui/AnimatedCounter';
import EmptyState from '../ui/EmptyState';
import { SkeletonCard, SkeletonList } from '../ui/Skeleton';

const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-premium rounded-lg px-3 py-2 border border-white/10 text-sm">
      <p className="text-white font-medium">{payload[0].payload.name}</p>
      <p className="text-violet-300">{payload[0].value} votes</p>
    </div>
  );
};

export default function ResultsPage() {
  const [elections, setElections] = useState([]);
  const [electionId, setElectionId] = useState(null);
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadElections = useCallback(async () => {
    const contract = await getReadContract();
    return fetchAllElections(contract);
  }, []);

  const loadResults = useCallback(async () => {
    if (!electionId) return;
    setRefreshing(true);
    try {
      const contract = await getReadContract();
      const raw = await contract.getElection(electionId);
      const e = parseElection(raw, electionId);
      setElection(e);
      const list = await fetchCandidatesForElection(contract, electionId, e.candidateCount);
      list.sort((a, b) => b.votes - a.votes);
      const total = list.reduce((s, c) => s + c.votes, 0);
      setCandidates(list);
      setTotalVotes(total);
    } catch (err) {
      toast.error(parseContractError(err));
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [electionId]);

  useEffect(() => {
    (async () => {
      try {
        const list = await loadElections();
        setElections(list);
        if (list.length) setElectionId(list[0].id);
      } catch (err) {
        toast.error(parseContractError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [loadElections]);

  useEffect(() => {
    loadResults();
    const interval = setInterval(loadResults, 8000);
    return () => clearInterval(interval);
  }, [loadResults]);

  const pct = (votes) => (totalVotes === 0 ? 0 : Number(((votes / totalVotes) * 100).toFixed(1)));

  const chartData = candidates.map((c) => ({
    name: c.name.length > 12 ? `${c.name.slice(0, 12)}…` : c.name,
    fullName: c.name,
    votes: c.votes,
    party: c.party,
  }));

  const meta = election ? getStatusMeta(election.status) : null;
  const leader = candidates[0];

  if (loading && !electionId) {
    return (
      <PageShell title="Live Results" subtitle="Loading on-chain data…" showBg>
        <SkeletonCard />
        <div className="mt-6">
          <SkeletonList count={4} />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Live Results"
      subtitle="Real-time tallies verified on Base Sepolia · auto-refreshes every 8s"
      maxWidth="max-w-6xl"
    >
      <ElectionSelector
        elections={elections}
        value={electionId}
        onChange={setElectionId}
        className="mb-8 relative z-30"
      />

      {!election ? (
        <EmptyState
          icon={Trophy}
          title="No election selected"
          description="Choose an election to view results and charts."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <GlassCard hover={false} className="!p-4">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Status</p>
              <Badge variant={meta.variant}>{meta.label}</Badge>
            </GlassCard>
            <GlassCard hover={false} className="!p-4">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Total votes</p>
              <p className="text-2xl font-bold text-white">
                <AnimatedCounter value={totalVotes} />
              </p>
            </GlassCard>
            <GlassCard hover={false} className="!p-4">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Candidates</p>
              <p className="text-2xl font-bold text-white">{candidates.length}</p>
            </GlassCard>
            <GlassCard hover={false} className="!p-4">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Turnout</p>
              <p className="text-2xl font-bold text-violet-300 flex items-center gap-1">
                <TrendingUp size={20} />
                {totalVotes > 0 ? 'Live' : '—'}
              </p>
            </GlassCard>
          </div>

          {leader && totalVotes > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <GlassCard glow className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-yellow-500/20 to-transparent rounded-full blur-3xl" />
                <div className="relative flex flex-wrap items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/30 to-amber-600/20 border border-yellow-500/30 flex items-center justify-center">
                    <Trophy className="text-yellow-400" size={32} />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-yellow-400/80 text-xs font-semibold uppercase tracking-wider mb-1">
                      Leading candidate
                    </p>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">{leader.name}</h3>
                    <p className="text-white/50">{leader.party}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold gradient-text">{pct(leader.votes)}%</p>
                    <p className="text-white/50 text-sm">
                      <AnimatedCounter value={leader.votes} /> votes
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {candidates.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <GlassCard hover={false}>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Users size={18} className="text-violet-400" /> Vote distribution
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.1)' }} />
                      <Bar dataKey="votes" radius={[8, 8, 0, 0]} maxBarSize={48}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <GlassCard hover={false}>
                <h3 className="text-white font-semibold mb-4">Share breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="votes"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>
          )}

          {candidates.length === 0 ? (
            <EmptyState icon={Users} title="No candidates" description="No votes recorded yet for this election." />
          ) : (
            <div className="space-y-3 mb-8">
              {candidates.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard hover={false} className="!p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 text-sm font-bold">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-white font-semibold">{c.name}</p>
                          <p className="text-white/45 text-xs">{c.party}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{c.votes}</p>
                        <p className="text-violet-300 text-sm">{pct(c.votes)}%</p>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${CHART_COLORS[(i + 1) % CHART_COLORS.length]})`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct(c.votes)}%` }}
                        transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}

          <p className="text-white/30 text-xs text-center mb-4">
            {formatDateTime(election.startTime)} — {formatDateTime(election.endTime)}
          </p>

          <Button variant="secondary" onClick={loadResults} isLoading={refreshing} className="w-full">
            <RefreshCw size={16} /> Refresh results
          </Button>
        </>
      )}
    </PageShell>
  );
}
