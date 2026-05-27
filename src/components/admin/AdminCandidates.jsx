import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Edit2, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContract, getReadContract, parseContractError, CONTRACT_ADDRESS } from '../../contract';
import { fetchAllElections, fetchCandidatesForElection, formatDateTime } from '../../utils/electionHelpers';
import relayer from '../../lib/relayer';
import GlassCard from '../GlassCard';
import Button from '../Button';
import Badge from '../Badge';
import ConfirmDialog from '../shared/ConfirmDialog';

const CandidateCard = ({ candidate, election, onEdit, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    whileHover={{ y: -4 }}
    className="group p-6 rounded-2xl bg-gradient-to-br from-violet-600/10 to-blue-600/10 border border-violet-500/20 hover:border-violet-500/50 transition-all"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h4 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
          {candidate.name}
        </h4>
        <p className="text-sm text-white/60 mt-1">{candidate.party}</p>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(candidate, election)}
          className="p-2 text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors"
          title="Edit"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => onDelete(candidate, election)}
          className="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>

    <div className="flex items-center justify-between pt-4 border-t border-white/10">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-600/20">
          <CheckCircle size={16} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-xs text-white/50">Votes</p>
          <p className="text-xl font-bold text-white">{candidate.votes}</p>
        </div>
      </div>
      <Badge variant={candidate.votes > 0 ? 'success' : 'warning'}>
        {candidate.votes > 0 ? 'Active' : 'No votes'}
      </Badge>
    </div>

    {candidate.votes > 0 && (
      <motion.div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((candidate.votes / 10) * 100, 100)}%` }}
          transition={{ duration: 0.6 }}
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
        />
      </motion.div>
    )}
  </motion.div>
);

export default function AdminCandidates({ address }) {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [formData, setFormData] = useState({ name: '', party: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadElections = useCallback(async () => {
    setLoading(true);
    try {
      if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        setElections([]);
        return;
      }
      const contract = await getReadContract();
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

  const loadCandidates = useCallback(async () => {
    if (!selectedElection) return;
    setSearching(true);
    try {
      const contract = await getReadContract();
      const election = elections.find((e) => e.id === selectedElection);
      if (election) {
        const list = await fetchCandidatesForElection(contract, selectedElection, election.candidateCount);
        setCandidates(list);
      }
    } catch (err) {
      toast.error(parseContractError(err));
    } finally {
      setSearching(false);
    }
  }, [selectedElection, elections]);

  useEffect(() => {
    loadElections();
  }, [loadElections]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.party.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (candidate, election) => {
    setEditingCandidate(candidate);
    setFormData({ name: candidate.name, party: candidate.party });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.party.trim()) {
      toast.error('Name and party are required');
      return;
    }
    setSubmitting(true);
    const tid = toast.loading('Initializing connection...');
    try {
      // If a relayer is configured, submit admin actions to relayer so relayer pays gas.
      if (process.env.REACT_APP_RELAYER_URL || process.env.REACT_APP_RELAYER_KEY) {
        const endpoint = editingCandidate ? 'updateCandidate' : 'addCandidate';
        toast.loading('Submitting to relayer...', { id: tid });
        await relayer.post(endpoint, editingCandidate ? {
          electionId: selectedElection,
          candidateId: editingCandidate.id,
          name: formData.name.trim(),
          party: formData.party.trim(),
        } : {
          electionId: selectedElection,
          name: formData.name.trim(),
          party: formData.party.trim(),
        });
        toast.success(`Candidate ${editingCandidate ? 'updated' : 'added'} successfully!`, { id: tid });
        resetForm();
        loadCandidates();
      } else {
        toast.loading('Connecting to contract...', { id: tid });
        const contract = await getContract();
        let tx;
        if (editingCandidate) {
          tx = await contract.updateCandidate(
            selectedElection,
            editingCandidate.id,
            formData.name.trim(),
            formData.party.trim()
          );
        } else {
          tx = await contract.addCandidate(selectedElection, formData.name.trim(), formData.party.trim());
        }
        toast.loading('Waiting for blockchain confirmation...', { id: tid });
        await tx.wait();
        toast.success(`Candidate ${editingCandidate ? 'updated' : 'added'} successfully!`, { id: tid });
        resetForm();
        loadCandidates();
      }
    } catch (err) {
      toast.error(parseContractError(err) || err.message, { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    const tid = toast.loading('Initializing connection...');
    try {
      if (process.env.REACT_APP_RELAYER_URL || process.env.REACT_APP_RELAYER_KEY) {
        toast.loading('Submitting removal to relayer...', { id: tid });
        await relayer.post('removeCandidate', { electionId: selectedElection, candidateId: deleteTarget.candidate.id });
        toast.success('Candidate removed successfully!', { id: tid });
        setDeleteTarget(null);
        loadCandidates();
      } else {
        toast.loading('Connecting to contract...', { id: tid });
        const contract = await getContract();
        toast.loading(`Removing candidate "${deleteTarget.candidate.name}"...`, { id: tid });
        const tx = await contract.removeCandidate(selectedElection, deleteTarget.candidate.id);
        toast.loading('Waiting for blockchain confirmation...', { id: tid });
        await tx.wait();
        toast.success('Candidate removed successfully!', { id: tid });
        setDeleteTarget(null);
        loadCandidates();
      }
    } catch (err) {
      toast.error(parseContractError(err) || err.message, { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', party: '' });
    setEditingCandidate(null);
    setShowForm(false);
  };

  const currentElection = elections.find((e) => e.id === selectedElection);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Candidate Management</h2>
          <p className="text-white/50 mt-1">Manage candidates across all elections</p>
        </div>
        {selectedElection && (
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'secondary' : 'primary'}>
            <Plus size={18} className="mr-2" />
            {showForm ? 'Cancel' : 'Add Candidate'}
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

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard hover={false} className="!p-6 border-violet-500/30 bg-gradient-to-br from-violet-600/10 to-blue-600/5">
              <h3 className="text-lg font-bold text-white mb-4">
                {editingCandidate ? `Edit: ${editingCandidate.name}` : 'Add New Candidate'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-white/70 mb-2 block">Candidate Name *</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Alice Johnson"
                    className="input-premium w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70 mb-2 block">Party / Platform *</label>
                  <input
                    value={formData.party}
                    onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                    placeholder="e.g., Progressive Alliance"
                    className="input-premium w-full"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} isLoading={submitting} className="flex-1">
                    {editingCandidate ? 'Save Changes' : 'Add Candidate'}
                  </Button>
                  <Button onClick={resetForm} variant="secondary" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      {!showForm && candidates.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-3.5 text-white/40" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium w-full pl-10"
            />
          </div>
        </motion.div>
      )}

      {/* Content */}
      {loading || searching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 animate-pulse"
            />
          ))}
        </div>
      ) : !selectedElection ? (
        <GlassCard hover={false} className="text-center !p-8">
          <Clock size={48} className="mx-auto mb-4 text-white/30" />
          <p className="text-white/60">Select an election to view candidates</p>
        </GlassCard>
      ) : filteredCandidates.length === 0 ? (
        <GlassCard hover={false} className="text-center !p-12">
          <div className="text-white/40 mb-3">
            <Clock size={48} className="mx-auto mb-2 opacity-50" />
          </div>
          <p className="text-white/60 text-lg">
            {candidates.length === 0 ? 'No candidates yet' : 'No candidates match your search'}
          </p>
          {candidates.length === 0 && (
            <p className="text-white/40 text-sm mt-2">Add your first candidate to get started</p>
          )}
        </GlassCard>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredCandidates.map((candidate, idx) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                election={currentElection}
                onEdit={handleEdit}
                onDelete={(c, e) => setDeleteTarget({ candidate: c, election: e })}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove candidate?"
        message={`Remove "${deleteTarget?.candidate.name}" from this election? This action cannot be undone.`}
        confirmLabel="Remove"
        variant="danger"
        isLoading={submitting}
        onCancel={() => !submitting && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
