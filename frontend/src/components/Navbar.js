import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={{
      background: '#1e40af', color: 'white', padding: '14px 24px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '22px', fontWeight: 'bold' }}>
        CivicFix
      </Link>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Live Map</Link>
        {token ? (
          <>
            <Link to="/report" style={{ color: 'white', textDecoration: 'none' }}>Report Issue</Link>
            {(user.role === 'officer' || user.role === 'worker') && (
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
            )}
            <span style={{ color: '#93c5fd' }}>Hi, {user.name}</span>
            <button onClick={logout} style={{
              background: '#dc2626', color: 'white', border: 'none',
              padding: '8px 16px', borderRadius: '6px', cursor: 'pointer'
            }}>Logout</button>
          </>
        ) : (
          <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;