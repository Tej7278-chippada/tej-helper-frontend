// components/Chat/ChatsOfPosts.js
import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Card, Avatar, useMediaQuery, Dialog, } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import SkeletonChats from './SkeletonChats';
import Layout from '../Layout';
import apiClient from '../../utils/axiosConfig';
// import ChatDialog from './ChatDialog';
import ChatHistory from './ChatHistory';
// import CloseIcon from '@mui/icons-material/Close';


const ChatsOfPosts = () => {
  const tokenUsername = localStorage.getItem('tokenUsername');
  const navigate = useNavigate();
  const { postId } = useParams();
  // const [chats, setChats] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [chatDetailsById, setChatDetailsById] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  // const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [postTitle, setPostTitle] = useState(""); // Store post title
  const [openDialog, setOpenDialog] = useState(false);


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
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized user, redirecting to login');
        navigate('/');
      } else {
        console.error('Error fetching chats:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, postId]); // ✅ Add 'navigate' as dependency

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/');
    } else {
      fetchChatsOfPost(); // ✅ Fetch chats on component mount
    }
  }, [fetchChatsOfPost, navigate]); // ✅ Add 'fetchChatsOfPost' and 'navigate' in dependencies

  const handleChatClick = (chat) => {
    setChatDetailsById(chat);
    if (isMobile) {
      // navigate(`/chat/${chat.id}`);
      setOpenDialog(true); // Open the dialog on mobile
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Close the dialog
  };

  return (
    <Layout username={tokenUsername}>
      <Box mt={isMobile ? '2px' : '4px'} mb={isMobile ? '4px' : '8px'}>

        <Box
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          gap={1} p={isMobile ? '4px' : 1} sx={{ bgcolor: '#f5f5f5', borderRadius: '10px', }} /* p={isMobile ? '6px' : 1} paddingBottom:(isMobile ? '4px' : '8px' ), paddingTop:(isMobile ? '0px' : '8px' ) */
        >
          <Card sx={{
            flex: 1.5,
            height: '80vh', // Fixed height relative to viewport
            overflowY: 'auto',
            bgcolor: 'white', // Card background color (customizable)
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
                sx={{
                  bgcolor: 'white', // Background color to ensure visibility
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Optional shadow for separation
                  padding: '8px 16px', // Padding for a clean look
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography position="relative" variant="h6" color='grey'
                    style={{ marginBottom: '0.0rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',overflow: 'hidden', textOverflow: 'ellipsis',
                      maxHeight: '4.5rem',  // This keeps the text within three lines based on the line height.
                      lineHeight: '1.5rem'  // Adjust to control exact line spacing.
                    }}
                    >Chats of <span style={{ fontWeight: "normal", color: "black" }}>{postTitle}</span>
                  </Typography>
                  {/* <Typography position="relative" variant="h5">{postId}</Typography> */}
                </Box>
              </Box>
              <Box bgcolor="#f5f5f5"
                // mt="64px" // Matches the approximate height of the fixed header
                // height="calc(80vh - 64px)" // Adjust the height of the scrollable area
                sx={{
                  overflowY: 'auto',
                  paddingInline: isMobile ? '4px' : '6px', scrollbarWidth: 'none',
                  height: isMobile ? 'calc(88vh - 64px)' : 'calc(83vh - 64px)',
                }}
              >
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
                        key={chat._id}
                        sx={{
                          mb: '4px',
                          display: 'flex',
                          alignItems: 'center', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', backgroundColor: 'white',
                          cursor: 'pointer', borderRadius: '8px',
                          // '&:hover': { backgroundColor: '#f5f5f5' },
                          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                          WebkitTapHighlightColor: 'transparent', // Removes the default tap highlight
                        }}
                        // onClick={() => handleChatClick({ _id: buyer.id })}
                        onClick={() => handleChatClick(chat)}
                        // onClick={() => setChatDialogOpen(true)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.02)'; // Slight zoom on hover
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)'; // Enhance shadow
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)'; // Revert zoom
                          e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)'; // Revert shadow
                        }}
                        onTouchStart={(e) => {
                          if (e.currentTarget) {
                            e.currentTarget.style.transform = 'scale(1.03)';
                            e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.2)'; // More subtle effect
                            e.currentTarget.style.borderRadius = '14px'; // Ensure smooth edges
                          }
                        }}
                        onTouchEnd={(e) => {
                          if (e.currentTarget) {
                            setTimeout(() => {
                              if (e.currentTarget) {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                              }
                            }, 150);
                          }
                        }}
                      >
                        <Avatar
                          src={
                            chat.profilePic
                              ? `data:image/jpeg;base64,${chat.profilePic}`
                              : 'https://placehold.co/56x56?text=No+Image'
                          }
                          alt={chat.username}
                          sx={{ width: 50, height: 50, marginInline: 1 }}
                        />
                        <Typography variant="h6" m="1rem" sx={{display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',overflow: 'hidden', textOverflow: 'ellipsis',}}>
                          {chat.username}
                          {/* {chat.id} */}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            </Box>
          </Card>

          {!isMobile && (<Card sx={{
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
                <ChatHistory chatData={chatDetailsById} postId={postId} />  {/* User ChatHistory component */}
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
            <ChatHistory chatData={chatDetailsById} postId={postId} handleCloseDialog={handleCloseDialog} />
          )}
        {/* </DialogContent> */}
      </Dialog>
    </Layout>
  );
};

export default ChatsOfPosts;
