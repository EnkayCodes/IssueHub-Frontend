import React, { useEffect, useState } from 'react';
import { issuesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import EmployeeLayout from './EmployeeLayout';
import '../styles/EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await issuesAPI.getMyIssues();
        setIssues(res.data);
      } catch (err) {
        console.error('Error fetching issues:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchIssues();
  }, [user]);

  // Status counts
  const statusCounts = {
    'Task Assigned': issues.filter((i) => ['Not Started', 'Open', 'To Do'].includes(i.status)).length,
    'Task In Progress': issues.filter((i) => i.status === 'In Progress').length,
    'Completed Today': issues.filter((i) => {
      const today = new Date().toDateString();
      const completedDate = i.completed_at ? new Date(i.completed_at).toDateString() : null;
      return ['Completed', 'Resolved'].includes(i.status) && completedDate === today;
    }).length,
    'Overdue Task': issues.filter((i) => {
      if (!i.issue_deadline) return false;
      return new Date(i.issue_deadline) < new Date() && !['Completed', 'Resolved'].includes(i.status);
    }).length,
  };

  // Priority counts for pie chart - Updated order to match image
  const priorityCounts = {
    'Critical': issues.filter(i => i.priority === 'Critical').length,
    'High': issues.filter(i => i.priority === 'High').length,
    'Medium': issues.filter(i => i.priority === 'Medium').length,
    'Low': issues.filter(i => i.priority === 'Low').length,
  };

  // Recent activities
  const recentActivities = [
    {
      type: 'status_change',
      text: 'You changed a class of "Review Q3 Financial Report" to "In Progress".',
      completed: false
    },
    {
      type: 'comment',
      text: 'You commented on "Purpose Marketing Campaign Brief": "Washing feedback from design."',
      completed: false
    },
    {
      type: 'assigned',
      text: 'You were assigned "Draft New Feature Specification" by Sarah M.',
      completed: true
    },
    {
      type: 'review_request',
      text: 'You requested review for "Implement User Authentication".',
      completed: false
    }
  ];

  // My Tasks - limited to 6 most recent or important
  const myTasks = issues.slice(0, 6);

  if (loading) return (
    <EmployeeLayout>
      <div className="loading-state">Loading dashboard...</div>
    </EmployeeLayout>
  );

  const getPriorityBadgeClass = (priority) => {
    const styles = {
      High: 'priority-high',
      Medium: 'priority-medium',
      Low: 'priority-low',
      Critical: 'priority-critical',
    };
    return `task-priority ${styles[priority] || 'priority-medium'}`;
  };

  const getPriorityColorClass = (priority) => {
    const styles = {
      Critical: 'priority-critical-color',
      High: 'priority-high-color',
      Medium: 'priority-medium-color',
      Low: 'priority-low-color',
    };
    return `priority-color ${styles[priority] || 'priority-medium-color'}`;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Critical: '#f97316',    // Orange
      High: '#ef4444',        // Red
      Medium: '#eab308',      // Yellow
      Low: '#22c55e',         // Green
    };
    return colors[priority] || '#6b7280';
  };

  // Enhanced pie chart component with better styling
  // Enhanced pie chart component with CSS variables
const PieChart = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return (
      <div className="pie-chart-container">
        <div className="pie-chart-empty">
          <div className="pie-center">
            <span className="total-count">0</span>
            <span className="total-label">Total</span>
          </div>
        </div>
      </div>
    );
  }

  let accumulatedPercent = 0;
  const segments = data.map((d) => {
    const percent = (d.value / total) * 100;
    const segment = {
      ...d,
      percent,
      start: accumulatedPercent,
      end: accumulatedPercent + percent
    };
    accumulatedPercent += percent;
    return segment;
  });

  return (
    <div className="pie-chart-container">
      <div className="pie-chart">
        {segments.map((segment, index) => (
          <div
            key={segment.title}
            className="pie-segment"
            style={{
              '--segment-color': segment.color,
              '--segment-percent': `${segment.percent}%`,
              transform: `rotate(${segment.start * 3.6}deg)`
            }}
          />
        ))}
        <div className="pie-center">
          <span className="total-count">{total}</span>
          <span className="total-label">Total</span>
        </div>
      </div>
    </div>
  );
};

  // Build chart data (remove zeros so circle fills properly)
  const chartData = Object.entries(priorityCounts)
    .filter(([_, count]) => count > 0)
    .map(([priority, count]) => ({
      title: priority,
      value: count,
      color: getPriorityColor(priority)
    }));

  return (
    <EmployeeLayout>
      <div className="employee-dashboard p-4">
        {/* Header */}
        <div className="dashboard-header mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Employee Dashboard
          </h1>
        </div>

        {/* Quick Stats Cards - Smaller and inline */}
        <div className="stats-grid">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="stats-card">
              <h3>{status}</h3>
              <p>{count}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid - Side by side */}
        <div className="main-content-grid">
          {/* Left Column - Task by Priority */}
          <div className="priority-section">
            <h2 className="section-header">Task by Priority</h2>
            <div className="priority-chart-container">
              {/* Chart now uses filtered non-zero data */}
              <PieChart data={chartData} />

              {/* Legend still shows all (even if 0) */}
              <div className="priority-legend">
                {Object.entries(priorityCounts).map(([priority, count]) => (
                  <div key={priority} className="priority-item">
                    <span className="priority-label">
                      <span className={getPriorityColorClass(priority)}></span>
                      {priority}
                    </span>
                    <span className="priority-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - My Tasks */}
          <div className="tasks-section">
            <div className="tasks-header">
              <h2 className="section-header">My Tasks</h2>
              <Link to="/employee/my-tasks" className="view-all-link">
                View All →
              </Link>
            </div>

            <div className="tasks-container">
              {myTasks.length > 0 ? (
                myTasks.map((task) => (
                  <div key={task.id} className="task-item">
                    <div className="task-content">
                      <input type="checkbox" className="task-checkbox" />
                      <div className="task-info">
                        <div className="task-title">{task.title}</div>
                        <span className={getPriorityBadgeClass(task.priority)}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <span className="task-deadline">
                      {task.issue_deadline
                        ? new Date(task.issue_deadline).toLocaleDateString('en-CA')
                        : 'No deadline'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  No tasks assigned to you yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="activities-section">
          <h2 className="section-header">Recent Activity</h2>
          <div className="activities-container">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <input 
                  type="checkbox" 
                  checked={activity.completed}
                  readOnly
                  className="activity-checkbox"
                />
                <span className="activity-text">{activity.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Sections */}
        <div className="footer-sections">
          <div className="footer-section">
            <h3>Product Resources</h3>
          </div>
          <div className="footer-section">
            <h3>Company</h3>
          </div>
        </div>

        {/* Notes Section */}
        <div className="notes-section">
          <h3>Notes with Weekly</h3>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;