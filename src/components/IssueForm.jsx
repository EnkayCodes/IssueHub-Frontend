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
    status: 'Open', // Match Django default
    priority: 'Low', // Match Django default
    assigned_to: '', // Correct field name (not assignee)
    issue_deadline: '', // Add this field
    tags: [] // Optional field
  });

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
    if (editMode) {
      fetchIssue();
    } else {
      setLoading(false);
    }
  }, [editMode, id]);

  const fetchEmployees = async () => {
    try {
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
        description: issue.description || '',
        status: issue.status,
        priority: issue.priority,
        assigned_to: issue.assigned_to?.id || issue.assigned_to || '', // Use correct field name
        issue_deadline: issue.issue_deadline || '',
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

  const handleDateTimeChange = (e) => {
    setFormData(prev => ({ ...prev, issue_deadline: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Prepare data to match EXACT Django model field names
      const apiData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assigned_to: formData.assigned_to || null, // Correct field name
        issue_deadline: formData.issue_deadline || null, // Add this field
        tags: formData.tags
      };

      console.log('Sending data to API:', apiData);

      if (editMode) {
        await issuesAPI.update(id, apiData);
      } else {
        await issuesAPI.create(apiData);
      }
      navigate('/issues');
    } catch (error) {
      console.error('Full error details:', error);
      console.error('Error response data:', error.response?.data);
      
      if (error.response?.data) {
        // Handle Django REST framework validation errors
        if (typeof error.response.data === 'object') {
          const errorMessages = [];
          for (const [field, messages] of Object.entries(error.response.data)) {
            errorMessages.push(`${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`);
          }
          setError(`Validation errors: ${errorMessages.join('; ')}`);
        } else {
          setError(error.response.data.detail || 'Failed to save issue');
        }
      } else {
        setError('Failed to save issue. Please check your connection.');
      }
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
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
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
          <label htmlFor="assigned_to">Assigned To *</label>
          <select
            id="assigned_to"
            name="assigned_to"
            value={formData.assigned_to}
            onChange={handleChange}
            required
          >
            <option value="">Select an employee</option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {employee.user?.first_name} {employee.user?.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="issue_deadline">Deadline (Optional)</label>
          <input
            type="datetime-local"
            id="issue_deadline"
            name="issue_deadline"
            value={formData.issue_deadline}
            onChange={handleDateTimeChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated, optional)</label>
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
            onClick={() => navigate('/issues')}
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