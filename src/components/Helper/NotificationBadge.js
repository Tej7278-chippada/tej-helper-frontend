import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Popover, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { fetchNotifications } from '../api/api';
import { useNavigate } from 'react-router-dom';

function NotificationBadge() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await fetchNotifications();
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (postId) => {
    handleClose();
    navigate(`/post/${postId}`);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <div>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <div style={{ padding: '16px', maxWidth: '300px', maxHeight: '400px', overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          
          {notifications.length === 0 ? (
            <Typography variant="body2">No notifications</Typography>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <div 
                key={notification._id} 
                style={{ 
                  padding: '8px 0', 
                  cursor: 'pointer',
                  fontWeight: notification.isRead ? 'normal' : 'bold'
                }}
                onClick={() => handleNotificationClick(notification.postId._id)}
              >
                <Typography variant="body2">{notification.message}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(notification.createdAt).toLocaleString()}
                </Typography>
              </div>
            ))
          )}
          
          {notifications.length > 5 && (
            <Typography 
              variant="body2" 
              color="primary" 
              style={{ cursor: 'pointer', marginTop: '8px' }}
              onClick={() => {
                handleClose();
                navigate('/notifications');
              }}
            >
              See all notifications
            </Typography>
          )}
        </div>
      </Popover>
    </div>
  );
}

export default NotificationBadge;