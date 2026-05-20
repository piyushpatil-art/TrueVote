import { ethers } from 'ethers';

// ============ NETWORK CONFIGURATION ============
const BASE_SEPOLIA_CHAIN_ID = '0xaa36a7'; // Sepolia Testnet
const BASE_SEPOLIA_RPC = 'https://rpc.sepolia.org';
const BASE_SEPOLIA_EXPLORER = 'https://sepolia.etherscan.io';

// Contract address and ABI
const CONTRACT_ADDRESS = '0xc353B19000C5B2718Ec47351Af73917a5d1c9468';

const VotingABI = [
	{
		"inputs": [
			{ "internalType": "string", "name": "_name", "type": "string" },
			{ "internalType": "string", "name": "_party", "type": "string" }
		],
		"name": "addCandidate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "uint256", "name": "_candidateId", "type": "uint256" }],
		"name": "castVote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "string", "name": "_name", "type": "string" }],
		"name": "createElection",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
	{
		"anonymous": false,
		"inputs": [{ "indexed": false, "internalType": "string", "name": "name", "type": "string" }],
		"name": "ElectionCreated",
		"type": "event"
	},
	{ "inputs": [], "name": "endElection", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": false, "internalType": "address", "name": "voter", "type": "address" },
			{ "indexed": false, "internalType": "uint256", "name": "candidateId", "type": "uint256" }
		],
		"name": "VoteCast",
		"type": "event"
	},
	{ "inputs": [], "name": "admin", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
	{ "inputs": [], "name": "candidateCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
	{
		"inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"name": "candidates",
		"outputs": [
			{ "internalType": "uint256", "name": "id", "type": "uint256" },
			{ "internalType": "string", "name": "name", "type": "string" },
			{ "internalType": "string", "name": "party", "type": "string" },
			{ "internalType": "uint256", "name": "voteCount", "type": "uint256" }
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "election",
		"outputs": [
			{ "internalType": "string", "name": "name", "type": "string" },
			{ "internalType": "bool", "name": "isActive", "type": "bool" },
			{ "internalType": "uint256", "name": "candidateCount", "type": "uint256" }
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
		"name": "getCandidate",
		"outputs": [
			{ "internalType": "string", "name": "name", "type": "string" },
			{ "internalType": "string", "name": "party", "type": "string" },
			{ "internalType": "uint256", "name": "voteCount", "type": "uint256" }
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "address", "name": "", "type": "address" }],
		"name": "hasVoted",
		"outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
		"stateMutability": "view",
		"type": "function"
	}
];

// ============ NETWORK DETECTION & SWITCHING ============
export const getCurrentChainId = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed!');
  }
  
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('Current Chain ID:', chainId, 'Expected:', BASE_SEPOLIA_CHAIN_ID);
    return chainId;
  } catch (err) {
    console.error('Error getting chain ID:', err);
    throw err;
  }
};

export const switchToBaseSepolia = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed!');
  }

  try {
    console.log('Attempting to switch to Base Sepolia...');
    
    // Try to switch to Base Sepolia
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
    });
    
    console.log('✅ Successfully switched to Base Sepolia');
    return true;
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      console.log('Base Sepolia not in MetaMask. Adding network...');
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: BASE_SEPOLIA_CHAIN_ID,
              chainName: 'Base Sepolia Testnet',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: [BASE_SEPOLIA_RPC],
              blockExplorerUrls: [BASE_SEPOLIA_EXPLORER],
            },
          ],
        });
        console.log('✅ Added Base Sepolia to MetaMask');
        return true;
      } catch (addError) {
        console.error('Error adding Base Sepolia:', addError);
        throw new Error('Failed to add Base Sepolia network to MetaMask');
      }
    } else {
      console.error('Error switching network:', switchError);
      throw new Error('Failed to switch to Base Sepolia network');
    }
  }
};

export const validateNetwork = async () => {
  try {
    const chainId = await getCurrentChainId();
    
    if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
      console.warn(`❌ Wrong network! Current: ${chainId}, Expected: ${BASE_SEPOLIA_CHAIN_ID}`);
      console.log('Switching to Base Sepolia...');
      await switchToBaseSepolia();
      return false; // Network was switched, caller should retry
    }
    
    console.log('✅ Connected to Base Sepolia');
    return true;
  } catch (err) {
    console.error('Network validation error:', err);
    throw err;
  }
};

// ============ CONTRACT CONNECTION ============
export const getContract = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed! Please install MetaMask to use this app.');
  }

  try {
    // Request accounts
    console.log('Requesting MetaMask accounts...');
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log('✅ Accounts requested');

    // Validate and switch network if needed
    console.log('Validating network...');
    const networkValid = await validateNetwork();
    
    if (!networkValid) {
      console.log('Network was switched, reconnecting...');
      await new Promise(r => setTimeout(r, 1000)); // Wait for network switch to complete
      return getContract(); // Retry after network switch
    }

    // Get provider and signer
    console.log('Creating provider and signer...');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    console.log('✅ Signer connected:', signerAddress);

    // Get network info for verification
    const network = await provider.getNetwork();
    console.log('Network info:', { name: network.name, chainId: network.chainId });

    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI, signer);
    console.log('✅ Contract connected:', CONTRACT_ADDRESS);
    
    return contract;
  } catch (err) {
    console.error('❌ Failed to connect to contract:', err);
    throw new Error(`Web3 Connection Error: ${err.message}`);
  }
};

export const getReadContract = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed!');
  }
  
  try {
    console.log('Creating read-only contract instance...');
    
    // Validate network first
    try {
      await validateNetwork();
    } catch (err) {
      console.warn('Network validation warning (read-only):', err);
      // For read-only operations, we can continue even if network is wrong
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI, provider);
    console.log('✅ Read-only contract ready');
    
    return contract;
  } catch (err) {
    console.error('❌ Failed to create read contract:', err);
    throw new Error(`Read Contract Error: ${err.message}`);
  }
};