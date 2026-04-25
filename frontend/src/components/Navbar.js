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
      position: 'sticky', top: 0, zIndex: 1000,
      background: '#0f172a',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
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
          background: 'white',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', fontWeight: '800', color: '#0f172a'
        }}>C</div>
        <span style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>CivicFix</span>
      </Link>

      {/* Center Links */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {[
          { path: '/', label: 'Home' },
          { path: '/map', label: 'Live Map' },
          { path: '/#impact', label: 'Impact' },
          { path: '/#how', label: 'How it Works' },
        ].map(link => (
          <Link key={link.path} to={link.path} style={{
            color: location.pathname === link.path ? 'white' : '#94a3b8',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            padding: '8px 14px',
            borderRadius: '100px',
            background: location.pathname === link.path ? 'rgba(255,255,255,0.1)' : 'transparent',
            transition: 'all 0.2s',
          }}>{link.label}</Link>
        ))}
        {token && (user.role === 'officer' || user.role === 'worker') && (
          <Link to="/dashboard" style={{
            color: '#94a3b8', textDecoration: 'none',
            fontSize: '14px', fontWeight: '500',
            padding: '8px 14px', borderRadius: '100px',
          }}>Dashboard</Link>
        )}
      </div>

      {/* Right Buttons */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Link to="/report">
          <button style={{ padding: '8px 18px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '100px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
            Report Issue
          </button>
        </Link>
        {token ? (
          <>
            <span style={{ fontSize: '13px', color: '#94a3b8', marginLeft: '4px' }}>Hi, {user.name}</span>
            <button onClick={logout} style={{ padding: '8px 18px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '100px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button style={{ padding: '8px 18px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '100px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Login</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;