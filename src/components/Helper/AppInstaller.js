// src/components/Header.js
import React, { useEffect, useState } from 'react';
import GetAppIcon from '@mui/icons-material/GetApp';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import { ListItemIcon, MenuItem } from '@mui/material';

const AppInstaller = ({isMobile, handleClose}) => {
     // PWA Install states
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // PWA Install Logic
  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
        return true;
      }
      
      // Check for iOS Safari
      if (window.navigator.standalone === true) {
        setIsInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
        return true;
      }
      
      // Check for Chrome/Edge
      if (document.referrer.startsWith('android-app://')) {
        setIsInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
        return true;
      }

      // Check localStorage for previous install status
      const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
      if (wasInstalled) {
        setIsInstalled(true);
        return true;
      }

      return false;
    };

    const isCurrentlyInstalled = checkIfInstalled();

    // If not installed, check for cached installability or browser support
    if (!isCurrentlyInstalled) {
      // Check if we previously detected installability
      const cachedInstallable = localStorage.getItem('pwa-installable') === 'true';
      const cachedPrompt = localStorage.getItem('pwa-deferred-prompt');
      
      if (cachedInstallable) {
        setIsInstallable(true);
        
        // Try to restore deferred prompt if available
        if (cachedPrompt && window.deferredInstallPrompt) {
          setDeferredPrompt(window.deferredInstallPrompt);
        }
      } else {
        // Check if browser supports PWA installation
        const supportsPWA = 'serviceWorker' in navigator && 
                           ('BeforeInstallPromptEvent' in window || 
                            navigator.userAgent.includes('Chrome') || 
                            navigator.userAgent.includes('Edge'));
        
        if (supportsPWA) {
          setIsInstallable(true);
          localStorage.setItem('pwa-installable', 'true');
        }
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Cache the installability state and prompt
      localStorage.setItem('pwa-installable', 'true');
      window.deferredInstallPrompt = e; // Store globally for navigation persistence
      
      console.log('PWA install prompt available');
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      
      // Update localStorage
      localStorage.setItem('pwa-installed', 'true');
      localStorage.removeItem('pwa-installable');
      localStorage.removeItem('pwa-deferred-prompt');
      
      // Clear global reference
      if (window.deferredInstallPrompt) {
        delete window.deferredInstallPrompt;
      }
      
      console.log('PWA was installed');
    };

    // Only add event listeners if not already installed
    if (!isCurrentlyInstalled) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    }

    return () => {
      if (!isCurrentlyInstalled) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      }
    };
  }, []);

  // Handle PWA installation
  const handleInstallClick = async () => {
    // Check for globally stored prompt first
    const globalPrompt = window.deferredInstallPrompt || deferredPrompt;
    
    if (!globalPrompt) {
      // For iOS Safari or other browsers
      if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
        alert('To install this app on iOS:\n1. Tap the Share button (⬆️)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to install');
        return;
      }
      
      // For other browsers that don't support install prompt
      if (navigator.userAgent.includes('Firefox')) {
        alert('To install this app in Firefox:\n1. Click the menu button (☰)\n2. Look for "Install" or "Add to Home Screen" option');
        return;
      }
      
      // Generic fallback
      alert('To install this app:\n1. Look for "Install" option in your browser menu\n2. Or try "Add to Home Screen" from browser options\n3. This feature may not be supported in your current browser');
      return;
    }

    try {
      // Show the install prompt
      const result = await globalPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await globalPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        // Don't immediately clear state, let the 'appinstalled' event handle it
      } else {
        console.log('User dismissed the install prompt');
        // Keep the installable state since user just declined this time
      }
      
    } catch (error) {
      console.error('Error showing install prompt:', error);
      // If prompt fails, keep installable state for retry
    }
  };

    return (
        <>
        {/* Install App Menu Item */}
        {/* Install App Menu Item */}
        {(isInstallable || (!isInstalled && !isInstallable)) && (
          <MenuItem onClick={() => { handleInstallClick(); handleClose(); }}>
            <ListItemIcon>
              {isMobile ? 
                <InstallMobileIcon fontSize="small" sx={{ color: '#4CAF50' }} /> : 
                <GetAppIcon fontSize="small" sx={{ color: '#4CAF50' }} />
              }
            </ListItemIcon>
            {isInstallable ? 'Install App' : 'Add to Home Screen'}
          </MenuItem>
        )}

        {/* App Installed Menu Item */}
        {isInstalled && (
          <MenuItem disabled>
            <ListItemIcon>
              {isMobile ? 
                <InstallMobileIcon fontSize="small" sx={{ color: '#4CAF50' }} /> : 
                <GetAppIcon fontSize="small" sx={{ color: '#4CAF50' }} />
              }
            </ListItemIcon>
            App Installed ✓
          </MenuItem>
        )}
          </>
    );
}; 

export default AppInstaller;