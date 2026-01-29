import React from 'react';
import { Navigate } from 'react-router-dom';
/**
 * AdminCenter is now deprecated in favor of granular routes.
 * Redirects to the main dashboard.
 */
export default function AdminCenter() {
  return <Navigate to="/admin/dashboard" replace />;
}