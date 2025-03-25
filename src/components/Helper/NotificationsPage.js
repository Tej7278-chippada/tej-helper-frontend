import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  CircularProgress,
//   IconButton,
  Badge
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { fetchNotifications, markNotificationAsRead } from '../api/api';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  unread: {
    fontWeight: 'bold',
    backgroundColor: theme.palette.action.selected,
  },
}));

function NotificationsPage() {
  const classes = useStyles();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotificationsData = async () => {
      try {
        const response = await fetchNotifications();
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationsData();
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);
        setNotifications(notifications.map(n => 
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    navigate(`/post/${notification.postId._id}`);
  };

  if (loading) {
    return (
      <Container className={classes.container}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container className={classes.container} maxWidth="md">
      <Typography variant="h4" className={classes.title}>
        Notifications
      </Typography>
      
      <List>
        {notifications.length === 0 ? (
          <Typography variant="body1">No notifications yet</Typography>
        ) : (
          notifications.map((notification) => (
            <React.Fragment key={notification._id}>
              <ListItem 
                button 
                onClick={() => handleNotificationClick(notification)}
                className={!notification.isRead ? classes.unread : null}
              >
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.createdAt).toLocaleString()}
                />
                {!notification.isRead && (
                  <Badge color="primary" variant="dot" />
                )}
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>
    </Container>
  );
}

export default NotificationsPage;