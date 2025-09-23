import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // ✅ If you're using JWT
      config.headers.Authorization = `Token ${token}`;
      // ❌ If using DRF TokenAuth, switch to:
      // config.headers.Authorization = `Token ${token}`;
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ====================== APIs ======================

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/token/', credentials), // JWT login
  refreshToken: (token) => api.post('/auth/token/refresh/', { refresh: token }),
};

// Employee API
export const employeeAPI = {
  register: (data) => api.post('/register_employee/', data), // ✅ matches your Django view
  getCurrent: () => api.get('/current_employee/'), // if you add it in backend
  getAll: () => api.get('/employees/'),
  getById: (id) => api.get(`/employees/${id}/`),
  update: (id, data) => api.patch(`/employees/${id}/`, data),
  delete: (id) => api.delete(`/employees/${id}/`),
};

// Issues API
export const issuesAPI = {
  getAll: (params = {}) => api.get('/issues/', { params }),
  getById: (id) => api.get(`/issues/${id}/`),
  create: (data) => api.post('/issues/', data),
  update: (id, data) => api.patch(`/issues/${id}/`, data),
  delete: (id) => api.delete(`/issues/${id}/`),
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
