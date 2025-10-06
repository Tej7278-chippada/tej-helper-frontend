import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Rating, Box, Typography, LinearProgress, CircularProgress, Avatar, IconButton, Slide } from '@mui/material';
import API from '../api/api';
import { userData } from '../../utils/userData';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@emotion/react';


const getGlassmorphismStyle = (theme, darkMode) => ({
  background: darkMode 
    ? 'rgba(30, 30, 30, 0.85)' 
    : 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  border: darkMode 
    ? '1px solid rgba(255, 255, 255, 0.1)' 
    : '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: darkMode 
    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
});

const RateUserDialog = ({ userId, open, onClose, isMobile, isAuthenticated, setLoginMessage, setSnackbar, darkMode }) => {
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
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' or 'services'
  const [serviceHistory, setServiceHistory] = useState([]);

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
      setServiceHistory(response.data.serviceHistory || []);

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

  // Handle browser back button
  useEffect(() => {
    if (!open) return;

    const handleBackButton = (e) => {
      e.preventDefault();
      onClose(false);
    };

    // Add event listener when dialog opens
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handleBackButton);

    // Clean up event listener when dialog closes
    return () => {
      window.removeEventListener('popstate', handleBackButton);
      if (window.history.state === null) {
        window.history.back();
      }
    };
  }, [open, onClose]);

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

  // tab navigation component
  const renderTabNavigation = () => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      mb: 2,
      borderBottom: 1,
      borderColor: 'divider'
    }}>
      <Button
        onClick={() => setActiveTab('reviews')}
        sx={{
          fontWeight: activeTab === 'reviews' ? 'bold' : 'normal',
          color: activeTab === 'reviews' ? 'primary.main' : 'text.secondary',
          borderBottom: activeTab === 'reviews' ? '2px solid' : 'none',
          borderColor: 'primary.main',
          borderRadius: 0
        }}
      >
        Reviews ({totalReviews})
      </Button>
      <Button
        onClick={() => setActiveTab('services')}
        sx={{
          fontWeight: activeTab === 'services' ? 'bold' : 'normal',
          color: activeTab === 'services' ? 'primary.main' : 'text.secondary',
          borderBottom: activeTab === 'services' ? '2px solid' : 'none',
          borderColor: 'primary.main',
          borderRadius: 0
        }}
      >
        Service History ({serviceHistory.length})
      </Button>
    </Box>
  );

  // service history item component
  const renderServiceItem = (service) => (
    <Box
      sx={{
        margin: "0px",
        padding: "12px",
        borderRadius: "8px",
        border: darkMode 
          ? '1px solid rgba(255, 255, 255, 0.1)' 
          : '1px solid rgba(0, 0, 0, 0.2)',
        marginTop: "6px",
      }}
      key={service._id}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <Avatar
          src={`data:image/jpeg;base64,${btoa(
            String.fromCharCode(...new Uint8Array(service.ownerId?.profilePic?.data || []))
          )}`}
          alt={service.ownerId?.username[0]}
          style={{ width: 32, height: 32, borderRadius: '50%' }}
        />
        <Typography fontWeight="bold">
          {service.ownerId?.username || "Anonymous"}
        </Typography>
        <Typography variant="body2" sx={{ ml: 'auto' }}>
          {new Date(service.verifiedAt).toLocaleString()}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {service.postId?.title || "Service"}
      </Typography>
      <Typography variant="caption" color="textSecondary">
        {service.postId?.postType === 'HelpRequest' 
          ? `Help Request (${service.postId?.categories})`
          : `Service Offering (${service.postId?.serviceType})`}
      </Typography>
      {/* <Box display="flex" alignItems="center" mt={1}>
        <Typography variant="caption" color="primary">
          Helper Code: {service.helperCode}
        </Typography>
      </Box> */}
    </Box>
  );

  return (
    <Dialog fullWidth open={open} onClose={onClose} fullScreen={isMobile} sx={{ 
      // margin: isMobile ? '10px' : '0px',
        '& .MuiPaper-root': { borderRadius: '14px', backdropFilter: 'blur(12px)', } , //maxHeight: isMobile ? '300px' : 'auto'
        '& .MuiDialogTitle-root': { padding: '14px',  }, '& .MuiDialogContent-root': { padding: '4px',  }
        }}
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
        >
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
                  // color: '#333'
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
        </Box>
        <Box sx={{display: 'flex',justifyContent:'center', gap: '20px', alignItems:'center', my: '10px', p: 2,
          ...getGlassmorphismStyle(theme, darkMode), borderRadius: '12px' }}>
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mx: isMobile ? '10px' : '14px', mb: 1}}>
          <Typography variant="h6" >
            Users Reviews
          </Typography>
          {( userId !== loggedUserData?.userId ) && !isRateUserOpen && (
            <Button
              variant="contained" size="small" sx={{borderRadius: '12px', background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',}}
              onClick={() => setIsRateUserOpen((prev) => !prev)}
            >
              {isRatingExisted ? 'Edit your Rating' : 'Rate the User'}
            </Button>
          )}
        </Box>
      {renderTabNavigation()}
      <DialogContent sx={{scrollbarWidth:'thin', scrollbarColor: '#aaa transparent', mx:1, mb: 2, ...getGlassmorphismStyle(theme, darkMode), borderRadius: '12px'}}> {/*  backgroundColor: "#f5f5f5", */}
        <Box
          // bgcolor="#f5f5f5"
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
          ) : activeTab === 'reviews' ? (ratings.length ? (
            ratings.map((rating, index) => (
              <Box
                key={index}
                sx={{
                  margin: "0px",
                  padding: "12px",
                  borderRadius: "8px",
                  // border: "1px solid #ddd",
                  border: darkMode 
                    ? '1px solid rgba(255, 255, 255, 0.1)' 
                    : '1px solid rgba(0, 0, 0, 0.2)',
                  marginTop: "6px",
                  // backgroundColor: "#fff"
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
          )) : (
            serviceHistory.length ? (
              serviceHistory.map(renderServiceItem)
            ) : (
              <Typography color="grey" textAlign="center" sx={{ m: 2 }}>
                No Service History available.
              </Typography>
            )
          )}
        </Box>
      </DialogContent>
      { isRateUserOpen && (
      <DialogActions sx={{gap: 1, m:'10px', display: 'flow', ...getGlassmorphismStyle(theme, darkMode), borderRadius: '12px' }}>
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
                    sx={{ margin: "0rem", borderRadius: '12px', background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', }}
                >
                    { loading ? <CircularProgress size={20}/> : 'Submit' }
                </Button>
            </Box>
        </Box>
        
        {/* {userId === loggedUserData?.userId && (
          <Button onClick={onClose} disabled={loading} style={{ margin: "0rem", borderRadius: '8px' }}>
            Close
          </Button>
        )} */}
      </DialogActions>
      
      // ) : (
      //     <Box sx={{ display: 'flex', justifyContent: 'flex-end', m: '10px'}}>
      //       <Button
      //         variant="outlined" sx={{borderRadius: '12px',}}
      //         onClick={() => setIsRateUserOpen((prev) => !prev)}
      //       >
      //         {isRatingExisted ? 'Edit your Rating' : 'Rate the User'}
      //       </Button>
      //     </Box>
      //   )
      )}
    </Dialog>
  );
};

export default RateUserDialog;
