// src/components/ChatDialog.js
import React, { useState, useEffect, useRef, useCallback, 
  // lazy, Suspense
   } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, IconButton, Box, Typography, useMediaQuery, useTheme, DialogActions, LinearProgress, Tooltip, Chip } from '@mui/material';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
// import SentimentSatisfiedRoundedIcon from '@mui/icons-material/SentimentSatisfiedRounded';
// import EmojiEmotionsRoundedIcon from '@mui/icons-material/EmojiEmotionsRounded';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import io from 'socket.io-client';
import ChatsSkeleton from './ChatsSkeleton';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

const socket = io(process.env.REACT_APP_API_URL);

// Recommended messages to start interaction
const RECOMMENDED_MESSAGES = [
  "Hi, I'm interested in your post",
  "Is this still available?",
  "What's your best price for this?",
  "Can you share more details about the post?",
  "When would be a good time to meet?"
];

// const Picker = lazy(() => import("emoji-picker-react")); // Lazy load Emoji Picker

const ChatDialog = ({ open, onClose, post, user, isAuthenticated, setLoginMessage }) => {
    // const tokenUsername = localStorage.getItem('tokenUsername');
  const userId = localStorage.getItem('userId');
  const authToken = localStorage.getItem('authToken');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  // const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const bottomRef = useRef(null); // Reference to the last transaction
  const inputRef = useRef(null);
  // const prevMessagesLength = useRef(0);
  const [loading, setLoading] = useState(false);
  // const [isPickerLoaded, setIsPickerLoaded] = useState(false); // Track if loaded
  const [isFetching, setIsFetching] = useState(true);


//   useEffect(() => {
//     // if (open) {
//       // Fetch chat history when the dialog opens
//       fetchChatHistory();
//     // }
//   });

  const fetchChatHistory = useCallback(async () => {
    if (!post._id || !userId) return;
    setIsFetching(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chats?postId=${post._id}&buyerId=${userId}`, {
        // params: { postId: post._id, buyerId: userId },
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsFetching(false);
    }
  }, [post._id, userId, authToken]);

  useEffect(() => {
    if (open) {
      fetchChatHistory();
      const room = `${post._id}_${userId}`; // Ensure unique room name
      socket.emit('joinRoom', room);

      socket.on('receiveMessage', (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });
    }

    return () => {
      socket.off('receiveMessage');
      const room = `${post._id}_${userId}`; // Ensure unique room name
      socket.emit('leaveRoom', room);
    };
  }, [open, fetchChatHistory, post._id, userId]);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    // if (messages.length > prevMessagesLength.current) {
      bottomRef.current?.scrollIntoView({ behavior:'auto' });
    // }
    // prevMessagesLength.current = messages.length;
  }, [messages]);

  const handleSendMessage = async (e, customMessage) => {
    // If customMessage is provided, use it, otherwise use the message state
    const messageToSend = typeof customMessage === 'string' ? customMessage : message;
    
    // Ensure messageToSend is a string and not empty
    if (typeof messageToSend !== 'string' || !messageToSend.trim()) return;
    
    if (!isAuthenticated) {
      setLoginMessage({
        open: true,
        message: 'Please log in first. Click here to login.',
        severity: 'warning',
      });
      return;
    }

    // Prevent sending messages if post isInActive or closed & user is not a helper
    if (post.postStatus === 'InActive' || (post.postStatus === 'Closed' && !post.helperIds.includes(userId))) {
      console.warn('You cannot send messages as this post is closed or InActive.');
      // alert('u cant send');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/chats/send`, {
        postId: post._id,
        sellerId: post.userId,
        buyerId: userId,
        text: messageToSend,
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (response) {
        const newMessage = { senderId: userId, text: messageToSend, createdAt: new Date() };
        const room = `${post._id}_${userId}`;
        socket.emit('sendMessage', { room, message: newMessage });

        setMessage('');
        console.log("Message sent");
        // fetchChatHistory(); // Refresh chat history
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickMessageClick = (quickMessage) => {
    setMessage(quickMessage);
    handleSendMessage(null, quickMessage);
  };

  // Insert emoji at cursor position
  // const onEmojiClick = (emojiObject) => {
  //   if (!inputRef.current) return;
  
  //   // Ensure cursor position is updated before inserting the emoji
  //   const cursorPosition = inputRef.current.selectionStart || message.length;
  //   const textBeforeCursor = message.substring(0, cursorPosition);
  //   const textAfterCursor = message.substring(cursorPosition);
  
  //   // Insert emoji at the correct position
  //   // const newMessage = textBeforeCursor + emojiObject.emoji + textAfterCursor;
  //   setMessage(textBeforeCursor + emojiObject.emoji + textAfterCursor);
  //   // setShowEmojiPicker(false);
  
  //   // Move cursor to the correct position after the emoji
  //   setTimeout(() => {
  //     if (inputRef.current) {
  //       inputRef.current.selectionStart = inputRef.current.selectionEnd = cursorPosition + emojiObject.emoji.length;
  //       // inputRef.current.focus(); // ✅ Keep keyboard open
  //     }
  //   }, 50);
  // };

  // const handleEmojiToggle = () => {
  //   setShowEmojiPicker(!showEmojiPicker);
  //   if (!isPickerLoaded) setIsPickerLoaded(true); // Mark as loaded once opened
  // };
  

  

  

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md"  fullScreen={isMobile} sx={{
        margin: isMobile ? '10px' : '0px',
        '& .MuiPaper-root': { borderRadius: '14px',  } , //maxHeight: isMobile ? '300px' : 'auto'
        '& .MuiDialogTitle-root': { padding: '14px',  }
      }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>Chat with {post.userCode}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems:'center', gap:1 }}>
          {post.helperIds.includes(userId) && (
            <Tooltip title="Helper tag" arrow placement="left" 
              enterTouchDelay={0}  // Show tooltip immediately on touch
              leaveTouchDelay={1500} // Keep tooltip visible for 1.5 seconds on touch
              disableInteractive // Prevent tooltip from disappearing on accidental touches
            >
              <IconButton 
              // onClick={() => setHelperDialogOpen(true)} 
              >
                <StarRoundedIcon fontSize="medium" color="primary"/> 
              </IconButton>
            </Tooltip>
          )}
          <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
          >
              <CloseIcon />
          </IconButton>
        </Box>
        
      </DialogTitle>
    <DialogContent sx={{padding: 0, scrollbarWidth:'thin', bgcolor:'#f5f5f5',
      scrollbarColor: '#aaa transparent', // Firefox (thumb & track)
     }}>
        {post.helperIds.includes(userId) && (
          <Box sx={{
            position: 'absolute',
            top: '80px',
            left: '0%',
            width:'100%',
            backgroundColor:'rgba(244, 238, 238, 0.24)',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            borderRadius:'12px'
            }} >
            <Typography color="success" align="center" margin={1}>You are tagged as the Helper of this post.</Typography>
          </Box>
        )}
        <Box  sx={{  overflowY: 'auto', p: 1 , scrollbarWidth:'thin'}}>
        {isFetching ? (
            // <Typography textAlign="center">Loading...</Typography>
            <Box sx={{ margin: '0rem', textAlign: 'center' }}>
              <ChatsSkeleton/>
            </Box>
          ) : messages.length > 0 ? (
          messages.map((msg, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: msg.senderId === userId ? 'flex-end' : 'flex-start', m: 1 }}
              ref={index === messages.length - 1 ? bottomRef : null} // Attach ref to last transaction
            >
              <Box sx={{
                bgcolor: msg.senderId === userId ? theme.palette.primary.main : theme.palette.grey[300],
                color: msg.senderId === userId ? '#fff' : '#000',
                p: 1,
                borderRadius: 2,
                maxWidth: '70%',
                wordWrap: 'break-word',
              }}>
                <Typography variant="body1">{msg.text}</Typography>
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                  {new Date(msg.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          ))
        ) : 
        (
          // <Typography color='grey' textAlign="center" sx={{ m: 2 }}>Start chat</Typography>
          <Box sx={{ textAlign: 'center', my: 2 }}>
            <Typography color='grey' sx={{ mb: 2 }}>Start chat</Typography>
            {/* Recommended messages chips */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              gap: 1,
              px: 1,
              mb: 2
            }}>
              {RECOMMENDED_MESSAGES.slice(0, 3).map((msg, index) => (
                <Chip
                  key={index}
                  label={msg}
                  onClick={() => handleQuickMessageClick(msg)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: '16px',
                    bgcolor: theme.palette.grey[200],
                    '&:hover': {
                      bgcolor: theme.palette.grey[300],
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
        </Box>
        <IconButton
          style={{
            position: 'absolute',
            bottom: isMobile ? '80px' : '95px',
            right: isMobile ? '4px' : '12px',
            // padding: '6px 4px',
            borderRadius: '24px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            padding: '4px', // Reduce padding to shrink button size
            width:isMobile ? '30px' : '25px', // Set smaller width
            height: isMobile ? '35px' : '30px', // Set smaller height
            color: '#1a73e8', // Google Blue style
          }}
          // onClick={handleAddTransaction}
          onClick={scrollToBottom}
          onMouseDown={(e) => e.preventDefault()} // ✅ Prevents losing focus when selecting emoji
        >
          <KeyboardDoubleArrowDownRoundedIcon style={{ fontSize: '14px' }}/>
        </IconButton>

        
        
      </DialogContent>
       {/* Lazy Loaded Emoji Picker */}
        {/* {showEmojiPicker && (
          <Box sx={{ position: 'absolute', bottom: 70, left: 10, zIndex: 10, backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: 3,
            overflow: 'hidden' }}
            onMouseDown={(e) => e.preventDefault()} // ✅ Prevents losing focus when selecting emoji
            >
            <Suspense fallback={<Box sx={{ p: 2, textAlign: "center" }}><CircularProgress size={24} /></Box>}>
                {isPickerLoaded && (
                <Picker onEmojiClick={(emoji) => onEmojiClick(emoji)} 
                    width={isMobile ? 300 : 350} height={isMobile ? 350 : 400} 
                    previewConfig={{ showPreview: false }} 
                    searchDisabled={true} 
                />
                )}
            </Suspense>
          </Box>
        )} */}
      <DialogActions >
        {/* <Button onClick={onClose}>Close</Button> */}
        

        {/* Input & Send Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? '2px' : '4px', padding: isMobile ? '2px' : '4px', position: 'relative',
          bgcolor: theme.palette.background.paper,borderRadius: '20px',
          border: `1px solid ${theme.palette.divider}`, flex: 1 }}>
          {/* <IconButton 
            onMouseDown={(e) => e.preventDefault()} // ✅ Prevents losing focus on mobile
            onClick={handleEmojiToggle}>
            {showEmojiPicker ? <EmojiEmotionsRoundedIcon /> : <SentimentSatisfiedRoundedIcon />}
          </IconButton> */}
          <TextField
            fullWidth
            inputRef={inputRef}
            variant="standard"
            placeholder="Type a message..."
            multiline
            value={message}
            minRows={1}
            maxRows={2} 
            onChange={(e) => setMessage(e.target.value)}
            // onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent new line
                handleSendMessage(e);
              }
            }}
            sx={{ 
              // '& .MuiOutlinedInput-root': {
              //   borderRadius: '20px',
              //   bgcolor: theme.palette.background.paper,
              // },
              '& .MuiInputBase-root': {
                padding: '8px 0', 
                '&:before, &:after': {
                  display: 'none', // Remove underline
                },
              },
              '& .MuiInputBase-input': {
                padding: '0px 10px', scrollbarWidth: 'none', maxHeight: '80px',
                overflowY: 'auto',
              },
            }}
          />
          <IconButton color="primary" 
            sx={{
              // position: 'absolute',
              right: '2px', padding:'6px 10px', borderRadius:6,
              backgroundColor: message.trim() ? theme.palette.primary.main : 'transparent',
              color: message.trim() ? '#fff' : theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: message.trim() ? theme.palette.primary.dark : 'transparent',
              },
              transition: 'all 0.2s ease',
            }}
            onMouseDown={(e) => e.preventDefault()} // ✅ Prevents losing focus on mobile
            onClick={(e) => handleSendMessage(e)}
            disabled={loading || message.trim() === '' || post.postStatus === 'InActive' || (post.postStatus === 'Closed' && !post.helperIds.includes(userId))}
            >
            {loading ? <LinearProgress sx={{ width: 24, height: 4, borderRadius: 2, mt: 0 }} /> : <SendRoundedIcon sx={{ fontSize: '24px', marginLeft:'4px' }} />} 
          </IconButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ChatDialog;