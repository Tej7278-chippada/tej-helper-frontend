// src/components/CommentPopup.js
import React, { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Box,
  useMediaQuery,
  Slide,
  Menu,
  MenuItem,
  ListItemIcon,
  DialogActions,
  Avatar,
  // Badge,
  Tooltip,
  Snackbar,
  Alert,
  // LinearProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
// import CheckIcon from '@mui/icons-material/Check';
// import ClearIcon from '@mui/icons-material/Clear';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTheme } from '@emotion/react';
import { addComment, editComment, deleteComment, fetchComments } from '../api/api';

function CommentPopup({
  open,
  onClose,
  post,
  onCommentAdded,
  onCommentDeleted,
  setLoginMessage,
  darkMode,
  // getGlassmorphismStyle
}) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingUpdating, setLoadingUpdating] = useState(false);
  const [fetchingComments, setFetchingComments] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userName = localStorage.getItem('tokenUsername');
  const userId = localStorage.getItem('userId');
  const userProfilePic = localStorage.getItem('tokenProfilePic'); // Get user profile pic from localStorage
  const commentInputRef = useRef(null);
  const editInputRef = useRef(null);
  const commentsContainerRef = useRef(null);

  // Fetch comments when popup opens
  const loadComments = async (refresh = false) => {
    if (!post?._id || !open) return;

    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setFetchingComments(true);
      }

      const data = await fetchComments(post._id);

      setComments(data.comments || []);
      setTotalComments(data.totalComments || 0);

      if (refresh) {
        setSnackbar({
          open: true,
          message: 'Comments refreshed!',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load comments',
        severity: 'error'
      });
    } finally {
      setFetchingComments(false);
      setIsRefreshing(false);
    }
  };

  // Initial load when popup opens
  useEffect(() => {
    if (open && post?._id) {
      const authToken = localStorage.getItem('authToken');
      setIsAuthenticated(!!authToken);
      loadComments();
    }
  }, [open, post?._id]);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setComments([]);
      setNewComment('');
      setEditingCommentId(null);
    }
  }, [open]);

  // useEffect(() => {
  //   const authToken = localStorage.getItem('authToken');
  //   setIsAuthenticated(!!authToken);
  //   if (post) {
  //     setComments([...post.comments].reverse() || []);
  //   }
  // }, [post]);

  // Auto-focus input when opening
  // useEffect(() => {
  //   if (open) {
  //     setTimeout(() => {
  //       commentInputRef.current?.focus();
  //     }, 300);
  //   }
  // }, [open]);

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      setLoginMessage({
        open: true,
        message: 'Please log in first. Click here to login.',
        severity: 'warning'
      });
      return;
    }
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const newCommentData = {
        text: newComment.trim(),
        createdAt: new Date().toISOString()
      };

      // Optimistically add comment to local state
      const optimisticComment = {
        _id: `temp-${Date.now()}`,
        text: newComment.trim(),
        username: userName,
        userId: userId,
        userProfilePic: `data:image/jpeg;base64,${userProfilePic}`, // Add user profile pic
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };

      setComments(prev => [optimisticComment, ...prev]);
      setNewComment('');

      await addComment(post._id, newCommentData);

      // Replace optimistic comment with real one from server
      // setComments(prev => {
      //   const newComments = prev.filter(comment => !comment.isOptimistic);
      //   const serverComments = response.comments || [];
      //   const newServerComment = serverComments.find(c => 
      //     c.username === userName && 
      //     c.text === newComment.trim()
      //   );

      //   if (newServerComment) {
      //     return [newServerComment, ...newComments];
      //   }
      //   return newComments;
      // });

      // Update total count
      setTotalComments(prev => prev + 1);
      setSnackbar({
        open: true,
        message: 'Comment added successfully!',
        severity: 'success'
      });

      // Refresh comments
      if (onCommentAdded) onCommentAdded();

      // Auto-focus back to input
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error('Error adding comment:', error);
      // Remove optimistic comment on error
      setComments(prev => prev.filter(comment => !comment.isOptimistic));
      setSnackbar({
        open: true,
        message: 'Failed to add comment. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    setLoadingUpdating(true);
    try {
      // Optimistically update comment
      setComments(prev => prev.map(comment =>
        comment._id === commentId
          ? { ...comment, text: editText.trim(), updatedAt: new Date().toISOString() }
          : comment
      ));

      await editComment(post._id, commentId, { text: editText.trim() });

      setSnackbar({
        open: true,
        message: 'Comment updated successfully!',
        severity: 'success'
      });

      setEditingCommentId(null);
      setEditText('');
      // if (onCommentAdded) onCommentAdded();
      // Refresh comments to ensure consistency
      // loadComments(true);
    } catch (error) {
      console.error('Error editing comment:', error);
      // Revert optimistic update on error
      loadComments(true);
      setSnackbar({
        open: true,
        message: 'Failed to update comment.',
        severity: 'error'
      });
    } finally {
      setLoadingUpdating(false);
    }
  };

  const handleDeleteComment = async () => {
    setLoading(true);
    try {
      const commentToDelete = comments.find(c => c._id === selectedCommentId);

      // Optimistically remove comment
      setComments(prev => prev.filter(comment => comment._id !== selectedCommentId));
      setTotalComments(prev => prev - 1);

      await deleteComment(post._id, selectedCommentId);

      setSnackbar({
        open: true,
        message: 'Comment deleted successfully!',
        severity: 'success'
      });

      setShowDeleteConfirm(false);
      setAnchorEl(null);
      if (onCommentDeleted) onCommentDeleted();
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Re-add comment on error
      loadComments(true);
      setSnackbar({
        open: true,
        message: 'Failed to delete comment.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, commentId) => {
    setAnchorEl(event.currentTarget);
    setSelectedCommentId(commentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.text);
    handleMenuClose();

    // Focus edit input
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 100);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const isUserComment = (comment) => {
    return comment.userId === userId || comment.username === userName;
  };

  const handleRefreshComments = () => {
    loadComments(true);
  };

  // Get initials for avatar
  const getInitials = (username) => {
    if (!username) return '?';
    return username.charAt(0).toUpperCase();
  };

  // Handle Enter key for submitting
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && isAuthenticated) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: isMobile ? 0 : '16px',
            backdropFilter: 'blur(20px)',
            background: darkMode
              ? 'rgba(30, 30, 30, 0.9)'
              : 'rgba(255, 255, 255, 0.95)',
            border: darkMode
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)'
          }
        }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogContent
          sx={{
            p: isMobile ? 2 : 3,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              position: 'sticky',
              top: 0,
              bgcolor: 'inherit',
              zIndex: 1,
              // pt: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Comments ({totalComments})
              </Typography>
              <Tooltip title="Refresh comments">
                <IconButton
                  size="small"
                  onClick={handleRefreshComments}
                  disabled={isRefreshing || fetchingComments}
                  sx={{ ml: 1 }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Loading indicator when fetching comments */}
          {/* {fetchingComments && (
            <LinearProgress sx={{ mb: 2 }} />
          )} */}

          {/* Add Comment Section */}
          <Box
            sx={{
              mb: 3,
              // ...getGlassmorphismStyle(theme, darkMode),
              borderRadius: '12px',
              p: 2,
              border: darkMode
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)',
              background: darkMode
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.02)'
            }}
          >
            <TextField
              inputRef={commentInputRef}
              placeholder="Write a comment..."
              fullWidth
              multiline
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={loading}
              onKeyDown={handleKeyPress}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main
                  }
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.95rem'
                }
              }}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1.5
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {isAuthenticated ? 'Press Enter to submit (Shift+Enter for new line)' : 'Login to comment'}
              </Typography>
              <Button
                onClick={handleAddComment}
                variant="contained"
                disabled={loading || !newComment.trim() || !isAuthenticated}
                size="small"
                sx={{
                  borderRadius: '6px',
                  px: 2,
                  background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(67, 97, 238, 0.3)'
                  },
                  '&:disabled': {
                    background: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
                  }
                }}
              >
                {loading ? <CircularProgress size={20} /> : 'Submit'}
              </Button>
            </Box>
          </Box>

          {/* Comments List */}
          <Box
            ref={commentsContainerRef}
            sx={{
              flex: 1,
              overflowY: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
                borderRadius: '3px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                borderRadius: '3px',
                '&:hover': {
                  background: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'
                }
              }
            }}
          >
            {comments.length > 0 ? (
              <>
                {comments.map((comment, index) => (
                  <Box
                    key={comment._id || index}
                    sx={{
                      mb: 1,
                      // ...getGlassmorphismStyle(theme, darkMode),
                      borderRadius: '12px',
                      p: 2,
                      position: 'relative',
                      border: isUserComment(comment)
                        ? `1px solid ${theme.palette.primary.main}40`
                        : darkMode
                          ? '1px solid rgba(255, 255, 255, 0.08)'
                          : '1px solid rgba(0, 0, 0, 0.06)',
                      background: darkMode
                        ? comment.isOptimistic
                          ? 'rgba(67, 97, 238, 0.1)'
                          : 'rgba(255, 255, 255, 0.03)'
                        : comment.isOptimistic
                          ? 'rgba(67, 97, 238, 0.05)'
                          : 'rgba(0, 0, 0, 0.01)',
                      opacity: comment.isOptimistic ? 0.8 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Comment Header */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {comment.userProfilePic ? (
                          <Avatar
                            src={comment.userProfilePic}
                            alt={comment.username}
                            sx={{
                              width: 36,
                              height: 36,
                              border: isUserComment(comment)
                                ? `2px solid ${theme.palette.primary.main}`
                                : 'none'
                            }}
                          />
                        ) : (
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: isUserComment(comment)
                                ? theme.palette.primary.main
                                : theme.palette.grey[700],
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              border: isUserComment(comment)
                                ? `2px solid ${theme.palette.primary.main}`
                                : 'none'
                            }}
                          >
                            {getInitials(comment.username)}
                          </Avatar>
                        )}
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {comment.username || 'Anonymous'}
                            {isUserComment(comment) && (
                              <Typography
                                component="span"
                                variant="caption"
                                sx={{
                                  ml: 1,
                                  color: theme.palette.primary.main,
                                  fontWeight: 500
                                }}
                              >
                                • You
                              </Typography>
                            )}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(comment.createdAt)}
                            </Typography>
                            {comment.updatedAt && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                                  fontStyle: 'italic'
                                }}
                              >
                                • Edited
                              </Typography>
                            )}
                            {/* {comment.isOptimistic && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: theme.palette.primary.main,
                                fontWeight: 500
                              }}
                            >
                              • Posting...
                            </Typography>
                          )} */}
                          </Box>
                        </Box>
                      </Box>

                      {/* Menu Button for user's own comments */}
                      {isUserComment(comment) && !comment.isOptimistic && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, comment._id)}
                          sx={{
                            opacity: 0.6,
                            '&:hover': {
                              opacity: 1,
                              background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                            }
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>

                    {/* Comment Content */}
                    {editingCommentId === comment._id ? (
                      <Box sx={{ mt: 1 }}>
                        <TextField
                          inputRef={editInputRef}
                          fullWidth
                          multiline
                          rows={2}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleEditComment(comment._id);
                            }
                            if (e.key === 'Escape') {
                              cancelEditing();
                            }
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              background: darkMode
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(0,0,0,0.02)'
                            }
                          }}
                        />
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 1,
                            mt: 1
                          }}
                        >
                          <Button
                            onClick={cancelEditing}
                            size="small"
                            disabled={loadingUpdating}
                            sx={{
                              borderRadius: '6px',
                              textTransform: 'none',
                              color: 'text.secondary'
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleEditComment(comment._id)}
                            disabled={!editText.trim() || loadingUpdating}
                            variant="contained"
                            size="small"
                            sx={{
                              borderRadius: '6px',
                              textTransform: 'none',
                              background: theme.palette.success.main,
                              '&:hover': {
                                background: theme.palette.success.dark
                              },
                              '&:disabled': {
                                background: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
                              }
                            }}
                          >
                            {loadingUpdating ? <CircularProgress size={20} /> : 'Update'}
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          lineHeight: 1.7,
                          color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.87)',
                          pl: 4.5, // Align with avatar
                          fontSize: '0.95rem'
                        }}
                      >
                        {comment.text}
                      </Typography>
                    )}
                  </Box>
                ))}

                {/* End of comments message */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    textAlign: 'center',
                    py: 3,
                    opacity: 0.7
                  }}
                >
                  Showing all {comments.length} comments
                </Typography>
              </>
            ) : fetchingComments ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading comments...
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  color: 'text.secondary'
                }}
              >
                <PersonIcon sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500, fontSize: '1.1rem' }}>
                  No comments yet
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.9rem' }}>
                  Be the first to share your thoughts!
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Menu for comment actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '10px',
            minWidth: 140,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(20px)',
            background: darkMode
              ? 'rgba(30, 30, 30, 0.95)'
              : 'rgba(255, 255, 255, 0.98)',
            border: darkMode
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <MenuItem
          onClick={() => startEditing(comments.find(c => c._id === selectedCommentId))}
          sx={{ py: 1.2, px: 2 }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Edit</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setShowDeleteConfirm(true);
            handleMenuClose();
          }}
          sx={{ py: 1.2, px: 2, color: 'error.main' }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography variant="body2">Delete</Typography>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: '12px',
            p: 2
          }
        }}
      >
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Delete Comment?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. The comment will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setShowDeleteConfirm(false)}
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteComment}
            variant="contained"
            color="error"
            disabled={loading}
            sx={{ borderRadius: '8px' }}
          >
            {loading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ borderRadius: '8px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default CommentPopup;