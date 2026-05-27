import React, { useState } from 'react';
import { getContract } from '../contract';

function AdminPanel() {
  const [electionName, setElectionName] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateParty, setCandidateParty] = useState('');
  const [voterAddress, setVoterAddress] = useState('');
  const [status, setStatus] = useState(null);
  const [votingOpen, setVotingOpen] = useState(false);

  const setMsg = (type, msg) => setStatus({ type, msg });

  const createElection = async () => {
    if (!electionName) return setMsg('error', '❌ Enter election name!');
    try {
      setMsg('loading', '⏳ Creating election...');
      const contract = await getContract();
      const tx = await contract.createElection(electionName);
      await tx.wait();
      setMsg('success', '✅ Election created!');
      setElectionName('');
    } catch (err) {
      setMsg('error', '❌ ' + err.message);
    }
  };

  const addCandidate = async () => {
    if (!candidateName || !candidateParty) 
      return setMsg('error', '❌ Fill all fields!');
    try {
      setMsg('loading', '⏳ Adding candidate...');
      const contract = await getContract();
      const tx = await contract.addCandidate(candidateName, candidateParty);
      await tx.wait();
      setMsg('success', '✅ Candidate added!');
      setCandidateName('');
      setCandidateParty('');
    } catch (err) {
      setMsg('error', '❌ ' + err.message);
    }
  };

  const addVoter = async () => {
    if (!voterAddress) return setMsg('error', '❌ Enter wallet address!');
    try {
      setMsg('loading', '⏳ Adding voter...');
      const contract = await getContract();
      const tx = await contract.addVoter(voterAddress);
      await tx.wait();
      setMsg('success', '✅ Voter added to whitelist!');
      setVoterAddress('');
    } catch (err) {
      setMsg('error', '❌ ' + err.message);
    }
  };

  const openVoting = async () => {
    try {
      setMsg('loading', '⏳ Opening voting...');
      const contract = await getContract();
      const tx = await contract.openVoting();
      await tx.wait();
      setVotingOpen(true);
      setMsg('success', '✅ Voting is now OPEN! 🗳️');
    } catch (err) {
      setMsg('error', '❌ ' + err.message);
    }
  };

  const closeVoting = async () => {
    try {
      setMsg('loading', '⏳ Closing voting...');
      const contract = await getContract();
      const tx = await contract.closeVoting();
      await tx.wait();
      setVotingOpen(false);
      setMsg('success', '✅ Voting is now CLOSED!');
    } catch (err) {
      setMsg('error', '❌ ' + err.message);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#7c3aed' }}>
        👨‍💼 Admin Panel
      </h2>

      {/* Step 1 - Create Election */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>
          📋 Step 1 — Create Election
        </h3>
        <input
          type="text"
          placeholder="Election name (e.g. AIML CR Selection 2025)"
          value={electionName}
          onChange={e => setElectionName(e.target.value)}
        />
        <button className="btn" onClick={createElection}>
          Create Election
        </button>
      </div>

      {/* Step 2 - Add Candidates */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>
          👤 Step 2 — Add Candidates
        </h3>
        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>
          ⚠️ Add ALL candidates before opening voting!
        </p>
        <input
          type="text"
          placeholder="Candidate name"
          value={candidateName}
          onChange={e => setCandidateName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Party / Role"
          value={candidateParty}
          onChange={e => setCandidateParty(e.target.value)}
        />
        <button className="btn" onClick={addCandidate}>
          Add Candidate
        </button>
      </div>

      {/* Step 3 - Add Voters */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>
          ✅ Step 3 — Add Approved Voters
        </h3>
        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Only whitelisted wallet addresses can vote!
        </p>
        <input
          type="text"
          placeholder="Voter wallet address (0x...)"
          value={voterAddress}
          onChange={e => setVoterAddress(e.target.value)}
        />
        <button className="btn" onClick={addVoter}>
          Add Voter
        </button>
      </div>

      {/* Step 4 - Control Voting */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>
          🗳️ Step 4 — Control Voting
        </h3>
        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Open voting only after adding all candidates and voters!
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="btn"
            onClick={openVoting}
            style={{ background: '#059669' }}
          >
            🟢 Open Voting
          </button>
          <button
            className="btn"
            onClick={closeVoting}
            style={{ background: '#dc2626' }}
          >
            🔴 Close Voting
          </button>
        </div>
      </div>

      {/* Status */}
      {status && (
        <div className={`status ${status.type}`}>
          {status.msg}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;