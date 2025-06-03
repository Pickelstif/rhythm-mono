import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isOrganizer, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rhythm-600 dark:border-rhythm-400 border-t-transparent mx-auto"></div>
          <p className="text-rhythm-600 dark:text-rhythm-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (!isOrganizer) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8 max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You need organizer permissions to access this application. 
            Please contact your administrator for access.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-rhythm-600 dark:bg-rhythm-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-rhythm-700 dark:hover:bg-rhythm-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 