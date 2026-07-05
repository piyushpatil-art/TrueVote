import { ethers } from 'ethers';

// Base Sepolia Testnet
export const BASE_SEPOLIA_CHAIN_ID = '0x14a34';
export const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';
export const BASE_SEPOLIA_EXPLORER = 'https://sepolia.basescan.org';

// Contract Address from environment (new deployed contract)
export const CONTRACT_ADDRESS = 
  process.env.REACT_APP_CONTRACT_ADDRESS || 
  '0xC4B8a8D9A374a21150e19e739f6CBE03C62333a9';

// Debug: show which contract address the frontend is using at runtime
try {
  // eslint-disable-next-line no-console
  console.info('TrueVote CONTRACT_ADDRESS ->', CONTRACT_ADDRESS);
} catch (e) {}

export const TrueVoteABI = [
  'function admin() view returns (address)',
  'function electionCount() view returns (uint256)',
  
  // Election Management
  'function createElection(string title, string description, uint256 startTime, uint256 endTime) returns (uint256)',
  'function activateElection(uint256 electionId)',
  'function endElection(uint256 electionId)',
  'function finalizeElection(uint256 electionId)',
  
  // Candidate Management
  'function addCandidate(uint256 electionId, string name, string party)',
  'function updateCandidate(uint256 electionId, uint256 candidateId, string name, string party)',
  'function removeCandidate(uint256 electionId, uint256 candidateId)',
  
  // Voter Management
  'function approveVoter(uint256 electionId, address voter)',
  'function removeVoter(uint256 electionId, address voter)',
  'function approveVotersBatch(uint256 electionId, address[] voters)',
  
  // Voting
  'function castVote(uint256 electionId, uint256 candidateId)',
  
  // View Functions
  'function getElection(uint256 electionId) view returns (string title, string description, uint256 startTime, uint256 endTime, bool finalized, uint8 status, uint256 candidateCount)',
  'function getCandidate(uint256 electionId, uint256 candidateId) view returns (string name, string party, uint256 voteCount, bool exists)',
  'function getWhitelistedVoters(uint256 electionId) view returns (address[])',
  'function getWhitelistedCount(uint256 electionId) view returns (uint256)',
  'function isApprovedVoter(uint256 electionId, address voter) view returns (bool)',
  'function hasVoted(uint256 electionId, address voter) view returns (bool)',
  'function canVote(uint256 electionId, address voter) view returns (bool allowed, string reason)',
  
  // Events
  'event ElectionCreated(uint256 indexed electionId, string title, uint256 startTime, uint256 endTime)',
  'event VoteCast(uint256 indexed electionId, address indexed voter, uint256 indexed candidateId)',
  'event VoterApproved(uint256 indexed electionId, address indexed voter)',
  'event VoterRemoved(uint256 indexed electionId, address indexed voter)',
];

export const getCurrentChainId = async () => {
  if (!window.ethereum) throw new Error('MetaMask not installed!');
  return window.ethereum.request({ method: 'eth_chainId' });
};

export const switchToBaseSepolia = async () => {
  if (!window.ethereum) throw new Error('MetaMask not installed!');
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
    });
    return true;
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: BASE_SEPOLIA_CHAIN_ID,
            chainName: 'Base Sepolia',
            nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
            rpcUrls: [BASE_SEPOLIA_RPC],
            blockExplorerUrls: [BASE_SEPOLIA_EXPLORER],
          },
        ],
      });
      return true;
    }
    throw switchError;
  }
};

export const validateNetwork = async () => {
  const chainId = await getCurrentChainId();
  if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
    await switchToBaseSepolia();
    return false;
  }
  return true;
};

export const getProvider = () => {
  if (!window.ethereum) throw new Error('MetaMask not installed!');
  return new ethers.BrowserProvider(window.ethereum);
};

export const getContract = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed! Please install MetaMask to use TrueVote.');
  }
  if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    throw new Error('Contract not deployed. Set REACT_APP_CONTRACT_ADDRESS in .env');
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const networkValid = await validateNetwork();
  if (!networkValid) {
    await new Promise((r) => setTimeout(r, 1000));
    return getContract();
  }

  const provider = getProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, TrueVoteABI, signer);
};

export const getReadContract = () => {
  if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    throw new Error('Contract not deployed. Set REACT_APP_CONTRACT_ADDRESS in .env');
  }
  // Always use a direct public RPC for reads — never route reads through MetaMask.
  // MetaMask is only used for signing write transactions (getContract).
  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
  return new ethers.Contract(CONTRACT_ADDRESS, TrueVoteABI, provider);
};

export const parseContractError = (err) => {
  if (err?.code === 'ACTION_REJECTED' || err?.message?.includes('user rejected')) {
    return 'Transaction rejected';
  }
  if (err?.reason) return err.reason;
  if (err?.shortMessage) return err.shortMessage;
  // Ethers may surface low-level errors like "missing revert data" when the RPC
  // doesn't return a revert reason. Provide a clearer, user-friendly message.
  const msg = err?.message || '';
  if (msg.includes('missing revert data')) {
    return 'Transaction reverted (no revert reason provided)';
  }
  if (msg.includes('execution reverted')) {
    // execution reverted sometimes contains additional details; return that if present
    return msg;
  }
  return msg || 'Transaction failed';
};