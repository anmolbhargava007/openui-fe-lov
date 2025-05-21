
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { isAuthenticated, loading, userRole } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }

  // Redirect based on user role
  if (userRole === 1) {
    return <Navigate to="/admin/dashboard" />;
  }

  return <Navigate to="/dashboard" />;
};

export default Index;
