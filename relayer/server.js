require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ethers } = require('ethers');
const path = require('path');

const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RELAYER_API_KEY = process.env.RELAYER_API_KEY;
const PORT = process.env.PORT || 3001;

if (!RELAYER_PRIVATE_KEY || !RPC_URL || !CONTRACT_ADDRESS) {
  console.warn('Missing RELAYER_PRIVATE_KEY, RPC_URL or CONTRACT_ADDRESS in environment. Server will still start but will fail on transactions.');
}

const abiPath = path.resolve(__dirname, '../src/contracts/votingABI.json');
let contractAbi = null;
try {
  contractAbi = require(abiPath);
} catch (err) {
  console.error('Could not load ABI from', abiPath, err.message);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = RELAYER_PRIVATE_KEY ? new ethers.Wallet(RELAYER_PRIVATE_KEY, provider) : null;
const contract = wallet && contractAbi ? new ethers.Contract(CONTRACT_ADDRESS, contractAbi, wallet) : null;

const app = express();
app.use(cors());
app.use(bodyParser.json());

function requireKey(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.apiKey;
  if (!RELAYER_API_KEY) return res.status(500).json({ error: 'Relayer not configured' });
  if (!key || key !== RELAYER_API_KEY) return res.status(403).json({ error: 'Forbidden' });
  next();
}

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'TrueVote Relayer' });
});

app.post('/addCandidate', requireKey, async (req, res) => {
  const { electionId, name, party } = req.body;
  try {
    if (!contract) throw new Error('Contract not configured');
    const tx = await contract.addCandidate(electionId, name, party);
    const receipt = await tx.wait();
    res.json({ txHash: receipt.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/updateCandidate', requireKey, async (req, res) => {
  const { electionId, candidateId, name, party } = req.body;
  try {
    if (!contract) throw new Error('Contract not configured');
    const tx = await contract.updateCandidate(electionId, candidateId, name, party);
    const receipt = await tx.wait();
    res.json({ txHash: receipt.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/removeCandidate', requireKey, async (req, res) => {
  const { electionId, candidateId } = req.body;
  try {
    if (!contract) throw new Error('Contract not configured');
    const tx = await contract.removeCandidate(electionId, candidateId);
    const receipt = await tx.wait();
    res.json({ txHash: receipt.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/approveVoter', requireKey, async (req, res) => {
  const { electionId, wallet: addr } = req.body;
  try {
    if (!contract) throw new Error('Contract not configured');
    const tx = await contract.approveVoter(electionId, addr);
    const receipt = await tx.wait();
    res.json({ txHash: receipt.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/approveVotersBatch', requireKey, async (req, res) => {
  const { electionId, wallets } = req.body;
  try {
    if (!contract) throw new Error('Contract not configured');
    const tx = await contract.approveVotersBatch(electionId, wallets);
    const receipt = await tx.wait();
    res.json({ txHash: receipt.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/removeVoter', requireKey, async (req, res) => {
  const { electionId, wallet: addr } = req.body;
  try {
    if (!contract) throw new Error('Contract not configured');
    const tx = await contract.removeVoter(electionId, addr);
    const receipt = await tx.wait();
    res.json({ txHash: receipt.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`TrueVote relayer running on port ${PORT}`);
});
