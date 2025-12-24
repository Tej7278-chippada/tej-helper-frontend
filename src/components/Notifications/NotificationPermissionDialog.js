import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  useTheme,
  Slide
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { urlBase64ToUint8Array } from '../../utils/pushNotifications';
import API from '../api/api';

const NotificationPermissionDialog = ({ open, onClose, darkMode, isMobile }) => {
  const [loading, setLoading] = useState(false);
  const gradientHover = 'linear-gradient(135deg, #3a56d4 0%, #2d0a8c 50%, #5c0b9b 100%)';

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      if ('Notification' in window && 'serviceWorker' in navigator) {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          
          // Register for push notifications
          await registerForPushNotifications();
          
          onClose(true); // Pass true to indicate success
        } else {
          onClose(false);
        }
      } else {
        alert('Your browser does not support notifications.');
        onClose(false);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      onClose(false);
    } finally {
      setLoading(false);
    }
  };

  const registerForPushNotifications = async () => {
    try {
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
    } catch (error) {
      console.error('Error registering push notifications:', error);
      throw error;
    }
  };

  const handleLater = () => {
    onClose(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => onClose(false)}
      maxWidth="sm"
      fullWidth
      sx={{ 
        '& .MuiPaper-root': { borderRadius: '14px', backdropFilter: 'blur(12px)', },
        '& .MuiDialogTitle-root': { padding: isMobile ? '14px' : '18px', }, '& .MuiDialogContent-root': { padding: isMobile ? '12px' : '24px', }
      }}
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <NotificationsActiveIcon color="primary" />
          <Typography variant="h6" fontWeight="600">
            Enable Notifications
          </Typography>
        </Box>
        <IconButton onClick={() => onClose(false)} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body1" paragraph>
          Stay updated with nearby posts that match your interests!
        </Typography>
        
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          borderRadius: 3,
          bgcolor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.08)',
          border: `1px solid ${darkMode ? 'rgba(144, 202, 249, 0.3)' : 'rgba(25, 118, 210, 0.2)'}`
        }}>
          <Typography variant="body2" fontWeight="500" color="primary" gutterBottom>
            You'll receive notifications for:
          </Typography>
          <ul style={{ 
            margin: '8px 0', 
            paddingLeft: '20px',
            color: darkMode ? '#e0e0e0' : 'inherit'
          }}>
            <li><Typography variant="body2">New posts near your location</Typography></li>
            <li><Typography variant="body2">Posts matching your saved preferences</Typography></li>
            <li><Typography variant="body2">Emergency help requests in your area</Typography></li>
            <li><Typography variant="body2">Messages and updates about your posts</Typography></li>
          </ul>
        </Box>
        
        <Typography variant="body2" sx={{ mt: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
          You can change this anytime in your notification settings.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3, pt: 1 }}>
        <Button 
          onClick={handleLater}
          variant="outlined"
          sx={{ mr: 1, borderRadius: '12px', textTransform: 'none',
            transition: 'all 0.3s ease',
            // boxShadow: '0 4px 20px rgba(67, 97, 238, 0.3)',
            '&:hover': {
              // background: gradientHover,
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 25px rgba(67, 97, 238, 0.4)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
           }}
        >
          Maybe Later
        </Button>
        <Button 
          onClick={handleEnableNotifications}
          variant="contained"
          // color="primary"
          disabled={loading}
          disableElevation
          sx={{ margin: "0rem", borderRadius: 3, background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', textTransform: 'none', color: 'white',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(67, 97, 238, 0.3)',
            '&:hover': {
              background: gradientHover,
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 25px rgba(67, 97, 238, 0.4)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&.Mui-disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.26)',
            },
          }}
        >
          {loading ? 'Enabling...' : 'Enable Notifications'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationPermissionDialog;