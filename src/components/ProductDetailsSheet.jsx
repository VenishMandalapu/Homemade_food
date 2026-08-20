import React, { useState } from 'react';
import { X, Flame, Calendar, ShoppingBag, ShieldCheck } from 'lucide-react';
import ReviewSection from './ReviewSection';
import { getImageUrl } from '../api';

export default function ProductDetailsSheet({ product, onClose, onAddToCart, showToast }) {
  const [quantity, setQuantity] = useState(1);
  const [customSpice, setCustomSpice] = useState('Medium'); // Custom spice preference
  
  const { id, name, description, ingredients, price, category, spice_level, shelf_life, stock, image_url } = product;
  const isOutOfStock = stock === 0;

  const handleIncrement = () => {
    if (quantity < stock) setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAdd = () => {
    // Pass custom spice preference along
    onAddToCart(product, quantity, customSpice);
    onClose();
  };

  const renderSpiceLevel = () => {
    if (spice_level === 0) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        {[...Array(3)].map((_, i) => (
          <Flame 
            key={i} 
            size={14} 
            fill={i < spice_level ? 'var(--primary)' : 'transparent'} 
            color={i < spice_level ? 'var(--primary)' : 'rgba(0,0,0,0.15)'} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Swipe Handle */}
        <span className="bottom-sheet-handle" onClick={onClose} style={{ cursor: 'pointer' }}></span>

        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            cursor: 'pointer',
            backgroundColor: 'var(--bg-input)',
            borderRadius: '50%',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <X size={16} />
        </button>

        {/* Product Image */}
        <div style={{
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          backgroundColor: '#eae6df',
          aspectRatio: '16/10',
          marginBottom: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <img 
            src={getImageUrl(image_url)} 
            alt={name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=500';
            }}
          />
        </div>

        {/* Metadata Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span className={`badge badge-${category}`}>{category}</span>
          {renderSpiceLevel()}
        </div>

        {/* Product Title */}
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', lineHeight: 1.2, fontFamily: "'Playfair Display', serif" }}>
          {name}
        </h2>

        {/* Price tag */}
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px' }}>
          ₹{parseFloat(price).toFixed(2)}
        </div>

        {/* Description text */}
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.5 }}>
          {description}
        </p>

        {/* Ingredients List */}
        {ingredients && (
          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '12px',
            marginBottom: '20px',
            fontSize: '0.8rem',
            lineHeight: 1.4
          }}>
            <div style={{ fontWeight: 700, color: 'var(--secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} />
              Ingredients List (100% Sun-Matured):
            </div>
            <span style={{ color: 'var(--text-muted)' }}>{ingredients}</span>
          </div>
        )}

        {/* Specs Details Box */}
        <div style={{
          backgroundColor: 'var(--bg-input)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          marginBottom: '20px',
          fontSize: '0.78rem',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} style={{ color: 'var(--secondary)' }} />
            Shelf Life: <strong>{shelf_life || 'N/A'}</strong>
          </span>
          <span>
            Stock Status:{' '}
            {isOutOfStock ? (
              <strong style={{ color: '#c22929' }}>Sold Out</strong>
            ) : (
              <strong style={{ color: 'var(--secondary)' }}>{stock} available</strong>
            )}
          </span>
        </div>

        {/* Spice Level Preference Dropdown Customizer (For spicy items) */}
        {!isOutOfStock && spice_level > 0 && (
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Select Spice Preference</label>
            <select
              value={customSpice}
              onChange={(e) => setCustomSpice(e.target.value)}
              className="form-select"
              style={{ height: '40px', fontSize: '0.85rem', padding: '8px 12px' }}
            >
              <option value="Mild">Mild (Milder taste)</option>
              <option value="Medium">Medium (Traditional recipe)</option>
              <option value="Extra Hot">Extra Hot (Extra chili kick 🌶️)</option>
            </select>
          </div>
        )}

        {/* Stepper & Actions */}
        {!isOutOfStock && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            {/* Stepper */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-input)'
            }}>
              <button 
                onClick={handleDecrement}
                style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
                disabled={quantity <= 1}
              >-</button>
              <span style={{ width: '24px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>{quantity}</span>
              <button 
                onClick={handleIncrement}
                style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
                disabled={quantity >= stock}
              >+</button>
            </div>

            {/* Add Button */}
            <button 
              onClick={handleAdd}
              className="btn btn-primary"
              style={{ flexGrow: 1, padding: '10px 16px', fontSize: '0.9rem' }}
            >
              <ShoppingBag size={14} />
              Add • ₹{parseFloat(price * quantity).toFixed(0)}
            </button>
          </div>
        )}

        {/* Reviews Section */}
        <ReviewSection productId={id} showToast={showToast} />
      </div>
    </div>
  );
}
