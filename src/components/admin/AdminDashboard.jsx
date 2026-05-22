import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContract, parseContractError, CONTRACT_ADDRESS } from '../../contract';
import { fetchAllElections, getStatusMeta, formatDateTime } from '../../utils/electionHelpers';
import Badge from '../Badge';
import Button from '../Button';
import GlassCard from '../GlassCard';
import CreateElectionModal from './CreateElectionModal';
import ElectionDetails from './ElectionDetails';

export default function AdminDashboard({ address }) {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const loadElections = useCallback(async () => {
    setLoading(true);
    try {
      if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        setElections([]);
        return;
      }
      const contract = await getContract();
      const admin = (await contract.admin()).toLowerCase();
      if (address && admin !== address.toLowerCase()) {
        toast.error('Connected wallet is not the contract admin');
      }
      const list = await fetchAllElections(contract);
      setElections(list);
    } catch (err) {
      toast.error(parseContractError(err));
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadElections();
  }, [loadElections]);

  if (selectedId) {
    return (
      <ElectionDetails
        electionId={selectedId}
        address={address}
        onBack={() => {
          setSelectedId(null);
          loadElections();
        }}
        onRefreshList={loadElections}
      />
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Admin Dashboard</span>
          </h1>
          <p className="text-white/60">Create and manage isolated elections on Base Sepolia</p>
        </motion.div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-white">All Elections</h2>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={18} className="inline mr-2" />
            Create Election
          </Button>
        </div>

        {CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000' && (
          <GlassCard className="mb-6 border-yellow-500/30">
            <p className="text-yellow-200 text-sm">
              Deploy the TrueVote contract and set <code className="bg-black/30 px-1 rounded">REACT_APP_CONTRACT_ADDRESS</code> in{' '}
              <code className="bg-black/30 px-1 rounded">.env</code>, then restart the app.
            </p>
          </GlassCard>
        )}

        {loading ? (
          <div className="text-center py-16 text-white/50">Loading elections...</div>
        ) : elections.length === 0 ? (
          <GlassCard className="text-center py-16">
            <Calendar className="mx-auto text-purple-400 mb-4" size={48} />
            <p className="text-white/60 mb-4">No elections yet</p>
            <Button onClick={() => setShowCreate(true)}>Create your first election</Button>
          </GlassCard>
        ) : (
          <div className="grid gap-4">
            {elections.map((e, i) => {
              const meta = getStatusMeta(e.status);
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard
                    className="cursor-pointer"
                    onClick={() => setSelectedId(e.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white/40 text-sm">#{e.id}</span>
                          <h3 className="text-lg font-bold text-white">{e.title}</h3>
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        </div>
                        <p className="text-white/50 text-sm line-clamp-1">{e.description}</p>
                        <p className="text-white/40 text-xs mt-2">
                          {formatDateTime(e.startTime)} — {formatDateTime(e.endTime)} · {e.candidateCount} candidates
                        </p>
                      </div>
                      <ChevronRight className="text-white/40" />
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateElectionModal
          onClose={() => setShowCreate(false)}
          onCreated={(id) => {
            loadElections();
            setSelectedId(id);
          }}
        />
      )}
    </div>
  );
}
