import React, { useState } from 'react';
import { api } from '../api';
import { ChevronLeft, Lock, CheckCircle, QrCode, Shield } from 'lucide-react';

export default function Checkout({ user, cart, clearCart, setView, showToast }) {
  // Prefill details from saved user profile
  const [name, setName] = useState(user ? user.name : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [phone, setPhone] = useState(user && user.phone ? user.phone : '');
  const [address, setAddress] = useState(user && user.address ? user.address : '');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or UPI
  const [submitting, setSubmitting] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState(null);

  if (!user) {
    return (
      <div className="container" style={{ margin: '40px auto', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '30px 20px', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '2.5rem' }}>🔐</span>
          <h2 style={{ fontSize: '1.4rem', margin: '16px 0 8px', fontFamily: "'Playfair Display', serif" }}>Sign In to Order</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
            Please log in or register an account to checkout your gourmet basket.
          </p>
          <button onClick={() => setView('auth')} className="btn btn-primary" style={{ width: '100%' }}>
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !orderReceipt) {
    return (
      <div className="container" style={{ margin: '40px auto', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '30px 20px', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '2.5rem' }}>🛒</span>
          <h2 style={{ fontSize: '1.4rem', margin: '16px 0 8px', fontFamily: "'Playfair Display', serif" }}>Your Basket is Empty</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
            Add some homemade treats before proceeding to checkout.
          </p>
          <button onClick={() => setView('catalog')} className="btn btn-primary" style={{ width: '100%' }}>
            Browse store menu
          </button>
        </div>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryCharge = 40.00;
  const grandTotal = subtotal + deliveryCharge;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return showToast('Please enter your phone number.', 'error');
    if (!address.trim()) return showToast('Please enter delivery address.', 'error');

    try {
      setSubmitting(true);
      const items = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        custom_spice: item.customSpice || 'Medium' // Pass spice customization
      }));

      const response = await api.placeOrder({
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        delivery_address: address,
        payment_method: paymentMethod,
        items
      });

      showToast('Order confirmed!', 'success');
      setOrderReceipt({
        orderId: response.orderId,
        totalAmount: response.totalAmount,
        customerName: name,
        customerPhone: phone,
        deliveryAddress: address,
        paymentMethod
      });
      clearCart();
    } catch (err) {
      showToast(err.message || 'Place order failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderReceipt) {
    return (
      <div className="container" style={{ margin: '20px auto' }}>
        <div className="glass-panel" style={{
          padding: '30px 20px',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <div className="flex-center" style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'var(--secondary-light)',
            color: 'var(--secondary)',
            borderRadius: '50%',
            margin: '0 auto 16px',
            border: '1px solid rgba(39, 84, 56, 0.1)'
          }}>
            <CheckCircle size={24} />
          </div>

          <h2 style={{ fontSize: '1.6rem', marginBottom: '6px', fontFamily: "'Playfair Display', serif" }}>
            Order Confirmed!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '24px' }}>
            We've received your order. Standard shipping takes 2-3 business days.
          </p>

          {/* Receipt Info */}
          <div style={{
            backgroundColor: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            textAlign: 'left',
            marginBottom: '24px',
            fontSize: '0.82rem',
            lineHeight: 1.4
          }}>
            <div className="flex-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '8px', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Order Reference ID:</span>
              <strong style={{ color: 'var(--primary)' }}>#PF-{orderReceipt.orderId}</strong>
            </div>
            <div style={{ marginBottom: '6px' }}><strong>Deliver to:</strong> {orderReceipt.customerName} ({orderReceipt.customerPhone})</div>
            <div style={{ marginBottom: '6px' }}><strong>Shipping Address:</strong> {orderReceipt.deliveryAddress}</div>
            <div className="flex-between" style={{ marginBottom: '6px' }}>
              <strong>Payment Mode:</strong>
              <span>{orderReceipt.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'UPI Instant Pay'}</span>
            </div>
            
            <div className="flex-between" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '8px', marginTop: '8px', fontSize: '0.95rem' }}>
              <strong>Grand Total:</strong>
              <strong style={{ color: 'var(--primary)' }}>₹{parseFloat(orderReceipt.totalAmount + deliveryCharge).toFixed(2)}</strong>
            </div>
          </div>

          {/* FSSAI Trust display on receipt */}
          <div style={{
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            marginBottom: '28px',
            lineHeight: 1.3
          }}>
            <strong style={{ color: 'var(--secondary)' }}>FSSAI license No. 22424001000853</strong>
            <div>This invoice is generated from our kitchen registry. Keep this receipt for return guarantees.</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => setView('catalog')} className="btn btn-primary">
              Continue Shopping
            </button>
            <button onClick={() => setView('my-orders')} className="btn btn-outline">
              Track My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginBottom: '24px' }}>
      <button 
        onClick={() => setView('catalog')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          marginBottom: '16px',
          fontWeight: 600,
          fontSize: '0.82rem'
        }}
      >
        <ChevronLeft size={14} />
        Back to Menu
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Order review */}
        <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '12px', fontWeight: 700 }}>Basket Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
            {cart.map((item, idx) => (
              <div key={idx} className="flex-between">
                <span style={{ color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.product.name} (x{item.quantity})
                  {item.product.spice_level > 0 && (
                    <strong style={{ color: 'var(--primary)', marginLeft: '4px' }}>[{item.customSpice}]</strong>
                  )}
                </span>
                <strong>₹{(item.product.price * item.quantity).toFixed(0)}</strong>
              </div>
            ))}
            <div className="flex-between" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '8px', marginTop: '4px' }}>
              <span>Items Total:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex-between">
              <span>Delivery Charge:</span>
              <span>₹{deliveryCharge.toFixed(2)}</span>
            </div>
            <div className="flex-between" style={{ borderTop: '1px dashed rgba(0,0,0,0.08)', paddingTop: '8px', fontSize: '1rem', fontWeight: 800 }}>
              <span>Grand Total:</span>
              <span style={{ color: 'var(--primary)' }}>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Input Details */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontFamily: "'Playfair Display', serif" }}>
            Delivery Location
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Recipient Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="tel" 
                className="form-input" 
                placeholder="e.g. 9876543210" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Complete Address</label>
              <textarea 
                className="form-input" 
                rows="3" 
                placeholder="Flat/House No, Building, Street Name, Landmark, PIN Code" 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                required
                style={{ resize: 'none' }}
              ></textarea>
            </div>

            {/* Trust Badges */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: 'var(--secondary)',
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: 'var(--secondary-light)',
              padding: '8px',
              borderRadius: '8px',
              margin: '16px 0'
            }}>
              <Shield size={12} fill="var(--secondary)" />
              Secure, sun-matured hygiene packing & shipping
            </div>

            {/* Payment method */}
            <div style={{ marginTop: '20px' }}>
              <span className="form-label" style={{ marginBottom: '10px' }}>Select Payment</span>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <label style={{
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${paymentMethod === 'COD' ? 'var(--primary)' : 'var(--border-color)'}`,
                  backgroundColor: paymentMethod === 'COD' ? 'var(--primary-light)' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="COD" 
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  COD (Pay cash/UPI)
                </label>

                <label style={{
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${paymentMethod === 'UPI' ? 'var(--primary)' : 'var(--border-color)'}`,
                  backgroundColor: paymentMethod === 'UPI' ? 'var(--primary-light)' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="UPI" 
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  Scan UPI QR
                </label>
              </div>

              {/* UPI screen mock */}
              {paymentMethod === 'UPI' && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-color)',
                  backgroundColor: 'var(--bg-input)',
                  textAlign: 'center',
                  marginBottom: '16px'
                }}>
                  <QrCode size={100} style={{ color: 'black', padding: '6px', backgroundColor: 'white', borderRadius: '6px', marginBottom: '8px' }} />
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Scan QR to Pay</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>UPI ID: homemadefoods@ybl</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>
                    Pay Grand Total: ₹{grandTotal.toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
              disabled={submitting}
            >
              {submitting ? 'Placing Order...' : `Confirm Order • ₹${grandTotal.toFixed(2)}`}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <Lock size={12} style={{ color: 'var(--secondary)' }} />
          Verified Secure SSL Checkout Gateway
        </div>
      </div>
    </div>
  );
}
