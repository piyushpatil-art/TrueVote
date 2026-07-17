const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

function updateEnvFile(contractAddress) {
  const envPath = path.join(__dirname, "..", ".env");
  let content = "";
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, "utf8");
  }

  const lines = content.split(/\r?\n/).filter(Boolean);
  const nextLines = [];
  let replaced = false;

  for (const line of lines) {
    if (line.startsWith("REACT_APP_CONTRACT_ADDRESS=")) {
      nextLines.push(`REACT_APP_CONTRACT_ADDRESS=${contractAddress}`);
      replaced = true;
    } else {
      nextLines.push(line);
    }
  }

  if (!replaced) {
    nextLines.push(`REACT_APP_CONTRACT_ADDRESS=${contractAddress}`);
  }

  fs.writeFileSync(envPath, `${nextLines.join("\n")}\n`, "utf8");
}

async function main() {
  const TrueVote = await hre.ethers.getContractFactory("TrueVote");
  const contract = await TrueVote.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();
  if (deployTx) await deployTx.wait(2);

  updateEnvFile(address);

  const now = Math.floor(Date.now() / 1000);
  const startTime = now - 60;
  const endTime = now + 60 * 60 * 24 * 7; // 7 days later

  const createTx = await contract.createElection(
    'Test Election 2026',
    'Test election to verify voter tracking',
    startTime,
    endTime
  );
  const createReceipt = await createTx.wait();
  const createEvent = createReceipt.logs
    .map((log) => {
      try {
        return contract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((parsed) => parsed && parsed.name === 'ElectionCreated');

  const electionId = createEvent?.args?.[0] ?? (await contract.electionCount());

  const addCandidateTx = await contract.addCandidate(electionId, 'Alice Johnson', 'Progressive Alliance');
  await addCandidateTx.wait();

  const finalizeTx = await contract.finalizeElection(electionId);
  await finalizeTx.wait();

  const activateTx = await contract.activateElection(electionId);
  await activateTx.wait();

  console.log('TrueVote deployed to:', address);
  console.log('Admin:', await contract.admin());
  console.log('Election created and activated with ID:', electionId.toString());
  console.log('\nSet in .env:');
  console.log(`REACT_APP_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
