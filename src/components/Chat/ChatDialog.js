// src/components/ChatDialog.js
import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, IconButton, Box, Typography, useMediaQuery, useTheme, DialogActions, LinearProgress, CircularProgress } from '@mui/material';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SentimentSatisfiedRoundedIcon from '@mui/icons-material/SentimentSatisfiedRounded';
import EmojiEmotionsRoundedIcon from '@mui/icons-material/EmojiEmotionsRounded';

const Picker = lazy(() => import("emoji-picker-react")); // Lazy load Emoji Picker

const ChatDialog = ({ open, onClose, post, user }) => {
    // const tokenUsername = localStorage.getItem('tokenUsername');
  const userId = localStorage.getItem('userId');
  const authToken = localStorage.getItem('authToken');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const bottomRef = useRef(null); // Reference to the last transaction
  const inputRef = useRef(null);
  const prevMessagesLength = useRef(0);
  const [loading, setLoading] = useState(false);
  const [isPickerLoaded, setIsPickerLoaded] = useState(false); // Track if loaded


//   useEffect(() => {
//     // if (open) {
//       // Fetch chat history when the dialog opens
//       fetchChatHistory();
//     // }
//   });

  const fetchChatHistory = useCallback(async () => {
    if (!post._id || !userId) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chats?postId=${post._id}&buyerId=${userId}`, {headers: {
        Authorization: `Bearer ${authToken}`,
    }});
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  }, [post._id, userId, authToken]);

  useEffect(() => {
    if (open) fetchChatHistory();
  }, [open, fetchChatHistory]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      bottomRef.current?.scrollIntoView({ behavior:'auto' });
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  const handleSendMessage = async () => {
    // if (message.trim() === '') return;
    if (!message.trim()) return;

    setLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/chats/send`, {
        // method: 'POST',
        
          postId: post._id,
          sellerId: post.userId,
          buyerId: userId,
          text: message,    
        
      }, {headers: {
        Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json',
    }});

      if (response) {
        setMessage('');
        console.log("Message sent");
        fetchChatHistory(); // Refresh chat history
        setTimeout(() => inputRef.current?.focus(), 50); // Keeps keyboard open
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false); 
    }
  };

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
  

  

  

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md"  fullScreen={isMobile} sx={{
        margin: isMobile ? '10px' : '0px',
        '& .MuiPaper-root': { borderRadius: '14px',  } //maxHeight: isMobile ? '300px' : 'auto'
      }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>Chat with {post.userCode}
        <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
        >
            <CloseIcon />
        </IconButton>
      </DialogTitle>
    <DialogContent sx={{padding: 0, scrollbarWidth:'thin' }}>
        <Box sx={{  overflowY: 'auto', p: 1 , scrollbarWidth:'thin'}}>
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
                wordWrap: 'break-word',
              }}>
                <Typography variant="body1">{msg.text}</Typography>
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          ))
        ) : 
        (
          <Typography color='grey' textAlign="center" sx={{ mt: 2 }}>Start chat</Typography>
        )}
        </Box>

        
        
      </DialogContent>
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
      <DialogActions >
        {/* <Button onClick={onClose}>Close</Button> */}
        

        {/* Input & Send Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 1, padding: isMobile ? 0 : 1, flex: 1 }}>
          <IconButton 
            onMouseDown={(e) => e.preventDefault()} // ✅ Prevents losing focus on mobile
            onClick={handleEmojiToggle}>
            {showEmojiPicker ? <EmojiEmotionsRoundedIcon /> : <SentimentSatisfiedRoundedIcon />}
          </IconButton>
          <TextField
            fullWidth
            inputRef={inputRef}
            variant="outlined"
            placeholder="Type a message..."
            multiline
            value={message}
            minRows={1}
            maxRows={3} 
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
          <IconButton color="primary" 
            onMouseDown={(e) => e.preventDefault()} // ✅ Prevents losing focus on mobile
            onClick={handleSendMessage}
            disabled={loading || message.trim() === ''}
            >
            {loading ? <LinearProgress sx={{ width: 24, height: 4, borderRadius: 2, mt: 0 }} /> : <SendRoundedIcon />} 
          </IconButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ChatDialog;