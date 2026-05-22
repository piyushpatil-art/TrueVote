import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Square, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContract, parseContractError } from '../../contract';
import {
  parseElection,
  fetchCandidatesForElection,
  getStatusMeta,
  formatDateTime,
} from '../../utils/electionHelpers';
import Badge from '../Badge';
import Button from '../Button';
import GlassCard from '../GlassCard';
import CandidateManager from './CandidateManager';
import VoterManagement from './VoterManagement';

export default function ElectionDetails({ electionId, address, onBack, onRefreshList }) {
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const contract = await getContract();
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
    try {
      const contract = await getContract();
      const tx = await fn(contract);
      await tx.wait();
      toast.success(successMsg);
      await load();
      onRefreshList?.();
    } catch (err) {
      toast.error(parseContractError(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
        Loading election...
      </div>
    );
  }

  if (!election) {
    return (
      <GlassCard className="text-center">
        <p className="text-white/60">Election not found</p>
        <Button className="mt-4" onClick={onBack}>Back</Button>
      </GlassCard>
    );
  }

  const meta = getStatusMeta(election.status);
  const canFinalize = election.status === 0 && !election.finalized && candidates.length > 0;
  const canActivate = election.status === 0 && election.finalized;
  const canEnd = election.status === 1;

  return (
    <div className="py-8">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-white/60 hover:text-white mb-6"
      >
        <ArrowLeft size={18} /> All elections
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="mb-8" hover={false}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{election.title}</h1>
                <Badge variant={meta.variant}>{meta.label}</Badge>
                {election.finalized && <Badge variant="blue">Finalized</Badge>}
              </div>
              <p className="text-white/60 max-w-2xl">{election.description || 'No description'}</p>
              <p className="text-white/40 text-sm mt-3">
                {formatDateTime(election.startTime)} → {formatDateTime(election.endTime)}
              </p>
              <p className="text-white/30 text-xs mt-1 font-mono">ID #{election.id} · Admin {address?.slice(0, 6)}…</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {canFinalize && (
                <Button
                  variant="secondary"
                  isLoading={actionLoading}
                  onClick={() =>
                    runAction((c) => c.finalizeElection(electionId), 'Election finalized — candidates locked')
                  }
                >
                  <Lock size={16} className="inline mr-1" /> Finalize
                </Button>
              )}
              {canActivate && (
                <Button
                  isLoading={actionLoading}
                  onClick={() =>
                    runAction((c) => c.activateElection(electionId), 'Election is now ACTIVE — voting open')
                  }
                >
                  <Play size={16} className="inline mr-1" /> Activate voting
                </Button>
              )}
              {canEnd && (
                <Button
                  variant="ghost"
                  isLoading={actionLoading}
                  onClick={() =>
                    runAction((c) => c.endElection(electionId), 'Election ended')
                  }
                >
                  <Square size={16} className="inline mr-1" /> End election
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-sm text-white/70">
            <strong className="text-white">Workflow:</strong> Draft → add candidates & approve voters →
            Finalize → Activate → voters cast one vote each → End
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CandidateManager
            electionId={electionId}
            election={election}
            candidates={candidates}
            onUpdated={load}
          />
          <VoterManagement electionId={electionId} election={election} onUpdated={load} />
        </div>
      </motion.div>
    </div>
  );
}
