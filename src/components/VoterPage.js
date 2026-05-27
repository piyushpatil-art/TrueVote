import React, { useState, useEffect } from 'react';
import { getContract } from '../contract';

function VoterPage() {
  const [candidates, setCandidates] = useState([]);
  const [electionName, setElectionName] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [votingOpen, setVotingOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const contract = await getContract();

      // Get account
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const userAccount = accounts[0];
      setAccount(userAccount);

      // Get election info
      const election = await contract.election();
      setElectionName(election.name);
      setVotingOpen(election.votingOpen);

      // Check whitelist & voted status
      const whitelisted = await contract.checkWhitelist(userAccount);
      const voted = await contract.hasVoted(userAccount);
      setIsWhitelisted(whitelisted);
      setHasVoted(voted);

      // Get candidates
      const count = await contract.candidateCount();
      const list = [];
      for (let i = 1; i <= Number(count); i++) {
        const c = await contract.getCandidate(i);
        list.push({
          id: i,
          name: c[0],
          party: c[1],
          votes: Number(c[2])
        });
      }
      setCandidates(list);
      setLoading(false);
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ Failed to load: ' + err.message });
      setLoading(false);
    }
  };

  const castVote = async () => {
    if (!selectedId) {
      setStatus({ type: 'error', msg: '❌ Please select a candidate!' });
      return;
    }
    try {
      setStatus({ type: 'loading', msg: '⏳ Casting your vote...' });
      const contract = await getContract();
      const tx = await contract.castVote(selectedId);
      await tx.wait();
      setHasVoted(true);
      setStatus({ type: 'success', msg: '✅ Vote cast! Thank you!' });
      loadData();
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ ' + err.message });
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '3rem', color: '#7c3aed' }}>
      ⏳ Loading...
    </div>
  );

  // Not whitelisted
  if (!isWhitelisted) return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>🚫 Access Denied</h2>
      <p style={{ color: '#888', marginBottom: '0.5rem' }}>
        Your wallet is not authorized to vote.
      </p>
      <p style={{ color: '#555', fontSize: '0.85rem' }}>
        Your address: {account}
      </p>
      <p style={{ color: '#555', fontSize: '0.85rem', marginTop: '0.5rem' }}>
        Contact the admin to get whitelisted.
      </p>
    </div>
  );

  // Voting not open yet
  if (!votingOpen) return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h2 style={{ color: '#d97706', marginBottom: '1rem' }}>
        ⏳ Voting Not Open Yet
      </h2>
      <p style={{ color: '#888' }}>
        You are whitelisted ✅ — wait for admin to open voting!
      </p>
    </div>
  );

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem', color: '#7c3aed' }}>
        🗳️ {electionName || 'Election'}
      </h2>
      <p style={{ color: '#888', marginBottom: '1.5rem' }}>
        Select a candidate and cast your vote — one vote per person!
      </p>

      {/* Already voted */}
      {hasVoted && (
        <div className="status success">
          ✅ You have already voted! Check the Results tab.
        </div>
      )}

      {/* Candidates */}
      {candidates.map(c => (
        <div
          key={c.id}
          className="card"
          onClick={() => !hasVoted && setSelectedId(c.id)}
          style={{
            cursor: hasVoted ? 'default' : 'pointer',
            border: selectedId === c.id
              ? '2px solid #7c3aed'
              : '1px solid #2d2d44',
            transition: 'border 0.2s'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3>{c.name}</h3>
              <p style={{ color: '#888', marginTop: '0.3rem' }}>
                🏛️ {c.party}
              </p>
            </div>
            <div style={{
              width: 24, height: 24,
              borderRadius: '50%',
              border: '2px solid #7c3aed',
              background: selectedId === c.id ? '#7c3aed' : 'transparent'
            }} />
          </div>
        </div>
      ))}

      {/* Vote button */}
      {!hasVoted && (
        <button
          className="btn"
          onClick={castVote}
          disabled={!selectedId}
        >
          Cast Vote 🗳️
        </button>
      )}

      {status && (
        <div className={`status ${status.type}`}>
          {status.msg}
        </div>
      )}
    </div>
  );
}

export default VoterPage;