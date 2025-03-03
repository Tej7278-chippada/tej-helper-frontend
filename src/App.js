// src/App.js
import React from 'react';
import './App.css';
import Login from './components/Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import PrivateRoute from './components/PriviteRoute';
import { ThemeProvider, createTheme } from '@mui/material';
import ForgotPassword from './components/ForgotPassword';
import UserProfile from './components/UserProfile';
import Helper from './components/Helper/Helper';
import PostService from './components/Helper/PostService';
import PostDetailsById from './components/Helper/PostDetailsById';
import WishList from './components/Helper/WishList';
import ChatsOfPosts from './components/Chat/ChatsOfPosts';
// import ChatHistory from './components/Chat/ChatHistory';
import ChatHistoryPage from './components/Chat/ChatHistoryPage';

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/helper" element={
            <PrivateRoute>
              <Helper />
            </PrivateRoute>
          } />
          <Route path="/userPosts" element={
            <PrivateRoute>
              <PostService />
            </PrivateRoute>
          } />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/user/:id" element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>}
          />
          <Route path="/post/:id" element={<PostDetailsById />} />
          <Route path="/wishlist" element={
            <PrivateRoute>
              <WishList />
            </PrivateRoute>
          } />
          <Route path="/chatsOfPost/:postId" element={
            <PrivateRoute>
              <ChatsOfPosts />
            </PrivateRoute>
          } />
          <Route path="/chat/:chatId" element={
            <PrivateRoute>
              <ChatHistoryPage />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
