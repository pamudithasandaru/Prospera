import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

const defaultUser = {
  name: 'Guest User',
  email: 'guest@prospera.lk',
  role: 'farmer',
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
    // Load stored user or fall back to a guest session
    const currentUser = authService.getCurrentUser();
    setUser(currentUser || defaultUser);
    setLoading(false);
  }, []);

  const login = async () => {
    // Auth flow removed: always fall back to guest user
    setUser(defaultUser);
    return { user: defaultUser };
  };

  const register = async () => {
    // Registration removed: always fall back to guest user
    setUser(defaultUser);
    return { user: defaultUser };
  };

  const logout = () => {
    authService.logout();
    setUser(defaultUser);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    defaultUser,
    isAuthenticated: true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
