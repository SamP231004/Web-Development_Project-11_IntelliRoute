// frontend2/src/components/check-auth.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './useToast';

export default function CheckAuth({ children, protectedRoute, requiredRole }) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user'); // User string from localStorage
  const navigate = useNavigate();
  const showToast = useToast();

  useEffect(() => {
    let parsedUser = null;
    if (user) {
      try {
        parsedUser = JSON.parse(user);
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        localStorage.removeItem("user"); // Clear corrupted user data
        parsedUser = null;
      }
    }

    if (protectedRoute) {
      // If route is protected but no token, redirect to login
      if (!token) {
        showToast("You need to log in to access this page.", "error");
        navigate('/login');
        return; // Important: Stop further execution
      }
      // If role is required and user's role doesn't match, redirect
      if (requiredRole && parsedUser?.role !== requiredRole) {
        showToast("You do not have permission to access this page.", "error");
        navigate('/'); // Redirect to a default authenticated page (e.g., tickets)
        return; // Important: Stop further execution
      }
    } else { // Public routes (like login/signup)
      // If already logged in, redirect away from login/signup
      if (token) {
        showToast("You are already logged in.", "info");
        navigate('/'); // Redirect to a default authenticated page (e.g., tickets)
        return; // Important: Stop further execution
      }
    }
  }, [token, user, protectedRoute, requiredRole, navigate, showToast]);

  // Render children only if all checks pass, otherwise null (redirection handles visibility)
  if (protectedRoute) {
    if (!token) return null; // If protected and no token, don't render children
    if (requiredRole && user && JSON.parse(user)?.role !== requiredRole) return null; // If protected, role required, and role doesn't match, don't render
  } else { // Public route
    if (token) return null; // If public and logged in, don't render children (as it will redirect)
  }

  return <>{children}</>;
}