import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PublicLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // If already authenticated (and not still checking), redirect away from login/register
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render the public page immediately — no blocking spinner.
  // isLoading will be true briefly while getMe resolves, but we still show the page.
  // If authenticated, the Navigate above will fire once isLoading becomes false.
  return <Outlet />;
}

export default PublicLayout;
