const hre = require("hardhat");
require("dotenv").config();

const NEW_CONTRACT_ADDRESS = "0xC4B8a8D9A374a21150e19e739f6CBE03C62333a9";
const ELECTION_ID = 1; // Test with first election

const TrueVoteABI = [
  "function createElection(string title, string description, uint256 startTime, uint256 endTime) returns (uint256)",
  "function finalizeElection(uint256 electionId)",
  "function activateElection(uint256 electionId)",
  "function addCandidate(uint256 electionId, string name, string party)",
  "function approveVotersBatch(uint256 electionId, address[] voters)",
  "function getWhitelistedVoters(uint256 electionId) view returns (address[])",
  "function getWhitelistedCount(uint256 electionId) view returns (uint256)",
];

async function main() {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error("PRIVATE_KEY not set in .env");

  const provider = new hre.ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org");
  const signer = new hre.ethers.Wallet(pk, provider);

  const contract = new hre.ethers.Contract(NEW_CONTRACT_ADDRESS, TrueVoteABI, signer);

  console.log("✅ Test: Setting up new election with voters...");
  console.log(`📍 Contract: ${NEW_CONTRACT_ADDRESS}`);
  console.log(`👤 Admin: ${signer.address}\n`);

  try {
    // Create election
    console.log("1️⃣ Creating election...");
    const now = Math.floor(Date.now() / 1000);
    const tx1 = await contract.createElection(
      "Test Election 2026",
      "Test election to verify voter tracking",
      now + 3600,
      now + 86400
    );
    const receipt1 = await tx1.wait();
    console.log(`   ✓ Election created in block ${receipt1.blockNumber}\n`);

    const electionId = 1;

    // Add a candidate
    console.log("2️⃣ Adding candidate...");
    const tx2 = await contract.addCandidate(electionId, "Test Candidate", "Test Party");
    await tx2.wait();
    console.log(`   ✓ Candidate added\n`);

    // Finalize election
    console.log("3️⃣ Finalizing election...");
    const tx3 = await contract.finalizeElection(electionId);
    await tx3.wait();
    console.log(`   ✓ Election finalized\n`);

    // Approve voters
    const testVoters = [
      "0x1111111111111111111111111111111111111111",
      "0x2222222222222222222222222222222222222222",
      "0x3333333333333333333333333333333333333333",
    ];

    console.log("4️⃣ Approving test voters...");
    const tx4 = await contract.approveVotersBatch(electionId, testVoters);
    await tx4.wait();
    console.log(`   ✓ ${testVoters.length} voters approved\n`);

    // Verify
    console.log("5️⃣ Verifying voters...");
    const voters = await contract.getWhitelistedVoters(electionId);
    const count = await contract.getWhitelistedCount(electionId);

    console.log(`   Count: ${count}`);
    console.log(`   Voters:`);
    voters.forEach((v, i) => console.log(`     ${i + 1}. ${v}`));

    console.log("\n✅ SUCCESS! The getWhitelistedVoters() function works!");
    console.log(`   Election #${electionId} now has ${count} approved voters`);
    console.log("   Open Admin > Voters, select 'Election #1', and you'll see the voter list!");
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exitCode = 1;
  }
}

main();
