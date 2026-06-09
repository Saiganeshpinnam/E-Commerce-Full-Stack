import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL;

const ProductDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError('Product not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product);
    setFeedback(true);
    setTimeout(() => setFeedback(false), 2000);
  };

  const renderStars = (rating) => {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  if (loading) return <div className="loading-state"><div className="spinner-large"></div></div>;
  if (error) return <div className="container"><div className="alert alert-error" style={{marginTop: 40}}>{error}</div></div>;

  return (
    <div className="product-details-page container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="product-details-grid">
        {/* Product Image */}
        <div className="product-img-section">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-detail-img"
            onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='400'%3E%3Crect width='500' height='400' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='60'%3E%F0%9F%93%A6%3C/text%3E%3C/svg%3E"; }}
          />
          {product.stock === 0 && <div className="oos-overlay">Out of Stock</div>}
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <span className="detail-category">{product.category}</span>
          <h1 className="detail-name">{product.name}</h1>

          <div className="detail-rating">
            <span className="stars-lg">{renderStars(product.rating)}</span>
            <span className="rating-text">{product.rating.toFixed(1)} / 5</span>
          </div>

          <div className="detail-price">₹{product.price.toLocaleString()}</div>

          <p className="detail-description">{product.description}</p>

          <div className="detail-stock">
            <span className={`stock-indicator ${product.stock > 0 ? 'in-stock' : 'out'}`}>
              {product.stock > 0 ? `✓ ${product.stock} in stock` : '✗ Out of stock'}
            </span>
          </div>

          <div className="detail-actions">
            <button
              className={`detail-cart-btn ${feedback ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0
                ? 'Out of Stock'
                : feedback
                ? '✓ Added to Cart!'
                : '🛒 Add to Cart'}
            </button>

            {user && product.stock > 0 && (
              <button className="detail-checkout-btn" onClick={() => {
                addToCart(product);
                navigate('/cart');
              }}>
                Buy Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
