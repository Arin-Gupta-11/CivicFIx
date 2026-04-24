import React, { useEffect, useState } from 'react';
import axios from 'axios';

const statusConfig = {
  open: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', label: 'Open' },
  in_progress: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', label: 'In Progress' },
  resolved: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', label: 'Resolved' },
};

const categoryIcons = {
  'Pothole': '🕳️', 'Broken Streetlight': '💡',
  'Garbage Dump': '🗑️', 'Open Drain': '🌊', 'Other': '📍'
};

function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');
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

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);
  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: '#0f172a', padding: '32px 24px'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>
            Officer Dashboard
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Manage and resolve civic complaints</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'Total', count: stats.total, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
            { label: 'Open', count: stats.open, color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
            { label: 'In Progress', count: stats.in_progress, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
            { label: 'Resolved', count: stats.resolved, color: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, border: `1px solid ${s.color}22`,
              borderRadius: '14px', padding: '18px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{s.count}</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['all', 'open', 'in_progress', 'resolved'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '7px 16px', borderRadius: '20px',
              border: filter === s ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
              background: filter === s ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
              color: filter === s ? '#60a5fa' : '#64748b',
              cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s'
            }}>
              {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Complaints List */}
        {filtered.map(c => {
          const sc = statusConfig[c.status];
          return (
            <div key={c.id} style={{
              background: 'rgba(30,41,59,0.6)',
              backdropFilter: 'blur(12px)',
              border: `1px solid rgba(255,255,255,0.06)`,
              borderLeft: `4px solid ${sc.color}`,
              borderRadius: '14px', padding: '20px',
              marginBottom: '12px', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center', gap: '16px'
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1 }}>
                <div style={{ fontSize: '28px' }}>{categoryIcons[c.category] || '📍'}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <strong style={{ color: '#f1f5f9', fontSize: '15px' }}>{c.category}</strong>
                    <span style={{
                      padding: '2px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '700',
                      background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`
                    }}>{sc.label}</span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}>{c.description}</p>
                  <p style={{ color: '#475569', fontSize: '12px' }}>
                    {c.address} · {new Date(c.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {c.status === 'open' && (
                  <button className="btn btn-primary" onClick={() => updateStatus(c.id, 'in_progress')}
                    style={{ fontSize: '13px', padding: '8px 16px' }}>
                    Start
                  </button>
                )}
                {c.status === 'in_progress' && (
                  <button className="btn btn-success" onClick={() => updateStatus(c.id, 'resolved')}
                    style={{ fontSize: '13px', padding: '8px 16px' }}>
                    Resolve
                  </button>
                )}
                {c.status === 'resolved' && (
                  <span style={{ color: '#4ade80', fontSize: '13px', fontWeight: '600' }}>Done</span>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
            <p style={{ fontSize: '16px' }}>No complaints found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
