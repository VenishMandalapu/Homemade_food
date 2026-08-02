import React, { useState } from 'react';
import { api } from '../api';
import { Mail, Lock, User, UserCheck } from 'lucide-react';

export default function Auth({ onLoginSuccess, setView, showToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return showToast('Please enter both email and password.', 'error');
    if (!isLogin && !name) return showToast('Please enter your name.', 'error');

    try {
      setSubmitting(true);
      let response;
      if (isLogin) {
        response = await api.login(email, password);
        showToast(`Welcome back, ${response.user.name}!`, 'success');
      } else {
        response = await api.register(name, email, password);
        showToast('Registration successful! Welcome.', 'success');
      }

      onLoginSuccess(response.token, response.user);
      setView('catalog');
    } catch (err) {
      showToast(err.message || 'Authentication failed. Please verify credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ margin: '30px auto' }}>
      <div className="glass-panel" style={{
        padding: '24px 20px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Toggle Headings */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <button 
            onClick={() => { setIsLogin(true); showToast('', 'clear'); }}
            style={{
              flexGrow: 1,
              paddingBottom: '10px',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: isLogin ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: isLogin ? '2.5px solid var(--primary)' : 'none',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setIsLogin(false); showToast('', 'clear'); }}
            style={{
              flexGrow: 1,
              paddingBottom: '10px',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: !isLogin ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: !isLogin ? '2.5px solid var(--primary)' : 'none',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            Register
          </button>
        </div>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '2.2rem' }}>🍯</span>
          <h3 style={{ fontSize: '1.25rem', marginTop: '6px', fontFamily: "'Playfair Display', serif" }}>
            {isLogin ? 'Grandma\'s Store Access' : 'Create Account'}
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {isLogin ? 'Sign in to order fresh homemade items' : 'Register to get sun-matured foods shipped home'}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Ramesh Kumar" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required={!isLogin} 
                  style={{ paddingLeft: '36px', height: '42px', fontSize: '0.88rem' }}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="form-input" 
                placeholder="email@example.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                style={{ paddingLeft: '36px', height: '42px', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                style={{ paddingLeft: '36px', height: '42px', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem', display: 'flex', gap: '6px' }}
            disabled={submitting}
          >
            <UserCheck size={16} />
            {submitting ? 'Authenticating...' : isLogin ? 'Sign In Now' : 'Register Profile'}
          </button>
        </form>


      </div>
    </div>
  );
}
