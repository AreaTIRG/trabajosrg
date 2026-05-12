import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';
import JobList from './pages/public/JobList';
import JobDetail from './pages/public/JobDetail';
import ApplyForm from './pages/public/ApplyForm';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import JobsManager from './pages/admin/JobsManager';
import JobForm from './pages/admin/JobForm';
import Applications from './pages/admin/Applications';
import CandidateDetail from './pages/admin/CandidateDetail';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/apply/:jobId" element={<ApplyForm />} />
        </Route>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="jobs" element={<JobsManager />} />
          <Route path="jobs/new" element={<JobForm />} />
          <Route path="jobs/:id/edit" element={<JobForm />} />
          <Route path="applications" element={<Applications />} />
          <Route path="candidates/:id" element={<CandidateDetail />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
