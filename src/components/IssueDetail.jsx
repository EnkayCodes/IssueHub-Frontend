import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issuesAPI, commentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import EmployeeLayout from './EmployeeLayout';
import LoadingSpinner from './LoadingSpinner';
import '../styles/IssueDetail.css';  // ✅ new stylesheet

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIssueData();
  }, [id]);

  const fetchIssueData = async () => {
    try {
      setLoading(true);
      const issueResponse = await issuesAPI.getById(id);
      setIssue(issueResponse.data);
      
      try {
        const commentsResponse = await commentsAPI.getByIssue(id);
        setComments(commentsResponse.data);
      } catch (commentError) {
        console.log('Comments endpoint not available:', commentError);
        setComments([]);
      }
    } catch (error) {
      setError('Failed to fetch issue data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await commentsAPI.create({
        issue: id,
        content: newComment   // ✅ must match serializer field
      });
      setNewComment('');
      fetchIssueData(); // refresh comments after posting
    } catch (error) {
      setError('Failed to add comment');
      console.error('Error:', error.response?.data || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await issuesAPI.update(id, { status: newStatus });
      setIssue(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      setError('Failed to update status');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <EmployeeLayout>
        <LoadingSpinner message="Loading issue details..." />
      </EmployeeLayout>
    );
  }

  if (!issue) {
    return (
      <EmployeeLayout>
        <div className="text-center text-red-500">Issue not found</div>
      </EmployeeLayout>
    );
  }

  if (error) return <div className="error-container">{error}</div>;

  return (
    <EmployeeLayout>
      <div className="issue-detail">
        <div className="issue-header">
          <button onClick={() => navigate("/employee/my-tasks")} className="back-button">
            ← Back to Issues
          </button>
          <h1>{issue.title}</h1>
          <span className="issue-id">#{issue.id}</span>
        </div>

        <div className="issue-meta">
          <div className="meta-grid">
            <div className="meta-item">
              <label>Status:</label>
              <select 
                value={issue.status} 
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`status-${issue.status.toLowerCase().replace(' ', '-')}`}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            
            <div className="meta-item">
              <label>Priority:</label>
              <span className={`priority-${issue.priority.toLowerCase()}`}>
                {issue.priority}
              </span>
            </div>
            
            <div className="meta-item">
              <label>Assigned To:</label>
              <span>
                {issue.assigned_to 
                  ? (issue.assigned_to.user?.first_name + ' ' + issue.assigned_to.user?.last_name) 
                  : 'Unassigned'}
              </span>
            </div>
            
            <div className="meta-item">
              <label>Deadline:</label>
              <span>
                {issue.issue_deadline 
                  ? new Date(issue.issue_deadline).toLocaleDateString() 
                  : 'No deadline'}
              </span>
            </div>
            
            <div className="meta-item">
              <label>Tags:</label>
              <div className="tags">
                {issue.tags && issue.tags.length > 0 ? (
                  issue.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))
                ) : (
                  <span>No tags</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="issue-content">
          <div className="description-section">
            <h2>Description</h2>
            <p>{issue.description || 'No description provided'}</p>
          </div>

          <div className="comments-section">
            <h2>Comments ({comments.length})</h2>
            
            {comments.length > 0 ? (
              <div className="comments-list">
                {comments.map(comment => (
                  <div key={comment.id} className="comment">
                    <div className="comment-header">
                      <strong>{comment.author_name || 'Unknown User'}</strong>
                      <span>{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No comments yet.</p>
            )}

            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows="4"
                disabled={submitting}
              />
              <button type="submit" disabled={submitting || !newComment.trim()}>
                {submitting ? 'Adding...' : 'Add Comment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default IssueDetail;
