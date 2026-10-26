import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import authService from '../services/authService';
import { GUEST_ROLE } from '../config/access';

const AuthContext = createContext(null);

/**
 * Stand-in identity for signed-out visitors.
 *
 * It used to carry `role: 'farmer'`, which meant the Navbar rendered the full
 * farmer menu to anyone who happened to be logged out. GUEST_ROLE is not a
 * real account role, so it matches only routes marked PUBLIC.
 */
const guestUser = {
  name: 'Guest',
  email: '',
  role: GUEST_ROLE,
  language: 'EN',
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // A stored user is only trustworthy alongside a stored token: clearing the
    // token (logout, 401 eviction) must not leave a ghost session behind.
    const currentUser = authService.isAuthenticated() ? authService.getCurrentUser() : null;
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = authService.isAuthenticated() && user !== null;

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
      guestUser,
      isAuthenticated,
      // The identity to render and to gate on — never null, so callers do not
      // need a logged-out branch of their own.
      currentUser: isAuthenticated ? user : guestUser,
      role: isAuthenticated ? user.role : GUEST_ROLE,
      isGuest: !isAuthenticated,
    }),
    [user, loading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
