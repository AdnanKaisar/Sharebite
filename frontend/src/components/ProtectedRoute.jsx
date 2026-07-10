import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05060b] text-[#10B981]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-emerald-500/25 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wider animate-pulse">LOADING FOODBRIDGE...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard if role doesn't match
    const dashboardRoutes = {
      donor: '/donor-dashboard',
      ngo: '/ngo-dashboard',
      volunteer: '/volunteer-dashboard',
      admin: '/admin-dashboard'
    };
    return <Navigate to={dashboardRoutes[user.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
