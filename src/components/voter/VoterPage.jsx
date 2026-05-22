import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, Vote } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContract, parseContractError } from '../../contract';
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

export default function VoterPage({ address }) {
  const [elections, setElections] = useState([]);
  const [electionId, setElectionId] = useState(null);
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [eligibility, setEligibility] = useState({ allowed: false, reason: '' });
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const contract = await getContract();
        const list = await fetchAllElections(contract);
        setElections(list);
        const active = list.find((e) => e.status === 1);
        if (active) setElectionId(active.id);
      } catch (err) {
        toast.error(parseContractError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadElectionData = useCallback(async () => {
    if (!electionId || !address) return;
    try {
      const contract = await getContract();
      const raw = await contract.getElection(electionId);
      const e = parseElection(raw, electionId);
      setElection(e);
      const list = await fetchCandidatesForElection(contract, electionId, e.candidateCount);
      setCandidates(list);
      const [allowed, reason] = await contract.canVote(electionId, address);
      setEligibility({ allowed, reason: reason || '' });
      const voted = await contract.hasVoted(electionId, address);
      setHasVoted(voted);
    } catch (err) {
      toast.error(parseContractError(err));
    }
  }, [electionId, address]);

  useEffect(() => {
    loadElectionData();
  }, [loadElectionData]);

  const castVote = async () => {
    if (!selectedId || !electionId) return;
    setVoting(true);
    const tid = toast.loading('Submitting vote on-chain...');
    try {
      const contract = await getContract();
      const tx = await contract.castVote(electionId, selectedId);
      await tx.wait();
      toast.success('Vote recorded on blockchain', { id: tid });
      setHasVoted(true);
      setEligibility({ allowed: false, reason: 'Already voted in this election' });
      await loadElectionData();
    } catch (err) {
      toast.error(parseContractError(err), { id: tid });
    } finally {
      setVoting(false);
    }
  };

  if (!address) {
    return (
      <GlassCard className="text-center py-16 max-w-lg mx-auto mt-12">
        <p className="text-white/70">Connect your wallet to vote</p>
      </GlassCard>
    );
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const meta = election ? getStatusMeta(election.status) : null;

  return (
    <div className="py-12 max-w-3xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-text">Cast your vote</span>
        </h1>
        <p className="text-white/60 mb-8">One vote per election · Whitelist required</p>

        <ElectionSelector
          elections={elections}
          value={electionId}
          onChange={setElectionId}
          className="mb-8"
        />

        {!electionId ? (
          <GlassCard className="text-center py-12 text-white/50">Select an election to continue</GlassCard>
        ) : !election ? null : (
          <>
            <GlassCard className="mb-6" hover={false}>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-white">{election.title}</h2>
                <Badge variant={meta.variant}>{meta.label}</Badge>
              </div>
              <p className="text-white/50 text-sm">{election.description}</p>
              <p className="text-white/40 text-xs mt-2">{formatDateTime(election.startTime)} — {formatDateTime(election.endTime)}</p>

              <div className="mt-4 p-3 rounded-lg flex items-start gap-3 bg-white/5 border border-white/10">
                <Shield size={20} className={eligibility.allowed ? 'text-green-400' : 'text-yellow-400'} />
                <div>
                  {hasVoted ? (
                    <p className="text-green-300 text-sm">You have voted in this election.</p>
                  ) : eligibility.allowed ? (
                    <p className="text-green-300 text-sm">You are approved to vote.</p>
                  ) : (
                    <p className="text-yellow-200/90 text-sm">{eligibility.reason || 'Not eligible'}</p>
                  )}
                </div>
              </div>
            </GlassCard>

            {candidates.length === 0 ? (
              <GlassCard className="text-center py-10 text-white/50">No candidates in this election</GlassCard>
            ) : (
              <div className="space-y-3 mb-6">
                {candidates.map((c) => (
                  <GlassCard
                    key={c.id}
                    hover={!hasVoted && eligibility.allowed}
                    className={`cursor-pointer ${selectedId === c.id ? 'border-purple-500 ring-1 ring-purple-500/50' : ''} ${hasVoted || !eligibility.allowed ? 'opacity-70 cursor-default' : ''}`}
                    onClick={() => {
                      if (!hasVoted && eligibility.allowed) setSelectedId(c.id);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{c.name}</h3>
                        <p className="text-white/50 text-sm">{c.party}</p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 border-purple-500 ${selectedId === c.id ? 'bg-purple-500' : ''}`}
                      />
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {!hasVoted && eligibility.allowed && candidates.length > 0 && (
              <Button
                className="w-full"
                size="lg"
                onClick={castVote}
                disabled={!selectedId}
                isLoading={voting}
              >
                <Vote size={18} className="inline mr-2" />
                Submit vote on-chain
              </Button>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
