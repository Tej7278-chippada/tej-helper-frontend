// src/components/Helper/PostService.js
import React, { useCallback, useEffect, useState } from 'react';
import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Card, Typography, Dialog, DialogActions, DialogContent, DialogTitle,Alert, Box, Toolbar, Grid, CardMedia, CardContent, Tooltip, CardActions, Snackbar, useMediaQuery, IconButton, CircularProgress, LinearProgress, Switch, } from '@mui/material';
import API, { addUserPost, deleteUserPost, fetchPostMediaById, fetchUserPosts, updateUserPost } from '../api/api';
// import { useTheme } from '@emotion/react';
// import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import Layout from '../Layout';
import SkeletonCards from './SkeletonCards';
// import LazyImage from './LazyImage';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import { useNavigate } from 'react-router-dom';
// import { MapContainer, Marker, Popup } from 'react-leaflet';
// import { MapContainer, TileLayer, Marker, useMap, Popup, Circle } from 'react-leaflet';
// import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// import LocationOnIcon from '@mui/icons-material/LocationOn';
// import SatelliteAltRoundedIcon from '@mui/icons-material/SatelliteAltRounded';
// import MapRoundedIcon from '@mui/icons-material/MapRounded';
// Fix for Leaflet marker icon issue
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useTheme } from '@emotion/react';
// import CloseIcon from '@mui/icons-material/Close';
// import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
// import LocationOnIcon from '@mui/icons-material/LocationOn';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { TimePicker } from '@mui/x-date-pickers/TimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
// import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LazyBackgroundImage from './LazyBackgroundImage';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import EnhancedPostServiceDialog from './EnhancedPostServiceDialog';
// import { NotificationAdd } from '@mui/icons-material';
// import axios from "axios";
// const UnsplashAccessKey = "sqHFnHOp1xZakVGb7Om7qsRP0rO9G8GDzTRn0X1cH_k"; // Replace with your Unsplash API key


// Enhanced glassmorphism styles
// const getGlassmorphismStyle = (opacity = 0.15, blur = 20) => ({
//   background: `rgba(255, 255, 255, ${opacity})`,
//   backdropFilter: `blur(${blur}px)`,
//   border: '1px solid rgba(255, 255, 255, 0.2)',
//   boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
// });

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
    isFullTime: false,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [existingMedia, setExistingMedia] = useState([]);
  const [newMedia, setNewMedia] = useState([]);
  const [mediaError, setMediaError] = useState('');
  const [loading, setLoading] = useState(false); // to show loading state
  const [submitError, setSubmitError] = useState(''); // Error for failed product submission
  // const [selectedProduct, setSelectedProduct] = useState(null);
  // const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' }); // For notifications
  // const theme = useTheme();
  // const navigate = useNavigate();
  const navigate = useNavigate();
  // const [mapMode, setMapMode] = useState('normal');
  // const [currentLocation, setCurrentLocation] = useState({ latitude: 0, longitude: 0 });
  // const [locationDetails, setLocationDetails] = useState(null);
  // const { id } = useParams(); // Extract sellerId from URL
  // const [error, setError] = useState('');
  // const [successMessage, setSuccessMessage] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  // const [loadingLocation, setLoadingLocation] = useState(false);
  // const [currentAddress, setCurrentAddress] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loadingPostDeletion, setLoadingPostDeletion] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeFrom, setTimeFrom] = useState(null);
  const [timeTo, setTimeTo] = useState(null);
  // Initialize socket connection (add this near your other state declarations)
  const [generatedImages, setGeneratedImages] = useState([]);
  const [loadingGeneration, setLoadingGeneration] = useState(false);
  // const [loadingImage, setLoadingImage] = useState(null); // Track which image is loading
  // const [addedImages, setAddedImages] = useState([]); // Store successfully added image URLs
  const [noImagesFound, setNoImagesFound] = useState(false); // NEW state for empty results
  const tokenUsername = localStorage.getItem('tokenUsername');
  const [protectLocation, setProtectLocation] = useState(false);
  const [fakeAddress, setFakeAddress] = useState('');
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  
  // Fetch images from Unsplash based on title
  const fetchUnsplashImages = async (query) => {
    try {
      setLoadingGeneration(true);
      setNoImagesFound(false); // Reset no images found state
      const response = await API.get(`/api/posts/generate-images?query=${query}`);
      if (response.data.results.length === 0) {
        setNoImagesFound(true); // Set no images found state
      }
      setGeneratedImages(response.data.results);
    } catch (error) {
      console.error("Error fetching images:", error);
      setNoImagesFound(true); // Also set the state if API fails
    } finally {
      setLoadingGeneration(false);
    }
  };



    const fetchPostsData = useCallback(async () => {
        setLoading(true);
        try {
          const response = await fetchUserPosts();
          setPosts(response.data.reverse() || []); // Set products returned by the API
        } catch (error) {
          console.error('Error fetching your posts:', error);
          // setNotification({ open: true, message: 'Failed to fetch products.', type: 'error' });
          setSnackbar({ open: true, message: 'Failed to fetch your posts.', severity: 'error' });
        } finally {
          setLoading(false);
        }
    }, []);

    
    const fetchPostMedia = async (postId) => {
      setLoadingMedia(true);
      try {
        const response = await fetchPostMediaById(postId);
        setExistingMedia(response.data.media.map((media, index) => ({ data: media.toString('base64'), _id: index.toString(), remove: false })));
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
        setLoadingMedia(false);
      }
    };
     
    
      const handleEdit = (post) => {
        fetchPostMedia(post._id); // to fetch the post's entire media
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
          isFullTime: post.isFullTime,
          latitude: post.location.latitude,
          longitude: post.location.longitude,
          coordinates: [post.location.longitude, post.location.latitude],
          type: 'Point',
          address: post.location.address,
          // media: null, // Reset images to avoid re-uploading
        });
        // Set the date and time fields if they exist in the post
        if (post.serviceDate) {
          setSelectedDate(new Date(post.serviceDate));
        }
        if (post.timeFrom) {
          setTimeFrom(new Date(post.timeFrom));
        }
        if (post.timeTo) {
          setTimeTo(new Date(post.timeTo));
        }
        // setExistingMedia(post.media.map((media, index) => ({ data: media.toString('base64'), _id: index.toString(), remove: false })));
        setOpenDialog(true);
      };


      const handleDeleteClick = (post) => {
        setSelectedPost(post);  // Store selected post details
        setDeleteDialogOpen(true);  // Open confirmation dialog
      };

      const handleConfirmDelete  = async () => {
        if (!selectedPost) return;
        // const post = posts.find((p) => p._id === postId); // Find the product to get its title
      
        // if (!post) {
        //   // showNotification("Post not found for deletion.", "error");
        //   setSnackbar({ open: true, message: 'Post not found for deletion.', severity: 'error' });
        //   return;
        // }
        setLoadingPostDeletion(true);
        try {
          await deleteUserPost(selectedPost._id);
          // showNotification(`Post "${post.title}" deleted successfully.`, "success");
          setSnackbar({ open: true, message: `Post "${selectedPost.title}" deleted successfully.`, severity: 'success' });
          await fetchPostsData(); // Refresh posts list
          setLoadingPostDeletion(false);
        } catch (error) {
          console.error("Error deleting post:", error);
          // showNotification(`Failed to delete "${post.title}". Please try again later.`, "error");
          setSnackbar({ open: true, message: `Failed to delete "${selectedPost.title}". Please try again later.`, severity: 'error' });
          setLoadingPostDeletion(false);
        }
        setDeleteDialogOpen(false); // Close dialog after action
        setLoadingPostDeletion(false);
      };
    
      // const showNotification = (message, severity) => {
      //   setNotification({ open: true, message, severity });
      // };

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
            isFullTime: false,
            media: null,
        });
        setEditingProduct(null); // Ensure it's not in editing mode
        setExistingMedia([]); // Clear any existing media
        setNewMedia([]); // Clear new media files
        setGeneratedImages([]);
        setNoImagesFound(false); // Reset no images found state
        setOpenDialog(true);
        setActiveStep(0);
    };
    
    const handleCloseDialog = () => {
        setEditingProduct(null);
        setExistingMedia([]);
        setNewMedia([]);
        setOpenDialog(false);
        setMediaError('');
        setSubmitError(''); // Clear submission error when dialog is closed
        setFormData({ title: '', price: '', categories: '', gender: '', postStatus: '', peopleCount: '', serviceDays: '', description: '', isFullTime: false, media: null });
        setSelectedDate(null);
        setTimeFrom(null);
        setTimeTo(null);
        setGeneratedImages([]);
        setNoImagesFound(false); // Reset no images found state
        setProtectLocation(false);
        setFakeAddress('');
        setActiveStep(0);
    };

    const openPostDetail = (post) => {
      // setSelectedProduct(product);
      navigate(`/post/${post._id}`);
    };

 

  const handleChatsOpen = (post) => {
    // setGroupDetailsId(post._id);
    // if (isMobile) {
      navigate(`/chatsOfPost/${post._id}`);
    // }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });


    return (
        <Layout username={tokenUsername}>
        <Box>
        <Toolbar sx={{display:'flex', justifyContent:'space-between', 
        // ...getGlassmorphismStyle(0.1, 10),
          // background: 'rgba(255, 255, 255, 0.8)',  backdropFilter: 'blur(10px)',
          // boxShadow: '0 2px 10px rgba(0,0,0,0.05)', 
          borderRadius: '12px', 
          padding: isMobile ? '2px 12px' : '2px 12px',  margin: '4px',
          position: 'relative', //sticky
          top: 0,
          // zIndex: 1100
          }}> {/* style={{ display: 'flex', marginTop: '5rem', marginBottom: '-3rem' }} */}
            {/* <Typography variant="h6" style={{ flexGrow: 1 }}>
            User Posts
            </Typography> */}
            <Typography 
              variant="h6" 
              fontWeight={600}
              sx={{
                background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', //background: '#4361ee',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              My Posts
            </Typography>


            
            <Button
              variant="contained"
              onClick={() => handleOpenDialog()}
              size="small"
              sx={{
                // backgroundColor: '#1976d2', // Primary blue
                background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
                color: '#fff',
                // padding: '4px 12px',
                borderRadius: '12px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  // backgroundColor: '#1565c0', // Darker shade on hover
                  boxShadow: '0 6px 20px rgba(67, 97, 238, 0.4)',
                  transform: 'translateY(-2px)',
                },
                display: 'flex',
                alignItems: 'center',
                gap: '8px', marginRight: '0px',
                textTransform: 'none',
                fontWeight: 600,
              }}
              aria-label="Add New Post"
              title="Add New Post"
            >
              <PostAddRoundedIcon sx={{ fontSize: '20px' }} />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Add Post</span>
            </Button>
            
        </Toolbar>
        <Box sx={{background: 'rgba(255, 255, 255, 0)',  backdropFilter: 'blur(10px)', paddingTop: '1rem', paddingBottom: '1rem', mx: isMobile ? '6px' : '8px', paddingInline: '8px', borderRadius:'10px'}}> {/* sx={{ p: 2 }} */}
        {loading ? (
          <SkeletonCards/>
        ) : (
      <Grid container spacing={1.5}>
        {posts.length > 0 ? (
          posts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post._id}>
              {/* <ProductCard product={product} /> */}
              <Card sx={{
                margin: '0rem 0', borderRadius: '8px', overflow: 'hidden', backdropFilter: 'blur(5px)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth transition for hover
                cursor:'pointer', position: 'relative',
                height: isMobile ? '280px' : '320px',
              }} onClick={() => openPostDetail(post)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)'; // Slight zoom on hover
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)'; // Enhance shadow
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'; // Revert zoom
                  e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)'; // Revert shadow
                }}
                // onTouchStart={(e) => {
                //   if (e.currentTarget) {
                //     e.currentTarget.style.transform = 'scale(1.03)';
                //     e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.2)'; // More subtle effect
                //     e.currentTarget.style.borderRadius = '14px'; // Ensure smooth edges
                //   }
                // }}
                // onTouchEnd={(e) => {
                //   if (e.currentTarget) {
                //     setTimeout(() => {
                //       if (e.currentTarget) {
                //         e.currentTarget.style.transform = 'scale(1)';
                //         e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                //       }
                //     }, 150);
                //   }
                // }}
              >
                {/* CardMedia for Images with Scroll */}
                {/* <CardMedia style={{ margin: '0rem 0', borderRadius: '8px', overflow: 'hidden', height: '160px', backgroundColor: '#f5f5f5' }}>
                  <div style={{
                    display: 'flex',
                    overflowX: 'auto', overflowY: 'hidden',
                    scrollbarWidth: 'none',
                    scrollbarColor: '#888 transparent',
                    borderRadius: '8px',
                    gap: '0.1rem',
                    // marginBottom: '1rem'
                    height: '170px'
                  }}
                    // onClick={() => openPostDetail(post)}
                  >
                  {post.media && post.media.length > 0 ? (
                    post.media && post.media.slice(0, 5).map((base64Image, index) => (
                      <LazyImage key={index} base64Image={base64Image} alt={`Post ${index}`} style={{
                        height: '160px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        flexShrink: 0,
                        cursor: 'pointer' // Make the image look clickable
                      }} />
                    ))
                  ) : (
                    // Show a placeholder image if no media is available
                    <img
                      src="https://placehold.co/56x56?text=No+Imag" // Replace with the path to your placeholder image
                      alt="No media available"
                      style={{
                        height: '160px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  </div>
                  {post.media && post.media.length > 5 && (
                    <Typography variant="body2" color="error" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                      Media exceeds its maximum count
                    </Typography>
                  )}
                </CardMedia> */}
                 {/* Background Image */}
                <LazyBackgroundImage
                  base64Image={post.media?.[0]} 
                  alt={post.title}
                >
                
                {/* Gradient Overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '60%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)'
                }} />
                <CardContent sx={{ position: 'absolute',
                        bottom: 30,
                        left: 0,
                        right: 0,
                        padding: '16px',
                        color: 'white' }}>
                  {post.isFullTime && 
                    <Typography sx={{ px: 2, py: 0.5, bgcolor: '#e0f7fa', color: '#006064', borderRadius: '999px', display: 'inline-block', float: 'right', fontWeight: '600', fontSize: '0.875rem' }}>
                      Full Time
                    </Typography>
                  }
                  <Tooltip title={post.title} placement="top" arrow>
                    <Typography variant="h6" component="div" style={{ fontWeight: 'bold', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white' }}>
                      {post.title.split(" ").length > 5 ? `${post.title.split(" ").slice(0, 5).join(" ")}...` : post.title}
                    </Typography>
                  </Tooltip>
                  <Typography variant="body1" style={{ display: 'inline-block', float: 'right', fontWeight: '500', color: 'white' }}>
                    Price: ₹{post.price}
                  </Typography>
                  <Typography variant="body2" color={post.categories === 'Emergency' ? '#ffa5a5' : 'rgba(255, 255, 255, 0.9)'} style={{ marginBottom: '0.5rem' }}>
                    Category: {post.categories}
                  </Typography>
                  <Typography variant="body2" style={{ display: 'inline-block', float: 'right', marginBottom: '0.5rem', color: post.postStatus === 'Active' ? '#a5ffa5' : '#ffa5a5'  }}>
                    Post Status: {post.postStatus}
                  </Typography>
                  {/* {post.stockStatus === 'In Stock' && ( */}
                  <Typography variant="body2" style={{ display: 'inline-block', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                    People Count: {post.peopleCount} ({post.gender})
                  </Typography>
                  {/* <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                    Date : {new Date(post.serviceDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                    Time from - To : {new Date(post.timeFrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(post.timeTo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography> */}
                  <Typography variant="body2" style={{ marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.9)'  }}>
                    Posted on : {new Date(post.createdAt).toLocaleString() || 'Invalid date'}
                  </Typography>
                  {/* {!(post.createdAt === post.updatedAt) && ( */}
                  {post.updatedAt && (
                  <Typography variant="body2" style={{ marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.9)'  }}>
                    Updated on : {new Date(post.updatedAt).toLocaleString() || 'Invalid date'}
                  </Typography>
                  )}
                  {/* )} */}
                  {/* )} */}
                  {/* <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
      Service Days: {post.serviceDays}
    </Typography>
    <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
      UserCode : {post.userCode}
    </Typography> */}
                  <Typography
                    variant="body2"
                    // color="textSecondary"
                    style={{
                      marginBottom: '0rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis',
                      maxHeight: '4.5rem',  // This keeps the text within three lines based on the line height.
                      lineHeight: '1.5rem',  // Adjust to control exact line spacing.
                      color: 'rgba(255, 255, 255, 0.9)' 
                    }}>
                    Description: {post.description}
                  </Typography>
                </CardContent>
                <CardActions style={{ justifyContent: 'space-between', padding: '12px 1rem', position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        // padding: '16px',
                        color: 'white'  }}>
                  <Box>
                    <Button color="primary" size="small" variant="outlined" startIcon={<EditNoteRoundedIcon />} sx={{ marginRight: '10px', borderRadius:'8px' }} onClick={(event) => {event.stopPropagation(); // Prevent triggering the parent onClick
                      handleEdit(post);}}>Edit</Button>
                    <Button color="secondary" size="small" variant="outlined" startIcon={<DeleteSweepRoundedIcon />} key={post._id} sx={{borderRadius:'8px'}} onClick={(event) => {event.stopPropagation(); handleDeleteClick(post);}}>Delete</Button>
                  </Box>
                  <Button  variant="contained" size="small" startIcon={<ForumRoundedIcon />} sx={{ borderRadius: '8px', background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', '&:hover': {
                    background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', 
                    transform: 'translateY(-2px)' }, transition: 'all 0.3s ease', }} onClick={(e) => { e.stopPropagation(); handleChatsOpen(post);}}
                  >Chats</Button>
                </CardActions>
                </LazyBackgroundImage>
              </Card>
            </Grid>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography color='grey' padding="2rem" variant="body1">
            You don't have any posts yet...
            </Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 2, borderRadius: '12px' }}
              onClick={() => handleOpenDialog()}
            >
              <PostAddRoundedIcon sx={{ fontSize: '20px', mr: '8px'}} />
              Add your first post
            </Button>
          </Box>
        )}
         
      </Grid>)}
      { posts.length > 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          p: 3,
          backgroundColor: 'rgba(25, 118, 210, 0.05)',
          borderRadius: '12px',
          mt: 2
        }}>
          <Typography color="text.secondary">
            No more posts of yous...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {/* Current search range: {distanceRange} km */}
          </Typography>
        </Box>
      )}
      </Box>
        <EnhancedPostServiceDialog openDialog={openDialog} handleCloseDialog={handleCloseDialog} setSnackbar={setSnackbar} submitError={submitError} theme={theme}
         isMobile={isMobile} fetchPostsData={fetchPostsData} fetchUnsplashImages={fetchUnsplashImages} noImagesFound={noImagesFound} loading={loading} setLoading={setLoading}
         newMedia={newMedia} setNewMedia={setNewMedia} mediaError={mediaError} setMediaError={setMediaError} editingProduct={editingProduct} existingMedia={existingMedia} setExistingMedia={setExistingMedia}
         formData={formData} setFormData={setFormData} generatedImages={generatedImages} loadingGeneration={loadingGeneration} loadingMedia={loadingMedia}
         selectedDate={selectedDate} setSelectedDate={setSelectedDate} timeFrom={timeFrom} setTimeFrom={setTimeFrom} timeTo={timeTo} setTimeTo={setTimeTo}
         protectLocation={protectLocation} setProtectLocation={setProtectLocation} fakeAddress={fakeAddress} setFakeAddress={setFakeAddress}
         activeStep={activeStep} setActiveStep={setActiveStep}
        />

        {/* Snackbar for notifications */}
        {/* <Snackbar
          open={notification.open}
          autoHideDuration={9000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%', borderRadius:'1rem'  }}>
            {notification.message}
          </Alert>
        </Snackbar> */}
        {/* <Snackbar
          open={!!successMessage}
          autoHideDuration={9000}
          onClose={() => setSuccessMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        </Snackbar> */}

        {/* existed post Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="delete-dialog-title" 
          sx={{ '& .MuiPaper-root': { borderRadius: '14px' }, }}
        >
          <DialogTitle id="delete-dialog-title" >
            Are you sure you want to delete this post?
          </DialogTitle>
          <DialogContent style={{ padding: '2rem' }}>
            <Typography color='error'>
              If you proceed, the post <strong>{selectedPost?.title}</strong> will be removed permanently...
            </Typography>
          </DialogContent>
          <DialogActions style={{ padding: '1rem' , gap: 1}}>
            <Button onClick={() => setDeleteDialogOpen(false)} variant='outlined' color="primary" sx={{borderRadius:'8px'}}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} variant='contained' color="error" sx={{ marginRight: '10px', borderRadius:'8px' }}>
              {loadingPostDeletion ? <> <CircularProgress size={20} sx={{marginRight:'8px'}}/> Deleting... </> : "Delete Post"}
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius:'1rem' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
        </Box>
        </Layout>
    );

}

export default PostService;
