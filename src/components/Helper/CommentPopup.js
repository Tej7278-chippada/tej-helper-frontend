// src/components/CommentPopup.js
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, Typography, TextField, Button, IconButton, CircularProgress, Box, useMediaQuery } from '@mui/material';
// import { addComment } from '../../api/api';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@emotion/react';
import { addComment } from '../api/api';

function CommentPopup({ open, onClose, post, onCommentAdded, setLoginMessage, darkMode, getGlassmorphismStyle }) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [commentAddedMessage, setCommentAddedMessage] = useState('');
  const [commentFailedMessage, setCommentFailedMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const userName = localStorage.getItem('tokenUsername');

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    setIsAuthenticated(!!authToken); // Check if user is authenticated
    if (post) {
      setComments([...post.comments].reverse() || []); // Set existing comments when component loads
    }
  }, [post]);

  const handleAddComment = async () => {
    // if (!isAuthenticated) return; // Prevent unauthenticated actions
    if (!isAuthenticated) { // Prevent unauthenticated actions
      setLoginMessage({
        open: true,
        message: 'Please log in first. Click here to login.',
        severity: 'warning',
      });
      return;
    } 
    if (!newComment.trim()) return;
    if (newComment.trim() && post?._id) {
      setLoading(true);
      try {
        // Adding the comment to the backend
        const newCommentData = { text: newComment, createdAt: new Date().toISOString() };
        await addComment(post._id, newCommentData);

        // Clear the input field
        setNewComment('');

        // Show success message
        setCommentAddedMessage('Comment added successfully!');

        // Add new comment at the top of the list
        // const updatedComments = [{ text: newComment }, ...comments];

        // Update the comments state
        // setComments(updatedComments);

        // Add the new comment to the top of the list
        setComments((prevComments) => [newCommentData, ...prevComments]);

        // Update product's comment count
        // Call the parent function to update the product and close the popup
        onCommentAdded(); // This will trigger the parent to update the comment count

        // Refresh the comments list
        // await refreshComments();
      } catch (error) {
        console.error('Error adding comment:', error);
        setCommentFailedMessage('Comment can not added!');
      } finally {
        setLoading(false);
      }
    }
  };

  // const refreshComments = async () => {
  // const updatedProduct = await fetchProducts(product._id);
  // setComments(product.comments);
  // };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md"  fullWidth fullScreen={ isMobile ? true : false} sx={{margin: isMobile ? '10px' : '0px', '& .MuiPaper-root': { // Target the dialog paper
                  borderRadius: '14px', // Apply border radius
                  backdropFilter: 'blur(12px)',
                },}} >
      <DialogContent style={{ position: 'sticky', height: 'auto', scrollbarWidth: 'thin' }}>
        {/* Close button */}
        <IconButton
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '1rem',
            // backgroundColor: 'rgba(0, 0, 0, 0.1)',
            // color: '#333'
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6">Comments</Typography>

        <TextField
          label="Add a comment"
          fullWidth
          multiline
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{ 
            marginTop: '1rem',
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              bgcolor: theme.palette.background.paper,
            },
            '& .MuiInputBase-input': {
              padding: '0px 0px', scrollbarWidth: 'thin', scrollbarColor: '#888 transparent',
            },
          }}
        />
        {/* Align Submit button to the right */}
        <Box
          style={{
            display: 'flex',
            justifyContent: 'flex-end', // Align to the right
            marginTop: '1rem',
          }}
        >
          {/* Display message after a comment is added */}
          {commentAddedMessage && (
            <Typography variant="body2" color="success.main" style={{ marginTop: '1rem', paddingRight: '1rem', display: 'inline-block', float: 'right' }}>
              {commentAddedMessage}
            </Typography>
          )}
          {commentFailedMessage && (
            <Typography variant="body2" color="error.main" style={{ marginTop: '1rem' }}>
              {commentFailedMessage}
            </Typography>
          )}
          <Button
            onClick={handleAddComment}
            variant="contained"
            color="primary" 
            // style={{ width: '150px' }}
            sx={{borderRadius:2, background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',}}
            disabled={loading || newComment.trim() === ''}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </Box>
        {/* Display list of comments */}
        <Box sx={{ height: isMobile ? '500px' : '300px', overflowY: 'auto', margin: '1rem 0', mx: '-10px', borderRadius:'8px',  /* bgcolor: '#f5f5f5', */
          // Custom scrollbar styles
          // ...getGlassmorphismStyle(theme, darkMode),
          scrollbarWidth: 'thin', // Firefox
          scrollbarColor: '#aaa transparent', // Firefox (thumb & track)
          "&::-webkit-scrollbar": {
            width: "8px", // Thin scrollbar
            height: "8px", // If horizontal scroll exists
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent", // Track color
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#aaa", // Thumb color
            borderRadius: "4px", background: "#aaa", // Scrollbar thumb color
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#888", // Darker on hover
            background: "#888", // Darker on hover
          },
          "&::-webkit-scrollbar-button": {
            display: 'none', // Remove scrollbar arrows
          },
        }}>
          {comments && comments.length ? (
            comments.map((comment, index) => (
              <Typography
                key={index}
                component="div"
                style={{
                  margin: '6px',
                  // backgroundColor: '#f5f5f5',
                  padding: '1rem',
                  borderRadius: '6px',
                  // border: '1px solid #ddd',
                  // border: darkMode 
                  //   ? '1px solid rgba(255, 255, 255, 0.1)' 
                  //   : '1px solid rgba(0, 0, 0, 0.2)',
                  ...getGlassmorphismStyle(theme, darkMode),
                  marginTop: '6px',
                  lineHeight: '1.5',
                  textAlign: 'justify',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                }}
              >
                <strong>{comment.username || userName || 'Anonymous'}</strong> {/* Display username */}
                <Typography sx={{ display: 'inline-block', float: 'right' }}>
                  <small>{new Date(comment.createdAt).toLocaleString()}</small>
                </Typography>
                <Typography sx={{ paddingTop: '1rem' }}>{comment.text}</Typography>
              </Typography>
            ))
          ) : (
            <Typography color='grey' textAlign="center" sx={{ m: 2 }}>No comments available.</Typography>
          )}
        </Box>

      </DialogContent>
    </Dialog>
  );
}

export default CommentPopup;
