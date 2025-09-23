import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import '../styles/App.css';

const UserProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    job_title: '',
    department: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      setProfileData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await authAPI.getProfile(); // Using profile update endpoint
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage('Error updating profile');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      setSaving(false);
      return;
    }

    try {
      await authAPI.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      
      setMessage('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating password');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading profile..." />;

  return (
    <div className="user-profile">
      <h1>User Profile & Settings</h1>

      <div className="profile-sections">
        <div className="profile-section">
          <h2>Profile Information</h2>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                name="job_title"
                value={profileData.job_title}
                onChange={handleProfileChange}
                placeholder="e.g., Software Engineer"
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={profileData.department}
                onChange={handleProfileChange}
                placeholder="e.g., Engineering"
              />
            </div>

            <button type="submit" disabled={saving}>
              {saving ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="profile-section">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordUpdate}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <button type="submit" disabled={saving}>
              {saving ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default UserProfile;