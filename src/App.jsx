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
import MyIssues from './components/MyIssues';
import AdminProfile from './components/AdminProfile';
import UserProfile from './components/UserProfile';
import LoadingSpinner from './components/LoadingSpinner';
import AdminDashboard from './components/AdminDashboard';
import EmployeeLayout from './components/EmployeeLayout'; // NEW
import './styles/App.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      hasError: true,
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;

  return children;
};

const AppRoutes = () => {
  const { isAdmin } = useAuth();

  return (
    <>
      <Navbar />
      <div className="app-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to={isAdmin ? "/admin/dashboard" : "/employee/dashboard"} replace />
              </ProtectedRoute>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/my-issues"
            element={
              <ProtectedRoute>
                <MyIssues />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/issues"
            element={
              <ProtectedRoute>
                <IssueKanban />
              </ProtectedRoute>
            }
          />

          <Route
            path="/issue/create"
            element={
              <ProtectedRoute>
                <IssueForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/issue/edit/:id"
            element={
              <ProtectedRoute>
                <IssueForm editMode={true} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/issue/:id"
            element={
              <ProtectedRoute>
                <IssueDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/my-tasks"
            element={
              <ProtectedRoute>
                <EmployeeTasks />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminProfile />
              </ProtectedRoute>
            }
          />

          {/* Redirect old routes to new employee routes */}
          <Route path="/dashboard" element={<Navigate to="/employee/dashboard" replace />} />
          <Route path="/profile" element={<Navigate to="/employee/profile" replace />} />
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
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;