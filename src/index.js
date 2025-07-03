import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}> */}
    <App />
    {/* </GoogleOAuthProvider> */}
  </React.StrictMode>
);

// src/index.js
// if ('serviceWorker' in navigator && 'SyncManager' in window) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js')
//       .then(registration => {
//         console.log('ServiceWorker registration successful');
        
//         // Register background sync
//         registration.sync.register('push-notification-sync')
//           .then(() => console.log('Registered background sync'))
//           .catch(err => console.error('Background sync failed:', err));
//       })
//       .catch(err => console.log('ServiceWorker registration failed: ', err));
//   });
// }


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
