import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Copy, Trash2, Upload, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import { getContract, getReadContract, parseContractError, CONTRACT_ADDRESS } from '../../contract';
import { fetchAllElections, formatDateTime } from '../../utils/electionHelpers';
import relayer from '../../lib/relayer';
import GlassCard from '../GlassCard';
import Button from '../Button';
import Badge from '../Badge';
import ConfirmDialog from '../shared/ConfirmDialog';

const VoterCard = ({ voter, onRemove }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    whileHover={{ y: -2 }}
    className="group p-5 rounded-xl bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/20 hover:border-blue-500/50 transition-all"
  >
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <code className="text-xs font-mono text-white/70 truncate">{voter.address}</code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(voter.address);
              toast.success('Wallet address copied!');
            }}
            className="p-1 hover:bg-white/10 rounded transition-colors text-white/50 hover:text-white"
          >
            <Copy size={14} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={voter.voted ? 'success' : 'warning'}>
          {voter.voted ? 'Voted' : 'Not voted'}
        </Badge>
        <button
          onClick={() => onRemove(voter)}
          className="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title="Remove voter"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </motion.div>
);

function parseAddresses(text) {
  const lines = text.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
  const valid = [];
  const invalid = [];
  for (const line of lines) {
    try {
      valid.push(ethers.getAddress(line));
    } catch {
      invalid.push(line);
    }
  }
  return { valid, invalid };
}

export default function AdminVoters({ address }) {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [singleAddress, setSingleAddress] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [activeTab, setActiveTab] = useState('single');
  const [submitting, setSubmitting] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [bulkConfirm, setBulkConfirm] = useState(null);

  // Load Elections
  const loadElections = useCallback(async () => {
    setLoading(true);
    try {
      if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        setElections([]);
        return;
      }
      // Use direct RPC — not MetaMask — for read operations
      const contract = getReadContract();
      const list = await fetchAllElections(contract);
      setElections(list);
      if (list.length > 0 && !selectedElection) {
        setSelectedElection(list[0].id);
      }
    } catch (err) {
      toast.error(parseContractError(err));
    } finally {
      setLoading(false);
    }
  }, [selectedElection]);

  // Load Voters for selected election
  const loadVoters = useCallback(async () => {
    if (!selectedElection) return;
    setRefreshing(true);

    // Helper: sleep to avoid rate limiting on public RPC
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    try {
      // Use a direct public RPC for all READ operations — never MetaMask for reads
      const readContract = getReadContract();
      // Reuse the provider that getReadContract() already created
      const readProvider = readContract.runner;

      let whitelisted = [];

      // --- Attempt 1: Direct contract getter (fastest path) ---
      try {
        whitelisted = await readContract.getWhitelistedVoters(selectedElection);
        console.log(`✓ Loaded ${whitelisted.length} whitelisted voters via contract getter`);
      } catch (getterErr) {
        console.warn('getWhitelistedVoters unavailable, falling back to sequential event scan:', getterErr.message);

        // --- Attempt 2: Sequential chunk event scan (rate-limit safe) ---
        const approvedAddrs = new Set();
        const latestBlock = await readProvider.getBlockNumber();
        const blockWindow = 2000;

        // Scan from the current block back up to 100k blocks (enough for ~55 hours on Base Sepolia)
        const maxLookback = Math.max(0, latestBlock - 100000);

        const approvedFilter = readContract.filters.VoterApproved(selectedElection);
        const removedFilter  = readContract.filters.VoterRemoved(selectedElection);

        for (let toBlock = latestBlock; toBlock > maxLookback; toBlock -= blockWindow) {
          const fromBlock = Math.max(maxLookback, toBlock - blockWindow + 1);
          try {
            const [approvedEvs, removedEvs] = await Promise.all([
              readContract.queryFilter(approvedFilter, fromBlock, toBlock),
              readContract.queryFilter(removedFilter,  fromBlock, toBlock),
            ]);
            for (const ev of approvedEvs) {
              if (ev.args?.[1]) approvedAddrs.add(ev.args[1]);
            }
            for (const ev of removedEvs) {
              if (ev.args?.[1]) approvedAddrs.delete(ev.args[1]);
            }
          } catch (chunkErr) {
            console.warn(`Chunk ${fromBlock}-${toBlock} failed, skipping:`, chunkErr.message);
          }
          // Small delay between chunks to avoid rate limiting on public RPC
          await sleep(150);
        }

        whitelisted = Array.from(approvedAddrs);
        console.log(`✓ Found ${whitelisted.length} whitelisted voters via sequential event scan`);
      }

      if (whitelisted.length === 0) {
        setVoters([]);
        return;
      }

      // Fetch hasVoted status sequentially (one by one) to avoid rate limiting
      const votersWithStatus = [];
      for (const addr of whitelisted) {
        const voted = await readContract.hasVoted(selectedElection, addr).catch(() => false);
        votersWithStatus.push({ address: addr, voted });
        await sleep(100);
      }

      console.log(`✓ Fetched voting status for ${votersWithStatus.length} voters`);
      setVoters(votersWithStatus);
    } catch (err) {
      console.error('Error loading voters:', err);
      toast.error(parseContractError(err));
      setVoters([]);
    } finally {
      setRefreshing(false);
    }
  }, [selectedElection]);

  useEffect(() => {
    loadElections();
  }, [loadElections]);

  useEffect(() => {
    if (selectedElection) {
      loadVoters();
    }
  }, [selectedElection, loadVoters]);

  const filteredVoters = voters.filter((v) =>
    v.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSingle = async () => {
    if (!singleAddress.trim()) return;
    const { valid, invalid } = parseAddresses(singleAddress);
    if (invalid.length) {
      toast.error('Invalid wallet address format');
      return;
    }

    setSubmitting(true);
    const tid = toast.loading('Approving voter...');

    try {
      const contract = await getContract();
      if (process.env.REACT_APP_RELAYER_URL || process.env.REACT_APP_RELAYER_KEY) {
        await relayer.post('approveVoter', { electionId: selectedElection, wallet: valid[0] });
      } else {
        const tx = await contract.approveVoter(selectedElection, valid[0]);
        await tx.wait();
      }
      toast.success('Voter approved successfully!', { id: tid });
      setSingleAddress('');
      loadVoters();
    } catch (err) {
      toast.error(parseContractError(err) || err.message, { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkApprove = async () => {
    if (!bulkConfirm?.length) return;
    setSubmitting(true);
    const tid = toast.loading('Approving batch...');

    try {
      const contract = await getContract();
      if (process.env.REACT_APP_RELAYER_URL || process.env.REACT_APP_RELAYER_KEY) {
        await relayer.post('approveVotersBatch', { electionId: selectedElection, wallets: bulkConfirm });
      } else {
        const tx = await contract.approveVotersBatch(selectedElection, bulkConfirm);
        await tx.wait();
      }
      toast.success(`${bulkConfirm.length} voters approved successfully!`, { id: tid });
      setBulkText('');
      setBulkConfirm(null);
      setShowForm(false);
      loadVoters();
    } catch (err) {
      toast.error(parseContractError(err) || err.message, { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setSubmitting(true);
    const tid = toast.loading('Removing voter...');

    try {
      const contract = await getContract();
      if (process.env.REACT_APP_RELAYER_URL || process.env.REACT_APP_RELAYER_KEY) {
        await relayer.post('removeVoter', { electionId: selectedElection, wallet: removeTarget.address });
      } else {
        const tx = await contract.removeVoter(selectedElection, removeTarget.address);
        await tx.wait();
      }
      toast.success('Voter removed successfully!', { id: tid });
      setRemoveTarget(null);
      loadVoters();
    } catch (err) {
      toast.error(parseContractError(err) || err.message, { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  const currentElection = elections.find((e) => e.id === selectedElection);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Voter Whitelist</h2>
          <p className="text-white/50 mt-1">Manage approved voters for elections</p>
        </div>
        {selectedElection && (
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'secondary' : 'primary'}>
            <Plus size={18} className="mr-2" />
            {showForm ? 'Cancel' : 'Add Voter'}
          </Button>
        )}
      </motion.div>

      {/* Election Selector */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard hover={false} className="!p-6">
          <label className="text-sm font-semibold text-white/70 mb-3 block">Select Election</label>
          <select
            value={selectedElection || ''}
            onChange={(e) => setSelectedElection(Number(e.target.value))}
            className="input-premium w-full"
          >
            <option value="">Choose an election...</option>
            {elections.map((election) => (
              <option key={election.id} value={election.id}>
                #{election.id} - {election.title}
              </option>
            ))}
          </select>
          {currentElection && (
            <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-white/60">
                {formatDateTime(currentElection.startTime)} → {formatDateTime(currentElection.endTime)}
              </p>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Add Voter Form */}
      <AnimatePresence>
        {showForm && selectedElection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard hover={false} className="!p-6 border-blue-500/30 bg-gradient-to-br from-blue-600/10 to-cyan-600/5">
              <div className="flex gap-2 p-1 rounded-lg bg-white/5 border border-white/10 mb-6">
                <button
                  onClick={() => setActiveTab('single')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    activeTab === 'single'
                      ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/20 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Plus size={16} className="inline mr-2" />
                  Single Wallet
                </button>
                <button
                  onClick={() => setActiveTab('bulk')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    activeTab === 'bulk'
                      ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/20 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Upload size={16} className="inline mr-2" />
                  Bulk Import
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'single' && (
                  <motion.div key="single" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-white/70 mb-2 block">Wallet Address</label>
                      <div className="flex gap-2">
                        <input
                          value={singleAddress}
                          onChange={(e) => setSingleAddress(e.target.value)}
                          placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f1e8f1"
                          className="input-premium flex-1 font-mono text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddSingle()}
                        />
                        <Button onClick={handleAddSingle} isLoading={submitting} disabled={!singleAddress.trim()}>
                          Approve
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'bulk' && (
                  <motion.div key="bulk" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-white/70 mb-2 block">
                        Wallet Addresses (one per line)
                      </label>
                      <textarea
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        rows={6}
                        placeholder="0xabc123...&#10;0xdef456...&#10;0xghi789..."
                        className="input-premium w-full text-sm font-mono resize-none"
                      />
                      <p className="text-xs text-white/50 mt-2">
                        Separate with new lines, commas, or semicolons
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        const { valid, invalid } = parseAddresses(bulkText);
                        if (invalid.length) toast.error(`${invalid.length} invalid addresses skipped`);
                        if (valid.length) setBulkConfirm(valid);
                        else toast.error('No valid addresses found');
                      }}
                      disabled={!bulkText.trim()}
                      variant="secondary"
                      className="w-full"
                    >
                      <Upload size={16} className="mr-2" />
                      Review & Approve
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Refresh */}
      {!showForm && voters.length > 0 && (
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-3.5 text-white/40" />
            <input
              type="text"
              placeholder="Search by wallet address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium w-full pl-10"
            />
          </div>
          <Button variant="secondary" onClick={loadVoters} isLoading={refreshing}>
            <RefreshCw size={16} />
          </Button>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : !selectedElection ? (
        <GlassCard hover={false} className="text-center !p-12">
          <Clock size={48} className="mx-auto mb-4 text-white/30" />
          <p className="text-white/60">Select an election to manage voters</p>
        </GlassCard>
      ) : filteredVoters.length === 0 ? (
        <GlassCard hover={false} className="text-center !p-12">
          <AlertCircle size={48} className="mx-auto mb-4 text-white/40" />
          <p className="text-white/60 text-lg">
            {voters.length === 0 ? 'No approved voters yet' : 'No voters match your search'}
          </p>
        </GlassCard>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-sm font-semibold text-white/70">
              Total Approved: <span className="text-white">{filteredVoters.length}</span>
            </p>
            <p className="text-sm text-emerald-400">
              {filteredVoters.filter((v) => v.voted).length} have voted
            </p>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredVoters.map((voter) => (
              <VoterCard
                key={voter.address}
                voter={voter}
                onRemove={() => setRemoveTarget(voter)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="Remove voter?"
        message={`Remove ${removeTarget?.address?.slice(0, 8)}...${removeTarget?.address?.slice(-6)} from whitelist?`}
        confirmLabel="Remove"
        variant="danger"
        isLoading={submitting}
        onCancel={() => !submitting && setRemoveTarget(null)}
        onConfirm={handleRemove}
      />

      <ConfirmDialog
        open={Boolean(bulkConfirm)}
        title="Approve voters in bulk?"
        message={`Add ${bulkConfirm?.length || 0} wallet${bulkConfirm?.length !== 1 ? 's' : ''} to the whitelist?`}
        confirmLabel="Approve All"
        isLoading={submitting}
        onCancel={() => !submitting && setBulkConfirm(null)}
        onConfirm={handleBulkApprove}
      />
    </div>
  );
}