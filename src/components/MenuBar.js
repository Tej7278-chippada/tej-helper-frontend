// MenuBar.js
import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, useMediaQuery } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ChatIcon from '@mui/icons-material/Chat';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NotificationsIcon from '@mui/icons-material/Notifications';
// import LogoutIcon from '@mui/icons-material/Logout';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

const navItems = [
    { label: 'Helper', icon: <HomeRoundedIcon />, path: `/` },
    // { label: 'Profile', icon: <PersonIcon />, path: `/user/${localStorage.getItem('userId')}` },
    { label: 'Posts', icon: <PostAddIcon />, path: '/userposts' },
    { label: 'Chats', icon: <ChatIcon />, path: '/chatsOfUser' },
    { label: 'Wishlist', icon: <FavoriteIcon />, path: '/wishlist' },
    // { label: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
  ];

const MenuBar = ({ visible, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  if (!visible) return null;

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200, 
        // backgroundColor: '#fff',
        // borderTop: '1px solid #ddd',
      }}
      elevation={3}
    >
      <BottomNavigation showLabels 
        value={location.pathname}
        sx={{
          '& .Mui-selected': {
            color: theme.palette.primary.main,
          },
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={item.icon}
            value={item.path}
            onClick={() => navigate(item.path)}
          />
        ))}
        {/* <BottomNavigationAction
          label="Logout"
          icon={<LogoutIcon />}
          onClick={onLogout}
        /> */}
      </BottomNavigation>
    </Paper>
  );
};

export default MenuBar;
