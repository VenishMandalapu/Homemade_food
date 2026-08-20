import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import CartSheet from './components/CartSheet';
import ProductDetailsSheet from './components/ProductDetailsSheet';
import Catalog from './pages/Catalog';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import { api } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('catalog'); // catalog, checkout, auth, admin, my-orders, profile
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Initialize session and cart
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedCart = localStorage.getItem('cart');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      verifySession();
    }
    
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const verifySession = async () => {
    try {
      const data = await api.getMe();
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (err) {
      console.warn('Session expired. Logging out...', err);
      handleLogout();
    }
  };

  // Global Toast
  const showToast = (message, type = 'success') => {
    if (type === 'clear') {
      setToast(null);
      return;
    }
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Login/Logout managers
  const handleLoginSuccess = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    showToast(`Welcome back, ${userData.name}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setView('catalog');
    showToast('Signed out.', 'success');
  };

  // Cart actions with Custom Spice Level support
  const addToCart = (product, quantity = 1, customSpice = 'Medium') => {
    setCart((prevCart) => {
      // Find matching item by BOTH product id AND spice level
      const existingItemIndex = prevCart.findIndex(
        item => item.product.id === product.id && item.customSpice === customSpice
      );
      
      let newCart;
      
      if (existingItemIndex > -1) {
        const updatedItems = [...prevCart];
        const newQty = updatedItems[existingItemIndex].quantity + quantity;
        
        if (newQty > product.stock) {
          showToast(`Only ${product.stock} units available in stock.`, 'error');
          return prevCart;
        }
        
        updatedItems[existingItemIndex].quantity = newQty;
        newCart = updatedItems;
      } else {
        if (quantity > product.stock) {
          showToast(`Only ${product.stock} units available in stock.`, 'error');
          return prevCart;
        }
        newCart = [...prevCart, { product, quantity, customSpice }];
      }

      localStorage.setItem('cart', JSON.stringify(newCart));
      
      const spiceText = product.spice_level > 0 ? ` (${customSpice})` : '';
      showToast(`Added ${quantity} x ${product.name}${spiceText} to basket.`, 'success');
      return newCart;
    });
  };

  const updateCartQuantity = (productId, customSpice, newQty) => {
    setCart((prevCart) => {
      let newCart;
      if (newQty <= 0) {
        newCart = prevCart.filter(
          item => !(item.product.id === productId && item.customSpice === customSpice)
        );
      } else {
        newCart = prevCart.map(item => 
          (item.product.id === productId && item.customSpice === customSpice) 
            ? { ...item, quantity: newQty } 
            : item
        );
      }
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (productId, customSpice) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter(
        item => !(item.product.id === productId && item.customSpice === customSpice)
      );
      localStorage.setItem('cart', JSON.stringify(newCart));
      showToast('Item removed from basket.', 'success');
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  // Render content
  const renderView = () => {
    switch (view) {
      case 'catalog':
        return (
          <Catalog 
            onAddToCart={addToCart} 
            setSelectedProduct={setSelectedProduct}
            showToast={showToast} 
          />
        );
      case 'checkout':
        return (
          <Checkout 
            user={user} 
            cart={cart} 
            clearCart={clearCart} 
            setView={setView} 
            showToast={showToast} 
          />
        );
      case 'auth':
        return (
          <Auth 
            onLoginSuccess={handleLoginSuccess} 
            setView={setView} 
            showToast={showToast} 
          />
        );
      case 'admin':
        return (
          user && user.role === 'admin' ? (
            <AdminDashboard showToast={showToast} />
          ) : (
            setView('catalog')
          )
        );
      case 'my-orders':
        return (
          <MyOrders 
            user={user} 
            setView={setView} 
            showToast={showToast} 
            onLogout={handleLogout}
          />
        );
      case 'profile':
        return (
          <Profile 
            user={user} 
            onUpdateUser={(updatedUser) => {
              localStorage.setItem('user', JSON.stringify(updatedUser));
              setUser(updatedUser);
            }}
            onLogout={handleLogout}
            setView={setView}
            showToast={showToast}
          />
        );
      default:
        return <Catalog onAddToCart={addToCart} setSelectedProduct={setSelectedProduct} showToast={showToast} />;
    }
  };

  return (
    <div className="app-container">
      {/* Global Header Logo & Brand */}
      <header style={{
        textAlign: 'center',
        padding: '16px 20px 8px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* SVG Logo: Pickle Jar & Snack Packet inside a Wicker Basket */}
        <svg viewBox="0 0 100 65" width="80" height="52" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '6px' }}>
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

        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', fontFamily: "'Playfair Display', serif", letterSpacing: '-0.01em' }}>
          Homemadebasket
        </h1>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '2px', fontWeight: 600 }}>
          Sun-Matured Pickles & Crunchy Snacks
        </p>
      </header>

      {/* Dynamic Content Frame */}
      <div style={{ flexGrow: 1, paddingTop: '16px' }}>
        {renderView()}
      </div>

      {/* Global Bottom Navigation bar */}
      <BottomNav 
        user={user} 
        cart={cart} 
        setView={setView} 
        activeView={view} 
        toggleCart={() => setIsCartOpen(!isCartOpen)} 
      />

      {/* Cart Sheet Bottom Drawer */}
      <CartSheet 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        onUpdateQuantity={updateCartQuantity} 
        onRemoveItem={removeFromCart} 
        setView={setView} 
      />

      {/* Product Details Bottom Sheet */}
      {selectedProduct && (
        <ProductDetailsSheet 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={addToCart} 
          showToast={showToast} 
        />
      )}

      {/* Dynamic Alerts */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span>{toast.type === 'success' ? '✓' : '✗'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
