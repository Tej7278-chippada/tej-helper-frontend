import React, { useEffect, useState } from "react";
import { Box, Avatar, Typography, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../utils/axiosConfig";

const ChatHistoryPage = () => {
  const { chatId } = useParams(); // Extract chatId from URL
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  // const tokenUsername = localStorage.getItem("tokenUsername");
  const sellerId = localStorage.getItem("userId");
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    if (!authToken) {
      navigate("/");
      return;
    }

    const fetchChat = async () => {
      try {
        const response = await apiClient.get(`/api/chats/chatHistory/?buyerId=${chatId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setChat(response.data);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchChat();
  }, [chatId, authToken, navigate]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const response = await apiClient.post(
        "/api/chats/sendMessage",
        {
          postId: chat?.postId,
          sellerId: sellerId,
          buyerId: chat?.buyerId,
          text: message,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.status === 201) {
        setChat((prevChat) => ({
          ...prevChat,
          messages: [...prevChat.messages, { senderId: chat.buyerId, text: message }],
        }));
        setMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!chat) {
    return <Typography>Loading chat...</Typography>;
  }

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      {/* Header with Profile */}
      <Box display="flex" alignItems="center" p={2} bgcolor="#f5f5f5" boxShadow={1}>
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
      <Box flex={1} p={2} overflow="auto" bgcolor="#fff">
        {chat.messages.map((msg, index) => (
          <Box
            key={index}
            display="flex"
            justifyContent={msg.senderId === chat.buyerId ? "flex-start" : "flex-end"}
            mb={1}
          >
            <Box
              bgcolor={msg.senderId === chat.buyerId ? "#f1f1f1" : "#4caf50"}
              color={msg.senderId === chat.buyerId ? "black" : "white"}
              p={1}
              borderRadius={2}
              maxWidth="70%"
            >
              {msg.text}
            </Box>
            {/* <Typography>{msg.senderId}</Typography> */}
            {/* <Typography>{chat.buyerId}</Typography> */}
          </Box>
        ))}
      </Box>

      {/* Message Input */}
      <Box display="flex" p={2} bgcolor="#f5f5f5">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <IconButton onClick={sendMessage} color="primary">
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatHistoryPage;
