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
        {/* SVG Logo: Pickle Jar & Snack Packet */}
        <svg viewBox="0 0 100 60" width="70" height="42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '6px' }}>
          {/* Pickle Jar (Left) */}
          <rect x="25" y="10" width="22" height="5" rx="1.5" fill="var(--primary)" />
          <rect x="28" y="15" width="16" height="3" fill="var(--accent)" />
          <path d="M22 19C22 18 23 17 24 17H48C49 17 50 18 50 19V45C50 48 48 50 45 50H27C24 50 22 48 22 45V19Z" fill="rgba(39, 84, 56, 0.05)" stroke="var(--secondary)" stroke-width="2" />
          <circle cx="31" cy="28" r="3" fill="var(--secondary)" opacity="0.7" />
          <circle cx="41" cy="34" r="3" fill="var(--secondary)" opacity="0.7" />
          <circle cx="33" cy="40" r="3" fill="var(--secondary)" opacity="0.7" />
          <rect x="28" y="24" width="16" height="11" rx="1" fill="var(--bg-card)" stroke="var(--primary)" stroke-width="1" />
          <line x1="31" y1="30" x2="41" y2="30" stroke="var(--primary)" stroke-width="1" />
          
          {/* Snack Packet (Right) */}
          <path d="M56 12L78 15V47L56 44V12Z" fill="rgba(214, 82, 25, 0.05)" stroke="var(--primary)" stroke-width="2" stroke-linejoin="round" />
          <path d="M56 12L78 15" stroke="var(--primary)" stroke-width="2" />
          <path d="M56 44L78 47" stroke="var(--primary)" stroke-width="2" />
          <polygon points="60,22 74,24 72,34 58,32" fill="var(--accent)" stroke="var(--primary)" stroke-width="1" />
          <circle cx="67" cy="38" r="1.5" fill="var(--accent)" />
          <circle cx="71" cy="39" r="1" fill="var(--accent)" />
        </svg>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', fontFamily: "'Playfair Display', serif", letterSpacing: '-0.01em' }}>
          Homemade
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
