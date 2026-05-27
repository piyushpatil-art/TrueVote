import { UGFClient } from '@tychilabs/ugf-testnet-js';

let _ugfClient = null;
let _authAddress = null;

const getUGFClient = async (signer) => {
  if (!_ugfClient) _ugfClient = new UGFClient();
  if (!signer) return _ugfClient;
  try {
    const addr = await signer.getAddress();
    if (_authAddress !== addr) {
      await _ugfClient.auth.login(signer);
      _authAddress = addr;
    }
  } catch (err) {
    // If login fails, surface error to caller
    throw err;
  }
  return _ugfClient;
};

export const castVoteGasless = async (contract, electionId, candidateId, signer, onStepChange) => {
  const client = await getUGFClient(signer);
  const from = await signer.getAddress();

  if (onStepChange) onStepChange('auth');
  // login is now cached inside getUGFClient — this avoids prompting every call

  if (onStepChange) onStepChange('quote');
  const voteData = contract.interface.encodeFunctionData('castVote', [
    electionId,
    candidateId,
  ]);

  const quote = await client.quote.get({
    payer_address: from,
    tx_object: JSON.stringify({
      from,
      to: contract.target,
      data: voteData,
      value: '0',
    }),
  });

  if (onStepChange) onStepChange('payment');
  await client.payment.x402.execute({ quote, signer });

  if (onStepChange) onStepChange('broadcast');
  const { userTxHash } = await client.chains.evm.sponsorAndExecute(
    quote.digest,
    signer,
    async () => ({
      to: contract.target,
      data: voteData,
      value: 0n,
    }),
  );

  if (onStepChange) onStepChange('confirmed');
  return userTxHash;
};
