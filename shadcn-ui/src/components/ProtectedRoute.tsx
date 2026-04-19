import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, isAdmin } from '@/lib/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
