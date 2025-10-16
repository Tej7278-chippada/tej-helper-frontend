// src/components/Helper/PostDetailsById.js
import React, { useEffect, useState } from 'react';
import { Typography, CardMedia, IconButton, Grid, Grid2, Tooltip, Box, useMediaQuery, Snackbar, Alert, Toolbar, CircularProgress, Button, styled, Avatar, Chip } from '@mui/material';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import ThumbUpRoundedIcon from '@mui/icons-material/ThumbUpRounded';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
// import { addToWishlist, checkIfLiked, checkProductInWishlist, fetchLikesCount, fetchProductById, fetchProductStockCount, likeProduct, removeFromWishlist } from '../../api/api';
// import CommentPopup from './CommentPopup';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Link, useParams } from 'react-router-dom';
// import Layout from '../Layout';
import { useTheme } from '@emotion/react';
// import SkeletonProductDetail from './SkeletonProductDetail';
// import ImageZoomDialog from './ImageZoomDialog';
import ShareIcon from '@mui/icons-material/Share'; // Import the share icon
import { addToWishlist, checkIfLiked, checkPostInWishlist, checkPostReported, fetchLikesCount, fetchPostById, likePost, removeFromWishlist } from '../api/api';
import Layout from '../Layout';
import SkeletonProductDetail from '../SkeletonProductDetail';
import ImageZoomDialog from './ImageZoomDialog';
import CommentPopup from './CommentPopup';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import RouteMapDialog from './RouteMapDialog';
import ChatDialog from '../Chat/ChatDialog';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import axios from 'axios';
import PaidIcon from '@mui/icons-material/Paid';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import EmergencyIcon from '@mui/icons-material/Emergency';
import { LocalParking, DirectionsCar, EventSeat, LocalLaundryService, Event, ChildCare, CleaningServices, Restaurant, School, Pets, LocalShipping, Handyman, HomeWork, Landscape, MoreHoriz, CurrencyRupee, Schedule } from '@mui/icons-material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ReportGmailerrorredRoundedIcon from '@mui/icons-material/ReportGmailerrorredRounded';
import ReportPost from '../Reports/ReportPost';
import UserProfileDetails from './UserProfileDetails';

const getServiceIcon = (serviceType) => {
  switch (serviceType) {
    case 'Paid' : return <PaidIcon/>;
    case 'UnPaid' : return <VolunteerActivismIcon/>;
    case 'Emergency' : return <EmergencyIcon/>;
    case 'ParkingSpace': return <LocalParking />;
    case 'VehicleRental': return <DirectionsCar />;
    case 'FurnitureRental': return <EventSeat />;
    case 'Laundry': return <LocalLaundryService />;
    case 'Events': return <Event />;
    case 'Playgrounds': return <ChildCare />;
    case 'Cleaning': return <CleaningServices />;
    case 'Cooking': return <Restaurant />;
    case 'Tutoring': return <School />;
    case 'PetCare': return <Pets />;
    case 'Delivery': return <LocalShipping />;
    case 'Maintenance': return <Handyman />;
    case 'HouseSaleLease': return <HomeWork />;
    case 'LandSaleLease': return <Landscape />;
    default: return <MoreHoriz />;
  }
};

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .MuiTooltip-tooltip`]: {
      backgroundColor: "#2e3b55", // Custom background color
      color: "#ffffff", // Custom text color
      fontSize: "14px",
      padding: "10px",
      borderRadius: "12px",
      boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
    },
    [`& .MuiTooltip-arrow`]: {
      color: "#2e3b55", // Arrow color matching the tooltip background
    },
}));

const getGlassmorphismStyle = (theme, darkMode) => ({
  background: darkMode 
    ? 'rgba(30, 30, 30, 0.85)' 
    : 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  // border: darkMode 
  //   ? '1px solid rgba(255, 255, 255, 0.1)' 
  //   : '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: darkMode 
    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
});


function PostDetailsById({ onClose, user, darkMode, toggleDarkMode, unreadCount, shouldAnimate }) {
  const [selectedImage, setSelectedImage] = useState(null);
  // const [products, setProducts] = useState([]);
  // const [selectedProduct, setSelectedProduct] = useState(null);
  const [commentPopupOpen, setCommentPopupOpen] = useState(false);
  const [wishlist, setWishlist] = useState(new Set());
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile1 = useMediaQuery(theme.breakpoints.down("md"));
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication
  const [likeLoading, setLikeLoading] = useState(false); // For like progress
  const [wishStatusLoading, setWishStatusLoading] = useState(false);
  const [wishLoading, setWishLoading] = useState(false); // For like progress
//   const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [successMessage, setSuccessMessage] = useState('');
  const [routeMapDialogOpen, setRouteMapDialogOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const userId = localStorage.getItem('userId');
  const [loginMessage, setLoginMessage] = useState({ open: false, message: "", severity: "info" });
  const [isRateDialogOpen, setRateDialogOpen] = useState(false);

  const tokenUsername = localStorage.getItem('tokenUsername');
  const authToken = localStorage.getItem('authToken');
  const [chatData, setChatData] = useState({});
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [checkingReport, setCheckingReport] = useState(false);

  
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPostDetails = async () => {
      setLoading(true);
      try {
        const likesCount = await fetchLikesCount(id);
        const authToken = localStorage.getItem('authToken');
        setIsAuthenticated(!!authToken); // Check if user is authenticated
  
        // Fetch post details
        const response = await fetchPostById(id);
  
        let likedByUser = false; // Default to false for unauthenticated users
        if (authToken) {
          // Only check if the post is liked by the user if the user is authenticated
          likedByUser = await checkIfLiked(id);
        }
  
        setPost({
          ...response.data,
          likedByUser, // Set the liked status
          likes: likesCount,
        });
        // setStockCountId(response.data.stockCount); // Set initial stock count

      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.error('Post Unavailable.', error);
          setSnackbar({ open: true, message: "Post Unavailable.", severity: "warning" });
        } else if (error.response && error.response.status === 401) {
          console.error('Error fetching post details:', error);
        } else {
          console.error('Error fetching post details:', error);
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchPostDetails();
  }, [id]);

  // Handle browser back button
  useEffect(() => {
    if (!routeMapDialogOpen && !chatDialogOpen && !commentPopupOpen && !selectedImage) return;

    const handleBackButton = (e) => {
      e.preventDefault();
      setRouteMapDialogOpen(false);
      setChatDialogOpen(false);
      setCommentPopupOpen(false);
      setSelectedImage(null);
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
  }, [routeMapDialogOpen, setRouteMapDialogOpen, chatDialogOpen, setChatDialogOpen, commentPopupOpen, setCommentPopupOpen, selectedImage, setSelectedImage]);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (isAuthenticated && post) {
        setWishStatusLoading(true);
        try {
          const isInWishlist = await checkPostInWishlist(post._id);
          setWishlist(new Set(isInWishlist ? [post._id] : []));
          setWishStatusLoading(false);
        } catch (error) {
          console.error('Error checking wishlist status:', error);
        } finally {
          setWishStatusLoading(false);
        }
      }
    };
  
    checkWishlistStatus();
  }, [post, isAuthenticated]);

//   useEffect(() => {
//     // Periodically fetch stock count
//     const interval = setInterval(async () => {
//       try {
//         const stockResponse = await fetchProductStockCount(id);
//         setStockCountId(stockResponse.data.stockCount);
//       } catch (err) {
//         console.error("Error fetching product stock count:", err);
//       }
//     }, 5000); // Fetch every 5 seconds

//     return () => clearInterval(interval);
//   }, [id]);

//   const calculateDeliveryDate = (days) => {
//     const deliveryDate = new Date();
//     deliveryDate.setDate(deliveryDate.getDate() + days);
//     const options = { weekday: "long", month: "long", day: "numeric" };
//     return deliveryDate.toLocaleDateString(undefined, options);
//   };
  
  const handleLike = async () => {
    if (likeLoading) return; // Prevent unauthenticated actions
    if (!isAuthenticated) { // Prevent unauthenticated actions
      setLoginMessage({
        open: true,
        message: 'Please log in first. Click here to login.',
        severity: 'warning',
      });
      return;
    } 
    setLikeLoading(true); // Start the progress indicator
    try {
      const newLikedByUser = !post.likedByUser;
      setPost((prevProduct) => ({
        ...prevProduct,
        likedByUser: newLikedByUser,
        likes: newLikedByUser ? prevProduct.likes + 1 : prevProduct.likes - 1,
      }));
      await likePost(id);
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Error toggling like.');
    } finally {
      setLikeLoading(false); // End the progress indicator
    }
  };
  const openComments = (post) => {
    // setSelectedProduct(product);
    setCommentPopupOpen(true);
    // setSelectedProduct(product); // Pass the product to ensure it gets updated in the popup
  };

  const onCommentAdded = async () => {
    try {
      // const updatedPosts = await fetchPosts(); // This fetches all products after a comment is added
      // setPost(updatedPosts.data); // Update the product list in the state
      // setCommentPopupOpen(false); // Close the CommentPopup
      
      // Fetch the updated likes count after a comment is added
      const updatedLikesCount = await fetchLikesCount(id);
      
      // Update the post state with the new likes count
      // setPost((prevPost) => ({
      //   ...prevPost,
      //   likes: updatedLikesCount,
      // }));

      // Optionally, you can also fetch the updated post details if needed
      const updatedPost = await fetchPostById(id);
      setPost((prevPost) => ({
        ...prevPost,
        comments: updatedPost.data.comments,
        likes: updatedLikesCount,
      }));
    } catch (error) {
      console.error("Error fetching likes count or post details after comment added.", error);
    // } finally {
      // setCommentPopupOpen(false); // Close the comment popup
    }
  };

  const openRouteMapDialog = (post) => {
    // setSelectedProduct(product);
    setRouteMapDialogOpen(true);
    // setSelectedProduct(product); // Pass the product to ensure it gets updated in the popup
  };

  // Function to open the zoomed image modal
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  // Function to close the zoomed image modal
  const handleCloseImageModal = () => {
    setSelectedImage(null);
  };

  const handleWishlistToggle = async (postId) => {
    // if (!isAuthenticated) return;
    if (!isAuthenticated) { // Prevent unauthenticated actions
      setLoginMessage({
        open: true,
        message: 'Please log in first. Click here to login.',
        severity: 'warning',
      });
      return;
    } 
    setWishLoading(true); // Start the progress indicator
    try {
      if (wishlist.has(postId)) {
        setWishlist((prevWishlist) => {
          const newWishlist = new Set(prevWishlist);
          newWishlist.delete(postId);
          return newWishlist;
        }); // Optimistically update the UI
        await removeFromWishlist(postId);
      } else {
        setWishlist((prevWishlist) => new Set([...prevWishlist, postId])); // Optimistically update the UI
        await addToWishlist(postId);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Failed to update wishlist status!');
    } finally {
      setWishLoading(false); // End the progress indicator
    }
  };
  

  const handleShare = async (postId, postTitle) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    const shareData = {
      title: postTitle,
      text: `Check out this amazing post: ${postTitle}`,
      url: shareUrl,
    };

    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error using Web Share API:', err);
      }
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      // Fallback: Copy to clipboard if supported
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert(`The link has been copied to your clipboard: ${shareUrl}`);
      } catch (err) {
        console.error('Error copying text to clipboard:', err);
        alert(`Unable to copy the link. Please manually share this URL: ${shareUrl}`);
      }
    } else {
      // Fallback for browsers without clipboard API
      const tempInput = document.createElement('textarea');
      tempInput.value = shareUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      try {
        document.execCommand('copy');
        alert(`The link has been copied to your clipboard: ${shareUrl}`);
      } catch (err) {
        console.error('Error using execCommand to copy:', err);
        alert(`Unable to copy the link. Please manually share this URL: ${shareUrl}`);
      }
      document.body.removeChild(tempInput);
    }
  };

//   const handleBuyNow = () => {
//     if (!isAuthenticated || likeLoading) return; // Prevent unauthenticated actions
//     if (stockCountId > 0) {
//       navigate(`/order/${id}`, { state: { product } });
//     } else {
//       setSnackbar({ open: true, message: "Product is out of stock.", severity: "warning" });
//     }
//   };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenRateDialog = () => {
    if (!isAuthenticated) { // Prevent unauthenticated actions
      setLoginMessage({
        open: true,
        message: 'Please log in first. Click here to login.',
        severity: 'warning',
      });
      return;
    } 
    setRateDialogOpen(true);
  };
  const handleCloseRateDialog = () => setRateDialogOpen(false);

  // const saveLocation = async () => {
  //   try {
  //     const authToken = localStorage.getItem('authToken');
  //     await API.put(`/api/auth/${id}/location`, {
  //       location: {
  //         latitude: currentLocation.lat,
  //         longitude: currentLocation.lng,
  //       },
  //     }, {
  //       headers: { Authorization: `Bearer ${authToken}` },
  //     });
  //     setSuccessMessage('Location saved successfully.');
  //   } catch (err) {
  //     setError('Failed to save location. Please try again later.');
  //   }
  // };


  // const calculateDistance = () => {
  //   if (!currentLocation || !post?.location) {
  //     setDistance("Location data missing");
  //     return;
  //   }
  
  //   const userCoords = { latitude: currentLocation.lat, longitude: currentLocation.lng };
  //   const postCoords = { latitude: post.location.latitude, longitude: post.location.longitude };
  
  //   const dist = getDistance(userCoords, postCoords) / 1000; // Convert meters to km
  //   setDistance(dist.toFixed(2)); // Display distance in km
  // };
  

  // const fetchRoute = async () => {
  //   if (!currentLocation || !post?.location) {
  //     setRoute(null);
  //     return;
  //   }
  
  //   try {
  //     const response = await fetch(
  //       `https://router.project-osrm.org/route/v1/driving/${currentLocation.lng},${currentLocation.lat};${post.location.longitude},${post.location.latitude}?overview=full&geometries=polyline`
  //     );
  //     const data = await response.json();
  
  //     if (data.routes.length > 0) {
  //       const decodedRoute = polyline.decode(data.routes[0].geometry);
  //       setRoute(decodedRoute.map(([lat, lng]) => [lat, lng]));
  //     }
  //   } catch (error) {
  //     console.error("Error fetching route:", error);
  //   }
  // };

  // const shareLocation = () => {
  //   const { latitude, longitude } = post.location;
  //   const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  
  //   // Try to open in an external maps application
  //   const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  //   const iosMapsUrl = `maps://maps.apple.com/?q=${latitude},${longitude}`;
  //   const androidMapsUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
  
  //   if (isMobile) {
  //     // Open Apple Maps on iOS, Google Maps on Android
  //     const mapLink = navigator.userAgent.includes("iPhone") ? iosMapsUrl : androidMapsUrl;
  //     window.open(mapLink, "_blank");
  //   } else {
  //     // Open Google Maps on desktop
  //     window.open(mapsUrl, "_blank");
  //   }
  
  //   // Fallback: Copy to clipboard if maps app is unavailable
  //   setTimeout(() => {
  //     navigator.clipboard.writeText(mapsUrl).then(() => {
  //       setSuccessMessage("Post location link copied to clipboard.");
  //     });
  //   }, 500); // Delay to avoid clipboard overwrite if maps app opens
  // };

  const openPostLocation = () => {
    const { latitude, longitude } = post.location;
    const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  
    // Try to open in external map apps
    const appleMapsUrl = `maps://maps.apple.com/?q=${latitude},${longitude}`;
    const googleMapsUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
    // const wazeUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
  
    if (isMobile) {
      // Check if navigator is available (for detecting platform)
      // const mapLink = navigator.userAgent.includes("iPhone") ? iosMapsUrl : androidMapsUrl;
      if (navigator.userAgent) {
        const isApple = /iPhone|iPad|Macintosh/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
    
        if (isApple) {
          window.open(appleMapsUrl, '_blank'); // Open in Apple Maps on iOS/macOS
        } else if (isAndroid) {
          window.open(googleMapsUrl, '_blank'); // Open in Google Maps on Android
        } else {
          // If it's a desktop/laptop or no maps app is found, copy the link
          navigator.clipboard.writeText(locationUrl).then(() => {
            setSuccessMessage('Post location link copied. Paste it in Google to search.');
          });
        }
      }
    } else {
      // Open Google Maps on desktop
      window.open(locationUrl, "_blank");
      // Fallback if no userAgent detection is possible
      navigator.clipboard.writeText(locationUrl).then(() => {
        setSuccessMessage('Post location link copied. Paste it in Google to search.');
      });
    }
  };

  const handleOpenChatDialog = async () => {
    if (post.postStatus === 'Suspended') {
      setSnackbar({ open: true, message: `This post has been suspended and is no longer accessible.`, severity: 'warning' });
      return;
    }
    setChatDialogOpen(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/chats/chat-details`,
        { postId: post._id },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      if (response.data.success) {
        setChatData({chatId: response.data.chatID, helperCodeVerified: response.data.helperCodeVerified})
      }
    } catch (error) {
      console.log('error data', error);
    }
  };


  // if (loading || !post) {
  //   return (
  //     <Layout>
  //       {/* <SkeletonCards /> */}
  //       <Box sx={{margin: '8px' }}>
  //         <SkeletonProductDetail />
  //       </Box>
  //     </Layout>
  //   );
  // }

  // Service Details Component
  const renderServiceDetails = (post, darkMode, theme) => {
    if (post.postType !== 'ServiceOffering') return null;

    const getGlassmorphismStyle = (theme, darkMode) => ({
      background: darkMode 
        ? 'rgba(30, 30, 30, 0.85)' 
        : 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px)',
      boxShadow: darkMode 
        ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
        : '0 8px 32px rgba(0, 0, 0, 0.1)',
    });

    // Render pricing information based on service type
    const renderPricingDetails = () => {
      if (!post.pricingDetails) return null;

      const getPricingCardStyle = (darkMode) => ({
        // background: darkMode 
        //   ? 'rgba(30, 30, 30, 0.85)' 
        //   : 'rgba(255, 255, 255, 0.15)',
        // backdropFilter: 'blur(20px)',
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: '12px',
        padding: '16px',
        // margin: '8px 0',
        minWidth: '250px',
        flex: '1 1 300px'
      });

      switch (post.serviceType) {
        case 'ParkingSpace':
          return (
            <Box sx={{ 
              p: 2, 
              borderRadius: '12px', 
              ...getGlassmorphismStyle(theme, darkMode), 
              mt: 1,
              // border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
            }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 1, height: '32px', width: '32px' }}>
                  <CurrencyRupee fontSize="small" />
                </Avatar>
                <Typography variant="h6" >
                  Parking Rates
                </Typography>
              </Box>
              <Box sx={{ display: 'flex',  gap: 2, overflowX: 'auto', pb: 1 }}>
                {post.pricingDetails.parking?.vehicleTypes?.map((vehicle, index) => (
                  <Box key={index} sx={getPricingCardStyle(darkMode)}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {vehicle.type}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={`Slots: ${vehicle.slotsAvailable}`}
                        color="success"
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {vehicle.hourlyRate > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Hourly:</Typography>
                          <Typography variant="body2" fontWeight="bold">₹{vehicle.hourlyRate}</Typography>
                        </Box>
                      )}
                      {vehicle.dailyRate > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Daily:</Typography>
                          <Typography variant="body2" fontWeight="bold">₹{vehicle.dailyRate}</Typography>
                        </Box>
                      )}
                      {vehicle.weeklyRate > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Weekly:</Typography>
                          <Typography variant="body2" fontWeight="bold">₹{vehicle.weeklyRate}</Typography>
                        </Box>
                      )}
                      {vehicle.monthlyRate > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Monthly:</Typography>
                          <Typography variant="body2" fontWeight="bold">₹{vehicle.monthlyRate}</Typography>
                        </Box>
                      )}
                      {/* {vehicle.slotsAvailable > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2">Slots:</Typography>
                          <Typography variant="body2" fontWeight="bold">{vehicle.slotsAvailable}</Typography>
                        </Box>
                      )} */}
                      {vehicle.description && (
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                          {vehicle.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          );

        case 'VehicleRental':
          return (
            <Box sx={{ 
              p: 2, 
              borderRadius: '12px', 
              ...getGlassmorphismStyle(theme, darkMode), 
              mt: 1,
              // border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
            }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 1, height: '32px', width: '32px' }}>
                  <CurrencyRupee fontSize="small" />
                </Avatar>
                <Typography variant="h6">
                  Rental Rates
                </Typography>
              </Box>
              <Box sx={{ display: 'flex',  gap: 2, overflowX: 'auto', pb: 1 }}>
                {post.pricingDetails.vehicleRental?.vehicleTypes?.map((vehicle, index) => (
                  <Box key={index} sx={getPricingCardStyle(darkMode)}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {vehicle.type}
                      </Typography>
                      {vehicle.quantity > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          {/* <Typography variant="body2">Available:</Typography> */}
                          {/* <Typography variant="body2" fontWeight="bold">{vehicle.quantity}</Typography> */}
                          <Chip 
                            size="small" 
                            label={`Available: ${vehicle.quantity}`}
                            color="success"
                            variant="outlined"
                          />
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {vehicle.hourlyRate > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Hourly:</Typography>
                          <Typography variant="body2" fontWeight="bold">₹{vehicle.hourlyRate}</Typography>
                        </Box>
                      )}
                      {vehicle.dailyRate > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Daily:</Typography>
                          <Typography variant="body2" fontWeight="bold">₹{vehicle.dailyRate}</Typography>
                        </Box>
                      )}
                      {vehicle.weeklyRate > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Weekly:</Typography>
                          <Typography variant="body2" fontWeight="bold">₹{vehicle.weeklyRate}</Typography>
                        </Box>
                      )}
                      {vehicle.monthlyRate > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Monthly:</Typography>
                          <Typography variant="body2" fontWeight="bold">₹{vehicle.monthlyRate}</Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        {vehicle.fuelIncluded && (
                          <Chip 
                            size="small" 
                            label="Fuel Included" 
                            color="success"
                            variant="outlined"
                          />
                        )}
                        {vehicle.insuranceIncluded && (
                          <Chip 
                            size="small" 
                            label="Insurance Included" 
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      {vehicle.description && (
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                          {vehicle.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          );

        default:
          if (post.pricingDetails.service?.serviceItems) {
            return (
              <Box sx={{ 
                p: 2, 
                borderRadius: '12px', 
                ...getGlassmorphismStyle(theme, darkMode), 
                mt: 1,
                // border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
              }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 1, height: '32px', width: '32px' }}>
                    <CurrencyRupee fontSize="small" />
                  </Avatar>
                  <Typography variant="h6" >
                    Service Pricing
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}> {/*  flexWrap: 'wrap', scrollbarWidth: 'none' */}
                  {post.pricingDetails.service.serviceItems.map((item, index) => (
                    <Box key={index} sx={getPricingCardStyle(darkMode)}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {item.name}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">Price:</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" color="primary" fontWeight="bold">
                              ₹{item.price}
                            </Typography>
                            <Chip 
                              label={item.pricingModel} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                        
                        {item.quantity > 1 && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Available Items:</Typography>
                            <Typography variant="body2" fontWeight="bold">{item.quantity}</Typography>
                          </Box>
                        )}
                        
                        {(item.minDuration || item.maxDuration) && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Duration:</Typography>
                            <Typography variant="body2">
                              {item.minDuration || 'Any'}-{item.maxDuration || 'Any'} 
                              {item.pricingModel === 'hourly' && ' hours'}
                              {item.pricingModel === 'daily' && ' days'}
                              {item.pricingModel === 'weekly' && ' weeks'}
                              {item.pricingModel === 'monthly' && ' months'}
                            </Typography>
                          </Box>
                        )}
                        
                        {item.description && (
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                            {item.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          }
        return null;
      };
    }

    // Render availability information
    const renderAvailability = () => {
      if (!post.availability) return null;

      return (
        <Box sx={{ 
          p: 2, 
          borderRadius: '12px', 
          ...getGlassmorphismStyle(theme, darkMode), 
          mt: 1,
          // border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
        }}>
          {/* <Typography variant="h6" sx={{ mb: 1 }}>Availability</Typography> */}
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'warning.main', mr: 1, height: '32px', width: '32px' }}>
              <Schedule fontSize="small" />
            </Avatar>
            <Typography variant="h6" >
              Availability
            </Typography>
          </Box>
          {post.availability.isAlwaysAvailable ? (
            <Chip label="Always Available 24/7" color="success" variant="outlined" />
          ) : (
            <>
              {post.availability.days && post.availability.days.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">Days available:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {post.availability.days.map(day => (
                      <Chip key={day} label={day.slice(0, 3)} size="small" 
                        sx={{backgroundColor : darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', px: 1, py: 1}}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              {post.availability.timeSlots && post.availability.timeSlots.length > 0 && (
                <Box>
                  <Typography variant="body2" fontWeight="bold">Time slots:</Typography>
                  {post.availability.timeSlots.map((slot, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      p: 0.5,
                      bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      borderRadius: 1,
                      mt: 0.5
                    }}>
                      <Typography variant="body2">{slot.day}:</Typography>
                      <Typography variant="body2">{slot.from} - {slot.to}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}
        </Box>
      );
    };

    // Render service features
    const renderServiceFeatures = () => {
      if (!post.serviceFeatures || post.serviceFeatures.length === 0) return null;

      return (
        <Box sx={{ 
          p: 2, 
          borderRadius: '12px', 
          ...getGlassmorphismStyle(theme, darkMode), 
          mt: 1,
          // border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
        }}>
          {/* <Typography variant="h6" sx={{ mb: 1 }}>Service Features</Typography> */}
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'info.main', mr: 1, height: '32px', width: '32px' }}>
              <AutoAwesomeRoundedIcon fontSize="small"/>
            </Avatar>
            <Typography variant="h6">
              Service Features
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {post.serviceFeatures.map((feature, index) => (
              <Chip 
                key={index} 
                label={feature} 
                size="small" 
                // color="primary"
                // variant="outlined"
                sx={{ backgroundColor : darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', px: 1, py: 2}}
              />
            ))}
          </Box>
        </Box>
      );
    };

    return (
      <Box sx={{ 
        // p: 2, 
        // borderRadius: '12px', 
        // ...getGlassmorphismStyle(theme, darkMode), 
        // mt: 2,
        // border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
      }}>
        {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {getServiceIcon(post.serviceType)}
          <Typography variant="h5">Service Details</Typography>
        </Box> */}

        {/* Service Type Badge */}
        {/* <Chip 
          label={post.serviceType} 
          color="primary" 
          sx={{ mb: 2 }} 
        /> */}

        {/* Pricing Details */}
        {renderPricingDetails()}
        {/* Availability */}
        {renderAvailability()}
        {/* Service Features */}
        {renderServiceFeatures()}

        {/* Capacity for services that have it */}
        {post.capacity && post.serviceType !== 'ParkingSpace' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              Available: <Box component="span" fontWeight="bold">{post.capacity}</Box> units
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  // function to handle report button click
  const handleReportClick = async () => {
    if (!isAuthenticated) {
      setLoginMessage({
        open: true,
        message: 'Please log in first. Click here to login.',
        severity: 'warning',
      });
      return;
    }

    try {
      setCheckingReport(true);
      const response = await checkPostReported(post._id);
      
      if (response) {
        setSnackbar({
          open: true,
          message: 'You have already reported this post.',
          severity: 'info'
        });
      } else {
        setReportDialogOpen(true);
      }
    } catch (error) {
      console.error('Error checking report status:', error);
      setSnackbar({
        open: true,
        message: 'Error checking report status. Please try again.',
        severity: 'error'
      });
    } finally {
      setCheckingReport(false);
    }
  };

  return (
    <Layout username={tokenUsername} darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate}>
      <Box>
        {loading || !post ?
          <Box sx={{m: isMobile ? '8px' : '12px', }}>
            <SkeletonProductDetail/>
          </Box> : 
          <>
          <Box sx={{
            m: isMobile ? '8px' : '12px',
            // position: 'relative',
            // backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px', scrollbarWidth: 'thin', mb: 4
          }}>
            <Box
              display="flex"
              flexDirection={isMobile1 ? "column" : "row"}
              gap={1} sx={{ borderRadius: '10px',  }} // bgcolor: '#f5f5f5',
            >
                <Box sx={{
                  flex: 2,
                  // height: '73vh', // Fixed height relative to viewport
                  overflowY: 'auto',
                  // bgcolor: 'transparent', // Card background color (customizable)
                  borderRadius: isMobile ? '10px' : '12px', // Card border radius (customizable)
                  // boxShadow: 3, // Shadow for a modern look
                  scrollbarWidth: 'thin'
                }}>
                  <Box
                    flex={isMobile ? "1" : "0 0 30%"}
                    style={{ paddingRight: isMobile ? "0" : "0rem" }}
                  >

                    {/* Media section */}
                    {/* Media section with click to zoom */}
                    <CardMedia>
                      <div style={{
                        display: 'flex',
                        justifyContent: post.media?.length === 1 ? "center" : "flex-start",
                        overflowX: post.media?.length === 1 ? "hidden" : "auto",
                        scrollbarWidth: 'none',
                        scrollbarColor: '#888 transparent',
                        // borderRadius: '8px',
                        gap: isMobile ? '3px' : '4px', height: isMobile1 ? '250px' : '330px',
                      }}>
                        {post.media && post.media.length > 0 ? (
                          post.media.map((base64Image, index) => (
                            <img
                              key={index}
                              src={`data:image/jpeg;base64,${base64Image}`}
                              alt={`Post ${index}`}
                              style={{
                                // height: '200px',
                                width: post.media.length === 1 ? "100%" : "auto",
                                objectFit: post.media.length === 1 ? "contain" : "cover",
                                borderRadius: '6px',
                                objectFit: 'cover',
                                flexShrink: 0,
                                cursor: 'pointer' // Make the image look clickable
                              }}
                              onClick={() => handleImageClick(base64Image)} // Open image in modal on click
                            />
                          ))
                        ) : (
                          // Show a placeholder image if no media is available
                          <img
                            // src="../assets/null-product-image.webp" // Replace with the path to your placeholder image
                            src='https://placehold.co/56x56?text=No+Imag'
                            alt="No media available"
                            style={{
                              // height: '200px',
                              width: "100%",
                              borderRadius: '8px',
                              objectFit: 'cover',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>
                    </CardMedia>
                  </Box>
                </Box>

                <Box sx={{
                  flex: 3,
                  // height: '73vh', // Fixed height relative to viewport
                  overflowY: 'auto', ...getGlassmorphismStyle(theme, darkMode),
                  // bgcolor: 'white', // Card background color (customizable)
                  borderRadius: 3, // Card border radius (customizable)
                  // boxShadow: 3, // Shadow for a modern look
                  scrollbarWidth: 'thin', padding: '1rem',
                  position: 'relative', // To enable absolute positioning of the button
                }}>
                  <Box flex={isMobile ? "1" : "0 0 70%"} mb={8}>

                    {/* Product Details */}
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <IconButton
                          style={{
                            // display: 'inline-block',
                            float: 'right',
                            fontWeight: '500',
                            // backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', marginLeft: '10px'
                          }}
                          onClick={() => handleShare(post._id, post.title)}
                          aria-label="Share Post"
                          title="Share Post"
                        >
                          <CustomTooltip title="Share this post" arrow placement="right">
                            <ShareIcon />
                          </CustomTooltip >
                        </IconButton>
                        <IconButton
                          onClick={() => handleWishlistToggle(post._id)}
                          sx={{ display: 'inline-block', float: 'right', fontWeight: '500', /* backgroundColor: 'rgba(255, 255, 255, 0.8)', */
                            // ...getGlassmorphismStyle(theme, darkMode),
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                            color: wishlist.has(post._id) ? 'red' : 'gray',
                          }} disabled={wishLoading || wishStatusLoading} // Disable button while loading
                        >
                          <Tooltip
                            title={wishlist.has(post._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            arrow
                            placement="right"
                          >
                            <span
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%',
                                position: 'relative',
                                transition: 'transform 0.3s ease',
                              }}
                            >{wishLoading ? (
                              <CircularProgress size={24} color="inherit" /> // Show spinner while loading
                            ) : wishlist.has(post._id) ? (
                              <FavoriteIcon />
                            ) : (
                              <FavoriteBorderIcon />
                            )}
                            </span>
                          </Tooltip>
                        </IconButton>
                        {post.isFullTime && 
                          <Typography sx={{ px: 2, py: 0.5, mx: 1, bgcolor: '#e0f7fa', color: '#006064', borderRadius: '999px', display: 'inline-block', float: 'right', fontWeight: '600', fontSize: '0.875rem' }}>
                            Full Time
                          </Typography>
                        }
                        <Typography variant="h5" style={{
                          fontWeight: 'bold',
                          marginBottom: '0.5rem',
                          // color: '#333'
                        }}>
                          {post.title}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Typography variant="body1" style={{ fontWeight: 500 }}>
                          {post.postType === 'HelpRequest' ? 'Post Category' : 'Service Category'}
                        </Typography> 
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {/* {post.postType === 'ServiceOffering' && getServiceIcon(post.serviceType)} */}
                          {post.postType === 'HelpRequest' ?
                            // <Typography variant="body2" color={post.categories !== 'Emergency' ? 'textSecondary' : 'rgba(194, 28, 28, 0.89)'} style={{ display: 'inline-block',  }}>
                            //   {post.categories}
                            // </Typography> 
                            <Chip 
                              label={post.categories} icon={getServiceIcon(post.categories)}
                              // color="primary"
                              variant="outlined" size="small" color={post.categories !== 'Emergency' ? 'default' : 'error'} sx={{px: 1}}
                            />
                            :
                            <Chip 
                              label={post.serviceType} icon={getServiceIcon(post.serviceType)}
                              // color="primary"
                              variant="outlined" size="small" sx={{px: 1}}
                            />
                          }
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Typography variant="body1" style={{ fontWeight: 500 }}>
                          {post.postType === 'HelpRequest' ? 'Post Status' : 'Service Status'}
                        </Typography>
                        {/* <Typography variant="body2" color="textSecondary">
                        {post.gender}
                      </Typography> */}
                        {/* <Typography variant="body2" color={post.postStatus === 'Active' ? 'green' : 'rgba(194, 28, 28, 0.89)'} style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                          {post.postStatus}
                        </Typography> */}
                        <Chip 
                          label={post.postStatus} 
                          color={post.postStatus === 'Active' ? 'success' : post.postStatus === 'InActive' ? 'warning': 'error'}
                          sx={{ height: '24px', }} 
                        />
                      </Grid>
                      {post.postType === 'HelpRequest' && (
                        <>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body1" style={{ fontWeight: 500 }}>
                            Price:
                          </Typography>
                          <Typography variant="body2" color="textSecondary" >
                            ₹{post.price}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body1" style={{ fontWeight: 500 }}>
                            Service Required on:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Date: {new Date(post.serviceDate).toLocaleDateString()} (for {post.serviceDays} day's)
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Time: {new Date(post.timeFrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(post.timeTo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body1" style={{ fontWeight: 500 }}>
                            People Required:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {post.peopleCount} ({post.gender})
                          </Typography>
                        </Grid>
                        </>
                      )}
                      {/* <Grid item xs={12} sm={6}>
                      <Typography variant="body1" style={{ fontWeight: 500 }}>
                        Service required on time: 
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(post.timeFrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(post.timeTo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Grid> */}
                      {/* <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                      Date : {new Date(post.serviceDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                      Time from - To : {new Date(post.timeFrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(post.timeTo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography> */}
                      {/* <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                      Posted on : {new Date(post.createdAt).toLocaleString() || 'Invalid date'}
                    </Typography> */}
                      {/* {!(post.createdAt === post.updatedAt) && ( */}
                      {/* <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                      Updated on : {new Date(post.updatedAt).toLocaleString() || 'Invalid date'}
                    </Typography> */}
                      {/* )} */}
                      {/* <Grid item xs={12} sm={12}>
                        <Typography variant="body2">Service required for {post.serviceDays} days</Typography>
                        {post.serviceDays && (
                          <Typography color='grey' variant="body2">
                          </Typography>
                        )}
                      </Grid> */}

                      {/* <Grid item xs={6} sm={4}>
                      <Typography variant="body1" style={{ fontWeight: 500 }}>
                        IP address: 
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {post.ip}
                      </Typography>
                    </Grid> */}
                      <Grid item xs={12} sm={12}>
                        <Typography variant="body2" color='grey' style={{ fontWeight: 500 }}>
                          See post location on other maps or search this link on Google
                          <IconButton
                            style={{
                              // display: 'inline-block',
                              // float: 'right',
                              fontWeight: '500',
                              backgroundColor: 'rgba(255, 255, 255, 0)',
                              boxShadow: '0 2px 5px rgba(0, 0, 0, 0)', marginLeft: '10px', padding: '0px'
                            }}
                            onClick={openPostLocation}
                          >
                            <CustomTooltip title="open Post location" arrow placement="top">
                              <LinkRoundedIcon />
                            </CustomTooltip >
                          </IconButton>
                        </Typography>
                        {/* <Typography variant="body2" color="textSecondary" onClick={shareLocation} sx={{cursor:'pointer'}}>
                        {post.location.latitude}, {post.location.longitude}
                      </Typography> */}
                      </Grid>
                    </Grid>
                  </Box>
                  <Toolbar sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    // bgcolor: 'white', borderRadius:'16px',
                    // boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '0rem',
                  }}>
                    {/* <Box style={{ display: 'flex', flexGrow: 1, }}> */}
                    {/* <Typography variant="body2" color={stockCountId > 0 ? "green" : "red"}>
                      {stockCountId > 0 ? `In Stock (${stockCountId} available)` : "Out of Stock"}
                    </Typography> */}
                    {/* </Box> */}
                    <Box >
                      <Button
                        variant="text"
                        color="secondary"
                        onClick={() => openRouteMapDialog(post)}
                        // disabled={stockCountId === 0}
                        style={{ margin: "0rem", borderRadius: '10px' }}
                        startIcon={<RouteRoundedIcon />}
                      >
                        Route Map
                      </Button>
                    </Box>
                    {!(post.user.id === userId) &&
                      <Box >
                        <Button
                          variant="contained"
                          // color="primary"
                          // onClick={() => openRouteMapDialog(post)}
                          // disabled={stockCountId === 0}
                          sx={{ margin: "0rem", borderRadius: '8px', background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', color: '#fff' }}
                          startIcon={<ForumRoundedIcon />}
                          onClick={handleOpenChatDialog}
                        >
                          Chat
                        </Button>
                      </Box>
                    }
                  </Toolbar>

                </Box>
            </Box>

            {/* Service Details section */}
            {post.postType === 'ServiceOffering' && renderServiceDetails(post, darkMode, theme)}

            <Grid item xs={12} sx={{ mt: '1rem' }}>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
              <Typography variant="body1" style={{ fontWeight: 500 }}>
                {post.postType === 'HelpRequest' ? 'Post Description' : 'Service Description'}
              </Typography>
              {/* <Grid2 sx={{
                bottom: '8px',
                right: '0px', position: 'relative', display: 'inline-block', float: 'right',
              }}> */}
              <Box >
                {/* <IconButton
                  onClick={handleLike} sx={{gap:'2px'}}
                  disabled={likeLoading} // Disable button while loading, sx={{ color: product.likedByUser ? 'blue' : 'gray' }} 
                >
                  {likeLoading ? (
                    <CircularProgress size={24} color="inherit" /> // Show spinner while loading
                  ) : post.likedByUser ? (
                    <ThumbUpRoundedIcon />
                  ) : (
                    <ThumbUpOutlinedIcon />
                  )}
                  {post.likes}
                </IconButton> */}
                <Chip 
                  label={post.likes} 
                  icon={likeLoading ? (
                    <CircularProgress size={20} color="inherit" /> // Show spinner while loading
                  ) : post.likedByUser ? (
                    <ThumbUpRoundedIcon fontSize="small"/>
                  ) : (
                    <ThumbUpOutlinedIcon fontSize="small" />
                  )}
                  // color="primary"
                  variant="outlined"
                  onClick={handleLike}
                  sx={{pl: 1, fontWeight: 500, fontSize: '1rem', 
                    background: darkMode 
                      ? 'rgba(30, 30, 30, 0.85)' 
                      : 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: darkMode 
                      ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                      : '0 8px 32px rgba(0, 0, 0, 0.1)', 
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    height: '28px', minWidth: 'fit-content',
                    // flexShrink: 0,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  disabled={likeLoading}
                />
                {/* <IconButton sx={{gap:'2px'}}
                  onClick={() => openComments(post)}
                >
                  <ChatRoundedIcon /> {post.comments?.length || 0}
                </IconButton> */}
                <Chip 
                  label={post.comments?.length || 0} icon={<ChatRoundedIcon fontSize="small"/>}
                  // color="primary"
                  variant="outlined" size="small" 
                  onClick={() => openComments(post)}
                  sx={{px: 1, ml: 0.5, fontWeight: 500, fontSize: '1rem', 
                    background: darkMode 
                      ? 'rgba(30, 30, 30, 0.85)' 
                      : 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: darkMode 
                      ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                      : '0 8px 32px rgba(0, 0, 0, 0.1)', 
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    height: '28px', minWidth: 'fit-content',
                    // flexShrink: 0,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& .MuiChip-icon': {
                      height: '36px'
                    },
                  }}
                />
                {/* Repost post button */}
                <Chip 
                  icon={checkingReport ? <CircularProgress size={18} /> : <ReportGmailerrorredRoundedIcon />}
                  variant="outlined" 
                  size="small" 
                  onClick={handleReportClick} disabled={checkingReport}
                  aria-label="Report Post"
                  title="Report Post" 
                  color="error"
                  sx={{px: 1, ml: 0.5, fontWeight: 500, fontSize: '1rem', 
                    background: darkMode 
                      ? 'rgba(30, 30, 30, 0.85)' 
                      : 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: darkMode 
                      ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                      : '0 8px 32px rgba(0, 0, 0, 0.1)', 
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    height: '28px', minWidth: 'fit-content',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& .MuiChip-icon': {
                      marginLeft: '4px',
                      height: '36px'
                    },
                    '& .MuiChip-label': {
                      px: '4px',
                    },
                  }}
                />
                {/* <IconButton
                  style={{
                    float: 'right',
                    fontWeight: '500',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                    marginLeft: '10px'
                  }}
                  onClick={handleReportClick} disabled={checkingReport}
                  aria-label="Report Post"
                  title="Report Post" 
                  color="error"
                >
                  <CustomTooltip title="Report this post" arrow placement="right">
                    {checkingReport ? <CircularProgress size={20} /> : <ReportGmailerrorredRoundedIcon />}
                  </CustomTooltip>
                </IconButton> */}
              </Box>
              {/* </Grid2> */}
              </Box>
              <Box sx={{borderRadius:'8px', ...getGlassmorphismStyle(theme, darkMode), mt: '4px'}}> {/* bgcolor: '#f5f5f5', */}
                <Typography variant="body1" color="textSecondary" style={{
                  // marginTop: '0.5rem',
                  lineHeight: '1.5',
                  // textAlign: 'justify',
                  whiteSpace: "pre-wrap", // Retain line breaks and tabs
                  wordWrap: "break-word", // Handle long words gracefully
                  // backgroundColor: "#f5f5f5",
                  padding: "1rem",
                  borderRadius: "8px",
                  // border: "1px solid #ddd",
                }}>
                  {post.description}
                </Typography>
                
              </Box>
            </Grid>
            <Box sx={{ borderRadius:'8px', my:1, padding:'1rem', ...getGlassmorphismStyle(theme, darkMode), }}> {/* bgcolor: '#f5f5f5', */}
            <Grid item xs={6} sm={4} >
              <Typography variant="body1" style={{ fontWeight: 500 }}>
                {post.postType === 'HelpRequest' ? 'Post Owner Details' : 'Service Owner Details'}
              </Typography>
              {/* <Typography variant="body2" color="textSecondary">
                {post.user.id}
              </Typography>
              <Grid item xs={6} sm={4}>
                <Typography variant="body1" style={{ fontWeight: 500 }}>
                  User Code:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {post.userCode}
                </Typography>
              </Grid> */}
                <Box display="flex" alignItems="center" spacing={1} justifyContent="flex-end" sx={{display: 'inline-block', float: 'right',}}>
                  {/* Trust Level */}
                  <Grid item>
                    <Box display="flex" >
                      <Typography variant="body2" color="textSecondary" mr={1}>
                        Trust Level
                      </Typography>
                      <StarRoundedIcon sx={{ color: 'gold', fontSize: 18, marginRight: 0.5 }} />
                      <Typography variant="body2" color="textSecondary">
                        {post.user.trustLevel || "N/A"}
                      </Typography>
                    </Box>
                  </Grid>
                  {/* Rate User Button */}
                  <Grid item justifyContent="flex-end" mt={1}>
                    <Button variant="outlined" size="small" sx={{borderRadius:'12px', padding: '4px 12px', textTransform: 'none'}} onClick={handleOpenRateDialog}>
                      View Profile
                    </Button>
                  </Grid>
                </Box>
              <Grid item xs={12} sm={4} my={1} display="flex" alignItems="center" >
                {/* {post.user?.profilePic && ( */}
                  <Avatar
                    src={`data:image/png;base64,${post.user.profilePic}`}
                    alt={post.user.username[0]}
                    sx={{ width: 40, height: 40, borderRadius: '50%', marginRight: 1 }}
                  />
                {/* )} */}
                <Typography variant="body1" style={{ fontWeight: 500 }}>
                  {post.user?.username}
                </Typography>
              
              </Grid>
              
            </Grid>
            <Grid item xs={12} sm={12} pt={1}>
              <Typography variant="body2" color="textSecondary" >
                Posted on : {new Date(post.createdAt).toLocaleString() || 'Invalid date'}
              </Typography>
              {post.updatedAt&& (
              <Typography variant="body2" color="textSecondary" style={{ fontWeight: 500 }}>
                Updated on : {new Date(post.updatedAt).toLocaleString() || 'Invalid date'}
              </Typography>
              )}
            </Grid>


            </Box>

            


            

          </Box>
        
          {/* Large Image Dialog with Zoom */}
          <ImageZoomDialog
            selectedImage={selectedImage}
            handleCloseImageModal={handleCloseImageModal}
            images={post.media} // Pass the full media array
            isMobile={isMobile}
          />
          <CommentPopup
            open={commentPopupOpen}
            onClose={() => setCommentPopupOpen(false)}
            post={post} // Pass the current product
            onCommentAdded={onCommentAdded}  // Passing the comment added handler
            setLoginMessage={setLoginMessage} darkMode={darkMode} getGlassmorphismStyle={getGlassmorphismStyle}
          />
          <RouteMapDialog
            open={routeMapDialogOpen} darkMode={darkMode}
            onClose={() => setRouteMapDialogOpen(false)}
            post={post} // Pass the current product
            // onCommentAdded={onCommentAdded}  // Passing the comment added handler
          />
          <ChatDialog open={chatDialogOpen} onClose={() => setChatDialogOpen(false)} post={post} user={user} 
            isAuthenticated={isAuthenticated} setLoginMessage={setLoginMessage}  setSnackbar={setSnackbar} darkMode={darkMode}
            chatData={chatData}
          />
          {/* Rating Dialog */}
          <UserProfileDetails
            userId={post.user.id}
            open={isRateDialogOpen}
            onClose={handleCloseRateDialog}
            post={post}
            isMobile={isMobile}
            isAuthenticated={isAuthenticated} setLoginMessage={setLoginMessage}  setSnackbar={setSnackbar} darkMode={darkMode}
          />
          <ReportPost
            open={reportDialogOpen}
            onClose={() => setReportDialogOpen(false)}
            onReportSuccess={() => {
              setSnackbar({
                open: true,
                message: 'Post reported successfully! Thank you for keeping our community safe.',
                severity: 'success'
              });
            }}
            post={post}
            darkMode={darkMode}
          />
          </>
        }
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius:'1rem' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={9000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ width: '100%', borderRadius:'1rem' }}>
          {successMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={loginMessage.open}
        autoHideDuration={9000}
        onClose={() => setLoginMessage({ ...loginMessage, open: false })}
        message={
          <span>
            Please log in first.{" "}
            <Link
              to="/login"
              style={{ color: "yellow", textDecoration: "underline", cursor: "pointer" }}
            >
              Click here to login
            </Link>
          </span>
        }
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
        <Alert
          severity="warning"
          variant="filled"
          sx={{
            backgroundColor: "#333",
            color: "#fff",
            borderRadius: "10px",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            // padding: "12px 20px",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          }}
          action={
            <Button
              component={Link}
              to="/login"
              size="small"
              sx={{
                color: "#ffd700",
                fontWeight: "bold",
                textTransform: "none",
                border: "1px solid rgba(255, 215, 0, 0.5)",
                borderRadius: "5px",
                // padding: "3px 8px",
                marginLeft: "10px",
                "&:hover": {
                  backgroundColor: "rgba(255, 215, 0, 0.2)",
                },
              }}
            >
              Login
            </Button>
          }
        >
          Please log in first.
        </Alert>
      </Snackbar>

      </Box>
    </Layout>
  );
}

export default PostDetailsById;
