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

    // Step 1: Get tokens + user data directly from backend
    const response = await authAPI.login(credentials);
    const { access, refresh, user, employee } = response.data;

    // Step 2: Save tokens
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    // Step 3: Admin status comes from backend user object
    const isAdmin = user?.is_staff || user?.is_superuser || false;

    // Step 4: Save state
    setUser(user);
    setEmployee(employee);
    setIsAuthenticated(true);
    setIsAdmin(isAdmin);
    localStorage.setItem("user", JSON.stringify(user));

    console.log("✅ Login successful:", user);
    console.log("👑 Admin status:", isAdmin);

    return { success: true, user, isAdmin };
  } catch (error) {
    console.error("❌ Login error:", error.response?.data || error.message);
    localStorage.clear();
    setUser(null);
    setEmployee(null);
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