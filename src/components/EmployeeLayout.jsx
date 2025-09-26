import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/admin.css';

const EmployeeLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Employee Panel</h2>
          <p>Welcome, {user?.first_name || user?.username}</p>
        </div>
        <nav className="sidebar-nav">
          <Link 
            to="/employee/dashboard" 
            className={`nav-item ${isActive('/employee/dashboard') ? 'active' : ''}`}
          >
            📊 Overview
          </Link>
          <Link 
            to="/employee/my-tasks" 
            className={`nav-item ${isActive('/employee/my-tasks') ? 'active' : ''}`}
          >
            📋 My Issues
          </Link>
          <Link 
            to="/employee/profile" 
            className={`nav-item ${isActive('/employee/profile') ? 'active' : ''}`}
          >
            👤 My Profile
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        {children}
      </div>
    </div>
  );
};

export default EmployeeLayout;