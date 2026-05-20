import React, { useState, useEffect } from 'react';
import { getContract } from '../contract';

function VoterPage() {
  const [candidates, setCandidates] = useState([]);
  const [electionName, setElectionName] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const contract = await getContract();

      const election = await contract.election();
      setElectionName(election.name);

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

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts[0]) {
        const voted = await contract.hasVoted(accounts[0]);
        setHasVoted(voted);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: '❌ Failed to load election data: ' + err.message });
      setLoading(false);
    }
  };

  const castVote = async () => {
    if (!selectedId) {
      setStatus({ type: 'error', msg: '❌ Please select a candidate first!' });
      return;
    }
    try {
      setStatus({ type: 'loading', msg: '⏳ Casting your vote...' });
      const contract = await getContract();
      const tx = await contract.castVote(selectedId);
      await tx.wait();
      setHasVoted(true);
      setStatus({ type: 'success', msg: '✅ Vote cast successfully! Thank you!' });
      loadData();
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ Error: ' + err.message });
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '3rem', color: '#7c3aed' }}>
      ⏳ Loading election data...
    </div>
  );

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem', color: '#7c3aed' }}>
        🗳️ {electionName || 'Election'}
      </h2>
      <p style={{ color: '#888', marginBottom: '1.5rem' }}>
        Select a candidate and cast your vote
      </p>

      {hasVoted && (
        <div className="status success">
          ✅ You have already voted! Check the Results tab.
        </div>
      )}

      {candidates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: '#888' }}>
          No candidates added yet.
        </div>
      ) : (
        candidates.map(c => (
          <div
            key={c.id}
            className="card"
            onClick={() => !hasVoted && setSelectedId(c.id)}
            style={{
              cursor: hasVoted ? 'default' : 'pointer',
              border: selectedId === c.id ? '2px solid #7c3aed' : '1px solid #2d2d44',
              transition: 'border 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            {/* Candidate Photo */}
            {c.photoUrl && (
              <img
                src={c.photoUrl}
                alt={c.name}
                style={{
                  width: 60, height: 60,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #7c3aed'
                }}
                onError={e => e.target.style.display = 'none'}
              />
            )}

            {/* Candidate Info */}
            <div style={{ flex: 1 }}>
              <h3>{c.name}</h3>
              <p style={{ color: '#888', marginTop: '0.3rem', fontSize: '0.9rem' }}>
                {c.description}
              </p>
            </div>

            {/* Radio Circle */}
            <div style={{
              width: 24, height: 24,
              borderRadius: '50%',
              border: '2px solid #7c3aed',
              background: selectedId === c.id ? '#7c3aed' : 'transparent',
              flexShrink: 0
            }} />
          </div>
        ))
      )}

      {!hasVoted && candidates.length > 0 && (
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