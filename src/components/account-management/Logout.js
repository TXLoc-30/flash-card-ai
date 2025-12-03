/**
 * Displays a spinner for 1 second when logging out.
 */

import React, { useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { firebaseAuth } from '../../provider/AuthProvider';
import useAuth from '../../hooks/useAuth';

import Spinner from '../Spinner';

const Logout = () => {
  const { user } = useContext(firebaseAuth);
  const { handleLogout } = useAuth();
  const history = useHistory();
  const logoutInitiated = useRef(false);
  const timeoutRef = useRef(null);

  // Initiate logout when component mounts and user exists
  useEffect(() => {
    if (user && !logoutInitiated.current) {
      logoutInitiated.current = true;
      handleLogout();
    }
  }, [user, handleLogout]);

  // Redirect when user becomes null (logout successful) or after timeout
  useEffect(() => {
    if (!user && logoutInitiated.current) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Redirect immediately since logout is complete
      timeoutRef.current = setTimeout(() => {
        history.push("/");
      }, 500);
    } else if (!user && !logoutInitiated.current) {
      // User was already logged out, redirect immediately
      history.push("/");
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, history]);

  return (
    <div className="container center">
      <p><Spinner /> Logging out . . .</p>
    </div>
  );
}

export default Logout;