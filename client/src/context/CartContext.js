import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

/**
 * The marketplace cart, shared so the header badge, the cart page and the
 * checkout never disagree.
 *
 * The server owns the cart — this only mirrors it. Every mutation re-reads
 * rather than guessing at the new state, because the server also enforces
 * stock and can legitimately return something other than what was asked for.
 */
const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside a CartProvider');
  return ctx;
};

export const CartProvider = ({ children }) => {
  const { isGuest } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (isGuest) {
      setItems([]);
      return [];
    }
    setLoading(true);
    try {
      const res = await api.get('/marketplace/cart');
      const rows = res.data.data || [];
      setItems(rows);
      return rows;
    } catch (err) {
      console.error('Load cart error:', err);
      setItems([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  // Signing in or out swaps whose cart this is.
  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (productId, quantity = 1) => {
      await api.post('/marketplace/cart', { productId, quantity });
      await refresh();
    },
    [refresh]
  );

  const setQuantity = useCallback(
    async (productId, quantity) => {
      if (quantity < 1) return;
      await api.patch(`/marketplace/cart/${productId}`, { quantity });
      await refresh();
    },
    [refresh]
  );

  const removeItem = useCallback(
    async (productId) => {
      await api.delete(`/marketplace/cart/${productId}`);
      await refresh();
    },
    [refresh]
  );

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const subtotal = items.reduce((n, i) => n + Number(i.product?.price?.amount || 0) * i.quantity, 0);
    return { items, count, subtotal, loading, refresh, addItem, setQuantity, removeItem };
  }, [items, loading, refresh, addItem, setQuantity, removeItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
