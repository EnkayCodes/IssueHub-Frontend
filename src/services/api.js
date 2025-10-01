// src/services/api.js
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// ✅ Create axios instance with interceptors
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh });
          const newAccess = res.data.access;

          localStorage.setItem('access_token', newAccess);

          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (err) {
          // Refresh failed → force logout
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

//
// -------------------------------
// ✅ API GROUPS
// -------------------------------
//

// 🔑 Authentication API
export const authAPI = {
  login: (credentials) => api.post('/token/', credentials),
  refreshToken: (refresh) => api.post('/token/refresh/', { refresh }),
  register: (userData) => api.post('/register/', userData),
};

// 👤 Employee API
export const employeeAPI = {
  getProfile: () => api.get('/profile/'),
  getAll: () => api.get('/employees/'),
};

// 📌 Issues API
export const issuesAPI = {
  getAll: (params = {}) => api.get('/issue/', { params }),
  getById: (id) => api.get(`/issue/${id}/`),
  create: (data) => api.post('/issue/', data),
  update: (id, data) => api.patch(`/issue/${id}/`, data),
  delete: (id) => api.delete(`/issue/${id}/`),
  getMyIssues: () => api.get('/issue/my_issues/'), // 🔥 employee-specific
};

//
// -------------------------------
// 📝 Comments API (updated)
// -------------------------------
export const commentsAPI = {
  getByIssue: (issueId) => api.get(`/comments/?issue=${issueId}`), // unified endpoint
  create: (issueId, text) => api.post(`/comments/`, { issue: issueId, text }),
  update: (commentId, data) => api.put(`/comments/${commentId}/`, data),
  delete: (commentId) => api.delete(`/comments/${commentId}/`),
};

//
// -------------------------------
// 🛠 Review Request API (new)
// -------------------------------
export const reviewAPI = {
  create: (issueId) => api.post('/review-requests/', { issue: issueId }),
  getAll: () => api.get('/review-requests/'),
  decide: (requestId, approved, feedback = "") =>
    api.post(`/review-requests/${requestId}/decide/`, { approved, feedback }),
};

//
// -------------------------------
// 📊 Activity API
// -------------------------------
export const activityAPI = {
  getRecent: () => api.get('/activity/'),
};

export default api;
