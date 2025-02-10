import React from 'react';
import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
  isLoggedIn: boolean;
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ isLoggedIn, children }) => {
  if (isLoggedIn) {
    // Redirect to "/" if the user is logged in and trying to access public routes
    return <Navigate to="/" replace />;
  }

  // Allow access to the public route
  return <>{children}</>;
};

export default PublicRoute;
