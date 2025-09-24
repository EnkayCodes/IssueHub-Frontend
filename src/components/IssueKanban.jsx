import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { issuesAPI } from '../services/api';
import { STATUS_OPTIONS } from '../utils/constants';
import LoadingSpinner from './LoadingSpinner';
import '../styles/App.css';

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
        grouped[status] = allIssues.filter(issue => issue.status?.label || issue.status === status);
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

  if (loading) return <LoadingSpinner message="Loading issues..." />;

  return (
    <div className="kanban-board">
      <div className="board-header">
        <h1>Issue Board</h1>
        <Link to="/issues/create" className="create-issue-btn">
          + Create New Issue
        </Link>
      </div>

      <div className="kanban-container">
        {STATUS_OPTIONS.map(status => (
          <div 
            key={status}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="column-header">
              <h3>{status}</h3>
              <span className="issue-count">({issues[status]?.length || 0})</span>
            </div>
            
            <div className="issues-list">
              {issues[status]?.map(issue => (
                <div
                  key={issue.id}
                  className="issue-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, issue.id)}
                >
                  <Link to={`/issues/${issue.id}`} className="issue-title">
                    {issue.title}
                  </Link>
                  
                  <div className="issue-meta">
                    <span className={`priority-badge priority-${(issue.priority?.value || issue.priority).toLowerCase()}`}>
                      {issue.priority?.label || issue.priority}
                    </span>
                    {issue.assignee_name && (
                      <span className="assignee">👤 {issue.assignee_name}</span>
                    )}
                  </div>
                  
                  <div className="issue-id">#{issue.id}</div>
                </div>
              ))}
              
              {(!issues[status] || issues[status].length === 0) && (
                <div className="empty-column">
                  No issues in {status}
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