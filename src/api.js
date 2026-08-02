const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  // Set headers
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If the body is NOT FormData, set content-type to application/json and stringify body
  let body = options.body;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    body
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (name, email, password) => request('/auth/register', { method: 'POST', body: { name, email, password } }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: profileData }),

  // Products
  getProducts: (category = 'all', search = '') => request(`/products?category=${category}&search=${encodeURIComponent(search)}`),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (formData) => request('/products', { method: 'POST', body: formData }),
  updateProduct: (id, formData) => request(`/products/${id}`, { method: 'PUT', body: formData }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Orders
  placeOrder: (orderData) => request('/orders', { method: 'POST', body: orderData }),
  getMyOrders: () => request('/orders/my-orders'),
  getAllOrders: () => request('/orders'),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: { status } }),

  // Reviews
  getReviews: (productId) => request(`/reviews/${productId}`),
  addReview: (productId, reviewData) => request(`/reviews/${productId}`, { method: 'POST', body: reviewData })
};
