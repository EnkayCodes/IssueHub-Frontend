import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, employeeAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    let parsedUser = null;
    if (savedUser) {
      try {
        parsedUser = JSON.parse(savedUser);
      } catch (error) {
        console.warn('Invalid user data in localStorage, clearing...');
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    
    if (token && parsedUser) {
      setUser(parsedUser);
      setIsAuthenticated(true);
      // Determine admin status from saved user data
      const adminStatus = parsedUser.is_staff || parsedUser.is_superuser || false;
      setIsAdmin(adminStatus);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log('🔐 Attempting login with:', credentials);
      
      // Step 1: Get JWT token
      const response = await authAPI.login(credentials);
      console.log('✅ Login response:', response.data);
      
      const { access, refresh } = response.data;
      
      // Save tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Step 2: Decode JWT token to get basic user info
      const tokenData = JSON.parse(atob(access.split('.')[1]));
      console.log('🔓 JWT Token data:', tokenData);
      
      // Step 3: Try to get full profile from API
      let userData = null;
      try {
        const profileResponse = await employeeAPI.getProfile();
        userData = profileResponse.data;
        console.log('📊 Profile data received:', userData);
      } catch (profileError) {
        console.warn('Profile endpoint not available, using token data');
        // Use data from JWT token as fallback
        userData = {
          id: tokenData.user_id,
          username: tokenData.username,
          is_staff: tokenData.is_staff || false,
          is_superuser: tokenData.is_superuser || false,
          first_name: tokenData.first_name || credentials.username,
          last_name: tokenData.last_name || ''
        };
      }
      
      // Step 4: Normalize user data (handle both direct user object and nested user object)
      const userToSave = userData.user || userData;
      
      // Step 5: Determine admin status
      const adminStatus = userToSave.is_staff || userToSave.is_superuser || false;
      console.log('👑 Admin status:', adminStatus);
      
      // Step 6: Update state
      setUser(userToSave);
      setIsAuthenticated(true);
      setIsAdmin(adminStatus);
      localStorage.setItem('user', JSON.stringify(userToSave));
      
      console.log('✅ Login successful');
      return { 
        success: true, 
        user: userToSave // Return user data for immediate use
      };
      
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      
      // Clear invalid data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed. Please check your credentials.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setEmployee(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const value = {
    user,
    employee,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;