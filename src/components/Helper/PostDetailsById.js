// src/components/Helper/PostDetailsById.js
import React, { useEffect, useRef, useState } from 'react';
import { Typography, CardMedia, IconButton, Grid, Grid2, Tooltip, Box, useMediaQuery, Snackbar, Alert, Toolbar, CircularProgress } from '@mui/material';
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
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SatelliteAltRoundedIcon from '@mui/icons-material/SatelliteAltRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
// Fix for Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// import { Polyline } from 'react-leaflet';
// import polyline from '@mapbox/polyline';
// import { getDistance } from 'geolib'; // For calculating the distance
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';


// Set default icon manually
const customIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41], // Default size
  iconAnchor: [12, 41], // Position relative to the point
  popupAnchor: [1, -34],
});

const userLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Move map when user location is updated
const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
};

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


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
  // const { productId } = useParams();
//   const [stockCountId, setStockCountId] = useState(null); // Track only stock count
  const [mapMode, setMapMode] = useState('normal');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [distance, setDistance] = useState(null);
  // const [route, setRoute] = useState(null);
  const mapRef = useRef();
  const routingControlRef = useRef();
  const [routeCalculating, setRouteCalculating] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  
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

  // Expose removeViaPoint to the window object
  useEffect(() => {
    window.removeViaPoint = removeViaPoint;
    return () => {
      delete window.removeViaPoint;
    };
  }, []);

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
  

//   const handleShare = async (productId, productTitle) => {
//     const shareUrl = `${window.location.origin}/product/${productId}`;
//     const shareData = {
//       title: productTitle,
//       text: `Check out this amazing product: ${productTitle}`,
//       url: shareUrl,
//     };

//     // Check if Web Share API is supported
//     if (navigator.share) {
//       try {
//         await navigator.share(shareData);
//       } catch (err) {
//         console.error('Error using Web Share API:', err);
//       }
//     } else if (navigator.clipboard && navigator.clipboard.writeText) {
//       // Fallback: Copy to clipboard if supported
//       try {
//         await navigator.clipboard.writeText(shareUrl);
//         alert(`The link has been copied to your clipboard: ${shareUrl}`);
//       } catch (err) {
//         console.error('Error copying text to clipboard:', err);
//         alert(`Unable to copy the link. Please manually share this URL: ${shareUrl}`);
//       }
//     } else {
//       // Fallback for browsers without clipboard API
//       const tempInput = document.createElement('textarea');
//       tempInput.value = shareUrl;
//       document.body.appendChild(tempInput);
//       tempInput.select();
//       try {
//         document.execCommand('copy');
//         alert(`The link has been copied to your clipboard: ${shareUrl}`);
//       } catch (err) {
//         console.error('Error using execCommand to copy:', err);
//         alert(`Unable to copy the link. Please manually share this URL: ${shareUrl}`);
//       }
//       document.body.removeChild(tempInput);
//     }
//   };

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

  const locateUser = async () => {
    if (navigator.geolocation) {
      setLoadingLocation(true); // Show progress indicator
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });

          // Set location details manually using lat/lng
          setLocationDetails({
            latitude,
            longitude,
            accuracy: position.coords.accuracy, // GPS accuracy in meters
          });
          console.log("User's current location:", latitude, longitude);
          setLoadingLocation(false); // Hide progress indicator
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Failed to fetch your current location. Please enable location access.');
          setLoadingLocation(false); // Hide progress indicator
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // High accuracy mode
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
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

  if (error) return <Alert severity="error">{error}</Alert>;

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

  const showDistanceAndRoute = () => {
    if (currentLocation && post) {
      setRouteCalculating(true); // Show progress indicator
      const map = mapRef.current;
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
        const routingControl = L.Routing.control({
          waypoints: [
            L.latLng(currentLocation.lat, currentLocation.lng),
            L.latLng(post.location.latitude, post.location.longitude)
          ],
          routeWhileDragging: true,
          createMarker: function(i, waypoint, n) {
            if (i === 0) {
              return L.marker(waypoint.latLng, { icon: userLocationIcon });
            } else if (i === n - 1) {
              return L.marker(waypoint.latLng, { icon: customIcon });
            } else {
              const marker = L.marker(waypoint.latLng, { icon: customIcon });
              marker.bindPopup(`<b>You pinned here...</b><br><button onclick="window.removeViaPoint(${i})">Delete</button>`);
              return marker;
            }
          },
        }).addTo(map);
      

        routingControlRef.current = routingControl;

        routingControl.on('routesfound', function (e) {
          const routes = e.routes;
          const distance = routes[0].summary.totalDistance / 1000; // Convert to kilometers
          setDistance(distance.toFixed(2) + ' km');
          // setRoute(routes[0]);
          setRouteCalculating(false); // Hide progress indicator after route calculation
        });

      

        // Add close button to the routing container
        const routingContainer = document.querySelector('.leaflet-routing-container');
        if (routingContainer) {
          const closeButton = document.createElement('div');
          closeButton.innerHTML = '<CloseIcon />';
          closeButton.style.position = 'absolute';
          closeButton.style.top = '10px';
          closeButton.style.right = '10px';
          closeButton.style.cursor = 'pointer';
          closeButton.onclick = () => {
            map.removeControl(routingControl);
            routingControlRef.current = null;
          };
          routingContainer.appendChild(closeButton);
        }
    }
  };

  const removeViaPoint = (index) => {
    if (routingControlRef.current) {
      const waypoints = routingControlRef.current.getWaypoints();
      waypoints.splice(index, 1);
      routingControlRef.current.setWaypoints(waypoints);
    }
  };

  const shareLocation = () => {
    const url = `https://www.google.com/maps?q=${post.location.latitude},${post.location.longitude}`;
    navigator.clipboard.writeText(url).then(() => {
      setSuccessMessage('Location link copied to clipboard.');
    });
  };
  


  if (loading || !post) {
    return (
      <Layout>
        {/* <SkeletonCards /> */}
        <SkeletonProductDetail />
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
              borderRadius: 3, // Card border radius (customizable)
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
                    gap: '0.2rem', height: '300px',
                  }}>
                    {post.media && post.media.length > 0 ? (
                      post.media.map((base64Image, index) => (
                        <img
                          key={index}
                          src={`data:image/jpeg;base64,${base64Image}`}
                          alt={`Post ${index}`}
                          style={{
                            // height: '200px',
                            borderRadius: '8px',
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
                        src="../assets/null-product-image.webp" // Replace with the path to your placeholder image
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
              <Box flex={isMobile ? "1" : "0 0 70%"} mb={7}>

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
                    //   onClick={() => handleShare(product._id, product.title)}
                    >
                      <Tooltip title="Share this product" arrow placement="right">
                        <ShareIcon />
                      </Tooltip>
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
                    <Typography variant="h4" style={{
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
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      IP address: 
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {post.ip}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      Latitude Longitude: 
                      <IconButton
                        style={{
                          // display: 'inline-block',
                          // float: 'right',
                          fontWeight: '500',
                          backgroundColor: 'rgba(255, 255, 255, 0)',
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0)', marginLeft: '10px'
                        }}
                        onClick={shareLocation}
                      >
                      <Tooltip title="Share Post location" arrow placement="right">
                        <ShareIcon />
                      </Tooltip>
                    </IconButton>
                    </Typography>
                    <Typography variant="body2" color="textSecondary" onClick={shareLocation} sx={{cursor:'pointer'}}>
                      {post.location.latitude}, {post.location.longitude}
                    </Typography>
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
                <Box style={{ display: 'flex', flexGrow: 1, }}>
                  {/* <Typography variant="body2" color={stockCountId > 0 ? "green" : "red"}>
                    {stockCountId > 0 ? `In Stock (${stockCountId} available)` : "Out of Stock"}
                  </Typography> */}
                </Box>
                {/* <Box >
                  <Button
                    variant="contained"
                    color="primary"
                    // onClick={handleBuyNow}
                    // disabled={stockCountId === 0}
                    style={{ margin: "1rem" }}
                  >
                    Buy Now
                  </Button>
                </Box> */}
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
          <Grid>
            <Box sx={{paddingBottom:'6rem',marginBottom:'2rem', borderRadius:3, bgcolor:'rgba(0, 0, 0, 0.07)'}}>
              {locationDetails && (
                    <Box sx={{ margin: '1rem' }}>
                      <Typography variant="h6" gutterBottom>
                        Current Location Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body1" style={{ fontWeight: 500 }}>
                            IP Address:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {locationDetails.ip}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body1" style={{ fontWeight: 500 }}>
                            Street:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {locationDetails.street}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body1" style={{ fontWeight: 500 }}>
                            Area:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {locationDetails.area}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body1" style={{ fontWeight: 500 }}>
                            City:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {locationDetails.city}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body1" style={{ fontWeight: 500 }}>
                            State:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {locationDetails.state}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body1" style={{ fontWeight: 500 }}>
                            Nation:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {locationDetails.nation}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body1" style={{ fontWeight: 500 }}>
                            Pincode:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {locationDetails.pincode}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body1" style={{ fontWeight: 500 }}>
                            Latitude:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {locationDetails.latitude}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body1" style={{ fontWeight: 500 }}>
                            Longitude:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {locationDetails.longitude}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body1" style={{ fontWeight: 500 }}>
                            Accuracy (meters):
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {locationDetails.accuracy}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
              <Box sx={{ height: isMobile ? '400px' : '500px', marginTop: '1rem', padding: '1rem' }}>
                <MapContainer
                  center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [post.location.latitude, post.location.longitude]}
                  zoom={13}
                  style={{ height: '100%', width: '100%', borderRadius: '8px', }}
                  attributionControl={false}  // Disables the watermark
                  ref={mapRef}
                >
                  <ChangeView center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [post.location.latitude, post.location.longitude]} />
                  <TileLayer
                    url={mapMode === 'normal'
                      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'}
                  />
                  <Marker position={[post.location.latitude, post.location.longitude]} icon={customIcon}
                  >
                    <Popup>User Location</Popup>
                  </Marker>
                  {currentLocation && (
                    <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userLocationIcon}>
                      <Popup>Your Current Location</Popup>
                    </Marker>
                  )}
                  {/* {route && <Polyline positions={route} color="blue" />} */}

                </MapContainer>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', alignItems:'center' }}>
                  {/* <Button
                    variant="contained"
                    onClick={() => setMapMode(mapMode === 'normal' ? 'satellite' : 'normal')}
                    startIcon={mapMode === 'normal' ? <SatelliteAltRoundedIcon /> : <MapRoundedIcon />}
                  >
                    {mapMode === 'normal' ? 'Satellite View' : 'Normal View'}
                  </Button> */}
                  <IconButton
                    style={{
                      // display: 'inline-block',
                      // float: 'right',
                      fontWeight: '500', width:'60px', borderRadius:'10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.26)',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', marginLeft: '0px'
                    }}
                    onClick={() => setMapMode(mapMode === 'normal' ? 'satellite' : 'normal')}
                  >
                    <Tooltip title={mapMode === 'normal' ? 'Switch to Satellite View' : 'Switch to Normal View'} arrow placement="right">
                    {mapMode === 'normal' ? <MapRoundedIcon /> : <SatelliteAltRoundedIcon />}
                    </Tooltip>
                  </IconButton>
                  {/* {currentLocation && (
                    <Button
                      variant="contained"
                      onClick={saveLocation}
                    >
                      Save Location
                    </Button>
                  )} */}
                  <Box m={1}>
                  
                  {currentLocation && (
                    <IconButton
                      style={{
                        // display: 'inline-block',
                        // float: 'right',
                        fontWeight: '500', width:'60px', borderRadius:'10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.26)',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                      }}
                      onClick={showDistanceAndRoute}
                      disabled={loadingLocation && routeCalculating} // Disable button while loading
                    >
                      <Tooltip title={routeCalculating ? 'Caliculating route...' : 'Show the route and distance'} arrow placement="right">
                      {routeCalculating ? <CircularProgress size={24} /> : <RouteRoundedIcon />}
                      </Tooltip>
                    </IconButton>
                  )}
                  </Box>
                  {/* {currentLocation && (
                    <Button
                      variant="contained"
                      onClick={showDistanceAndRoute}
                      startIcon={<RouteRoundedIcon />}
                    >
                      Show Distance
                    </Button>
                  )} */}
                  <Box >
                  
                  <IconButton
                    style={{
                      // display: 'inline-block',
                      // float: 'right',
                      fontWeight: '500', width:'60px', borderRadius:'10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.26)',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', marginLeft: '0px'
                    }}
                    onClick={locateUser}
                    disabled={loadingLocation} // Disable button while loading
                  >
                    <Tooltip title={loadingLocation ? 'Fetching location...' : 'Locate me on Map'} arrow placement="right">
                    {loadingLocation ? <CircularProgress size={24} /> : <MyLocationRoundedIcon />}
                    </Tooltip>
                  </IconButton>
                  </Box>
                  {/* <Button
                    variant="contained"
                    onClick={locateUser}
                    startIcon={<LocationOnIcon />}
                  >
                    Locate Me
                  </Button> */}
                  
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '0rem', alignItems:'center', alignContent:'center' }}>
                {distance && (
                  <Typography variant="body1" color='grey' style={{ fontWeight: 500 }}>
                    Distance to post location: {distance}
                  </Typography>
                )}
                </Box>
                
                {/* <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: '1rem' }}>
                  <Button variant="contained" color="primary" onClick={calculateDistance}>
                    Show Distance
                  </Button>
                  <Button variant="contained" color="secondary" onClick={fetchRoute}>
                    Show Route
                  </Button>
                </Box>
                {distance !== null && (
                  <Typography variant="h6" sx={{ textAlign: 'center', marginTop: '1rem' }}>
                    Distance: {distance} km
                  </Typography>
                )} */}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Typography variant="body1" style={{ fontWeight: 500 }}>
              User Details:
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {/* {post.sellerTitle} */}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Typography variant="body1" style={{ fontWeight: 500 }}>
              User Code:
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {post.userCode}
            </Typography>
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
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>
      </Box>
    </Layout>
  );
}

export default PostDetailsById;
