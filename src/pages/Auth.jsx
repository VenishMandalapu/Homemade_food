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
          <svg viewBox="0 0 100 60" width="60" height="36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '6px' }}>
            {/* Pickle Jar (Left) */}
            <rect x="25" y="10" width="22" height="5" rx="1.5" fill="var(--primary)" />
            <rect x="28" y="15" width="16" height="3" fill="var(--accent)" />
            <path d="M22 19C22 18 23 17 24 17H48C49 17 50 18 50 19V45C50 48 48 50 45 50H27C24 50 22 48 22 45V19Z" fill="rgba(39, 84, 56, 0.05)" stroke="var(--secondary)" stroke-width="2" />
            <circle cx="31" cy="28" r="3" fill="var(--secondary)" opacity="0.7" />
            <circle cx="41" cy="34" r="3" fill="var(--secondary)" opacity="0.7" />
            <circle cx="33" cy="40" r="3" fill="var(--secondary)" opacity="0.7" />
            <rect x="28" y="24" width="16" height="11" rx="1" fill="var(--bg-card)" stroke="var(--primary)" stroke-width="1" />
            <line x1="31" y1="30" x2="41" y2="30" stroke="var(--primary)" stroke-width="1" />
            
            {/* Snack Packet (Right) */}
            <path d="M56 12L78 15V47L56 44V12Z" fill="rgba(214, 82, 25, 0.05)" stroke="var(--primary)" stroke-width="2" stroke-linejoin="round" />
            <path d="M56 12L78 15" stroke="var(--primary)" stroke-width="2" />
            <path d="M56 44L78 47" stroke="var(--primary)" stroke-width="2" />
            <polygon points="60,22 74,24 72,34 58,32" fill="var(--accent)" stroke="var(--primary)" stroke-width="1" />
            <circle cx="67" cy="38" r="1.5" fill="var(--accent)" />
            <circle cx="71" cy="39" r="1" fill="var(--accent)" />
          </svg>
          <h3 style={{ fontSize: '1.25rem', marginTop: '6px', fontFamily: "'Playfair Display', serif" }}>
            {isLogin ? 'Homemade Store Access' : 'Create Account'}
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {isLogin ? 'Sign in to order fresh homemade items' : 'Register to get foods shipped home'}
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
