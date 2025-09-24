import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/App.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Issue Tracker</Link>
      </div>
      
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/issues">Issues</Link>
        <Link to="/my-tasks">My Tasks</Link>
        {isAdmin && <Link to="/admin/profile">Admin</Link>}
        <Link to="/profile">Profile</Link>
      </div>

      <div className="nav-user">
        <span>Welcome, {user.name}</span>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;