import React, { useState, useEffect } from 'react';
import { api, getImageUrl } from '../api';
import { ShoppingBag, Calendar, LogOut, User } from 'lucide-react';

export default function MyOrders({ user, setView, showToast, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getMyOrders();
      setOrders(data);
    } catch (err) {
      showToast(err.message || 'Failed to load orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'delivered':
        return { backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)', border: '1px solid rgba(39, 84, 56, 0.1)' };
      case 'shipped':
        return { backgroundColor: 'rgba(229, 154, 24, 0.12)', color: '#b57912', border: '1px solid rgba(229, 154, 24, 0.15)' };
      case 'pending':
        return { backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid rgba(214, 82, 25, 0.1)' };
      default:
        return { backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' };
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ margin: '40px auto', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '30px 20px', borderRadius: 'var(--radius-lg)' }}>
          <h2>Sign In to View Orders</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '12px 0 20px' }}>
            Please sign in to your profile to track history of orders.
          </p>
          <button onClick={() => setView('auth')} className="btn btn-primary" style={{ width: '100%' }}>
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginBottom: '40px' }}>
      {/* Account Profile Header card */}
      <div className="glass-panel" style={{
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
        backgroundColor: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'relative'
      }}>
        <div className="flex-center" style={{
          width: '40px',
          height: '40px',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          borderRadius: '50%'
        }}>
          <User size={20} />
        </div>
        <div style={{ flexGrow: 1 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{user.name}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</span>
        </div>
        
        {/* Logout */}
        <button 
          onClick={onLogout}
          style={{
            padding: '8px',
            backgroundColor: 'rgba(194, 41, 41, 0.06)',
            borderRadius: '50%',
            color: '#c22929',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>

      <h2 style={{ fontSize: '1.4rem', marginBottom: '16px', fontFamily: "'Playfair Display', serif" }}>
        Your Gourmet Orders
      </h2>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px 16px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
          <ShoppingBag size={32} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>No Orders Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '16px' }}>
            You haven't ordered anything yet. Try Dadi's homemade pickles today!
          </p>
          <button onClick={() => setView('catalog')} className="btn btn-primary" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
            Browse store menu
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => (
            <div key={order.id} className="glass-panel" style={{
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-card)'
            }}>
              {/* Header */}
              <div className="flex-between" style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(0,0,0,0.04)',
                backgroundColor: 'rgba(0,0,0,0.01)'
              }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>ORDER REF</span>
                  <strong style={{ fontSize: '0.82rem', color: 'var(--primary)' }}>#PF-{order.id}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>PLACED</span>
                  <span style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Calendar size={12} />
                    {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                {/* Badge */}
                <span className="badge" style={{
                  ...getStatusStyle(order.status),
                  padding: '4px 10px',
                  fontSize: '0.72rem'
                }}>
                  {order.status}
                </span>
              </div>

              {/* Items list */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img 
                      src={getImageUrl(item.image_url)} 
                      alt={item.product_name} 
                      style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=80';
                      }}
                    />
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.product_name}
                        {item.custom_spice && (
                          <strong style={{ color: 'var(--primary)', marginLeft: '4px' }}>[{item.custom_spice}]</strong>
                        )}
                      </h4>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Quantity: {item.quantity} • ₹{item.price_at_purchase}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      ₹{(item.price_at_purchase * item.quantity).toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{
                padding: '10px 16px',
                borderTop: '1px solid rgba(0,0,0,0.03)',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                backgroundColor: 'rgba(0,0,0,0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Shipping Address: {order.delivery_address}</span>
                <strong style={{ color: 'var(--text-main)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                  Total: ₹{parseFloat(order.total_amount + 40).toFixed(0)}
                </strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
