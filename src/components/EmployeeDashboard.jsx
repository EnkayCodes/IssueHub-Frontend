import React, { useEffect, useState } from 'react';
import { issuesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import EmployeeLayout from './EmployeeLayout';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await issuesAPI.getAll({ assigned_to: user.id });
        setIssues(res.data);
      } catch (err) {
        console.error('Error fetching issues:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchIssues();
  }, [user]);

  const statusCounts = {
    'Not Started': issues.filter((i) => i.status === 'Not Started').length,
    'In Progress': issues.filter((i) => i.status === 'In Progress').length,
    'Completed': issues.filter((i) => i.status === 'Completed').length,
  };

  // Get recent issues (last 5)
  const recentIssues = issues.slice(0, 5);

  if (loading) return (
    <EmployeeLayout>
      <p className="text-center mt-10">Loading dashboard...</p>
    </EmployeeLayout>
  );

  return (
    <EmployeeLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="bg-white p-6 rounded-xl shadow text-center">
              <h3 className="font-semibold text-gray-700">{status}</h3>
              <p className="text-2xl font-bold text-teal-600">{count}</p>
            </div>
          ))}
        </div>

        {/* Recent Issues */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Issues</h2>
            <Link 
              to="/employee/my-tasks" 
              className="text-teal-600 hover:underline font-medium"
            >
              View All Issues
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Priority</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentIssues.length > 0 ? (
                  recentIssues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-gray-50 border-t">
                      <td className="p-3">{issue.title}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          issue.priority === 'High' ? 'bg-red-100 text-red-800' :
                          issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          issue.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <Link 
                          to={`/issue/${issue.id}`} 
                          className="text-teal-600 hover:underline font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">
                      No issues assigned to you yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;