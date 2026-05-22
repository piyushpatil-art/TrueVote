import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw } from 'lucide-react';
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

const BAR_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626'];

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

  const pct = (votes) => (totalVotes === 0 ? 0 : ((votes / totalVotes) * 100).toFixed(1));

  if (loading && !electionId) {
    return (
      <div className="py-20 text-center text-white/60">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const meta = election ? getStatusMeta(election.status) : null;
  const leader = candidates[0];

  return (
    <div className="py-12 max-w-3xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-text">Election Results</span>
        </h1>
        <p className="text-white/60 mb-8">Per-election tallies from the blockchain</p>

        <ElectionSelector
          elections={elections}
          value={electionId}
          onChange={setElectionId}
          className="mb-8"
        />

        {election && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl text-white font-semibold">{election.title}</h2>
              <Badge variant={meta.variant}>{meta.label}</Badge>
            </div>
            <p className="text-white/40 text-sm mb-6">
              {formatDateTime(election.startTime)} — {formatDateTime(election.endTime)} · {totalVotes} total votes
            </p>

            {leader && totalVotes > 0 && (
              <GlassCard className="mb-6 border-purple-500/40" hover={false}>
                <p className="text-white/50 text-sm flex items-center gap-2">
                  <Trophy className="text-yellow-400" size={18} /> Leading
                </p>
                <h3 className="text-2xl font-bold text-white mt-2">{leader.name}</h3>
                <p className="text-white/60">{leader.party}</p>
                <p className="text-purple-300 text-xl font-bold mt-2">
                  {pct(leader.votes)}% · {leader.votes} votes
                </p>
              </GlassCard>
            )}

            {candidates.length === 0 ? (
              <GlassCard className="text-center py-12 text-white/50">No candidates</GlassCard>
            ) : (
              <div className="space-y-4 mb-6">
                {candidates.map((c, i) => (
                  <GlassCard key={c.id} hover={false}>
                    <div className="flex justify-between mb-2">
                      <div>
                        <span className="text-white/40 text-xs mr-2">#{i + 1}</span>
                        <span className="text-white font-semibold">{c.name}</span>
                        <p className="text-white/50 text-sm">{c.party}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{c.votes}</p>
                        <p className="text-white/50 text-sm">{pct(c.votes)}%</p>
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct(c.votes)}%`, background: BAR_COLORS[i % BAR_COLORS.length] }}
                      />
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            <Button variant="secondary" onClick={loadResults} isLoading={refreshing} className="w-full">
              <RefreshCw size={16} className="inline mr-2" /> Refresh
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}
