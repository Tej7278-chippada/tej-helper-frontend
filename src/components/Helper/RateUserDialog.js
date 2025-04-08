import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Rating, Box, CircularProgress, Typography } from '@mui/material';
import API from '../api/api';
// import API from '../api';

const RateUserDialog = ({ userId, open, onClose, post, isMobile, isAuthenticated, setLoginMessage, setSnackbar }) => {
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  const [ratings, setRatings] = useState([]);

  // Fetch user's rating when dialog opens
  useEffect(() => {
    if (open) {
      fetchUserRating();
    }
    if (post) {
      setRatings([...post.user.ratings].reverse() || []); // Set existing comments when component loads
    }
  }, [open, post]);

  const fetchUserRating = async () => {
    setIsFetching(true);
    try {
      const response = await API.get(`/api/auth/rating/${userId}`);
      setAverageRating(response.data.averageRating);
      setTotalReviews(response.data.totalReviews);
    } catch (error) {
      console.error('Error fetching user rating:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async () => {
    if (!rating || rating < 1 || rating > 5) return;

    if (!isAuthenticated) {
      setLoginMessage({
        open: true,
        message: 'Please log in first. Click here to login.',
        severity: 'warning',
      });
      return;
    }

    setLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      await API.post(`/api/auth/rate/${userId}`, { rating, comment }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      // Refresh rating after submitting
      fetchUserRating();

      setLoading(false);
      onClose(); // Close dialog after submitting
      setSnackbar({ open: true, message: "Rating added successfully.", severity: "success" });
    } catch (error) {
      console.error('Error submitting rating:', error);
      setLoading(false);
    }
  };

  return (
    <Dialog fullWidth open={open} onClose={onClose} fullScreen={isMobile} sx={{ margin: isMobile ? '10px' : '0px',
        '& .MuiPaper-root': { borderRadius: '14px',  } , //maxHeight: isMobile ? '300px' : 'auto'
        '& .MuiDialogTitle-root': { padding: '14px',  }, '& .MuiDialogContent-root': { padding: '14px',  }
        }}>
      <DialogTitle>Rate this User
        {/* Show existing rating */}
        <Box display="flex" alignItems="center" gap={1}>
          {isFetching ? (
            <CircularProgress size={20} />
          ) : (
            <>
              <Typography variant="body1">Profile Trust Level:</Typography>
              <Rating value={averageRating || 0} precision={0.5} readOnly />
              <Typography variant="body2">({totalReviews} reviews)</Typography>
            </>
          )}
        </Box>
        
      </DialogTitle>
      <DialogContent sx={{scrollbarWidth:'thin', scrollbarColor: '#aaa transparent', backgroundColor: "#f5f5f5",}}>
        

        
        <Box
          bgcolor="#f5f5f5"
          sx={{
            // height: isMobile ? "500px" : "300px",
            overflowY: "auto",
            // margin: "1rem 0",
            borderRadius: "8px",
            // Custom scrollbar styles
            scrollbarWidth: "thin", // Firefox
            scrollbarColor: "#aaa transparent", // Firefox (thumb & track)
            "&::-webkit-scrollbar": {
              width: "8px", // Thin scrollbar
              height: "8px", // If horizontal scroll exists
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent", // Track color
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#aaa", // Thumb color
              borderRadius: "4px",
              background: "#aaa", // Scrollbar thumb color
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#888", // Darker on hover
              background: "#888", // Darker on hover
            },
            "&::-webkit-scrollbar-button": {
              display: "none", // Remove scrollbar arrows
            },
          }}
        >
          {post.user.ratings && post.user.ratings.length ? (
            ratings.map((rating, index) => (
              <Typography
                key={index}
                component="div"
                style={{
                  margin: "6px",
                //   backgroundColor: "#f5f5f5",
                  padding: "1rem",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  marginTop: "6px",
                  lineHeight: "1.5",
                  textAlign: "justify",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                }}
              >
                {/* <strong>{rating.comment || userName || 'Anonymous'}</strong>  */}
                {/* Display username */}
                <Typography sx={{ paddingTop: "1rem" }}>
                  {rating.userId}
                </Typography>
                <Typography sx={{ display: "inline-block", float: "right" }}>
                  {/* <small>{new Date(comment.createdAt).toLocaleString()}</small> */}
                </Typography>
                <Rating value={rating.rating || 0} precision={0.5} readOnly />
                <Typography sx={{ paddingTop: "1rem" }}>
                  {rating.comment}
                </Typography>
              </Typography>
            ))
          ) : (
            <Typography color="grey" textAlign="center" sx={{ m: 2 }}>
              No Ratings available.
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{gap: 1, m:'10px'}}>
        <Box width="100%">
            {/* User Rating Input */}
            <Box>
                <Typography variant="body2" color="textSecondary">
                Your Rating:
                </Typography>
                <Rating
                value={rating}
                onChange={(e, newValue) => setRating(newValue)}
                />
                <TextField
                fullWidth
                multiline
                rows={2}
                label="Comment (optional)"
                variant="outlined"
                margin="dense"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ 
                    marginTop: '1rem',
                    '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    //   bgcolor: theme.palette.background.paper,
                    },
                    '& .MuiInputBase-input': {
                    padding: '0px 0px', scrollbarWidth: 'thin'
                    },
                }}
                />
            </Box>
            <Box mt={1} display="flex" justifyContent="flex-end">
                <Button onClick={onClose} disabled={loading} style={{ margin: "0rem", borderRadius: '8px', marginRight:'10px' }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    style={{ margin: "0rem", borderRadius: '8px' }}
                >
                    Submit
                </Button>
            </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default RateUserDialog;
