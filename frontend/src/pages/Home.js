import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
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
    html: `<div style="background:${statusColors[status]||'#ef4444'};width:14px;height:14px;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14, 14],
  });
}

const steps = [
  { num: '01', icon: '📸', title: 'Snap a pic', desc: 'Saw a pothole on your way? Pull out your phone, take one photo. That\'s ground truth.' },
  { num: '02', icon: '📍', title: 'Drop a pin', desc: 'Open CivicFix, the form pre-fills your location. Two taps, and the pin is on the public map.' },
  { num: '03', icon: '📣', title: 'Rally your crew', desc: 'Share the link. The more upvotes a pin gets, the harder it is for the ward to ignore.' },
  { num: '04', icon: '✅', title: 'Watch it close', desc: 'Every update shows up live. Before/after photos. Official status. No black boxes.' },
];

const stepColors = ['#fde8e8', '#fde8d8', '#fefde8', '#e8fdf0'];

function Home() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0 });

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/complaints`).then(res => {
      setComplaints(res.data);
      setStats({
        total: res.data.length,
        open: res.data.filter(c => c.status === 'open').length,
        in_progress: res.data.filter(c => c.status === 'in_progress').length,
        resolved: res.data.filter(c => c.status === 'resolved').length,
      });
    });
  }, []);

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <div style={{ paddingTop: '64px' }}>

      {/* HERO */}
      <section style={{
        minHeight: '90vh',
        display: 'flex', alignItems: 'center',
        padding: '60px 80px',
        background: '#fafaf8',
        gap: '60px',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'white', border: '1px solid #e8e8e8',
            borderRadius: '100px', padding: '6px 14px 6px 8px',
            marginBottom: '28px', fontSize: '13px', color: '#555'
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e',
              animation: 'pulse 2s infinite', display: 'inline-block'
            }} />
            A student-built civic-tech project · {stats.total} reports live
          </div>

          <h1 style={{
            fontSize: '64px', fontWeight: '800', lineHeight: 1.05,
            color: '#1a1a1a', marginBottom: '24px', letterSpacing: '-2px'
          }}>
            Fix your city,<br />
            <span style={{
              background: '#d4f57a', padding: '0 8px',
              borderRadius: '8px', fontStyle: 'italic'
            }}>one pothole</span><br />
            at a time.
          </h1>

          <p style={{ fontSize: '17px', color: '#666', lineHeight: 1.7, marginBottom: '36px', maxWidth: '480px' }}>
            CivicFix lets citizens report civic issues on a live map.
            Ward officers track and resolve them in real-time.
            No forms. No calls. No waiting.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <Link to="/report">
              <button className="btn btn-primary" style={{ fontSize: '15px', padding: '13px 28px' }}>
                📸 Report an issue
              </button>
            </Link>
            <Link to="/map">
              <button className="btn btn-outline" style={{ fontSize: '15px', padding: '13px 28px' }}>
                🗺️ See the live map
              </button>
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { label: `${stats.resolved} fixed this week`, icon: '💪' },
              { label: 'Free & open-source', icon: '⭐' },
              { label: 'Live across India', icon: '🇮🇳' },
            ].map(b => (
              <div key={b.label} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'white', border: '1px solid #e8e8e8',
                borderRadius: '100px', padding: '7px 14px',
                fontSize: '13px', color: '#555', fontWeight: '500'
              }}>
                {b.icon} {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* Hero Right - Mini Map Preview */}
        <div style={{
          flex: 1, height: '520px', borderRadius: '24px',
          overflow: 'hidden', border: '1px solid #e8e8e8',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)'
        }}>
          <MapContainer center={[20.5937, 78.9629]} zoom={5}
            style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {complaints.map(c => (
              <Marker key={c.id} position={[c.latitude, c.longitude]} icon={getIcon(c.status)}>
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', padding: '4px' }}>
                    <strong>{categoryIcons[c.category]} {c.category}</strong>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{c.address}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </section>

      {/* IMPACT STATS */}
      <section id="impact" style={{ padding: '80px', background: 'white' }}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            display: 'inline-block', background: '#f0f0f0',
            borderRadius: '100px', padding: '6px 16px',
            fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '16px'
          }}>Impact</div>
          <h2 style={{ fontSize: '42px', fontWeight: '800', color: '#1a1a1a', letterSpacing: '-1px' }}>
            Our impact, in <span style={{ textDecoration: 'underline', textDecorationColor: '#f59e0b' }}>real-time.</span>
          </h2>
          <p style={{ color: '#888', fontSize: '14px', fontStyle: 'italic', marginTop: '4px' }}>
            not bragging, just transparent ✨
          </p>
        </div>

        {/* Big Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'TOTAL REPORTS', count: stats.total, icon: '📊', bg: '#f0f0ff', suffix: 'reports' },
            { label: 'OPEN', count: stats.open, icon: '🚨', bg: '#fff0f0' },
            { label: 'IN PROGRESS', count: stats.in_progress, icon: '🔧', bg: '#fff8f0' },
            { label: 'RESOLVED', count: stats.resolved, icon: '🎉', bg: '#f0fff4' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, borderRadius: '20px',
              padding: '28px 24px', border: '1px solid #e8e8e8'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#888', letterSpacing: '0.5px' }}>
                  {s.label}
                </span>
                <span style={{ fontSize: '22px' }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: '52px', fontWeight: '800', color: '#1a1a1a', lineHeight: 1.1, marginTop: '12px' }}>
                {s.count}
                {s.suffix && <span style={{ fontSize: '16px', fontWeight: '400', color: '#888', marginLeft: '6px' }}>{s.suffix}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '16px' }}>
          {/* Resolution Rate */}
          <div style={{ background: '#f9f9f9', borderRadius: '20px', padding: '28px', border: '1px solid #e8e8e8' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#888', letterSpacing: '0.5px', marginBottom: '12px' }}>
              RESOLUTION RATE
            </p>
            <div style={{ fontSize: '52px', fontWeight: '800', color: '#1a1a1a', lineHeight: 1 }}>
              {resolutionRate}
              <span style={{ fontSize: '20px', color: '#888' }}>%</span>
            </div>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '10px' }}>
              {stats.resolved} of {stats.total} complaints wrapped up
            </p>
            <div style={{ background: '#e8e8e8', borderRadius: '8px', height: '6px', marginTop: '16px' }}>
              <div style={{
                width: `${resolutionRate}%`, height: '100%',
                background: 'linear-gradient(90deg, #22c55e, #4ade80)',
                borderRadius: '8px', transition: 'width 1s ease'
              }} />
            </div>
          </div>

          {/* Category Breakdown */}
          <div style={{ background: '#f9f9f9', borderRadius: '20px', padding: '28px', border: '1px solid #e8e8e8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#888', letterSpacing: '0.5px' }}>TOP ISSUES</p>
              <span style={{
                background: '#1a1a1a', color: 'white',
                fontSize: '11px', fontWeight: '600',
                padding: '3px 10px', borderRadius: '100px'
              }}>5 cats</span>
            </div>
            {Object.entries(
              complaints.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {})
            ).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, count], i) => (
              <div key={cat} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a' }}>
                    {String(i + 1).padStart(2, '0')} {categoryIcons[cat]} {cat}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>{count}</span>
                </div>
                <div style={{ background: '#e0e0e0', borderRadius: '6px', height: '5px' }}>
                  <div style={{
                    width: `${(count / stats.total) * 100}%`, height: '100%',
                    background: '#2563eb', borderRadius: '6px'
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Recent */}
          <div style={{ background: '#1a1a1a', borderRadius: '20px', padding: '28px', border: '1px solid #333' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#888', letterSpacing: '0.5px' }}>JUST IN</span>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
            </div>
            {complaints.slice(0, 5).map(c => (
              <div key={c.id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #333' }}>
                <p style={{ fontSize: '13px', color: '#f1f1f1', fontWeight: '500', marginBottom: '2px' }}>
                  {categoryIcons[c.category]} {c.category}
                </p>
                <p style={{ fontSize: '11px', color: '#666' }}>
                  {c.address || 'Unknown location'} · just now
                </p>
              </div>
            ))}
            {complaints.length === 0 && <p style={{ fontSize: '13px', color: '#555' }}>No reports yet</p>}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '80px', background: '#fafaf8' }}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            display: 'inline-block', background: '#f0f0f0',
            borderRadius: '100px', padding: '6px 16px',
            fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '16px'
          }}>How it works</div>
          <h2 style={{ fontSize: '42px', fontWeight: '800', color: '#1a1a1a', letterSpacing: '-1px' }}>
            Four taps. <span style={{ fontStyle: 'italic', color: '#666' }}>That's it.</span>
          </h2>
          <p style={{ color: '#888', maxWidth: '500px', lineHeight: 1.7, marginTop: '12px' }}>
            No login walls. No 12-page forms. No "sir please visit office between 10-11am."
            We built the opposite of that.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
          {steps.map((step, i) => (
            <div key={step.num} style={{
              background: stepColors[i],
              borderRadius: '20px', padding: '28px',
              border: '1px solid rgba(0,0,0,0.06)',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <span style={{
                  background: 'white', borderRadius: '100px',
                  padding: '4px 12px', fontSize: '12px', fontWeight: '700', color: '#1a1a1a'
                }}>{step.num}</span>
                <span style={{ fontSize: '28px' }}>{step.icon}</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '40px 80px',
        background: '#1a1a1a', color: '#888',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', background: 'white',
            borderRadius: '8px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: '#1a1a1a'
          }}>C</div>
          <span style={{ color: '#f1f1f1', fontWeight: '600' }}>CivicFix</span>
        </div>
        <p style={{ fontSize: '13px' }}>Built by students. For citizens. Open source.</p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/map" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>Live Map</Link>
          <Link to="/report" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>Report Issue</Link>
          <Link to="/login" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>Login</Link>
        </div>
      </footer>

    </div>
  );
}

export default Home;