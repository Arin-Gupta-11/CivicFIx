import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const categories = ['Pothole', 'Broken Streetlight', 'Garbage Dump', 'Open Drain', 'Other'];
const categoryIcons = {
  'Pothole': '🕳️', 'Broken Streetlight': '💡',
  'Garbage Dump': '🗑️', 'Open Drain': '🌊', 'Other': '📍'
};

function ReportComplaint() {
  const [form, setForm] = useState({
    category: 'Pothole', description: '', address: '', latitude: 20.5937, longitude: 78.9629 // Default to center of India
  });
  const [imageFile, setImageFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (form.address.length > 2 && showSuggestions) {
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.address)}&format=json&limit=5`);
          setSuggestions(res.data);
        } catch (err) {
          console.error('Error fetching suggestions:', err);
        }
      } else {
        setSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [form.address, showSuggestions]);

  const handleSelectSuggestion = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    setForm({
      ...form,
      address: suggestion.display_name,
      latitude: lat,
      longitude: lon
    });
    setShowSuggestions(false);
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setForm(prev => ({ ...prev, latitude: e.latlng.lat, longitude: e.latlng.lng }));
      },
    });
    return form.latitude && form.longitude ? (
      <Marker position={[form.latitude, form.longitude]} />
    ) : null;
  };

  const MapController = () => {
    const map = useMapEvents({});
    useEffect(() => {
      if (form.latitude && form.longitude) {
        map.flyTo([form.latitude, form.longitude], 15);
      }
    }, [form.latitude, form.longitude, map]);
    return null;
  };

  const getLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(pos => {
      setForm({ ...form, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      setLocating(false);
    }, () => setLocating(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMsg(''); setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('category', form.category);
      formData.append('description', form.description);
      formData.append('address', form.address);
      formData.append('latitude', form.latitude);
      formData.append('longitude', form.longitude);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await axios.post(`${process.env.REACT_APP_API_URL}/complaints`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMsg('Complaint submitted successfully! It will appear on the live map shortly.');
      setForm({ category: 'Pothole', description: '', address: '', latitude: 20.5937, longitude: 78.9629 });
      setImageFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: 'radial-gradient(ellipse at top, #1e3a5f 0%, #0f172a 60%)',
      padding: '40px 20px', display: 'flex', justifyContent: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: '580px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9', marginBottom: '8px' }}>
          Report a Civic Issue
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
          Help improve your city by reporting issues in your area
        </p>

        <div className="card">
          {msg && <div className="success">{msg}</div>}
          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Category Grid */}
            <label>Issue Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', margin: '10px 0 20px' }}>
              {categories.map(cat => (
                <div key={cat} onClick={() => setForm({ ...form, category: cat })} style={{
                  padding: '12px 8px', borderRadius: '10px', textAlign: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: form.category === cat ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                  border: form.category === cat ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: '22px', marginBottom: '4px' }}>{categoryIcons[cat]}</div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: form.category === cat ? '#60a5fa' : '#64748b' }}>
                    {cat}
                  </div>
                </div>
              ))}
            </div>

            <label>Description</label>
            <textarea rows="3" placeholder="Describe the issue in detail..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ resize: 'vertical' }} />

            <label>Address / Landmark</label>
            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <input type="text" placeholder="e.g. Near MG Road bus stop, Bengaluru"
                value={form.address}
                onChange={e => {
                  setForm({ ...form, address: e.target.value });
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setShowSuggestions(false)}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', zIndex: 9999, marginTop: '4px',
                  maxHeight: '200px', overflowY: 'auto',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                }}>
                  {suggestions.map((s, i) => (
                    <div key={i} onMouseDown={() => handleSelectSuggestion(s)} style={{
                      padding: '10px 12px', fontSize: '13px', color: '#cbd5e1',
                      borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      cursor: 'pointer', transition: 'background 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                      {s.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label>Location on Map (Click to set pin)</label>
            <div style={{ height: '250px', width: '100%', marginBottom: '15px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <MapContainer center={[form.latitude, form.longitude]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution="CartoDB"
                />
                <LocationMarker />
                <MapController />
              </MapContainer>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '15px' }}>
              <input type="number" step="any" placeholder="Latitude" disabled
                value={form.latitude} style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }} />
              <input type="number" step="any" placeholder="Longitude" disabled
                value={form.longitude} style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }} />
            </div>

            <label>Upload Image (Optional)</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} 
              style={{ marginBottom: '20px', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.2)' }} />

            <button type="button" onClick={getLocation} disabled={locating} style={{
              width: '100%', padding: '11px',
              background: 'rgba(34,197,94,0.1)', color: '#4ade80',
              border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px',
              cursor: 'pointer', fontWeight: '600', fontSize: '14px',
              marginBottom: '12px', transition: 'all 0.2s'
            }}>
              {locating ? 'Detecting location...' : 'Use My Current Location'}
            </button>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? '#334155' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white', border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
            }}>
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReportComplaint;
