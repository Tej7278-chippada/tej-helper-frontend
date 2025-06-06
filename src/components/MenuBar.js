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
    { label: 'My Posts', icon: <PostAddIcon />, path: '/userposts' },
    { label: 'Chats', icon: <ChatIcon />, path: '/chatsOfUser' },
    { label: 'Wishlist', icon: <FavoriteIcon />, path: '/wishlist' },
    // { label: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
  ];

const MenuBar = ({ visible, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!visible) return null;

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200, background: 'rgba(255,255,255,0.4)',  backdropFilter: 'blur(10px)',
        // backgroundColor: '#fff',
        // borderTop: '1px solid #ddd',
        borderTopLeftRadius: '16px', // Rounded top-left corner
        borderTopRightRadius: '16px', // Rounded top-right corner
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
      elevation={3}
    >
      <BottomNavigation showLabels 
        value={location.pathname}
        sx={{
          '& .Mui-selected': {
            color: theme.palette.primary.main,
          }, background: 'rgba(255,255,255,0.1)',  backdropFilter: 'blur(10px)',
          borderTopLeftRadius: '16px', // Match parent's border radius
          borderTopRightRadius: '16px', // Match parent's border radius
          overflow: 'hidden', // Ensure children don't overflow rounded corners
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction sx={{
            minWidth: 'auto',
            padding: isMobile ? '6px 0' : '6px 8px',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              borderRadius:'12px',
            },
          }}
            key={item.label}
            label={isMobile ? null : item.label}
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
