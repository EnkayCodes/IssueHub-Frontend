import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { issuesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { STATUS_OPTIONS } from '../utils/constants';
import LoadingSpinner from './LoadingSpinner';
import '../styles/App.css';

const EmployeeTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await issuesAPI.getAll({ assignee: user.id });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    setUpdating(taskId);
    try {
      await issuesAPI.update(taskId, { status: newStatus });
      fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setUpdating(null);
    }
  };

  const groupTasksByStatus = () => {
    const grouped = {};
    STATUS_OPTIONS.forEach(statusObj => {
      // ✅ Use statusObj.value as the key and filter by value
      grouped[statusObj.value] = tasks.filter(task => 
        task.status?.value === statusObj.value || task.status === statusObj.value
      );
    });
    return grouped;
  };

  const getStatusIcon = (statusValue) => {
    const icons = {
      'open': '📝',
      'in-progress': '🚧',
      'review': '👀',
      'completed': '✅',
      'backlog': '📦'
    };
    return icons[statusValue] || '●';
  };

  // Helper to get status label from value
  const getStatusLabel = (statusValue) => {
    const statusObj = STATUS_OPTIONS.find(opt => opt.value === statusValue);
    return statusObj?.label || statusValue;
  };

  if (loading) return <LoadingSpinner message="Loading your tasks..." />;

  const groupedTasks = groupTasksByStatus();
  const totalTasks = tasks.length;

  return (
    <div className="employee-tasks">
      <div className="tasks-header">
        <h1>My Tasks ({totalTasks})</h1>
        <p>Manage your assigned issues and track your progress</p>
      </div>

      <div className="tasks-board">
        {STATUS_OPTIONS.map(statusObj => (
          <div key={statusObj.value} className="status-column">
            <div className="column-header">
              <span className="status-icon">{getStatusIcon(statusObj.value)}</span>
              {/* ✅ FIXED: Render statusObj.label instead of the object */}
              <h3>{statusObj.label}</h3>
              <span className="task-count">({groupedTasks[statusObj.value]?.length || 0})</span>
            </div>

            <div className="tasks-list">
              {groupedTasks[statusObj.value]?.map(task => (
                <div key={task.id} className="task-card">
                  <Link to={`/issues/${task.id}`} className="task-title">
                    {task.title}
                  </Link>
                  
                  <div className="task-meta">
                    <span className={`priority priority-${(task.priority?.value || task.priority || 'medium').toLowerCase()}`}>
                      {task.priority?.label || task.priority || 'Medium'}
                    </span>
                    <span className="task-id">#{task.id}</span>
                  </div>

                  <div className="task-actions">
                    {statusObj.value !== 'completed' && (
                      <select
                        value={task.status?.value || task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        disabled={updating === task.id}
                        className="status-select"
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {updating === task.id && (
                      <span className="updating">Updating...</span>
                    )}
                  </div>

                  <div className="task-dates">
                    <small>Created: {new Date(task.created_at).toLocaleDateString()}</small>
                    <small>Updated: {new Date(task.updated_at).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}

              {(!groupedTasks[statusObj.value] || groupedTasks[statusObj.value].length === 0) && (
                <div className="empty-state">
                  No tasks in {statusObj.label}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeTasks;