// MenuBar.js
import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ChatIcon from '@mui/icons-material/Chat';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';

const MenuBar = ({ visible, onLogout }) => {
  const navigate = useNavigate();

  if (!visible) return null;

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
      }}
      elevation={3}
    >
      <BottomNavigation showLabels>
        <BottomNavigationAction label="Profile" icon={<PersonIcon />} onClick={() => navigate(`/user/${localStorage.getItem('userId')}`)} />
        <BottomNavigationAction label="My Posts" icon={<PostAddIcon />} onClick={() => navigate('/userposts')} />
        <BottomNavigationAction label="Chats" icon={<ChatIcon />} onClick={() => navigate('/chatsOfUser')} />
        <BottomNavigationAction label="Wishlist" icon={<FavoriteIcon />} onClick={() => navigate('/wishlist')} />
        <BottomNavigationAction label="Notifications" icon={<NotificationsIcon />} onClick={() => navigate('/notifications')} />
        <BottomNavigationAction label="Logout" icon={<LogoutIcon />} onClick={onLogout} />
      </BottomNavigation>
    </Paper>
  );
};

export default MenuBar;
