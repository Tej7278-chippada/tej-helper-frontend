// components/Chat/ChatsOfUser.js
import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Card, Avatar, useMediaQuery, Dialog, Snackbar, Alert, Button, IconButton, Badge, styled, Backdrop, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import SkeletonChats from './SkeletonChats';
import Layout from '../Layout';
import apiClient from '../../utils/axiosConfig';
import ChatDialog from './ChatDialog';
import { fetchPostById } from '../api/api';
import ArtTrackRoundedIcon from '@mui/icons-material/ArtTrackRounded';
import { io } from 'socket.io-client';

const ChatsOfUser = () => {
  const tokenUsername = localStorage.getItem('tokenUsername');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [chats, setChats] = useState([]);
  // const [posts, setPosts] = useState([]);
  const [post, setPost] = useState([]);
  const [chatDetailsById, setChatDetailsById] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginMessage, setLoginMessage] = useState({ open: false, message: "", severity: "info" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [loadingSelectedChat, setLoadingSelectedChat] = useState(false);
  const userId = localStorage.getItem('userId');

  const fetchChatsOfUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/chats/chatsOfUser', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setChats(response.data.chats || []); //.reverse()
      // setPosts(response.data.posts);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized user, redirecting to login');
        navigate('/login');
      } else {
        console.error('Error fetching chats:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const authToken = localStorage.getItem('authToken');
    setIsAuthenticated(!!authToken);
    if (!authToken) {
      navigate('/login');
    } else {
      fetchChatsOfUser();
      // Socket.IO connection for real-time updates
      const socket = io(process.env.REACT_APP_API_URL, {
        auth: { token: authToken }
      });

      // Listen for new messages to update unread counts
      socket.on('newMessageReceived', ({ chatId, senderId }) => {
        if (senderId !== userId) { // Only update if message is from other user
          setChats(prevChats => 
            prevChats.map(chat => 
              chat.chatId === chatId 
                ? { ...chat, unreadMessagesCount: chat.unreadMessagesCount + 1 }
                : chat
            )
          );
        }
      });

      // Listen for messages being marked as seen
      socket.on('messagesSeen', ({ chatId }) => {
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.chatId === chatId 
              ? { ...chat, unreadMessagesCount: 0 }
              : chat
          )
        );
      });

      return () => {
        socket.off('newMessageReceived');
        socket.off('messagesSeen');
        socket.disconnect();
      };
    }
  }, [fetchChatsOfUser, navigate, userId]);

  const handleChatClick = async (chat) => {
    setLoadingSelectedChat(true);
    try {
      setChatDetailsById(chat);
      // Fetch product details
      const response = await fetchPostById(chat.posts.postId);
      setPost({
        ...response.data,
      });
      // if (isMobile) {
        setOpenDialog(true);
      // }
    } finally {
      setLoadingSelectedChat(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const openPostDetail = ({postId}) => {
    navigate(`/post/${postId}`);
  };

   // Styled Badge to position media image on bottom-right corner
   const SmallAvatar = styled(Avatar)(({ theme }) => ({
    width: 20,
    height: 20,
    border: `2px solid ${theme.palette.background.paper}`,
    fontSize: 12,
  }));

  return (
    <Layout username={tokenUsername}>
      <Box mt={isMobile ? '2px' : '4px'} mb={isMobile ? '4px' : '8px'} sx={{ maxWidth: '800px', mx: 'auto'}}>
        <Box
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          gap={1}
          p={isMobile ? '4px' : 1}
          sx={{  borderRadius: '10px' }} // bgcolor: '#f5f5f5',
        >
          <Card sx={{
            flex: 1.5,
            height: '80vh',
            overflowY: 'auto',
            bgcolor: 'white',
            borderRadius: 2,
            scrollbarWidth: 'none'
          }}>
            <Box height={isMobile ? "85vh" : "auto"} sx={{ padding: '0px' }}>
              <Box
                position="sticky"
                top={0}
                left={0}
                right={0}
                zIndex={10}
                sx={{
                  bgcolor: 'white',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                  padding: '8px 16px',
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography position="relative" variant="h5" color='grey'
                    style={{
                      marginBottom: '0.0rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: '4.5rem',
                      lineHeight: '1.5rem'
                    }}
                  >
                    Chats
                  </Typography>
                </Box>
              </Box>
              <Box bgcolor="#f5f5f5"
                sx={{
                  overflowY: 'auto',
                  paddingInline: isMobile ? '4px' : '6px',
                  scrollbarWidth: 'none',
                  height: isMobile ? 'calc(88vh - 64px)' : 'calc(83vh - 64px)',
                }}
              >
                <Backdrop
                  sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  }}
                  open={loadingSelectedChat}
                >
                  <CircularProgress color="inherit" />
                </Backdrop>
                <Box style={{ paddingTop: '8px', paddingBottom: '1rem' }}>
                  {loading ? (
                    <SkeletonChats />
                  ) : chats.length === 0 ? (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        textAlign: 'center',
                        padding: '16px',
                      }}
                    >
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        You don't have any Chats as a Helper...
                      </Typography>
                      <Box mt={2}></Box>
                    </Box>
                  ) : (
                    chats.map((chat) => (
                      <Box
                        key={chat.chatId}
                        sx={{
                          mb: '4px',
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          transition: 'transform 0.2s, box-shadow 0.2s, border-radius 0.2s',
                          WebkitTapHighlightColor: 'transparent', // Removes the default tap highlight
                          '&:hover': {
                            transform: 'scale(1.01)',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                          },
                          '&:active': {
                            transform: 'scale(1.03)',
                            boxShadow: '0 6px 14px rgba(0, 0, 0, 0.2)',
                            borderRadius: '14px'
                          },
                          borderLeft: chat.unreadMessagesCount > 0 
                            ? `4px solid ${theme.palette.primary.main}`
                            : '4px solid transparent',
                          transition: 'border-left 0.3s ease'
                        }}
                        // onClick={() => handleChatClick({ _id: buyer.id })}
                        onClick={() => handleChatClick(chat)}
                        // onClick={() => setChatDialogOpen(true)}
                        // onMouseEnter={(e) => {
                        //   e.currentTarget.style.transform = 'scale(1.01)'; // Slight zoom on hover
                        //   e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)'; // Enhance shadow
                        // }}
                        // onMouseLeave={(e) => {
                        //   e.currentTarget.style.transform = 'scale(1)'; // Revert zoom
                        //   e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)'; // Revert shadow
                        // }}
                        // onTouchStart={(e) => {
                        //   if (e.currentTarget) {
                        //     e.currentTarget.style.transform = 'scale(1.03)';
                        //     e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.2)'; // More subtle effect
                        //     e.currentTarget.style.borderRadius = '14px'; // Ensure smooth edges
                        //   }
                        // }}
                        // onTouchEnd={(e) => {
                        //   if (e.currentTarget) {
                        //     setTimeout(() => {
                        //       if (e.currentTarget) {
                        //         e.currentTarget.style.transform = 'scale(1)';
                        //         e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                        //       }
                        //     }, 150);
                        //   }
                        // }}
                      >
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            chat.seller && (
                              <SmallAvatar src={chat.seller.profilePic ? `data:image/png;base64,${chat.seller.profilePic}` : undefined} alt={chat.seller.username?.[0]} />
                            )
                          }
                        >
                          <Avatar
                            src={
                              chat.posts?.postImage
                                ? `data:image/jpeg;base64,${chat.posts.postImage}`
                                : 'https://placehold.co/56x56?text=No+Image'
                            }
                            alt={chat.posts.postTitle?.[0]}
                            sx={{ width: 48, height: 48, mx: 1 }}
                          />
                        </Badge>
                        {/* <Avatar
                          src={
                            chat.posts?.postImage
                              ? `data:image/jpeg;base64,${chat.posts.postImage}`
                              : 'https://placehold.co/56x56?text=No+Image'
                          }
                          alt={chat.posts.postTitle || 'Post Image'}
                          sx={{ width: 50, height: 50, mx: 1 }}
                        /> */}
                        <Typography variant="h6" m={1} sx={{display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',overflow: 'hidden', textOverflow: 'ellipsis', fontWeight:400, fontFamily:'sans-serif'}}>
                          {chat.posts.postTitle}
                          {/* {chat.posts.postId} */}
                        </Typography>
                        <Box sx={{marginLeft:'auto', display: 'flex', alignItems: 'center', justifyContent: 'center',}}>
                          {/* Badge for unread messages */}
                          {chat.unreadMessagesCount > 0 && (
                            <Box
                              sx={{
                                // position: 'absolute',
                                // top: 0,
                                // right: 0,
                                backgroundColor: 'red',
                                color: 'white',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                // transform: 'translate(25%, -25%)',
                                marginRight: isMobile ? '4px' : '8px',
                                // zIndex: 1,
                                // animation: chat.unreadMessagesCount > 0 ? 'pulse 1.5s infinite' : 'none',
                                // '@keyframes pulse': {
                                //   '0%': { transform: 'translate(25%, -25%) scale(1)' },
                                //   '50%': { transform: 'translate(25%, -25%) scale(1.2)' },
                                //   '100%': { transform: 'translate(25%, -25%) scale(1)' }
                                // }
                              }}
                            >
                              {chat.unreadMessagesCount > 9 ? '9+' : chat.unreadMessagesCount}
                            </Box>
                          )}
                          <IconButton
                            aria-label="View post details"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPostDetail({postId: chat.posts.postId});
                            }}
                            variant="text"
                            sx={{marginLeft:'auto', position: 'relative'}}
                          >
                            {/* {chat.unreadMessagesCount > 0 && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  right: 0,
                                  backgroundColor: theme.palette.error.main,
                                  color: theme.palette.error.contrastText,
                                  borderRadius: '50%',
                                  minWidth: '20px',
                                  height: '20px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  transform: 'translate(25%, -25%)',
                                  zIndex: 1,
                                  animation: 'pulse 1.5s infinite',
                                  '@keyframes pulse': {
                                    '0%': { transform: 'translate(25%, -25%) scale(1)' },
                                    '50%': { transform: 'translate(25%, -25%) scale(1.1)' },
                                    '100%': { transform: 'translate(25%, -25%) scale(1)' }
                                  }
                                }}
                              >
                                {chat.unreadMessagesCount > 9 ? '9+' : chat.unreadMessagesCount}
                              </Box>
                            )} */}
                            <ArtTrackRoundedIcon/>
                          </IconButton>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            </Box>
          </Card>

          {/* {!isMobile && (<Card sx={{
            flex: 3, padding: '0rem',
            height: '80vh', // Fixed height relative to viewport
            overflowY: 'auto',
            bgcolor: 'white', // Card background color (customizable)
            borderRadius: 2, // Card border radius (customizable)
            // boxShadow: 3, // Shadow for a modern look
            scrollbarWidth: 'thin'
          }}>
            {chatDetailsById ? (
              <Box sx={{ margin: '0rem' }}>
                <ChatDialog chatData={chatDetailsById} post={post} isAuthenticated={isAuthenticated} open={openDialog} onClose={handleCloseDialog} setLoginMessage={setLoginMessage}  setSnackbar={setSnackbar}/>  
              </Box>
            ) : (
              <Box sx={{ margin: '0rem', textAlign: 'center', marginTop: '1rem' }}>
                <Typography variant="h6" color="grey">Select a Chat to see details</Typography>
              </Box>
            )}
          </Card>)} */}

        </Box>
      </Box>
      {/* <ChatDialog open={chatDialogOpen} onClose={() => setChatDialogOpen(false)} post={postId} user={user} /> */}
      {/* Dialog for Mobile View */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        sx={{
          margin: isMobile ? '10px' : '0px',
          '& .MuiPaper-root': { borderRadius: '14px',  } //maxHeight: isMobile ? '300px' : 'auto'
        }}
      >
        {/* <DialogContent> */}
          {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box> */}
          {chatDetailsById && (
            <ChatDialog open={openDialog} onClose={handleCloseDialog} chatData={chatDetailsById} post={post}  isAuthenticated={isAuthenticated} setLoginMessage={setLoginMessage}  setSnackbar={setSnackbar}/>
          )}
        {/* </DialogContent> */}
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius:'1rem' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Snackbar
        open={loginMessage.open}
        autoHideDuration={9000}
        onClose={() => setLoginMessage({ ...loginMessage, open: false })}
        message={
          <span>
            Please log in first.{" "}
            <Link
              to="/login"
              style={{ color: "yellow", textDecoration: "underline", cursor: "pointer" }}
            >
              Click here to login
            </Link>
          </span>
        }
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
        <Alert
          severity="warning"
          variant="filled"
          sx={{
            backgroundColor: "#333",
            color: "#fff",
            borderRadius: "10px",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            // padding: "12px 20px",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          }}
          action={
            <Button
              component={Link}
              to="/login"
              size="small"
              sx={{
                color: "#ffd700",
                fontWeight: "bold",
                textTransform: "none",
                border: "1px solid rgba(255, 215, 0, 0.5)",
                borderRadius: "5px",
                // padding: "3px 8px",
                marginLeft: "10px",
                "&:hover": {
                  backgroundColor: "rgba(255, 215, 0, 0.2)",
                },
              }}
            >
              Login
            </Button>
          }
        >
          Please log in first.
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default ChatsOfUser;
 
