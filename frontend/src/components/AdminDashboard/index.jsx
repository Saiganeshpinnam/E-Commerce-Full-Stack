import React, { useState, useEffect } from 'react';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL;

const emptyProduct = {
  name: '', description: '', price: '', imageUrl: '', category: '', stock: '', rating: '',
};

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // the product being edited
  const [formData, setFormData] = useState(emptyProduct);
  const [submitting, setSubmitting] = useState(false);
  const [restockId, setRestockId] = useState(null);
  const [restockQty, setRestockQty] = useState(0);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products`, { credentials: 'include' });
      const data = await res.json();
      setProducts(data);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders`, { credentials: 'include' });
      const data = await res.json();
      setOrders(data);
    } catch {
      setError('Failed to load orders');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const showMessage = (msg, isError = false) => {
    if (isError) { setError(msg); setSuccess(''); }
    else { setSuccess(msg); setError(''); }
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add or Update product
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isEditing = !!editProduct;
      const url = isEditing
        ? `${API_URL}/api/products/${editProduct._id}`
        : `${API_URL}/api/products`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          rating: parseFloat(formData.rating) || 0,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      showMessage(isEditing ? 'Product updated!' : 'Product added!');
      setFormData(emptyProduct);
      setShowAddForm(false);
      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      showMessage(err.message, true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Delete failed');
      showMessage('Product deleted.');
      fetchProducts();
    } catch (err) {
      showMessage(err.message, true);
    }
  };

  const handleRestock = async (id) => {
    if (!restockQty || restockQty <= 0) return;
    try {
      const product = products.find((p) => p._id === id);
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ stock: product.stock + parseInt(restockQty) }),
      });
      if (!res.ok) throw new Error('Restock failed');
      showMessage(`Restocked successfully!`);
      setRestockId(null);
      setRestockQty(0);
      fetchProducts();
    } catch (err) {
      showMessage(err.message, true);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Status update failed');
      showMessage(`Order status updated to ${status}`);
      fetchOrders();
    } catch (err) {
      showMessage(err.message, true);
    }
  };

  const startEdit = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      stock: product.stock,
      rating: product.rating,
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin-page container">
      {/* Admin Header */}
      <div className="admin-page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">Manage products, orders and inventory</p>
        </div>
        <div className="admin-stats">
          <div className="stat-chip"><strong>{products.length}</strong> Products</div>
          <div className="stat-chip"><strong>{orders.length}</strong> Orders</div>
          <div className="stat-chip out">
            <strong>{products.filter((p) => p.stock === 0).length}</strong> Out of Stock
          </div>
        </div>
      </div>

      {/* Global Messages */}
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >📦 Products</button>
        <button
          className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >📋 Orders</button>
      </div>

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <>
          {/* Add Product Button */}
          {!showAddForm && (
            <button className="admin-add-btn" onClick={() => { setShowAddForm(true); setEditProduct(null); setFormData(emptyProduct); }}>
              + Add New Product
            </button>
          )}

          {/* Product Form */}
          {showAddForm && (
            <div className="admin-form-card">
              <div className="admin-form-header">
                <h2>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button className="form-close-btn" onClick={() => { setShowAddForm(false); setEditProduct(null); }}>✕</button>
              </div>
              <form onSubmit={handleSubmitProduct} className="admin-product-form">
                <div className="admin-form-grid">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input name="name" required value={formData.name} onChange={handleFormChange} placeholder="e.g. Wireless Headphones" />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select name="category" required value={formData.category} onChange={handleFormChange}>
                      <option value="">-- Select Category --</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Books">Books</option>
                      <option value="Home & Kitchen">Home & Kitchen</option>
                      <option value="Sports">Sports</option>
                      <option value="Toys">Toys</option>
                      <option value="Beauty">Beauty</option>
                      <option value="Grocery">Grocery</option>
                      <option value="Mobiles">Mobiles</option>
                      <option value="Footwear">Footwear</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input name="price" type="number" min="0" required value={formData.price} onChange={handleFormChange} placeholder="e.g. 1999" />
                  </div>
                  <div className="form-group">
                    <label>Stock *</label>
                    <input name="stock" type="number" min="0" required value={formData.stock} onChange={handleFormChange} placeholder="e.g. 50" />
                  </div>
                  <div className="form-group">
                    <label>Rating (0-5)</label>
                    <input name="rating" type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={handleFormChange} placeholder="e.g. 4.5" />
                  </div>
                  <div className="form-group">
                    <label>Image URL</label>
                    <input name="imageUrl" value={formData.imageUrl} onChange={handleFormChange} placeholder="https://..." />
                  </div>
                  <div className="form-group admin-full-width">
                    <label>Description *</label>
                    <textarea name="description" required rows={3} value={formData.description} onChange={handleFormChange} placeholder="Product description..."></textarea>
                  </div>
                </div>
                <div className="admin-form-actions">
                  <button type="button" className="admin-cancel-btn" onClick={() => { setShowAddForm(false); setEditProduct(null); }}>Cancel</button>
                  <button type="submit" className="admin-save-btn" disabled={submitting}>
                    {submitting ? <span className="spinner"></span> : editProduct ? '💾 Update Product' : '✚ Add Product'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products Table */}
          {loading ? (
            <div className="loading-state"><div className="spinner-large"></div></div>
          ) : (
            <div className="admin-products-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="admin-product-cell">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="admin-product-thumb"
                            onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='18'%3E%F0%9F%93%A6%3C/text%3E%3C/svg%3E"; }}
                          />
                          <span className="admin-product-name">{product.name}</span>
                        </div>
                      </td>
                      <td><span className="admin-category-tag">{product.category}</span></td>
                      <td className="admin-price">₹{product.price.toLocaleString()}</td>
                      <td>
                        {product.stock === 0 ? (
                          <span className="admin-oos-tag">Out of Stock</span>
                        ) : (
                          <span className={`admin-stock-tag ${product.stock < 5 ? 'low' : ''}`}>{product.stock}</span>
                        )}
                      </td>
                      <td>⭐ {product.rating.toFixed(1)}</td>
                      <td>
                        <div className="admin-actions-cell">
                          <button className="admin-edit-btn" onClick={() => startEdit(product)} title="Edit">✏️ Edit</button>

                          {/* Restock Inline */}
                          {restockId === product._id ? (
                            <div className="restock-inline">
                              <input
                                type="number"
                                min="1"
                                value={restockQty}
                                onChange={(e) => setRestockQty(e.target.value)}
                                className="restock-input"
                                placeholder="Qty"
                              />
                              <button className="admin-restock-confirm-btn" onClick={() => handleRestock(product._id)}>Add</button>
                              <button className="admin-cancel-btn-sm" onClick={() => setRestockId(null)}>✕</button>
                            </div>
                          ) : (
                            <button className="admin-restock-btn" onClick={() => setRestockId(product._id)} title="Restock">📦 Restock</button>
                          )}

                          <button className="admin-delete-btn" onClick={() => handleDeleteProduct(product._id)} title="Delete">🗑️ Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="admin-orders">
          {orders.length === 0 ? (
            <p className="no-orders">No orders yet.</p>
          ) : (
            <div className="admin-orders-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="order-id-admin">#{order._id.slice(-8).toUpperCase()}</td>
                      <td>{order.user?.name || 'N/A'}<br /><small>{order.user?.email}</small></td>
                      <td>{order.orderItems.length} item(s)</td>
                      <td>₹{order.totalAmount.toLocaleString()}</td>
                      <td>
                        <span className={`order-status-badge status-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="filter-select"
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        >
                          <option value="Placed">Placed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
