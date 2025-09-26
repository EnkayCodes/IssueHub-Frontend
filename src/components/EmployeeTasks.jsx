import React, { useState, useEffect } from 'react';
import { issuesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import EmployeeLayout from './EmployeeLayout';
import '../styles/EmployeeTasks.css';

const EmployeeTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchEmployeeTasks();
  }, [user]);

  const fetchEmployeeTasks = async () => {
  try {
    setLoading(true);
    const response = await issuesAPI.getMyIssues(); // ✅ backend does filtering
    console.log("🔎 My Issues API response:", response.data);
    setTasks(response.data);
  } catch (error) {
    setError('Failed to fetch tasks');
    console.error('Error fetching tasks:', error);
  } finally {
    setLoading(false);
  }
};


  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await issuesAPI.update(taskId, { status: newStatus });
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      setError('Failed to update task status');
      console.error('Error updating task status:', error);
    }
  };

  if (loading)
    return (
      <EmployeeLayout>
        <LoadingSpinner message="Loading your tasks..." />
      </EmployeeLayout>
    );

  if (error)
    return (
      <EmployeeLayout>
        <div className="error-container">{error}</div>
      </EmployeeLayout>
    );

  // ✅ Handle both frontend + backend status naming
  const tasksByStatus = {
    'To Do': tasks.filter(task =>
      ['Open', 'Not Started', 'To Do'].includes(task.status)
    ),
    'In Progress': tasks.filter(task =>
      ['In Progress'].includes(task.status)
    ),
    'Review': tasks.filter(task =>
      ['Review', 'Blocked', 'blocked'].includes(task.status)
    ),
    'Completed': tasks.filter(task =>
      ['Resolved', 'Completed'].includes(task.status)
    )
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
    <EmployeeLayout>
      <div className="employee-tasks p-6">
        <div className="tasks-header mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
          <p className="text-gray-600">Welcome back! Here are your assigned tasks.</p>
        </div>

        {/* Kanban Board */}
        <div className="kanban-board">
          {statusColumns.map(column => (
            <div key={column.key} className="status-column">
              <div className="column-header" style={{ backgroundColor: column.color }}>
                <h3 className="font-semibold">{column.title}</h3>
                <span className="task-count bg-white bg-opacity-50 px-2 py-1 rounded-full text-sm font-medium">
                  {tasksByStatus[column.key]?.length || 0}
                </span>
              </div>

              <div className="tasks-list">
                {tasksByStatus[column.key]?.map(task => (
                  <div key={task.id} className="task-card bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="task-header">
                      <h4 className="task-title font-medium text-gray-900">{task.title}</h4>
                      <span
                        className="priority-badge text-xs font-semibold px-2 py-1 rounded"
                        style={{ backgroundColor: getPriorityBadge(task.priority) }}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div className="task-meta">
                      <div className="status-priority">
                        <span className="task-status text-sm text-gray-600">{task.status}</span>
                        <span className="task-priority text-sm text-gray-500">{task.priority} Priority</span>
                      </div>

                      <div className="task-dates">
                        <div className="deadline flex items-center gap-1">
                          <span className="checkbox">☐</span>
                          <span className="date text-sm text-gray-600">{formatDate(task.issue_deadline)}</span>
                        </div>
                        <div className="days-left text-sm font-medium">
                          D {calculateDaysLeft(task.issue_deadline)}
                        </div>
                      </div>
                    </div>

                    {column.key !== 'Completed' && (
                      <div className="task-actions mt-3">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="status-select w-full p-2 border border-gray-300 rounded text-sm"
                        >
                          <option value="Open">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Blocked">Review</option>
                          <option value="Resolved">Completed</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}

                {tasksByStatus[column.key]?.length === 0 && (
                  <div className="empty-column text-gray-400 text-sm text-center py-4">
                    No tasks in {column.title.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeTasks;
