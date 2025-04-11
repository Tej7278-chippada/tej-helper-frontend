// /src/UserContext.js
import React, { createContext, useEffect, useState } from 'react';
import { userData } from '../utils/userData';
// import { useUserData } from '../hooks/useUserData';

// Create a context for the user
export const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const loggedUserData = userData();

  // Initialize userId from localStorage on app load
  useEffect(() => {
    // const storedUserId = localStorage.getItem('userId');
    const storedUserId = loggedUserData?.userId;
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Update localStorage whenever userId changes
  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
    }
  }, [userId]);

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};