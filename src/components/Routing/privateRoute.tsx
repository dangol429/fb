// privateRoute.tsx
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface RootState {
  auth: {
    isAuthenticated: boolean;
    // other auth-related properties
  };
  // other parts of the Redux state
}
// PrivateRoute component to handle protected routes
const PrivateRoute: React.FC = () => {
  const isAuthenticated = useSelector((state : RootState) => state.auth.isAuthenticated);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
