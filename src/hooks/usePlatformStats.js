import { useState, useEffect } from 'react';
import { getReadContract, CONTRACT_ADDRESS } from '../contract';
import { fetchAllElections, fetchCandidatesForElection } from '../utils/electionHelpers';

export function usePlatformStats() {
  const [stats, setStats] = useState({
    electionsHeld: 0,
    votesCast: 0,
    activeElections: 0,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        setStats((s) => ({ ...s, loading: false }));
        return;
      }
      try {
        const contract = await getReadContract();
        const elections = await fetchAllElections(contract);
        let votesCast = 0;
        let activeElections = 0;

        for (const e of elections) {
          if (e.status === 1) activeElections += 1;
          const candidates = await fetchCandidatesForElection(
            contract,
            e.id,
            e.candidateCount,
          );
          votesCast += candidates.reduce((sum, c) => sum + c.votes, 0);
        }

        if (!cancelled) {
          setStats({
            electionsHeld: elections.length,
            votesCast,
            activeElections,
            loading: false,
          });
        }
      } catch {
        if (!cancelled) {
          setStats((s) => ({ ...s, loading: false }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}
