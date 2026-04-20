import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/complaints`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setComplaints(res.data));
  }, [token]);

  const updateStatus = async (id, status) => {
    await axios.patch(`${process.env.REACT_APP_API_URL}/complaints/${id}/status`,
      { status }, { headers: { Authorization: `Bearer ${token}` } });
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const statusColor = { open: '#dc2626', in_progress: '#d97706', resolved: '#16a34a' };

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <h2 style={{ marginBottom: '20px', color: '#1e40af' }}>Officer Dashboard</h2>
      {complaints.map(c => (
        <div key={c.id} className="card" style={{ borderLeft: `4px solid ${statusColor[c.status]}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{c.category}</strong>
              <span style={{ marginLeft: '12px', color: statusColor[c.status], fontWeight: 'bold' }}>
                {c.status.toUpperCase()}
              </span>
              <p style={{ color: '#6b7280', margin: '4px 0' }}>{c.description}</p>
              <small>{c.address} | {new Date(c.created_at).toLocaleDateString()}</small>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {c.status === 'open' && (
                <button className="btn btn-primary" onClick={() => updateStatus(c.id, 'in_progress')}>
                  Start
                </button>
              )}
              {c.status === 'in_progress' && (
                <button className="btn btn-success" onClick={() => updateStatus(c.id, 'resolved')}>
                  Resolve
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      {complaints.length === 0 && <p style={{ color: '#6b7280' }}>No complaints yet.</p>}
    </div>
  );
}

export default Dashboard;