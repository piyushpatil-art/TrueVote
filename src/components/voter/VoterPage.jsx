import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Vote, AlertCircle, Zap, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContract, parseContractError } from '../../contract';
import {
  fetchAllElections,
  fetchCandidatesForElection,
  parseElection,
  getStatusMeta,
} from '../../utils/electionHelpers';
import ElectionSelector from '../shared/ElectionSelector';
import Badge from '../Badge';
import Button from '../Button';
import GlassCard from '../GlassCard';
import ConfirmDialog from '../shared/ConfirmDialog';
import PageShell from '../ui/PageShell';
import EmptyState from '../ui/EmptyState';
import { SkeletonList } from '../ui/Skeleton';
import { castVoteGasless } from '../../ugf';
import { cn } from '../../lib/cn';

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
  const [showConfirm, setShowConfirm] = useState(false);
  const [votingStep, setVotingStep] = useState('idle'); // 'idle', 'auth', 'quote', 'payment', 'broadcast', 'confirmed', 'fallback_gas', 'failed'
  const [txHash, setTxHash] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

  const selectedCandidate = candidates.find((c) => c.id === selectedId);

  const submitVote = async () => {
    setShowConfirm(false);
    setVoting(true);
    setVotingStep('auth');
    setTxHash('');
    setErrorMessage('');

    try {
      const contract = await getContract();
      const signer = await contract.runner;
      const hash = await castVoteGasless(contract, electionId, selectedId, signer, (step) => {
        setVotingStep(step);
      });
      setTxHash(hash);
      setHasVoted(true);
      toast.success('Vote recorded on-chain!');
      await loadElectionData();
    } catch (err) {
      console.warn('UGF gasless transaction failed, falling back to standard gas:', err);
      try {
        setVotingStep('fallback_gas');
        const contract = await getContract();
        const tx = await contract.castVote(electionId, selectedId);
        setVotingStep('broadcast');
        const receipt = await tx.wait();
        setTxHash(receipt.hash || receipt.transactionHash);
        setHasVoted(true);
        setVotingStep('confirmed');
        toast.success('Vote cast successfully with standard gas');
        await loadElectionData();
      } catch (fallbackErr) {
        console.error('Fallback transaction failed:', fallbackErr);
        setErrorMessage(parseContractError(fallbackErr));
        setVotingStep('failed');
        toast.error('Transaction failed');
      }
    }
  };

  if (!address) {
    return (
      <PageShell title="Cast your vote" subtitle="Connect your wallet to participate">
        <EmptyState
          icon={Wallet}
          title="Wallet not connected"
          description="Connect MetaMask on Base Sepolia to verify eligibility and vote."
        />
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell title="Cast your vote" subtitle="Loading elections…">
        <SkeletonList count={4} />
      </PageShell>
    );
  }

  const meta = election ? getStatusMeta(election.status) : null;

  return (
    <PageShell
      title="Cast your vote"
      subtitle="One vote per election · Whitelist required · Gasless via UGF"
      maxWidth="max-w-3xl"
    >
      <ElectionSelector
        elections={elections}
        value={electionId}
        onChange={(id) => {
          setElectionId(id);
          setSelectedId(null);
        }}
        className="mb-6"
      />

      {!electionId ? (
        <EmptyState
          icon={Vote}
          title="Select an election"
          description="Pick an active election from the dropdown above."
        />
      ) : !election ? null : (
        <>
          <GlassCard hover={false} className="mb-6 !p-5">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <h2 className="text-xl font-bold text-white">{election.title}</h2>
              <Badge variant={meta.variant}>{meta.label}</Badge>
            </div>
            <div
              className={cn(
                'p-4 rounded-xl flex items-start gap-3 border',
                hasVoted || eligibility.allowed
                  ? 'bg-emerald-500/10 border-emerald-500/25'
                  : 'bg-amber-500/10 border-amber-500/25',
              )}
            >
              <Shield
                size={22}
                className={hasVoted || eligibility.allowed ? 'text-emerald-400' : 'text-amber-400'}
              />
              <p className="text-sm font-medium text-white/90">
                {hasVoted
                  ? 'You have voted in this election'
                  : eligibility.allowed
                    ? 'You are eligible to vote'
                    : eligibility.reason === 'Election is not active'
                      ? 'Voting is not active yet. Please wait for the admin to activate this election.'
                      : eligibility.reason || 'Not eligible'}
              </p>
            </div>
          </GlassCard>

          {candidates.length === 0 ? (
            <EmptyState
              icon={Vote}
              title="No candidates"
              description="This election has no candidates yet."
            />
          ) : (
            <div className="space-y-3 mb-6">
              <AnimatePresence mode="popLayout">
                {candidates.map((c, i) => (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <GlassCard
                      hover={!hasVoted && eligibility.allowed}
                      glow={selectedId === c.id}
                      className={cn(
                        'cursor-pointer !p-4 transition-all',
                        (hasVoted || !eligibility.allowed) && 'opacity-60 cursor-not-allowed',
                      )}
                      onClick={() => {
                        if (!hasVoted && eligibility.allowed) setSelectedId(c.id);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-lg font-bold text-white shadow-glow-sm">
                          {c.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white truncate">{c.name}</h3>
                          <p className="text-white/45 text-sm truncate">{c.party}</p>
                        </div>
                        <div
                          className={cn(
                            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                            selectedId === c.id
                              ? 'border-violet-400 bg-violet-500 glow-ring'
                              : 'border-white/25',
                          )}
                        >
                          {selectedId === c.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-white"
                            />
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!hasVoted && eligibility.allowed && candidates.length > 0 && (
            <>
              <div className="mb-4 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 flex gap-3">
                <AlertCircle className="text-violet-300 shrink-0" size={20} />
                <p className="text-white/65 text-sm leading-relaxed">
                  Once submitted, your vote is permanent on-chain and cannot be changed.
                </p>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => setShowConfirm(true)}
                disabled={!selectedId}
                isLoading={voting}
              >
                <Vote size={18} />
                Submit vote (gasless via UGF)
              </Button>
              <p className="text-center text-white/35 text-xs mt-4 flex items-center justify-center gap-2">
                <Zap size={14} className="text-emerald-400" />
                Powered by Universal Gas Framework
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </p>
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={showConfirm}
        title="Confirm your vote"
        message={`Vote for "${selectedCandidate?.name}" (${selectedCandidate?.party})? This action is irreversible.`}
        confirmLabel="Submit vote"
        isLoading={voting}
        onCancel={() => !voting && setShowConfirm(false)}
        onConfirm={submitVote}
      />

      <AnimatePresence>
        {voting && votingStep !== 'idle' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md"
            >
              <GlassCard hover={false} className="border-violet-500/30 shadow-glow-lg !p-8 relative overflow-hidden">
                {/* Background decorative glows */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-600/25 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl" />

                <h3 className="text-xl font-bold text-white mb-6 text-center">
                  {votingStep === 'confirmed' ? '🎉 Vote Confirmed!' : '⚡ Gasless Transaction'}
                </h3>

                {/* Steps indicator */}
                <div className="relative z-10 space-y-6">
                  {/* Step 1: Authentication */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all",
                        votingStep === 'auth' && 'border-violet-400 bg-violet-500/20 text-violet-300 glow-ring scale-110',
                        ['quote', 'payment', 'broadcast', 'confirmed'].includes(votingStep) && 'border-emerald-500 bg-emerald-500 text-white',
                        !['auth', 'quote', 'payment', 'broadcast', 'confirmed'].includes(votingStep) && 'border-white/20 text-white/30'
                      )}>
                        {['quote', 'payment', 'broadcast', 'confirmed'].includes(votingStep) ? '✓' : '1'}
                      </div>
                      <div className="w-0.5 h-10 bg-white/10" />
                    </div>
                    <div className="pt-0.5">
                      <h4 className={cn("font-semibold text-sm", ['auth', 'quote', 'payment', 'broadcast', 'confirmed'].includes(votingStep) ? 'text-white' : 'text-white/40')}>
                        Relayer Authentication
                      </h4>
                      <p className="text-xs text-white/50 mt-1">
                        Sign message in MetaMask to log into the gas relayer network.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Quote & Terms */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all",
                        ['quote', 'payment'].includes(votingStep) && 'border-violet-400 bg-violet-500/20 text-violet-300 glow-ring scale-110',
                        ['broadcast', 'confirmed'].includes(votingStep) && 'border-emerald-500 bg-emerald-500 text-white',
                        !['quote', 'payment', 'broadcast', 'confirmed'].includes(votingStep) && 'border-white/20 text-white/30'
                      )}>
                        {['broadcast', 'confirmed'].includes(votingStep) ? '✓' : '2'}
                      </div>
                      <div className="w-0.5 h-10 bg-white/10" />
                    </div>
                    <div className="pt-0.5">
                      <h4 className={cn("font-semibold text-sm", ['quote', 'payment', 'broadcast', 'confirmed'].includes(votingStep) ? 'text-white' : 'text-white/40')}>
                        Sponsorship & Agreement
                      </h4>
                      <p className="text-xs text-white/50 mt-1">
                        Generate and authorize sponsored transaction parameters (No ETH required).
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Broadcast */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all",
                        votingStep === 'broadcast' && 'border-violet-400 bg-violet-500/20 text-violet-300 glow-ring scale-110',
                        votingStep === 'confirmed' && 'border-emerald-500 bg-emerald-500 text-white',
                        !['broadcast', 'confirmed'].includes(votingStep) && 'border-white/20 text-white/30'
                      )}>
                        {votingStep === 'confirmed' ? '✓' : '3'}
                      </div>
                    </div>
                    <div className="pt-0.5">
                      <h4 className={cn("font-semibold text-sm", ['broadcast', 'confirmed'].includes(votingStep) ? 'text-white' : 'text-white/40')}>
                        On-Chain Submission
                      </h4>
                      <p className="text-xs text-white/50 mt-1">
                        Relaying transaction and mining the block on Base Sepolia.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Messages / Actions */}
                <div className="mt-8 pt-6 border-t border-white/10 relative z-10 text-center">
                  {votingStep === 'auth' && (
                    <p className="text-sm text-violet-300 animate-pulse font-medium">
                      🔑 Check MetaMask to sign the secure login request...
                    </p>
                  )}
                  {votingStep === 'quote' && (
                    <p className="text-sm text-violet-300 animate-pulse font-medium">
                      ⚖️ Querying relayer for sponsored quote...
                    </p>
                  )}
                  {votingStep === 'payment' && (
                    <p className="text-sm text-violet-300 animate-pulse font-medium">
                      ✍️ Check MetaMask to authorize the gasless sponsorship...
                    </p>
                  )}
                  {votingStep === 'broadcast' && (
                    <div className="space-y-3">
                      <div className="w-6 h-6 border-2 border-violet-500/35 border-t-violet-400 rounded-full animate-spin mx-auto" />
                      <p className="text-sm text-violet-300 font-medium">
                        ⛓️ Relaying sponsored transaction to blockchain...
                      </p>
                    </div>
                  )}
                  {votingStep === 'fallback_gas' && (
                    <p className="text-sm text-amber-300 font-medium animate-pulse">
                      ⛽ UGF gasless relay is offline. Prompting standard transaction instead. Please confirm standard gas in MetaMask...
                    </p>
                  )}
                  {votingStep === 'confirmed' && (
                    <div className="space-y-4">
                      <p className="text-emerald-400 font-semibold text-sm">
                        Success! Your vote is immutably stored.
                      </p>
                      {txHash && (
                        <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 font-mono text-xs text-white/60 select-all overflow-x-auto">
                          {txHash}
                        </div>
                      )}
                      <div className="flex gap-2">
                        {txHash && (
                          <a
                            href={`https://sepolia.basescan.org/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-xs py-2 px-4 flex-1 text-center"
                          >
                            View on BaseScan
                          </a>
                        )}
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setVoting(false);
                            setVotingStep('idle');
                          }}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  )}
                  {votingStep === 'failed' && (
                    <div className="space-y-4">
                      <p className="text-red-400 font-semibold text-sm">
                        Transaction Failed
                      </p>
                      <p className="text-xs text-white/50 px-2 line-clamp-3">
                        {errorMessage || 'Unknown error occurred.'}
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setVoting(false);
                          setVotingStep('idle');
                        }}
                      >
                        Close & Retry
                      </Button>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
