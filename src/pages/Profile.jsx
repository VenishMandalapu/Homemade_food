import React, { useState } from 'react';
import { api } from '../api';
import { User, Phone, MapPin, ShieldAlert, ClipboardList, LogOut, Heart } from 'lucide-react';

export default function Profile({ user, onUpdateUser, onLogout, setView, showToast }) {
  const [name, setName] = useState(user ? user.name : '');
  const [phone, setPhone] = useState(user && user.phone ? user.phone : '');
  const [address, setAddress] = useState(user && user.address ? user.address : '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return showToast('Please enter your name.', 'error');

    try {
      setSubmitting(true);
      const data = await api.updateProfile({
        name,
        phone,
        address
      });
      // Update global user state in App.jsx
      onUpdateUser(data.user);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ margin: '20px auto 40px' }}>
      {/* Profile Header Banner */}
      <div className="glass-panel" style={{
        padding: '24px 20px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-card)',
        textAlign: 'center',
        marginBottom: '20px',
        background: 'radial-gradient(circle at top left, var(--primary-light), transparent 60%), var(--bg-card)'
      }}>
        <div className="flex-center" style={{
          width: '56px',
          height: '56px',
          backgroundColor: 'var(--bg-input)',
          color: 'var(--primary)',
          borderRadius: '50%',
          margin: '0 auto 12px'
        }}>
          <User size={28} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
          {user ? user.name : 'Your Profile'}
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user ? user.email : ''}</p>
        
        {user && user.role === 'admin' && (
          <span className="badge badge-pickle" style={{ marginTop: '8px', fontSize: '0.65rem' }}>
            Store Administrator
          </span>
        )}
      </div>

      {/* Navigation shortcuts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        <button 
          onClick={() => setView('my-orders')}
          className="btn btn-outline"
          style={{ display: 'flex', justifyContent: 'flex-start', padding: '12px 16px', fontSize: '0.88rem', gap: '10px' }}
        >
          <ClipboardList size={18} style={{ color: 'var(--primary)' }} />
          View Order History
        </button>

        {user && user.role === 'admin' && (
          <button 
            onClick={() => setView('admin')}
            className="btn btn-outline"
            style={{ display: 'flex', justifyContent: 'flex-start', padding: '12px 16px', fontSize: '0.88rem', gap: '10px', borderColor: 'var(--accent)' }}
          >
            <ShieldAlert size={18} style={{ color: 'var(--accent)' }} />
            Open Admin Dashboard
          </button>
        )}
      </div>

      {/* Profile Form */}
      <div className="glass-panel" style={{
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontFamily: "'Playfair Display', serif" }}>
          Delivery Preferences
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                style={{ paddingLeft: '36px', height: '42px', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="tel" 
                className="form-input" 
                placeholder="e.g. 9876543210" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                style={{ paddingLeft: '36px', height: '42px', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Default Shipping Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '16px', color: 'var(--text-muted)' }} />
              <textarea 
                className="form-input" 
                rows="3" 
                placeholder="Saved address for faster one-click checkout" 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                style={{ paddingLeft: '36px', resize: 'none', minHeight: '80px', fontSize: '0.88rem' }}
              ></textarea>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
            disabled={submitting}
          >
            {submitting ? 'Saving Details...' : 'Save Profile Details'}
          </button>
        </form>
      </div>

      {/* Logout Action */}
      <button 
        onClick={onLogout}
        className="btn"
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '0.9rem',
          backgroundColor: 'rgba(194, 41, 41, 0.08)',
          color: '#c22929',
          display: 'flex',
          gap: '8px'
        }}
      >
        <LogOut size={16} />
        Sign Out Account
      </button>

      {/* FSSAI Trust Disclaimer in Profile Footer */}
      <div style={{
        marginTop: '24px',
        textAlign: 'center',
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        lineHeight: 1.4
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 700, color: 'var(--secondary)' }}>
          FSSAI Lic. No: 22424001000853
        </div>
        <div>Standard packaging compliance checks are applied on every batch.</div>
      </div>
    </div>
  );
}
