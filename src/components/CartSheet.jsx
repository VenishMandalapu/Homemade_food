import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { getImageUrl } from '../api';

export default function CartSheet({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, setView }) {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckoutClick = () => {
    onClose();
    setView('checkout');
  };

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div 
        className="bottom-sheet" 
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: '32px' }}
      >
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

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <ShoppingBag size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>Your Basket</h3>
        </div>

        {/* Items List */}
        <div style={{
          maxHeight: '45vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '20px',
          paddingRight: '2px'
        }}>
          {cart.length === 0 ? (
            <div className="flex-center" style={{ flexDirection: 'column', padding: '40px 0', textAlign: 'center', gap: '12px' }}>
              <ShoppingBag size={40} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Your cart is empty. Let's add some homemade food!
              </p>
              <button onClick={onClose} className="btn btn-outline" style={{ marginTop: '8px', padding: '8px 16px', fontSize: '0.85rem' }}>
                Browse Store Menu
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.product.id}-${item.customSpice || 'Medium'}-${idx}`} style={{
                display: 'flex',
                gap: '12px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border-color)',
                alignItems: 'center'
              }}>
                {/* Image */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#eae6df',
                  flexShrink: 0
                }}>
                  <img 
                    src={getImageUrl(item.product.image_url)} 
                    alt={item.product.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=150';
                    }}
                  />
                </div>

                {/* Details */}
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div className="flex-between" style={{ marginBottom: '2px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                      {item.product.name}
                    </h4>
                    <button 
                      onClick={() => onRemoveItem(item.product.id, item.customSpice)}
                      style={{ color: '#c22929', cursor: 'pointer', opacity: 0.8 }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  
                  {/* Spice preference label */}
                  {item.product.spice_level > 0 && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '2px' }}>
                      Spice Preference: {item.customSpice}
                    </div>
                  )}

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Unit: ₹{parseFloat(item.product.price).toFixed(2)}
                  </div>
                  
                  <div className="flex-between">
                    {/* Stepper */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      backgroundColor: 'var(--bg-input)'
                    }}>
                      <button 
                        onClick={() => onUpdateQuantity(item.product.id, item.customSpice, item.quantity - 1)}
                        style={{ padding: '2px 8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
                      >-</button>
                      <span style={{ padding: '0 6px', fontSize: '0.8rem', fontWeight: 600 }}>{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.product.id, item.customSpice, item.quantity + 1)}
                        style={{ padding: '2px 8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
                        disabled={item.quantity >= item.product.stock}
                      >+</button>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      ₹{parseFloat(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '16px',
            backgroundColor: 'var(--bg-card)'
          }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Items Subtotal:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
            
            <button 
              onClick={handleCheckoutClick}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px 16px', display: 'flex', gap: '8px', fontSize: '0.95rem' }}
            >
              Checkout Now
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
