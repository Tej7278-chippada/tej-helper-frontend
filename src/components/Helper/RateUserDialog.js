import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Rating, Box, Typography, LinearProgress, CircularProgress, Avatar, IconButton } from '@mui/material';
import API from '../api/api';
import { userData } from '../../utils/userData';
import CloseIcon from '@mui/icons-material/Close';

const RateUserDialog = ({ userId, open, onClose, isMobile, isAuthenticated, setLoginMessage, setSnackbar }) => {
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  const [ratings, setRatings] = useState([]);
  const loggedUserData = userData();
  const [isRateUserOpen, setIsRateUserOpen] = useState(false);
  const [isRatingExisted, setIsRatingExisted] = useState(false);

  // Fetch user's rating when dialog opens
  useEffect(() => {
    if (open) {
      fetchUserRating();
      // fetchUserRatings();
    }
    // if (post) {
    //   setRatings([...post.user.ratings].reverse() || []); // Set existing comments when component loads
    // }
  }, [open]);

  const fetchUserRating = async () => {
    setIsFetching(true);
    try {
      const response = await API.get(`/api/auth/rating/${userId}`);
      setAverageRating(response.data.averageRating);
      setTotalReviews(response.data.totalReviews);
      setRatings(response.data.ratings);

      // Autofill if logged-in user already rated this user
      const existingRating = response.data.ratings.find(
        (r) => r.userId?._id === loggedUserData?.userId || ''
      );
      if (existingRating) {
        setRating(existingRating.rating);
        setComment(existingRating.comment);
        setIsRatingExisted(true);
      } else {
        setRating(0); // Reset to default if not found
        setComment('');
      }
    } catch (error) {
      console.error('Error fetching user rating:', error);
    } finally {
      setIsFetching(false);
    }
  };

  // const fetchUserRatings = async () => {
  //   setIsFetching(true);
  //   try {
  //     const response = await API.get(`/api/auth/ratings/${userId}`);
  //     setRatings(response.data.ratings.reverse()); // Show latest first
  //   } catch (error) {
  //     console.error('Error fetching user ratings:', error);
  //   } finally {
  //     setIsFetching(false);
  //   }
  // };

  const handleSubmit = async () => {
    if (!rating || rating < 1 || rating > 5 || userId === loggedUserData?.userId) return;

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
      const newRating = {  rating, comment };
      await API.post(`/api/auth/rate/${userId}`,  newRating , {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      // Refresh rating after submitting
      fetchUserRating();

      setLoading(false);
      setIsRateUserOpen(false);
      // onClose(); // Close dialog after submitting
      setSnackbar({ open: true, message: "Rating added successfully.", severity: "success" });
      // Add the new comment to the top of the list
      // setRatings((prevRatings) => [newRating, ...prevRatings]);
      // Refresh ratings after submitting
// fetchUserRatings();
    } catch (error) {
      console.error('Error submitting rating:', error);
      setLoading(false);
    }
  };

  return (
    <Dialog fullWidth open={open} onClose={onClose} fullScreen={isMobile} sx={{ margin: isMobile ? '10px' : '0px',
        '& .MuiPaper-root': { borderRadius: '14px',  } , //maxHeight: isMobile ? '300px' : 'auto'
        '& .MuiDialogTitle-root': { padding: '14px',  }, '& .MuiDialogContent-root': { padding: '4px',  }
        }}>
      <DialogTitle>
        {/* Rate this User */}
        {/* Show existing rating */}
        <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{display: isMobile? 'flex' : 'flex', justifyContent:'space-between', gap:'10px'}}>
              <Typography variant="h6">Profile Trust Level</Typography>
              <IconButton
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '1rem',
                  // backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  color: '#333'
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
        </Box>
        <Box sx={{display: 'flex',justifyContent:'center', gap: '20px', alignItems:'center', m: '10px 4px' }}>
          <Rating value={averageRating || 0} precision={0.5} readOnly />
          <Box sx={{display: isMobile? 'flex' : 'flex', gap:'8px'}}>
            {/* {isFetching ? (
            <CircularProgress size={20} />
              ) : ( */}
              <Typography variant="body2" color="textPrimary"> {averageRating || "N/A"} </Typography>
            {/* )} */}
            <Typography variant="body2" color="textSecondary">({totalReviews} reviews)</Typography>
          </Box>
        </Box>
        
      </DialogTitle>
      <DialogContent sx={{scrollbarWidth:'thin', scrollbarColor: '#aaa transparent', backgroundColor: "#f5f5f5", borderRadius:'8px', mx:1}}>
        

        
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
          {/* {post.user.ratings && post.user.ratings.length ? ( */}
          {isFetching ? (
            <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" height="200px" gap="1rem">
              <LinearProgress sx={{ width: 84, height: 4, borderRadius: 2, mt: 0 }}/>
              <Typography color='grey' variant='body2'>Loading Ratings...</Typography>
            </Box>
          ) : ratings.length ? (
            ratings.map((rating, index) => (
              <Box
                key={index}
                sx={{
                  margin: "0px",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  marginTop: "6px",
                  backgroundColor: "#fff"
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar
                    src={`data:image/jpeg;base64,${btoa(
                      String.fromCharCode(...new Uint8Array(rating.userId?.profilePic?.data || []))
                    )}` }
                    alt={rating.userId?.username[0]}
                    style={{ width: 32, height: 32, borderRadius: '50%' }}
                  />
                  <Typography fontWeight="bold">
                    {rating.userId?.username || "Anonymous"}
                  </Typography>
                  <Rating value={rating.rating || 0} precision={0.5} readOnly sx={{marginLeft:'auto'}}/>
                  {/* <Typography variant="caption" color="textSecondary" marginLeft="auto">
                    {new Date(rating.createdAt).toLocaleString()}
                  </Typography> */}
                </Box>
                {/* <Rating value={rating.rating || 0} precision={0.5} readOnly sx={{marginLeft:'2rem'}}/> */}
                <Typography sx={{ paddingTop: "0.5rem" }}>{rating.comment}</Typography>
                <Typography variant="caption" color="textSecondary" >
                  {new Date(rating.createdAt).toLocaleString()}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography color="grey" textAlign="center" sx={{ m: 2 }}>
              No Ratings available.
            </Typography>
          )}
          
        </Box>
      </DialogContent>
      <DialogActions sx={{gap: 1, m:'10px', display: 'flow'}}>
        {( userId !== loggedUserData?.userId ) && (isRateUserOpen ? (
        <Box width="100%">
            {/* User Rating Input */}
            <Box>
              <Box sx={{display:'flex', gap:'10px'}}>
                <Typography variant="body1" color="textSecondary">
                Rate this User:
                </Typography>
                <Rating
                value={rating} sx={{margin: '10px 10px'}}
                onChange={(e, newValue) => setRating(newValue)}
                />
                </Box>
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
                <Button onClick={() => setIsRateUserOpen((prev) => !prev)} disabled={loading} style={{ margin: "0rem", borderRadius: '8px', marginRight:'10px' }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading || rating === 0}
                    sx={{ margin: "0rem", borderRadius: '12px' }}
                >
                    { loading ? <CircularProgress size={20}/> : 'Submit' }
                </Button>
            </Box>
        </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end'}}>
            <Button
              variant="outlined" sx={{borderRadius: '12px',}}
              onClick={() => setIsRateUserOpen((prev) => !prev)}
            >
              {isRatingExisted ? 'Edit your Rating' : 'Rate the User'}
            </Button>
          </Box>
        ))}
        {/* {userId === loggedUserData?.userId && (
          <Button onClick={onClose} disabled={loading} style={{ margin: "0rem", borderRadius: '8px' }}>
            Close
          </Button>
        )} */}
      </DialogActions>
    </Dialog>
  );
};

export default RateUserDialog;
