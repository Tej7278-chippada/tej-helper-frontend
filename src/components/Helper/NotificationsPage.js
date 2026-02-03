// /src/components/Helper/NotificationsPage.js
import React, { useState, useEffect } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Badge,
  Box,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  styled,
  alpha,
  Card,
  Chip,
  Button
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import API, { clearAllNotifications, fetchNotifications, markNotificationAsRead } from '../api/api';
import Layout from '../Layout';
// import SkeletonCards from './SkeletonCards';
import { SettingsSuggestRounded } from '@mui/icons-material';
import { io } from 'socket.io-client';
import ClearAllRoundedIcon from '@mui/icons-material/ClearAllRounded';
// import { urlBase64ToUint8Array } from '../../utils/pushNotifications';
import SkeletonChats from '../Chat/SkeletonChats';
// import { BloodtypeRounded, CheckCircleRounded, CancelRounded } from '@mui/icons-material';
import UserProfileDetails from './UserProfileDetails';
import NotificationSettings from '../Notifications/NotificationSettings';

// Enhanced styled components
// const NotificationsContainer = styled(Card)(({ theme }) => ({
//   background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
//   borderRadius: '16px',
//   boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
//   border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
//   overflow: 'hidden',
//   backgroundClip: 'padding-box', // border vertices radius exact match
// }));

// Enhanced glassmorphism styles
const getGlassmorphismStyle = (opacity = 0.15, blur = 20) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: `blur(${blur}px)`,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
});

function NotificationsPage({darkMode, toggleDarkMode, unreadCount, setUnreadCount, shouldAnimate}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loadingView, setLoadingView] = useState(null);
  // Add this to your PostService.js component
  // const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  // const [loadingToggle, setLoadingToggle] = useState(false);
  const [loadingClear, setLoadingClear] = useState(false);
  const tokenUsername = localStorage.getItem('tokenUsername');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginMessage, setLoginMessage] = useState({ open: false, message: "", severity: "info" });
  const [isUserProfileOpen, setUserProfileOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  
  // Add this effect to check current notification status
  // useEffect(() => {
  //   const checkNotificationStatus = async () => {
  //     try {
  //       const authToken = localStorage.getItem('authToken');
  //       const response = await API.get('/api/notifications/notification-status', {
  //         headers: {
  //           Authorization: `Bearer ${authToken}`
  //         }
  //       });
  //       setNotificationsEnabled(response.data.notificationEnabled);
  //     } catch (error) {
  //       console.error('Error checking notification status:', error);
  //     }
  //   };
  //   checkNotificationStatus();
  // }, []);
  
    
  
  // Add this useEffect to check notification status on component mount
  // useEffect(() => {
  //   if ('Notification' in window && navigator.serviceWorker) {
  //     // Check if notifications are already enabled
  //     Notification.requestPermission().then(permission => {
  //       if (permission === 'granted') {
  //         // You might want to update UI to show notifications are enabled
  //       }
  //     });
  //   }
  // }, []);

  const [socket, setSocket] = useState(null);
  const userId = localStorage.getItem('userId');

  // Add this useEffect for socket connection
  useEffect(() => {
    const newSocket = io(`${process.env.REACT_APP_API_URL}`); // Replace with your backend URL
    setSocket(newSocket);
    const authToken = localStorage.getItem('authToken');
    setIsAuthenticated(!!authToken);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchNotificationsData = async () => {
      try {
        const response = await fetchNotifications();
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    // const checkNotificationStatus = async () => {
    //   try {
    //     const authToken = localStorage.getItem('authToken');
    //     const response = await API.get('/api/notifications/notification-status', {
    //       headers: {
    //         Authorization: `Bearer ${authToken}`
    //       }
    //     });
    //     setNotificationsEnabled(response.data.notificationEnabled);
    //   } catch (error) {
    //     console.error('Error checking notification status:', error);
    //   }
    // };

    fetchNotificationsData();
    // checkNotificationStatus();
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        setLoadingView(notification._id);
        await markNotificationAsRead(notification._id);
        setUnreadCount(prev => prev - 1);
        setNotifications(notifications.map(n => 
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
        // Emit event to update badge count
        // if (socket) {
        //   socket.emit('notificationRead', userId);
        // }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      } finally {
        setLoadingView(null);
      }
    }
    if(notification.notificationType === 'blood_request') {
      navigate(`/user/${notification.userId}`);
    } else if (notification.notificationType === 'blood_request_update' || 'follower') {
      handleOpenUserProfileDialog(notification.otherUserId);
    } else {
      navigate(`/post/${notification.postId._id}`);
    }
  };

  // Add this function to request notification permissions
  // const toggleNotifications  = async () => {
  //   setLoadingToggle(true);
  //   try {
  //     // Check if service worker and push manager are supported
  //     if (!('serviceWorker' in navigator)) {
  //       throw new Error('Service workers not supported in this browser');
  //     }
  //     if (!('PushManager' in window)) {
  //       throw new Error('Push notifications not supported in this browser');
  //     }

  //     if (loadingToggle) return null;

  //     if (!notificationsEnabled) {
  
  //       // Request permission
  //       const permission = await Notification.requestPermission();
  //       if (permission !== 'granted') {
  //         throw new Error(' Browser Notifications Permission not granted');
  //       }
  //       // console.log('VAPID Public Key:', process.env.REACT_APP_VAPID_PUBLIC_KEY);
    
  //       // Register service worker and get subscription
  //       const registration = await navigator.serviceWorker.ready;
  //       const subscription = await registration.pushManager.subscribe({
  //         userVisibleOnly: true,
  //         applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY)
  //       });
    
  //       // Send to backend with proper auth header
  //       await API.post('/api/notifications/enable-push', {
  //         token: JSON.stringify(subscription),
  //         enabled: true
  //       }, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  //         }
  //       });
    
  //       setNotificationsEnabled(true);
  //       setSnackbar({ 
  //         open: true, 
  //         message: 'Notifications enabled successfully!', 
  //         severity: 'success' 
  //       });

  //       // Reconnect socket to ensure notifications are received
  //       if (socket) {
  //         socket.emit('joinRoom', userId);
  //       }

  //     } else {
  //       // Disable notifications
  //       await API.post('/api/notifications/enable-push', {
  //         token: null,
  //         enabled: false
  //       }, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  //         }
  //       });

  //       setNotificationsEnabled(false);
  //       setSnackbar({ 
  //         open: true, 
  //         message: 'Notifications Disabled!', 
  //         severity: 'info' 
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error toggling notifications:', error);
  //     setSnackbar({ 
  //       open: true, 
  //       message: `Failed to toggling notifications: ${error.message}`,
  //       severity: 'error' 
  //     });
  //   } finally {
  //     setLoadingToggle(false);
  //   }
  // };

  const handleClearAll = async () => {
    setLoadingClear(true);
    try {
      await clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      // Emit event to update badge count
      // if (socket) {
      //   socket.emit('allNotificationsRead', userId);
      // }
      setSnackbar({
        open: true,
        message: 'All notifications cleared!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      setSnackbar({
        open: true,
        message: 'Failed to clear notifications',
        severity: 'error'
      });
    } finally {
      setLoadingClear(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleOpenUserProfileDialog = (id) => {
    if (!isAuthenticated) { // Prevent unauthenticated actions
      setLoginMessage({
        open: true,
        message: 'Please log in first. Click here to login.',
        severity: 'warning',
      });
      return;
    } 
    setSelectedUserId(id);
    setUserProfileOpen(true);
  };
  
  const handleCloseUserProfileDialog = () => {
    setUserProfileOpen(false);
    setSelectedUserId(null);
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }) : '—';

  const formatNotificationType = (type) => {
    if (!type) return "";
    return type
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // notification dialog handler
  const handleNotificationDialogClose = (enabled) => {
    setShowNotificationDialog(false);
    localStorage.setItem('notificationPermissionRequested', enabled ? 'granted' : 'denied');
    if (enabled) {
      setSnackbar({ 
        open: true, 
        message: 'Notifications enabled successfully', 
        severity: 'success' 
      });
    }
  };

  return (
    <Layout username={tokenUsername} darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate}>
      <Box sx={{ p: isMobile ? '6px' : '10px', maxWidth: '800px', mx: 'auto' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant={isMobile ? 'h6' : 'h6'} fontWeight={600} sx={{background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'}}>
            Notifications ({notifications.filter(n => !n.isRead).length})
          </Typography>
          <Box>
          <IconButton 
            onClick={handleClearAll}
            disabled={loading || notifications.length === 0 || loadingClear}
            sx={{ 
              mr: 2,
              color: 'text.secondary',
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
              '&:hover': { 
                color: 'error.main',
                backgroundColor: 'rgba(211, 47, 47, 0.08)' 
              }
            }}
            aria-label="clear all notifications"
          >
            {loadingClear ? <CircularProgress size={24} /> : <ClearAllRoundedIcon />}
          </IconButton>
          {/* <Button 
            variant="contained"
            color={notificationsEnabled ? 'success' : 'primary'}
            onClick={requestNotificationPermission}
            startIcon={<NotificationAdd />}
          >
            {notificationsEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
          </Button>
          <IconButton sx={{ backgroundColor: '#1976d2', color: '#fff', '&:hover': { backgroundColor: '#1565c0' } }}>
            <NotificationsActive />
          </IconButton> */}
          {/* <IconButton 
            onClick={toggleNotifications} disabled={loading}
            sx={{ backgroundColor: notificationsEnabled ? '#2e7d32' : '#d32f2f', color: '#fff', '&:hover': { backgroundColor: '#1565c0', opacity: 0.8 } }}
          >
            {!loadingToggle ?  (notificationsEnabled ? <NotificationsActiveRounded /> : <NotificationsOffRounded />) : <CircularProgress size={24} color='white'/>}
          </IconButton> */}
          <IconButton 
            onClick={() => setShowNotificationDialog(true)}
            disabled={loading}
            sx={{ 
              color: 'text.secondary',
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
              '&:hover': { 
                color: '#fff',
                backgroundColor: '#1565c0' 
              }
            }}
          >
            <SettingsSuggestRounded/>
          </IconButton>
          </Box>
        </Toolbar>

        {/* <NotificationsContainer sx={{ p: '10px 12px', borderRadius: 3 }} elevation={3}>  */}
          {/* Paper bgcolor: '#f5f5f5', */}
          {loading ? (
            <SkeletonChats />
          ) : (
            <List>
              {notifications.length === 0 ? (
                <Typography variant="body1" textAlign="center" sx={{ py: 2 }}>
                  No notifications yet
                </Typography>
              ) : (
                notifications.map((notification) => (
                  <React.Fragment key={notification._id}>
                    <ListItem 
                      component="div"
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        // bgcolor: !notification.isRead ? 'primary.light' : 'background.paper',
                        // bgcolor: !notification.isRead ? 'background.paper' : 'grey.200',
                        ...getGlassmorphismStyle(!notification.isRead ? 0.1 : 0.01, !notification.isRead ? 10 : 1),
                        borderRadius: 2,
                        mb: 1,
                        p: '10px 16px', cursor:'pointer',
                        // '&:hover': { bgcolor: 'grey.100' },
                        // borderRadius: '8px',
                          transition: 'transform 0.2s, box-shadow 0.2s, border-radius 0.2s',
                          WebkitTapHighlightColor: 'transparent', // Removes the default tap highlight
                          '&:hover': {
                            // bgcolor: darkMode ? 'grey.800' : 'grey.100',
                            transform: 'scale(1.01)',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                          },
                          '&:active': {
                            transform: 'scale(1.03)',
                            boxShadow: '0 6px 14px rgba(0, 0, 0, 0.2)',
                            borderRadius: '14px'
                          },
                          borderLeft: !notification.isRead 
                              ? notification.notificationType === ('blood_request' || 'blood_request_update') ? `4px solid #ff5252` : `4px solid ${theme.palette.primary.main}`
                            : 'null', // 4px solid transparent
                          // transition: 'border-left 0.3s ease'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                      {/* {notification.notificationType === 'blood_request' && (
                        <BloodtypeRounded sx={{ color: '#ff5252', mt: 0.5 }} />
                      )}
                      {notification.notificationType === 'blood_request_update' && (
                        notification.message.includes('accepted') 
                          ? <CheckCircleRounded sx={{ color: '#4caf50', mt: 0.5 }} />
                          : <CancelRounded sx={{ color: '#ff5252', mt: 0.5 }} />
                      )} */}
                      <ListItemText
                        primary={notification.message}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between', mt: 1 }}>
                            {/* {notification.notificationType === 'blood_request' && ( */}
                              <Chip
                                label={formatNotificationType(notification.notificationType)}
                                size="small" 
                                sx={{ 
                                  // backgroundColor: '#ffebee', 
                                  // color: '#d32f2f',
                                  fontSize: '0.7rem',
                                  height: 20
                                }} 
                              />
                            {/* )} */}
                            {formatDate(notification.createdAt)}
                          </Box>
                          }
                        sx={{ color: darkMode ? !notification.isRead ? '#ffffff' : 'text.secondary' : !notification.isRead ? 'black' : 'text.secondary' }}
                      />
                      {loadingView === notification._id ? (
                        <CircularProgress size={20} />
                      ) : (
                        !notification.isRead && <Badge color="primary" variant="dot" />
                      )}
                      </Box>
                    </ListItem>
                    {/* <Divider sx={{ width: '90%', mx: 'auto' }} /> */}
                  </React.Fragment>
                ))
              )}
            </List>
          )}
        {/* </NotificationsContainer> */}
      </Box>
      {/* Rating Dialog */}
      <UserProfileDetails
        userId={selectedUserId}
        open={isUserProfileOpen}
        onClose={handleCloseUserProfileDialog}
        // post={post}
        isMobile={isMobile}
        isAuthenticated={isAuthenticated} setLoginMessage={setLoginMessage}  setSnackbar={setSnackbar} darkMode={darkMode}
      />

      <NotificationSettings
        open={showNotificationDialog}
        onClose={handleNotificationDialogClose}
        darkMode={darkMode}
        isMobile={isMobile}
        setSnackbar={setSnackbar}
        socket={socket}
        userId={userId}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius:'1rem' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Snackbar
        open={loginMessage.open}
        autoHideDuration={9000}
        onClose={() => setLoginMessage({ ...loginMessage, open: false })}
        message={
          <span>
            Please log in first.{" "}
            <Link
              to="/login"
              style={{ color: "yellow", textDecoration: "underline", cursor: "pointer" }}
            >
              Click here to login
            </Link>
          </span>
        }
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
        <Alert
          severity="warning"
          variant="filled"
          sx={{
            backgroundColor: "#333",
            color: "#fff",
            borderRadius: "10px",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            // padding: "12px 20px",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          }}
          action={
            <Button
              component={Link}
              to="/login"
              size="small"
              sx={{
                color: "#ffd700",
                fontWeight: "bold",
                textTransform: "none",
                border: "1px solid rgba(255, 215, 0, 0.5)",
                borderRadius: "5px",
                // padding: "3px 8px",
                marginLeft: "10px",
                "&:hover": {
                  backgroundColor: "rgba(255, 215, 0, 0.2)",
                },
              }}
            >
              Login
            </Button>
          }
        >
          Please log in first.
        </Alert>
      </Snackbar>
    </Layout>
  );
}

export default NotificationsPage;