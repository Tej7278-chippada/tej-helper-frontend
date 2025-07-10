// /utils/userData.js

import { jwtDecode } from 'jwt-decode';

export const userData = () => {   // getUserIdFromToken
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  // const authToken = localStorage.getItem('authToken');
  // const decodedToken = JSON.parse(atob(authToken.split('.')[1]));
  // const currentUserId = decodedToken.id;

  try {
    const decoded = jwtDecode(token);
    return {    // this is from: jwt.sign({ id: user._id, ... })
        userId : decoded.id, // assuming token includes: { id: user._id }
        userName : decoded.tokenUsername, // make sure this field is actually named `tokenUsername` in your token
        userRole : decoded.userRole
    };

  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};