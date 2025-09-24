import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import IssueKanban from './IssueKanban';
import IssueForm from './IssueForm';
import EmployeeTasks from './EmployeeTasks';
import AdminProfile from './AdminProfile';
import UserManagement from './UserManagement';
import SystemSettings from './SystemSettings';
import '../styles/admin.css';

const AdminDashboard = () => {
    const { user, loading } = useAuth();
    const [activeSection, setActiveSection] = useState('overview');

    if (loading) {
        return <LoadingSpinner />;
    }

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return <DashboardOverview setActiveSection={setActiveSection} />;
            case 'issues':
                return <IssueKanban />;
            case 'create-issue':
                return <IssueForm />;
            case 'team-tasks':
                return <EmployeeTasks />;
            case 'user-management':
                return <UserManagement />;
            case 'system-settings':
                return <SystemSettings />;
            case 'profile':
                return <AdminProfile />;
            default:
                return <DashboardOverview setActiveSection={setActiveSection} />;
        }
    };

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <div className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                    <p>Welcome, {user?.first_name || user?.username || 'Admin'}</p>
                </div>
                
                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <h4>Dashboard</h4>
                        <button 
                            className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveSection('overview')}
                        >
                            📊 Overview
                        </button>
                    </div>

                    <div className="nav-section">
                        <h4>Issue Management</h4>
                        <button 
                            className={`nav-item ${activeSection === 'issues' ? 'active' : ''}`}
                            onClick={() => setActiveSection('issues')}
                        >
                            📋 All Issues
                        </button>
                        <button 
                            className={`nav-item ${activeSection === 'create-issue' ? 'active' : ''}`}
                            onClick={() => setActiveSection('create-issue')}
                        >
                            ➕ Create Issue
                        </button>
                        <button 
                            className={`nav-item ${activeSection === 'team-tasks' ? 'active' : ''}`}
                            onClick={() => setActiveSection('team-tasks')}
                        >
                            👥 Team Tasks
                        </button>
                    </div>

                    <div className="nav-section">
                        <h4>Administration</h4>
                        <button 
                            className={`nav-item ${activeSection === 'user-management' ? 'active' : ''}`}
                            onClick={() => setActiveSection('user-management')}
                        >
                            👤 User Management
                        </button>
                        <button 
                            className={`nav-item ${activeSection === 'system-settings' ? 'active' : ''}`}
                            onClick={() => setActiveSection('system-settings')}
                        >
                            ⚙️ System Settings
                        </button>
                    </div>

                    <div className="nav-section">
                        <h4>Account</h4>
                        <button 
                            className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveSection('profile')}
                        >
                            👤 My Profile
                        </button>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="admin-content">
                {renderContent()}
            </div>
        </div>
    );
};

// Dashboard Overview Component (matching your PDF design)
const DashboardOverview = ({ setActiveSection }) => {
    const handleCreateIssue = () => {
        setActiveSection('create-issue');
    };

    return (
        <div className="dashboard-overview">
            <div className="overview-header">
                <h1>Dashboard Overview</h1>
                <div className="quick-actions">
                    <button 
                        className="action-btn primary"
                        onClick={handleCreateIssue}
                    >
                        ➕ Create New Issue
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <h3>Total Open Issues</h3>
                        <span className="stat-badge">Current Count</span>
                    </div>
                    <div className="stat-value">1,234</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <h3>Issues in Progress</h3>
                        <span className="stat-badge">Actively being worked on</span>
                    </div>
                    <div className="stat-value">456</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <h3>Resolved This Week</h3>
                        <span className="stat-badge">Recently completed</span>
                    </div>
                    <div className="stat-value">78</div>
                </div>
            </div>

            {/* Charts and Recent Activity */}
            <div className="dashboard-content-grid">
                <div className="content-card">
                    <h3>Issue Status Distribution</h3>
                    <p>Breakdown of issues by status</p>
                    <div className="status-chart">
                        {/* Placeholder for chart */}
                        <div className="chart-placeholder">
                            <div className="chart-bar" style={{width: '40%'}}>Open</div>
                            <div className="chart-bar" style={{width: '30%'}}>In Progress</div>
                            <div className="chart-bar" style={{width: '20%'}}>Resolved</div>
                            <div className="chart-bar" style={{width: '10%'}}>Closed</div>
                        </div>
                    </div>
                </div>

                <div className="content-card">
                    <h3>Recent Activity</h3>
                    <p>Latest updates across issues</p>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-text">
                                <strong>John Doe</strong> assigned issue <strong>#1234</strong> 'Database connection error' to <strong>Jane Smith</strong>.
                            </div>
                            <div className="activity-time">5 minutes ago</div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-text">
                                <strong>Sarah Lee</strong> added a comment to issue <strong>#5678</strong> 'UI responsiveness bug'.
                            </div>
                            <div className="activity-time">15 minutes ago</div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-text">
                                <strong>Michael Brown</strong> marked issue <strong>#9012</strong> 'Authentication failing' as Resolved.
                            </div>
                            <div className="activity-time">1 hour ago</div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-text">
                                <strong>Emily White</strong> replied to a comment on issue <strong>#3456</strong> 'API endpoint timeout'.
                            </div>
                            <div className="activity-time">2 hours ago</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;