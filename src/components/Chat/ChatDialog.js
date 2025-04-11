// src/components/ChatDialog.js
import React, { useState, useEffect, useRef, useCallback, 
  // lazy, Suspense
   } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, IconButton, Box, Typography, useMediaQuery, useTheme, DialogActions, Tooltip, Chip, CircularProgress, Avatar } from '@mui/material';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
// import SentimentSatisfiedRoundedIcon from '@mui/icons-material/SentimentSatisfiedRounded';
// import EmojiEmotionsRoundedIcon from '@mui/icons-material/EmojiEmotionsRounded';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import io from 'socket.io-client';
import ChatsSkeleton from './ChatsSkeleton';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { format } from "date-fns";
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';

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

const ChatDialog = ({ open, onClose, post, user, isAuthenticated, setLoginMessage, setSnackbar }) => {
    // const tokenUsername = localStorage.getItem('tokenUsername');
  const userId = localStorage.getItem('userId');
  const authToken = localStorage.getItem('authToken');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  // const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const inputRef = useRef(null);
  // const prevMessagesLength = useRef(0);
  // const [loading, setLoading] = useState(false);
  // const [isPickerLoaded, setIsPickerLoaded] = useState(false); // Track if loaded
  const [isFetching, setIsFetching] = useState(true);
  const bottomRef = useRef(null); // Reference to the last message
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

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
    if (!open) return;
    if (open) {
      fetchChatHistory();
      const room = `${post._id}_${userId}`; // Ensure unique room name
      socket.emit('joinRoom', room);

      socket.on('receiveMessage', (newMessage) => {
        setMessages((prevMessages) => {
          // ✅ Remove the temp message when the actual message arrives
          const filteredMessages = prevMessages.filter((msg) => msg.text !== newMessage.text || msg.isPending !== true);
          return [...filteredMessages, { ...newMessage, isPending: false }];
        });
      });
      // Listen for real-time seen updates
      socket.on('messageSeenUpdate', ({ messageId }) => {
        setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg._id === messageId ? { ...msg, seen: true } : msg
            )
        );
      });
    }

    return () => {
      socket.off('receiveMessage');
      socket.off('messageSeenUpdate');
      const room = `${post._id}_${userId}`; // Ensure unique room name
      socket.emit('leaveRoom', room);
    };
  }, [open, fetchChatHistory, post._id, userId]);

  const markMessagesAsSeen = useCallback(async (messageIds) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/chats/markAsSeen`, {
        postId: post._id, // or postId in ChatHistory.js
        buyerId: userId, // or chatData.id in ChatHistory.js
        messageIds
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      // Emit real-time seen status to the other user
      const room = `${post._id}_${userId}`;
      messageIds.forEach(messageId => {
        socket.emit('messageSeen', { room, messageId });
      });
    } catch (error) {
      console.error('Error marking messages as seen:', error);
    }
  }, [post._id, userId, authToken]); // Adjust dependencies for ChatHistory.js

  useEffect(() => {
    if (!open || messages.length === 0) return;
  
    // Get IDs of unseen messages sent by the other user
    const unseenMessageIds = messages
      .filter(msg => msg.senderId !== userId && !msg.seen)
      .map(msg => msg._id);
  
    if (unseenMessageIds.length > 0) {
      markMessagesAsSeen(unseenMessageIds);
      // Also update local state immediately for better UX
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          unseenMessageIds.includes(msg._id) ? { ...msg, seen: true } : msg
        )
    );
    }
  }, [messages, open, userId, markMessagesAsSeen]);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 5; // Allow small buffer
    setShowScrollButton(!isAtBottom);

    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 3000);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  // // Scroll to bottom on new message
  // useEffect(() => {
  //   // if (messages.length > prevMessagesLength.current) {
  //     bottomRef.current?.scrollIntoView({ behavior:'auto' });
  //   // }
  //   // prevMessagesLength.current = messages.length;
  // }, [messages]);

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
    if (post.postStatus === 'InActive' || post.user.id === userId || (post.postStatus === 'Closed' && !post.helperIds.includes(userId))) {
      console.warn('You cannot send messages as this post is closed or InActive.');
      setSnackbar({ open: true, message: `${ post.user.id === userId ? 'You cant send message' : `You cannot send messages as this post is ${post.postStatus === 'Closed' ? 'Closed' :  'InActive'}` }`, severity: "warning" });
      // alert('u cant send');
      return;
    }

    // 🚨 Check if the user is offline
    if (!navigator.onLine) {
      console.warn('User is offline. Message not sent.');
      setSnackbar({ open: true, message: "Network is offline.", severity: "warning" });
      return; // Do not proceed with sending
    }
  
    const tempMessageId = `temp-${Date.now()}`;
    const sentAt = new Date(); // Timestamp when sending starts
    const optimisticMessage = {
      _id: tempMessageId,
      senderId: userId,
      text: messageToSend,
      createdAt: sentAt, // Store the timestamp
      isPending: true,
    };
  
    // Add optimistic message to chat
    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
    setMessage('');
    setTimeout(() => inputRef.current?.focus(), 50);
  
    // setLoading(true);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/chats/send`, {
        postId: post._id,
        sellerId: post.user.id,
        buyerId: userId,
        text: messageToSend,
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }
      });

      // if (response) {
      //   const newMessage = { senderId: userId, text: messageToSend, createdAt: new Date() };
      //   const room = `${post._id}_${userId}`;
      //   socket.emit('sendMessage', { room, message: newMessage });

      //   setMessage('');
      //   console.log("Message sent");
      //   // fetchChatHistory(); // Refresh chat history
      //   setTimeout(() => inputRef.current?.focus(), 50);
      // }
  
      // ✅ Real-time socket will handle replacing the message, so no need to update manually here.
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove the temporary message if the request fails
      setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== tempMessageId));
    } 
    // finally {
    //   setLoading(false);
    // }
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

  const groupMessagesByDate = (messages) => {
    return messages.reduce((acc, msg) => {
      const msgDate = format(new Date(msg.createdAt), "yyyy-MM-dd"); // Extract date only
      if (!acc[msgDate]) acc[msgDate] = [];
      acc[msgDate].push(msg);
      return acc;
    }, {});
  };
  
  const groupedMessages = groupMessagesByDate(messages);
  

  

  

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md"  fullScreen={isMobile} sx={{
        margin: isMobile ? '10px' : '0px',
        '& .MuiPaper-root': { borderRadius: '14px',  } , //maxHeight: isMobile ? '300px' : 'auto'
        '& .MuiDialogTitle-root': { padding: '14px',  }
      }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> 
        <Box sx={{ display: 'flex', alignItems:'center', gap:1 }}>
          {/* {post.user?.profilePic && ( */}
            <Avatar
              src={`data:image/png;base64,${post.user.profilePic}`}
              alt={post.user.username[0]}
              style={{ width: 40, height: 40, borderRadius: '50%' }}
            />
          {/* )} */}
          <Typography variant="h6" style={{ fontWeight: 400 }}>
            {post.user?.username}
          </Typography>
        </Box>
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
    <DialogContent onScroll={handleScroll} sx={{padding: 0, scrollbarWidth:'thin', bgcolor:'#f5f5f5',
      scrollbarColor: '#aaa transparent', // Firefox (thumb & track)
     }}>
        {post.helperIds.includes(userId) && (
          <Box sx={{
            position: 'absolute',
            top: '70px',
            left: '0%',
            width:'100%',
            backgroundColor:'rgba(244, 238, 238, 0.24)',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            borderRadius:'12px'
            }} >
            <Typography color="success" align="center" margin={1} sx={{fontSize: isMobile ? '12px' : '14px'}}>You are tagged as the Helper of this post.</Typography>
          </Box>
        )}
        <Box  sx={{  overflowY: 'auto', p: 1 , scrollbarWidth:'thin'}} >
        {isFetching ? (
            // <Typography textAlign="center">Loading...</Typography>
            <Box sx={{ margin: '0rem', textAlign: 'center' }}>
              <ChatsSkeleton/>
            </Box>
          ) : messages.length > 0 ? (
            Object.entries(groupedMessages).map(([date, msgs], dateIndex) => (
              <Box key={`date-${dateIndex}`} sx={{ textAlign: "center", mt: 2 }}>
                {/* Date Header in the Middle */}
                <Typography variant="body2" sx={{ bgcolor: theme.palette.grey[200], px: 2, py: 1, borderRadius: 1, display: "inline-block" }}>
                  {format(new Date(date), "EEEE, MMM dd, yyyy")}
                </Typography>

                {/* Render Messages for This Date */}
                {msgs.map((msg, index) => (
                  <Box key={msg._id || `msg-${index}`}  // Fallback to index if _id is missing
                    sx={{ display: 'flex', justifyContent: msg.senderId === userId ? 'flex-end' : 'flex-start', m: 1, textAlign:'start' }}
                    ref={index === messages.length - 1 ? bottomRef : null} // Attach ref to last message
                  >
                    <Box sx={{
                      bgcolor: msg.senderId === userId ? theme.palette.primary.main : theme.palette.grey[300],
                      color: msg.senderId === userId ? '#fff' : '#000',
                      p: 1,
                      borderRadius: 2,
                      maxWidth: '70%',
                      wordWrap: 'break-word',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.senderId === userId ? 'flex-end' : 'flex-start',
                    }}>
                      <Typography variant="body1" noWrap sx={{ whiteSpace: "pre-wrap", // Retain line breaks and tabs
                        wordWrap: "break-word", maxWidth: '100%', }}
                      >{msg.text}</Typography>
                      
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0 }}>
                        {msg.isPending ? (
                          <>
                            {format(new Date(msg.createdAt), "hh:mm:ss a")} {/* Show time only */} {/* Show when sending started {new Date(msg.createdAt).toLocaleString()}*/}
                            <CircularProgress size={12} color="inherit" />
                          </>
                        ) : (
                          <>
                            {format(new Date(msg.createdAt), "hh:mm:ss a")}  {/* // Only show time  // new Date(msg.createdAt).toLocaleString() */}
                            {msg.senderId === userId && (
                              msg.seen ? (
                                <DoneAllRoundedIcon fontSize="inherit" /> // color="primary"
                              ) : (
                                <DoneRoundedIcon fontSize="inherit" />
                              )
                            )}
                          </>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                {/* Invisible div to trigger auto-scroll */}
                <div ref={bottomRef} />
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
        {(showScrollButton && isScrolling) && (
        <IconButton
          style={{
            position: 'sticky',
            bottom: isMobile ? '10px' : '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            transition: 'opacity 0.3s ease-in-out',
            // right: isMobile ? '4px' : '12px',
            // padding: '6px 4px',
            borderRadius: '24px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center', backgroundColor:'#f5f5f5', 
            justifyContent: 'center',
            padding: '6px 10px', // Reduce padding to shrink button size
            width: 'auto', // Set smaller width
            height: isMobile ? '30px' : '30px', // Set smaller height
            color: '#grey', // Google Blue #1a73e8 style
          }}
          // onClick={handleAddTransaction}
          onClick={scrollToBottom}
          onMouseDown={(e) => e.preventDefault()} // ✅ Prevents losing focus when selecting emoji
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: isMobile ? '12px' : '14px',
              marginRight: '6px', // Space between text and icon
              color: 'grey',
            }}
          >
            Scroll to bottom
          </Typography>
          <KeyboardDoubleArrowDownRoundedIcon style={{ fontSize: '14px' }}/>
        </IconButton>
        )}

        
        
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
            disabled={ message.trim() === '' || post.postStatus === 'InActive' || (post.postStatus === 'Closed' && !post.helperIds.includes(userId))}
            >
            <SendRoundedIcon sx={{ fontSize: '24px', marginLeft:'4px' }} />
          </IconButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ChatDialog;