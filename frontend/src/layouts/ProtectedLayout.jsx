import React from 'react';
import { Layout, Spin } from 'antd';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useATM } from '../hooks/useATM';
import { useOfflineSync } from '../hooks/useOfflineSync';

export function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { pendingCount, syncPending, isSyncing } = useATM();
  const { isOnline } = useOfflineSync(syncPending);

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
        <Spin size="large" tip="Verifying session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Navbar
        isOnline={isOnline}
        pendingCount={pendingCount}
        onSync={syncPending}
        isSyncing={isSyncing}
      />
      <Outlet />
    </Layout>
  );
}

export default ProtectedLayout;
