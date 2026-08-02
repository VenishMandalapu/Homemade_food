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
      {/* Dynamic Content Frame */}
      <div style={{ flexGrow: 1, paddingTop: '10px' }}>
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
