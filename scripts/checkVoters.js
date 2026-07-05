const hre = require("hardhat");
require("dotenv").config();

const NEW_CONTRACT_ADDRESS = "0xC4B8a8D9A374a21150e19e739f6CBE03C62333a9";
const ELECTION_ID = 1;

const TrueVoteABI = [
  "function isApprovedVoter(uint256 electionId, address voter) view returns (bool)",
  "function getWhitelistedVoters(uint256 electionId) view returns (address[])",
  "function getWhitelistedCount(uint256 electionId) view returns (uint256)",
];

async function main() {
  const provider = new hre.ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org");
  const contract = new hre.ethers.Contract(NEW_CONTRACT_ADDRESS, TrueVoteABI, provider);

  const testVoters = [
    "0x1111111111111111111111111111111111111111",
    "0x2222222222222222222222222222222222222222",
    "0x3333333333333333333333333333333333333333",
  ];

  const count = await contract.getWhitelistedCount(ELECTION_ID).catch(err => { console.error('getCount err', err.message); return null; });
  console.log('Count:', count);
  const voters = await contract.getWhitelistedVoters(ELECTION_ID).catch(err => { console.error('getList err', err.message); return null; });
  console.log('Voters array length:', voters ? voters.length : null);

  for (const v of testVoters) {
    const approved = await contract.isApprovedVoter(ELECTION_ID, v).catch(err => { console.error('isApproved err', err.message); return null; });
    console.log(v, 'approved?', approved);
  }
}

main();
