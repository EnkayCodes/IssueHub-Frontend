import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issuesAPI, employeeAPI } from '../services/api'; // Change usersAPI to employeeAPI
import { useAuth } from '../contexts/AuthContext';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../utils/constants';
import LoadingSpinner from './LoadingSpinner';
import '../styles/App.css';

const IssueForm = ({ editMode = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    assignee: '',
    tags: []
  });

  const [employees, setEmployees] = useState([]); // Change users to employees
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees(); // Change function name
    if (editMode) {
      fetchIssue();
    } else {
      setLoading(false);
    }
  }, [editMode, id]);


  const fetchEmployees = async () => { // Change function name
    try {
      // Use employeeAPI instead of usersAPI
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchIssue = async () => {
    try {
      setLoading(true);
      const response = await issuesAPI.getById(id);
      const issue = response.data;
      
      setFormData({
        title: issue.title,
        description: issue.description,
        status: issue.status?.label || issue.status,
        priority: issue.priority?.label || issue.priority,
        assignee: issue.assignee,
        tags: issue.tags || []
      });
    } catch (error) {
      setError('Failed to fetch issue');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    

    try {
      if (editMode) {
        await issuesAPI.update(id, formData);
      } else {
        await issuesAPI.create(formData);
      }
      navigate('/issues');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save issue');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading..." />;

  return (
    <div className="issue-form">
      <div className="form-header">
        <h1>{editMode ? 'Edit Issue' : 'Create New Issue'}</h1>
        <button onClick={() => navigate('/issues')} className="back-button">
          ← Back to Issues
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter issue title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="6"
            placeholder="Describe the issue in detail..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              {PRIORITY_OPTIONS.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
        <label htmlFor="assignee">Assignee</label>
        <select
          id="assignee"
          name="assignee"
          value={formData.assignee}
          onChange={handleChange}
        >
          <option value="">Unassigned</option>
          {employees.map(employee => ( // Change users to employees
            <option key={employee.id} value={employee.id}>
              {employee.user?.first_name} {employee.user?.last_name} {/* Adjust based on your API response */}
            </option>
          ))}
        </select>
      </div>

      
        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags.join(', ')}
            onChange={handleTagsChange}
            placeholder="e.g., bug, frontend, urgent"
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/issue')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting}
          >
            {submitting ? 'Saving...' : (editMode ? 'Update Issue' : 'Create Issue')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IssueForm;