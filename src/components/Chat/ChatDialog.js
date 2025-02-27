// src/components/ChatDialog.js
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, IconButton, Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import Picker from 'emoji-picker-react';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';

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

  useEffect(() => {
    // if (open) {
      // Fetch chat history when the dialog opens
      fetchChatHistory();
    // }
  });

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chats?postId=${post._id}&buyerId=${userId}`, {headers: {
        Authorization: `Bearer ${authToken}`,
    }});
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() === '') return;

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
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const onEmojiClick = (event, emojiObject) => {
    setMessage(prevMessage => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    // Instantly scroll to the latest transaction without animation
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages.length]); // Runs every time transactions update

  

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Chat with {post.userCode}
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
      <DialogContent>
        <Box sx={{ height: '400px', overflowY: 'auto', m: 1 , scrollbarWidth:'thin'}}>
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
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
          </IconButton>
        </Box>
      </DialogContent>
      {/* <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions> */}
    </Dialog>
  );
};

export default ChatDialog;