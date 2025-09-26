import React, { useEffect, useState } from 'react';
import { issuesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import EmployeeLayout from '../components/EmployeeLayout';

const MyIssues = () => {
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

  if (loading) return (
    <EmployeeLayout>
      <p className="text-center mt-10">Loading issues...</p>
    </EmployeeLayout>
  );

  return (
    <EmployeeLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">My Issues</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-xl shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-3 text-left">Title</th>
                <th className="border p-3 text-left">Priority</th>
                <th className="border p-3 text-left">Status</th>
                <th className="border p-3 text-left">Created Date</th>
                <th className="border p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.length > 0 ? (
                issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="border p-3">{issue.title}</td>
                    <td className="border p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        issue.priority === 'High' ? 'bg-red-100 text-red-800' :
                        issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="border p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        issue.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="border p-3">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </td>
                    <td className="border p-3">
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
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No issues assigned to you yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default MyIssues;