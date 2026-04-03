import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { addItemToCart, updateCartItem, removeCartItem, clearBackendCart, getCart } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // start cart using 'estore_cart' key
  const [cartItems, setCartItems] = useState(() => {
    // remove old 'cart' key
    localStorage.removeItem('cart');

    const saved = localStorage.getItem('estore_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // sync backend if logged in
  useEffect(() => {
    if (isAuthenticated) {
      const fetchCart = async () => {
        try {
          const res = await getCart();
          const backendItems = res.data || [];

          // move guest items to user account
          if (cartItems.length > 0 && backendItems.length === 0) {
              console.log("Syncing guest cart to backend database...");
              for (const item of cartItems) {
                  // handle id vs productId
                  const pId = item.productId || item.id; 
                  await addItemToCart(pId, item.quantity);
              }
              // refresh cart from api
              const updatedRes = await getCart();
              setCartItems(updatedRes.data);
          } else if (backendItems.length > 0) {
              // backend cart wins for logged in users
              setCartItems(backendItems);
          }
        } catch (err) {
          console.error("Cart retrieval failed", err);
        }
      };
      fetchCart();
    }
  }, [isAuthenticated]);

  // save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('estore_cart', JSON.stringify(cartItems));
    console.log('Cart State Debug [estore_cart]:', cartItems);
  }, [cartItems]);

  const addToCart = async (product) => {
    console.log('Adding to Cart:', product.name);
    
    if (!isAuthenticated) {
        setCartItems(prev => {
            const existing = prev.find(i => i.productId === product.id || i.id === product.id);
            if (existing) {
                if (existing.quantity + 1 > product.stock) {
                    toast.error('Inventory limit reached');
                    return prev;
                }
                return prev.map(i => (i.productId === product.id || i.id === product.id) 
                    ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...product, productId: product.id, quantity: 1 }];
        });
        return;
    }

    try {
      const res = await addItemToCart(product.id, 1);
      setCartItems(prev => {
        const index = prev.findIndex(item => item.productId === product.id);
        if (index > -1) {
            const newCart = [...prev];
            newCart[index] = res.data;
            return newCart;
        }
        return [...prev, res.data];
      });
    } catch (err) {
      const message = err.response?.data?.message || 'Transaction rejected';
      toast.error(message);
    }
  };

  const updateQuantity = async (itemId, newQuantity, availableStock) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    if (!isAuthenticated) {
        if (newQuantity > availableStock) {
            toast.error('Requested quantity exceeds available inventory.');
            return;
        }
        setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i));
        return;
    }

    try {
      const res = await updateCartItem(itemId, newQuantity);
      setCartItems(prev => prev.map(i => i.id === itemId ? res.data : i));
    } catch (err) {
      const message = err.response?.data?.message || 'Modification failed';
      toast.error(message);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) {
        setCartItems(prev => prev.filter(i => i.id !== itemId));
        return;
    }
    try {
      await removeCartItem(itemId);
      setCartItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      console.error("Removal failed", err);
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
        try {
            await clearBackendCart();
        } catch (err) {
            console.error("Clear failed", err);
        }
    }
    setCartItems([]);
  };

  const getCartTotal = () => {
    const total = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    return isNaN(total) ? 0 : total;
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCart,
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
