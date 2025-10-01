// src/components/AdminReviewPage.jsx
import React, { useEffect, useState } from 'react';
import { reviewAPI } from '../services/api';   // ✅ use reviewAPI
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import '../styles/admin.css';

const AdminReviewPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMap, setFeedbackMap] = useState({});

  // ✅ Load review requests
  useEffect(() => {
    if (!user || !user.is_staff) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await reviewAPI.getAll();
        setRequests(res.data);
      } catch (err) {
        console.error('Failed to load review requests', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // ✅ Approve request
  const handleApprove = async (reqId) => {
    try {
      await reviewAPI.decide(reqId, true, "");
      setRequests(prev => prev.filter(r => r.id !== reqId));
    } catch (err) {
      console.error(err);
      alert('Approve failed');
    }
  };

  // ✅ Reject request with feedback
  const handleReject = async (reqId) => {
    const feedback = feedbackMap[reqId] || '';
    if (!feedback.trim()) {
      if (!window.confirm('Reject without feedback?')) return;
    }
    try {
      await reviewAPI.decide(reqId, false, feedback);
      setRequests(prev => prev.filter(r => r.id !== reqId));
    } catch (err) {
      console.error(err);
      alert('Reject failed');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!user || !user.is_staff) {
    return <div className="p-6">Access denied. Admins only.</div>;
  }

  return (
    <div className="admin-content">
      <div className="dashboard-overview">
        <div className="overview-header">
          <h1>Pending Review Requests</h1>
          <p className="text-gray-600">
            Manage issue review approvals and rejections
          </p>
        </div>

        <div className="content-card">
          {requests.length === 0 ? (
            <div className="empty-column text-gray-400 text-sm text-center py-6">
              No pending review requests.
            </div>
          ) : (
            <ul className="space-y-4">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="p-4 border rounded bg-white shadow-sm"
                >
                  <div className="mb-2">
                    <strong>{r.issue_title}</strong> — requested by{" "}
                    <em>{r.employee}</em>
                    <div className="text-xs text-gray-500">
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="mb-2">
                    <textarea
                      placeholder="Feedback / notes for rejection"
                      value={feedbackMap[r.id] || ""}
                      onChange={(e) =>
                        setFeedbackMap((prev) => ({
                          ...prev,
                          [r.id]: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(r.id)}
                      className="action-btn success"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleReject(r.id)}
                      className="action-btn danger"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviewPage;
