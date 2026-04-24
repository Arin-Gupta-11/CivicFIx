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
const categoryIcons = { 'Pothole': '🕳️', 'Broken Streetlight': '💡', 'Garbage Dump': '🗑️', 'Open Drain': '🌊', 'Other': '📍' };

function getIcon(status) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${statusColors[status]||'#ef4444'};width:14px;height:14px;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14, 14],
  });
}

function MapPage() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/complaints`).then(res => setComplaints(res.data));
    const socket = io(process.env.REACT_APP_SOCKET_URL);
    socket.on('newComplaint', c => setComplaints(prev => [c, ...prev]));
    socket.on('statusUpdated', updated => setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c)));
    return () => socket.disconnect();
  }, []);

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);
  const stats = {
    open: complaints.filter(c => c.status === 'open').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  return (
    <div style={{ paddingTop: '64px', height: '100vh', display: 'flex', flexDirection: 'column', background: '#fafaf8' }}>
      {/* Header */}
      <div style={{ padding: '20px 32px', background: 'white', borderBottom: '1px solid #e8e8e8', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>Live Complaint Map</h2>
          <p style={{ fontSize: '12px', color: '#888' }}>Every dot is a neighbour who spoke up.</p>
        </div>
        <div style={{ display: 'flex', gap: '6px', marginLeft: '24px' }}>
          {['all', 'open', 'in_progress', 'resolved'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '7px 16px', borderRadius: '100px', border: 'none',
              cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              background: filter === s ? '#1a1a1a' : '#f0f0f0',
              color: filter === s ? 'white' : '#555',
              transition: 'all 0.2s'
            }}>
              {s === 'all' ? `All (${complaints.length})`
                : s === 'open' ? `Open (${stats.open})`
                : s === 'in_progress' ? `In Progress (${stats.in_progress})`
                : `Resolved (${stats.resolved})`}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
          {[{ color: '#ef4444', label: 'Open' }, { color: '#f59e0b', label: 'In Progress' }, { color: '#22c55e', label: 'Resolved' }].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
              <span style={{ fontSize: '12px', color: '#888' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1 }}>
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OpenStreetMap" />
          {filtered.map(c => (
            <Marker key={c.id} position={[c.latitude, c.longitude]} icon={getIcon(c.status)}>
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', padding: '4px', minWidth: '180px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '18px' }}>{categoryIcons[c.category] || '📍'}</span>
                    <strong style={{ fontSize: '14px' }}>{c.category}</strong>
                  </div>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>{c.description}</p>
                  <p style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>{c.address}</p>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: '100px',
                    fontSize: '11px', fontWeight: '700',
                    background: c.status === 'open' ? '#fef2f2' : c.status === 'in_progress' ? '#fffbeb' : '#f0fdf4',
                    color: c.status === 'open' ? '#dc2626' : c.status === 'in_progress' ? '#d97706' : '#16a34a',
                  }}>{c.status.replace('_', ' ').toUpperCase()}</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapPage;