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
  Card
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import API, { clearAllNotifications, fetchNotifications, markNotificationAsRead } from '../api/api';
import Layout from '../Layout';
import SkeletonCards from './SkeletonCards';
import { NotificationsActiveRounded, NotificationsOffRounded } from '@mui/icons-material';
import { io } from 'socket.io-client';
import ClearAllRoundedIcon from '@mui/icons-material/ClearAllRounded';
import { urlBase64ToUint8Array } from '../../utils/pushNotifications';
import SkeletonChats from '../Chat/SkeletonChats';

// Enhanced styled components
const NotificationsContainer = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  overflow: 'hidden',
  backgroundClip: 'padding-box', // border vertices radius exact match
}));

// Enhanced glassmorphism styles
const getGlassmorphismStyle = (opacity = 0.15, blur = 20) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: `blur(${blur}px)`,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
});

function NotificationsPage({darkMode, toggleDarkMode, unreadCount, shouldAnimate}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loadingView, setLoadingView] = useState(null);
  // Add this to your PostService.js component
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [loadingClear, setLoadingClear] = useState(false);
  const tokenUsername = localStorage.getItem('tokenUsername');
  
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

    const checkNotificationStatus = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await API.get('/api/notifications/notification-status', {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });
        setNotificationsEnabled(response.data.notificationEnabled);
      } catch (error) {
        console.error('Error checking notification status:', error);
      }
    };

    fetchNotificationsData();
    checkNotificationStatus();
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        setLoadingView(notification._id);
        await markNotificationAsRead(notification._id);
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
    navigate(`/post/${notification.postId._id}`);
  };

  // Add this function to request notification permissions
  const toggleNotifications  = async () => {
    setLoadingToggle(true);
    try {
      // Check if service worker and push manager are supported
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service workers not supported in this browser');
      }
      if (!('PushManager' in window)) {
        throw new Error('Push notifications not supported in this browser');
      }

      if (loadingToggle) return null;

      if (!notificationsEnabled) {
  
        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error(' Browser Notifications Permission not granted');
        }
        // console.log('VAPID Public Key:', process.env.REACT_APP_VAPID_PUBLIC_KEY);
    
        // Register service worker and get subscription
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY)
        });
    
        // Send to backend with proper auth header
        await API.post('/api/notifications/enable-push', {
          token: JSON.stringify(subscription),
          enabled: true
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
    
        setNotificationsEnabled(true);
        setSnackbar({ 
          open: true, 
          message: 'Notifications enabled successfully!', 
          severity: 'success' 
        });

        // Reconnect socket to ensure notifications are received
        if (socket) {
          socket.emit('joinRoom', userId);
        }

      } else {
        // Disable notifications
        await API.post('/api/notifications/enable-push', {
          token: null,
          enabled: false
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        setNotificationsEnabled(false);
        setSnackbar({ 
          open: true, 
          message: 'Notifications Disabled!', 
          severity: 'info' 
        });
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      setSnackbar({ 
        open: true, 
        message: `Failed to toggling notifications: ${error.message}`,
        severity: 'error' 
      });
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleClearAll = async () => {
    setLoadingClear(true);
    try {
      await clearAllNotifications();
      setNotifications([]);
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
          <IconButton 
            onClick={toggleNotifications} disabled={loading}
            sx={{ backgroundColor: notificationsEnabled ? '#2e7d32' : '#d32f2f', color: '#fff', '&:hover': { backgroundColor: '#1565c0', opacity: 0.8 } }}
          >
            {!loadingToggle ?  (notificationsEnabled ? <NotificationsActiveRounded /> : <NotificationsOffRounded />) : <CircularProgress size={24} color='white'/>}
          </IconButton>
          </Box>
        </Toolbar>

        <NotificationsContainer sx={{ p: '10px 12px', borderRadius: 3 }} elevation={3}> {/* Paper bgcolor: '#f5f5f5', */}
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
                            bgcolor: 'grey.100',
                            transform: 'scale(1.01)',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                          },
                          '&:active': {
                            transform: 'scale(1.03)',
                            boxShadow: '0 6px 14px rgba(0, 0, 0, 0.2)',
                            borderRadius: '14px'
                          },
                          borderLeft: !notification.isRead 
                            ? `4px solid ${theme.palette.primary.main}`
                            : 'null', // 4px solid transparent
                          // transition: 'border-left 0.3s ease'
                      }}
                    >
                      <ListItemText
                        primary={notification.message}
                        secondary={new Date(notification.createdAt).toLocaleString()}
                        sx={{ color: darkMode ? !notification.isRead ? '#ffffff' : 'text.secondary' : !notification.isRead ? 'black' : 'text.secondary' }}
                      />
                      {loadingView === notification._id ? (
                        <CircularProgress size={20} />
                      ) : (
                        !notification.isRead && <Badge color="primary" variant="dot" />
                      )}
                    </ListItem>
                    {/* <Divider sx={{ width: '90%', mx: 'auto' }} /> */}
                  </React.Fragment>
                ))
              )}
            </List>
          )}
        </NotificationsContainer>
      </Box>
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
    </Layout>
  );
}

export default NotificationsPage;