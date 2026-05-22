import React, { useState } from 'react';
import { Edit2, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContract, parseContractError } from '../../contract';
import Button from '../Button';
import GlassCard from '../GlassCard';

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

  const locked = election?.finalized || election?.status !== 0;

  const resetForm = () => {
    setName('');
    setParty('');
    setEditId(null);
  };

  const handleSave = async () => {
    if (!name.trim() || !party.trim()) {
      toast.error('Name and party required');
      return;
    }
    setLoading(true);
    try {
      const contract = await getContract();
      if (editId) {
        const tx = await contract.updateCandidate(electionId, editId, name.trim(), party.trim());
        await tx.wait();
        toast.success('Candidate updated');
      } else {
        const tx = await contract.addCandidate(electionId, name.trim(), party.trim());
        await tx.wait();
        toast.success('Candidate added');
      }
      resetForm();
      onUpdated?.();
    } catch (err) {
      toast.error(parseContractError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (candidateId) => {
    if (!window.confirm('Remove this candidate?')) return;
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.removeCandidate(electionId, candidateId);
      await tx.wait();
      toast.success('Candidate removed');
      onUpdated?.();
    } catch (err) {
      toast.error(parseContractError(err));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (c) => {
    setEditId(c.id);
    setName(c.name);
    setParty(c.party);
  };

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <Users className="text-blue-400" size={22} />
        <h3 className="text-xl font-bold text-white">Candidates</h3>
        <span className="text-white/40 text-sm ml-auto">{candidates.length} listed</span>
      </div>

      {locked ? (
        <p className="text-white/50 text-sm mb-4">
          Candidates are locked (election finalized or no longer in draft).
        </p>
      ) : (
        <div className="space-y-3 mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/60 text-sm">{editId ? `Editing #${editId}` : 'Add candidate'}</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white outline-none"
          />
          <input
            value={party}
            onChange={(e) => setParty(e.target.value)}
            placeholder="Party / platform"
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white outline-none"
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} isLoading={loading} className="flex-1">
              {editId ? 'Save changes' : 'Add candidate'}
            </Button>
            {editId && (
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      {candidates.length === 0 ? (
        <p className="text-white/40 text-center py-6">No candidates yet. Add at least one before finalizing.</p>
      ) : (
        <ul className="space-y-2">
          {candidates.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div>
                <p className="text-white font-medium">{c.name}</p>
                <p className="text-white/50 text-sm">{c.party}</p>
              </div>
              {!locked && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="p-2 text-blue-400 hover:bg-white/10 rounded-lg"
                    aria-label="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(c.id)}
                    className="p-2 text-red-400 hover:bg-white/10 rounded-lg"
                    aria-label="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
