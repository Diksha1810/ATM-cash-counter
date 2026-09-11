import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loadable from '../utils/Loadable';

// Lazy-loaded page components with Loadable HOC
const LoginPage = Loadable(lazy(() => import('../pages/LoginPage')));
const RegisterPage = Loadable(lazy(() => import('../pages/RegisterPage')));
const DashboardPage = Loadable(lazy(() => import('../pages/DashboardPage')));
const TransactionsPage = Loadable(lazy(() => import('../pages/TransactionsPage')));
const NotFoundPage = Loadable(lazy(() => import('../pages/NotFoundPage')));

// Layout wrappers
const ProtectedLayout = Loadable(lazy(() => import('../layouts/ProtectedLayout')));
const PublicLayout = Loadable(lazy(() => import('../layouts/PublicLayout')));

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes (Guest only, redirects authenticated users to /dashboard) */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected routes (Requires authentication) */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
      </Route>

      {/* Root redirect and fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
