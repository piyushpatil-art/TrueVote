import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, X, AlertCircle, CheckCircle, Network } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContract, validateNetwork } from '../contract';
import GlassCard from './GlassCard';
import Button from './Button';
import Badge from './Badge';

export default function AdminPanel({ address }) {
  const [electionName, setElectionName] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateParty, setCandidateParty] = useState('');
  const [electionCreating, setElectionCreating] = useState(false);
  const [candidateAdding, setCandidateAdding] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('checking');
  const [showTransactionDetails, setShowTransactionDetails] = useState(null);

  // Check network on component mount
  React.useEffect(() => {
    checkNetwork();
  }, []);

  const checkNetwork = async () => {
    try {
      setNetworkStatus('checking');
      await validateNetwork();
      setNetworkStatus('valid');
    } catch (err) {
      console.error('Network check failed:', err);
      setNetworkStatus('invalid');
    }
  };

  const handleTransactionError = (err, operationType) => {
    console.error(`❌ ${operationType} Error:`, err);
    
    let errorMessage = 'Transaction failed';
    
    if (err.message?.includes('user rejected')) {
      errorMessage = 'Transaction rejected by user';
    } else if (err.message?.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds for transaction';
    } else if (err.message?.includes('Network')) {
      errorMessage = 'Network error - please check your connection';
      setNetworkStatus('invalid');
    } else if (err.reason) {
      errorMessage = err.reason;
    } else if (err.message) {
      errorMessage = err.message;
    }

    toast.error(errorMessage);
    return errorMessage;
  };

  const createElection = async () => {
    if (!electionName.trim()) {
      toast.error('Please enter election name');
      return;
    }

    try {
      setElectionCreating(true);
      const loadingToastId = toast.loading('Checking network...');

      // Validate network
      console.log('🔍 Validating network for createElection...');
      await validateNetwork();
      toast.loading('Connecting to contract...', { id: loadingToastId });

      // Get contract
      console.log('📝 Getting contract instance...');
      const contract = await getContract();

      // Create transaction
      toast.loading(`Creating election: "${electionName}"...`, { id: loadingToastId });
      console.log('📤 Sending createElection transaction...');
      console.log('Election Name:', electionName);

      const tx = await contract.createElection(electionName);
      console.log('✅ Transaction sent!');
      console.log('Transaction Hash:', tx.hash);
      console.log('From:', tx.from);
      console.log('To:', tx.to);
      
      toast.loading('Waiting for confirmation (this may take 30-60 seconds)...', { id: loadingToastId });

      // Wait for confirmation
      console.log('⏳ Waiting for transaction to be mined...');
      const receipt = await tx.wait();
      
      console.log('✅ Transaction confirmed!');
      console.log('Receipt:', {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'Success' : 'Failed'
      });

      // Success
      setShowTransactionDetails({
        type: 'createElection',
        hash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        status: receipt.status === 1 ? 'Success' : 'Failed'
      });

      toast.success('✅ Election created successfully!', { id: loadingToastId });
      setElectionName('');
      
    } catch (err) {
      handleTransactionError(err, 'createElection');
    } finally {
      setElectionCreating(false);
    }
  };

  const addCandidate = async () => {
    if (!candidateName.trim() || !candidateParty.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setCandidateAdding(true);
      const loadingToastId = toast.loading('Checking network...');

      console.log('🔍 Validating network for addCandidate...');
      await validateNetwork();
      toast.loading('Connecting to contract...', { id: loadingToastId });

      console.log('📝 Getting contract instance...');
      const contract = await getContract();

      toast.loading(`Adding candidate: ${candidateName}...`, { id: loadingToastId });
      console.log('📤 Sending addCandidate transaction...');
      console.log('Candidate Data:', {
        name: candidateName,
        party: candidateParty
      });

      const tx = await contract.addCandidate(candidateName, candidateParty);
      
      console.log('✅ Transaction sent!');
      console.log('Transaction Hash:', tx.hash);
      console.log('From:', tx.from);
      console.log('To:', tx.to);

      toast.loading('Waiting for confirmation (this may take 30-60 seconds)...', { id: loadingToastId });

      console.log('⏳ Waiting for transaction to be mined...');
      const receipt = await tx.wait();

      console.log('✅ Transaction confirmed!');
      console.log('Receipt:', {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'Success' : 'Failed'
      });

      setShowTransactionDetails({
        type: 'addCandidate',
        hash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        candidate: candidateName,
        status: receipt.status === 1 ? 'Success' : 'Failed'
      });

      toast.success(`✅ ${candidateName} added successfully!`, { id: loadingToastId });
      setCandidateName('');
      setCandidateParty('');
      
    } catch (err) {
      handleTransactionError(err, 'addCandidate');
    } finally {
      setCandidateAdding(false);
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Network Status Alert */}
        {networkStatus === 'invalid' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3"
          >
            <AlertCircle className="text-red-400 mt-1 flex-shrink-0" size={20} />
            <div>
              <p className="text-red-300 font-semibold">Wrong Network</p>
              <p className="text-red-200/80 text-sm">
                Please switch to Base Sepolia Testnet. The app will attempt to switch automatically.
              </p>
            </div>
          </motion.div>
        )}

        {/* Transaction Details Modal */}
        {showTransactionDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-green-300 font-semibold mb-2">✅ Transaction Confirmed</p>
                <div className="text-green-200/80 text-sm space-y-1">
                  <p>
                    <span className="font-semibold">Hash:</span>{' '}
                    <code className="bg-black/30 px-2 py-1 rounded text-xs">
                      {showTransactionDetails.hash?.slice(0, 16)}...
                    </code>
                  </p>
                  <p>
                    <span className="font-semibold">Block:</span> {showTransactionDetails.blockNumber}
                  </p>
                  {showTransactionDetails.candidate && (
                    <p>
                      <span className="font-semibold">Candidate:</span> {showTransactionDetails.candidate}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowTransactionDetails(null)}
                  className="mt-3 text-sm text-green-300 hover:text-green-200 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-2">
                <span className="gradient-text">👨‍💼 Admin Panel</span>
              </h1>
              <p className="text-white/60 text-lg">Manage elections and candidates</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                variant={networkStatus === 'valid' ? 'success' : networkStatus === 'invalid' ? 'error' : 'primary'}
                className="text-sm px-3 py-2 flex items-center gap-2"
              >
                <Network size={16} />
                {networkStatus === 'checking' && 'Checking Network...'}
                {networkStatus === 'valid' && 'Base Sepolia ✓'}
                {networkStatus === 'invalid' && 'Wrong Network'}
              </Badge>
              <Badge variant="primary" className="text-base px-4 py-2">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Badge>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Election */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="h-full" delay={0.1}>
              <div className="flex items-center gap-3 mb-6">
                <Plus size={24} className="text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Create Election</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm font-semibold mb-2">
                    Election Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Student Union 2025"
                    value={electionName}
                    onChange={(e) => setElectionName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-purple-500 focus:bg-white/15 transition-all outline-none"
                  />
                </div>

                <Button
                  size="lg"
                  onClick={createElection}
                  isLoading={electionCreating}
                  disabled={!electionName || electionCreating}
                  className="w-full"
                >
                  Create Election
                </Button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Add Candidate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="h-full" delay={0.2}>
              <div className="flex items-center gap-3 mb-6">
                <Edit2 size={24} className="text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Add Candidate</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm font-semibold mb-2">
                    Candidate Name
                  </label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-blue-500 focus:bg-white/15 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-sm font-semibold mb-2">
                    Party
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Democratic Party"
                    value={candidateParty}
                    onChange={(e) => setCandidateParty(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-blue-500 focus:bg-white/15 transition-all outline-none"
                  />
                </div>

                <Button
                  size="lg"
                  variant="secondary"
                  onClick={addCandidate}
                  isLoading={candidateAdding}
                  disabled={!candidateName || !candidateParty || candidateAdding}
                  className="w-full"
                >
                  Add Candidate
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <GlassCard className="border-blue-500/30" delay={0.3}>
            <h3 className="text-white font-bold mb-2">ℹ️ Admin Instructions</h3>
            <ul className="text-white/60 text-sm space-y-2">
              <li>✓ Create an election first</li>
              <li>✓ Then add candidates with their details</li>
              <li>✓ Share the app link with voters</li>
              <li>✓ All votes are recorded on the blockchain</li>
            </ul>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
