// src/App.js
import React, {useEffect} from 'react';
import './App.css';
import Login from './components/Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import PrivateRoute from './components/PriviteRoute';
import { ThemeProvider, createTheme } from '@mui/material';
import ForgotPassword from './components/ForgotPassword';
import UserProfile from './components/UserProfile';
import Helper from './components/Helper/Helper';
import PostService from './components/Helper/PostService';
import PostDetailsById from './components/Helper/PostDetailsById';
import WishList from './components/Helper/WishList';
import ChatsOfPosts from './components/Chat/ChatsOfPosts';
import ChatsOfUser from './components/Chat/ChatsOfUser';
// import ChatHistory from './components/Chat/ChatHistory';
import ChatHistoryPage from './components/Chat/ChatHistoryPage';
import NotFound from './components/NotFound'; // Import 404 Page
import NotificationsPage from './components/Helper/NotificationsPage';
import NearPostsNotification from './components/Helper/NearPostsNotification';
import HelperHome from './components/Helper/HelperHome';

const theme = createTheme({
  // palette: {
  //   primary: {
  //     main: '#4361ee', // Vibrant blue
  //     contrastText: '#ffffff',
  //   },
  //   secondary: {
  //     main: '#3f37c9', // Deep blue
  //   },
  //   background: {
  //     default: '#f8f9fa', // Light gray
  //     paper: '#ffffff',
  //   },
  //   text: {
  //     primary: '#212529', // Dark gray
  //     secondary: '#6c757d', // Medium gray
  //   },
  //   success: {
  //     main: '#4cc9f0', // Light blue
  //   },
  //   error: {
  //     main: '#f72585', // Pink
  //   },
  //   warning: {
  //     main: '#f8961e', // Orange
  //   },
  //   info: {
  //     main: '#4895ef', // Blue
  //   },
  // },
  // typography: {
  //   fontFamily: [
  //     'Inter',
  //     '-apple-system',
  //     'BlinkMacSystemFont',
  //     '"Segoe UI"',
  //     'Roboto',
  //     '"Helvetica Neue"',
  //     'Arial',
  //     'sans-serif',
  //     '"Apple Color Emoji"',
  //     '"Segoe UI Emoji"',
  //     '"Segoe UI Symbol"',
  //   ].join(','),
  //   h5: {
  //     fontWeight: 600,
  //   },
  // },
  // components: {
  //   MuiButton: {
  //     styleOverrides: {
  //       root: {
  //         borderRadius: '8px',
  //         textTransform: 'none',
  //         fontWeight: 500,
  //         padding: '8px 16px',
  //         boxShadow: 'none',
  //         '&:hover': {
  //           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  //         },
  //       },
  //       contained: {
  //         boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  //       },
  //     },
  //   },
    // MuiCard: {
    //   styleOverrides: {
    //     root: {
    //       borderRadius: '12px',
    //       boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    //       transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    //       '&:hover': {
    //         transform: 'translateY(-2px)',
    //         boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    //       },
    //     },
    //   },
    // },
    // MuiTextField: {
    //   styleOverrides: {
    //     root: {
    //       '& .MuiOutlinedInput-root': {
    //         borderRadius: '8px',
    //       },
    //     },
    //   },
    // },
  // },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      async function registerServiceWorker() {
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js');
          console.log('ServiceWorker registration successful');
        } catch (err) {
          console.error('ServiceWorker registration failed:', err);
        }
      }
      registerServiceWorker();
    }
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <NearPostsNotification/>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <PrivateRoute>
              <Helper />
            </PrivateRoute>
          } />
          <Route path="/userPosts" element={
            <PrivateRoute>
              <PostService />
            </PrivateRoute>
          } />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/user/:id" element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>}
          />
          <Route path="/post/:id" element={<PostDetailsById />} />
          <Route path="/wishlist" element={
            <PrivateRoute>
              <WishList />
            </PrivateRoute>
          } />
          <Route path="/chatsOfPost/:postId" element={
            <PrivateRoute>
              <ChatsOfPosts />
            </PrivateRoute>
          } />
          <Route path="/chat/:chatId" element={
            <PrivateRoute>
              <ChatHistoryPage />
            </PrivateRoute>
          } />
          {/* 404 Not Found Page */}
          <Route path="*" element={<NotFound />} />
          <Route path="/notifications" element={
            <PrivateRoute>
              <NotificationsPage />
            </PrivateRoute>
          } />
          <Route path="/chatsOfUser" element={
            <PrivateRoute>
              <ChatsOfUser />
            </PrivateRoute>
          } />
          <Route path="/helperHome" element={
            <PrivateRoute>
              <HelperHome />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
