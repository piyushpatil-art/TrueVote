import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { getReadContract, parseContractError, CONTRACT_ADDRESS } from '../../contract';
import { fetchAllElections, getStatusMeta } from '../../utils/electionHelpers';
import AdminSidebar from './AdminSidebar';
import StatsOverview from './StatsOverview';
import ActivityFeed from './ActivityFeed';
import AnalyticsCharts from './AnalyticsCharts';
import AdminCandidates from './AdminCandidates';
import AdminVoters from './AdminVoters';
import Button from '../Button';
import GlassCard from '../GlassCard';
import CreateElectionModal from './CreateElectionModal';
import ElectionDetails from './ElectionDetails';
import Badge from '../Badge';
import { SkeletonList } from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';

// Sub-pages
function AdminHomePage({ stats, elections, onCreateElection, onViewElection, loading }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <StatsOverview stats={stats} />
      <AnalyticsCharts elections={elections} />
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <SkeletonList count={3} />
          ) : elections.length === 0 ? (
            <EmptyState
              title="No elections yet"
              description="Create your first election to get started with TrueVote"
              actionLabel="Create Election"
              onAction={onCreateElection}
            />
          ) : (
            <GlassCard hover={false} className="!p-6">
              <h3 className="text-lg font-bold text-white mb-1">Recent Elections</h3>
              <p className="text-sm text-white/50 mb-4">Latest election activity</p>
              <div className="space-y-2">
                {elections.slice(0, 5).map((election, index) => {
                  const meta = getStatusMeta(election.status);
                  return (
                    <motion.div
                      key={election.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onViewElection(election.id)}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-violet-500/50 hover:bg-violet-500/5 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white group-hover:text-violet-300 transition-colors">
                            {election.title}
                          </h4>
                          <p className="text-xs text-white/50 mt-1">
                            {election.candidateCount} candidates • {election.votes || 0} votes
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          )}
        </div>
        <ActivityFeed />
      </div>
    </motion.div>
  );
}

function AdminElectionsPage({ elections, onViewElection, onCreateElection, loading }) {
  const [filter, setFilter] = useState('all');

  const filteredElections = elections.filter((e) => {
    if (filter === 'all') return true;
    if (filter === 'active') return e.status === 1;
    if (filter === 'draft') return e.status === 0;
    if (filter === 'ended') return e.status === 2;
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'draft', 'ended'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === status
                  ? 'bg-violet-600/30 text-white border border-violet-500/40'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:text-white'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <Button onClick={onCreateElection} size="sm">
            + Create Election
          </Button>
        </div>
      </div>

      {loading ? (
        <SkeletonList count={4} />
      ) : filteredElections.length === 0 ? (
        <EmptyState
          title="No elections found"
          description={`No ${filter} elections yet. Create one to get started.`}
          actionLabel="Create Election"
          onAction={onCreateElection}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredElections.map((election, index) => {
            const meta = getStatusMeta(election.status);
            return (
              <motion.div
                key={election.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onViewElection(election.id)}
                className="group cursor-pointer"
              >
                <GlassCard hover className="!p-6 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                        {election.title}
                      </h3>
                      <p className="text-xs text-white/50 mt-1">Election #{election.id}</p>
                    </div>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </div>
                  <p className="text-sm text-white/70 mb-4 line-clamp-2">{election.description}</p>
                  <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <p className="text-xs text-white/50">Candidates</p>
                      <p className="text-xl font-bold text-violet-400">{election.candidateCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Votes</p>
                      <p className="text-xl font-bold text-emerald-400">{election.votes || 0}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export default function AdminPage({ address, onDisconnect }) {
  const [currentPage, setCurrentPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedElectionId, setSelectedElectionId] = useState(null);

  const stats = {
    totalElections: elections.length,
    activeElections: elections.filter((e) => e.status === 1).length,
    totalCandidates: elections.reduce((sum, e) => sum + e.candidateCount, 0),
    totalVotes: elections.reduce((sum, e) => sum + (e.votes || 0), 0),
    approvedVoters: Math.floor(Math.random() * 500) + 100,
  };

  const loadElections = useCallback(async () => {
    setLoading(true);
    try {
      if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        setElections([]);
        return;
      }
      const contract = await getReadContract();
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

  if (selectedElectionId) {
    return (
      <ElectionDetails
        electionId={selectedElectionId}
        address={address}
        onBack={() => {
          setSelectedElectionId(null);
          loadElections();
        }}
        onRefreshList={loadElections}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-violet-950/20 to-black">
      {/* Sidebar */}
      <AdminSidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        address={address}
        onDisconnect={onDisconnect}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Header */}
        <header className="border-b border-white/[0.06] bg-black/20 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                {currentPage === 'home' && 'Dashboard'}
                {currentPage === 'elections' && 'Elections'}
                {currentPage === 'candidates' && 'Candidates'}
                {currentPage === 'voters' && 'Voters'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Bell size={20} className="text-white/60" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              {currentPage === 'home' && (
                <AdminHomePage
                  key="home"
                  stats={stats}
                  elections={elections}
                  onCreateElection={() => setShowCreate(true)}
                  onViewElection={setSelectedElectionId}
                  loading={loading}
                />
              )}
              {currentPage === 'elections' && (
                <AdminElectionsPage
                  key="elections"
                  elections={elections}
                  onViewElection={setSelectedElectionId}
                  onCreateElection={() => setShowCreate(true)}
                  loading={loading}
                />
              )}
              {currentPage === 'candidates' && (
                <motion.div key="candidates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <AdminCandidates address={address} />
                </motion.div>
              )}

              {currentPage === 'voters' && (
                <motion.div key="voters" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <AdminVoters address={address} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Create Election Modal */}
      {showCreate && (
        <CreateElectionModal
          onClose={() => setShowCreate(false)}
          onCreated={(id) => {
            loadElections();
            setSelectedElectionId(id);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}
