// Header.js
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, TextField, List, ListItem, ListItemText, Box, CircularProgress, Paper, useMediaQuery, IconButton, Menu, MenuItem, Dialog, ListItemIcon, Avatar, Divider, } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
// import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { userData } from '../utils/userData';
import PersonIcon from '@mui/icons-material/Person';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ChatIcon from '@mui/icons-material/Chat';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';

const Header = ({ username }) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if screen size is small
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loggedInUsers, setLoggedInUsers] = useState([]);
  const navigate = useNavigate();
  const [currentUsername, setCurrentUsername] = useState(username || '');
  const loggedUserData = userData();
  const userId = (loggedUserData?.userId || '');
  // Only show search bar when user is logged in and on chat page
  // const showSearchBar = location.pathname.includes('/productList') && username;
  const userProfilePic = localStorage.getItem('tokenProfilePic');



  // Load logged-in users from localStorage
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('loggedInUsers')) || [];
    setLoggedInUsers(users);

    // Load the last active user from localStorage if available
    // const activeUser = localStorage.getItem('activeUser');
    const activeUser = (loggedUserData?.userName || '');
    if (activeUser) {
      const tokens = JSON.parse(localStorage.getItem('authTokens')) || {};
    const activeToken = tokens[username];
    if (activeToken) {
      localStorage.setItem('authToken', activeToken); // Ensure the correct token is set
    }
      setCurrentUsername(activeUser);
    }
    console.log('logged user:', currentUsername);
  }, [username]);

  // useEffect(() => {
  //   // Add current user to the list if not already present
  //   if (username && !loggedInUsers.includes(username)) {
  //     const updatedUsers = [...loggedInUsers, username];
  //     setLoggedInUsers(updatedUsers);
  //     localStorage.setItem('loggedInUsers', JSON.stringify(updatedUsers));
  //   }
  // }, [username, loggedInUsers]);

  const handleProfileClick = (event) => {
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
  
  // const handleSwitchProfile = () => {
  //   setOpenDialog(true);
  //   setAnchorEl(null);
  // };

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

  // Handle search input change
  const handleSearchChange = async (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value) {
      setLoading(true);
      try {                             // `https://tej-chat-app-8cd7e70052a5.herokuapp.com/api/users/search`
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/search`, {
          params: { username: value }
        });
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching usernames:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const openUserProfile = () => {
    // const userId = localStorage.getItem('userId'); 
    // const userId = (loggedUserData?.userId || 'userId');
    navigate(`/user/${userId}`); //, { replace: true }
  };

  const toUserPosts = () => {
    navigate('/userposts'); //, { replace: true }
  };
  
  return (
    <Box sx={{ flexGrow: 1, marginBottom: isMobile ? '3.5rem' : '4rem' }}>
      <AppBar position="fixed">
        <Toolbar>
        <Typography variant={isMobile ? "h6" : "h5"} component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-block' }}>
            Helper
          </Link>
        </Typography>
        {/* <Link to="/admin" style={{ color: 'white', textDecoration: 'none', marginRight: '15px' }}>Admin Page</Link> */}
        {/* Search Bar */}
        {location.pathname.includes('/productList') && currentUsername && (
            <Box display="flex" alignItems="center" mr={2}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search usernames"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{ endAdornment: <SearchIcon /> }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    bgcolor: 'transparent', //theme.palette.background.paper
                    // backgroundColor:'white'
                  },
                  '& .MuiInputBase-input': {
                    padding: '10px 14px',
                  },
                  width: isMobile ? 130 : 200
                }}
              />
              
              {searchTerm && (
                <Paper elevation={3} sx={{ position: 'absolute', top: '80%', mt: 1, zIndex: 10, maxWidth: isMobile ? 200 : 250 }}>
                  <List style={{
                    position: 'absolute', background: 'white', width: isMobile ? 200 : 250,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)', borderRadius: '4px'
                  }}>
                    {loading ? (
                      <ListItem>
                        <CircularProgress size={20} />
                      </ListItem>
                    ) : (
                      searchResults.length > 0 ? (
                        searchResults.map((user) => (
                          <ListItem key={user.username}>
                            <CheckCircleIcon style={{ color: 'green' }} />
                            <ListItemText primary={user.username} />
                          </ListItem>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText primary="Searched username doesn't match any existing username" />
                        </ListItem>
                      )
                    )}
                  </List>
                </Paper>
              )}
            </Box>
          )}
          {/* {location.pathname === '/productList' && username && (
            <Typography variant="body1" 
            // sx={{ display: isMobile ? 'none' : 'block' }}
            >
              {username}
            </Typography>
          )} */}
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
                  // alt={currentUsername[0]}
                  sx={{ width: 32, height: 32, mr: 0, color:'inherit', bgcolor:'rgba(255, 255, 255, 0.27)', borderRadius: '50%', fontSize: 12, border: `2px solid rgba(255, 255, 255, 0.3)`, }}
                />
                {/* <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                  {currentUsername.charAt(0).toUpperCase()}
                </Avatar> */}
                {/* <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {currentUsername}
                </Typography> */}
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
                {/* <MenuItem onClick={() => { toUserPosts(); handleClose(); }}>
                  <ListItemIcon><PostAddIcon fontSize="small" /></ListItemIcon>
                  My Posts
                </MenuItem>
                <MenuItem onClick={() => { navigate('/chatsOfUser'); handleClose(); }}>
                  <ListItemIcon><ChatIcon fontSize="small" /></ListItemIcon>
                  Chats
                </MenuItem>
                <MenuItem onClick={() => { navigate('/wishlist'); handleClose(); }}>
                  <ListItemIcon><FavoriteIcon fontSize="small" /></ListItemIcon>
                  Wishlist
                </MenuItem> */}
                <MenuItem onClick={() => { navigate('/notifications'); handleClose(); }}>
                  <ListItemIcon><NotificationsIcon fontSize="small" /></ListItemIcon>
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
