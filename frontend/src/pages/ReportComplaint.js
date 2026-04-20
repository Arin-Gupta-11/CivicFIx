import React, { useState } from 'react';
import axios from 'axios';

function ReportComplaint() {
  const [form, setForm] = useState({
    category: 'Pothole', description: '', address: '',
    latitude: '', longitude: ''
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      setForm({ ...form, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/complaints`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg('Complaint submitted successfully!');
      setForm({ category: 'Pothole', description: '', address: '', latitude: '', longitude: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '40px' }}>
      <div className="card">
        <h2 style={{ marginBottom: '20px', color: '#1e40af' }}>Report a Civic Issue</h2>
        {msg && <p className="success">{msg}</p>}
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Category</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option>Pothole</option>
            <option>Broken Streetlight</option>
            <option>Garbage Dump</option>
            <option>Open Drain</option>
            <option>Other</option>
          </select>
          <label>Description</label>
          <textarea rows="3" placeholder="Describe the issue..."
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <label>Address</label>
          <input type="text" placeholder="Street address or landmark"
            value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          <label>Location</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input type="number" placeholder="Latitude" value={form.latitude}
              onChange={e => setForm({ ...form, latitude: e.target.value })} />
            <input type="number" placeholder="Longitude" value={form.longitude}
              onChange={e => setForm({ ...form, longitude: e.target.value })} />
          </div>
          <button type="button" className="btn btn-success" onClick={getLocation}
            style={{ marginBottom: '16px', marginRight: '10px' }}>
            Use My Location
          </button>
          <button type="submit" className="btn btn-primary">Submit Complaint</button>
        </form>
      </div>
    </div>
  );
}

export default ReportComplaint;