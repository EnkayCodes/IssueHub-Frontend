import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/token/', credentials),
  refreshToken: (refresh) => api.post('/token/refresh/', { refresh }),
  register: (userData) => api.post('/register/', userData),
};

// Employee API
export const employeeAPI = {
  getProfile: () => api.get('/profile/'),
  getAll: () => api.get('/employees/'),
};

// Issues API
export const issuesAPI = {
  getAll: (params = {}) => api.get('/issue/', { params }),
  getById: (id) => api.get(`/issue/${id}/`),
  create: (data) => api.post('/issue/', data),
  update: (id, data) => api.patch(`/issue/${id}/`, data),
  delete: (id) => api.delete(`/issue/${id}/`),
};

// Comments API
export const commentsAPI = {
 getByIssue: (issueId) => api.get(`/issues/${issueId}/comments/`),
 create: (issueId, data) => api.post(`/issues/${issueId}/comments/`, data),
 update: (commentId, data) => api.put(`/comments/${commentId}/`, data),
 delete: (commentId) => api.delete(`/comments/${commentId}/`),
};

// Activity API
export const activityAPI = {
    getRecent: () => api.get('/activity/'),
};

export default api;
