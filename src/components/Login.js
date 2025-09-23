import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { authAPI } from '../services/api.js';  // axios wrapper for auth calls
import '../styles/App.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '', // must be username unless backend allows email
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    const response = await authAPI.login({
      username: credentials.username,
      password: credentials.password,
    });

    console.log("🔎 Full login response:", response.data);

    const { token } = response.data;
    if (!token) throw new Error("No token returned from API");

    localStorage.setItem('token', token);
    localStorage.setItem('user', credentials.username);

    console.log('✅ Login successful, redirecting to dashboard...');
    navigate('/dashboard');
  } catch (err) {
    console.error('❌ Login failed:', err.response?.data || err.message);
    setError('Unable to log in with provided credentials.');
  } finally {
    setLoading(false);
  }
};



  if (loading) return <LoadingSpinner />;

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Login to Issue Tracker</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
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
            <label htmlFor="password">Password</label>
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

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="register-link">
          Don&apos;t have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
