import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { PUBLIC, canAccess } from '../config/access';

/**
 * Gates a route against the rules in config/access.js.
 *
 * Replaces the old <ProtectedRoute>, which hard-coded its role lists inline
 * and sent every rejected visitor to /login with no memory of where they were
 * going. Two distinct outcomes here:
 *
 *   - no session at all  → /login, carrying the attempted location so the
 *     login page can return them to it
 *   - signed in, wrong role → /unauthorized (sending them to /login would be
 *     a lie; logging in again changes nothing)
 */
const RouteGuard = ({ access, children }) => {
  const { role, isGuest, loading } = useAuth();
  const location = useLocation();

  // A PUBLIC route never waits on the session check — guests would otherwise
  // stare at a spinner on the one page that does not need them signed in.
  if (loading && access !== PUBLIC) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (canAccess(access, role)) return children;

  return isGuest
    ? <Navigate to="/login" replace state={{ from: location }} />
    : <Navigate to="/unauthorized" replace />;
};

export default RouteGuard;
