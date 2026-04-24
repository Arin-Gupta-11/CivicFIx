import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(250,250,248,0.92)' : 'rgba(250,250,248,0.8)',
      backdropFilter: 'blur(16px)',
      borderBottom: scrolled ? '1px solid #e8e8e8' : '1px solid transparent',
      padding: '0 32px',
      height: '64px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.3s',
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px',
          background: '#1a1a1a',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', fontWeight: '800', color: 'white'
        }}>C</div>
        <span style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>CivicFix</span>
      </Link>

      {/* Center Links */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {[
          { path: '/map', label: 'Live Map' },
          { path: '/#impact', label: 'Impact' },
          { path: '/#how', label: 'How it Works' },
        ].map(link => (
          <Link key={link.path} to={link.path} style={{
            color: location.pathname === link.path ? '#1a1a1a' : '#666',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            padding: '8px 14px',
            borderRadius: '100px',
            background: location.pathname === link.path ? '#f0f0f0' : 'transparent',
            transition: 'all 0.2s',
          }}>{link.label}</Link>
        ))}
        {token && (user.role === 'officer' || user.role === 'worker') && (
          <Link to="/dashboard" style={{
            color: '#666', textDecoration: 'none',
            fontSize: '14px', fontWeight: '500',
            padding: '8px 14px', borderRadius: '100px',
          }}>Dashboard</Link>
        )}
      </div>

      {/* Right Buttons */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {token ? (
          <>
            <span style={{ fontSize: '13px', color: '#666' }}>Hi, {user.name}</span>
            <button onClick={logout} className="btn btn-outline" style={{ padding: '8px 18px' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button className="btn btn-outline" style={{ padding: '8px 18px' }}>Login</button>
            </Link>
          </>
        )}
        <Link to="/report">
          <button className="btn btn-primary" style={{ padding: '8px 18px' }}>
            Report Issue
          </button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;