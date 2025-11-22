// src/App.js
import React, {useEffect, useState} from 'react';
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
import { fetchUnreadNotificationsCount } from './components/api/api';
import { io } from 'socket.io-client';
import Banner from './components/Admin/Banner';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import AdminPage from './components/Admin/AdminPage';
import Feedbacks from './components/Admin/Feedbacks';
import UserManagement from './components/Admin/UserManagement';
import TermsConditions from './components/TermsAndPolicies/TermsConditions';
import PrivacyPolicy from './components/TermsAndPolicies/PrivacyPolicy';
import PostStatusManagement from './components/Admin/PostStatusManagement';
import SystemHealthDashboard from './components/Admin/SystemHealthDashboard';
import AdminPreferences from './components/Admin/AdminPreferences';
import PostReports from './components/Admin/PostReports';
import ProfileVerification from './components/Admin/ProfileVerification';
import PlansComparison from './components/Admin/PlansComparison';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
        // light mode palette
        // primary: {
        //   main: '#4361ee',
        // },
        // secondary: {
        //   main: '#3f37c9',
        // },
        // background: {
        //   default: '#f8f9fa',
        //   paper: '#ffffff',
        // },
      }
      : {
        // dark mode palette
        // primary: {
        //   main: '#4cc9f0',
        // },
        // secondary: {
        //   main: '#4361ee',
        // },
        // background: {
        //   default: '#121212',
        //   paper: '#1e1e1e',
        // },
        // text: {
        //   primary: '#ffffff',
        //   secondary: 'rgba(255, 255, 255, 0.7)',
        // },
        // primary: {
        //   main: '#4361ee',
        //   light: '#6b7fff',
        //   dark: '#2940d3',
        // },
        // secondary: {
        //   main: '#3f37c9',
        //   light: '#6b5fff',
        //   dark: '#2815a8',
        // },
        // background: {
        //   default:  '#121212',
        //   paper: '#1e1e1e' ,
        // },
        // text: {
        //   primary: '#ffffff',
        //   secondary:'rgba(255, 255, 255, 0.7)' ,
        // },
      }),
  },
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

const FloatingBackgroundBalls = ({ darkMode }) => {
  return (
    <>
      <div className={`color-ball color-ball-1 ${darkMode ? 'dark-mode' : ''}`}></div>
      <div className={`color-ball color-ball-2 ${darkMode ? 'dark-mode' : ''}`}></div>
      <div className={`color-ball color-ball-3 ${darkMode ? 'dark-mode' : ''}`}></div>
    </>
  );
};

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


function App() {
  const [socket, setSocket] = useState(null);
  const username = localStorage.getItem('tokenUsername');
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('tokenUsername');
  const [shouldAnimate, setShouldAnimate] = useState(false);
  // Enhanced loading state management for splash screen
  const [isLoading, setIsLoading] = useState(() => {
    // Check if this is the first time the app is loading in this session
    const hasShownSplash = sessionStorage.getItem('hasShownSplash');
    return !hasShownSplash;
  });
  
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const theme = createTheme(getDesignTokens(darkMode ? 'dark' : 'light'));

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    document.documentElement.classList.toggle('dark-mode', newMode);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', newMode ? '#121212' : '#1976d2');
  };

  // Handle loading completion
  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Mark that splash screen has been shown in this session
    sessionStorage.setItem('hasShownSplash', 'true');
  };

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      (async () => {
        try {
          // const registration = 
          await navigator.serviceWorker.register('/service-worker.js');
          console.log('ServiceWorker registration successful');
          // console.log('Scope is:', registration.scope);
        } catch (err) {
          console.error('ServiceWorker registration failed:', err);
        }
      })();
      // registerServiceWorker();
    }

    // Apply dark mode class on initial load
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    }
  }, [darkMode]);

  // Fetch initial notification count
  useEffect(() => {
    const fetchInitialCount = async () => {
      if (username) {
        try {
          const response = await fetchUnreadNotificationsCount();
          const unread = response.data.count;
          setUnreadCount(unread);
          console.log('unreadcount fetched');
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
    };

    fetchInitialCount();
  }, [username]);

  // Track user's webpage presence
  useEffect(() => {
    if (userId && socket) {
      // User comes online when App.js mounts
      socket.emit('userOnline', { userId });
      
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          // User returned to the page - they're online again
          socket.emit('userOnline', { userId });
        } else {
          // User left the page (switched tabs/apps)
          socket.emit('userOffline', { userId });
        }
      };

      // Listen for visibility changes
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        // emit offline when component actually unmounts (user leaves site)
        socket.emit('userOffline', { userId });
      };
    }
  }, [socket, userId]);

  // Initialize socket connection
  useEffect(() => {
    if (userId) {
      const newSocket = io(process.env.REACT_APP_API_URL);
      setSocket(newSocket);

      // Join user's notification room
      // newSocket.emit('joinNotificationsRoom', userId);
      // console.log('notifications room');
      return () => {
        newSocket.disconnect();
      };
    }
  }, [userId]);

   // Listen for notification updates
  useEffect(() => {
    if (socket) {
      socket.on('notificationCountUpdate', (data) => {
        if (data.userId === userId) {
          // Set animation flag when new notification arrives
          setShouldAnimate(true);
          setUnreadCount(data.unreadCount);
          // Remove animation after the duration (1.5s in this case)
          const timer = setTimeout(() => {
            setShouldAnimate(false);
          }, 1500);
          
          return () => clearTimeout(timer);

        }
      });

      // socket.on('newNotification', () => {
      //   // Increment count when new notification arrives
      //   setUnreadCount(prev => prev + 1);
      //   console.log('count increased');
      // });
    }

    return () => {
      if (socket) {
        socket.off('notificationCountUpdate');
        // socket.off('newNotification');
      }
    };
  }, [socket, userId]);

  // Show loading screen first
  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} darkMode={darkMode} />;
  }
 
  return (
    <ThemeProvider theme={theme}>
      <FloatingBackgroundBalls darkMode={darkMode}/>
      <Router>
        <NearPostsNotification darkMode={darkMode}/>
        <Routes>
          <Route path="/login" element={<Login darkMode={darkMode} toggleDarkMode={toggleDarkMode} username={username} unreadCount={unreadCount} shouldAnimate={shouldAnimate}/>} />
          <Route path="/register" element={<Register darkMode={darkMode} toggleDarkMode={toggleDarkMode} username={username} unreadCount={unreadCount} shouldAnimate={shouldAnimate}/>} />
          <Route path="/" element={
            <PrivateRoute>
              <Helper darkMode={darkMode} toggleDarkMode={toggleDarkMode} username={username} unreadCount={unreadCount} shouldAnimate={shouldAnimate}/>
            </PrivateRoute>
          } />
          <Route path="/userPosts" element={
            <PrivateRoute>
              <PostService darkMode={darkMode} toggleDarkMode={toggleDarkMode} username={username} unreadCount={unreadCount} shouldAnimate={shouldAnimate}/>
            </PrivateRoute>
          } />
          <Route path="/forgot-password" element={<ForgotPassword darkMode={darkMode} />} />
          <Route path="/user/:id" element={
            <PrivateRoute>
              <UserProfile darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate}/>
            </PrivateRoute>}
          />
          <Route path="/post/:id" element={<PostDetailsById darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate}/>} />
          <Route path="/wishlist" element={
            <PrivateRoute>
              <WishList darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate}/>
            </PrivateRoute>
          } />
          <Route path="/chatsOfPost/:postId" element={
            <PrivateRoute>
              <ChatsOfPosts darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate}/>
            </PrivateRoute>
          } />
          <Route path="/chat/:chatId" element={
            <PrivateRoute>
              <ChatHistoryPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate}/>
            </PrivateRoute>
          } />
          {/* 404 Not Found Page */}
          <Route path="*" element={<NotFound />} />
          <Route path="/notifications" element={
            <PrivateRoute>
              <NotificationsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} setUnreadCount={setUnreadCount} shouldAnimate={shouldAnimate}/>
            </PrivateRoute>
          } />
          <Route path="/chatsOfUser" element={
            <PrivateRoute>
              <ChatsOfUser darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate}/>
            </PrivateRoute>
          } />
          <Route path="/helperHome" element={
            <PrivateRoute>
              <HelperHome darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate}/>
            </PrivateRoute>
          } />
          <Route path="/adminBanners" element={
            <PrivateRoute adminOnly>
              <Banner darkMode={darkMode} toggleDarkMode={toggleDarkMode} username={username} unreadCount={unreadCount} shouldAnimate={shouldAnimate}/>
            </PrivateRoute>
          } />
          <Route path="/userManagement" element={
            <PrivateRoute adminOnly>
              <UserManagement darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate} username={username}/>
            </PrivateRoute>
          } />
          <Route path="/userFeedbacks" element={
            <PrivateRoute adminOnly>
              <Feedbacks darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate} username={username}/>
            </PrivateRoute>
          } />
          <Route path="/adminPage" element={
            <PrivateRoute adminOnly>
              <AdminPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate} username={username}/>
            </PrivateRoute>
          } />
          <Route path="/post-status-management" element={
            <PrivateRoute adminOnly>
              <PostStatusManagement darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate} username={username}/>
            </PrivateRoute>
          } />
          <Route path="/system-health" element={
            <PrivateRoute adminOnly>
              <SystemHealthDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate} username={username}/>
            </PrivateRoute>
          } />
          <Route path="/admin-preferences" element={
            <PrivateRoute adminOnly>
              <AdminPreferences darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate} username={username}/>
            </PrivateRoute>
          } />
          <Route path="/post-reports" element={
            <PrivateRoute adminOnly>
              <PostReports darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate} username={username}/>
            </PrivateRoute>
          } />
          <Route path="/profile-verification" element={
            <PrivateRoute adminOnly>
              <ProfileVerification darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate} username={username}/>
            </PrivateRoute>
          } />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/plans" element={<PlansComparison />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
