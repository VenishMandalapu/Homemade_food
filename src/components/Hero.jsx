import React from 'react';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function Hero({ onExplore }) {
  return (
    <div className="glass-panel" style={{
      borderRadius: 'var(--radius-lg)',
      padding: '60px 40px',
      marginBottom: '48px',
      position: 'relative',
      overflow: 'hidden',
      background: 'radial-gradient(circle at top right, rgba(224, 90, 22, 0.12), transparent 60%), radial-gradient(circle at bottom left, rgba(31, 80, 45, 0.15), transparent 60%), var(--glass-bg)',
      border: '1px solid var(--border-color)'
    }}>
      {/* Decorative Glow elements */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '400px',
        height: '400px',
        background: 'var(--primary)',
        filter: 'blur(150px)',
        opacity: 0.1,
        borderRadius: '50%',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        maxWidth: '700px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Organic Tag */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          marginBottom: '24px',
          border: '1px solid rgba(224, 90, 22, 0.2)'
        }}>
          <Sparkles size={14} />
          100% Homemade & Chemical Free
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '3.5rem',
          lineHeight: '1.15',
          marginBottom: '20px',
          fontWeight: 800,
          color: 'var(--text-main)'
        }}>
          Gourmet Taste Crafted in{' '}
          <span style={{
            background: 'linear-gradient(45deg, var(--accent), var(--primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Home Kitchens
          </span>
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          marginBottom: '32px',
          lineHeight: 1.7
        }}>
          Indulge in our collection of slow-matured, traditional home-style pickles and crispy, hand-rolled savory snacks. Made in small batches using local ingredients and cold-pressed oils.
        </p>

        {/* Trust Badges & Buttons */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '24px'
        }}>
          <button onClick={onExplore} className="btn btn-primary">
            Browse Store
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={18} style={{ color: 'var(--accent)' }} />
              Hygiene Certified
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <Heart size={18} style={{ color: '#ff4d4d' }} />
              Zero Preservatives
            </div>
          </div>
        </div>
      </div>

      {/* Hero Illustration overlay (Right Side) */}
      <div style={{
        position: 'absolute',
        right: '40px',
        bottom: '20px',
        top: '20px',
        width: '40%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.15,
        pointerEvents: 'none'
      }} className="hide-on-mobile">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxHeight: '250px' }}>
          <path d="M100 20C55.8 20 20 55.8 20 100C20 144.2 55.8 180 100 180C144.2 180 180 144.2 180 100C180 55.8 144.2 20 100 20ZM100 160C66.9 160 40 133.1 40 100C40 66.9 66.9 40 100 40C133.1 40 160 66.9 160 100C160 133.1 133.1 160 100 160Z" fill="var(--primary)" />
          <path d="M100 60C77.9 60 60 77.9 60 100C60 122.1 77.9 140 100 140C122.1 140 140 122.1 140 100C140 77.9 122.1 60 100 60ZM100 120C89 120 80 111 80 100C80 89 89 80 100 80C111 80 120 89 120 100C120 111 111 120 100 120Z" fill="var(--accent)" />
        </svg>
      </div>
    </div>
  );
}
