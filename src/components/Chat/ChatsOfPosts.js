// components/Chat/ChatsOfPosts.js
import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Card, Avatar, useMediaQuery, Dialog, Button, IconButton, Snackbar, Alert, Backdrop, CircularProgress, Slide, Chip, } from '@mui/material';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import SkeletonChats from './SkeletonChats';
import Layout from '../Layout';
import apiClient from '../../utils/axiosConfig';
// import ChatDialog from './ChatDialog';
import ChatHistory from './ChatHistory';
// import CloseIcon from '@mui/icons-material/Close';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import { format } from 'date-fns';
import { io } from 'socket.io-client';
import { dark } from '@mui/material/styles/createPalette';
import UserProfileDetails from '../Helper/UserProfileDetails';

const getGlassmorphismStyle = (theme, darkMode) => ({
  background: darkMode 
    ? 'rgba(30, 30, 30, 0.85)' 
    : 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  // border: darkMode 
  //   ? '1px solid rgba(255, 255, 255, 0.1)' 
  //   : '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: darkMode 
    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
});

const ChatsOfPosts = ({darkMode, toggleDarkMode, unreadCount, shouldAnimate}) => {
  const tokenUsername = localStorage.getItem('tokenUsername');
  const navigate = useNavigate();
  const location = useLocation();
  const { postId } = useParams();
  // const [chats, setChats] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [chatDetailsById, setChatDetailsById] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  // const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [postTitle, setPostTitle] = useState(""); // Store post title
  const [postImage, setPostImage] = useState("");
  const [postStatus, setPoststatus] = useState("");
  const postData = location.state?.post;
  const [openDialog, setOpenDialog] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication
  const [loadingSelectedChat, setLoadingSelectedChat] = useState(false);
  const userId = localStorage.getItem('userId');


  const fetchChatsOfPost = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/chats/chatsOfPost', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      // setChats(response.data.chats.reverse() || []);
      // setBuyers(response.data.posts.find(post => post._id === postId)?.buyers || []);
      const post = response.data.posts.find(post => post._id === postId);
      setBuyers(post?.buyers || []);
      setPostTitle(post?.title || ""); // Store post title
      setPostImage(post?.media?.length ? post.media[0] : "");
      setPoststatus(post?.postStatus || "");
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
  }, [navigate, postId]); // ✅ Add 'navigate' as dependency

  useEffect(() => {
    window.scrollTo(0, 0);
    const authToken = localStorage.getItem('authToken');
    setIsAuthenticated(!!authToken); // Check if user is authenticated
    if (!authToken) {
      navigate('/login');
    } else {
      fetchChatsOfPost(); // ✅ Fetch chats on component mount
      const socket = io(process.env.REACT_APP_API_URL, {
        auth: { token: authToken }
      });
    
      // Listen for new messages to update unread counts
      socket.on('newMessageReceived', ({ postId, buyerId, senderId }) => {
        if (senderId !== userId) { // Only update if message is from other user
          setBuyers(prevBuyers => 
            prevBuyers.map(buyer => 
              buyer.id === buyerId 
                ? { ...buyer, unreadMessagesCount: (buyer.unreadMessagesCount || 0) + 1 }
                : buyer
            )
          );
        }
      });
    
      // Listen for messages being marked as seen
      socket.on('messagesSeen', ({ postId, buyerId }) => {
        if (postId === postId) { // Only update for current post
          setBuyers(prevBuyers => 
            prevBuyers.map(buyer => 
              buyer.id === buyerId 
                ? { ...buyer, unreadMessagesCount: 0 }
                : buyer
            )
          );
        }
      });
    
      return () => {
        socket.off('newMessageReceived');
        socket.off('messagesSeen');
        socket.disconnect();
      };
    }
  }, [fetchChatsOfPost, navigate, postId, userId]); // ✅ Add 'fetchChatsOfPost' and 'navigate' in dependencies

  const handleChatClick = (chat) => {
    setLoadingSelectedChat(true);
    try {
      setChatDetailsById(chat);
      if (isMobile) {
        // navigate(`/chat/${chat.id}`);
        setOpenDialog(true); // Open the dialog on mobile
      }
    } finally {
      setLoadingSelectedChat(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Close the dialog
  };
  const [isRateDialogOpen, setRateDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loginMessage, setLoginMessage] = useState({ open: false, message: "", severity: "info" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const handleOpenRateDialog = ({userID}) => {
    setSelectedUserId(userID);
    setRateDialogOpen(true);
  };
  const handleCloseRateDialog = () => {
    setRateDialogOpen(false);
    setSelectedUserId(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle browser back button
  useEffect(() => {
    if (!openDialog && !isRateDialogOpen) return;

    const handleBackButton = (e) => {
      e.preventDefault();
      setOpenDialog(false);
      setRateDialogOpen(false);
      setSelectedUserId(null);
    };

    // Add event listener when dialog opens
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handleBackButton);

    // Clean up event listener when dialog closes
    return () => {
      window.removeEventListener('popstate', handleBackButton);
      if (window.history.state === null) {
        window.history.back();
      }
    };
  }, [openDialog, setOpenDialog, isRateDialogOpen, setRateDialogOpen ]);

  return (
    <Layout username={tokenUsername} darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate}>
      <Box mt={isMobile ? '2px' : '4px'} mb={isMobile ? '4px' : '8px'}>

        <Box
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          gap={1} p="4px" sx={{ borderRadius: '10px', }} /* p={isMobile ? '6px' : 1} paddingBottom:(isMobile ? '4px' : '8px' ), paddingTop:(isMobile ? '0px' : '8px' ) */
        >
          <Card sx={{
            flex: 1.5,
            height: '80vh', // Fixed height relative to viewport
            overflowY: 'auto', ...getGlassmorphismStyle(theme, darkMode),
            // bgcolor: 'white', // Card background color (customizable)
            borderRadius: 2, // Card border radius (customizable)
            // boxShadow: 3, // Shadow for a modern look
            scrollbarWidth: 'none'
          }}>

            <Box height={isMobile ? "85vh" : "auto"} sx={{ padding: '0px' }}>
              <Box
                position="sticky" //fixed
                top={0}
                left={0}
                right={0}
                zIndex={10}
                sx={{ ...getGlassmorphismStyle(theme, darkMode),
                  // bgcolor: 'white', // Background color to ensure visibility
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Optional shadow for separation
                  padding: '8px 16px', // Padding for a clean look
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    src={
                      // postImage
                      (postData?.media[0] || postImage)
                        ? `data:image/jpeg;base64,${(postData?.media[0] || postImage)}`
                        : 'https://placehold.co/56x56?text=No+Image'
                    }
                    alt={postData?.title[0] || postTitle}
                    sx={{ width: 50, height: 50, mr: 2, borderRadius: 2 }}
                  />

                  <Box>
                    {/* <Box sx={{display:'flex'}}> */}
                      <Typography variant="body2" color="text.secondary">
                        Chats of
                      </Typography>
                    {/* </Box> */}
                    <Typography
                      variant="h6"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxHeight: '1.5rem',
                        lineHeight: '1.5rem',
                        fontWeight: 500,
                        fontFamily: 'sans-serif',
                        // color: 'black',
                      }}
                    >
                      {/* {postTitle} */}
                      {postData?.title || postTitle}
                    </Typography>
                  </Box>
                  {(postData?.postStatus || postStatus) && (
                    <Chip
                      label={postData?.postStatus || postStatus}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 12,
                        backgroundColor: (postData?.postStatus || postStatus) === 'Active' ? 'success.main' : (postData?.postStatus || postStatus) === 'InActive' ? 'warning.main' : 'error.main',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        '& .MuiChip-icon': {
                          marginLeft: '6px',
                          height: '16px'
                        },
                      }}
                    />
                  )}
                </Box>
              </Box>
              <Box 
              // bgcolor="#f5f5f5"
                // mt="64px" // Matches the approximate height of the fixed header
                // height="calc(80vh - 64px)" // Adjust the height of the scrollable area
                sx={{
                  overflowY: 'auto',
                  paddingInline: isMobile ? '4px' : '6px', scrollbarWidth: 'none',
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
                    <SkeletonChats /> // Show SkeletonGroups while loading
                  ) : buyers.length === 0 ? (
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
                        You don't have any Chats of this Post...
                      </Typography>
                      <Box mt={2}>
                      </Box>
                    </Box>
                  ) : (
                    buyers.map((chat) => (
                      <Box
                        key={chat.id}
                        sx={{
                          mb: '4px', p: 1,
                          display: 'flex',
                          alignItems: 'center', ...getGlassmorphismStyle(theme, darkMode),
                          // boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', backgroundColor: 'white',
                          cursor: 'pointer', borderRadius: '8px',
                          // '&:hover': { backgroundColor: '#f5f5f5' },
                          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                          WebkitTapHighlightColor: 'transparent', // Removes the default tap highlight
                          '&:hover': {
                            transform: 'scale(1.01)',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                          },
                          '&:active': {
                            transform: 'scale(1.03)',
                            boxShadow: '0 6px 14px rgba(0, 0, 0, 0.2)',
                            borderRadius: '8px'
                          },
                          borderLeft: chat.unreadMessagesCount > 0 
                            ? `4px solid ${theme.palette.primary.main}`
                            : '4px solid transparent',
                          // transition: 'border-left 0.3s ease'
                        }}
                        // onClick={() => handleChatClick({ _id: buyer.id })}
                        onClick={() => handleChatClick(chat)}
                        // onClick={() => setChatDialogOpen(true)}
                        // onMouseEnter={(e) => {
                        //   e.currentTarget.style.transform = 'scale(1.02)'; // Slight zoom on hover
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
                        <Avatar
                          src={
                            chat.profilePic
                              ? `data:image/jpeg;base64,${chat.profilePic}`
                              : 'https://placehold.co/56x56?text=No+Image'
                          }
                          alt={chat.username}
                          sx={{ width: 50, height: 50, mx: 1 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" m={0} sx={{display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',overflow: 'hidden', textOverflow: 'ellipsis', fontWeight:400, fontFamily:'sans-serif'}}>
                            {chat.username}
                            {/* {chat.id} */}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            last seen on {chat.lastMessageAt ? format(new Date(chat.lastMessageAt), 'hh:mm:ss a') : ''}
                          </Typography>
                        </Box>
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
                            aria-label="View profile"
                            onClick={(e) => { 
                              e.stopPropagation();
                              handleOpenRateDialog({ userID: chat.id });
                            }}
                            sx={{ 
                              marginLeft: 'auto',
                              position: 'relative' 
                            }}
                          >
                            {/* {chat.unreadMessagesCount > 0 && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
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
                                transform: 'translate(25%, -25%)',
                                zIndex: 1,
                                animation: chat.unreadMessagesCount > 0 ? 'pulse 1.5s infinite' : 'none',
                                '@keyframes pulse': {
                                  '0%': { transform: 'translate(25%, -25%) scale(1)' },
                                  '50%': { transform: 'translate(25%, -25%) scale(1.2)' },
                                  '100%': { transform: 'translate(25%, -25%) scale(1)' }
                                }
                              }}
                            >
                              {chat.unreadMessagesCount > 9 ? '9+' : chat.unreadMessagesCount}
                            </Box>
                            )} */}
                            <AssignmentIndRoundedIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            </Box>
          </Card>

          {!isMobile && (<Card sx={{
            flex: 3, padding: '0rem',
            // height: '80vh', // Fixed height relative to viewport
            overflowY: 'auto', ...getGlassmorphismStyle(theme, darkMode),
            // bgcolor: 'white', // Card background color (customizable)
            borderRadius: 2, // Card border radius (customizable)
            // boxShadow: 3, // Shadow for a modern look
            scrollbarWidth: 'thin'
          }}>
            {chatDetailsById ? (
              <Box sx={{ margin: '0rem' }}>
                <ChatHistory chatData={chatDetailsById} postId={postId} postTitle={postData?.title || postTitle} postStatus={postData?.postStatus || postStatus} isAuthenticated={isAuthenticated} darkMode={darkMode} setSnackbar={setSnackbar}/>  {/* User ChatHistory component */}
              </Box>
            ) : (
              <Box sx={{ margin: '0rem', textAlign: 'center', marginTop: '1rem' }}>
                <Typography variant="h6" color="grey">Select a Chat to see details</Typography>
              </Box>
            )}
          </Card>)}

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
          // margin: isMobile ? '10px' : '0px',
          '& .MuiPaper-root': { borderRadius: '14px',  } //maxHeight: isMobile ? '300px' : 'auto'
        }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'left' }}
      >
        {/* <DialogContent> */}
          {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box> */}
          {chatDetailsById && (
            <ChatHistory chatData={chatDetailsById} postId={postId} postTitle={postData?.title || postTitle} postStatus={postData?.postStatus || postStatus} handleCloseDialog={handleCloseDialog} isAuthenticated={isAuthenticated} darkMode={darkMode} setSnackbar={setSnackbar} />
          )}
        {/* </DialogContent> */}
      </Dialog>
      {/* Rating Dialog */}
      <UserProfileDetails
        userId={selectedUserId}
        open={isRateDialogOpen}
        onClose={handleCloseRateDialog}
        // post={post}
        isMobile={isMobile}
        isAuthenticated={isAuthenticated} setLoginMessage={setLoginMessage}  setSnackbar={setSnackbar} darkMode={darkMode}
      />
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
    </Layout>
  );
};

export default ChatsOfPosts;
