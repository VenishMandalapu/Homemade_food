import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Package, DollarSign, ShoppingBag, AlertTriangle, 
  PlusCircle, Trash2, Edit3, X, Check, ArrowRight
} from 'lucide-react';

export default function AdminDashboard({ showToast }) {
  const [activeTab, setActiveTab] = useState('orders'); // orders, products
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Form states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('pickle');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formSpiceLevel, setFormSpiceLevel] = useState(0);
  const [formShelfLife, setFormShelfLife] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageFile, setFormImageFile] = useState(null);
  const [formImageUrl, setFormImageUrl] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await api.getAllOrders();
      setOrders(data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch admin orders.', 'error');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await api.getProducts('all', '');
      setProducts(data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch admin products.', 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showToast(`Order #${orderId} status updated: ${newStatus}`, 'success');
      fetchOrders();
    } catch (err) {
      showToast(err.message || 'Failed to update order status.', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product from catalog?')) return;
    try {
      await api.deleteProduct(id);
      showToast('Product deleted.', 'success');
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Failed to delete.', 'error');
    }
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(p.price);
    setFormStock(p.stock);
    setFormSpiceLevel(p.spice_level);
    setFormShelfLife(p.shelf_life);
    setFormDescription(p.description);
    setFormImageUrl(p.image_url);
    setFormImageFile(null);
    setShowProductModal(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('pickle');
    setFormPrice('');
    setFormStock('');
    setFormSpiceLevel(0);
    setFormShelfLife('');
    setFormDescription('');
    setFormImageUrl('');
    setFormImageFile(null);
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formPrice || !formCategory) {
      return showToast('Complete required fields.', 'error');
    }

    try {
      const formData = new FormData();
      formData.append('name', formName);
      formData.append('category', formCategory);
      formData.append('price', formPrice);
      formData.append('stock', formStock);
      formData.append('spice_level', formSpiceLevel);
      formData.append('shelf_life', formShelfLife);
      formData.append('description', formDescription);
      
      if (formImageFile) {
        formData.append('image', formImageFile);
      } else {
        formData.append('image_url', formImageUrl);
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
        showToast('Product saved.', 'success');
      } else {
        await api.createProduct(formData);
        showToast('Product added.', 'success');
      }

      setShowProductModal(false);
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Product save failed.', 'error');
    }
  };

  const totalSales = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const lowStockCount = products.filter(p => p.stock <= 5).length;

  return (
    <div className="container" style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '1.4rem', marginBottom: '16px', fontFamily: "'Playfair Display', serif" }}>
        Admin Panel
      </h2>

      {/* Metrics Row (Compact Grid for Mobile) */}
      <div className="grid grid-cols-2" style={{ gap: '10px', marginBottom: '20px' }}>
        {/* Rev */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '6px', backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)', borderRadius: '8px' }}>
            <DollarSign size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Revenue</div>
            <strong style={{ fontSize: '0.9rem' }}>₹{totalSales.toFixed(0)}</strong>
          </div>
        </div>

        {/* Count */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '6px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '8px' }}>
            <ShoppingBag size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Total Orders</div>
            <strong style={{ fontSize: '0.9rem' }}>{orders.length}</strong>
          </div>
        </div>

        {/* Pending */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '6px', backgroundColor: 'rgba(229, 154, 24, 0.08)', color: 'var(--accent)', borderRadius: '8px' }}>
            <AlertTriangle size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Pending</div>
            <strong style={{ fontSize: '0.9rem' }}>{pendingOrders}</strong>
          </div>
        </div>

        {/* Low Stock */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '6px', backgroundColor: 'rgba(194, 41, 41, 0.08)', color: '#c22929', borderRadius: '8px' }}>
            <Package size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Low Stock</div>
            <strong style={{ fontSize: '0.9rem' }}>{lowStockCount}</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('orders')}
          className="btn"
          style={{
            padding: '6px 12px',
            fontSize: '0.78rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: activeTab === 'orders' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'orders' ? 'white' : 'var(--text-main)',
            border: `1px solid ${activeTab === 'orders' ? 'var(--primary)' : 'var(--border-color)'}`
          }}
        >
          Orders List
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className="btn"
          style={{
            padding: '6px 12px',
            fontSize: '0.78rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: activeTab === 'products' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'products' ? 'white' : 'var(--text-main)',
            border: `1px solid ${activeTab === 'products' ? 'var(--primary)' : 'var(--border-color)'}`
          }}
        >
          Products List
        </button>

        {activeTab === 'products' && (
          <button 
            onClick={openAddModal}
            className="btn btn-primary"
            style={{ marginLeft: 'auto', padding: '6px 10px', borderRadius: '8px', fontSize: '0.72rem', display: 'flex', gap: '4px' }}
          >
            <PlusCircle size={14} /> Add
          </button>
        )}
      </div>

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loadingOrders ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No orders.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="glass-panel" style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.82rem' }}>#PF-{order.id}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                
                <div style={{ fontSize: '0.78rem', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 600 }}>{order.customer_name} ({order.customer_phone})</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{order.delivery_address}</div>
                </div>

                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '6px', marginBottom: '8px' }}>
                  {order.items && order.items.map((it, idx) => (
                    <div key={idx} style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      • {it.product_name} <strong>(x{it.quantity})</strong>
                      {it.custom_spice && (
                        <span style={{ color: 'var(--primary)', fontWeight: 600, marginLeft: '4px' }}>[{it.custom_spice}]</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex-between" style={{ borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '8px' }}>
                  <strong>₹{parseFloat(order.total_amount).toFixed(0)}</strong>
                  
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="form-select"
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.72rem',
                      width: '110px',
                      height: '30px'
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: PRODUCTS */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loadingProducts ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Loading products...</p>
          ) : products.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No products.</p>
          ) : (
            products.map((p) => (
              <div key={p.id} className="glass-panel" style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img 
                  src={p.image_url} 
                  alt={p.name} 
                  style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=100';
                  }}
                />
                
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h4>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    ₹{parseFloat(p.price).toFixed(0)} • Stock: <span style={{ color: p.stock <= 5 ? '#c22929' : 'inherit', fontWeight: p.stock <= 5 ? 700 : 'normal' }}>{p.stock} units</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button 
                    onClick={() => openEditModal(p)}
                    className="btn btn-outline" 
                    style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.68rem', height: '24px' }}
                  >
                    <Edit3 size={10} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(p.id)}
                    className="btn" 
                    style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.68rem', backgroundColor: 'rgba(194, 41, 41, 0.05)', color: '#c22929', height: '24px' }}
                  >
                    <Trash2 size={10} /> Del
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* PRODUCT FORM MODAL (Bottom Sheet) */}
      {showProductModal && (
        <div className="bottom-sheet-overlay" onClick={() => setShowProductModal(false)}>
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <span className="bottom-sheet-handle" onClick={() => setShowProductModal(false)}></span>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontFamily: "'Playfair Display', serif" }}>
                {editingProduct ? 'Edit Catalog Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} style={{ padding: '4px', backgroundColor: 'var(--bg-input)', borderRadius: '50%' }}>
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formName} 
                  onChange={e => setFormName(e.target.value)} 
                  required 
                />
              </div>

              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select 
                    className="form-select" 
                    value={formCategory} 
                    onChange={e => setFormCategory(e.target.value)}
                  >
                    <option value="pickle">Pickle</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price (INR ₹) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-input" 
                    value={formPrice} 
                    onChange={e => setFormPrice(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label className="form-label">Stock *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={formStock} 
                    onChange={e => setFormStock(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Spice Level (0-3)</label>
                  <select 
                    className="form-select" 
                    value={formSpiceLevel} 
                    onChange={e => setFormSpiceLevel(parseInt(e.target.value))}
                  >
                    <option value="0">0 (Sweet)</option>
                    <option value="1">1 (Mild)</option>
                    <option value="2">2 (Medium)</option>
                    <option value="3">3 (Extra Hot 🌶️)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Shelf Life</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formShelfLife} 
                  onChange={e => setFormShelfLife(e.target.value)} 
                  placeholder="e.g. 6 Months"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  rows="2" 
                  value={formDescription} 
                  onChange={e => setFormDescription(e.target.value)}
                  style={{ resize: 'none' }}
                ></textarea>
              </div>

              {/* Image upload */}
              <div className="form-group" style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-main)', fontSize: '0.8rem' }}>
                <label className="form-label" style={{ marginBottom: '8px' }}>Product Image</label>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Upload Image:</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setFormImageFile(e.target.files[0])}
                  />
                </div>
                <div style={{ fontSize: '0.7rem', textAlign: 'center', color: 'var(--text-muted)', margin: '6px 0' }}>— OR —</div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Image URL:</span>
                  <input 
                    type="text" 
                    className="form-input"
                    value={formImageUrl} 
                    onChange={e => setFormImageUrl(e.target.value)} 
                    disabled={!!formImageFile}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px' }}
              >
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
