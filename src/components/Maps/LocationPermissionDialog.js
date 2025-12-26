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
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';
import SecurityIcon from '@mui/icons-material/Security';

const LocationPermissionDialog = ({ open, onClose, darkMode, isMobile, setSnackbar }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Intro, 2: Requesting, 3: Success/Error
  const [locationStatus, setLocationStatus] = useState(null);
  const [deviceLocationSupport, setDeviceLocationSupport] = useState(true);

  useEffect(() => {
    // Check device location support
    if (!('geolocation' in navigator)) {
      setDeviceLocationSupport(false);
    }
  }, []);

  const handleEnableLocation = async () => {
    setLoading(true);
    setStep(2);
    
    try {
      if ('geolocation' in navigator) {
        // Use modern permission API if available
        if (navigator.permissions && navigator.permissions.query) {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          
          if (permission.state === 'granted') {
            // Location already granted
            setLocationStatus('granted');
            setStep(3);
            setTimeout(() => onClose(true, 'granted'), 1500);
            return;
          }
        }

        // Request location permission
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationStatus('granted');
            setStep(3);
            
            // Show success briefly before closing
            setTimeout(() => {
              onClose(true, 'granted');
            }, 1500);
          },
          (error) => {
            console.error('Location error:', error);
            
            if (error.code === error.PERMISSION_DENIED) {
              setLocationStatus('denied');
              setStep(3);
              setTimeout(() => onClose(false, 'denied'), 2000);
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              setLocationStatus('unavailable');
              setStep(3);
              setTimeout(() => onClose(false, 'error'), 2000);
            } else {
              setLocationStatus('error');
              setStep(3);
              setTimeout(() => onClose(false, 'error'), 2000);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
      } else {
        setDeviceLocationSupport(false);
        setLocationStatus('unsupported');
        setStep(3);
        setTimeout(() => onClose(false, 'unsupported'), 2000);
      }
    } catch (error) {
      console.error('Error enabling location:', error);
      setLocationStatus('error');
      setStep(3);
      setTimeout(() => onClose(false, 'error'), 2000);
    }
  };

  const handleLater = () => {
    onClose(false, 'later');
  };

  const handleOpenSettings = () => {
    // Provide guidance for enabling location
    if (isMobile) {
      setSnackbar({
        open: true,
        message: 'Open Settings > Site Settings > Location to enable',
        severity: 'info',
        autoHideDuration: 6000
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Click the lock icon in your address bar to manage site permissions',
        severity: 'info',
        autoHideDuration: 6000
      });
    }
    onClose(false, 'settings');
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Typography variant="body1" mt={1} paragraph>
              Helper needs your location to show relevant posts and services near you.
              This helps you find help and offer assistance in your area.
            </Typography>
            
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              borderRadius: 3,
              bgcolor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.08)',
              border: `1px solid ${darkMode ? 'rgba(144, 202, 249, 0.3)' : 'rgba(25, 118, 210, 0.2)'}`
            }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <GpsFixedIcon fontSize="small" color="primary" />
                <Typography variant="body2" fontWeight="600" color="primary">
                  Benefits of enabling location:
                </Typography>
              </Box>
              <ul style={{ 
                margin: '8px 0', 
                paddingLeft: '20px',
                color: darkMode ? '#e0e0e0' : 'inherit'
              }}>
                <li><Typography variant="body2">See posts within your selected distance range</Typography></li>
                <li><Typography variant="body2">Get accurate distance calculations</Typography></li>
                <li><Typography variant="body2">Receive location-based notifications</Typography></li>
                <li><Typography variant="body2">Help others locate you in emergencies</Typography></li>
              </ul>
            </Box>

            <Box sx={{ 
              mt: 2, 
              p: 2, 
              borderRadius: 3,
              bgcolor: darkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.08)',
              border: `1px solid ${darkMode ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)'}`
            }}>
              <Box display="flex" alignItems="center" gap={1}>
                <SecurityIcon fontSize="small" sx={{ color: '#4caf50' }} />
                <Typography variant="body2" fontWeight="600" sx={{ color: '#4caf50' }}>
                  Your privacy is protected
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1, fontSize: '0.8rem' }}>
                • Your exact location is never publicly shared<br/>
                • Only approximate area is shown to others<br/>
                • You control when to share precise location<br/>
                • Data is encrypted and securely stored
              </Typography>
            </Box>
            
            {!deviceLocationSupport && (
              <Chip 
                label="Location not supported on this device"
                color="error"
                size="small"
                sx={{ mt: 2 }}
              />
            )}
          </>
        );

      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <GpsFixedIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Requesting Location Access
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please allow location access when prompted by your browser...
            </Typography>
            <LinearProgress sx={{ mt: 3, borderRadius: 5 }} />
            <Typography variant="caption" sx={{ display: 'block', mt: 2 }}>
              This may take a few seconds
            </Typography>
          </Box>
        );

      case 3:
        if (locationStatus === 'granted') {
          return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <GpsFixedIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom color="success.main">
                Location Access Granted!
              </Typography>
              <Typography variant="body2" paragraph>
                Your location is now being used to show relevant posts in your area.
              </Typography>
              <Chip label="Success" color="success" sx={{ mt: 2 }} />
            </Box>
          );
        } else {
          return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <GpsNotFixedIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {locationStatus === 'denied' ? 'Location Access Denied' : 'Unable to Access Location'}
              </Typography>
              <Typography variant="body2" paragraph>
                {locationStatus === 'denied' 
                  ? 'You can enable location access later in your browser settings.'
                  : 'Please check your device location settings and try again.'}
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={handleOpenSettings}
                sx={{ mt: 1 }}
              >
                Open Settings Guide
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
      onClose={() => step === 1 && onClose(false, 'later')}
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
              background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
              color: 'white'
            }}>
              <LocationOnIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="700">
                Enable Location Services
              </Typography>
              {/* {isFirstDialog && (
                <Chip 
                  label="Recommended" 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem', mt: 0.5 }}
                />
              )} */}
            </Box>
          </Box>
          <IconButton 
            onClick={() => onClose(false, 'later')} 
            // onClick={() => onClose(false, 'canceled')} 
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
            onClick={handleEnableLocation}
            variant="contained"
            disabled={loading || !deviceLocationSupport}
            disableElevation
            sx={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              color: 'white',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(67, 97, 238, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #3a56d4 0%, #2d0a8c 50%, #5c0b9b 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(67, 97, 238, 0.6)',
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
            {loading ? 'Enabling...' : 'Enable Location'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default LocationPermissionDialog;