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

const statusColors = { open: 'red', in_progress: 'orange', resolved: 'green' };

function getIcon(status) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${statusColors[status] || 'red'};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [14, 14],
  });
}

function MapView() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/complaints`)
      .then(res => setComplaints(res.data))
      .catch(err => console.error(err));

    const socket = io(process.env.REACT_APP_SOCKET_URL);
    socket.on('newComplaint', (c) => setComplaints(prev => [c, ...prev]));
    socket.on('statusUpdated', (updated) => {
      setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
    });
    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <div style={{ padding: '12px 24px', background: 'white', borderBottom: '1px solid #e5e7eb',
        display: 'flex', gap: '20px', alignItems: 'center' }}>
        <strong>Live Complaint Map</strong>
        <span style={{ color: 'red' }}>● Open</span>
        <span style={{ color: 'orange' }}>● In Progress</span>
        <span style={{ color: 'green' }}>● Resolved</span>
        <span style={{ marginLeft: 'auto', color: '#6b7280' }}>{complaints.length} complaints</span>
      </div>
      <MapContainer center={[20.5937, 78.9629]} zoom={5}
        style={{ height: 'calc(100vh - 112px)', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="OpenStreetMap" />
        {complaints.map(c => (
          <Marker key={c.id} position={[c.latitude, c.longitude]} icon={getIcon(c.status)}>
            <Popup>
              <strong>{c.category}</strong><br />
              {c.description}<br />
              <small>{c.address}</small><br />
              <span style={{ color: statusColors[c.status], fontWeight: 'bold' }}>
                {c.status.toUpperCase()}
              </span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;