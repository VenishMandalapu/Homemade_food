import React from 'react';
import { Home, ShoppingBag, ClipboardList, User, ShieldCheck } from 'lucide-react';

export default function BottomNav({ user, cart, setView, activeView, toggleCart }) {
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bottom-nav">
      {/* Home Tab */}
      <button 
        onClick={() => setView('catalog')}
        className={`nav-item ${activeView === 'catalog' ? 'nav-item-active' : ''}`}
      >
        <Home size={22} />
        <span>Menu</span>
      </button>

      {/* Cart Tab */}
      <button 
        onClick={toggleCart}
        className="nav-item"
        style={{ position: 'relative' }}
      >
        <ShoppingBag size={22} />
        <span>Basket</span>
        {cartItemCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '25%',
            backgroundColor: 'var(--primary)',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 'bold',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(214, 82, 25, 0.3)'
          }}>
            {cartItemCount}
          </span>
        )}
      </button>

      {/* Orders Tab (Visible to authenticated users) */}
      {user && (
        <button 
          onClick={() => setView('my-orders')}
          className={`nav-item ${activeView === 'my-orders' ? 'nav-item-active' : ''}`}
        >
          <ClipboardList size={22} />
          <span>Orders</span>
        </button>
      )}

      {/* Admin Panel Tab (Admin only) */}
      {user && user.role === 'admin' && (
        <button 
          onClick={() => setView('admin')}
          className={`nav-item ${activeView === 'admin' ? 'nav-item-active' : ''}`}
        >
          <ShieldCheck size={22} style={{ color: 'var(--accent)' }} />
          <span>Admin</span>
        </button>
      )}

      {/* Profile Tab */}
      <button 
        onClick={() => setView(user ? 'profile' : 'auth')}
        className={`nav-item ${activeView === 'profile' || activeView === 'auth' ? 'nav-item-active' : ''}`}
      >
        <User size={22} />
        <span>{user ? 'Profile' : 'Sign In'}</span>
      </button>
    </div>
  );
}
