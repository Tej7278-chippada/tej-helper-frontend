// /src/components/Helper/NotificationsPage.js
import React, { useState, useEffect } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  // Divider,
  Badge,
  Box,
  Toolbar,
  // Button,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markNotificationAsRead } from '../api/api';
import Layout from '../Layout';
import { NotificationsActive } from '@mui/icons-material';
import SkeletonCards from './SkeletonCards';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loadingView, setLoadingView] = useState(null);

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
        setLoadingView(notification._id);
        await markNotificationAsRead(notification._id);
        setNotifications(notifications.map(n => 
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      } finally {
        setLoadingView(null);
      }
    }
    navigate(`/post/${notification.postId._id}`);
  };

  return (
    <Layout>
      <Box sx={{ p: isMobile ? '6px' : '10px', maxWidth: '800px', mx: 'auto' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={600}>
            Notifications ({notifications.filter(n => !n.isRead).length})
          </Typography>
          <IconButton sx={{ backgroundColor: '#1976d2', color: '#fff', '&:hover': { backgroundColor: '#1565c0' } }}>
            <NotificationsActive />
          </IconButton>
        </Toolbar>

        <Paper sx={{ bgcolor: '#f5f5f5', p: '10px 12px', borderRadius: 3 }} elevation={3}>
          {loading ? (
            <SkeletonCards />
          ) : (
            <List>
              {notifications.length === 0 ? (
                <Typography variant="body1" textAlign="center" sx={{ py: 2 }}>
                  No notifications yet
                </Typography>
              ) : (
                notifications.map((notification) => (
                  <React.Fragment key={notification._id}>
                    <ListItem 
                      component="div"
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        // bgcolor: !notification.isRead ? 'primary.light' : 'background.paper',
                        bgcolor: !notification.isRead ? 'background.paper' : 'grey.200',
                        borderRadius: 2,
                        mb: 1,
                        p: '10px 16px',
                        transition: '0.3s', cursor:'pointer',
                        '&:hover': { bgcolor: 'grey.100' }
                      }}
                    >
                      <ListItemText
                        primary={notification.message}
                        secondary={new Date(notification.createdAt).toLocaleString()}
                        sx={{ color: !notification.isRead ? 'black' : 'text.secondary' }}
                      />
                      {loadingView === notification._id ? (
                        <CircularProgress size={20} />
                      ) : (
                        !notification.isRead && <Badge color="primary" variant="dot" />
                      )}
                    </ListItem>
                    {/* <Divider sx={{ width: '90%', mx: 'auto' }} /> */}
                  </React.Fragment>
                ))
              )}
            </List>
          )}
        </Paper>
      </Box>
    </Layout>
  );
}

export default NotificationsPage;