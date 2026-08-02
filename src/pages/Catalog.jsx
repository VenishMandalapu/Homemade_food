import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Search, SlidersHorizontal, RefreshCw, Flame, Award, Sparkles } from 'lucide-react';
import TrustBadges from '../components/TrustBadges';
import ProductCard from '../components/ProductCard';

export default function Catalog({ onAddToCart, setSelectedProduct, showToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  
  // Mobile filter states
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(250);
  const [spiceFilter, setSpiceFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts(category, search);
      setProducts(data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch catalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const filteredProducts = products.filter(p => {
    const matchesPrice = parseFloat(p.price) <= maxPrice;
    let matchesSpice = true;
    if (spiceFilter === '0') {
      matchesSpice = p.spice_level === 0;
    } else if (spiceFilter === '1-2') {
      matchesSpice = p.spice_level > 0 && p.spice_level < 3;
    } else if (spiceFilter === '3') {
      matchesSpice = p.spice_level === 3;
    }
    return matchesPrice && matchesSpice;
  });

  return (
    <div className="container">
      {/* Brand Header */}
      <div style={{ textAlign: 'center', margin: '12px 0 20px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
          PikSnax Homemade
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Grandma's Traditional Recipes
        </p>
      </div>

      {/* Trust Card deck */}
      <TrustBadges />

      {/* Search and category tabs */}
      <div style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search homemade food..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', height: '42px', fontSize: '0.88rem' }}
            />
          </div>
          <button 
            type="button" 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline"
            style={{ padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Filters"
          >
            <SlidersHorizontal size={16} style={{ color: showFilters ? 'var(--primary)' : 'inherit' }} />
          </button>
        </form>

        {/* Collapsible Filters Drawer for Mobile Screens */}
        {showFilters && (
          <div className="glass-panel" style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Price range */}
              <div>
                <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Max Budget:</span>
                  <strong>₹{maxPrice}</strong>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="300" 
                  step="10"
                  value={maxPrice} 
                  onChange={e => setMaxPrice(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>

              {/* Spice */}
              <div className="flex-between">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Spice Level:</span>
                <select 
                  className="form-select" 
                  value={spiceFilter}
                  onChange={e => setSpiceFilter(e.target.value)}
                  style={{ width: '150px', padding: '6px 10px', fontSize: '0.8rem' }}
                >
                  <option value="all">All Spices</option>
                  <option value="0">Sweet / No Spice</option>
                  <option value="1-2">Mild / Medium</option>
                  <option value="3">Extra Spicy 🌶️</option>
                </select>
              </div>

              {/* Reset */}
              <button 
                onClick={() => { setMaxPrice(250); setSpiceFilter('all'); setSearch(''); }}
                className="btn btn-outline"
                style={{ width: '100%', padding: '6px', fontSize: '0.75rem', display: 'flex', gap: '6px' }}
              >
                <RefreshCw size={12} /> Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Category Tabs Scroll */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none'
        }}>
          {['all', 'pickle', 'snack'].map((tab) => (
            <button
              key={tab}
              onClick={() => setCategory(tab)}
              className="btn"
              style={{
                flexGrow: 1,
                padding: '8px 12px',
                fontSize: '0.82rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: category === tab ? 'var(--primary)' : 'var(--bg-card)',
                color: category === tab ? 'white' : 'var(--text-main)',
                border: `1px solid ${category === tab ? 'var(--primary)' : 'var(--border-color)'}`,
                textTransform: 'capitalize'
              }}
            >
              {tab === 'all' ? 'Explore All' : tab + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Meet the Cook authenticity banner */}
      <div className="glass-panel" style={{
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '20px',
        backgroundColor: 'var(--secondary-light)',
        border: '1px solid rgba(39, 84, 56, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '1.8rem' }}>👵🏽</span>
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)' }}>Prepared by Grandma</h4>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
            Cooked in clean local home-kitchens using natural sun-matured processes.
          </p>
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="flex-center" style={{ minHeight: '200px', flexDirection: 'column', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            border: '2px solid rgba(0,0,0,0.05)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Loading menu items...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-panel flex-center" style={{
          minHeight: '180px',
          flexDirection: 'column',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          textAlign: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '2rem' }}>🍲</span>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>No items match filters</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            Try raising your price limit or clearing the spice filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2" style={{ marginBottom: '40px' }}>
          {filteredProducts.map((p) => (
            <ProductCard 
              key={p.id}
              product={p}
              onAddToCart={onAddToCart}
              onClick={() => setSelectedProduct(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
