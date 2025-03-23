import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Layout components
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

// Page components
import Landing from '@/pages/Landing';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import Dashboard from '@/pages/Dashboard/Dashboard';
import ProjectsPage from '@/pages/Projects/ProjectsPage';
import ProjectDetails from '@/pages/Projects/ProjectDetails';
import NewProject from '@/pages/Projects/NewProject';
import DiagramEditor from '@/pages/Diagrams/DiagramEditor';
import NotFound from '@/pages/NotFound';
import BreadcrumbComponent from '@/components/Breadcrumb';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const isDiagramEditor = location.pathname.startsWith('/diagrams/');

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Full screen layout for diagram editor
  if (isDiagramEditor) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* <Header /> */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Default layout with sidebar for other protected routes
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4">
          {/* <BreadcrumbComponent /> */}
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Router>  {/* ✅ Wrap everything inside <Router> */}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
        <Route path="/projects/new" element={<ProtectedRoute><NewProject /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
        <Route path="/diagrams/:id" element={<ProtectedRoute><DiagramEditor /></ProtectedRoute>} />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;