import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContract, parseContractError } from '../../contract';
import { toUnixSeconds } from '../../utils/electionHelpers';
import Button from '../Button';
import GlassCard from '../GlassCard';

export default function CreateElectionModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
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

    setLoading(true);
    const tid = toast.loading('Creating election on-chain...');
    try {
      const contract = await getContract();
      const tx = await contract.createElection(title.trim(), description.trim(), startTime, endTime);
      const receipt = await tx.wait();
      toast.success('Election created', { id: tid });
      const count = Number(await contract.electionCount());
      onCreated?.(count);
      onClose();
    } catch (err) {
      toast.error(parseContractError(err), { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
        <GlassCard hover={false} className="relative">
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
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Purpose and rules of this election"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white outline-none focus:border-purple-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">Start Date *</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">End Date *</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={loading}>
                Create on Blockchain
              </Button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
