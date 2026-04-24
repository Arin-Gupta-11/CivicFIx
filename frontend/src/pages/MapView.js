import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const statusColors = { open: '#ef4444', in_progress: '#f59e0b', resolved: '#22c55e' };
const categoryIcons = {
  'Pothole': '🕳️', 'Broken Streetlight': '💡',
  'Garbage Dump': '🗑️', 'Open Drain': '🌊', 'Other': '📍'
};

function getIcon(status) {
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${statusColors[status] || '#ef4444'};
      width:16px;height:16px;border-radius:50%;
      border:3px solid white;
      box-shadow:0 0 8px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [16, 16],
  });
}

function MapView() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/complaints`)
      .then(res => {
        setComplaints(res.data);
        setRecentActivity(res.data.slice(0, 5));
      });

    const socket = io(process.env.REACT_APP_SOCKET_URL);
    socket.on('newComplaint', (c) => {
      setComplaints(prev => [c, ...prev]);
      setRecentActivity(prev => [c, ...prev].slice(0, 5));
    });
    socket.on('statusUpdated', (updated) => {
      setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
    });
    return () => socket.disconnect();
  }, []);

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  const resolutionRate = stats.total > 0
    ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 64px)',
      background: '#0f172a',
      overflow: 'hidden'
    }}>

      {/* LEFT — Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Filter Pills over map */}
        <div style={{
          position: 'absolute', top: '16px', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex', gap: '6px',
          background: 'rgba(15,23,42,0.85)',
          backdropFilter: 'blur(12px)',
          padding: '6px', borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          {['all', 'open', 'in_progress', 'resolved'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '6px 14px', borderRadius: '14px', border: 'none',
              cursor: 'pointer', fontSize: '12px', fontWeight: '600',
              transition: 'all 0.2s',
              background: filter === s
                ? s === 'open' ? '#ef4444'
                  : s === 'in_progress' ? '#f59e0b'
                  : s === 'resolved' ? '#22c55e'
                  : '#3b82f6'
                : 'transparent',
              color: filter === s ? 'white' : '#64748b',
            }}>
              {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress'
                : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <MapContainer
          center={[20.5937, 78.9629]} zoom={5}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="CartoDB"
          />
          {filtered.map(c => (
            <Marker key={c.id} position={[c.latitude, c.longitude]} icon={getIcon(c.status)}>
              <Popup>
                <div style={{
                  background: '#1e293b', color: '#e2e8f0',
                  borderRadius: '12px', padding: '14px',
                  minWidth: '200px', fontFamily: 'Inter, sans-serif'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{categoryIcons[c.category] || '📍'}</span>
                    <strong style={{ fontSize: '15px' }}>{c.category}</strong>
                  </div>
                  <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>{c.description}</p>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>{c.address}</p>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px',
                    borderRadius: '12px', fontSize: '11px', fontWeight: '700',
                    background: c.status === 'open' ? 'rgba(239,68,68,0.2)'
                      : c.status === 'in_progress' ? 'rgba(245,158,11,0.2)'
                      : 'rgba(34,197,94,0.2)',
                    color: c.status === 'open' ? '#f87171'
                      : c.status === 'in_progress' ? '#fbbf24' : '#4ade80',
                  }}>
                    {c.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* RIGHT — Dashboard Panel */}
      <div style={{
        width: '360px',
        background: '#0f172a',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>

        {/* Title */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>
            Live Overview
          </h2>
          <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
            Real-time civic issue tracker
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { label: 'Total', count: stats.total, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', icon: '📊' },
            { label: 'Open', count: stats.open, color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', icon: '🔴' },
            { label: 'In Progress', count: stats.in_progress, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', icon: '🟡' },
            { label: 'Resolved', count: stats.resolved, color: '#4ade80', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', icon: '✅' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: '16px',
              padding: '16px',
            }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '26px', fontWeight: '700', color: s.color }}>{s.count}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Resolution Rate */}
        <div style={{
          background: 'rgba(30,41,59,0.6)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', padding: '18px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>Resolution Rate</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#4ade80' }}>{resolutionRate}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
            <div style={{
              width: `${resolutionRate}%`, height: '100%',
              background: 'linear-gradient(90deg, #22c55e, #4ade80)',
              borderRadius: '10px', transition: 'width 0.5s ease'
            }} />
          </div>
          <p style={{ fontSize: '11px', color: '#475569', marginTop: '8px' }}>
            {stats.resolved} of {stats.total} complaints resolved
          </p>
        </div>

        {/* Category Breakdown */}
        <div style={{
          background: 'rgba(30,41,59,0.6)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', padding: '18px'
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '14px' }}>
            Category Breakdown
          </h3>
          {Object.entries(
            complaints.reduce((acc, c) => {
              acc[c.category] = (acc[c.category] || 0) + 1;
              return acc;
            }, {})
          ).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
            <div key={cat} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {categoryIcons[cat]} {cat}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#60a5fa' }}>{count}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '6px', height: '5px' }}>
                <div style={{
                  width: `${(count / stats.total) * 100}%`, height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                  borderRadius: '6px'
                }} />
              </div>
            </div>
          ))}
          {complaints.length === 0 && (
            <p style={{ fontSize: '12px', color: '#475569' }}>No data yet</p>
          )}
        </div>

        {/* Recent Activity */}
        <div style={{
          background: 'rgba(30,41,59,0.6)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', padding: '18px'
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '14px' }}>
            Recent Activity
          </h3>
          {recentActivity.length === 0 && (
            <p style={{ fontSize: '12px', color: '#475569' }}>No complaints yet</p>
          )}
          {recentActivity.map(c => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)'
            }}>
              <div style={{ fontSize: '20px' }}>{categoryIcons[c.category] || '📍'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#e2e8f0',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.category}
                </p>
                <p style={{ fontSize: '11px', color: '#475569',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.address || 'No address'}
                </p>
              </div>
              <span style={{
                fontSize: '10px', fontWeight: '700', padding: '3px 8px',
                borderRadius: '8px', flexShrink: 0,
                background: c.status === 'open' ? 'rgba(239,68,68,0.15)'
                  : c.status === 'in_progress' ? 'rgba(245,158,11,0.15)'
                  : 'rgba(34,197,94,0.15)',
                color: c.status === 'open' ? '#f87171'
                  : c.status === 'in_progress' ? '#fbbf24' : '#4ade80',
              }}>
                {c.status === 'in_progress' ? 'WIP' : c.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>

        {/* Live Indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '8px', padding: '12px',
          background: 'rgba(34,197,94,0.05)',
          border: '1px solid rgba(34,197,94,0.1)',
          borderRadius: '12px'
        }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e',
            boxShadow: '0 0 8px #22c55e',
            animation: 'pulse 2s infinite'
          }} />
          <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: '600' }}>
            Live — Updates in real-time
          </span>
        </div>

      </div>
    </div>
  );
}

export default MapView;