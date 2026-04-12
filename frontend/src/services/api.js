/**
 * API Service - Dual Environment Support
 * Local: http://localhost:5000/api
 * Production: VITE_API_URL từ environment variable hoặc qua Vercel proxy
 */

import axios from 'axios';

// ===========================================
// API URL CONFIG
// ===========================================
const getApiUrl = () => {
  // Ưu tiên 1: VITE_API_URL (đặt trong .env hoặc Vercel Environment Variables)
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL;
    console.log('[API] Using VITE_API_URL:', url);
    return url;
  }

  // Ưu tiên 2: VITE_API_BASE_URL (alias)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Ưu tiên 3: Development - dùng localhost
  if (import.meta.env.DEV) {
    console.log('[API] Using localhost (DEV mode)');
    return 'http://localhost:5000';
  }

  // Fallback: Production - dùng relative path (cho Vercel rewrite)
  console.warn('[API] VITE_API_URL not configured, using /api');
  return '/api';
};

const API_URL = getApiUrl();
const isProduction = import.meta.env.PROD || import.meta.env.VITE_APP_MODE === 'production';
const USE_CREDENTIALS = true;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: USE_CREDENTIALS,
  timeout: 30000,
});

// ===========================================
// REQUEST INTERCEPTOR
// ===========================================
api.interceptors.request.use(
  (config) => {
    // Thêm auth token từ localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug log
    if (!isProduction) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ===========================================
// RESPONSE INTERCEPTOR
// ===========================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip redirect cho auth pages
    const isAuthPage = window.location.pathname.includes('/login') ||
                       window.location.pathname.includes('/register');

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !isAuthPage) {
      console.warn('[API] 401 - Clearing auth state');
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Log lỗi chi tiết
    if (error.response) {
      const { status, data, config } = error.response;
      console.error(`[API] Error ${status} for ${config?.method?.toUpperCase()} ${config?.url}:`, data);
    } else if (error.request) {
      console.error('[API] Network error - no response received:', error.message);

      if (!import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_BASE_URL) {
        console.error('[API] 💡 Gợi ý: Thêm VITE_API_URL vào Environment Variables');
      }
    }

    return Promise.reject(error);
  }
);

// ===========================================
// AUTH SERVICE
// ===========================================
export const authService = {
  register: async (data) => {
    const response = await api.post('/auth/register', {
      ...data,
      confirmPassword: data.confirmPassword || data.password
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (data) => {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// ===========================================
// USER SERVICE
// ===========================================
export const userService = {
  getUsers: async (page = 1, limit = 20) => {
    const response = await api.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  getRecommendedUsers: async (refresh = false) => {
    const url = refresh
      ? `/users/recommendations?refresh=${Date.now()}`
      : `/users/recommendations`;
    return (await api.get(url)).data;
  },

  getUserById: async (id) => {
    return (await api.get(`/users/${id}`)).data;
  },

  updateProfile: async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'avatar' && data[key]) {
        formData.append(key, data[key]);
      } else if (data[key] !== undefined) {
        formData.append(
          key,
          typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]
        );
      }
    });
    return (await api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },

  getMatches: async () => {
    return (await api.get('/users/matches')).data;
  },
};

// ===========================================
// MATCH SERVICE
// ===========================================
export const matchService = {
  likeUser: async (userId) => (await api.post('/match/like', { userId })).data,
  passUser: async (userId) => (await api.post('/match/pass', { userId })).data,
  superLikeUser: async (userId) => (await api.post('/match/super', { userId })).data,
  getMutualLikes: async () => (await api.get('/match/mutual')).data,
  unmatch: async (matchId) => (await api.delete(`/match/${matchId}`)).data,
  getLikes: async () => (await api.get('/match/likes')).data,
  getSwipeHistory: async () => (await api.get('/match/swipes')).data,
};

// ===========================================
// MESSAGE SERVICE
// ===========================================
export const messageService = {
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    const data = response.data?.data || response.data || {};
    return { ...response.data, conversations: data.conversations || data || [] };
  },

  getMessages: async (matchId, page = 1, limit = 50) => {
    return (await api.get(`/messages/${matchId}?page=${page}&limit=${limit}`)).data;
  },

  sendMessage: async (matchId, data) => {
    return (await api.post(`/messages/${matchId}`, data)).data;
  },

  uploadMedia: async (matchId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    return (await api.post(`/messages/${matchId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },

  markAsRead: async (matchId) => {
    return (await api.put(`/messages/${matchId}/read`)).data;
  },
};

// ===========================================
// TAGS & INTERESTS SERVICE
// ===========================================
export const tagsService = {
  getTags: async () => (await api.get('/tags')).data,
};

export const interestsService = {
  getUserInterests: async () => (await api.get('/users/interests')).data,
  updateAllInterests: async (tags) => (await api.post('/users/interests', { tags })).data,
  addInterest: async (tag) => (await api.post('/users/interests/add', { tag })).data,
  removeInterest: async (tagId) => (await api.delete(`/users/interests/${tagId}`)).data,
};

// ===========================================
// PROFILE SERVICE
// ===========================================
export const profileService = {
  getProfile: async () => (await api.get('/profile')).data,
  updateProfile: async (data) => (await api.put('/profile', data)).data,
  getProfileStats: async () => (await api.get('/profile/stats')).data,
  getV1ProfileStats: async () => (await api.get('/v1/profiles/stats')).data,
  getProfileById: async (userId) => (await api.get(`/v1/profiles/${userId}`)).data,
  getFullProfile: async (userId) => (await api.get(`/v1/profiles/${userId}/full`)).data,
};

// ===========================================
// DISCOVERY SERVICE
// ===========================================
export const discoveryService = {
  updateLocation: async (data) => (await api.post('/update-location', data)).data,
  getNearbyUsers: async (lat, lng, radius = 50000) => {
    return (await api.get('/discovery', { params: { lat, lng, radius } })).data;
  },
};

// ===========================================
// SAFETY SERVICE
// ===========================================
export const safetyService = {
  getReportReasons: async () => (await api.get('/report/reasons')).data,
  reportUser: async (targetId, reason, description) => {
    return (await api.post('/report', { targetId, reason, description })).data;
  },
  getBlockedUsers: async () => (await api.get('/block')).data,
  blockUser: async (targetId, reason) => {
    return (await api.post('/block', { targetId, reason })).data;
  },
  unblockUser: async (targetId) => (await api.delete(`/block/${targetId}`)).data,
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================
export function extractUsers(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.users)) return response.users;
  if (Array.isArray(response.data?.users)) return response.data.users;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

export function extractMatches(response) {
  if (!response) return [];
  if (Array.isArray(response.matches)) return response.matches;
  if (Array.isArray(response.data?.matches)) return response.data.matches;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

export function extractMessages(response) {
  if (!response) return [];
  if (Array.isArray(response.messages)) return response.messages;
  if (Array.isArray(response.data?.messages)) return response.data.messages;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

export function extractTags(response) {
  if (!response) return [];
  if (Array.isArray(response.tags)) return response.tags;
  if (Array.isArray(response.interests)) return response.interests;
  if (Array.isArray(response.data?.tags)) return response.data.tags;
  if (Array.isArray(response.data?.interests)) return response.data.interests;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

export default api;
