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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Note: Django often uses "Bearer" not "Token"
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

// Authentication API - CORRECTED ENDPOINTS
export const authAPI = {
  login: (credentials) => api.post('/token/', credentials), // Changed from /auth/token/
  refreshToken: (token) => api.post('/token/refresh/', { refresh: token }),
  // Note: Your API might not have logout or profile endpoints
};

// Employee API - CORRECTED ENDPOINTS
export const employeeAPI = {
  getAll: () => api.get('/employees/'),
  getById: (id) => api.get(`/employees/${id}/`),
  create: (data) => api.post('/employees/', data),
  update: (id, data) => api.patch(`/employees/${id}/`, data),
  delete: (id) => api.delete(`/employees/${id}/`),
};

// Issues API - CORRECTED ENDPOINTS
export const issuesAPI = {
  getAll: (params = {}) => api.get('/issues/', { params }),
  getById: (id) => api.get(`/issues/${id}/`),
  create: (data) => api.post('/issues/', data),
  update: (id, data) => api.patch(`/issues/${id}/`, data),
  delete: (id) => api.delete(`/issues/${id}/`),
};

export const commentsAPI = {
  getByIssue: (issueId) => api.get(`/issues/${issueId}/comments/`),
  create: (issueId, data) => api.post(`/issues/${issueId}/comments/`, data),
  update: (commentId, data) => api.put(`/comments/${commentId}/`, data),
  delete: (commentId) => api.delete(`/comments/${commentId}/`),
};

export const activityAPI = {
  getRecent: () => api.get('/activity/'),
};

export default api;