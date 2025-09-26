import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔑 Request interceptor → attach token
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

// 🔑 Response interceptor → refresh expired tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // if token expired (401) and request not retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh });
          const newAccess = res.data.access;

          // Save new access token
          localStorage.setItem('access_token', newAccess);

          // Update header & retry request
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (err) {
          // Refresh failed → logout
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Authentication API
export const authAPI = {
  login: (credentials) => api.post('/token/', credentials),
  refreshToken: (refresh) => api.post('/token/refresh/', { refresh }),
  register: (userData) => api.post('/register/', userData),
};

// ✅ Employee API
export const employeeAPI = {
  getProfile: () => api.get('/profile/'),
  getAll: () => api.get('/employees/'),
};

// ✅ Issues API
export const issuesAPI = {
  getAll: (params = {}) => api.get('/issue/', { params }),
  getById: (id) => api.get(`/issue/${id}/`),
  create: (data) => api.post('/issue/', data),
  update: (id, data) => api.patch(`/issue/${id}/`, data),
  delete: (id) => api.delete(`/issue/${id}/`),
  getMyIssues: () => api.get('/issue/my_issues/'), // 🔥 employee-specific
};

// ✅ Comments API
export const commentsAPI = {
  getByIssue: (issueId) => api.get(`/issues/${issueId}/comments/`),
  create: (issueId, data) => api.post(`/issues/${issueId}/comments/`, data),
  update: (commentId, data) => api.put(`/comments/${commentId}/`, data),
  delete: (commentId) => api.delete(`/comments/${commentId}/`),
};

// ✅ Activity API
export const activityAPI = {
  getRecent: () => api.get('/activity/'),
};

export default api;
