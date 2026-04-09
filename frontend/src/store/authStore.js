import { create } from 'zustand';
import { authService } from '../services/api';

// Safe localStorage parser with error handling
const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    // Invalid JSON in localStorage - clear it to prevent crashes
    localStorage.removeItem('user');
    return null;
  }
};

const getStoredToken = () => {
  try {
    return localStorage.getItem('token') || null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  isLoading: false,
  error: null,

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user });
  },
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(credentials);
      
      if (data.user?.isLocked || data.user?.status === 'banned') {
        const banMsg = 'Tài khoản của bạn đã bị khóa bởi Quản trị viên.';
        set({ error: banMsg, isLoading: false });
        throw new Error(banMsg);
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      const errMsg = error.message === 'Tài khoản của bạn đã bị khóa bởi Quản trị viên.' 
        ? error.message 
        : (error.response?.data?.message || 'Đăng nhập thất bại');
      set({ 
        error: errMsg, 
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(userData);
      
      // Ensure user and token are set
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isLoading: false });
    }
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const data = await authService.getCurrentUser();
      if (data.user?.isLocked || data.user?.status === 'banned') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isLoading: false });
        throw new Error('Tài khoản của bạn đã bị khóa bởi Quản trị viên.');
      }

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      set({ user: data.user, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
