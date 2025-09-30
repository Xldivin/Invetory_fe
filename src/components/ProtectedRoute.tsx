import * as React from "react";
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
}

export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { user, hasPermission } = useAuth();
  const location = useLocation();

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If permission is required and user doesn't have it, redirect to dashboard
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  // Role-based restrictions: Hide POS and Events for tenant_admin
  if (user.role === 'tenant_admin') {
    const restrictedRoutes = ['/pos', '/events'];
    if (restrictedRoutes.includes(location.pathname)) {
      return <Navigate to="/dashboard" replace state={{ from: location }} />;
    }
  }

  return <>{children}</>;
}
