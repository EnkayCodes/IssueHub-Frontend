import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import '../styles/App.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(credentials);
      
      if (result.success) {
        console.log('✅ Login successful, user data:', result.user);
        console.log('👑 Is admin from result:', result.user?.is_staff || result.user?.is_superuser);
        console.log('👑 Is admin from context:', isAdmin);
        
        // Use the user data from the login result for immediate redirect
        const userIsAdmin =
          result.isAdmin === true ||
          result.user?.is_staff === true ||
          result.user?.is_superuser === true;

        console.log('🔀 Redirect decision - Admin:', userIsAdmin);

        
        if (userIsAdmin) {
          console.log('➡️ Redirecting to admin dashboard');
          navigate('/admin/dashboard', { replace: true });
        } else {
          console.log('➡️ Redirecting to employee dashboard');
          navigate('/dashboard', { replace: true });
        }
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Logging in..." />;

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Login to IssueHub</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;