import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'citizen' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const url = `${process.env.REACT_APP_API_URL}/auth/${isRegister ? 'register' : 'login'}`;
      const res = await axios.post(url, form);
      if (isRegister) {
        setIsRegister(false);
        alert('Account created! Please login.');
      } else {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #1e3a5f 0%, #0f172a 60%)',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '16px', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: '800', color: 'white'
          }}>C</div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9', marginBottom: '8px' }}>
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {isRegister ? 'Join CivicFix to report civic issues' : 'Login to your CivicFix account'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(30,41,59,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '32px'
        }}>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <label>Full Name</label>
                <input type="text" placeholder="Arin Gupta" required
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <label>Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="citizen">Citizen</option>
                  <option value="officer">Ward Officer</option>
                  <option value="worker">Field Worker</option>
                </select>
              </>
            )}
            <label>Email Address</label>
            <input type="email" placeholder="your@email.com" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <label>Password</label>
            <input type="password" placeholder="••••••••" required
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? '#334155' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white', border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', marginTop: '4px'
            }}>
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
            </button>
          </form>

          <div style={{
            marginTop: '24px', paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center', fontSize: '14px', color: '#64748b'
          }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }} style={{
              background: 'none', border: 'none', color: '#60a5fa',
              cursor: 'pointer', fontWeight: '600', marginLeft: '6px', fontSize: '14px'
            }}>
              {isRegister ? 'Login' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
