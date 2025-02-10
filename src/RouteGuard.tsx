import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './auth';

interface RouteGuardProps {
  children: ReactNode;
  requiresAuth: boolean;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, requiresAuth }) => {
  const isUserAuthenticated = isAuthenticated();

  if (requiresAuth && !isUserAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!requiresAuth && isUserAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;
