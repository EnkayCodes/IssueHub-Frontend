import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { issuesAPI } from '../services/api';
import { STATUS_OPTIONS } from '../utils/constants';
import LoadingSpinner from './LoadingSpinner';
import '../styles/App.css';
import '../styles/EmployeeTasks.css'; // Import the same CSS

const IssueKanban = () => {
  const [issues, setIssues] = useState({});
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await issuesAPI.getAll();
      const allIssues = response.data;
      
      const grouped = {};
      STATUS_OPTIONS.forEach(status => {
        grouped[status.value] = allIssues.filter(issue => 
          issue.status?.value === status.value || issue.status === status.value
        );
      });
      
      setIssues(grouped);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, issueId) => {
    e.dataTransfer.setData('issueId', issueId);
    setDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragging(false);
    
    const issueId = e.dataTransfer.getData('issueId');
    
    try {
      await issuesAPI.update(issueId, { status: newStatus });
      fetchIssues(); // Refresh the board
    } catch (error) {
      console.error('Error updating issue status:', error);
    }
  };

  // Define status columns with colors matching employee tasks
  const statusColumns = [
    { key: 'Open', title: 'To Do', color: '#e3e3e3' },
    { key: 'In Progress', title: 'In Progress', color: '#fff9c4' },
    { key: 'Review', title: 'Review', color: '#bbdefb' },
    { key: 'Resolved', title: 'Completed', color: '#c8e6c9' }
  ];

  // Get priority badge colors matching employee tasks
  const getPriorityBadge = (priority) => {
    const colors = {
      'High': '#ffcdd2',
      'Medium': '#fff9c4',
      'Low': '#f3e5f5',
      'Critical': '#ff8a65'
    };
    return colors[priority] || '#e3e3e3';
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-CA');
  };

  // Calculate days left function
  const calculateDaysLeft = (deadline) => {
    if (!deadline) return 0;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) return <LoadingSpinner message="Loading issues..." />;

  return (
    <div className="employee-tasks p-6">
      <div className="tasks-header mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Issue Board</h1>
        <p className="text-gray-600">Manage and track all issues across the system.</p>
        <Link to="/issues/create" className="create-issue-btn inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Create New Issue
        </Link>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {statusColumns.map(column => (
          <div 
            key={column.key}
            className="status-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.key)}
          >
            <div className="column-header" style={{ backgroundColor: column.color }}>
              <h3 className="font-semibold">{column.title}</h3>
              <span className="task-count bg-white bg-opacity-50 px-2 py-1 rounded-full text-sm font-medium">
                {issues[column.key]?.length || 0}
              </span>
            </div>
            
            <div className="tasks-list">
              {issues[column.key]?.map(issue => (
                <div
                  key={issue.id}
                  className="task-card bg-white rounded-lg shadow-sm border border-gray-200"
                  draggable
                  onDragStart={(e) => handleDragStart(e, issue.id)}
                >
                  <div className="task-header">
                    <Link 
                      to={`/issues/${issue.id}`} 
                      className="task-title font-medium text-gray-900 hover:text-blue-600"
                    >
                      {issue.title}
                    </Link>
                    <span
                      className="priority-badge text-xs font-semibold px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: getPriorityBadge(issue.priority?.label || issue.priority || 'Medium')
                      }}
                    >
                      {issue.priority?.label || issue.priority || 'Medium'}
                    </span>
                  </div>

                  <div className="task-meta">
                    <div className="status-priority">
                      <span className="task-status text-sm text-gray-600">
                        {issue.status?.label || issue.status}
                      </span>
                      <span className="task-priority text-sm text-gray-500">
                        {issue.priority?.label || issue.priority || 'Medium'} Priority
                      </span>
                    </div>

                    <div className="task-dates">
                      <div className="deadline flex items-center gap-1">
                        <span className="checkbox">☐</span>
                        <span className="date text-sm text-gray-600">
                          {formatDate(issue.issue_deadline || issue.deadline)}
                        </span>
                      </div>
                      <div className="days-left text-sm font-medium">
                        D {calculateDaysLeft(issue.issue_deadline || issue.deadline)}
                      </div>
                    </div>
                  </div>

                  {issue.assignee_name && (
                    <div className="assignee-info mt-2 text-sm text-gray-600">
                      👤 {issue.assignee_name}
                    </div>
                  )}

                  <div className="issue-id text-xs text-gray-400 mt-2">
                    #{issue.id}
                  </div>
                </div>
              ))}
              
              {(!issues[column.key] || issues[column.key].length === 0) && (
                <div className="empty-column text-gray-400 text-sm text-center py-4">
                  No issues in {column.title.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueKanban;