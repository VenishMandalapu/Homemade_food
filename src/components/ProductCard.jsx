import React from 'react';
import { Flame, Star, Plus, Shield } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, onClick }) {
  const { name, price, category, spice_level, stock, image_url } = product;
  const isOutOfStock = stock === 0;

  const renderSpiceLevel = () => {
    if (spice_level === 0) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
        {[...Array(spice_level)].map((_, i) => (
          <Flame 
            key={i} 
            size={10} 
            fill="var(--primary)" 
            color="var(--primary)" 
          />
        ))}
      </div>
    );
  };

  return (
    <div 
      className="glass-panel" 
      style={{
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-card)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'var(--transition)'
      }}
      onClick={onClick}
    >
      {/* Aspect Ratio Image Wrapper */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '90%', overflow: 'hidden', backgroundColor: '#eae6df' }}>
        <img 
          src={image_url} 
          alt={name} 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=250';
          }}
        />

        {/* Spice Overlay */}
        {spice_level > 0 && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(4px)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center'
          }}>
            {renderSpiceLevel()}
          </div>
        )}

        {/* Organic Trust Banner on Card */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          backgroundColor: 'rgba(39, 84, 56, 0.9)',
          backdropFilter: 'blur(2px)',
          color: 'white',
          fontSize: '0.58rem',
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '2px'
        }}>
          <Shield size={8} fill="white" />
          100% Sun-Matured
        </div>
      </div>

      {/* Spacers & Texts */}
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Name */}
        <h3 style={{ 
          fontSize: '0.85rem', 
          fontWeight: 700, 
          color: 'var(--text-main)', 
          lineHeight: 1.25, 
          marginBottom: '6px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          height: '32px'
        }}>
          {name}
        </h3>

        {/* Rating Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '8px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          <Star size={10} fill="var(--accent)" color="var(--accent)" />
          <strong>4.8</strong> (Fresh Batch)
        </div>

        {/* Price & CTA action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '4px' }}>
          <div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Price</span>
            <strong style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ₹{parseFloat(price).toFixed(0)}
            </strong>
          </div>

          <div>
            {isOutOfStock ? (
              <span style={{ fontSize: '0.72rem', color: '#c22929', fontWeight: 700 }}>Sold Out</span>
            ) : (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="btn btn-primary"
                style={{ 
                  padding: '6px 10px', 
                  borderRadius: '8px', 
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '28px',
                  width: '48px'
                }}
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
