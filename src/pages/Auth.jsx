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
          <svg viewBox="0 0 100 65" width="70" height="46" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '6px' }}>
            {/* Basket Handle */}
            <path d="M22 40 C22 14, 78 14, 78 40" fill="none" stroke="#b0693a" stroke-width="2.5" stroke-linecap="round" />

            {/* Pickle Jar (Left, placed inside basket) */}
            <rect x="27" y="22" width="18" height="4" rx="1" fill="var(--primary)" />
            <rect x="30" y="26" width="12" height="2" fill="var(--accent)" />
            <path d="M24 28C24 27 25 26 26 26H46C47 26 48 27 48 28V46C48 48 46 50 44 50H28C26 50 24 48 24 46V28Z" fill="var(--bg-card)" stroke="var(--secondary)" stroke-width="2" />
            <circle cx="31" cy="34" r="2.5" fill="var(--secondary)" opacity="0.6" />
            <circle cx="41" cy="39" r="2.5" fill="var(--secondary)" opacity="0.6" />
            <rect x="29" y="32" width="14" height="10" rx="0.5" fill="var(--bg-card)" stroke="var(--primary)" stroke-width="0.8" />
            <line x1="32" y1="37" x2="40" y2="37" stroke="var(--primary)" stroke-width="0.8" />

            {/* Snack Packet (Right, slightly tilted, inside basket) */}
            <g transform="rotate(12 62 25)">
              <path d="M52 20L74 22V46L52 44V20Z" fill="var(--bg-card)" stroke="var(--primary)" stroke-width="2" stroke-linejoin="round" />
              <path d="M52 20L74 22" stroke="var(--primary)" stroke-width="2" />
              <path d="M52 44L74 46" stroke="var(--primary)" stroke-width="2" />
              <polygon points="56,28 70,30 68,38 54,36" fill="var(--accent)" stroke="var(--primary)" stroke-width="0.8" />
              <circle cx="63" cy="40" r="1" fill="var(--accent)" />
            </g>

            {/* Basket Front Wall (covers the bottom of jar and pack) */}
            <path d="M18 40L28 58H72L82 40Z" fill="var(--bg-card)" stroke="#b0693a" stroke-width="2.5" stroke-linejoin="round" />
            {/* Wicker Weave Texture */}
            <path d="M21 45H79" stroke="#b0693a" stroke-width="1" stroke-dasharray="5 3" />
            <path d="M25 51H75" stroke="#b0693a" stroke-width="1" stroke-dasharray="5 3" />
            <path d="M29 57H71" stroke="#b0693a" stroke-width="1" stroke-dasharray="5 3" />
          </svg>
          <h3 style={{ fontSize: '1.25rem', marginTop: '6px', fontFamily: "'Playfair Display', serif" }}>
            {isLogin ? 'Homemadebasket Access' : 'Create Account'}
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
