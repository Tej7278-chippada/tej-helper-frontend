// src/components/Helper/NearPostsNotification.js
import React, { useEffect, useState } from 'react';
import { Snackbar, Alert, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import API from '../api/api';


export default function NearPostsNotification({darkMode}) {
  const navigate = useNavigate();
  const [nearPostView, setNearPostView] = useState({ open: false, message: "", severity: "info" });
  const [nearPostData, setNearPostData] = useState(null);
  const [nearPostDataMessage, setNearPostDataMessage] = useState(null);
  // Initialize socket connection (add this near your other state declarations)
  const [socket, setSocket] = useState(null);
  const userId = localStorage.getItem('userId');
  // const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [chatNotificationView, setChatNotificationView] = useState({ open: false, message: "", severity: "info" });
  const [chatNotificationData, setChatNotificationData] = useState(null);
  const [chatNotificationDataMessage, setChatNotificationDataMessage] = useState(null);
  const [chatNotificationPath, setChatNotificationPath] = useState(null);

  // Add this useEffect for socket connection
  useEffect(() => {
    const newSocket = io(`${process.env.REACT_APP_API_URL}`); // Replace with your backend URL
    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);
  // Add this useEffect to listen for notifications if needed
  // In your Helper.js component, modify the socket listener:
  useEffect(() => {
    if (socket && userId) {
      socket.emit('joinRoom', userId);
      console.log('room joined');
      // Only listen for notifications if they're enabled
      const checkAndListen = async () => {
        try {
          const authToken = localStorage.getItem('authToken');
          const response = await API.get('/api/notifications/notification-status', {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          });

          if (response.data.notificationEnabled) {
            socket.on('newNotification', (data) => {
              setNearPostData(data);
              setNearPostDataMessage(data.message);
              // setSnackbar({
              //   open: true,
              //   message: data.message,
              //   severity: 'info',
              //   action: (
              //     <Button 
              //       color="inherit" 
              //       size="small"
              //       onClick={() => navigate(`/post/${data.postId}`)}
              //       sx={{
              //         color: "#ffd700",
              //         fontWeight: "bold",
              //         textTransform: "none",
              //         border: "1px solid rgba(255, 215, 0, 0.5)",
              //         borderRadius: "8px",
              //         // padding: "3px 8px",
              //         // marginLeft: "10px",
              //         "&:hover": {
              //           backgroundColor: "rgba(255, 215, 0, 0.2)",
              //         },
              //       }}
              //     >
              //       View
              //     </Button>
              //   )
              // });
              setNearPostView({ ...nearPostView, open: true });
            });
          }
        } catch (error) {
          console.error('Error checking notification status:', error);
        }
      };

      socket.on('chatNotification', (data) => {
        setChatNotificationData(data);
        setChatNotificationDataMessage(data.text);
        setChatNotificationView({ ...chatNotificationView, open: true });
        setChatNotificationPath((data.postOwnerId === data.receiverId) ? `/chatsOfPost/${data.postId}` : `/chatsOfUser`);
        console.log('chat message emited', data.text);
      });

      checkAndListen();

      return () => {
        socket.off('newNotification');
        console.log('Room existed');
      };
    }
  }, [socket, userId ]); // , navigate

  // const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box>
      <Snackbar
        open={nearPostView.open}
        autoHideDuration={6000}
        onClose={() => setNearPostView({ ...nearPostView, open: false })}
        // message={
        //   <span>
        //     Please log in first.{" "}
        //     <Link
        //       to="/login"
        //       style={{ color: "yellow", textDecoration: "underline", cursor: "pointer" }}
        //     >
        //       Click here to login
        //     </Link>
        //     <Button
        //       color="inherit" 
        //       size="small"
        //       onClick={() => navigate(`/post/${nearPostData.postId}`)}
        //     >
        //       View
        //     </Button>
        //   </span>
        // }
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="info"
          variant="filled"
          sx={{
            backgroundColor: "rgba(195, 20, 222, 0.75)", //backgroundColor: "rgba(20, 88, 222, 0.54)",
            color: "#fff",
            borderRadius: "10px",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            // padding: "12px 20px",
            width: "100%",
            maxWidth: "300px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          }}
          action={
            <Button
              color="inherit"
              size="small"
              sx={{
                color: "#ffd700",
                fontWeight: "bold",
                textTransform: "none",
                border: "1px solid rgba(255, 215, 0, 0.5)",
                borderRadius: "8px",
                // padding: "3px 8px",
                // marginLeft: "10px",
                "&:hover": {
                  backgroundColor: "rgba(255, 215, 0, 0.2)",
                },
              }}
              onClick={() => navigate(`/post/${nearPostData.postId}`)}
            >
              View
            </Button>
          }
        >
          {nearPostDataMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={chatNotificationView.open}
        autoHideDuration={6000}
        onClose={() => setChatNotificationView({ ...chatNotificationView, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="info"
          variant="filled"
          sx={{
            backgroundColor: "rgba(20, 88, 222, 0.54)", //backgroundColor: "rgba(20, 88, 222, 0.54)",
            color: "#fff",
            borderRadius: "10px",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            // padding: "12px 20px",
            width: "100%",
            maxWidth: "300px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          }}
          action={
            <Button
              color="inherit"
              size="small"
              sx={{
                color: "#ffd700",
                fontWeight: "bold",
                textTransform: "none",
                border: "1px solid rgba(255, 215, 0, 0.5)",
                borderRadius: "8px",
                // padding: "3px 8px",
                // marginLeft: "10px",
                "&:hover": {
                  backgroundColor: "rgba(255, 215, 0, 0.2)",
                },
              }}
              onClick={() => navigate(chatNotificationPath)}
            >
              View
            </Button>
          }
        >
          {chatNotificationDataMessage}
        </Alert>
      </Snackbar>
      {/* <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        action={snackbar.action}
      >
        <Alert onClose={handleCloseSnackbar} action={snackbar.action} severity={snackbar.severity} sx={{ width: '100%', borderRadius:'1rem' }}>
          {snackbar.message}
        </Alert>
      </Snackbar> */}
    </Box>
  );
}