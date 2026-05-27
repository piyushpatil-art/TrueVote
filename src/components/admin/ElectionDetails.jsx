import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Lock, ArrowLeft, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContract, getReadContract, parseContractError } from '../../contract';
import {
  parseElection,
  fetchCandidatesForElection,
  getStatusMeta,
  formatDateTime,
} from '../../utils/electionHelpers';
import Badge from '../Badge';
import Button from '../Button';
import GlassCard from '../GlassCard';
import ConfirmDialog from '../shared/ConfirmDialog';
import CandidateManager from './CandidateManager';
import VoterManagement from './VoterManagement';
import ActivityFeed from './ActivityFeed';

// Election statistics card component
const ElectionStatCard = ({ label, value, icon: Icon, color = 'violet' }) => {
  const colors = {
    violet: 'from-violet-600/10 to-purple-600/10 border-violet-500/20 text-violet-400',
    blue: 'from-blue-600/10 to-cyan-600/10 border-blue-500/20 text-blue-400',
    emerald: 'from-emerald-600/10 to-teal-600/10 border-emerald-500/20 text-emerald-400',
    pink: 'from-pink-600/10 to-rose-600/10 border-pink-500/20 text-pink-400',
  };
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`p-4 rounded-lg bg-gradient-to-br ${colors[color]} border`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-${color}-600/20`}>
          <Icon size={20} className={colors[color].split(' ')[3]} />
        </div>
        <div>
          <p className="text-xs text-white/60">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function ElectionDetails({ electionId, address, onBack, onRefreshList }) {
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [actionReceipt, setActionReceipt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const contract = await getReadContract();
      const raw = await contract.getElection(electionId);
      const e = parseElection(raw, electionId);
      setElection(e);
      const list = await fetchCandidatesForElection(contract, electionId, e.candidateCount);
      setCandidates(list);
    } catch (err) {
      toast.error(parseContractError(err));
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (fn, successMsg) => {
    setActionLoading(true);
    setActionReceipt(null);
    const tid = toast.loading('Initializing connection...');
    try {
      toast.loading('Connecting to contract...', { id: tid });
      const contract = await getContract();

      toast.loading('Sending transaction...', { id: tid });
      const tx = await fn(contract);

      toast.loading('Waiting for blockchain confirmation...', { id: tid });
      const receipt = await tx.wait();

      console.log('Action Completed Receipt:', {
        transactionHash: receipt.hash || receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
      });

      toast.success(successMsg, { id: tid });

      setActionReceipt({
        title: successMsg,
        hash: receipt.hash || receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
      });

      await load();
      onRefreshList?.();
      setConfirm(null);
    } catch (err) {
      console.error('Action failed:', err);
      toast.error(parseContractError(err), { id: tid });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full mx-auto mb-4"
          />
          <p className="text-white/60">Loading election details...</p>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="text-center max-w-md">
          <p className="text-white/60 mb-6">Election not found</p>
          <Button variant="secondary" onClick={onBack} className="w-full">
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
        </GlassCard>
      </div>
    );
  }

  const meta = getStatusMeta(election.status);
  const canFinalize = election.status === 0 && !election.finalized && candidates.length > 0;
  const canActivate = election.status === 0 && election.finalized;
  const canEnd = election.status === 1;

  // Calculate vote stats
  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
  const leadingCandidate = candidates.length > 0 ? candidates.reduce((max, c) => (c.votes > max.votes ? c : max)) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-violet-950/20 to-black">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{election.title}</h1>
                <p className="text-sm text-white/50 mt-1">Election #{election.id}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant={meta.variant}>{meta.label}</Badge>
              {election.finalized && <Badge variant="blue">Finalized</Badge>}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        {(canFinalize || canActivate || canEnd) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex flex-wrap gap-3">
              {canFinalize && (
                <Button
                  variant="secondary"
                  isLoading={actionLoading}
                  onClick={() =>
                    setConfirm({
                      title: 'Finalize election?',
                      message:
                        'Candidates will be locked. You cannot add or remove candidates after this. Continue?',
                      confirmLabel: 'Finalize',
                      action: (c) => c.finalizeElection(electionId),
                      success: 'Election finalized — candidates locked',
                    })
                  }
                >
                  <Lock size={16} className="mr-2" />
                  Finalize Election
                </Button>
              )}
              {canActivate && (
                <Button
                  isLoading={actionLoading}
                  onClick={() =>
                    setConfirm({
                      title: 'Activate voting?',
                      message:
                        'Whitelisted voters can cast votes during the active period. This cannot be undone without ending the election.',
                      confirmLabel: 'Activate',
                      action: (c) => c.activateElection(electionId),
                      success: 'Election is now ACTIVE',
                    })
                  }
                >
                  <Play size={16} className="mr-2" />
                  Activate Voting
                </Button>
              )}
              {canEnd && (
                <Button
                  variant="ghost"
                  isLoading={actionLoading}
                  onClick={() =>
                    setConfirm({
                      title: 'End election?',
                      message: 'Voting will close permanently. Results remain on-chain.',
                      confirmLabel: 'End election',
                      variant: 'danger',
                      action: (c) => c.endElection(electionId),
                      success: 'Election ended',
                    })
                  }
                >
                  <Square size={16} className="mr-2" />
                  End Election
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Success Receipt */}
        {actionReceipt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GlassCard hover={false} className="border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden !p-6">
              <button
                onClick={() => setActionReceipt(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                ✕
              </button>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-400 text-xl font-bold">✓</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white text-lg mb-3">{actionReceipt.title}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs text-white/60">
                    <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                      <p className="text-white/40 mb-1">Transaction Hash</p>
                      <a
                        href={`https://sepolia.basescan.org/tx/${actionReceipt.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-300 hover:text-violet-200 break-all"
                      >
                        {actionReceipt.hash}
                      </a>
                    </div>
                    <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                      <p className="text-white/40 mb-1">Block Number</p>
                      <p className="text-white">{actionReceipt.blockNumber}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                      <p className="text-white/40 mb-1">Gas Used</p>
                      <p className="text-white">{actionReceipt.gasUsed || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Election Info Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <GlassCard hover={false} className="!p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ElectionStatCard label="Total Votes" value={totalVotes} icon={BarChart2} color="emerald" />
              <ElectionStatCard label="Candidates" value={candidates.length} icon={BarChart2} color="blue" />
              <ElectionStatCard
                label="Leading Candidate"
                value={leadingCandidate?.votes || 0}
                icon={BarChart2}
                color="violet"
              />
              <ElectionStatCard
                label="Participation"
                value={`${candidates.length > 0 ? Math.round((totalVotes / (candidates.length * 10)) * 100) : 0}%`}
                icon={BarChart2}
                color="pink"
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* Description */}
        {election.description && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <GlassCard hover={false} className="!p-6">
              <h3 className="text-sm font-semibold text-white/60 mb-2">Description</h3>
              <p className="text-white/80">{election.description}</p>
            </GlassCard>
          </motion.div>
        )}

        {/* Schedule Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
          <GlassCard hover={false} className="!p-6">
            <h3 className="text-sm font-semibold text-white/60 mb-4">Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-white/50 mb-1">Start Time</p>
                <p className="text-sm font-mono text-white">{formatDateTime(election.startTime)}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-white/50 mb-1">End Time</p>
                <p className="text-sm font-mono text-white">{formatDateTime(election.endTime)}</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CandidateManager
                electionId={electionId}
                election={election}
                candidates={candidates}
                onUpdated={load}
              />
            </div>
            <div className="flex flex-col gap-8">
              <VoterManagement electionId={electionId} election={election} onUpdated={load} />
              <ActivityFeed />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        variant={confirm?.variant}
        isLoading={actionLoading}
        onCancel={() => !actionLoading && setConfirm(null)}
        onConfirm={() => confirm && runAction(confirm.action, confirm.success)}
      />
    </div>
  );
}
