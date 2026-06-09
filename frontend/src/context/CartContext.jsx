import React, { createContext, useContext, useState, useMemo } from 'react';

// Create the Cart Context
const CartContext = createContext();

// Custom hook for easy access to the cart context
export const useCart = () => useContext(CartContext);

// Cart Provider component to wrap the app
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Add a product to the cart or increase quantity if it already exists
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);
      if (existingItem) {
        // Increase quantity if already in cart (up to stock limit)
        return prevItems.map((item) =>
          item._id === product._id && item.quantity < item.stock
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Add to cart with quantity 1
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // Remove a product from the cart entirely
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
  };

  // Update the quantity of a specific cart item
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (item._id === productId ? { ...item, quantity } : item))
    );
  };

  // Clear the entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Memoized cart computations - only recalculate when cartItems changes
  const cartTotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems]
  );

  // Unique product count (not total quantity)
  const cartCount = useMemo(() => cartItems.length, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
