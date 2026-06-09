import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL;
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_RW7FFAnNK5CDJf';

const Checkout = ({ user }) => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
  });

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    // Validate address fields
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
      setError('Please fill in all shipping details');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Step 1: Create Razorpay order on the backend
      const orderRes = await fetch(`${API_URL}/api/orders/create-razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ totalAmount: cartTotal }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Step 2: Open Razorpay checkout popup
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'EMart',
        description: 'Order Payment',
        order_id: orderData.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#6366f1' },
        // On successful payment
        handler: async (response) => {
          try {
            // Step 3: Verify payment signature on backend and create order in DB
            const verifyRes = await fetch(`${API_URL}/api/orders/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderItems: cartItems.map((item) => ({
                  product: item._id,
                  name: item.name,
                  imageUrl: item.imageUrl,
                  price: item.price,
                  quantity: item.quantity,
                })),
                shippingAddress,
                totalAmount: cartTotal,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(verifyData.message || 'Payment verification failed');
            }

            // Success! Clear cart and go to orders page
            clearCart();
            navigate('/orders');
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      // Load Razorpay script dynamically
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        script.onerror = () => {
          setError('Failed to load payment gateway. Please try again.');
          setLoading(false);
        };
        document.body.appendChild(script);
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty container">
        <h2>🛒 No items to checkout</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">Go Shopping</button>
      </div>
    );
  }

  return (
    <div className="checkout-page container">
      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-layout">
        {/* Shipping Form */}
        <div className="checkout-form-section">
          <div className="checkout-card">
            <h2>📦 Shipping Details</h2>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="checkout-form">
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="123 Main Street"
                  value={shippingAddress.address}
                  onChange={handleAddressChange}
                />
              </div>
              <div className="checkout-form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Mumbai"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="400001"
                    value={shippingAddress.postalCode}
                    onChange={handleAddressChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleAddressChange}
                />
              </div>
            </div>
          </div>

          {/* Items Summary for Checkout */}
          <div className="checkout-card checkout-items-card">
            <h2>🛍️ Order Items ({cartItems.length})</h2>
            <div className="checkout-items">
              {cartItems.map((item) => (
                <div key={item._id} className="checkout-item">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="checkout-item-img"
                    onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='26'%3E%F0%9F%93%A6%3C/text%3E%3C/svg%3E"; }}
                  />
                  <div className="checkout-item-info">
                    <p className="checkout-item-name">{item.name}</p>
                    <p className="checkout-item-qty">Qty: {item.quantity}</p>
                  </div>
                  <div className="checkout-item-price">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="checkout-summary">
          <div className="checkout-card">
            <h2>💳 Payment Summary</h2>
            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-shipping">FREE</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row summary-total">
                <span>Total Amount</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              className="pay-btn"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner"></span> Processing...</>
              ) : (
                `Pay ₹${cartTotal.toLocaleString()} with Razorpay`
              )}
            </button>
            <p className="pay-note">🔒 Secured by Razorpay</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
