import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ role = 'manager' }) {
  const { session, profile, loading, error } = useAuth();
  const location = useLocation();
  if (loading) return <div className="page-center"><div className="loader" aria-label="Loading account" /></div>;
  if (error) return <div className="page-center"><div className="error-card"><h1>Account could not be verified</h1><p>{error}</p><button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button></div></div>;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  if (profile?.role !== role) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
