# TrueVote deployment (Base Sepolia)

## 1. Install dependencies

```bash
npm install
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

## 2. Configure environment

Copy `.env.example` to `.env` and set:

- `PRIVATE_KEY` — deployer wallet (must have Base Sepolia ETH)
- `REACT_APP_CONTRACT_ADDRESS` — filled after deploy

## 3. Deploy contract

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network baseSepolia
```

Copy the printed address into `.env` as `REACT_APP_CONTRACT_ADDRESS`.

## 4. Run the app

```bash
npm start
```

Connect MetaMask to **Base Sepolia** (chain ID 84532). The deployer wallet is the contract `admin`.

## Admin workflow

1. **Create Election** — title, description, start/end dates
2. **Election details** — add candidates, approve voter wallets (single or bulk)
3. **Finalize** — locks candidate list
4. **Activate** — opens voting (status Active)
5. Voters on the whitelist cast **one vote per election**
6. **End election** when finished

## Architecture

- Each `electionId` has isolated candidates, vote counts, `voted[electionId][wallet]`, and `approvedVoters[electionId][wallet]`
- Voting only when status is Active and `block.timestamp` is within `[startTime, endTime]`
