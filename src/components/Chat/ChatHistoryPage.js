// /components/chat/ChatHistoryPage.js
import React, { useEffect, useState, useRef } from "react";
import { Box, Avatar, Typography, TextField, IconButton, CircularProgress, LinearProgress } from "@mui/material";
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../utils/axiosConfig";
import io from 'socket.io-client';
import Layout from "../Layout";
import { useTheme } from "@emotion/react";
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';

const socket = io(process.env.REACT_APP_API_URL);

const ChatHistoryPage = () => {
  const { chatId } = useParams(); // Extract chatId from URL
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useNavigate();
  // const tokenUsername = localStorage.getItem("tokenUsername");
  const sellerId = localStorage.getItem("userId");
  const authToken = localStorage.getItem("authToken");
  const bottomRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    if (!authToken) {
      navigate("/login");
      return;
    }

    const fetchChat = async () => {
      try {
        const response = await apiClient.get(`/api/chats/chatHistory/?buyerId=${chatId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setChat(response.data || []);
        setIsFetching(false);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchChat();

    const room = `${chat?.postId}_${chatId}`;
    socket.emit('joinRoom', room);

    socket.on('receiveMessage', (newMessage) => {
      setChat((prevChat) => ({
        ...prevChat,
        messages: [...prevChat.messages, newMessage],
      }));
    });

    return () => {
      socket.emit('leaveRoom', room);
      socket.off('receiveMessage');
    };
  }, [chatId, authToken, navigate, chat?.postId]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);

    try {
      const response = await apiClient.post(
        "/api/chats/sendMessage",
        {
          postId: chat?.postId,
          sellerId: sellerId,
          buyerId: chat?.buyerId._id,
          text: message,
        },
        {
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json', },
        }
      );

      if (response.status === 201) {
        const newMessage = { senderId: sellerId, text: message, createdAt: new Date() };
        const room = `${chat?.postId}_${chatId}`;
        socket.emit('sendMessage', { room, message: newMessage });
        // setChat((prevChat) => ({
        //   ...prevChat,
        //   messages: [...prevChat.messages, { senderId: chat.buyerId, text: message }],
        // }));
        setMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [chat?.messages.length]);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!chat) {
    return (
    // <Typography>Loading chat...</Typography>
    <Box>
      <Layout>
        <Box sx={{ margin: '1rem', textAlign: 'center', marginTop: '1rem' }}>
          <Typography>Loading chat...</Typography>
        </Box>
      </Layout>
    </Box>
  );
  }

  return (
    <Layout>
    <Box display="flex" flexDirection="column" height="91vh">
      {/* Header with Profile */}
      <Box display="flex" alignItems="center" p={1} bgcolor="#f5f5f5" boxShadow={1}>
        <Avatar
          src={
            chat.buyerId.profilePic
              ? `data:image/jpeg;base64,${chat.buyerId.profilePic}`
              : "https://placehold.co/50x50?text=No+Image"
          }
          alt={chat.buyerId.username}
          sx={{ width: 50, height: 50, marginRight: 2 }}
        />
        <Typography variant="h6">{chat.buyerId.username}</Typography>
      </Box>

      {/* Chat Messages */}
      <Box flex={1} p={2} sx={{
        overflowY: 'auto', scrollbarWidth:'thin', 
        scrollbarColor: '#aaa transparent', // Firefox (thumb & track)
      }} bgcolor="#fff">
        {isFetching ? (
          <Box sx={{ margin: '10px', textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : chat.messages.length > 0 ? (
          chat.messages.map((msg, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={msg.senderId === sellerId ? "flex-end" : "flex-start"}
              mb={1}
              ref={index === chat.messages.length - 1 ? bottomRef : null}
            >
              <Box
                bgcolor={msg.senderId === sellerId ? "#f1f1f1" : "#4caf50"}
                color={msg.senderId === sellerId ? "black" : "white"}
                p={1}
                borderRadius={2}
                maxWidth="70%"
              >
                <Typography variant="body1" noWrap sx={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                  {msg.text}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right' }}>
                  {new Date(msg.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          ))
        ) : (
          <Typography color='grey'>Start chat</Typography>
        )}
        <IconButton
          style={{
            position: 'absolute',
            bottom: '90px',
            right: '6px',
            // padding: '6px 4px',
            borderRadius: '24px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            padding: '4px', // Reduce padding to shrink button size
            width:'30px', // Set smaller width
            height:'35px', // Set smaller height
            color: '#1a73e8', // Google Blue style
          }}
          // onClick={handleAddTransaction}
          onClick={scrollToBottom}
          onMouseDown={(e) => e.preventDefault()} // ✅ Prevents losing focus when selecting emoji
        >
          <KeyboardDoubleArrowDownRoundedIcon style={{ fontSize: '14px' }}/>
        </IconButton>
      </Box>

      {/* Message Input */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 0, padding:'10px' }} bgcolor="#f5f5f5">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={message}
          multiline
          minRows={1}
          maxRows={3} 
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
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
        <IconButton onClick={sendMessage} color="primary"
        onMouseDown={(e) => e.preventDefault()} // ✅ Prevents losing focus on mobile
        disabled={loading || message.trim() === ''}>
          {loading ? <LinearProgress sx={{ width: 24, height: 4, borderRadius: 2, mt: 0 }} /> : <SendRoundedIcon />}
        </IconButton>
      </Box>
    </Box>
    </Layout>
  );
};

export default ChatHistoryPage;