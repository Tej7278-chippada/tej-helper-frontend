import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  CircularProgress
} from '@mui/material';
import { fetchUserFollowers, fetchUserFollowing } from '../api/api';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import SkeletonChats from '../Chat/SkeletonChats';

const FollowDialog = ({ 
  open, 
  onClose, 
  userId, 
  followType, // 'followers' or 'following'
  onUserClick,
  darkMode,
  isMobile
}) => {
  const [followData, setFollowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // Reset state when dialog opens/closes or userId/followType changes
  useEffect(() => {
    if (open && userId) {
      setFollowData([]);
      setPage(1);
      setHasMore(true);
      setInitialLoad(true);
      fetchFollowData(1, true);
    } else {
      setFollowData([]);
      setPage(1);
      setHasMore(true);
    }
  }, [open, userId, followType]);

  const fetchFollowData = async (pageNum = 1, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError('');
      
      const response = followType === 'followers' 
        ? await fetchUserFollowers(userId, pageNum)
        : await fetchUserFollowing(userId, pageNum);
      
      if (isInitial) {
        setFollowData(response.data.users || response.data);
      } else {
        setFollowData(prev => [...prev, ...(response.data.users || response.data)]);
      }
      
      // Check if there's more data
      if (response.data.users) {
        setHasMore(response.data.users.length === 10); // Assuming 10 per page
      } else {
        setHasMore((response.data.length || 0) === 10);
      }
      
      setPage(pageNum);
    } catch (err) {
      console.error(`Error fetching ${followType}:`, err);
      setError(`Failed to load ${followType}`);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setInitialLoad(false);
    }
  };

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Load more when 80% scrolled
    if (scrollHeight - scrollTop <= clientHeight * 1.2 && hasMore && !loadingMore && !loading) {
      fetchFollowData(page + 1, false);
    }
  }, [hasMore, loadingMore, loading, page, followType, userId]);

  const handleUserClick = (user) => {
    if (onUserClick) {
      onUserClick(user);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          maxHeight: '80vh',
          mx: 1.5
        }
      }}
    >
      <DialogTitle>
        {followType === 'followers' ? 'Followers' : 'Following'} 
        {/* {loading && initialLoad && <CircularProgress size={20} sx={{ ml: 1 }} />} */}
      </DialogTitle>
      
      <DialogContent 
        onScroll={handleScroll}
        sx={{ 
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
          },
        }}
      >
        <Box sx={{ mt: 1 }}>
          {loading && initialLoad ? (
            <Box >
              <SkeletonChats />
            </Box>
          ) : error ? (
            <Typography variant="body2" color="error" textAlign="center">
              {error}
            </Typography>
          ) : followData.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No {followType} found
            </Typography>
          ) : (
            <>
              {followData.map((user) => (
                <Box
                  key={user._id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1,
                    // mb: 1,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent', // Remove tap highlight
                    WebkitTouchCallout: 'none', // Disable iOS callout
                    WebkitUserSelect: 'none', // Disable text selection
                    userSelect: 'none',
                    '&:active': {
                      transform: 'scale(0.98)', // Add press feedback instead
                      transition: 'transform 0.1s ease',
                    },
                    '&:hover': {
                      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    }
                  }}
                  onClick={() => handleUserClick(user)}
                >
                  <Avatar
                    src={user.profilePic ? `data:image/jpeg;base64,${user.profilePic}` : null}
                    sx={{ width: 50, height: 50 }}
                  />
                  <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                      <Typography variant="body1" fontWeight="medium" sx={{
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }} >
                        {user.username}
                      </Typography>
                      {user.idVerification?.status === 'approved' && (
                        <VerifiedRoundedIcon 
                          sx={{ 
                            fontSize: '16px', 
                            color: 'primary.main',
                            ml: 0.5,
                            verticalAlign: 'text-bottom'
                          }} 
                        />
                      )}
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {user.profileDescription || 'No description'}
                    </Typography>
                  </Box>
                </Box>
              ))}
              
              {loadingMore && (
                <Box display="flex" justifyContent="center" alignItems="center" py={2}>
                  <CircularProgress size={24} />
                </Box>
              )}
              
              {!hasMore && followData.length > 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  No more {followType} to load
                </Typography>
              )}
            </>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FollowDialog;