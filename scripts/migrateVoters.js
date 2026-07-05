const hre = require("hardhat");
const fs = require("fs");
require("dotenv").config();

const OLD_CONTRACT_ADDRESS = "0x09c0D7D04De886051C7822f18E406Ee3B1DCa934";
const NEW_CONTRACT_ADDRESS = "0xC4B8a8D9A374a21150e19e739f6CBE03C62333a9";

const TrueVoteABI = [
  "event VoterApproved(uint256 indexed electionId, address indexed voter)",
  "event VoterRemoved(uint256 indexed electionId, address indexed voter)",
  "function approveVotersBatch(uint256 electionId, address[] voters)",
];

async function main() {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error("PRIVATE_KEY not set in .env");

  const provider = new hre.ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org");
  const signer = new hre.ethers.Wallet(pk, provider);

  console.log("🔄 Migrating voters from old contract to new contract...");
  console.log(`📍 Old: ${OLD_CONTRACT_ADDRESS}`);
  console.log(`📍 New: ${NEW_CONTRACT_ADDRESS}`);
  console.log(`👤 Admin: ${signer.address}`);

  const oldContract = new hre.ethers.Contract(
    OLD_CONTRACT_ADDRESS,
    TrueVoteABI,
    provider
  );
  const newContract = new hre.ethers.Contract(
    NEW_CONTRACT_ADDRESS,
    TrueVoteABI,
    signer
  );

  // Get current block
  const currentBlock = await provider.getBlockNumber();
  const blockRange = 2000; // RPC limit

  // Query events in chunks
  const approvedEvents = [];
  const removedEvents = [];

  console.log(`\n🔍 Querying events from block 0 to ${currentBlock}...`);

  for (let fromBlock = 0; fromBlock <= currentBlock; fromBlock += blockRange) {
    const toBlock = Math.min(fromBlock + blockRange - 1, currentBlock);
    console.log(`   Blocks ${fromBlock}-${toBlock}...`);

    try {
      const approved = await oldContract.queryFilter(
        oldContract.filters.VoterApproved(),
        fromBlock,
        toBlock
      );
      approvedEvents.push(...approved);

      const removed = await oldContract.queryFilter(
        oldContract.filters.VoterRemoved(),
        fromBlock,
        toBlock
      );
      removedEvents.push(...removed);
    } catch (err) {
      console.warn(`   ⚠ Error querying blocks ${fromBlock}-${toBlock}: ${err.message}`);
    }
  }

  console.log(`\n📊 Found ${approvedEvents.length} VoterApproved events`);
  console.log(`📊 Found ${removedEvents.length} VoterRemoved events`);

  // Build map of active voters per election
  const activeVoters = new Map();

  for (const event of approvedEvents) {
    const electionId = event.args.electionId.toString();
    const voter = event.args.voter;
    
    if (!activeVoters.has(electionId)) {
      activeVoters.set(electionId, new Set());
    }
    activeVoters.get(electionId).add(voter);
  }

  // Remove voters that were removed
  for (const event of removedEvents) {
    const electionId = event.args.electionId.toString();
    const voter = event.args.voter;
    
    if (activeVoters.has(electionId)) {
      activeVoters.get(electionId).delete(voter);
    }
  }

  console.log(`\n✅ Active voters by election:`);

  // Migrate voters
  for (const [electionId, voters] of activeVoters) {
    const voterArray = Array.from(voters);
    if (voterArray.length === 0) continue;

    console.log(
      `\n📋 Election ${electionId}: ${voterArray.length} voters to approve`
    );
    console.log(`   Voters: ${voterArray.slice(0, 3).join(", ")}${voterArray.length > 3 ? "..." : ""}`);

    try {
      const tx = await newContract.approveVotersBatch(electionId, voterArray);
      const receipt = await tx.wait();
      console.log(`   ✓ Tx: ${receipt.hash}`);
    } catch (err) {
      console.error(`   ✗ Error: ${err.message}`);
    }
  }

  console.log("\n✅ Migration complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
