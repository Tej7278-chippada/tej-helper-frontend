// src/components/ChatHistory.js
import React, { useState, useEffect, useRef } from 'react';
import { TextField, IconButton, Box, Typography, useTheme } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import Picker from 'emoji-picker-react';
import axios from 'axios';
// import { useParams } from 'react-router-dom';

const ChatHistory = ({ open, onClose, post, user, chatId, postId }) => {
    // const tokenUsername = localStorage.getItem('tokenUsername');
    // const { buyerId } = useParams(); // Get groupId from URL if available
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
const bottomRef = useRef(null); // Reference to the last transaction

  useEffect(() => {
    // if (open) {
      // Fetch chat history when the dialog opens
      fetchChatHistory();
    // }
  });

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chats?postId=${postId}&buyerId=${chatId}`, {headers: {
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
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/chats/sendMessage`, {
        // method: 'POST',
        
          postId: postId,
          sellerId: userId,
          buyerId: chatId,
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
    // <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
    //   <DialogTitle>Chat with {post.userCode}</DialogTitle>
    //   <DialogContent>
    <Box sx={{m: 2}}>
        <Typography>Chat History{postId}</Typography>
        <Typography>BuyerId {chatId}</Typography>
        <Typography>SellerId {userId}</Typography>
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
        {/* </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog> */}
    </Box>
    </Box>
  );
};

export default ChatHistory;