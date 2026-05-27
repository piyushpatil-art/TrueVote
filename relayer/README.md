# TrueVote Relayer

Gasless relayer server for admin operations (candidate/voter management) on TrueVote.

## Setup

1. Copy `.env.example` to `.env` and fill in values:
   - `RELAYER_PRIVATE_KEY`: Private key of the relayer account (must hold ETH for gas)
   - `RPC_URL`: Base Sepolia RPC endpoint (e.g., https://sepolia.base.org)
   - `CONTRACT_ADDRESS`: TrueVote contract address
   - `RELAYER_API_KEY`: Secret API key for authentication

2. Install dependencies:
```bash
npm install
```

3. Start the relayer:
```bash
npm start
```

The relayer will be available at `http://localhost:3001` by default.

## Frontend Configuration

Set these environment variables in the frontend `.env`:
- `REACT_APP_RELAYER_URL`: URL of the relayer (e.g., http://localhost:3001)
- `REACT_APP_RELAYER_KEY`: Same as RELAYER_API_KEY above

## Security

- Protect RELAYER_PRIVATE_KEY in environment variables or a vault
- Use API key authentication on all endpoints
- Fund the relayer account with ETH on Base Sepolia
- Monitor relayer transaction activity and spending
- Add IP restrictions if possible

## Endpoints

- `POST /addCandidate` - Add a candidate
- `POST /updateCandidate` - Update candidate details
- `POST /removeCandidate` - Remove a candidate
- `POST /approveVoter` - Whitelist a single voter wallet
- `POST /approveVotersBatch` - Whitelist multiple voter wallets
- `POST /removeVoter` - Remove voter from whitelist

All endpoints require `x-api-key` header.
