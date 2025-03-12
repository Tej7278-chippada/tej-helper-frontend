// src/components/ChatHistory.js
import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { TextField, IconButton, Box, Typography, useTheme, useMediaQuery, Avatar, CircularProgress, LinearProgress } from '@mui/material';
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

const socket = io(process.env.REACT_APP_API_URL);

const Picker = lazy(() => import("emoji-picker-react")); // Lazy load Emoji Picker

const ChatHistory = ({ chatData, postId, handleCloseDialog }) => {
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
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);


  

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
    if (postId && chatData.id) {
      fetchChatHistory();
      const room = `${postId}_${chatData.id}`; // Ensure unique room name
      socket.emit('joinRoom', room);

      socket.on('receiveMessage', (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });
    }

    return () => {
      const room = `${postId}_${chatData.id}`; // Ensure unique room name
      socket.emit('leaveRoom', room);
      socket.off('receiveMessage');
    };
  }, [chatData.id, fetchChatHistory, postId]);

  const handleSendMessage = async () => {
    if (message.trim() === '') return;

    setLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/chats/sendMessage`, {
        // method: 'POST',
        
          postId: postId,
          sellerId: userId,
          buyerId: chatData.id,
          text: message,    
        
      }, {headers: {
        Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json',
    }});

      if (response) {
        const newMessage = { senderId: userId, text: message, createdAt: new Date() };
        const room = `${postId}_${chatData.id}`;
        socket.emit('sendMessage', { room, message: newMessage });

        setMessage('');
        console.log("Message sent");
        // fetchChatHistory(); // Refresh chat history
        setTimeout(() => inputRef.current?.focus(), 50); // Keeps keyboard open
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false); 
    }
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
              sx={{ width: 56, height: 56, mr: 2 }}
            >
              {chatData.profilePic}
            </Avatar>
            <Box >
              <Typography variant="h5">
                {chatData.username}
              </Typography>
              {/* <Typography>Chat History{postId}</Typography>
              <Typography>BuyerId {chatData.id}</Typography>
              <Typography>SellerId {userId}</Typography>  */}
            </Box>
            
          </Box> 
          {isMobile && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton 
              onClick={handleCloseDialog}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}
        {/* ) : null} */}
      {/* </Box> */}
    </Box>
    <Box height={isMobile ? 'calc(82vh - 64px)' : 'calc(66vh - 64px)'} bgcolor="#f5f5f5"
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
                {/* <Typography variant="body1">{msg.text}</Typography> */}
                <Typography variant="body1" noWrap sx={{ 
                    whiteSpace: "pre-wrap", // Retain line breaks and tabs
                    wordWrap: "break-word",
                  }}>
                    {msg.text}
                  </Typography>
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right' }}>
                  {new Date(msg.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          ))

        ) : 
        (
          <Typography color='grey'>Start chat</Typography>
        )}
        {/* </Box> */}
        
      {/* </Box> */}
      <IconButton
          style={{
            position: 'sticky',
            bottom: isMobile ? '30px' : '35px',
            left : '100%',
            // left: isMobile ? '4px' : '12px',
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
      
    </Box>
    
    <Box sx={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          bgcolor: 'white',
          boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.1)',
          padding: '10px',  display: 'flex', alignItems: 'center', gap: 1
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
                    {/* <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                      <EmojiEmotionsIcon />
                    </IconButton> */}
                    <IconButton 
                      onMouseDown={(e) => e.preventDefault()} // ✅ Prevents losing focus on mobile
                      onClick={handleEmojiToggle}>
                      {showEmojiPicker ? <EmojiEmotionsRoundedIcon /> : <SentimentSatisfiedRoundedIcon />}
                    </IconButton>
                    {/* {showEmojiPicker && (
                      <Box sx={{ position: 'absolute', bottom: 60, left: 20 }}>
                        <Picker onEmojiClick={onEmojiClick} />
                      </Box>
                    )} */}
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
                      variant="outlined"
                      placeholder="Type a message..."
                      multiline
                      value={message}
                      minRows={1}
                      maxRows={isMobile ? 2 : 1} 
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '20px',
                          bgcolor: theme.palette.background.paper,
                        },
                        '& .MuiInputBase-input': {
                          padding: '0px 0px', scrollbarWidth: 'thin'
                        },
                      }}
                    />
                    {/* <IconButton color="primary" onClick={handleSendMessage}>
                      <SendIcon />
                    </IconButton> */}
                    <IconButton color="primary" 
                      onMouseDown={(e) => e.preventDefault()} // ✅ Prevents losing focus on mobile
                      onClick={handleSendMessage}
                      disabled={loading || message.trim() === ''}
                      >
                      {loading ? <LinearProgress sx={{ width: 24, height: 4, borderRadius: 2, mt: 0 }} /> : <SendRoundedIcon />} 
                    </IconButton>
                  </Box>
                {/* </Toolbar> */}
              {/* </Box> */}
  </Box>
  </>
  );
};

export default ChatHistory;