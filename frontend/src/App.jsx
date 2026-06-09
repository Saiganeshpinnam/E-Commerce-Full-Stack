import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';

// Component imports
import Header from './components/Header/index';
import Login from './components/Login/index';
import Register from './components/Register/index';
import ProductList from './components/ProductList/index';
import ProductDetails from './components/ProductDetails/index';
import Cart from './components/Cart/index';
import Checkout from './components/Checkout/index';
import Orders from './components/Orders/index';
import AdminDashboard from './components/AdminDashboard/index';

import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

// Protected Route component - redirects to login if not authenticated
const ProtectedRoute = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Admin Protected Route - redirects if not admin
const AdminRoute = ({ children, user }) => {
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check if user is already logged in (via cookie) when app loads
  // Uses /api/auth/check which always returns 200 (user or null) — no 401 noise
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/check`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.user) setUser(data.user);
      } catch {
        // Network error — just stay logged out, no console spam
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="spinner-large"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <CartProvider>
      <Router>
        <Header user={user} setUser={setUser} />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<ProductList user={user} />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register setUser={setUser} />} />
            <Route path="/products/:id" element={<ProductDetails user={user} />} />

            {/* Protected User Routes */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute user={user}>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute user={user}>
                  <Checkout user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute user={user}>
                  <Orders />
                </ProtectedRoute>
              }
            />

            {/* Admin Route */}
            <Route
              path="/admin"
              element={
                <AdminRoute user={user}>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
        </main>
      </Router>
    </CartProvider>
  );
}

export default App;
