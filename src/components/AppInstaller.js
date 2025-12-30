import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import ShareIcon from '@mui/icons-material/Share';

const AppInstaller = ({ darkMode }) => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    // Check if app is already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || 
                   window.navigator.standalone || 
                   document.referrer.includes('android-app://'));

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 30 seconds of usage
      setTimeout(() => {
        if (!isStandalone) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsStandalone(true);
      setShowInstallPrompt(false);
      setSnackbar({
        open: true,
        message: 'Helper app installed successfully!',
        severity: 'success'
      });
    });

    // Check if user dismissed the prompt before
    const hasDismissed = localStorage.getItem('installPromptDismissed');
    if (hasDismissed) {
      setShowInstallPrompt(false);
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setSnackbar({
          open: true,
          message: 'Installing Helper app...',
          severity: 'info'
        });
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Helper App',
          text: 'Check out Helper - Local Help & Services app',
          url: 'https://helper.net.in'
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText('https://helper.net.in');
      setSnackbar({
        open: true,
        message: 'Link copied to clipboard!',
        severity: 'success'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Install Prompt Dialog */}
      <Dialog 
        open={showInstallPrompt} 
        onClose={handleDismiss}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: darkMode 
              ? 'rgba(30, 30, 30, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            maxWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            📱 Install Helper App
          </Typography>
          <IconButton onClick={handleDismiss} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <InstallMobileIcon sx={{ fontSize: 60, color: '#4361ee', mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Install Helper app for better experience:
            </Typography>
            <Box sx={{ textAlign: 'left', mt: 2 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                ✅ Faster loading
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                ✅ Push notifications
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                ✅ Work offline
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                ✅ App icon on home screen
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
          <Button
            variant="contained"
            onClick={handleInstallClick}
            startIcon={<InstallMobileIcon />}
            sx={{
              flex: 1,
              borderRadius: '12px',
              py: 1.5,
              background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #3f37c9 0%, #3a0ca3 100%)'
              }
            }}
          >
            Install App
          </Button>
          <Button
            variant="outlined"
            onClick={handleShare}
            startIcon={<ShareIcon />}
            sx={{ flex: 1, borderRadius: '12px', py: 1.5, ml: 2 }}
          >
            Share
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AppInstaller;