import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import EmployeeLayout from './EmployeeLayout';
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
      await authAPI.updateProfile(profileData); // Fixed: using updateProfile instead of getProfile
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

  if (loading) return (
    <EmployeeLayout>
      <LoadingSpinner message="Loading profile..." />
    </EmployeeLayout>
  );

  return (
    <EmployeeLayout>
      <div className="user-profile p-6">
        <h1 className="text-3xl font-bold mb-6">User Profile & Settings</h1>

        <div className="profile-sections grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="profile-section bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Profile Information</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group mb-4">
                <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="form-group mb-4">
                <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  disabled
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                />
              </div>

              <div className="form-group mb-4">
                <label className="block text-gray-700 font-medium mb-2">Job Title</label>
                <input
                  type="text"
                  name="job_title"
                  value={profileData.job_title}
                  onChange={handleProfileChange}
                  placeholder="e.g., Software Engineer"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="form-group mb-4">
                <label className="block text-gray-700 font-medium mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={profileData.department}
                  onChange={handleProfileChange}
                  placeholder="e.g., Engineering"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="profile-section bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <form onSubmit={handlePasswordUpdate}>
              <div className="form-group mb-4">
                <label className="block text-gray-700 font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="form-group mb-4">
                <label className="block text-gray-700 font-medium mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="form-group mb-4">
                <label className="block text-gray-700 font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded ${
            message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
};

export default UserProfile;