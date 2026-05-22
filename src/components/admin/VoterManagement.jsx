import React, { useState } from 'react';
import { UserPlus, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import { getContract, parseContractError } from '../../contract';
import Button from '../Button';
import GlassCard from '../GlassCard';

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

  const isEnded = election?.status === 2;

  const approveOne = async () => {
    if (!singleAddress.trim()) return;
    setLoading(true);
    try {
      const { valid, invalid } = parseAddresses(singleAddress);
      if (invalid.length) {
        toast.error('Invalid wallet address');
        return;
      }
      const contract = await getContract();
      const tx = await contract.approveVoter(electionId, valid[0]);
      await tx.wait();
      toast.success('Voter approved');
      setSingleAddress('');
      onUpdated?.();
    } catch (err) {
      toast.error(parseContractError(err));
    } finally {
      setLoading(false);
    }
  };

  const approveBulk = async () => {
    const { valid, invalid } = parseAddresses(bulkText);
    if (invalid.length) {
      toast.error(`${invalid.length} invalid address(es) skipped`);
    }
    if (!valid.length) {
      toast.error('No valid addresses');
      return;
    }
    setLoading(true);
    const tid = toast.loading(`Approving ${valid.length} voters...`);
    try {
      const contract = await getContract();
      const tx = await contract.approveVotersBatch(electionId, valid);
      await tx.wait();
      toast.success(`${valid.length} voters approved`, { id: tid });
      setBulkText('');
      onUpdated?.();
    } catch (err) {
      toast.error(parseContractError(err), { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="text-green-400" size={22} />
        <h3 className="text-xl font-bold text-white">Voter Whitelist</h3>
      </div>
      <p className="text-white/50 text-sm mb-4">
        Only approved wallets can vote in this election. Voting is tracked per election on-chain.
      </p>

      {isEnded ? (
        <p className="text-yellow-300/80 text-sm">Election ended — voter list is read-only.</p>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-white/60 text-sm mb-2">Add single wallet</label>
            <div className="flex gap-2">
              <input
                value={singleAddress}
                onChange={(e) => setSingleAddress(e.target.value)}
                placeholder="0x..."
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm outline-none focus:border-green-500"
              />
              <Button onClick={approveOne} isLoading={loading} disabled={!singleAddress.trim()}>
                Approve
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2 flex items-center gap-2">
              <Upload size={16} /> Bulk import (one address per line)
            </label>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={5}
              placeholder="0xabc...\n0xdef..."
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-mono outline-none focus:border-green-500 resize-none"
            />
            <Button
              variant="secondary"
              className="mt-3 w-full"
              onClick={approveBulk}
              isLoading={loading}
              disabled={!bulkText.trim()}
            >
              Approve all valid addresses
            </Button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
