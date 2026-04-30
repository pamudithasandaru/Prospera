/**
 * client/src/context/SocketContext.js
 * Provides the Socket.IO instance throughout the React tree.
 * Connects on login, disconnects on logout.
 */
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { connectSocket, disconnectSocket } from '../services/socketService';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      if (!token) return;

      const s = connectSocket(token);
      socketRef.current = s;
      setSocket(s);

      // Global real-time notification listener
      s.on('notification:new', (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((c) => c + 1);
      });

      return () => {
        s.off('notification:new');
      };
    } else {
      disconnectSocket();
      socketRef.current = null;
      setSocket(null);
    }
  }, [isAuthenticated, user]);

  const clearUnread = () => setUnreadCount(0);

  const value = {
    socket,
    notifications,
    setNotifications,
    unreadCount,
    clearUnread,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
