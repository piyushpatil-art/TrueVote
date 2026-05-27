import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Upload, Plus, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import { getContract, parseContractError } from '../../contract';
import Button from '../Button';
import GlassCard from '../GlassCard';
import Badge from '../Badge';
import ConfirmDialog from '../shared/ConfirmDialog';

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

export default function VoterManagement({ electionId, election, onUpdated }) {
  const [singleAddress, setSingleAddress] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [loading, setLoading] = useState(false);
  const [bulkConfirm, setBulkConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('single');

  const isEnded = election?.status === 2;

  const approveOne = async () => {
    if (!singleAddress.trim()) return;
    setLoading(true);
    const { valid, invalid } = parseAddresses(singleAddress);
    if (invalid.length) {
      toast.error('Invalid wallet address');
      setLoading(false);
      return;
    }
    const tid = toast.loading('Initializing connection...');
    try {
      toast.loading('Connecting to contract...', { id: tid });
      const contract = await getContract();

      toast.loading(`Whitelisting ${valid[0].slice(0, 6)}...${valid[0].slice(-4)}...`, { id: tid });
      const tx = await contract.approveVoter(electionId, valid[0]);

      toast.loading('Waiting for blockchain confirmation...', { id: tid });
      const receipt = await tx.wait();

      console.log('Single Voter Whitelist Receipt:', {
        transactionHash: receipt.hash || receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
      });

      toast.success('Voter whitelisted successfully!', { id: tid });
      setSingleAddress('');
      onUpdated?.();
    } catch (err) {
      console.error('Single whitelist transaction failed:', err);
      toast.error(parseContractError(err), { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const startBulkApprove = () => {
    const { valid, invalid } = parseAddresses(bulkText);
    if (invalid.length) {
      toast.error(`${invalid.length} invalid address(es) skipped`);
    }
    if (!valid.length) {
      toast.error('No valid addresses');
      return;
    }
    setBulkConfirm(valid);
  };

  const approveBulk = async () => {
    if (!bulkConfirm?.length) return;
    setLoading(true);
    const tid = toast.loading('Initializing connection...');
    try {
      toast.loading('Connecting to contract...', { id: tid });
      const contract = await getContract();

      toast.loading(`Whitelisting ${bulkConfirm.length} wallets in batch...`, { id: tid });
      const tx = await contract.approveVotersBatch(electionId, bulkConfirm);

      toast.loading('Waiting for blockchain confirmation...', { id: tid });
      const receipt = await tx.wait();

      console.log('Batch Whitelist Receipt:', {
        transactionHash: receipt.hash || receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
      });

      toast.success(`${bulkConfirm.length} voters whitelisted successfully!`, { id: tid });
      setBulkText('');
      setBulkConfirm(null);
      setActiveTab('single');
      onUpdated?.();
    } catch (err) {
      console.error('Batch whitelist transaction failed:', err);
      toast.error(parseContractError(err), { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard hover={false} className="!p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-emerald-600/20 border border-emerald-500/30">
          <UserPlus className="text-emerald-400" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Voter Whitelist</h3>
          <p className="text-xs text-white/50 mt-0.5">Approve wallets for voting</p>
        </div>
      </div>

      <p className="text-sm text-white/70 mb-6 p-3 rounded-lg bg-white/5 border border-white/10">
        Only approved wallets can vote in this election. Voting is tracked per election on-chain.
      </p>

      {isEnded ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-amber-600/10 border border-amber-500/20 text-amber-200/80 text-sm"
        >
          <Badge variant="warning" className="inline-block mb-2">Election Ended</Badge>
          <p>The voter whitelist is read-only now that voting has ended.</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Tab Selector */}
          <div className="flex gap-2 p-1 rounded-lg bg-white/5 border border-white/10">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'single'
                  ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/20 text-white'
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
                  ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/20 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Upload size={16} className="inline mr-2" />
              Bulk Import
            </button>
          </div>

          {/* Single Wallet Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'single' && (
              <motion.div
                key="single"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                <div>
                  <label className="text-xs text-white/60 font-semibold mb-2 block">
                    Wallet Address
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        value={singleAddress}
                        onChange={(e) => setSingleAddress(e.target.value)}
                        placeholder="0x..."
                        className="input-premium w-full font-mono text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && approveOne()}
                      />
                    </div>
                    <Button
                      onClick={approveOne}
                      isLoading={loading}
                      disabled={!singleAddress.trim()}
                      size="sm"
                    >
                      <Zap size={16} className="mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-white/50">Enter a wallet address and approve it for voting</p>
              </motion.div>
            )}

            {/* Bulk Import Tab */}
            {activeTab === 'bulk' && (
              <motion.div
                key="bulk"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <div>
                  <label className="text-xs text-white/60 font-semibold mb-2 block">
                    Addresses (one per line)
                  </label>
                  <textarea
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    rows={6}
                    placeholder="0xabc123...&#10;0xdef456...&#10;0xghi789..."
                    className="input-premium w-full text-sm font-mono resize-none"
                  />
                  <p className="text-xs text-white/50 mt-2">
                    Paste addresses separated by line breaks, commas, or semicolons
                  </p>
                </div>
                <Button
                  onClick={startBulkApprove}
                  isLoading={loading}
                  disabled={!bulkText.trim()}
                  className="w-full"
                  variant="secondary"
                >
                  <Upload size={16} className="mr-1" />
                  Approve All Valid Addresses
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Bulk Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(bulkConfirm)}
        title="Approve voters in bulk?"
        message={`Add ${bulkConfirm?.length || 0} wallet${bulkConfirm?.length !== 1 ? 's' : ''} to the whitelist for this election? This action will trigger a blockchain transaction.`}
        confirmLabel="Approve All"
        isLoading={loading}
        onCancel={() => !loading && setBulkConfirm(null)}
        onConfirm={approveBulk}
      />
    </GlassCard>
  );
}
