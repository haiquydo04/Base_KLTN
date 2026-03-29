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
    const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      //  window.location.href = '/login';
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

export const userService = {
  getUsers: async (page = 1, limit = 20) => {
    const response = await api.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  getRecommendedUsers: async () => {
    const response = await api.get('/users/recommendations');
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
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  getMessages: async (matchId, page = 1, limit = 50) => {
    const response = await api.get(`/messages/${matchId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  sendMessage: async (matchId, data) => {
    const response = await api.post(`/messages/${matchId}`, data);
    return response.data;
  },

  markAsRead: async (matchId) => {
    const response = await api.put(`/messages/${matchId}/read`);
    return response.data;
  },
};

export default api;
