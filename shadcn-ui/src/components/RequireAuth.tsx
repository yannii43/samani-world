import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth-store';

type Role = 'admin' | 'client';

export default function RequireAuth({
  children,
  role,
}: {
  children: React.ReactElement;
  role?: Role;
}) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  // Not logged in -> go login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Logged in but wrong role
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
