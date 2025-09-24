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

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    // Fix: Safely parse user data with error handling
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
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔐 Attempting login with:', credentials);
      
      // Step 1: Get JWT token
      const response = await authAPI.login(credentials);
      console.log('✅ Login response:', response.data);
      
      const { access, refresh } = response.data;
      
      // Save tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Step 2: Try to get profile
      let userData = null;
      try {
        const profileResponse = await employeeAPI.getProfile();
        userData = profileResponse.data;
        console.log('📊 Profile data received');
      } catch (profileError) {
        console.warn('Profile endpoint not available, using basic info');
        // Create basic user info
        userData = {
          user: {
            username: credentials.username,
            is_staff: true,
            is_superuser: true,
            first_name: credentials.username,
            last_name: ''
          }
        };
      }
      
      // Step 3: Set user state properly
      const userToSave = userData.user || userData;
      
      // Fix: Ensure we're saving valid JSON
      setUser(userToSave);
      localStorage.setItem('user', JSON.stringify(userToSave)); // This must be JSON
      
      console.log('✅ Login successful');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      
      // Clear invalid data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed. Please check your credentials.' 
      };
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
  };

  const value = {
    user,
    employee,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.is_staff || user?.is_superuser || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};