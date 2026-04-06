import { create } from 'zustand';
import { adminAuthService } from '../services/api';

export const useAdminAuthStore = create((set) => ({
  adminUser: JSON.parse(localStorage.getItem('adminUser')) || null,
  adminToken: localStorage.getItem('adminToken') || null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminAuthService.login(credentials);
      set({ adminUser: data.user || data.admin, adminToken: data.token, isLoading: false });
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Đăng nhập thất bại', 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await adminAuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      set({ adminUser: null, adminToken: null, isLoading: false });
    }
  },

  fetchCurrentAdmin: async () => {
    set({ isLoading: true });
    try {
      const data = await adminAuthService.getCurrentAdmin();
      set({ adminUser: data.user || data.admin, isLoading: false });
      localStorage.setItem('adminUser', JSON.stringify(data.user || data.admin));
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
