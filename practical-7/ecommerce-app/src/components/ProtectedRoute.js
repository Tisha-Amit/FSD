import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps any route that requires authentication.
 * If the user is not logged in, redirects to /login.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // While restoring session from localStorage, don't flash redirect
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
