// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { userData } from '../utils/userData';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const authToken = localStorage.getItem('authToken'); // Retrieve token from localStorage
  // const userId = localStorage.getItem('userId');
  // const userRole = localStorage.getItem('userRole'); // Assuming you store role in localStorage
  const loggedUserData = userData();
  const userId = (loggedUserData?.userId || '');
  const userRole = (loggedUserData?.userRole );
  // console.log('userid', userId, userRole);

  if (!authToken || !userId) {
    // If no token, redirect to root with a state message
    return <Navigate to="/login" state={{ message: 'Please login first.' }} />;
  }

  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/" state={{ message: 'Access denied. Admin privileges required.' }} />;
  }

  return children; // If token exists, allow access to the children components
};

export default PrivateRoute;
