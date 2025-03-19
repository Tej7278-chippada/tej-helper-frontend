// src/components/Helper/PostDetailsById.js
import React, { useEffect, useState } from 'react';
import { Typography, CardMedia, IconButton, Grid, Grid2, Tooltip, Box, useMediaQuery, Snackbar, Alert, Toolbar, CircularProgress, Button, styled } from '@mui/material';
import { ThumbUp, Comment } from '@mui/icons-material';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
// import { addToWishlist, checkIfLiked, checkProductInWishlist, fetchLikesCount, fetchProductById, fetchProductStockCount, likeProduct, removeFromWishlist } from '../../api/api';
// import CommentPopup from './CommentPopup';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useParams } from 'react-router-dom';
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
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import ChatDialog from '../Chat/ChatDialog';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication
  const [likeLoading, setLikeLoading] = useState(false); // For like progress
  const [wishLoading, setWishLoading] = useState(false); // For like progress
//   const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [successMessage, setSuccessMessage] = useState('');
  const [routeMapDialogOpen, setRouteMapDialogOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const userId = localStorage.getItem('userId');

  
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const likesCount = await fetchLikesCount(id);
        const authToken = localStorage.getItem('authToken');
        setIsAuthenticated(!!authToken); // Check if user is authenticated
  
        // Fetch product details
        const response = await fetchPostById(id);
  
        let likedByUser = false; // Default to false for unauthenticated users
        if (authToken) {
          // Only check if the product is liked by the user if the user is authenticated
          likedByUser = await checkIfLiked(id);
        }
  
        setPost({
          ...response.data,
          likedByUser, // Set the liked status
          likes: likesCount,
        });
        // setStockCountId(response.data.stockCount); // Set initial stock count

      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProductDetails();
  }, [id]);
  

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (isAuthenticated && post) {
        try {
          const isInWishlist = await checkPostInWishlist(post._id);
          setWishlist(new Set(isInWishlist ? [post._id] : []));
        } catch (error) {
          console.error('Error checking wishlist status:', error);
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
    if (!isAuthenticated || likeLoading) return; // Prevent unauthenticated actions
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
    } catch (error) {
      console.error("Error fetching posts after comment added:", error);
    } finally {
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
    if (!isAuthenticated) return; // Prevent unauthenticated actions
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
  
  


  if (loading || !post) {
    return (
      <Layout>
        {/* <SkeletonCards /> */}
        <Box sx={{margin: '8px' }}>
          <SkeletonProductDetail />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>

        <div style={{
          padding: '8px',
          // position: 'relative',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px', scrollbarWidth: 'thin'
        }}>
          <Box
            display="flex"
            flexDirection={isMobile ? "column" : "row"}
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
                    gap: isMobile ? '3px' : '4px', height: isMobile ? '250px' : '300px',
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
                </CardMedia></Box></Box>

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
                    >
                      <CustomTooltip  title="Share this post" arrow placement="right">
                        <ShareIcon />
                      </CustomTooltip >
                    </IconButton>
                    <IconButton
                      style={{ display: 'inline-block', float: 'right', fontWeight: '500', backgroundColor: 'rgba(255, 255, 255, 0.8)', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}
                      onClick={() => handleWishlistToggle(post._id)}
                      sx={{
                        color: wishlist.has(post._id) ? 'red' : 'gray',
                      }} disabled={wishLoading} // Disable button while loading
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
                    <Typography variant="body2" color="textSecondary">
                      {post.categories}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      Gender:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {post.gender}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      Price:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      ₹{post.price}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      Post Status: 
                    </Typography>
                    {/* <Typography variant="body2" color="textSecondary">
                      {post.gender}
                    </Typography> */}
                    <Typography variant="body2" color={post.postStatus === 'Active' ? 'green' : 'red'} style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                      {post.postStatus}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      People Count: 
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {post.peopleCount}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Typography variant="body2">Service required for {post.serviceDays} days</Typography>
                    {post.serviceDays && (
                      <Typography color='grey' variant="body2">
                        {/* {`Product will be delivered by ${calculateDeliveryDate(product.deliveryDays)}`} */}
                      </Typography>
                    )}
                  </Grid>
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
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0)', marginLeft: '10px', padding:'0px'
                        }}
                        onClick={openPostLocation}
                      >
                      <CustomTooltip  title="open Post location" arrow placement="top">
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
                {!(post.userId === userId) && 
                <Box >
                  <Button
                    variant="contained"
                    color="primary"
                    // onClick={() => openRouteMapDialog(post)}
                    // disabled={stockCountId === 0}
                    style={{ margin: "0rem", borderRadius: '8px' }}
                    startIcon={<ChatRoundedIcon />}
                    onClick={() => setChatDialogOpen(true)}
                  >
                    Chat
                  </Button>
                </Box>
                }
              </Toolbar>
              
              </Box>
          </Box>

          <Grid item xs={12} sx={{ paddingTop: '2rem' }}>
            <Grid2 sx={{
              bottom: '6px',
              right: '1rem', position: 'relative', display: 'inline-block', float: 'right',
            }}>
              <IconButton
                onClick={handleLike}
                disabled={likeLoading} // Disable button while loading, sx={{ color: product.likedByUser ? 'blue' : 'gray' }} 
              >
                {likeLoading ? (
                  <CircularProgress size={24} color="inherit" /> // Show spinner while loading
                ) : post.likedByUser ? (
                  <ThumbUp />
                ) : (
                  <ThumbUpOffAltIcon />
                )}
                {post.likes}
              </IconButton>
              <IconButton 
                onClick={() => openComments(post)}
              >
                <Comment /> {post.comments?.length || 0}
              </IconButton>
            </Grid2>
            <Typography variant="h6" style={{ paddingLeft: '6px', fontWeight: 500 }}>
              Post Description:
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{
              marginTop: '0.5rem',
              lineHeight: '1.5',
              textAlign: 'justify', whiteSpace: "pre-wrap", // Retain line breaks and tabs
              wordWrap: "break-word", // Handle long words gracefully
              backgroundColor: "#f5f5f5",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}>
              {post.description}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={4} mt={1} ml={1}>
            <Typography variant="body1" style={{ fontWeight: 500 }}>
              User Details:
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {post.userId}
            </Typography>
            <Grid item xs={6} sm={4}>
              <Typography variant="body1" style={{ fontWeight: 500 }}>
                User Code:
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {post.userCode}
              </Typography>
            </Grid>
          </Grid>
          

        </div>
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
        />
        <RouteMapDialog
          open={routeMapDialogOpen}
          onClose={() => setRouteMapDialogOpen(false)}
          post={post} // Pass the current product
          // onCommentAdded={onCommentAdded}  // Passing the comment added handler
        />
        <ChatDialog open={chatDialogOpen} onClose={() => setChatDialogOpen(false)} post={post} user={user} />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
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
      </Box>
    </Layout>
  );
}

export default PostDetailsById;
