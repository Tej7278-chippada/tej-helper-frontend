// src/components/ChatHistory.js
import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { TextField, IconButton, Box, Typography, useTheme, useMediaQuery, Avatar, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
// import SendIcon from '@mui/icons-material/Send';
// import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
// import Picker from 'emoji-picker-react';
import axios from 'axios';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SentimentSatisfiedRoundedIcon from '@mui/icons-material/SentimentSatisfiedRounded';
import EmojiEmotionsRoundedIcon from '@mui/icons-material/EmojiEmotionsRounded';
// import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import ChatsSkeleton from './ChatsSkeleton';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import CloseIcon from '@mui/icons-material/Close';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { format } from "date-fns";
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';

const socket = io(process.env.REACT_APP_API_URL);

const Picker = lazy(() => import("emoji-picker-react")); // Lazy load Emoji Picker

const ChatHistory = ({ chatData, postId, handleCloseDialog, isAuthenticated }) => {
    // const tokenUsername = localStorage.getItem('tokenUsername');
    // const { buyerId } = useParams(); // Get groupId from URL if available
  const userId = localStorage.getItem('userId');
  const authToken = localStorage.getItem('authToken');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const bottomRef = useRef(null); // Reference to the last transaction
  const [isPickerLoaded, setIsPickerLoaded] = useState(false); // Track if loaded
  const inputRef = useRef(null);
  // const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isHelper, setIsHelper] = useState(false);
  const [helperCount, setHelperCount] = useState(0);
  const [peopleCount, setPeopleCount] = useState(0);
  const [helperDialogOpen, setHelperDialogOpen] = useState(false);
  const [loadingHelerAction, setLoadingHelperAction] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const [isOnline, setIsOnline] = useState(false);
  const otherUserId = chatData.id; // The user we're chatting with
  

  const fetchChatHistory = useCallback(async () => {
    if (!chatData.id || !postId) return;
    setIsFetching(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chats?postId=${postId}&buyerId=${chatData.id}`, {headers: {
        Authorization: `Bearer ${authToken}`,
    }});
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsFetching(false);
    }
  }, [authToken, chatData.id, postId]);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const post = response.data;
        setIsHelper(post.helperIds.includes(chatData.id));
        setHelperCount(post.helperIds.length);
        setPeopleCount(post.peopleCount);
      } catch (error) {
        console.error('Error fetching post details:', error);
      }
    };
    fetchPostDetails();
  }, [chatData.id, postId, authToken]);

  useEffect(() => {
    if (postId && chatData.id) {
      fetchChatHistory();
      const room = `post_${postId}_user_${chatData.id}_user_${userId}`; // Ensure unique room name
      // Join the specific room
      socket.emit('joinChatRoom', { 
        postId: postId, 
        userId: chatData.id, 
        otherUserId: userId
      });

      socket.on('receiveMessage', (newMessage) => {
        // Only process messages for this specific chat
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

      // Notify server that this user is online
      socket.emit('userOnline', userId);

      // Listen for status changes of the other user
      socket.on('userStatusChange', ({ userId: changedUserId, isOnline: status }) => {
        if (changedUserId === otherUserId) {
          setIsOnline(status);
        }
      });

      // Check initial online status
      socket.emit('checkOnlineStatus', otherUserId, (status) => {
        setIsOnline(status);
      });
    }

    return () => {
      // const room = `${postId}_${chatData.id}`; // Ensure unique room name
      // Leave the room
      socket.emit('leaveChatRoom', { 
        postId: postId, 
        userId: chatData.id, 
        otherUserId: userId 
      });
      socket.off('receiveMessage');
      socket.off('messageSeenUpdate');
      // When closing chat, notify server
      socket.emit('userAway', userId);
      socket.off('userStatusChange');
    };
  }, [chatData.id, fetchChatHistory, postId, userId]);

  const markMessagesAsSeen = useCallback(async (messageIds) => {
    if (!messageIds || messageIds.length === 0) return;
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/chats/markAsSeen`, {
        postId: postId, // or postId in ChatHistory.js
        buyerId: chatData.id, // or chatData.id in ChatHistory.js
        sellerId: userId,
        messageIds
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      // Emit real-time seen status to the other user
      const room = `post_${postId}_user_${chatData.id}_user_${userId}`;
      messageIds.forEach(messageId => {
        socket.emit('messageSeen', { room, messageId });
      });
    } catch (error) {
      console.error('Error marking messages as seen:', error);
    }
  }, [postId, chatData.id , userId, authToken]); // Adjust dependencies for ChatHistory.js

  useEffect(() => {
    if (messages.length === 0) return;
  
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
  }, [messages, userId, markMessagesAsSeen]);

  const handleSendMessage = async () => {
    if (message.trim() === '') return;

    if (!isAuthenticated)  return;
    

    // setLoading(true);

    const tempMessageId = `temp-${Date.now()}`;
    const sentAt = new Date(); // Timestamp when sending starts
    const optimisticMessage = {
      _id: tempMessageId,
      senderId: userId,
      text: message,
      createdAt: sentAt, // Store the timestamp
      isPending: true,
    };
  
    // Add optimistic message to chat
    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
    setMessage('');
    setTimeout(() => inputRef.current?.focus(), 50);

    try {
      // const response = 
      await axios.post(`${process.env.REACT_APP_API_URL}/api/chats/sendMessage`, {
        // method: 'POST',
        
          postId: postId,
          sellerId: userId,
          buyerId: chatData.id,
          text: message,    
        
      }, {headers: {
        Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json',
    }});

      // if (response) {
      //   const newMessage = { senderId: userId, text: message, createdAt: new Date() };
      //   const room = `${postId}_${chatData.id}`;
      //   socket.emit('sendMessage', { room, message: newMessage });

      //   setMessage('');
      //   console.log("Message sent");
      //   // fetchChatHistory(); // Refresh chat history
      //   setTimeout(() => inputRef.current?.focus(), 50); // Keeps keyboard open
      // }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temporary message if the request fails
      setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== tempMessageId));
    } 
    // finally {
    //   setLoading(false); 
    // }
  };

  // const onEmojiClick = (event, emojiObject) => {
  //   setMessage(prevMessage => prevMessage + emojiObject.emoji);
  //   setShowEmojiPicker(false);
  // };

  useEffect(() => {
    // Instantly scroll to the latest transaction without animation
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages.length]); // Runs every time transactions update

  // Insert emoji at cursor position
  const onEmojiClick = (emojiObject) => {
    if (!inputRef.current) return;
  
    // Ensure cursor position is updated before inserting the emoji
    const cursorPosition = inputRef.current.selectionStart || message.length;
    const textBeforeCursor = message.substring(0, cursorPosition);
    const textAfterCursor = message.substring(cursorPosition);
  
    // Insert emoji at the correct position
    // const newMessage = textBeforeCursor + emojiObject.emoji + textAfterCursor;
    setMessage(textBeforeCursor + emojiObject.emoji + textAfterCursor);
    // setShowEmojiPicker(false);
  
    // Move cursor to the correct position after the emoji
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = inputRef.current.selectionEnd = cursorPosition + emojiObject.emoji.length;
        // inputRef.current.focus(); // ✅ Keep keyboard open
      }
    }, 50);
  };

  const handleEmojiToggle = () => {
    setShowEmojiPicker(!showEmojiPicker);
    if (!isPickerLoaded) setIsPickerLoaded(true); // Mark as loaded once opened
  };

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

  const toggleHelper = async () => {
    setLoadingHelperAction(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/chats/toggle-helper`, 
        { postId, buyerId: chatData.id }, 
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setIsHelper(!isHelper);
      setHelperCount(response.data.helperIds.length);
      setLoadingHelperAction(false);
      setHelperDialogOpen(false);
    } catch (error) {
      console.error('Error toggling helper:', error);
    } finally {
      setLoadingHelperAction(false);
    }
  };

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
    // <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
    //   <DialogTitle>Chat with {post.userCode}</DialogTitle>
    //   <DialogContent>
    <>
    {/* <Box sx={{m: 2}}>
        <Typography>Chat History{postId}</Typography>
        <Typography>BuyerId {chatId}</Typography>
        <Typography>SellerId {userId}</Typography> */}
        {/* <Box sx={{ height: '400px', overflowY: 'auto', m: 1 , scrollbarWidth:'thin'}}>
          {messages.length > 0 ? (
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
              }}>
                <Typography variant="body1">{msg.text}</Typography>
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right' }}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          ))

        ) : 
        (
          <Typography color='grey'>Start chat</Typography>
        )}
        </Box> */}
        {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <EmojiEmotionsIcon />
          </IconButton>
          {showEmojiPicker && (
            <Box sx={{ position: 'absolute', bottom: 60, left: 20 }}>
              <Picker onEmojiClick={onEmojiClick} />
            </Box>
          )}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <IconButton color="primary" onClick={handleSendMessage}>
            <SendIcon />
          </IconButton> */}
        {/* </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog> */}
    {/* </Box>
    </Box> */}
    
    <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}>
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        bgcolor: 'white',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        padding: isMobile ? '10px' : '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {/* <Box display="flex" justifyContent="space-between" alignItems="center" sx={{scrollbarWidth:'none', margin: -1}}> */}
        {/* {!isMobile ? ( */}
          <Box display="flex" alignItems="center">
            <Avatar
              alt={chatData.profilePic}
              src={
                chatData.profilePic
                  ? `data:image/jpeg;base64,${chatData.profilePic}`
                  : 'https://placehold.co/56x56?text=No+Image'
              }
              sx={{ width: 46, height: 46, mr: 1 }}
            >
              {chatData.profilePic}
            </Avatar>
            <Box >
              <Typography variant="h6" fontWeight="400" fontFamily="sans-serif">
                {chatData.username}
              </Typography>
              {isOnline ? (
                <Typography 
                  component="span" 
                  variant="caption"
                  color="primary"
                  sx={{ ml: 0 }}
                >
                  Online
                </Typography>
              ) : (
                  <Typography 
                    component="span" 
                    variant="caption"
                    color="error"
                    sx={{ ml: 0 }}
                  >
                    Offline
                  </Typography>
                )
              }
              {/* <Typography>Chat History{postId}</Typography>
              <Typography>BuyerId {chatData.id}</Typography>
              <Typography>SellerId {userId}</Typography>  */}
            </Box>
            
          </Box> 
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap:1 }}>
            <IconButton onClick={() => setHelperDialogOpen(true)} disabled={helperCount >= peopleCount && !isHelper}>
              {isHelper ? <StarRoundedIcon fontSize="medium" color="primary"/> : <StarOutlineRoundedIcon fontSize="medium" />}
            </IconButton>
            {isMobile && (
              <Box >
                <IconButton 
                onClick={handleCloseDialog}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        {/* ) : null} */}
      {/* </Box> */}
    </Box>
    <Box onScroll={handleScroll} height={isMobile ? 'calc(82vh - 44px)' : 'calc(66vh - 64px)'} bgcolor="#f5f5f5"
      sx={{
      overflowY: 'auto',
      padding: '0px', scrollbarWidth:'thin', 
      scrollbarColor: '#aaa transparent', // Firefox (thumb & track)
    }}>
      {/* <Box mb={0} sx={{ scrollbarWidth: 'thin' }}> */}
      {/* <GroupTransHistory transactions={filteredTransactions  || []} loggedInUserId={loggedInUserId}
        socket={socket} // Pass the socket instance
        groupId={groupId} // Pass the groupId
        group={group}
        isSearchOpen={isSearchOpen}
      /> */}
      {/* <Box sx={{ overflowY: 'auto', m: 1 , scrollbarWidth:'thin', marginBottom:'6rem'}}> */}
        {isFetching ? (
            // <Typography textAlign="center">Loading...</Typography>
          <Box sx={{ margin: '10px', textAlign: 'center' }}>
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
                <Box key={msg._id || `msg-${index}`} sx={{ display: 'flex', justifyContent: msg.senderId === userId ? 'flex-end' : 'flex-start', m: 1 }}
                  ref={index === msgs.length - 1 ? bottomRef : null} // Attach ref to last transaction
                >
                  <Box sx={{
                    bgcolor: msg.senderId === userId ? theme.palette.primary.main : theme.palette.grey[300],
                    color: msg.senderId === userId ? '#fff' : '#000',
                    p: 1,
                    borderRadius: 2,
                    maxWidth: '70%', textAlign: "start",
                    alignItems: msg.senderId === userId ? 'flex-end' : 'flex-start',
                  }}>
                    {/* <Typography variant="body1">{msg.text}</Typography> */}
                    <Typography variant="body1" noWrap sx={{ 
                        whiteSpace: "pre-wrap", // Retain line breaks and tabs
                        wordWrap: "break-word",
                      }}>
                        {msg.text}
                      </Typography>
                    {/* <Typography variant="caption" sx={{ display: 'block', textAlign: 'right' }}>
                      {new Date(msg.createdAt).toLocaleString()}
                    </Typography> */}
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent:msg.senderId === userId ? 'flex-end' : 'flex-start', gap: 1, mt: 0 }}>
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
                              <DoneAllRoundedIcon fontSize="inherit" /> //color="primary" 
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
                {/* <div ref={bottomRef} /> */}
            </Box>
          ))

        ) : 
        (
          <Box sx={{ textAlign: 'center', my: 2 }}>
            <Typography color='grey' sx={{ mb: 2 }}>Start chat</Typography>
          </Box>
        )}
        {/* </Box> */}
        
      {/* </Box> */}
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
        </IconButton>)}
      
    </Box>
    
    <Box sx={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          // bgcolor: 'white',
          // boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.1)',
          padding: '4px',  display: 'flex', alignItems: 'center', gap: 1, margin:'8px 8px',
          bgcolor: theme.palette.background.paper, borderRadius: '20px',
          border: `1px solid ${theme.palette.divider}`, flex: 1
        }}
      >
                {/* <Toolbar sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: 'white', 
                  // borderRadius:'16px',
                  boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '1rem',
                }}> */}
                  {/* <Box  sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}> */}
                    {!isMobile && (
                      <IconButton 
                        onMouseDown={(e) => e.preventDefault()} // ✅ Prevents losing focus on mobile
                        onClick={handleEmojiToggle}>
                        {showEmojiPicker ? <EmojiEmotionsRoundedIcon /> : <SentimentSatisfiedRoundedIcon />}
                      </IconButton>
                    )}
                    
                    {/* Lazy Loaded Emoji Picker */}
                    {showEmojiPicker && (
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
                    )}
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
                      // onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault(); // Prevent new line
                          handleSendMessage();
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
                          padding: '0px 10px', scrollbarWidth: 'none', maxHeight: '80px', overflowY: 'auto',
                        },
                      }}
                    />
                    <IconButton color="primary" sx={{
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
                      onClick={handleSendMessage}
                      disabled={message.trim() === '' || !isAuthenticated}
                      >
                      <SendRoundedIcon sx={{ fontSize: '24px', marginLeft:'4px' }} />
                    </IconButton>
                  </Box>
                {/* </Toolbar> */}
              {/* </Box> */}
  </Box>
  <Dialog
    open={helperDialogOpen}
    onClose={() => setHelperDialogOpen(false)}
    aria-labelledby="delete-dialog-title" 
    sx={{ '& .MuiPaper-root': { borderRadius: '14px' }, '& .MuiDialogTitle-root': { padding: '14px 16px' },}}
  >
    <DialogTitle id="delete-dialog-title" >
      {isHelper ? 'Are you sure want to remove user from the Helper!' : 'Are you sure you want to tag this user to Helper!'}
    </DialogTitle>
    <DialogContent style={{ padding: '16px' }}>
      <Typography color="grey">
        {isHelper ?  'If you proceed, this user will removed from Helper list of this post...' : 'If you proceed, this user tagged to Helper list of this post...' }
      </Typography>
      {(peopleCount - helperCount === 1 ) && !isHelper && (
      <Typography color="primary" mt={1}>
        {/* {helperCount}{peopleCount} */}
        Post status will be updated to <strong>Closed</strong> because you have received all the required helpers for your post.
      </Typography>
      )}
      {(peopleCount === helperCount ) && isHelper && (
      <Typography color="primary" mt={1}>
        Post status will be updated to <strong>Active</strong> because you have removed one of your Helper from the required helpers for your post.
      </Typography>
      )}
    </DialogContent>
    <DialogActions style={{ padding: '1rem' , gap: 1}}>
      <Button onClick={() => setHelperDialogOpen(false)} disabled={helperCount >= peopleCount && !isHelper} variant='text' color="error" sx={{borderRadius:'8px'}}>
        Cancel
      </Button>
      <Button onClick={toggleHelper} disabled={helperCount >= peopleCount && !isHelper} variant='contained' color="primary" sx={{ marginRight: '0px', borderRadius:'8px' }}>
        {loadingHelerAction ? <> <CircularProgress size={20} sx={{marginRight:'8px', color:'white'}}/> processing... </> : isHelper ? 'Remove user' : 'Tag user'}
      </Button>
    </DialogActions>
  </Dialog>
  </>
  );
};

export default ChatHistory;