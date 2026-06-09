import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './index.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty container">
        <div className="cart-empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <div className="cart-header">
        <h1 className="cart-title">Shopping Cart</h1>
        <button className="clear-cart-btn" onClick={clearCart}>Clear Cart</button>
      </div>

      <div className="cart-layout">
        {/* Cart Items List */}
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="cart-item-img"
                onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='36'%3E%F0%9F%93%A6%3C/text%3E%3C/svg%3E"; }}
              />

              <div className="cart-item-info">
                <h3 className="cart-item-name">{item.name}</h3>
                <span className="cart-item-price">₹{item.price.toLocaleString()}</span>
              </div>

              {/* Quantity Controls */}
              <div className="quantity-controls">
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                >−</button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                >+</button>
              </div>

              <div className="cart-item-subtotal">
                ₹{(item.price * item.quantity).toLocaleString()}
              </div>

              <button
                className="remove-item-btn"
                onClick={() => removeFromCart(item._id)}
                title="Remove item"
              >✕</button>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-rows">
            <div className="summary-row">
              <span>Items ({cartCount})</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="free-shipping">Free</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            className="checkout-proceed-btn"
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout →
          </button>

          <Link to="/" className="continue-shopping">← Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
