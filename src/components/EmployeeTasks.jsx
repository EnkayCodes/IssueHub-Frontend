import React, { useState, useEffect } from 'react';
import { issuesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import '../styles/EmployeeTasks.css';

const EmployeeTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployeeTasks();
  }, [user]);

  const fetchEmployeeTasks = async () => {
    try {
      setLoading(true);
      // Fetch all issues and filter by current employee
      const response = await issuesAPI.getAll();
      const allIssues = response.data;
      
      // Filter tasks assigned to current employee
      const employeeTasks = allIssues.filter(issue => 
        issue.assigned_to?.id === user?.id || 
        issue.assigned_to === user?.id
      );
      
      setTasks(employeeTasks);
    } catch (error) {
      setError('Failed to fetch tasks');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await issuesAPI.update(taskId, { status: newStatus });
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      setError('Failed to update task status');
      console.error('Error:', error);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your tasks..." />;
  if (error) return <div className="error-container">{error}</div>;

  // Group tasks by status
  const tasksByStatus = {
    'To Do': tasks.filter(task => task.status === 'Open' || task.status === 'To Do'),
    'In Progress': tasks.filter(task => task.status === 'In Progress'),
    'Review': tasks.filter(task => task.status === 'blocked' || task.status === 'Review'),
    'Completed': tasks.filter(task => task.status === 'Resolved' || task.status === 'Completed')
  };

  const statusColumns = [
    { key: 'To Do', title: 'To Do', color: '#e3e3e3' },
    { key: 'In Progress', title: 'In Progress', color: '#fff9c4' },
    { key: 'Review', title: 'Review', color: '#bbdefb' },
    { key: 'Completed', title: 'Completed', color: '#c8e6c9' }
  ];

  const getPriorityBadge = (priority) => {
    const colors = {
      'High': '#ffcdd2',
      'Medium': '#fff9c4', 
      'Low': '#f3e5f5',
      'Critical': '#ff8a65'
    };
    return colors[priority] || '#e3e3e3';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-CA');
  };

  const calculateDaysLeft = (deadline) => {
    if (!deadline) return 0;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="employee-tasks">
      <div className="tasks-header">
        <h1>Employee Tasks</h1>
        <p>Welcome back! Here are your assigned tasks.</p>
      </div>

      <div className="kanban-board">
        {statusColumns.map(column => (
          <div key={column.key} className="status-column">
            <div className="column-header" style={{ backgroundColor: column.color }}>
              <h3>{column.title}</h3>
              <span className="task-count">{tasksByStatus[column.key]?.length || 0}</span>
            </div>
            
            <div className="tasks-list">
              {tasksByStatus[column.key]?.map(task => (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <h4 className="task-title">{task.title}</h4>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityBadge(task.priority) }}
                    >
                      {task.priority}
                    </span>
                  </div>
                  
                  <div className="task-meta">
                    <div className="status-priority">
                      <span className="task-status">{task.status}</span>
                      <span className="task-priority">{task.priority} Priority</span>
                    </div>
                    
                    <div className="task-dates">
                      <div className="deadline">
                        <span className="checkbox">☐</span>
                        <span className="date">{formatDate(task.issue_deadline)}</span>
                      </div>
                      <div className="days-left">
                        D {calculateDaysLeft(task.issue_deadline)}
                      </div>
                    </div>
                  </div>

                  {column.key !== 'Completed' && (
                    <div className="task-actions">
                      <select 
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="Open">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="blocked">Review</option>
                        <option value="Resolved">Completed</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
              
              {tasksByStatus[column.key]?.length === 0 && (
                <div className="empty-column">
                  No tasks in {column.title.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="tasks-footer">
        <div className="completed-section">
          <h3>Completed This Week</h3>
          <div className="completed-tasks">
            {tasksByStatus['Completed']?.slice(0, 2).map(task => (
              <div key={task.id} className="completed-task">
                <span className="task-name">{task.title}</span>
                <span className="completion-date">
                  Completed on {formatDate(task.updated_at || task.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="footer-tag">
          <strong>Product Resources Company</strong>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTasks;