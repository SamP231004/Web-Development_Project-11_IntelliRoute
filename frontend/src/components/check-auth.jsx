import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './useToast';

export default function CheckAuth({ children, protectedRoute, requiredRole }) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const navigate = useNavigate();
  const showToast = useToast();

  useEffect(() => {
    let parsedUser = null;
    if (user) {
      try {
        parsedUser = JSON.parse(user);
      }
      catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        localStorage.removeItem("user");
        parsedUser = null;
      }
    }

    if (protectedRoute) {
      if (!token) {
        showToast("You need to log in to access this page.", "error");
        navigate('/login'); return;
      }
      if (requiredRole && parsedUser?.role !== requiredRole) {
        showToast("You do not have permission to access this page.", "error");
        navigate('/');
        return;
      }
    } 
    else {
      if (token) {
        showToast("You are already logged in.", "info");
        navigate('/');
        return;
      }
    }
  }, [token, user, protectedRoute, requiredRole, navigate, showToast]);
  if (protectedRoute) {
    if (!token) return null;
    if (requiredRole && user && JSON.parse(user)?.role !== requiredRole) return null;
  } 
  else {
    if (token) return null;
  }

  return <>{children}</>;
}