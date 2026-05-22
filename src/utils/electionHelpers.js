export const ELECTION_STATUS = {
  0: { label: 'Draft', variant: 'warning' },
  1: { label: 'Active', variant: 'success' },
  2: { label: 'Ended', variant: 'error' },
};

export function getStatusMeta(statusCode) {
  return ELECTION_STATUS[Number(statusCode)] || { label: 'Unknown', variant: 'primary' };
}

export function toUnixSeconds(dateStr) {
  if (!dateStr) return 0;
  return Math.floor(new Date(dateStr).getTime() / 1000);
}

export function formatDateTime(unixSeconds) {
  if (!unixSeconds) return '—';
  return new Date(Number(unixSeconds) * 1000).toLocaleString();
}

export function parseElection(raw, id) {
  return {
    id: Number(id),
    title: raw.title ?? raw[0],
    description: raw.description ?? raw[1],
    startTime: Number(raw.startTime ?? raw[2]),
    endTime: Number(raw.endTime ?? raw[3]),
    finalized: Boolean(raw.finalized ?? raw[4]),
    status: Number(raw.status ?? raw[5]),
    candidateCount: Number(raw.candidateCount ?? raw[6]),
  };
}

export function parseCandidate(raw, id) {
  return {
    id: Number(id),
    name: raw.name ?? raw[0],
    party: raw.party ?? raw[1],
    votes: Number(raw.voteCount ?? raw[2]),
    exists: Boolean(raw.exists ?? raw[3]),
  };
}

export async function fetchCandidatesForElection(contract, electionId, candidateCount) {
  const list = [];
  for (let i = 1; i <= candidateCount; i++) {
    const raw = await contract.getCandidate(electionId, i);
    const c = parseCandidate(raw, i);
    if (c.exists) list.push(c);
  }
  return list;
}

export async function fetchAllElections(contract) {
  const count = Number(await contract.electionCount());
  const elections = [];
  for (let i = 1; i <= count; i++) {
    const raw = await contract.getElection(i);
    elections.push(parseElection(raw, i));
  }
  return elections.reverse();
}
