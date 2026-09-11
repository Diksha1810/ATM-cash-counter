import React from 'react';
import { Spin } from 'antd';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PublicLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // If already authenticated (and not still checking), redirect away from login/register
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#f5f7fa',
        }}
      >
        <Spin size="large" tip="Checking session..." />
      </div>
    );
  }

  return <Outlet />;
}

export default PublicLayout;
