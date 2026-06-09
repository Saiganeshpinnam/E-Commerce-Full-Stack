import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL;

const ProductList = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [minRating, setMinRating] = useState('');
  const [category, setCategory] = useState('');
  const { addToCart, cartItems } = useCart();
  const [feedback, setFeedback] = useState({});

  // Fetch products whenever filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        // Build query string from filters
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (sort) params.append('sort', sort);
        if (minRating) params.append('minRating', minRating);
        if (category) params.append('category', category);

        const res = await fetch(`${API_URL}/api/products?${params}`, {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search, sort, minRating, category]);

  const handleAddToCart = (product) => {
    addToCart(product);
    setFeedback((prev) => ({ ...prev, [product._id]: true }));
    setTimeout(() => setFeedback((prev) => ({ ...prev, [product._id]: false })), 1500);
  };

  // Check if item is already in cart
  const isInCart = (id) => cartItems.some((item) => item._id === id);

  // Star rating display helper
  const renderStars = (rating) => {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  return (
    <div className="product-list-page">
      {/* Hero Section */}
      <div className="product-hero">
        <h1>Discover Our Products</h1>
        <p>Find everything you need, all in one place</p>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="filter-select">
            <option value="">Sort: Default</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="rating_desc">Rating: Top Rated</option>
          </select>

          <select value={category} onChange={(e) => setCategory(e.target.value)} className="filter-select">
            <option value="">All Categories</option>
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
          </select>

          <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="filter-select">
            <option value="">Rating: All</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
        </div>
      </div>

      <div className="container">
        {loading && (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading products...</p>
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && products.length === 0 && (
          <div className="empty-state">
            <p>😔 No products found matching your search.</p>
          </div>
        )}

        {!loading && !error && (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <Link to={`/products/${product._id}`} className="product-card-img-link">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="product-img"
                    onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='40'%3E%F0%9F%93%A6%3C/text%3E%3C/svg%3E"; }}
                  />
                  {product.stock === 0 && (
                    <span className="out-of-stock-badge">Out of Stock</span>
                  )}
                </Link>

                <div className="product-card-body">
                  <span className="product-category">{product.category}</span>
                  <Link to={`/products/${product._id}`} className="product-name-link">
                    <h3 className="product-name">{product.name}</h3>
                  </Link>

                  <div className="product-rating">
                    <span className="stars">{renderStars(product.rating)}</span>
                    <span className="rating-value">({product.rating.toFixed(1)})</span>
                  </div>

                  <div className="product-footer">
                    <span className="product-price">₹{product.price.toLocaleString()}</span>
                    <button
                      className={`add-cart-btn ${feedback[product._id] ? 'added' : ''}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0
                        ? 'Out of Stock'
                        : feedback[product._id]
                        ? '✓ Added!'
                        : isInCart(product._id)
                        ? '+ Add More'
                        : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
