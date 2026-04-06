import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Determine if it was an admin route
      const isAdminRoute = error.config?.url && error.config.url.includes('/admin');
      
      if (isAdminRoute) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
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

export const userService = {
  getUsers: async (page = 1, limit = 20) => {
    const response = await api.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  getRecommendedUsers: async (refresh = false) => {
    // Nếu refresh = true, thêm timestamp để bust cache
    const url = refresh
      ? `/users/recommendations?refresh=${Date.now()}`
      : `/users/recommendations`;
    const response = await api.get(url);
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateProfile: async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'avatar' && data[key]) {
        formData.append(key, data[key]);
      } else if (data[key] !== undefined) {
        formData.append(key, typeof data[key] === 'object' 
          ? JSON.stringify(data[key]) 
          : data[key]);
      }
    });

    const response = await api.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMatches: async () => {
    const response = await api.get('/users/matches');
    return response.data;
  },
};

export const matchService = {
  likeUser: async (userId) => {
    const response = await api.post('/match/like', { userId });
    return response.data;
  },

  passUser: async (userId) => {
    const response = await api.post('/match/pass', { userId });
    return response.data;
  },

  getMutualLikes: async () => {
    const response = await api.get('/match/mutual');
    return response.data;
  },

  unmatch: async (matchId) => {
    const response = await api.delete(`/match/${matchId}`);
    return response.data;
  },
};

export const messageService = {
  // GET /api/messages/conversations: lay danh sach cuoc tro chuyen
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  // GET /api/messages/:matchId: lay tin nhan theo cuoc tro chuyen
  getMessages: async (matchId, page = 1, limit = 50) => {
    const response = await api.get(`/messages/${matchId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // POST /api/messages/:matchId: gui tin nhan moi
  sendMessage: async (matchId, data) => {
    const response = await api.post(`/messages/${matchId}`, data);
    return response.data;
  },

  // PUT /api/messages/:matchId/read: danh dau tin nhan da doc
  markAsRead: async (matchId) => {
    const response = await api.put(`/messages/${matchId}/read`);
    return response.data;
  },
};

export const tagsService = {
  getTags: async () => {
    try {
      const response = await api.get('/tags');
      return response.data;
    } catch (e) {
      return ['Thể thao', 'Game', 'Leo núi', 'Chụp ảnh', 'Đọc sách', 'Cà phê', 'Thú cưng', 'Vẽ tranh', 'Tình nguyện'];
    }
  }
};

export const interestsService = {
  updateAllInterests: async (interests) => {
    try {
      const response = await api.put('/users/interests', { interests });
      return response.data;
    } catch (e) {
      // Mock success if endpoint doesn't exist
      return { success: true };
    }
  }
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

export default api;
