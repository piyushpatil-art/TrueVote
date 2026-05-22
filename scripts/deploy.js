const hre = require("hardhat");

async function main() {
  const TrueVote = await hre.ethers.getContractFactory("TrueVote");
  const contract = await TrueVote.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();
  if (deployTx) await deployTx.wait(2);
  console.log("TrueVote deployed to:", address);
  console.log("Admin:", await contract.admin());
  console.log("\nSet in .env:");
  console.log(`REACT_APP_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
