import React, { useState } from 'react';
import { getContract } from '../contract';

function AdminPanel() {
  const [electionName, setElectionName] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateDescription, setCandidateDescription] = useState('');
  const [candidatePhotoUrl, setCandidatePhotoUrl] = useState('');
  const [status, setStatus] = useState(null);

  const createElection = async () => {
    try {
      setStatus({ type: 'loading', msg: 'Creating election...' });
      const contract = await getContract();
      const tx = await contract.createElection(electionName);
      await tx.wait();
      setStatus({ type: 'success', msg: '✅ Election created successfully!' });
      setElectionName('');
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ Error: ' + err.message });
    }
  };

  const addCandidate = async () => {
    if (!candidateName || !candidateDescription || !candidatePhotoUrl) {
      setStatus({ type: 'error', msg: '❌ Please fill all fields!' });
      return;
    }
    try {
      setStatus({ type: 'loading', msg: 'Adding candidate...' });
      const contract = await getContract();
      const tx = await contract.addCandidate(candidateName, candidateDescription, candidatePhotoUrl);
      await tx.wait();
      setStatus({ type: 'success', msg: '✅ Candidate added successfully!' });
      setCandidateName('');
      setCandidateDescription('');
      setCandidatePhotoUrl('');
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ Error: ' + err.message });
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#7c3aed' }}>
        👨‍💼 Admin Panel
      </h2>

      {/* Create Election */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>🗳️ Create Election</h3>
        <input
          type="text"
          placeholder="Election name (e.g. Student Union 2025)"
          value={electionName}
          onChange={e => setElectionName(e.target.value)}
        />
        <button className="btn" onClick={createElection}>
          Create Election
        </button>
      </div>

      {/* Add Candidate */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>👤 Add Candidate</h3>
        <input
          type="text"
          placeholder="Candidate name"
          value={candidateName}
          onChange={e => setCandidateName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Candidate description (e.g., Education, Healthcare focus)"
          value={candidateDescription}
          onChange={e => setCandidateDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Photo URL (e.g., https://...)"
          value={candidatePhotoUrl}
          onChange={e => setCandidatePhotoUrl(e.target.value)}
        />
        {candidatePhotoUrl && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <img src={candidatePhotoUrl} alt="preview" style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>Preview</p>
          </div>
        )}
        <button className="btn" onClick={addCandidate}>
          Add Candidate
        </button>
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