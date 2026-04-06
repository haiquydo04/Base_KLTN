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

  setUser: (user) => set({ user }),
  
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
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(userData);
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
    } catch (error) {
      console.error('Logout error:', error);
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
      set({ user: data.user, isLoading: false });
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
