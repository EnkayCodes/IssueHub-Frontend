import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import '../styles/Login.css';

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
    <div className="container">
      <div className="form-box login" id="form-box-login">
        <form onSubmit={handleSubmit}>
          <h1>Welcome to Issue Tracker</h1>
          <p>Sign in or create an account to manage your projects.</p>
          
          <div className="optional">
            <button type="button" className="signin-btn active">
              Sign in
            </button>
            <Link to="/register" className="signup-btn">
              Sign Up
            </Link>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="user">
            <h5>Email/Username</h5>
            <div className="input-box">
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
              />
              <i className='bx bxs-user'></i>
            </div>
          </div>

          <div className="pass">
            <h5>Password</h5>
            <div className="input-box">
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
              <i className='bx bxs-lock-alt'></i>
            </div>
          </div>

          <div className="forgot-link">
            <a href="#">Forgot Password?</a>
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="or">OR CONTINUE WITH</p>
          <div>
            <div className="google">
              <a href="#">
                Login with Google
                <i className='bx bxl-google'></i>
              </a>
            </div>
            <div className="micro">
              <a href="#">
                Login with Microsoft
                <i className='bx bxl-microsoft'></i>
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;