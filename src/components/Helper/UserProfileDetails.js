import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, TextField, Rating, Box, Typography, LinearProgress, CircularProgress, Avatar, IconButton, Slide, Chip, Tooltip, Divider, Grid } from '@mui/material';
import { fetchProfilePosts, fetchUserProfileData, followUser, unfollowUser } from '../api/api';
// import { userData } from '../../utils/userData';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import Diversity2RoundedIcon from '@mui/icons-material/Diversity2Rounded';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import InterestsRoundedIcon from '@mui/icons-material/InterestsRounded';
import FollowDialog from './FollowDialog';

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

const UserProfileDetails = ({ userId, open, onClose, isMobile, isAuthenticated, setLoginMessage, setSnackbar, darkMode }) => {
  const navigate = useNavigate();
  // const [rating, setRating] = useState(3);
  // const [comment, setComment] = useState('');
  // const [loading, setLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  // const [ratings, setRatings] = useState([]);
  // const loggedUserData = userData();
  // const [isRateUserOpen, setIsRateUserOpen] = useState(false);
  // const [isRatingExisted, setIsRatingExisted] = useState(false);
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('services'); // 'reviews' or 'services'
  const [serviceHistory, setServiceHistory] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [profile, setProfile] = useState(null);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [followDialogOpen, setFollowDialogOpen] = useState(false);
  const [followType, setFollowType] = useState(''); // 'followers' or 'following'
  const [selectedUser, setSelectedUser] = useState(null);
  const [nestedProfileOpen, setNestedProfileOpen] = useState(false);

  // Fetch user's rating when dialog opens
  useEffect(() => {
    if (open) {
      fetchUserProfile();
      fetchUserPosts();
      // fetchUserRatings();
    }
    // if (post) {
    //   setRatings([...post.user.ratings].reverse() || []); // Set existing comments when component loads
    // }
  }, [open]);

  const fetchUserPosts = async () => {
    try {
      const response = await fetchProfilePosts(userId);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setPosts([]);
    }
  };

  const fetchUserProfile = async () => {
    setIsFetching(true);
    try {
      const response = await fetchUserProfileData(userId);
      setProfile(response.data);
      setIsFollowing(response.data.isFollowing || false);
      setFollowerCount(response.data.followerCount);
      setFollowingCount(response.data.followingCount);
      setAverageRating(response.data.averageRating);
      setTotalReviews(response.data.totalReviews);
      // setRatings(response.data.ratings);
      setServiceHistory(response.data.serviceHistory || []);

      // Autofill if logged-in user already rated this user
      // const existingRating = response.data.ratings.find(
      //   (r) => r.userId?._id === loggedUserData?.userId || ''
      // );
      // if (existingRating) {
      //   setRating(existingRating.rating);
      //   setComment(existingRating.comment);
      //   setIsRatingExisted(true);
      // } else {
      //   setRating(0); // Reset to default if not found
      //   setComment('');
      // }
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

//   const handleSubmit = async () => {
//     if (!rating || rating < 1 || rating > 5 || userId === loggedUserData?.userId) return;

//     if (!isAuthenticated) {
//       setLoginMessage({
//         open: true,
//         message: 'Please log in first. Click here to login.',
//         severity: 'warning',
//       });
//       return;
//     }

//     setLoading(true);
//     try {
//       const authToken = localStorage.getItem('authToken');
//       const newRating = {  rating, comment };
//       await API.post(`/api/auth/rate/${userId}`,  newRating , {
//         headers: { Authorization: `Bearer ${authToken}` }
//       });

//       // Refresh rating after submitting
//       fetchUserRating();

//       setLoading(false);
//       setIsRateUserOpen(false);
//       // onClose(); // Close dialog after submitting
//       setSnackbar({ open: true, message: "Rating added successfully.", severity: "success" });
//       // Add the new comment to the top of the list
//       // setRatings((prevRatings) => [newRating, ...prevRatings]);
//       // Refresh ratings after submitting
// // fetchUserRatings();
//     } catch (error) {
//       console.error('Error submitting rating:', error);
//       setLoading(false);
//     }
//   };

  // Add follow/unfollow functions
  const handleFollow = async () => {
    if (!isAuthenticated) { // Prevent unauthenticated actions
      setLoginMessage({
        open: true,
        message: 'Please log in first. Click here to login.',
        severity: 'warning',
      });
      return;
    } 
    try {
      setLoadingFollow(true);
      await followUser(userId);
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
      // setSnackbar({ open: true, message: 'Successfully followed user', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error following user', severity: 'error' });
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleUnfollow = async () => {
    if (!isAuthenticated) { // Prevent unauthenticated actions
      setLoginMessage({
        open: true,
        message: 'Please log in first. Click here to login.',
        severity: 'warning',
      });
      return;
    } 
    try {
      setLoadingFollow(true);
      await unfollowUser(userId);
      setIsFollowing(false);
      setFollowerCount(prev => prev - 1);
      // setSnackbar({ open: true, message: 'Successfully unfollowed user', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error unfollowing user', severity: 'error' });
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleOpenFollowers = () => {
    setFollowType('followers');
    setFollowDialogOpen(true);
  };

  const handleOpenFollowing = () => {
    setFollowType('following');
    setFollowDialogOpen(true);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setNestedProfileOpen(true);
    setFollowDialogOpen(false);
  };

  const handleCloseNestedProfile = () => {
    setNestedProfileOpen(false);
    setSelectedUser(null);
  };

  const getDocType = (type) => {
    switch (type) {
      case 'aadhaar': return 'Aadhaar';
      case 'driving_license': return 'Driving License';
      case 'passport': return 'Passport';
      case 'voter_id': return 'Voter ID';
      case 'pan_card': return 'Pan Card';
      default: return 'Goberment ID';
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
      {/* <Button
        onClick={() => setActiveTab('reviews')} size="small"
        sx={{
          fontWeight: activeTab === 'reviews' ? 'bold' : 'normal',
          color: activeTab === 'reviews' ? 'primary.main' : 'text.secondary',
          borderBottom: activeTab === 'reviews' ? '2px solid' : 'none',
          borderColor: 'primary.main',
          borderRadius: 0
        }}
      >
        Reviews ({totalReviews})
      </Button> */}
      <Button
        onClick={() => setActiveTab('services')} size="small"
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
      <Button
        onClick={() => setActiveTab('posts')} size="small"
        sx={{
          fontWeight: activeTab === 'posts' ? 'bold' : 'normal',
          color: activeTab === 'posts' ? 'primary.main' : 'text.secondary',
          borderBottom: activeTab === 'posts' ? '2px solid' : 'none',
          borderColor: 'primary.main',
          borderRadius: 0
        }}
      >
        Posts ({posts.length})
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
      <Box gap={1} sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
        <Avatar
          src={`data:image/jpeg;base64,${btoa(
            String.fromCharCode(...new Uint8Array(service.ownerId?.profilePic?.data || []))
          )}`}
          alt={service.ownerId?.username[0]}
          style={{ width: 32, height: 32, borderRadius: '50%' }}
        />
        <Box sx={{width: '100%'}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
            <Typography fontWeight="bold">
              {service.ownerId?.username || "Anonymous"}
            </Typography>
            {service.rating ? <Rating value={service.rating || 0} precision={0.5} readOnly /> :
            <Typography variant="caption" color="textSecondary">
              No Rating
            </Typography>}
          </Box>
          <Typography variant="caption" color="textSecondary">
            {service.postId?.postType === 'HelpRequest' 
              ? `Help Request (${service.postId?.categories})`
              : `Service Offering (${service.postId?.serviceType})`}
          </Typography>
          <Typography variant="body2" sx={{textTransform: 'capitalize'}}>
            Post: {service.postId?.title || "Service"}
          </Typography>
        </Box>
        
      </Box>
      {service.comment && <Typography variant="body2" > Comment: {service?.comment}</Typography>}
      <Typography variant="caption" color="textSecondary" > {/* sx={{ ml: 'auto' }} */}
        Service on: {new Date(service.verifiedAt).toLocaleString()}
      </Typography>
    </Box>
  );

  const openPostDetail = (postId) => {
    navigate(`/post/${postId}`);
  };

  // Post item component
  const renderPostItem = (post) => (
    <Box
      sx={{
        margin: "0px",
        padding: "12px",
        borderRadius: "8px",
        border: darkMode 
          ? '1px solid rgba(255, 255, 255, 0.1)' 
          : '1px solid rgba(0, 0, 0, 0.2)',
        marginTop: "6px",
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
        }
      }}
      key={post._id}
    >
      <Box display="flex" alignItems="flex-start" gap={2} onClick={() => openPostDetail(post._id)}>
        {/* Post First Image */}
        {post.media && post.media.length > 0 ? (
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '8px',
              overflow: 'hidden',
              flexShrink: 0,
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            }}
          >
            <img
              src={`data:image/jpeg;base64,${btoa(
                String.fromCharCode(...new Uint8Array(post.media[0]?.data || []))
              )}`}
              alt="Post"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '8px',
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography 
              variant="caption" 
              color="textSecondary"
              sx={{ textAlign: 'center', px: 1 }}
            >
              No Image
            </Typography>
          </Box>
        )}
        
        {/* Post Details */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Post Title */}
          <Typography 
            variant="subtitle2" 
            fontWeight="bold"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {post.title}
          </Typography>
          
          {/* Post Type and Status */}
          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
            <Typography variant="caption" color="primary">
              {post.postType === 'HelpRequest' ? 'Help Request' : 'Service Offering'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              •
            </Typography>
            <Typography 
              variant="caption" 
              sx={{
                color: post.postStatus === 'Active' ? 'success.main' : 
                      post.postStatus === 'Closed' ? 'error.main' : 'text.secondary',
                fontWeight: 'medium'
              }}
            >
              {post.postStatus}
            </Typography>
          </Box>
          
          {/* Updated/Posted Date */}
          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
            {post.updatedAt ? `Updated: ${new Date(post.updatedAt).toLocaleString()}` : 
                            `Posted: ${new Date(post.createdAt).toLocaleString()}`}
          </Typography>
          
          {/* Price if available */}
          {/* {post.price && (
            <Typography variant="caption" fontWeight="bold" color="primary" sx={{ mt: 0.5, display: 'block' }}>
              ₹{post.price}
            </Typography>
          )} */}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Dialog fullWidth open={open} onClose={onClose} fullScreen={isMobile} sx={{ 
      // margin: isMobile ? '10px' : '0px',
        '& .MuiPaper-root': { borderRadius: '14px', backdropFilter: 'blur(12px)', } , //maxHeight: isMobile ? '300px' : 'auto'
        '& .MuiDialogTitle-root': { padding: '14px',  }, '& .MuiDialogContent-root': { padding: '12px',  }
        }}
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
        >
      <DialogTitle>
        {/* Rate this User */}
        {/* Show existing rating */}
        <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{display: isMobile? 'flex' : 'flex', justifyContent:'space-between', gap:'10px'}}>
              <Typography variant="h6">Profile Details</Typography>
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
        
      </DialogTitle>
      
      <DialogContent
       sx={{scrollbarWidth:'none', scrollbarColor: '#aaa transparent', 
        // ...getGlassmorphismStyle(theme, darkMode), borderRadius: '12px'
      }}
       > {/*  backgroundColor: "#f5f5f5", */}
        <Box sx={{ p: 1}}>
          <Box sx={{ my: 1, padding: '1rem', borderRadius: 3, ...getGlassmorphismStyle(theme, darkMode) }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', flex: 1, mb: 2 }}>
              {profile?.profilePic ?
               <Avatar
                  src={`data:image/png;base64,${profile?.profilePic}`}
                  alt={profile?.username[0]}
                  sx={{ width: 60, height: 60, borderRadius: '50%', marginRight: 1 }}
                /> : 
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0, mr: 1
                  }}
                >
                  <Typography 
                    variant="caption" 
                    color="textSecondary"
                    sx={{ textAlign: 'center', px: 1 }}
                  >
                    No Image
                  </Typography>
                </Box>
              }
              <Box sx={{ width: '100%'}}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="h6" >{profile?.username}</Typography>
                    {(profile?.idVerificationStatus === 'approved') &&
                    <Tooltip title="Verified User" placement="top" arrow>
                      <VerifiedRoundedIcon sx={{ fontSize: '20px', color: 'Highlight' }} />  
                    </Tooltip>}
                  </Box>
                  
                </Box>
                {profile?.idVerificationStatus === 'approved' && (
                  <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* <VerifiedUserRoundedIcon sx={{ mr: 0.5, fontSize: '1rem' }} /> */}
                    User verified with government ID of {getDocType(profile?.verifiedDoc)}
                  </Typography>
                )}
                <Typography variant="body2">
                  Bio: {profile?.description}
                </Typography>
                

              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={6} >
                {/* {profile?.interests && profile.interests.length > 0 && ( */}
                <Box sx={{ my: 0,  }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <InterestsRoundedIcon fontSize="small" color="primary" />
                    <Typography variant="body1" >Interests:</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 4 }}>
                    {profile?.interests.map((interest, index) => (
                      <Chip
                        key={index}
                        label={interest}
                        variant="outlined" size="small" color="textSecondary"
                        sx={{ borderRadius: '12px', padding: '4px 6px' }}
                      />
                    ))}
                    {profile?.interests?.length === 0 && (
                      <Typography variant="body2" color="textSecondary">
                        No interests specified.
                      </Typography>
                    )}
                  </Box>
                </Box>
                {/* )} */}
              </Grid>
              <Grid item xs={12} sm={12} md={6} >
                <Box sx={{ my: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Diversity2RoundedIcon fontSize="small" color="warning" />
                      <Typography variant="body1">Network:</Typography>
                    </Box>
                    {userId !== localStorage.getItem('userId') && (
                      <Button
                        variant={isFollowing ? "outlined" : "contained"} size="small"
                        onClick={isFollowing ? handleUnfollow : handleFollow}
                        sx={{ borderRadius: '12px', textTransform: 'none' }}
                        disabled={!isAuthenticated || isFetching || loadingFollow} // Disable if not logged in
                      >
                        { loadingFollow ? <CircularProgress size={20} /> : isFollowing ? 'Unfollow' : 'Follow'}
                      </Button>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 3, ml: 4 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      onClick={handleOpenFollowers}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { 
                          color: 'primary.main',
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      <strong>{followerCount}</strong> Followers
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      onClick={handleOpenFollowing}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { 
                          color: 'primary.main',
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      <strong>{followingCount}</strong> Following
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              {/* Blood Donation */}
              <Grid item xs={12} sm={12} md={6} >
                <Box sx={{ mb: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <BloodtypeIcon color="error" fontSize="small" />
                    <Typography variant="body1" fontWeight={500}>
                      Blood Donation
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="textSecondary" >
                    {profile?.bloodDonar?.donate === true
                      ? profile?.bloodDonar?.bloodGroup === "Unknown"
                        ? "This user donates blood! (Blood group not specified)"
                        : `This user donates blood! (${profile?.bloodDonar?.bloodGroup})`
                      : profile?.bloodDonar?.donate === false
                      ? "Blood donation is not enabled."
                      : "This preference hasn’t been set yet."}
                  </Typography>
                </Box>
              </Grid>
              {/* Women Safety */}
              <Grid item xs={12} sm={12} md={6} >
                <Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <VolunteerActivismIcon color="success" fontSize="small" />
                    <Typography variant="body1" fontWeight={500}>
                      Women’s Safety Support
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="textSecondary" >
                    {profile?.withYou === true
                      ? "This user stands for women's safety!"
                      : profile?.withYou === false
                      ? "This feature is not enabled."
                      : "This preference hasn’t been set yet."}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ gap: '20px', alignItems:'center', my: '10px', p: 2,
            ...getGlassmorphismStyle(theme, darkMode), borderRadius: '12px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" gutterBottom>Trust Level:</Typography>
            </Box>
            <Box sx={{display: isMobile? 'flex' : 'flex', gap:'8px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <Rating value={averageRating || 0} precision={0.5} readOnly /> 
              <Box sx={{display: isMobile? 'flex' : 'flex', gap:'8px', justifyContent: 'center', alignItems: 'center'}}>
                <Typography variant="body2" color="textPrimary"> {averageRating || "N/A"} </Typography>
                <Typography variant="body2" color="textSecondary">({totalReviews} reviews)</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', mx: isMobile ? '10px' : '14px', mb: 1}}>
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
        </Box> */}
        {renderTabNavigation()}

        <Box
          // bgcolor="#f5f5f5"
          sx={{
            height: isMobile ? "500px" : "300px",
            overflowY: "auto",
            // margin: "1rem 0",
            // borderRadius: "8px",
            // // Custom scrollbar styles
            scrollbarWidth: "thin", // Firefox
            // scrollbarColor: "#aaa transparent", // Firefox (thumb & track)
            // "&::-webkit-scrollbar": {
            //   width: "8px", // Thin scrollbar
            //   height: "8px", // If horizontal scroll exists
            // },
            // "&::-webkit-scrollbar-track": {
            //   background: "transparent", // Track color
            // },
            // "&::-webkit-scrollbar-thumb": {
            //   backgroundColor: "#aaa", // Thumb color
            //   borderRadius: "4px",
            //   background: "#aaa", // Scrollbar thumb color
            // },
            // "&::-webkit-scrollbar-thumb:hover": {
            //   backgroundColor: "#888", // Darker on hover
            //   background: "#888", // Darker on hover
            // },
            // "&::-webkit-scrollbar-button": {
            //   display: "none", // Remove scrollbar arrows
            // },
          }}
        >
          {/* {post.user.ratings && post.user.ratings.length ? ( */}
          {isFetching ? (
            <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" height="200px" gap="1rem">
              <LinearProgress sx={{ width: 84, height: 4, borderRadius: 2, mt: 0 }}/>
              <Typography color='grey' variant='body2'>Loading Ratings...</Typography>
            </Box>
          // ) : activeTab === 'reviews' ? (ratings.length ? (
          //   ratings.map((rating, index) => (
          //     <Box
          //       key={index}
          //       sx={{
          //         margin: "0px",
          //         padding: "12px",
          //         borderRadius: "8px",
          //         // border: "1px solid #ddd",
          //         border: darkMode 
          //           ? '1px solid rgba(255, 255, 255, 0.1)' 
          //           : '1px solid rgba(0, 0, 0, 0.2)',
          //         marginTop: "6px",
          //         // backgroundColor: "#fff"
          //       }}
          //     >
          //       <Box display="flex" alignItems="center" gap={1}>
          //         <Avatar
          //           src={`data:image/jpeg;base64,${btoa(
          //             String.fromCharCode(...new Uint8Array(rating.userId?.profilePic?.data || []))
          //           )}` }
          //           alt={rating.userId?.username[0]}
          //           style={{ width: 32, height: 32, borderRadius: '50%' }}
          //         />
          //         <Typography fontWeight="bold">
          //           {rating.userId?.username || "Anonymous"}
          //         </Typography>
          //         <Rating value={rating.rating || 0} precision={0.5} readOnly sx={{marginLeft:'auto'}}/>
          //         {/* <Typography variant="caption" color="textSecondary" marginLeft="auto">
          //           {new Date(rating.createdAt).toLocaleString()}
          //         </Typography> */}
          //       </Box>
          //       {/* <Rating value={rating.rating || 0} precision={0.5} readOnly sx={{marginLeft:'2rem'}}/> */}
          //       <Typography sx={{ paddingTop: "0.5rem" }}>{rating.comment}</Typography>
          //       <Typography variant="caption" color="textSecondary" >
          //         {new Date(rating.createdAt).toLocaleString()}
          //       </Typography>
          //     </Box>
          //   ))
          // ) : (
          //   <Typography color="grey" textAlign="center" sx={{ m: 2 }}>
          //     No Ratings available.
          //   </Typography>)
          ) : activeTab === 'services' ? (
            serviceHistory.length ? (
              serviceHistory.map(renderServiceItem)
            ) : (
              <Typography color="grey" textAlign="center" sx={{ m: 2 }}>
                No Service History available.
              </Typography>
            )) : activeTab === 'posts' ? (
            posts.length ? (
              posts.map(renderPostItem)
            ) : (
              <Typography color="grey" textAlign="center" sx={{ m: 2 }}>
                No Posts available.
              </Typography>
            )
          ) : null}
        </Box>
      </DialogContent>
      {/* { isRateUserOpen && (
      <DialogActions sx={{gap: 1, m:'10px', display: 'flow', ...getGlassmorphismStyle(theme, darkMode), borderRadius: '12px' }}>
        <Box width="100%">
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
      )} */}
      {/* Followers/Following Dialog */}
      <FollowDialog
        open={followDialogOpen}
        onClose={() => setFollowDialogOpen(false)}
        userId={userId}
        followType={followType}
        onUserClick={handleUserClick}
        darkMode={darkMode}
        isMobile={isMobile}
      />

      {/* Nested User Profile Details */}
      <UserProfileDetails
        userId={selectedUser?._id}
        open={nestedProfileOpen}
        onClose={handleCloseNestedProfile}
        isMobile={isMobile}
        isAuthenticated={isAuthenticated}
        setLoginMessage={setLoginMessage}
        setSnackbar={setSnackbar}
        darkMode={darkMode}
      />
    </Dialog>
  );
};

export default UserProfileDetails;
