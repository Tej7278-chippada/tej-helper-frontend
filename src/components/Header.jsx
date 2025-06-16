// src/components/Header.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, useMediaQuery, IconButton, Menu, MenuItem, Dialog, ListItemIcon, Avatar, Divider, Badge, useScrollTrigger, Tooltip, Fade, Slide, Button, } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { userData } from '../utils/userData';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import GetAppIcon from '@mui/icons-material/GetApp';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import { fetchUnreadNotificationsCount } from './api/api';
import {
  Home as HomeIcon,
  Chat as ChatIcon,
  Favorite as FavoriteIcon,
  PostAdd as PostAddIcon,
} from '@mui/icons-material';
import { io } from 'socket.io-client';


// Enhanced scrolling behavior
function ElevationScroll({ children }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

// Custom glassmorphism styling
const getGlassmorphismStyle = (theme) => ({
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
});

const Header = ({ username }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [loggedInUsers, setLoggedInUsers] = useState([]);
  const navigate = useNavigate();
  const [currentUsername, setCurrentUsername] = useState(username || '');
  const loggedUserData = userData();
  const userId = (loggedUserData?.userId || '');
  const userProfilePic = localStorage.getItem('tokenProfilePic');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  
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
        return;
      }
      
      // Check for iOS Safari
      if (window.navigator.standalone === true) {
        setIsInstalled(true);
        return;
      }
      
      // Check for Chrome/Edge
      if (document.referrer.startsWith('android-app://')) {
        setIsInstalled(true);
        return;
      }
    };

    checkIfInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle PWA installation
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // For iOS Safari or other browsers
      if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
        alert('To install this app on iOS: tap the Share button and then "Add to Home Screen"');
        return;
      }
      
      // For other browsers that don't support install prompt
      alert('To install this app, look for "Install" or "Add to Home Screen" option in your browser menu');
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };
  
  // Initialize socket connection
  useEffect(() => {
    if (userId) {
      const newSocket = io(process.env.REACT_APP_API_URL);
      setSocket(newSocket);

      // Join user's notification room
      newSocket.emit('joinNotificationsRoom', userId);

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
        setUnreadCount(data.unreadCount);
      }
    });

    socket.on('newNotification', () => {
      // Increment count when new notification arrives
      setUnreadCount(prev => prev + 1);
    });
  }

  return () => {
    if (socket) {
      socket.off('notificationCountUpdate');
      socket.off('newNotification');
    }
  };
}, [socket, userId]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  // Load logged-in users from localStorage
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('loggedInUsers')) || [];
    setLoggedInUsers(users);

    // Load the last active user from localStorage if available
    const activeUser = (loggedUserData?.userName || '');
    if (activeUser) {
      const tokens = JSON.parse(localStorage.getItem('authTokens')) || {};
      const activeToken = tokens[username];
      if (activeToken) {
        localStorage.setItem('authToken', activeToken); // Ensure the correct token is set
      }
      setCurrentUsername(activeUser);
      console.log('logged user:', currentUsername);
    }

  }, [username]);

  // Fetch initial notification count
  useEffect(() => {
    const fetchInitialCount = async () => {
      if (currentUsername) {
        try {
          const response = await fetchUnreadNotificationsCount();
          const unread = response.data.count;
          setUnreadCount(unread);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
    };

    fetchInitialCount();
  }, [currentUsername]);

  const handleProfileClick = (event) => {
    // fetchNotificationCount();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    const tokens = JSON.parse(localStorage.getItem('authTokens')) || {};
    delete tokens[currentUsername]; // Remove current user's token
    localStorage.setItem('authTokens', JSON.stringify(tokens));

    // Remove current user from logged-in users list
    const updatedUsers = loggedInUsers.filter(user => user !== currentUsername);
    localStorage.setItem('loggedInUsers', JSON.stringify(updatedUsers));
    setLoggedInUsers(updatedUsers);
    localStorage.removeItem('authToken'); // Clear current session token
    setAnchorEl(null);
    setCurrentUsername('');
    localStorage.removeItem('activeUser'); // Clear active user on logout
    localStorage.removeItem('tokenUsername');
    localStorage.removeItem('userId');
    localStorage.removeItem('userLocation');
    localStorage.removeItem('distanceRange');
    localStorage.removeItem('tokenProfilePic');
    localStorage.clear();
    navigate('/login');
  };

  // After successful login, update loggedInUsers and authTokens in localStorage
  useEffect(() => {
    if (username) {
      const users = JSON.parse(localStorage.getItem('loggedInUsers')) || [];
      if (!users.includes(username)) {
        users.push(username);
        localStorage.setItem('loggedInUsers', JSON.stringify(users));
      }

      // Store each user's auth token
      const tokens = JSON.parse(localStorage.getItem('authTokens')) || {};
      tokens[username] = localStorage.getItem('authToken'); // Save current token
      localStorage.setItem('authTokens', JSON.stringify(tokens));
      setCurrentUsername(username); // Set initial username on login
      localStorage.setItem('activeUser', username); // Save active user
    }
  }, [username]);

  const openUserProfile = () => {
    navigate(`/user/${userId}`); //, { replace: true }
  };

  // Navigation items for mobile menu
  const navigationItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/', activeColor: '#4CAF50', bgColor: 'rgba(76, 175, 80, 0.1)' },
    { label: 'My Posts', icon: <PostAddIcon />, path: '/userPosts', activeColor: '#2196F3', bgColor:'rgba(33, 150, 243, 0.1)' },
    { label: 'Chats', icon: <ChatIcon />, path: '/chatsOfUser', activeColor: '#FF5722', bgColor: 'rgba(255, 87, 34, 0.1)' },
    { label: 'Wishlist', icon: <FavoriteIcon />, path: '/wishlist', activeColor: '#E91E63', bgColor: 'rgba(233, 30, 99, 0.1)' }, ];

  const currentPath = location.pathname;

  return (
    <Box sx={{ flexGrow: 1, marginBottom: isMobile ? '3.5rem' : '4rem' }}>
      <ElevationScroll>
        <AppBar position="fixed" sx={{
          ...getGlassmorphismStyle(theme),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: 0,
          borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isScrolled
              ? 'linear-gradient(135deg, rgba(67, 97, 238, 0.1) 0%, rgba(63, 55, 201, 0.1) 100%)'
              : 'transparent',
            transition: 'background 0.3s ease',
            zIndex: -1,
          }
        }}>
          <Toolbar sx={{
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 2, sm: 3 },
            justifyContent: 'space-between'
          }}>
            {/* Logo Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                component="div"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, // 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)'
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  }
                }}
              >
                <Link
                  to="/"
                  style={{
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  Helper
                </Link>
              </Typography>
            </Box>
            
            {/* Desktop Navigation */}
            {currentUsername && !isMobile && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mr: 2
              }}>
                {navigationItems.map((item) => (
                  <Tooltip key={item.path} title={item.label} arrow>
                    <IconButton
                      component={Link}
                      to={item.path}
                      sx={{                                 // '#4361ee'
                        color: currentPath === item.path ? item.activeColor : 'rgba(0, 0, 0, 0.6)',
                        backgroundColor: currentPath === item.path ? item.bgColor : 'transparent', //'rgba(67, 97, 238, 0.1)'
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: item.bgColor, //'rgba(67, 97, 238, 0.1)'
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      {item.icon}
                    </IconButton>
                  </Tooltip>
                ))}
              </Box>
            )}

            {/* User Profile Section */}
            {currentUsername && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Notifications Badge */}
                <Tooltip title="Notifications" arrow>
                  <IconButton
                    component={Link}
                    to="/notifications"
                    sx={{
                      color: 'rgba(0, 0, 0, 0.6)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(67, 97, 238, 0.1)',
                        transform: 'translateY(-2px)',
                      }
                    }}
                  >
                    <Badge
                      badgeContent={unreadCount}
                      color="error"
                      max={99}
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.75rem',
                          minWidth: '20px',
                          height: '20px',
                          borderRadius: '10px', transform: 'translate(25%, -25%)',
                          animation: unreadCount > 0 ? 'pulse 1.5s ease' : 'none', // infinite , ease
                          '@keyframes pulse': {
                            '0%': { transform: 'translate(25%, -25%) scale(1)' },
                            '50%': { transform: 'translate(25%, -25%) scale(1.2)' },
                            '100%': { transform: 'translate(25%, -25%) scale(1)' }
                          }
                        }
                      }}
                    >
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* Install App Button */}
                {(isInstallable || (!isInstalled && !isInstallable)) && (
                  <Tooltip 
                    title={isInstallable ? "Install App" : "Add to Home Screen"} 
                    arrow
                  >
                    <IconButton
                      onClick={handleInstallClick}
                      sx={{
                        color: 'rgba(0, 0, 0, 0.6)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.1)',
                          transform: 'translateY(-2px)',
                          color: '#4CAF50',
                        },
                        '&::after': isInstallable ? {
                          content: '""',
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#4CAF50',
                          animation: 'installPulse 2s infinite ease-in-out',
                          '@keyframes installPulse': {
                            '0%': { 
                              transform: 'scale(0.8)',
                              opacity: 1 
                            },
                            '50%': { 
                              transform: 'scale(1.2)',
                              opacity: 0.7 
                            },
                            '100%': { 
                              transform: 'scale(0.8)',
                              opacity: 1 
                            }
                          }
                        } : {}
                      }}
                    >
                      {isMobile ? <InstallMobileIcon /> : <GetAppIcon />}
                    </IconButton>
                  </Tooltip>
                )}

                {/* App Installed Indicator */}
                {isInstalled && (
                  <Tooltip title="App Installed ✓" arrow>
                    <IconButton
                      disabled
                      sx={{
                        color: '#4CAF50',
                        opacity: 0.7,
                      }}
                    >
                      {isMobile ? <InstallMobileIcon /> : <GetAppIcon />}
                    </IconButton>
                  </Tooltip>
                )}

                {/* Profile Avatar */}
                <Tooltip title={`${currentUsername}`} arrow>
                  <IconButton
                    onClick={handleProfileClick}
                    sx={{
                      p: 0,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      }
                    }}
                  >
                    <Avatar
                      src={
                        userProfilePic === null
                          ? 'https://placehold.co/56x56?text=No+Image'
                          : `data:image/jpeg;base64,${userProfilePic}`
                      }
                      sx={{
                        width: 40,
                        height: 40,
                        border: '3px solid rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 600,
                      }}
                    >
                      {currentUsername[0]?.toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Toolbar>
        </AppBar>
      </ElevationScroll>

      {/* Enhanced Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            ...getGlassmorphismStyle(theme),
            mt: 1,
            minWidth: 200,
            borderRadius: 3,
            overflow: 'hidden',
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                transform: 'translateX(8px)',
              },
            },
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4361ee' }}>
            Welcome back!
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
            {currentUsername}
          </Typography>
        </Box>

        <MenuItem onClick={() => { openUserProfile(); handleClose(); }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" sx={{ color: '#4361ee' }} />
          </ListItemIcon>
          My Profile
        </MenuItem>

        <MenuItem onClick={() => { navigate('/notifications'); handleClose(); }}>
          <ListItemIcon>
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsIcon fontSize="small" sx={{ color: '#4361ee' }} />
            </Badge>
          </ListItemIcon>
          Notifications
        </MenuItem>

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

        <Divider sx={{ my: 1 }} />

        <MenuItem
          onClick={() => { handleLogout(); handleClose(); }}
          sx={{
            color: '#d32f2f',
            '&:hover': {
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
            }
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: '#d32f2f' }} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Mobile Navigation Drawer */}
      <Dialog
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        PaperProps={{
          sx: {
            ...getGlassmorphismStyle(theme),
            borderRadius: '20px 20px 0 0',
            maxWidth: '100%',
            width: '100%',
            position: 'fixed',
            bottom: 0,
            top: 'auto',
            margin: 0,
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
            Navigation
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                startIcon={item.icon}
                variant={currentPath === item.path ? 'contained' : 'outlined'}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  ...(currentPath === item.path && {
                    background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
                  })
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Header;