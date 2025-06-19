// src/components/Helper/NearPostsNotification.js
import React, { useEffect, useState } from 'react';
import { Snackbar, Alert, Button, Box, Fade, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import API from '../api/api';
import MarkUnreadChatAltRoundedIcon from '@mui/icons-material/MarkUnreadChatAltRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';


export default function NearPostsNotification({darkMode}) {
  const navigate = useNavigate();
  const [nearPostView, setNearPostView] = useState({ open: false, message: "", severity: "info" });
  const [nearPostData, setNearPostData] = useState(null);
  const [nearPostDataMessage, setNearPostDataMessage] = useState(null);
  // Initialize socket connection (add this near your other state declarations)
  const [socket, setSocket] = useState(null);
  const userId = localStorage.getItem('userId');
  // const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [chatNotificationView, setChatNotificationView] = useState({ open: false, message: "", severity: "null" });
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
        setChatNotificationData(data.senderName);
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
        TransitionComponent={Fade} // Smoother transition
        sx={{
          '& .MuiSnackbar-root': {
            top: '80px !important', // Better positioning
          }
        }}
      >
        <Alert
          severity="info" // Changed from "null" to "info" for better semantics
          variant="filled"
          iconMapping={{
            info: <MarkUnreadChatAltRoundedIcon fontSize="small" /> // Custom icon
          }}
          sx={{
            backgroundColor: "rgba(20, 88, 222, 0.9)", // More opaque for better readability
            color: "#fff",
            borderRadius: "12px", // Slightly larger radius
            fontSize: "14px", // Slightly larger font
            display: "flex",
            alignItems: "center",
            width: "100%",
            maxWidth: "350px", // Slightly wider
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.25)", // Deeper shadow
            backdropFilter: "blur(4px)", // Frosted glass effect
            border: "1px solid rgba(255, 255, 255, 0.1)", // Subtle border
            '& .MuiAlert-icon': {
              alignItems: 'center',
              paddingRight: '8px',
            },
            '& .MuiAlert-message': {
              padding: '4px 0',
              flexGrow: 1,
            }
          }}
          action={
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton
                color="inherit"
                size="small"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  '&:hover': {
                    color: "#fff",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
                onClick={() => setChatNotificationView({ ...chatNotificationView, open: false })}
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
              <Button
                color="inherit"
                size="small"
                variant="outlined"
                sx={{
                  color: "#ffd700",
                  fontWeight: "600",
                  textTransform: "none",
                  border: "1px solid rgba(255, 215, 0, 0.7)",
                  borderRadius: "8px",
                  padding: '4px 12px',
                  fontSize: '13px',
                  '&:hover': {
                    backgroundColor: "rgba(255, 215, 0, 0.15)",
                    border: "1px solid rgba(255, 215, 0, 0.9)",
                  },
                }}
                onClick={() => navigate(chatNotificationPath)}
                endIcon={<ArrowForwardIosRoundedIcon fontSize="small" />}
              >
                View
              </Button>
            </Box>
          }
        >
          <Box 
            display="flex" 
            flexDirection="column"
            sx={{
              lineHeight: '1.4',
            }}
          >
            <Box fontWeight="600" fontSize="15px">
              New Message
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box component="span" fontWeight="500">
                {chatNotificationData}
              </Box>
              <Box component="span" sx={{ opacity: 0.7 }}>
                {/* {chatNotificationDataMessage.length > 30 
                  ? `${chatNotificationDataMessage.substring(0, 30)}...`
                  :  */}
                  {chatNotificationDataMessage}
                  
              </Box>
            </Box>
          </Box>
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