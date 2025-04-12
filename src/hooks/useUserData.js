// hooks/useUserData.js

// src/utils/tokenHelpers.js (or wherever you defined getUserIdFromToken)
// import { jwtDecode } from 'jwt-decode';
// import { refreshAuthToken } from '../components/api/api';
// import { refreshAuthToken } from '../api/api'; // ✅ import from api.js

// export const useUserData = async () => {
//   let authToken = localStorage.getItem('authToken');
//   if (!authToken) return null;

//   try {
//     const decoded = jwtDecode(authToken);
//     const currentTime = Date.now() / 1000;

//     // Check if expiring soon
//     if (decoded.exp < currentTime + 60) {
//       authToken = await refreshAuthToken(); // ✅ Reuse imported function
//       if (!authToken) return null;
//     }

//     const newDecoded = jwtDecode(authToken);
//     return {
//       userId: newDecoded.id,
//       userName: newDecoded.tokenUsername,
//     };
//   } catch (error) {
//     console.error('Token error:', error);
//     return null;
//   }
// };



// import { jwtDecode } from 'jwt-decode';

// export const getUserIdFromToken = () => {
//   const token = localStorage.getItem('authToken');
//   if (!token) return null;

//   try {
//     const decoded = jwtDecode(token);
//     return {    // this is from: jwt.sign({ id: user._id, ... })
//         userId : decoded.id, // assuming token includes: { id: user._id }
//         userName : decoded.tokenUsername // make sure this field is actually named `tokenUsername` in your token
//     };

//   } catch (error) {
//     console.error('Failed to decode token:', error);
//     return null;
//   }
// };

// import { useState, useEffect } from 'react';
// import { jwtDecode } from 'jwt-decode';

// export const useUserData = () => {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem('authToken');
//     if (!token) return;

//     try {
//       const decoded = jwtDecode(token);
//       setUser({
//         userId: decoded.id,
//         userName: decoded.tokenUsername,
//       });
//       console.error('Token decode failed:', useruserId);
//     } catch (err) {
//       console.error('Token decode failed:', err);
//     }
//   }, []);

//   return user;
// };




// import { useEffect, useState } from 'react';
// // import { decodeJWT } from '../utils/jwtUtils';
// import { jwtDecode } from 'jwt-decode';

// export const useUserData = () => {
//   const [userData, setUserData] = useState(null);

//   useEffect(() => {
//     const authToken = localStorage.getItem('authToken');
//     let decodedUserId = '';
//     // let decodedUsername = '';

//     if (authToken) {
//         try {
//             const decoded = jwtDecode(authToken); // decoded is an object: { id, tokenUsername, iat, exp }
//             if (decoded) {
//                 setUserData({
//                     decodedUserId : decoded.id,
//                     decodedUsername : decoded.tokenUsername,
//                 });
                
//             }
//             console.log("Decoded User ID userData:", decodedUserId);
            
//         } catch (err) {
//             console.error('Invalid token:', err);
//         }
//     }
//     // if (authToken) {
//     //   const decoded = decodeJWT(authToken);
//     //   if (decoded) {
//     //     setUserData({
//     //       userId: decoded.id,
//     //       username: decoded.tokenUsername
//     //     });
//     //   }
//     // }
//   }, []);

//   return userData;
// };