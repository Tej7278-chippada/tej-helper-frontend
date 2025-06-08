// src/components/Helper/PostDetailsById.js
import React, { useEffect, useState } from 'react';
import { Typography, CardMedia, IconButton, Grid, Grid2, Tooltip, Box, useMediaQuery, Snackbar, Alert, Toolbar, CircularProgress, Button, styled, Avatar } from '@mui/material';
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
import { addToWishlist, checkIfLiked, checkPostInWishlist, fetchLikesCount, fetchPostById, likePost, removeFromWishlist } from '../api/api';
import Layout from '../Layout';
import SkeletonProductDetail from '../SkeletonProductDetail';
import ImageZoomDialog from './ImageZoomDialog';
import CommentPopup from './CommentPopup';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import RouteMapDialog from './RouteMapDialog';
import ChatDialog from '../Chat/ChatDialog';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import RateUserDialog from './RateUserDialog';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

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


function PostDetailsById({ onClose, user }) {
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

  const handleOpenRateDialog = () => setRateDialogOpen(true);
  const handleCloseRateDialog = () => setRateDialogOpen(false);
  const tokenUsername = localStorage.getItem('tokenUsername');
  


  
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

  return (
    <Layout username={tokenUsername}>
      <Box>
        {loading || !post ?
          <Box sx={{margin: '8px' }}>
            <SkeletonProductDetail/>
          </Box> : 
          <>
          <Box sx={{
            padding: '8px',
            // position: 'relative',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px', scrollbarWidth: 'thin'
          }}>
            <Box
              display="flex"
              flexDirection={isMobile1 ? "column" : "row"}
              gap={2} sx={{ bgcolor: '#f5f5f5', borderRadius: '10px', padding: '6px', paddingBottom: '10px', paddingTop: '10px' }}
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
                        overflowX: 'auto',
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
                  overflowY: 'auto',
                  bgcolor: 'white', // Card background color (customizable)
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
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
                          style={{ display: 'inline-block', float: 'right', fontWeight: '500', backgroundColor: 'rgba(255, 255, 255, 0.8)', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}
                          onClick={() => handleWishlistToggle(post._id)}
                          sx={{
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
                          color: '#333'
                        }}>
                          {post.title}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Typography variant="body1" style={{ fontWeight: 500 }}>
                          Post Category:
                        </Typography>
                        <Typography variant="body2" color={post.categories !== 'Emergency' ? 'textSecondary' : 'rgba(194, 28, 28, 0.89)'} style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                          {post.categories}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Typography variant="body1" style={{ fontWeight: 500 }}>
                          Post Status:
                        </Typography>
                        {/* <Typography variant="body2" color="textSecondary">
                        {post.gender}
                      </Typography> */}
                        <Typography variant="body2" color={post.postStatus === 'Active' ? 'green' : 'rgba(194, 28, 28, 0.89)'} style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                          {post.postStatus}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Typography variant="body1" style={{ fontWeight: 500 }}>
                          Price:
                        </Typography>
                        <Typography variant="body2" color="textSecondary" >
                          ₹{post.price}
                        </Typography>
                      </Grid>
                      {/* <Grid item xs={6} sm={4}>
                      <Typography variant="body1" style={{ fontWeight: 500 }}>
                        Post Status: 
                      </Typography>
                      <Typography variant="body2" color={post.postStatus === 'Active' ? 'green' : 'rgba(194, 28, 28, 0.89)'} style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                        {post.postStatus}
                      </Typography>
                    </Grid> */}
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
                          color="primary"
                          // onClick={() => openRouteMapDialog(post)}
                          // disabled={stockCountId === 0}
                          style={{ margin: "0rem", borderRadius: '8px' }}
                          startIcon={<ForumRoundedIcon />}
                          onClick={() => setChatDialogOpen(true)}
                        >
                          Chat
                        </Button>
                      </Box>
                    }
                  </Toolbar>

                </Box>
            </Box>

            <Grid item xs={12} sx={{ paddingTop: '1rem' }}>
              <Grid2 sx={{
                bottom: '8px',
                right: '0px', position: 'relative', display: 'inline-block', float: 'right',
              }}>
                <IconButton
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
                </IconButton>
                <IconButton sx={{gap:'2px'}}
                  onClick={() => openComments(post)}
                >
                  <ChatRoundedIcon /> {post.comments?.length || 0}
                </IconButton>
              </Grid2>
              <Typography variant="body1" style={{ paddingLeft: '6px', fontWeight: 500 }}>
                Post Description:
              </Typography>
              <Box sx={{bgcolor:'#f5f5f5', borderRadius:'8px'}}>
                <Typography variant="body1" color="textSecondary" style={{
                  marginTop: '0.5rem',
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
            <Box sx={{bgcolor:'#f5f5f5', borderRadius:'8px', my:1, padding:'1rem'}}>
            <Grid item xs={6} sm={4} >
              <Typography variant="body1" style={{ fontWeight: 500 }}>
                Post Owner Details:
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
                    <Button variant="outlined" size="small" sx={{borderRadius:'12px', padding: '4px 12px'}} onClick={handleOpenRateDialog}>
                      User Ratings
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
          />
          <CommentPopup
            open={commentPopupOpen}
            onClose={() => setCommentPopupOpen(false)}
            post={post} // Pass the current product
            onCommentAdded={onCommentAdded}  // Passing the comment added handler
            setLoginMessage={setLoginMessage} 
          />
          <RouteMapDialog
            open={routeMapDialogOpen}
            onClose={() => setRouteMapDialogOpen(false)}
            post={post} // Pass the current product
            // onCommentAdded={onCommentAdded}  // Passing the comment added handler
          />
          <ChatDialog open={chatDialogOpen} onClose={() => setChatDialogOpen(false)} post={post} user={user} 
            isAuthenticated={isAuthenticated} setLoginMessage={setLoginMessage}  setSnackbar={setSnackbar}
          />
          {/* Rating Dialog */}
          <RateUserDialog
            userId={post.user.id}
            open={isRateDialogOpen}
            onClose={handleCloseRateDialog}
            post={post}
            isMobile={isMobile}
            isAuthenticated={isAuthenticated} setLoginMessage={setLoginMessage}  setSnackbar={setSnackbar}
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
