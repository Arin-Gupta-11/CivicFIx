import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'citizen' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = `${process.env.REACT_APP_API_URL}/auth/${isRegister ? 'register' : 'login'}`;
      const res = await axios.post(url, form);
      if (isRegister) {
        setIsRegister(false);
        setError('');
        alert('Registered! Please login.');
      } else {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
      <div className="card" style={{ width: '400px' }}>
        <h2 style={{ marginBottom: '20px', color: '#1e40af' }}>
          {isRegister ? 'Create Account' : 'Login to CivicFix'}
        </h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label>Full Name</label>
              <input type="text" placeholder="Your name" required
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <label>Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="citizen">Citizen</option>
                <option value="officer">Ward Officer</option>
                <option value="worker">Field Worker</option>
              </select>
            </>
          )}
          <label>Email</label>
          <input type="email" placeholder="your@email.com" required
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <label>Password</label>
          <input type="password" placeholder="Password" required
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '16px', textAlign: 'center' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginLeft: '6px' }}>
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;