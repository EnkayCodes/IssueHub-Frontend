import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

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
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await authAPI.getProfile();
      setEmployee(response.data);
      setUser(response.data.user); // Assuming your employee serializer includes user data
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
  try {
    // Step 1: Get authentication token
    const response = await authAPI.login(credentials);
    
    if (!response.data.token) {
      return { success: false, error: 'No token received' };
    }
    
    const token = response.data.token;
    localStorage.setItem('token', token);
    
    // Step 2: Try to get user profile, but if it fails, create basic user info
    let userData = null;
    
    try {
      const profileResponse = await authAPI.getProfile();
      userData = profileResponse.data;
    } catch (profileError) {
      console.warn('Profile endpoint not available, using basic info');
      // Create basic user info from login credentials
      userData = {
        user: {
          username: credentials.username,
          is_staff: true,
          is_superuser: true,
          first_name: 'Admin',
          last_name: 'User'
        }
      };
    }
    
    // Set user state
    if (userData.user) {
      setUser(userData.user);
      setEmployee(userData);
    } else {
      setUser(userData);
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Login error details:', error.response?.data);
    return { 
      success: false, 
      error: error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Login failed' 
    };
  }
};

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setEmployee(null);
    }
  };

  const value = {
    user,
    employee,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.is_staff || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};