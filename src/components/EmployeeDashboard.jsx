// src/components/EmployeeDashboard.jsx
import React, { useEffect, useState } from 'react';
import { issuesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

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

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center"
          >
            <h3 className="font-semibold text-gray-700">{status}</h3>
            <p className="text-2xl font-bold text-teal-600">{count}</p>
          </div>
        ))}
      </div>

      {/* Issue Table */}
      <h2 className="text-xl font-bold mb-4">Assigned Issues</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-xl shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Title</th>
              <th className="border p-3 text-left">Status</th>
              <th className="border p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.length > 0 ? (
              issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="border p-3">{issue.title}</td>
                  <td className="border p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm font-semibold ${
                        issue.status === 'Completed'
                          ? 'bg-green-100 text-green-700'
                          : issue.status === 'In Progress'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {issue.status}
                    </span>
                  </td>
                  <td className="border p-3">
                    <Link
                      to={`/issue/${issue.id}`}
                      className="text-teal-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  No issues assigned to you yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
