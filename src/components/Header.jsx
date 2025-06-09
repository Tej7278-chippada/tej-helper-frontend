// src/components/Header.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, List, ListItem, ListItemText, Box, useMediaQuery, IconButton, Menu, MenuItem, Dialog, ListItemIcon, Avatar, Divider, Badge, } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { userData } from '../utils/userData';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import { fetchUnreadNotificationsCount } from './api/api';

const Header = ({ username }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loggedInUsers, setLoggedInUsers] = useState([]);
  const navigate = useNavigate();
  const [currentUsername, setCurrentUsername] = useState(username || '');
  const loggedUserData = userData();
  const userId = (loggedUserData?.userId || '');
  const userProfilePic = localStorage.getItem('tokenProfilePic');
  const [unreadCount, setUnreadCount] = useState(0);
  


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
    
    const fetchNotificationCount = async () => {
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

  const handleProfileClick = (event) => {
    fetchNotificationCount();
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

  const handleSelectUser = (user) => {
    if (user === 'Login with another account') {
      navigate('/login');
    } else {
      const tokens = JSON.parse(localStorage.getItem('authTokens')) || {};
      const authToken = tokens[user];
  
      if (!authToken) {
        console.error(`No auth token found for ${user}`);
        return;
      }
  
      // Set the selected user's token as the active auth token
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('activeUser', user); // Set active user in localStorage
      setCurrentUsername(user); // Update current username state
      navigate('/settleMate');
    }
    setOpenDialog(false);
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
  
  return (
    <Box sx={{ flexGrow: 1, marginBottom: isMobile ? '3.5rem' : '4rem' }}>
      <AppBar position="absolute">
        <Toolbar>
        <Typography variant={isMobile ? "h6" : "h5"} component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-block' }}>
            Helper
          </Link>
        </Typography>
          {currentUsername && (
            <>
              <IconButton
                onClick={handleProfileClick}
                color="inherit"
                size="small"
                sx={{ borderRadius: 6, px: 0.5, py: 0.5, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
              >
                <Avatar
                  src={
                    (userProfilePic === null )
                      ? 'https://placehold.co/56x56?text=No+Image'
                      : `data:image/jpeg;base64,${userProfilePic}`
                  }
                  sx={{ width: 32, height: 32, mr: 0, color:'inherit', bgcolor:'rgba(255, 255, 255, 0.27)', borderRadius: '50%', fontSize: 12, border: `2px solid rgba(255, 255, 255, 0.3)`, }}
                />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  elevation: 4,
                  sx: {
                    mt: 0.5, ml: 1.5,
                    minWidth: 100,
                    borderRadius: 2,
                    '& .MuiMenuItem-root': {
                      gap: 0,
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
                <MenuItem onClick={() => { openUserProfile(); handleClose(); }}>
                  <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                  My Profile
                </MenuItem>
                <MenuItem onClick={() => { navigate('/notifications'); handleClose(); }}>
                  <ListItemIcon>
                    <Badge badgeContent={unreadCount} color="error" max={99}>
                      <NotificationsIcon fontSize="small" />
                    </Badge>
                  </ListItemIcon>
                  Notifications
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleLogout(); handleClose(); }}>
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
              <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <List style={{ cursor: 'pointer' }}>
                  <ListItem button onClick={() => handleSelectUser('Login with another account')}>
                    <ListItemText primary="Login with another account" />
                  </ListItem>
                  {loggedInUsers.map((user) => (
                    <ListItem button key={user} onClick={() => handleSelectUser(user)}>
                      <ListItemText primary={user} />
                    </ListItem>
                  ))}
                </List>
              </Dialog>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
