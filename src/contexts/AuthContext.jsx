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

    // Step 1: Get tokens
    const response = await authAPI.login(credentials);
    const { access, refresh } = response.data;

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    // Step 2: Try profile
    let userData;
    try {
      const profileResponse = await employeeAPI.getProfile();
      userData = profileResponse.data;
    } catch {
      // fallback to token
      const tokenData = JSON.parse(atob(access.split('.')[1]));
      userData = { id: tokenData.user_id, username: credentials.username };
    }

    // Step 3: Admin status
    const isAdmin = userData.is_staff || userData.is_superuser || false;

    // Step 4: Save state
    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(isAdmin);
    localStorage.setItem("user", JSON.stringify(userData));

    return { success: true, user: userData };
  } catch (error) {
    console.error("❌ Login error:", error.response?.data || error.message);
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);

    return {
      success: false,
      error: error.response?.data?.detail || "Login failed. Please check your credentials."
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