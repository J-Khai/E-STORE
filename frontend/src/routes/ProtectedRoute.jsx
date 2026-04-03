import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen mono text-[10px] uppercase">Verifying session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // check if user has the right role
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    console.warn(`Access denied for role: ${user?.role}`);
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
