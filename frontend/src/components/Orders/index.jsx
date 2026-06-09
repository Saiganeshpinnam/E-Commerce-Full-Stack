import React, { useState, useEffect } from 'react';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL;

// Status badge color helper
const statusColors = {
  Placed: 'status-placed',
  Shipped: 'status-shipped',
  Delivered: 'status-delivered',
  Cancelled: 'status-cancelled',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/myorders`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="loading-state container">
        <div className="spinner-large"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page container">
      <h1 className="orders-title">My Orders</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && orders.length === 0 && (
        <div className="orders-empty">
          <div className="orders-empty-icon">📦</div>
          <h2>No orders yet</h2>
          <p>Your order history will appear here after your first purchase.</p>
        </div>
      )}

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <div className="order-id">
                <span className="order-label">Order ID</span>
                <span className="order-id-value">#{order._id.slice(-8).toUpperCase()}</span>
              </div>

              <div className="order-meta">
                <div className="order-date">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </div>
                <span className={`order-status ${statusColors[order.status] || ''}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="order-items-preview">
              {order.orderItems.slice(0, 3).map((item, idx) => (
                <div key={idx} className="order-item-brief">
                  <img
                    src={item.imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='22'%3E%F0%9F%93%A6%3C/text%3E%3C/svg%3E"}
                    alt={item.name}
                    className="order-item-thumb"
                    onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='22'%3E%F0%9F%93%A6%3C/text%3E%3C/svg%3E"; }}
                  />
                  <div className="order-item-brief-info">
                    <p className="order-item-brief-name">{item.name}</p>
                    <p className="order-item-brief-qty">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {order.orderItems.length > 3 && (
                <p className="more-items">+{order.orderItems.length - 3} more items</p>
              )}
            </div>

            <div className="order-card-footer">
              <div className="order-total">
                Total: <strong>₹{order.totalAmount.toLocaleString()}</strong>
              </div>

              {/* Expandable shipping details */}
              <button
                className="order-details-btn"
                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
              >
                {expandedOrder === order._id ? 'Hide Details ↑' : 'View Details ↓'}
              </button>
            </div>

            {/* Expanded details */}
            {expandedOrder === order._id && (
              <div className="order-expanded">
                <h4>📍 Shipping Address</h4>
                <p>{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                <p>{order.shippingAddress?.postalCode}, {order.shippingAddress?.country}</p>

                <h4 style={{ marginTop: 16 }}>💳 Payment</h4>
                <p>Payment ID: {order.paymentDetails?.razorpayPaymentId || 'N/A'}</p>
                <p>Paid: {order.isPaid ? '✅ Yes' : '❌ No'}</p>

                {/* Status Timeline */}
                <h4 style={{ marginTop: 16 }}>📊 Order Timeline</h4>
                <div className="status-timeline">
                  {['Placed', 'Shipped', 'Delivered'].map((step) => {
                    const statuses = ['Placed', 'Shipped', 'Delivered'];
                    const currentIdx = statuses.indexOf(order.status);
                    const stepIdx = statuses.indexOf(step);
                    const isCompleted = stepIdx <= currentIdx;
                    return (
                      <div key={step} className={`timeline-step ${isCompleted ? 'completed' : ''}`}>
                        <div className="timeline-dot"></div>
                        <span>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
