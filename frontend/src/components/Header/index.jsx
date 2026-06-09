import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL;

const Header = ({ user, setUser }) => {
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <span className="logo-icon">🛍️</span>
          <span className="logo-text">EMart</span>
        </Link>

        {/* Navigation */}
        <nav className="header-nav">
          <Link to="/" className="nav-link">Products</Link>
          {user && <Link to="/orders" className="nav-link">My Orders</Link>}
          {user && user.role === 'admin' && (
            <Link to="/admin" className="nav-link nav-link--admin">Admin</Link>
          )}
        </nav>

        {/* Right section */}
        <div className="header-actions">
          {user ? (
            <>
              <span className="header-greeting">Hi, {user.name.split(' ')[0]}</span>
              {/* Cart icon with item count badge */}
              <Link to="/cart" className="cart-btn">
                <span className="cart-icon">🛒</span>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-header btn-header--outline">Login</Link>
              <Link to="/register" className="btn-header btn-header--primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
