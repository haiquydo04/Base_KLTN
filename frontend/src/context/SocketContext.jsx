import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SocketContext = createContext(null);

const getSocketUrl = () => {
  // Ưu tiên VITE_API_URL
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Development fallback
  if (!import.meta.env.PROD) {
    return 'http://localhost:5000';
  }

  // Production: dùng relative path (Vercel rewrite)
  return '';
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      const socketUrl = getSocketUrl();

      const socketOptions = {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        withCredentials: true, // Quan trọng cho cookie-based auth
      };

      const newSocket = io(socketUrl, socketOptions);

      newSocket.on('connect', () => {
        console.log('[Socket] Connected');
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
