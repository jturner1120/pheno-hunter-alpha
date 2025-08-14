import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedAdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user || user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
