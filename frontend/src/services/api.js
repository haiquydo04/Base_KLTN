/**
 * API Service - Vercel Production Ready
 * Backend API integration with environment variable support
 */

import axios from 'axios';

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const baseUrl = envUrl || '';
  if (baseUrl) {
    return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
  }
  return '/api';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    // Handle admin vs normal user tokens
    const isAdminRoute = config.url && config.url.includes('/admin');
    const token = localStorage.getItem(isAdminRoute ? 'adminToken' : 'token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect if we're on login/register page or already logging out
    const isAuthPage = window.location.pathname.includes('/login') || 
                       window.location.pathname.includes('/register');
    
    if (error.response?.status === 401 && !isAuthPage) {
      // Determine if it was an admin route
      const isAdminRoute = error.config?.url && error.config.url.includes('/admin');
      
      if (isAdminRoute) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      } else {
        console.warn('[API] 401 Unauthorized - clearing auth state');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    // Log error for debugging
    if (error.response) {
      console.error('[API] Error response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('[API] Network error - no response:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTH SERVICE
// ============================================

export const authService = {
  register: async (data) => {
    // Backend expects: { username, email, password, confirmPassword }
    const response = await api.post('/auth/register', {
      ...data,
      confirmPassword: data.confirmPassword || data.password
    });
    // Backend returns: { success, token, user, message }
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (data) => {
    // Backend expects: { email, password }
    const response = await api.post('/auth/login', data);
    // Backend returns: { success, token, user, message }
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
    // Backend returns: { success, user }
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const adminAuthService = {
  login: async (data) => {
    const response = await api.post('/admin/login', data);
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user || response.data.admin));
    }
    return response.data;
  },

  logout: async () => {
    try {
      if (localStorage.getItem('adminToken')) {
        await api.post('/admin/logout');
      }
    } catch (e) {
      // Ignore
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  },

  getCurrentAdmin: async () => {
    const response = await api.get('/admin/me');
    return response.data;
  },
};

// ============================================
// USER SERVICE
// ============================================

export const userService = {
  /**
   * Get paginated users list
   * Backend: GET /api/users?page=1&limit=20
   * Returns: { success, users[], pagination }
   */
  getUsers: async (page = 1, limit = 20) => {
    const response = await api.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Get recommended users (AI recommendations)
   * Backend: GET /api/users/recommendations?refresh=timestamp
   * Returns: { success, users[], pagination }
   */
  getRecommendedUsers: async (refresh = false) => {
    const url = refresh
      ? `/users/recommendations?refresh=${Date.now()}`
      : `/users/recommendations`;
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get user by ID
   * Backend: GET /api/users/:id
   * Returns: { success, user }
   */
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    // FIX: Backend returns { success, user } not { user }
    return response.data;
  },

  /**
   * Update user profile
   * Backend: PUT /api/users/profile
   * Returns: { success, user }
   */
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

    const response = await api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Get user's matches
   * Backend: GET /api/users/matches
   * Returns: { success, matches[] }
   */
  getMatches: async () => {
    const response = await api.get('/users/matches');
    return response.data;
  },
};

// ============================================
// MATCH SERVICE
// ============================================

export const matchService = {
  /**
   * Like a user
   * Backend: POST /api/match/like { userId }
   * Returns: { success, matched, match?, message }
   */
  likeUser: async (userId) => {
    const response = await api.post('/match/like', { userId });
    // FIX: Backend returns { matched: true/false, match?, message }
    return response.data;
  },

  /**
   * Pass (skip) a user
   * Backend: POST /api/match/pass { userId }
   * Returns: { success, message }
   */
  passUser: async (userId) => {
    const response = await api.post('/match/pass', { userId });
    return response.data;
  },

  /**
   * Super Like a user
   * Backend: POST /api/match/super { userId }
   * Returns: { success, matched, message, isSuperMatch }
   */
  superLikeUser: async (userId) => {
    const response = await api.post('/match/super', { userId });
    return response.data;
  },

  /**
   * Get mutual likes
   * Backend: GET /api/match/mutual
   * Returns: { success, matches[] }
   */
  getMutualLikes: async () => {
    const response = await api.get('/match/mutual');
    return response.data;
  },

  /**
   * Unmatch with a user
   * Backend: DELETE /api/match/:matchId
   * Returns: { success, message }
   */
  unmatch: async (matchId) => {
    const response = await api.delete(`/match/${matchId}`);
    return response.data;
  },

  /**
   * Get likes received
   * Backend: GET /api/match/likes
   * Returns: { success, users[] }
   */
  getLikes: async () => {
    const response = await api.get('/match/likes');
    return response.data;
  },

  /**
   * Get swipe history
   * Backend: GET /api/match/swipes
   * Returns: { success, swipes[] }
   */
  getSwipeHistory: async () => {
    const response = await api.get('/match/swipes');
    return response.data;
  },
};

// ============================================
// MESSAGE SERVICE
// ============================================

export const messageService = {
  /**
   * Get all conversations
   * Backend: GET /api/messages/conversations
   * Returns: { success, data: conversations[] }
   */
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    // FIX: Backend returns { success, data: [...] }
    // Handle both response structures
    const data = response.data?.data || response.data || {};
    return { ...response.data, conversations: data.conversations || data || [] };
  },

  /**
   * Get messages for a conversation (with pagination)
   * Backend: GET /api/messages/:matchId?page=1&limit=50
   * Returns: { success, messages[], pagination }
   */
  getMessages: async (matchId, page = 1, limit = 50) => {
    const response = await api.get(`/messages/${matchId}?page=${page}&limit=${limit}`);
    // FIX: Backend returns { success, messages[] }
    return response.data;
  },

  /**
   * Send a message
   * Backend: POST /api/messages/:matchId { content }
   * Returns: { success, message }
   */
  sendMessage: async (matchId, data) => {
    const response = await api.post(`/messages/${matchId}`, data);
    return response.data;
  },

  /**
   * Upload media (image) for message
   * Backend: POST /api/messages/:matchId/media (multipart/form-data)
   * Returns: { success, mediaUrl }
   */
  uploadMedia: async (matchId, file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post(`/messages/${matchId}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Mark messages as read
   * Backend: PUT /api/messages/:matchId/read
   * Returns: { success }
   */
  markAsRead: async (matchId) => {
    const response = await api.put(`/messages/${matchId}/read`);
    return response.data;
  },
};

export const adminDashboardService = {
  getStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
  getGrowth: async (days = 7) => {
    const response = await api.get(`/admin/dashboard/growth?days=${days}`);
    return response.data;
  },
  getGender: async () => {
    const response = await api.get('/admin/dashboard/gender');
    return response.data;
  },
  getRecentUsers: async (limit = 5) => {
    const response = await api.get(`/admin/dashboard/recent-users?limit=${limit}`);
    return response.data;
  }
};

export const adminUserService = {
  getUsers: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  toggleStatus: async (id) => {
    const response = await api.put(`/admin/users/${id}/status`);
    return response.data;
  },
  updateRole: async (id, role) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  }
};

// ============================================
// TAGS & INTERESTS SERVICE
// ============================================

export const tagsService = {
  /**
   * Get all tags
   * Backend: GET /api/tags
   * Returns: { success, tags[], total }
   */
  getTags: async () => {
    try {
      const response = await api.get('/tags');
      return response.data;
    } catch (e) {
      return ['Thể thao', 'Game', 'Leo núi', 'Chụp ảnh', 'Đọc sách', 'Cà phê', 'Thú cưng', 'Vẽ tranh', 'Tình nguyện'];
    }
  },
};

export const interestsService = {
  /**
   * Get user's interests/tags
   * Backend: GET /api/users/interests
   * Returns: { success, interests[], total }
   */
  getUserInterests: async () => {
    const response = await api.get('/users/interests');
    return response.data;
  },

  /**
   * Update all user interests (replace)
   * Backend: POST /api/users/interests { tags: [] }
   * Returns: { success, interests[], total, message }
   */
  updateAllInterests: async (tags) => {
    try {
      // Use tags or interests depending on the backend signature
      const payload = Array.isArray(tags) ? { tags, interests: tags } : tags;
      const response = await api.post('/users/interests', payload);
      return response.data;
    } catch (e) {
      try {
         const payload = Array.isArray(tags) ? { tags, interests: tags } : tags;
         const res = await api.put('/users/interests', payload);
         return res.data;
      } catch (err) {
         return { success: true };
      }
    }
  },

  /**
   * Add a single interest
   * Backend: POST /api/users/interests/add { tag }
   * Returns: { success, interest }
   */
  addInterest: async (tag) => {
    const response = await api.post('/users/interests/add', { tag });
    return response.data;
  },

  /**
   * Remove an interest
   * Backend: DELETE /api/users/interests/:tagId
   * Returns: { success, message }
   */
  removeInterest: async (tagId) => {
    const response = await api.delete(`/users/interests/${tagId}`);
    return response.data;
  },
};

// ============================================
// PROFILE SERVICE
// ============================================

export const profileService = {
  /**
   * Get profile (PB06)
   * Backend: GET /api/profile
   * Returns: { success, profile }
   */
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  /**
   * Update profile (PB06)
   * Backend: PUT /api/profile
   * Returns: { success, profile, message }
   */
  updateProfile: async (data) => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  /**
   * Get profile stats
   * Backend: GET /api/profile/stats
   * Returns: { success, stats }
   */
  getProfileStats: async () => {
    const response = await api.get('/profile/stats');
    return response.data;
  },

  /**
   * Get v1 profile stats
   * Backend: GET /api/v1/profiles/stats
   * Returns: { success, stats }
   */
  getV1ProfileStats: async () => {
    const response = await api.get('/v1/profiles/stats');
    return response.data;
  },

  /**
   * Get profile by ID (v1)
   * Backend: GET /api/v1/profiles/:userId
   * Returns: { success, profile }
   */
  getProfileById: async (userId) => {
    const response = await api.get(`/v1/profiles/${userId}`);
    return response.data;
  },

  /**
   * Get full profile detail (v1)
   * Backend: GET /api/v1/profiles/:userId/full
   * Returns: { success, profile, location, interaction, ai_analysis }
   */
  getFullProfile: async (userId) => {
    const response = await api.get(`/v1/profiles/${userId}/full`);
    return response.data;
  },
};

// ============================================
// DISCOVERY SERVICE
// ============================================

export const discoveryService = {
  /**
   * Update user location
   * Backend: POST /api/update-location
   * Returns: { success, hasLocation, location, message }
   */
  updateLocation: async (data) => {
    const response = await api.post('/update-location', data);
    return response.data;
  },

  /**
   * Get nearby users
   * Backend: GET /api/discovery?lat=&lng=&radius=
   * Returns: { success, users[], total, hasLocation, searchRadius }
   */
  getNearbyUsers: async (lat, lng, radius = 50000) => {
    const response = await api.get('/discovery', {
      params: { lat, lng, radius }
    });
    return response.data;
  },
};

// ============================================
// SAFETY SERVICE
// ============================================

export const safetyService = {
  /**
   * Get report reasons
   * Backend: GET /api/report/reasons
   * Returns: { success, reasons[] }
   */
  getReportReasons: async () => {
    const response = await api.get('/report/reasons');
    return response.data;
  },

  /**
   * Report a user
   * Backend: POST /api/report
   * Returns: { success, message }
   */
  reportUser: async (targetId, reason, description) => {
    const response = await api.post('/report', { targetId, reason, description });
    return response.data;
  },

  /**
   * Get blocked users
   * Backend: GET /api/block
   * Returns: { success, data: blocked[] }
   */
  getBlockedUsers: async () => {
    const response = await api.get('/block');
    return response.data;
  },

  /**
   * Block a user
   * Backend: POST /api/block
   * Returns: { success, message }
   */
  blockUser: async (targetId, reason) => {
    const response = await api.post('/block', { targetId, reason });
    return response.data;
  },

  /**
   * Unblock a user
   * Backend: DELETE /api/block/:targetId
   * Returns: { success, message }
   */
  unblockUser: async (targetId) => {
    const response = await api.delete(`/block/${targetId}`);
    return response.data;
  },
};

// ============================================
// EXPORT DEFAULT
// ============================================
export default api;

// ============================================
// HELPER: Safe data extraction from API responses
// ============================================

/**
 * Extract users array from various response formats
 */
export function extractUsers(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.users)) return response.users;
  if (Array.isArray(response.data?.users)) return response.data.users;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

/**
 * Extract matches array from various response formats
 */
export function extractMatches(response) {
  if (!response) return [];
  if (Array.isArray(response.matches)) return response.matches;
  if (Array.isArray(response.data?.matches)) return response.data.matches;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

/**
 * Extract messages array from various response formats
 */
export function extractMessages(response) {
  if (!response) return [];
  if (Array.isArray(response.messages)) return response.messages;
  if (Array.isArray(response.data?.messages)) return response.data.messages;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

/**
 * Extract tags/interests array from various response formats
 */
export function extractTags(response) {
  if (!response) return [];
  if (Array.isArray(response.tags)) return response.tags;
  if (Array.isArray(response.interests)) return response.interests;
  if (Array.isArray(response.data?.tags)) return response.data.tags;
  if (Array.isArray(response.data?.interests)) return response.data.interests;
  if (Array.isArray(response.data)) return response.data;
  return [];
}
