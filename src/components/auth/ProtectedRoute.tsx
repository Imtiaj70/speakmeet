import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../common/PageLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireCompleteProfile?: boolean;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireCompleteProfile = false,
  requireAdmin = false,
}) => {
  const { isAuthenticated, loading, user, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader message="Verifying authentication credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Restrict admin routes to authorized admins only
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Redirect to profile setup if profile is incomplete and required
  if (
    requireCompleteProfile &&
    user &&
    user.isProfileComplete === false &&
    location.pathname !== '/profile/setup'
  ) {
    return <Navigate to="/profile/setup" replace />;
  }

  return <>{children}</>;
};
