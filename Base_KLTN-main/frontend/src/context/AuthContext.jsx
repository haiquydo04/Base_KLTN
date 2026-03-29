import { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user, token, fetchCurrentUser, logout } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      fetchCurrentUser().catch(() => {
        logout();
      });
    }
  }, [token, user, fetchCurrentUser, logout]);

  return (
    <AuthContext.Provider value={{ user, token, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
