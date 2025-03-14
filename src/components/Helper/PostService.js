// src/components/Helper/PostService.js
import React, { useCallback, useEffect, useState } from 'react';
import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Card, Typography, Dialog, DialogActions, DialogContent, DialogTitle,Alert, Box, Toolbar, Grid, CardMedia, CardContent, Tooltip, CardActions, Snackbar, useMediaQuery, } from '@mui/material';
import API, { addUserPost, deleteUserPost, fetchUserPosts, updateUserPost } from '../api/api';
// import { useTheme } from '@emotion/react';
// import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import Layout from '../Layout';
import SkeletonCards from './SkeletonCards';
import LazyImage from './LazyImage';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import { useNavigate, useParams } from 'react-router-dom';
// import { MapContainer, Marker, Popup } from 'react-leaflet';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SatelliteAltRoundedIcon from '@mui/icons-material/SatelliteAltRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
// Fix for Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useTheme } from '@emotion/react';

// Set default icon manually
const customIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41], // Default size
  iconAnchor: [12, 41], // Position relative to the point
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

function PostService() {
  const [openDialog, setOpenDialog] = useState(false);
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    postStatus: '',
    peopleCount: '',
    gender: '',
    serviceDays: '',
    description: '',
    media: null,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [existingMedia, setExistingMedia] = useState([]);
  const [newMedia, setNewMedia] = useState([]);
  const [mediaError, setMediaError] = useState('');
  const [loading, setLoading] = useState(false); // to show loading state
  const [submitError, setSubmitError] = useState(''); // Error for failed product submission
  // const [selectedProduct, setSelectedProduct] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' }); // For notifications
  // const theme = useTheme();
  // const navigate = useNavigate();
  const navigate = useNavigate();
  const [mapMode, setMapMode] = useState('normal');
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });
  const [locationDetails, setLocationDetails] = useState(null);
  const { id } = useParams(); // Extract sellerId from URL
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));


    const fetchPostsData = useCallback(async () => {
        setLoading(true);
        try {
          const response = await fetchUserPosts();
          setPosts(response.data); // Set products returned by the API
        } catch (error) {
          console.error('Error fetching seller products:', error);
          setNotification({ open: true, message: 'Failed to fetch products.', type: 'error' });
        } finally {
          setLoading(false);
        }
    }, []);
    
      useEffect(() => {
        // fetchProducts().then((response) => setProducts(response.data));
        // localStorage.setItem('currentPage', currentPage); // Persist current page to localStorage
        fetchPostsData();
        locateUser();
    
        // window.addEventListener('scroll', handleScroll);
        return () => {
        //   window.removeEventListener('scroll', handleScroll);
        //   if (scrollTimeoutRef.current) {
        //     clearTimeout(scrollTimeoutRef.current);
        //   }
        };
      }, [fetchPostsData]);
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Show loading state
        const data = new FormData();
    
        // Add only new media files to FormData
        newMedia.forEach((file) => data.append('media', file));
        // Append form data
        Object.keys(formData).forEach(key => {
          if (key !== 'media') data.append(key, formData[key]);
        });
    
        // Include IDs of existing media to keep
        const mediaToKeep = existingMedia.filter(media => !media.remove).map(media => media._id);
        if (mediaToKeep.length > 0) {
          data.append('existingMedia', JSON.stringify(mediaToKeep));
        }

        // Append location data
        data.append('location', JSON.stringify({
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          accuracy: locationDetails.accuracy,
          street: locationDetails.street,
          area: locationDetails.area,
          city: locationDetails.city,
          state: locationDetails.state,
          nation: locationDetails.nation,
          pincode: locationDetails.pincode,
        }));
        
        try {
          if (editingProduct) {
            await updateUserPost(editingProduct._id, data);
            showNotification(`${formData.title} details updated successfully.`, 'success');
          } else {
            await addUserPost(data);
            showNotification(`New Post "${formData.title}" is added successfully.`, 'success');
          }
          await fetchPostsData(); // Refresh products list
          handleCloseDialog();       // Close dialog
        } catch (error) {
          console.error("Error submitting post:", error);
          showNotification(
            editingProduct
              ? `${formData.title} details can't be updated, please try again later.`
              : `New post can't be added, please try again later.`,
            'error'
          );
        } finally {
          setLoading(false); // Stop loading state
        }
      };
      const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
      };
    
      const handleEdit = (post) => {
        setEditingProduct(post);
        setFormData({
          title: post.title,
          price: post.price,
          categories: post.categories,
          gender: post.gender,
          postStatus: post.postStatus,
          peopleCount: post.peopleCount,
          serviceDays: post.serviceDays,
          description: post.description,
          // media: null, // Reset images to avoid re-uploading
        });
        setExistingMedia(post.media.map((media, index) => ({ data: media.toString('base64'), _id: index.toString(), remove: false })));
        setOpenDialog(true);
      };
    
      const handleDeleteMedia = (mediaId) => {
        setExistingMedia(existingMedia.map(media => media._id === mediaId ? { ...media, remove: true } : media));
      };
    
      const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
      
        // Filter files larger than 2MB
        const oversizedFiles = selectedFiles.filter(file => file.size > 2 * 1024 * 1024);
        const totalMediaCount = selectedFiles.length + existingMedia.filter((media) => !media.remove).length;
      
        // Check for conditions and update errors
        if (oversizedFiles.length > 0 && totalMediaCount > 5) {
          setMediaError("Photo size must be less than 2MB && Maximum 5 photos allowed.");
        } else if (oversizedFiles.length > 0 || totalMediaCount > 5) {
          setMediaError(
            `${oversizedFiles.length > 0 ? "Files must be under 2MB each." : ""} ${totalMediaCount > 5 ? "Maximum 5 photos allowed." : ""}`
          );
        } else {
          setMediaError("");
      
          // Append newly selected files at the end of the existing array
          setNewMedia(prevMedia => [...prevMedia, ...selectedFiles]);
        }
      };

      const handleDelete = async (postId) => {
        const post = posts.find((p) => p._id === postId); // Find the product to get its title
      
        if (!post) {
          showNotification("Post not found for deletion.", "error");
          return;
        }
      
        try {
          await deleteUserPost(postId);
          showNotification(`Post "${post.title}" deleted successfully.`, "success");
          await fetchPostsData(); // Refresh posts list
        } catch (error) {
          console.error("Error deleting post:", error);
          showNotification(`Failed to delete "${post.title}". Please try again later.`, "error");
        }
      };
    
      const showNotification = (message, severity) => {
        setNotification({ open: true, message, severity });
      };

    const handleOpenDialog = () => {
        // Reset form data to empty
        setFormData({
            title: '',
            price: '',
            categories: '',
            gender: '',
            postStatus: '',
            peopleCount: '',
            serviceDays: '',
            description: '',
            media: null,
        });
        setEditingProduct(null); // Ensure it's not in editing mode
        setExistingMedia([]); // Clear any existing media
        setNewMedia([]); // Clear new media files
        setOpenDialog(true);
    };
    
    const handleCloseDialog = () => {
        setEditingProduct(null);
        setExistingMedia([]);
        setNewMedia([]);
        setOpenDialog(false);
        setMediaError('');
        setSubmitError(''); // Clear submission error when dialog is closed
        setFormData({ title: '', price: '', categories: '', gender: '', postStatus: '', peopleCount: '', serviceDays: '', description: '', media: null });
    };

    const openPostDetail = (post) => {
      // setSelectedProduct(product);
      navigate(`/post/${post._id}`);
    };

  const locateUser = async () => {
    if (navigator.geolocation) {
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
          // Fetch location details using an IP geolocation API
          // try {
          //   const response = await fetch(`https://ipapi.co/${latitude},${longitude}/json/`);
          //   const data = await response.json();
          //   setLocationDetails({
          //     ip: data.ip,
          //     street: data.street || 'Not available',
          //     area: data.area || 'Not available',
          //     city: data.city,
          //     state: data.region,
          //     nation: data.country_name,
          //     pincode: data.postal,
          //     accuracy: position.coords.accuracy, // GPS accuracy in meters
          //   });
          // 🌍 Fetch location details using OpenStreetMap's Nominatim API
          // try {
          //   const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          //   const data = await response.json();

          //   setLocationDetails({
          //     street: data.address.road || 'Not available',
          //     area: data.address.neighbourhood || 'Not available',
          //     city: data.address.city || data.address.town || 'Not available',
          //     state: data.address.state || 'Not available',
          //     nation: data.address.country || 'Not available',
          //     pincode: data.address.postcode || 'Not available',
          //   });
          // } catch (err) {
          //   console.error('Error fetching location details:', err);
          //   setError('Failed to fetch location details. Please try again later.');
          // }
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Failed to fetch your current location. Please enable location access.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // High accuracy mode
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const saveLocation = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      await API.put(`/api/auth/${id}/location`, {
        location: {
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
        },
      }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setSuccessMessage('Location saved successfully.');
    } catch (err) {
      setError('Failed to save location. Please try again later.');
    }
  };

  if (error) return <Alert severity="error">{error}</Alert>;

  const handleChatsOpen = (post) => {
    // setGroupDetailsId(post._id);
    // if (isMobile) {
      navigate(`/chatsOfPost/${post._id}`);
    // }
  };



    return (
        <Layout>
        <Box>
        <Toolbar > {/* style={{ display: 'flex', marginTop: '5rem', marginBottom: '-3rem' }} */}
            <Typography variant="h6" style={{ flexGrow: 1 }}>
            User Posts
            </Typography>
            
            <Button
              variant="contained"
              onClick={() => handleOpenDialog()}
              sx={{
                backgroundColor: '#1976d2', // Primary blue
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '24px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  backgroundColor: '#1565c0', // Darker shade on hover
                },
                display: 'flex',
                alignItems: 'center',
                gap: '8px', marginRight: '10px'
              }}
            >
              <PostAddRoundedIcon sx={{ fontSize: '20px' }} />
              {/* <span style={{ fontSize: '14px', fontWeight: '500' }}>Add Product</span> */}
            </Button>
            
        </Toolbar>
        <Box sx={{bgcolor: '#f5f5f5', paddingTop: '1rem', paddingBottom: '1rem', paddingInline: '8px', borderRadius:'10px'}}> {/* sx={{ p: 2 }} */}
        {loading ? (
          <SkeletonCards/>
        ) : (
      <Grid container spacing={2}>
      {posts.map((post) => (
        <Grid item xs={12} sm={6} md={4} key={post._id}>
          {/* <ProductCard product={product} /> */}
          <Card style={{ margin: '0rem 0', borderRadius: '8px', overflow: 'hidden',  background: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', // Default shadow boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth transition for hover
               }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)'; // Slight zoom on hover
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)'; // Enhance shadow
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'; // Revert zoom
                e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)'; // Revert shadow
              }}
          >
            {/* CardMedia for Images with Scroll */}
            <CardMedia style={{ margin: '0rem 0',borderRadius: '8px', overflow: 'hidden', height: '200px', backgroundColor: '#f5f5f5' }}>
              <div style={{
                display: 'flex',
                overflowX: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: '#888 transparent',
                borderRadius: '8px',
                gap: '0.1rem',
                // marginBottom: '1rem'
                height:'210px'}} 
                onClick={() => openPostDetail(post)}
                >
                {post.media && post.media.slice(0, 5).map((base64Image, index) => (
                  <LazyImage key={index} base64Image={base64Image} alt={`Post ${index}`} style={{
                    height: '200px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    flexShrink: 0,
                    cursor: 'pointer' // Make the image look clickable
                  }}/>
                ))}
              </div>
              {post.media && post.media.length > 5 && (
                <Typography variant="body2" color="error" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  Media exceeds its maximum count
                </Typography>
              )}
            </CardMedia>
            <CardContent style={{ padding: '1rem' }}>
              <Tooltip title={post.title} placement="top" arrow>
                <Typography variant="h5" component="div" style={{ fontWeight: 'bold', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {post.title.split(" ").length > 5 ? `${post.title.split(" ").slice(0, 5).join(" ")}...` : post.title}
                </Typography>
              </Tooltip>
              <Typography variant="body1" color="textSecondary" style={{ display: 'inline-block',float: 'right', fontWeight: '500' }}>
                Price: ₹{post.price}
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{  marginBottom: '0.5rem' }}>
                Gender: {post.gender}
              </Typography>
              <Typography variant="body2" color={post.postStatus === 'Active' ? 'green' : 'red'} style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                Post Status: {post.postStatus}
              </Typography>
              {/* {post.stockStatus === 'In Stock' && ( */}
                <Typography variant="body2" color="textSecondary" style={{ display: 'inline-block',float: 'right',marginBottom: '0.5rem' }}>
                  People Count: {post.peopleCount}
                </Typography>
              {/* )} */}
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                Service Days: {post.serviceDays}
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                UserCode : {post.userCode}
              </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  style={{ marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',overflow: 'hidden', textOverflow: 'ellipsis',
                    maxHeight: '4.5rem',  // This keeps the text within three lines based on the line height.
                    lineHeight: '1.5rem'  // Adjust to control exact line spacing.
                  }}>
                  Description: {post.description}
                </Typography>
            </CardContent>
            <CardActions style={{ justifyContent: 'space-between', padding: '0.5rem 1rem' }}>
              <Box>
                <Button color="primary" sx={{marginRight:'10px'}} onClick={() => handleEdit(post)}>Edit</Button> 
                <Button color="secondary" onClick={() => handleDelete(post._id)}>Delete</Button>
              </Box>
              <Button color="primary" onClick={() => handleChatsOpen(post)}>Chats</Button> 
            </CardActions>
          </Card>
        </Grid>
      ))}
      </Grid>)}
      </Box>


        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth fullScreen={isMobile ? true : false} sx={{
            margin: '10px',
            '& .MuiPaper-root': { // Target the dialog paper
                borderRadius: '16px', // Apply border radius
                scrollbarWidth: 'thin', scrollbarColor: '#aaa transparent',
            }, '& .MuiDialogContent-root': { margin: isMobile ? '0rem' : '1rem', padding: isMobile ? '1rem' : '0rem', 
            }, '& .MuiDialogActions-root': { margin: isMobile ? '1rem' : '1rem',
            }, 
        }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
                <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0rem' }}>
                <Box sx={{paddingBottom:'4rem',marginBottom:'0rem', borderRadius:3, bgcolor:'rgba(0, 0, 0, 0.07)'}}>
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
                  <Box sx={{ height: '300px', marginTop: '1rem', paddingInline:'6px' }}>
                    <MapContainer
                      center={[currentLocation.lat, currentLocation.lng] }
                      zoom={13}
                      style={{ height: '100%', width: '100%', borderRadius:'8px', }}
                      attributionControl={false}  // Disables the watermark
                    >
                      <ChangeView center={[currentLocation.lat, currentLocation.lng] } />
                      <TileLayer
                        url={mapMode === 'normal'
                          ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                          : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'}
                      />
                      {/* <Marker position={[userData.location.latitude, userData.location.longitude]} icon={customIcon}
                      >
                        <Popup>User Location</Popup>
                      </Marker> */}
                      {/* {currentLocation && ( */}
                        <Marker position={[currentLocation.lat, currentLocation.lng]} icon={customIcon}>
                          <Popup>Your Current Location</Popup>
                        </Marker>
                      {/* )} */}
                    </MapContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                      <Button
                        variant="contained"
                        onClick={() => setMapMode(mapMode === 'normal' ? 'satellite' : 'normal')}
                        startIcon={mapMode === 'normal' ? <SatelliteAltRoundedIcon/> : <MapRoundedIcon />}
                      >
                        {mapMode === 'normal' ? 'Satellite View' : 'Normal View'}
                      </Button>
                      {currentLocation && (
                        <Button
                          variant="contained"
                          onClick={saveLocation}
                        >
                          Save Location
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        onClick={locateUser}
                        startIcon={<LocationOnIcon />}
                      >
                        Locate Me
                      </Button>
                    </Box>
                  </Box>
                </Box>
                    <Card style={{ borderRadius: '1rem' }}>
                        {/* Existing media with delete option */}
                        {existingMedia.length > 0 && (
                            <div style={{ marginBottom: '1rem', margin: '1rem' }}>
                                <Typography variant="subtitle1">Existing Images</Typography>
                                <div style={{ display: 'flex', overflowX: 'scroll', scrollbarWidth: 'none', scrollbarColor: '#888 transparent' }}>
                                    {existingMedia.map((media) => (
                                        !media.remove && (
                                            <div key={media._id} style={{ position: 'relative', margin: '5px' }}>
                                                <img src={`data:image/jpeg;base64,${media.data}`} alt="Product Media" style={{ height: '200px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }} />
                                                <Button size="small" color="secondary" onClick={() => handleDeleteMedia(media._id)}>Remove</Button>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                    <Card style={{ borderRadius: '1rem', marginBottom: '2rem' }}>
                        <div style={{ marginBottom: '1rem', margin: '1rem' }}>
                            <Typography variant="subtitle1">Add Product Photos</Typography>
                            <input type="file" multiple onChange={handleFileChange} />
                            {/* onChange={(e) => setFormData({ ...formData, images: e.target.files })} */}
                            <Typography variant="body2">Note : Maximum 5 Photos & Each Photo size should less than 2 MB</Typography>
                            {mediaError && <Alert severity="error">{mediaError}</Alert>}
                            {newMedia.length > 0 && (
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', overflowX: 'auto', scrollbarWidth: 'none', scrollbarColor: '#888 transparent' }}>
                                    {newMedia.map((file, index) => (
                                        <div key={index} style={{ position: 'relative' }}>
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index}`}
                                                style={{
                                                    height: '200px',
                                                    borderRadius: '8px',
                                                    objectFit: 'cover',
                                                    flexShrink: 0,
                                                    cursor: 'pointer' // Make the image look clickable
                                                }}
                                            />
                                            <Button
                                                size="small"
                                                color="secondary"
                                                onClick={() => setNewMedia((prev) => prev.filter((_, i) => i !== index))}>
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div></Card>
                    <TextField
                        label="Post Title"
                        fullWidth
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                    <FormControl fullWidth>
                        <InputLabel>Categories</InputLabel>
                        <Select
                            value={formData.categories}
                            onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                            required
                        >
                            <MenuItem value="Paid">Paid Service</MenuItem>
                            <MenuItem value="UnPaid">UnPaid Service</MenuItem>
                            <MenuItem value="Emergency">Emergency Service</MenuItem>
                        </Select>
                    </FormControl>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <TextField
                            label="Price to the service (INR)"
                            type="number"
                            fullWidth
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                        <FormControl fullWidth>
                            <InputLabel>Required Gender to service</InputLabel>
                            <Select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                required
                            >
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                                <MenuItem value="Kids">Kids</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <FormControl fullWidth required>
                            <InputLabel>Post Status</InputLabel>
                            <Select
                                value={formData.postStatus}
                                onChange={(e) => setFormData({ ...formData, postStatus: e.target.value })}
                                required
                            >
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="InActive">Inactive</MenuItem>
                                <MenuItem value="Closed">Closed</MenuItem>
                            </Select>
                        </FormControl>
                        {/* {formData.stockStatus === 'In Stock' && ( */}
                            <TextField
                                label="People Count"
                                type="number"
                                fullWidth
                                value={formData.peopleCount}
                                onChange={(e) => setFormData({ ...formData, peopleCount: e.target.value })} required
                            />
                        {/* )} */}
                    </div>
                    <TextField
                        label="Service Days"
                        type="number"
                        fullWidth
                        value={formData.serviceDays}
                        onChange={(e) => setFormData({ ...formData, serviceDays: e.target.value })}
                        required
                    />
                    <TextField
                        label="Description"
                        multiline
                        rows={6}
                        fullWidth
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />


                </DialogContent>
                {submitError && <Alert severity="error" style={{ margin: '1rem' }}>{submitError}</Alert>}
                <DialogActions sx={{ margin: '2rem', gap: '1rem' }}>
                    <Button onClick={handleCloseDialog} disabled={loading} variant='text' color='warning' sx={{ borderRadius: '8px' }}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        style={loading ? { cursor: 'wait' } : {}} sx={{ borderRadius: '8px' }}
                    >
                        {loading ? 'Processing...' : (editingProduct ? 'Update Product' : 'Add Product')}
                    </Button>
                </DialogActions>
            </form>

        </Dialog>
        {/* Snackbar for notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={9000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
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

export default PostService;
