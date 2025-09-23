import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import IssueDetail from './components/IssueDetail';
import IssueForm from './components/IssueForm';
import Register from './components/Register';
import EmployeeDashboard from './components/EmployeeDashboard';
import IssueKanban from './components/IssueKanban';
import EmployeeTasks from './components/EmployeeTasks';
import AdminProfile from './components/AdminProfile';
import UserProfile from './components/UserProfile';
import LoadingSpinner from './components/LoadingSpinner';
import './styles/App.css';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) return <LoadingSpinner />;
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;

  return children;
};

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <div className="app-content">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/issues" element={
            <ProtectedRoute>
              <IssueKanban />
            </ProtectedRoute>
          } />
          
          <Route path="/issues/create" element={
            <ProtectedRoute>
              <IssueForm />
            </ProtectedRoute>
          } />
          
          <Route path="/issues/edit/:id" element={
            <ProtectedRoute>
              <IssueForm editMode={true} />
            </ProtectedRoute>
          } />
          
          <Route path="/issues/:id" element={
            <ProtectedRoute>
              <IssueDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/my-tasks" element={
            <ProtectedRoute>
              <EmployeeTasks />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/profile" element={
            <ProtectedRoute adminOnly={true}>
              <AdminProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;