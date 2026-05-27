import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Users, Plus, Award, Percent } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContract, parseContractError } from '../../contract';
import Button from '../Button';
import GlassCard from '../GlassCard';
import ConfirmDialog from '../shared/ConfirmDialog';
import Badge from '../Badge';

const CandidateCard = ({ candidate, onEdit, onRemove, locked, totalVotes }) => {
  const votePercentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group p-4 rounded-lg bg-gradient-to-br from-violet-600/10 to-blue-600/10 border border-violet-500/20 hover:border-violet-500/50 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-white text-base">{candidate.name}</h4>
          <p className="text-sm text-white/60">{candidate.party}</p>
        </div>
        {!locked && (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(candidate)}
              className="p-2 text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors"
              aria-label="Edit"
            >
              <Edit2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => onRemove(candidate)}
              className="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
              aria-label="Remove"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award size={16} className="text-emerald-400" />
          <span className="font-bold text-white">{candidate.votes}</span>
          <span className="text-sm text-white/60">votes</span>
        </div>
        <div className="flex items-center gap-2">
          <Percent size={16} className="text-amber-400" />
          <span className="font-bold text-white">{votePercentage}%</span>
        </div>
      </div>

      {/* Vote progress bar */}
      <motion.div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${votePercentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
        />
      </motion.div>
    </motion.div>
  );
};

export default function CandidateManager({
  electionId,
  election,
  candidates,
  onUpdated,
}) {
  const [name, setName] = useState('');
  const [party, setParty] = useState('');
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const locked = election?.finalized || election?.status !== 0;
  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  const resetForm = () => {
    setName('');
    setParty('');
    setEditId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !party.trim()) {
      toast.error('Name and party required');
      return;
    }
    setLoading(true);
    const operation = editId ? 'Updating' : 'Adding';
    const tid = toast.loading('Initializing connection...');
    try {
      toast.loading('Connecting to contract...', { id: tid });
      const contract = await getContract();

      toast.loading(`${operation} candidate on-chain...`, { id: tid });
      let tx;
      if (editId) {
        tx = await contract.updateCandidate(electionId, editId, name.trim(), party.trim());
      } else {
        tx = await contract.addCandidate(electionId, name.trim(), party.trim());
      }

      toast.loading('Waiting for blockchain confirmation...', { id: tid });
      const receipt = await tx.wait();

      console.log(`Candidate ${operation} Receipt:`, {
        transactionHash: receipt.hash || receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
      });

      toast.success(`Candidate ${editId ? 'updated' : 'added'} successfully!`, { id: tid });
      resetForm();
      onUpdated?.();
    } catch (err) {
      console.error(`Candidate ${operation} failed:`, err);
      toast.error(parseContractError(err), { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setLoading(true);
    const tid = toast.loading('Initializing connection...');
    try {
      toast.loading('Connecting to contract...', { id: tid });
      const contract = await getContract();

      toast.loading(`Removing candidate "${removeTarget.name}"...`, { id: tid });
      const tx = await contract.removeCandidate(electionId, removeTarget.id);

      toast.loading('Waiting for blockchain confirmation...', { id: tid });
      const receipt = await tx.wait();

      console.log('Candidate Removal Receipt:', {
        transactionHash: receipt.hash || receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
      });

      toast.success('Candidate removed successfully!', { id: tid });
      setRemoveTarget(null);
      onUpdated?.();
    } catch (err) {
      console.error('Candidate removal failed:', err);
      toast.error(parseContractError(err), { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (c) => {
    setEditId(c.id);
    setName(c.name);
    setParty(c.party);
    setShowForm(true);
  };

  return (
    <GlassCard hover={false} className="!p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-violet-600/20 border border-violet-500/30">
            <Users className="text-violet-400" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Candidates</h3>
            <p className="text-xs text-white/50 mt-0.5">{candidates.length} total</p>
          </div>
        </div>
        {!locked && (
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? 'secondary' : 'primary'}
          >
            <Plus size={16} className="mr-1" />
            {showForm ? 'Cancel' : 'Add Candidate'}
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {!locked && showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-5 rounded-lg border border-violet-500/30 bg-gradient-to-br from-violet-600/10 to-blue-600/5 overflow-hidden"
          >
            <p className="text-white/60 text-sm font-semibold mb-4">
              {editId ? `Editing Candidate #${editId}` : 'Add New Candidate'}
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/60 mb-2 block">Candidate Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Alice Johnson"
                  className="input-premium w-full"
                  onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-2 block">Party / Platform *</label>
                <input
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                  placeholder="e.g., Progressive Alliance"
                  className="input-premium w-full"
                  onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} isLoading={loading} className="flex-1">
                  {editId ? 'Save Changes' : 'Add Candidate'}
                </Button>
                <Button variant="secondary" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Candidates List */}
      {candidates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-white/50"
        >
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No candidates yet</p>
          <p className="text-xs mt-1">Add at least one before finalizing the election</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {candidates.map((c) => (
              <CandidateCard
                key={c.id}
                candidate={c}
                onEdit={startEdit}
                onRemove={setRemoveTarget}
                locked={locked}
                totalVotes={totalVotes}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Locked State Notice */}
      {locked && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg bg-amber-600/10 border border-amber-500/20 text-amber-200/80 text-sm"
        >
          <Badge variant="warning" className="inline-block mb-2">Locked</Badge>
          <p>Candidates are locked because the election has been finalized or is no longer in draft status.</p>
        </motion.div>
      )}

      {/* Remove Confirmation */}
      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="Remove candidate?"
        message={`Remove "${removeTarget?.name}" from this election? This action cannot be undone.`}
        confirmLabel="Remove"
        variant="danger"
        isLoading={loading}
        onCancel={() => !loading && setRemoveTarget(null)}
        onConfirm={handleRemove}
      />
    </GlassCard>
  );
}
