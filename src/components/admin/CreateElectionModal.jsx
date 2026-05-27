import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContract, parseContractError } from '../../contract';
import { toUnixSeconds } from '../../utils/electionHelpers';
import Button from '../Button';
import ConfirmDialog from '../shared/ConfirmDialog';

export default function CreateElectionModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [receipt, setReceipt] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) {
      toast.error('Fill title and date range');
      return;
    }
    const startTime = toUnixSeconds(startDate);
    const endTime = toUnixSeconds(endDate);
    if (endTime <= startTime) {
      toast.error('End date must be after start date');
      return;
    }
    setShowConfirm(true);
  };

  const deployElection = async () => {
    const startTime = toUnixSeconds(startDate);
    const endTime = toUnixSeconds(endDate);
    setLoading(true);
    const tid = toast.loading('Initializing connection...');
    try {
      toast.loading('Connecting to contract...', { id: tid });
      const contract = await getContract();

      toast.loading(`Creating election: "${title}"...`, { id: tid });
      const tx = await contract.createElection(title.trim(), description.trim(), startTime, endTime);

      toast.loading('Waiting for confirmation on Base Sepolia...', { id: tid });
      const txReceipt = await tx.wait();

      console.log('Election Created Receipt:', {
        transactionHash: txReceipt.hash || txReceipt.transactionHash,
        blockNumber: txReceipt.blockNumber,
        gasUsed: txReceipt.gasUsed?.toString(),
      });

      toast.success('Election created successfully!', { id: tid });
      
      const count = Number(await contract.electionCount());
      
      setReceipt({
        hash: txReceipt.hash || txReceipt.transactionHash,
        blockNumber: txReceipt.blockNumber,
        gasUsed: txReceipt.gasUsed?.toString(),
        count
      });
      setShowConfirm(false);
    } catch (err) {
      console.error('Error deploying election:', err);
      toast.error(parseContractError(err), { id: tid });
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
          <div className="glass-premium rounded-2xl p-6 border border-violet-500/20 shadow-glow-lg relative overflow-hidden">
            {receipt ? (
              <div className="text-center relative z-10 py-4">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-blue-600/30 border border-emerald-500/30 flex items-center justify-center shadow-glow-sm">
                  <span className="text-emerald-400 text-3xl font-bold">✓</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Election Deployed!</h2>
                <p className="text-white/50 text-sm mb-6">
                  "{title}" has been successfully initialized on-chain.
                </p>

                <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-left font-mono text-xs text-white/70 space-y-2 mb-6">
                  <p className="truncate">
                    <span className="text-white/40">Hash:</span>{' '}
                    <span className="select-all">{receipt.hash}</span>
                  </p>
                  <p>
                    <span className="text-white/40">Block:</span> {receipt.blockNumber}
                  </p>
                  <p>
                    <span className="text-white/40">Gas Used:</span> {receipt.gasUsed || '—'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <a
                    href={`https://sepolia.basescan.org/tx/${receipt.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex-1 py-3 text-center text-sm font-semibold rounded-xl"
                  >
                    View Explorer
                  </a>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      onCreated?.(receipt.count);
                      onClose();
                    }}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/50 hover:text-white"
                  aria-label="Close"
                >
                  <X size={22} />
                </button>
                <h2 className="text-2xl font-bold text-white mb-6">Create Election</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Election Title *</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Student Union 2026"
                      className="input-premium"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Purpose and rules of this election"
                      className="input-premium resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Start Date *</label>
                      <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="input-premium"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">End Date *</label>
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="input-premium"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      Review & Create
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Create this election?"
        message={`Deploy "${title}" on-chain? You will pay gas for this transaction. After creation, add candidates and voters before activating.`}
        confirmLabel="Create on-chain"
        isLoading={loading}
        onCancel={() => !loading && setShowConfirm(false)}
        onConfirm={deployElection}
      />
    </>
  );
}
