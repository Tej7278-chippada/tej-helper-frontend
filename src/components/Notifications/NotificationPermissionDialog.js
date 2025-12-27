import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Slide,
  LinearProgress,
  Chip,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import ShareLocationRoundedIcon from '@mui/icons-material/ShareLocationRounded';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { urlBase64ToUint8Array } from '../../utils/pushNotifications';
import API from '../api/api';
import DistanceSlider from '../Helper/DistanceSlider';

const NotificationPermissionDialog = ({ open, onClose, darkMode, isMobile }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Intro, 2: Requesting, 3: Success/Error
  const [notificationStatus, setNotificationStatus] = useState(null);
  // const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [notificationTypes, setNotificationTypes] = useState({
    nearbyPosts: true,
    emergencies: true,
    messages: true,
    updates: true
  });
  const [distanceRange, setDistanceRange] = useState(5); // Default distance range in km
  const distanceValues = [2, 5, 10, 20, 50]; // , 20, 50, 70, 100

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  }, [open]);

  const handleEnableNotifications = async () => {
    setLoading(true);
    setStep(2);
    
    try {
      if ('Notification' in window && 'serviceWorker' in navigator) {
        const permission = await Notification.requestPermission();
        setNotificationStatus(permission);
        
        if (permission === 'granted') {
          // Register for push notifications if enabled
          // if (pushNotificationsEnabled) {
            try {
              await registerForPushNotifications();
            } catch (pushError) {
              console.warn('Push notification registration failed:', pushError);
              // Continue even if push fails - browser notifications still work
            }
          // }
          
          setStep(3);
          setTimeout(() => handleDialogClose(true), 1500); // Pass true to indicate success
        } else {
          setStep(3);
          setTimeout(() => handleDialogClose(false), 2000);
        }
      } else {
        setStep(3);
        setTimeout(() => handleDialogClose(false), 2000);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setStep(3);
      setTimeout(() => handleDialogClose(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const registerForPushNotifications = async () => {
    try {
      // Register service worker and get subscription
      const registration = await navigator.serviceWorker.ready;
      
      // Check existing subscription
      // const existingSubscription = await registration.pushManager.getSubscription();
      // if (existingSubscription) {
      //   return; // Already subscribed
      // }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY)
      });

      // Send subscription to backend with proper auth header
      await API.post('/api/notifications/enable-push', {
        token: JSON.stringify(subscription),
        enabled: true,
        notificationRadius: distanceRange,
        notificationPreferences: notificationTypes,
        
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      // console.log('Push notifications registered successfully');
    } catch (error) {
      console.error('Error registering push notifications:', error);
      throw error;
    }
  };

  const handleLater = () => {
    handleDialogClose(false);
  };

  const handleToggleNotificationType = (type) => {
    setNotificationTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleDialogClose = (result = false) => {
    onClose(result);
    // setStep(1);
    // setPushNotificationsEnabled(false);
    // setNotificationStatus(null);
  };


  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Typography variant="body1" mt={0} paragraph>
              Stay updated with nearby posts and never miss important updates in your area!
            </Typography>
            
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              borderRadius: 3,
              bgcolor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.08)',
              border: `1px solid ${darkMode ? 'rgba(144, 202, 249, 0.3)' : 'rgba(25, 118, 210, 0.2)'}`
            }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <TipsAndUpdatesIcon fontSize="small" color="primary" />
                <Typography variant="body2" fontWeight="600" color="primary">
                  Notification Types
                </Typography>
              </Box>
              
              {Object.entries({
                nearbyPosts: 'New posts in your area',
                emergencies: 'Emergency alerts nearby',
                messages: 'New messages',
                updates: 'Post updates & responses'
              }).map(([key, label]) => (
                <Box
                  key={key}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.2,
                  }}
                >
                  <Typography variant="body2">{label}</Typography>
                  <Switch
                    checked={notificationTypes[key]}
                    onChange={() => handleToggleNotificationType(key)}
                    size="small"
                    color="primary"
                  />
                </Box>
              ))}
            </Box>
            <Box sx={{
              mt: 2, 
              p: 2, 
              borderRadius: 3,
              bgcolor: darkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.08)',
              border: `1px solid ${darkMode ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)'}`
            }}>
              <Box display="flex" alignItems="center" gap={1} mb={isMobile ? 2 : 1}>
                <ShareLocationRoundedIcon fontSize="small" sx={{ color: '#4caf50' }} />
                <Typography variant="body2" fontWeight="600" sx={{ color: '#4caf50' }}>
                  Notification distance
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: isMobile ? 2 : 1 }}
              >
                Select how far from your location you’d like to receive notifications.
              </Typography>
              <DistanceSlider distanceRange={distanceRange} setDistanceRange={setDistanceRange}
                // userLocation={currentLocation} mapRef={mapRef}
                isMobile={isMobile}
                // getZoomLevel={getZoomLevel}
                distanceValues={distanceValues} /> 
              <Typography variant="caption" color="text.secondary" marginTop={isMobile ? 3 : 2}display="block">
                You’ll receive notifications within a{' '}
                <strong>{distanceRange} km</strong> radius of your location.
              </Typography>
            </Box>

            <Alert 
              severity="info" 
              sx={{ 
                mt: 2,
                borderRadius: 2,
                '& .MuiAlert-icon': { alignItems: 'center' }
              }}
            >
              <Typography variant="body2">
                <strong>Push Notifications:</strong> Receive alerts even when Helper App is closed
              </Typography>
            </Alert>

            {notificationStatus === 'denied' && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mt: 2,
                  borderRadius: 2
                }}
              >
                <Typography variant="body2">
                  Notifications were previously blocked. Enable them in browser settings.
                </Typography>
              </Alert>
            )}
          </>
        );

      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotificationsActiveIcon sx={{ 
              fontSize: 48, 
              color: 'primary.main', 
              mb: 2,
              animation: 'pulse 1.5s infinite'
            }} />
            <Typography variant="h6" gutterBottom>
              Setting Up Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please allow notifications when prompted...
            </Typography>
            <LinearProgress sx={{ mt: 3, borderRadius: 5 }} />
            <Typography variant="caption" sx={{ display: 'block', mt: 2 }}>
              Configuring your notification preferences
            </Typography>
          </Box>
        );

      case 3:
        if (notificationStatus === 'granted') {
          return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsActiveIcon sx={{ 
                fontSize: 48, 
                color: 'success.main', 
                mb: 2 
              }} />
              <Typography variant="h6" gutterBottom color="success.main">
                Notifications Enabled!
              </Typography>
              <Typography variant="body2" paragraph>
                You'll now receive updates about nearby posts and important alerts.
              </Typography>
              <Box sx={{ mt: 2 }}>
                {/* {pushNotificationsEnabled && ( */}
                  <Chip 
                    label="Push Notifications Active" 
                    color="success" 
                    size="small"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                {/* )} */}
                <Chip 
                  label="Browser Notifications Active" 
                  color="success" 
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          );
        } else {
          return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsOffIcon sx={{ 
                fontSize: 48, 
                color: 'warning.main', 
                mb: 2 
              }} />
              <Typography variant="h6" gutterBottom>
                Notifications Not Enabled
              </Typography>
              <Typography variant="body2" paragraph>
                You can enable notifications later in your browser settings.
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => {
                  if (isMobile) {
                    // Mobile browser guidance
                    alert('Open Settings > Site Settings > Notifications to enable');
                  } else {
                    // Desktop browser guidance
                    alert('Click the lock icon in your address bar to manage notifications');
                  }
                }}
                sx={{ mt: 1 }}
              >
                How to Enable
              </Button>
            </Box>
          );
        }

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => step === 1 && handleDialogClose(false)}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={loading}
      sx={{ 
        '& .MuiPaper-root': { 
          borderRadius: '16px', 
          backdropFilter: 'blur(20px)',
          background: darkMode 
            ? 'rgba(30, 30, 40, 0.95)' 
            : 'rgba(255, 255, 255, 0.98)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        },
        '& .MuiDialogTitle-root': { 
          padding: isMobile ? '20px 20px 8px' : '24px 24px 12px',
          borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
        }, 
        '& .MuiDialogContent-root': { 
          padding: isMobile ? '20px' : '24px',
        },
        '& .MuiDialogActions-root': {
          padding: isMobile ? '16px 20px 20px' : '20px 24px 24px',
          borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
        },
        '@keyframes pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        }
      }}
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
    >
      {step === 1 && (
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
              color: 'white'
            }}>
              <NotificationsActiveIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="700">
                Enable Notifications
              </Typography>
              {/* {isSecondDialog && (
                <Chip 
                  label="Stay Updated" 
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem', mt: 0.5 }}
                />
              )} */}
            </Box>
          </Box>
          <IconButton 
            onClick={() => handleDialogClose(false)}
            size="small"
            disabled={loading}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}
      
      <DialogContent sx={{ pt: step === 1 ? 3 : 0 }}>
        {renderStepContent()}
      </DialogContent>
      
      {step === 1 && (
        <DialogActions sx={{ gap: 1 }}>
          <Button 
            onClick={handleLater}
            disabled={loading}
            variant="outlined"
            sx={{ 
              borderRadius: '12px', 
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            Maybe Later
          </Button>
          <Button 
            onClick={handleEnableNotifications}
            variant="contained"
            disabled={loading}
            disableElevation
            sx={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              color: 'white',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(255, 107, 107, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #ff5252 0%, #c62828 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(255, 107, 107, 0.6)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&.Mui-disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
                boxShadow: 'none',
              },
            }}
          >
            {loading ? 'Enabling...' : 'Enable Notifications'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default NotificationPermissionDialog;