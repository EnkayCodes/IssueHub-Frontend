import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import '../styles/Login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    department: '',
    position: '',
    phone_number: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Structure data to match your Django serializer's nested structure
      const registrationData = {
        username: formData.username.trim(),
        password: formData.password,
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        department: formData.department.trim(),
        position: formData.position.trim(),
        phone_number: formData.phone_number.trim()
      };

      const result = await register(registrationData);
      
      if (result.success) {
        alert('Registration successful! Please login with your credentials.');
        navigate('/login');
      } else {
        // Handle Django validation errors
        if (typeof result.error === 'object') {
          // If it's an object with field errors
          const errorMessages = [];
          for (const [field, messages] of Object.entries(result.error)) {
            errorMessages.push(`${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`);
          }
          setError(errorMessages.join(' | '));
        } else {
          setError(result.error);
        }
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Creating your account..." />;

  return (
    <div className="container">
      <div className="form-box signup" id="form-box-signup">
        <form onSubmit={handleSubmit}>
          <h1>Welcome to Issue Tracker</h1>
          <p>Sign in or create an account to manage your projects.</p>
          
          <div className="optional">
            <Link to="/login" className="signin-btn">
              Sign in
            </Link>
            <button type="button" className="signup-btn active">
              Sign Up
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="user">
            <h5>Username</h5>
            <div className="input-box">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="username"
              />
              <i className='bx bxs-user'></i>
            </div>
          </div>

          <div className="user">
            <h5>Email</h5>
            <div className="input-box">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="a@email.com"
              />
              <i className='bx bxs-envelope'></i>
            </div>
          </div>

          <div className="form-row">
            <div className="user">
              <h5>First Name</h5>
              <div className="input-box">
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="First name"
                />
                <i className='bx bxs-user'></i>
              </div>
            </div>

            <div className="user">
              <h5>Last Name</h5>
              <div className="input-box">
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Last name"
                />
                <i className='bx bxs-user'></i>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="user">
              <h5>Department</h5>
              <div className="input-box">
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g., Engineering"
                />
                <i className='bx bxs-building'></i>
              </div>
            </div>

            <div className="user">
              <h5>Position</h5>
              <div className="input-box">
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="e.g., Developer"
                />
                <i className='bx bxs-briefcase'></i>
              </div>
            </div>
          </div>

          <div className="user">
            <h5>Phone Number</h5>
            <div className="input-box">
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
              <i className='bx bxs-phone'></i>
            </div>
          </div>

          <div className="pass">
            <h5>Password</h5>
            <div className="input-box">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                placeholder="Password"
              />
              <i className='bx bxs-lock-alt'></i>
            </div>
          </div>

          <div className="pass">
            <h5>Confirm Password</h5>
            <div className="input-box">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm password"
              />
              <i className='bx bxs-lock-alt'></i>
            </div>
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign up'}
          </button>

          <p className="or">OR CONTINUE WITH</p>
          <div>
            <div className="google">
              <a href="#">
                Sign up with Google
                <i className='bx bxl-google'></i>
              </a>
            </div>
            <div className="micro">
              <a href="#">
                Sign up with Microsoft
                <i className='bx bxl-microsoft'></i>
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;