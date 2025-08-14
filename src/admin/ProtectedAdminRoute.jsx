
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// RBAC: Only allow users with ROLE_ADMIN to access admin routes
export default function ProtectedAdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user || user.role !== 'ROLE_ADMIN') {
    // Redirect non-admins to login
    return <Navigate to="/login" replace />;
  }
  // Render nested admin routes via <Outlet />
  return <Outlet />;
}
