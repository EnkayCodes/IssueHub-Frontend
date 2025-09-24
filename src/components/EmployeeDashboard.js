import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { issuesAPI, activityAPI } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import '../styles/App.css';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    assigned: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, activityResponse, tasksResponse] = await Promise.all([
        issuesAPI.getStats(),
        activityAPI.getRecent(),
        issuesAPI.getAll({ assignee: user.id })
      ]);

      setStats(statsResponse.data);
      setRecentActivity(activityResponse.data);
      setMyTasks(tasksResponse.data.slice(0, 5)); // Show only 5 recent tasks
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.name}!</h1>
        <Link to="/issue/create" className="create-issue-btn">
          + Create New Issue
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Total Issues</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚧</div>
          <div className="stat-info">
            <h3>In Progress</h3>
            <p className="stat-number">{stats.inProgress}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Completed</h3>
            <p className="stat-number">{stats.completed}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <h3>Assigned to Me</h3>
            <p className="stat-number">{stats.assigned}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>My Recent Tasks</h2>
          <div className="tasks-list">
            {myTasks.length === 0 ? (
              <p>No tasks assigned to you.</p>
            ) : (
              myTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-main">
                    <Link to={`/issues/${task.id}`} className="task-title">
                      {task.title}
                    </Link>
                    <span className={`priority-badge priority-${(task.priority?.value || task.priority).toLowerCase()}`}>
                      {task.priority?.label || task.priority}
                    </span>
                  </div>
                  <div className="task-meta">
                    <span className={`status status-${(task.status?.value || task.status).toLowerCase().replace(' ', '-')}`}>
                      {task.status?.label || task.status}
                    </span>
                    <span>Updated {new Date(task.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          {myTasks.length > 0 && (
            <Link to="/my-tasks" className="view-all-link">View all tasks →</Link>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <p>No recent activity.</p>
            ) : (
              recentActivity.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-content">
                    <strong>{activity.user_name}</strong> {activity.action}
                  </div>
                  <div className="activity-time">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;