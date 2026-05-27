import React, { useState, useEffect } from 'react';
import { getContract } from '../contract';

function Results() {
  const [candidates, setCandidates] = useState([]);
  const [electionName, setElectionName] = useState('');
  const [totalVotes, setTotalVotes] = useState(0);
  const [votingOpen, setVotingOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => { loadResults(); }, []);

  const loadResults = async () => {
    try {
      const contract = await getContract();

      const election = await contract.election();
      setElectionName(election.name);
      setVotingOpen(election.votingOpen);

      const count = await contract.candidateCount();
      const list = [];
      let total = 0;

      for (let i = 1; i <= Number(count); i++) {
        const c = await contract.getCandidate(i);
        const votes = Number(c[2]);
        total += votes;
        list.push({ id: i, name: c[0], party: c[1], votes });
      }

      list.sort((a, b) => b.votes - a.votes);
      setCandidates(list);
      setTotalVotes(total);
      setLoading(false);
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ Error loading results: ' + err.message });
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

      {/* Election Status Badge */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{
          background: votingOpen ? '#14532d' : '#7f1d1d',
          color: votingOpen ? '#86efac' : '#fca5a5',
          padding: '4px 12px',
          borderRadius: '999px',
          fontSize: '0.85rem'
        }}>
          {votingOpen ? '🟢 Voting Open' : '🔴 Voting Closed'}
        </span>
        <span style={{ color: '#888', marginLeft: '1rem', fontSize: '0.9rem' }}>
          {electionName} · Total votes: {totalVotes}
        </span>
      </div>

      {/* Winner Banner */}
      {candidates.length > 0 && totalVotes > 0 && (
        <div className="card" style={{
          border: '1px solid #7c3aed',
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>🏆 Currently Leading</p>
          <h2 style={{ color: '#7c3aed', margin: '0.5rem 0' }}>
            {candidates[0].name}
          </h2>
          <p style={{ color: '#888' }}>{candidates[0].party}</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            {getPercentage(candidates[0].votes)}%
          </p>
        </div>
      )}

      {/* No candidates yet */}
      {candidates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: '#888' }}>
          No candidates yet.
        </div>
      ) : (
        candidates.map((c, index) => (
          <div key={c.id} className="card">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.8rem'
            }}>
              <div>
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
                <span style={{
                  color: '#888',
                  marginLeft: '8px',
                  fontSize: '0.9rem'
                }}>
                  {c.party}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>{c.votes}</strong>
                <span style={{ color: '#888', fontSize: '0.9rem' }}> votes</span>
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
            <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.4rem' }}>
              {getPercentage(c.votes)}%
            </p>
          </div>
        ))
      )}

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