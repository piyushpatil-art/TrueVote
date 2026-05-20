import React, { useState, useEffect } from 'react';
import { getContract } from '../contract';

function Results() {
  const [candidates, setCandidates] = useState([]);
  const [electionName, setElectionName] = useState('');
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const contract = await getContract();

      const election = await contract.election();
      setElectionName(election.name);

      const count = await contract.candidateCount();
      const list = [];
      let total = 0;

      for (let i = 1; i <= Number(count); i++) {
        const c = await contract.getCandidate(i);
        const votes = Number(c[3]); // votes is now index 3
        total += votes;
        list.push({ id: i, name: c[0], description: c[1], votes });
      }

      // Sort by votes descending
      list.sort((a, b) => b.votes - a.votes);
      setCandidates(list);
      setTotalVotes(total);
      setLoading(false);
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ Error loading results. Make sure MetaMask is connected!' });
      setLoading(false);
    }
  };

  const getPercentage = (votes) => {
    if (totalVotes === 0) return 0;
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  const getBarColor = (index) => {
    const colors = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626'];
    return colors[index % colors.length];
  };

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '3rem', color: '#7c3aed' }}>
      ⏳ Loading results...
    </div>
  );

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem', color: '#7c3aed' }}>
        📊 Live Results
      </h2>
      <p style={{ color: '#888', marginBottom: '1.5rem' }}>
        {electionName || 'Election'} · Total votes: {totalVotes}
      </p>

      {/* Winner Banner */}
      {candidates.length > 0 && totalVotes > 0 && (
        <div className="card" style={{
          border: '1px solid #7c3aed',
          marginBottom: '1.5rem'
        }}>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>🏆 Currently Leading</p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
            {candidates[0].photoUrl && (
              <img 
                src={candidates[0].photoUrl} 
                alt={candidates[0].name} 
                style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} 
              />
            )}
            <div>
              <h2 style={{ color: '#7c3aed', margin: '0' }}>
                {candidates[0].name}
              </h2>
              <p style={{ color: '#888', marginTop: '0.3rem', fontSize: '0.9rem' }}>
                {candidates[0].description}
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#7c3aed' }}>
                {getPercentage(candidates[0].votes)}% ({candidates[0].votes} votes)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results List */}
      {candidates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: '#888' }}>
          No candidates yet. Check back after admin adds candidates.
        </div>
      ) : (
        candidates.map((c, index) => (
          <div key={c.id} className="card">
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              {/* Photo */}
              {c.photoUrl && (
                <img 
                  src={c.photoUrl} 
                  alt={c.name} 
                  style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} 
                />
              )}
              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{
                    background: '#2d2d44',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    marginRight: '8px'
                  }}>
                    #{index + 1}
                  </span>
                  <strong>{c.name}</strong>
                </div>
                <p style={{ color: '#888', fontSize: '0.85rem', margin: '0.3rem 0' }}>
                  {c.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem' }}>
                    <strong>{c.votes}</strong> votes
                  </span>
                  <span style={{ color: '#888', fontSize: '0.9rem' }}>
                    {getPercentage(c.votes)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{
              background: '#2d2d44',
              borderRadius: '999px',
              height: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${getPercentage(c.votes)}%`,
                background: getBarColor(index),
                height: '100%',
                borderRadius: '999px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        ))
      )}

      {/* Refresh Button */}
      <button className="btn" onClick={loadResults}>
        🔄 Refresh Results
      </button>

      {status && (
        <div className={`status ${status.type}`}>
          {status.msg}
        </div>
      )}
    </div>
  );
}

export default Results;