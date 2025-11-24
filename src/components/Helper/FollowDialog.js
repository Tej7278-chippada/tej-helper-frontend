import React, { useState, useEffect } from 'react';
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
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && userId) {
      fetchFollowData();
    }
  }, [open, userId, followType]);

  const fetchFollowData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = followType === 'followers' 
        ? await fetchUserFollowers(userId)
        : await fetchUserFollowing(userId);
      setFollowData(response.data);
    } catch (err) {
      console.error(`Error fetching ${followType}:`, err);
      setError(`Failed to load ${followType}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    if (onUserClick) {
      onUserClick(user);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          maxHeight: '70vh'
        }
      }}
    >
      <DialogTitle>
        {followType === 'followers' ? 'Followers' : 'Following'} 
        {/* {loading && <CircularProgress size={20} sx={{ ml: 1 }} />} */}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={100}>
              <CircularProgress />
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
            followData.map((user) => (
              <Box
                key={user._id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1,
                  mb: 1,
                  borderRadius: '8px',
                  cursor: 'pointer',
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
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {user.username}
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
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {user.profileDescription || 'No description'}
                  </Typography>
                </Box>
              </Box>
            ))
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