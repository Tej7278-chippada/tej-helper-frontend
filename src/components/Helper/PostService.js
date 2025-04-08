// src/components/Helper/PostService.js
import React, { useCallback, useEffect, useState } from 'react';
import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Card, Typography, Dialog, DialogActions, DialogContent, DialogTitle,Alert, Box, Toolbar, Grid, CardMedia, CardContent, Tooltip, CardActions, Snackbar, useMediaQuery, IconButton, CircularProgress, } from '@mui/material';
import API, { addUserPost, deleteUserPost, fetchUserPosts, updateUserPost } from '../api/api';
// import { useTheme } from '@emotion/react';
// import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import Layout from '../Layout';
import SkeletonCards from './SkeletonCards';
import LazyImage from './LazyImage';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import { useNavigate } from 'react-router-dom';
// import { MapContainer, Marker, Popup } from 'react-leaflet';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// import LocationOnIcon from '@mui/icons-material/LocationOn';
import SatelliteAltRoundedIcon from '@mui/icons-material/SatelliteAltRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
// Fix for Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useTheme } from '@emotion/react';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { io } from 'socket.io-client';
// import { NotificationAdd } from '@mui/icons-material';
// import axios from "axios";
// const UnsplashAccessKey = "sqHFnHOp1xZakVGb7Om7qsRP0rO9G8GDzTRn0X1cH_k"; // Replace with your Unsplash API key

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
  // const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' }); // For notifications
  // const theme = useTheme();
  // const navigate = useNavigate();
  const navigate = useNavigate();
  const [mapMode, setMapMode] = useState('normal');
  const [currentLocation, setCurrentLocation] = useState({ latitude: 0, longitude: 0 });
  const [locationDetails, setLocationDetails] = useState(null);
  // const { id } = useParams(); // Extract sellerId from URL
  // const [error, setError] = useState('');
  // const [successMessage, setSuccessMessage] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loadingPostDeletion, setLoadingPostDeletion] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeFrom, setTimeFrom] = useState(null);
  const [timeTo, setTimeTo] = useState(null);
  // Initialize socket connection (add this near your other state declarations)
const [socket, setSocket] = useState(null);
const userId = localStorage.getItem('userId');

// const [formData, setFormData] = useState({ title: "", media: [] });
  const [generatedImages, setGeneratedImages] = useState([]);
  // const [newMedia, setNewMedia] = useState([]);

  // Fetch images from Unsplash based on title
  const fetchUnsplashImages = async (query) => {
    try {
      const response = await API.get(`/api/posts/generate-images?query=${query}`);
      setGeneratedImages(response.data.results);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  // Handle title input change
  // const handleTitleChange = (e) => {
  //   const title = e.target.value;
  //   setFormData((prev) => ({ ...prev, title }));

  //   if (title.length > 2) {
  //     fetchUnsplashImages(title);
  //   } else {
  //     setGeneratedImages([]);
  //   }
  // };

  const resizeImage = (blob, maxSize) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
  
        // Set the new dimensions
        let width = img.width;
        let height = img.height;
        const scaleFactor = Math.sqrt(maxSize / blob.size); // Reduce size proportionally
  
        width *= scaleFactor;
        height *= scaleFactor;
        canvas.width = width;
        canvas.height = height;
  
        ctx.drawImage(img, 0, 0, width, height);
  
        // Convert canvas to Blob
        canvas.toBlob(
          (resizedBlob) => {
            resolve(resizedBlob);
          },
          "image/jpeg",
          0.8 // Compression quality
        );
      };
    });
  };
  

  // Add selected image to new media from UnSplash
  const handleSelectImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const existingMediaCount = existingMedia.filter((media) => !media.remove).length;
      const totalMediaCount = newMedia.length + existingMediaCount + 1; // Adding 1 for the new image

      if (totalMediaCount > 5) {
        setMediaError("Maximum 5 photos allowed.");
        return; // Prevent adding the image
      }

      let file;
      if (blob.size > 2 * 1024 * 1024) { // If the image is larger than 2MB
        const resizedBlob = await resizeImage(blob, 2 * 1024 * 1024); // Resize image
        file = new File([resizedBlob], `unsplash-${Date.now()}.jpg`, { type: "image/jpeg" });
        // setNewMedia((prev) => [...prev, file]);
      } else {
        // Directly add if the image is <= 2MB
        file = new File([blob], `unsplash-${Date.now()}.jpg`, { type: "image/jpeg" });
        // setNewMedia((prev) => [...prev, file]);
      }
      setNewMedia((prev) => [...prev, file]);
      setMediaError(""); // Clear error if image is added successfully
    } catch (err) {
      console.error("Error processing image:", err);
    }
  };
  


// const [query, setQuery] = useState("");
//     const [imageUrl, setImageUrl] = useState(null);
//     const [loadingImg, setLoadingImg] = useState(false);

//     const fetchImage = async () => {
//         setLoadingImg(true);
//         try {
//             const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/images`, { params: { query } });
//             setImageUrl(response.data.imageUrl);
//         } catch (error) {
//             console.error("Error fetching image:", error.message);
//         }
//         setLoadingImg(false);
//     };

// Add this useEffect for socket connection
useEffect(() => {
  const newSocket = io(`${process.env.REACT_APP_API_URL}`); // Replace with your backend URL
  setSocket(newSocket);

  return () => {
    if (newSocket) newSocket.disconnect();
  };
}, []);

// Add this useEffect to listen for notifications if needed
useEffect(() => {
  if (socket && userId) {
    socket.emit('joinRoom', userId); // Join user's notification room
    
    socket.on('newNotification', (data) => {
      setSnackbar({
        open: true,
        message: data.message,
        severity: 'info',
        action: (
          <Button 
            color="inherit" 
            size="small"
            onClick={() => navigate(`/post/${data.postId}`)}
          >
            View
          </Button>
        )
      });
    });

    return () => {
      socket.off('newNotification');
    };
  }
}, [socket, userId, navigate]);

  // Add these handlers to manage date and time changes
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTimeFromChange = (time) => {
    setTimeFrom(time);
  };

  const handleTimeToChange = (time) => {
    setTimeTo(time);
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

    const locateUser = useCallback(async () => {
      if (navigator.geolocation) {
        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ latitude, longitude });
            const locationData = { latitude, longitude };
            localStorage.setItem('userLocation', JSON.stringify(locationData));
            // Set location details manually using lat/lng
            fetchAddress(latitude, longitude);
            setLocationDetails({
              latitude,
              longitude,
              accuracy: position.coords.accuracy, // GPS accuracy in meters
            });
            setLoadingLocation(false);
            // console.log("User's current location:", latitude, longitude);
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
            // setError('Failed to fetch your current location. Please enable location access.');
            setSnackbar({ open: true, message: 'Failed to fetch the current location. Please enable the location permission or try again.', severity: 'error' });
            setLoadingLocation(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // High accuracy mode
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
        setSnackbar({ open: true, message: 'Geolocation is not supported by this browser.', severity: 'error' });
      }
    }, []);
    
    useEffect(() => {
      // fetchProducts().then((response) => setProducts(response.data));
      // localStorage.setItem('currentPage', currentPage); // Persist current page to localStorage
      fetchPostsData();
      const storedLocation = localStorage.getItem("userLocation");
      if (storedLocation) {
        // Use the stored location
        const { latitude, longitude } = JSON.parse(storedLocation);
        // setUserLocation({ latitude, longitude });
        setCurrentLocation({ latitude, longitude });
        fetchAddress(latitude, longitude);
        setLocationDetails({
          latitude,
          longitude,
          // accuracy: position.coords.accuracy, // GPS accuracy in meters
        });

      } else {
        // Fetch location only if not stored
        locateUser();
      }
      
  
      // window.addEventListener('scroll', handleScroll);
      return () => {
      //   window.removeEventListener('scroll', handleScroll);
      //   if (scrollTimeoutRef.current) {
      //     clearTimeout(scrollTimeoutRef.current);
      //   }
      };
    }, [fetchPostsData, locateUser]);

    // Fetch address from latitude and longitude
    const fetchAddress = async (lat, lng) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        setCurrentAddress(data.display_name);
      } catch (error) {
        console.error("Error fetching address:", error);
      }
    };
    
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
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          accuracy: locationDetails.accuracy,
          street: locationDetails.street,
          area: locationDetails.area,
          city: locationDetails.city,
          state: locationDetails.state,
          nation: locationDetails.nation,
          pincode: locationDetails.pincode,
          address: currentAddress,
        }));

        // Append date and time data
        if (selectedDate) {
          data.append('serviceDate', selectedDate.toISOString());
        }
        if (timeFrom) {
          data.append('timeFrom', timeFrom.toISOString());
        }
        if (timeTo) {
          data.append('timeTo', timeTo.toISOString());
        }
        
        try {
          if (editingProduct) {
            await updateUserPost(editingProduct._id, data);
            // showNotification(`${formData.title} details updated successfully.`, 'success');
            setSnackbar({ open: true, message: `${formData.title} details updated successfully.`, severity: 'success' });
          } else {
            await addUserPost(data);
            // showNotification(`New Post "${formData.title}" is added successfully.`, 'success');
            setSnackbar({ open: true, message: `New Post "${formData.title}" is added successfully.`, severity: 'success' });
          }
          await fetchPostsData(); // Refresh products list
          handleCloseDialog();       // Close dialog
        } catch (error) {
          console.error("Error submitting post:", error);
          setSnackbar({ open: true, message: editingProduct
            ? `${formData.title} details can't be updated, please try again later.`
            : `New post can't be added, please try again later.`, severity: 'error' });
        } finally {
          setLoading(false); // Stop loading state
        }
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
          latitude: post.location.latitude,
          longitude: post.location.longitude,
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
        setExistingMedia(post.media.map((media, index) => ({ data: media.toString('base64'), _id: index.toString(), remove: false })));
        setOpenDialog(true);
      };
    
      const handleDeleteMedia = (mediaId) => {
        setExistingMedia(existingMedia.map(media => media._id === mediaId ? { ...media, remove: true } : media));
         // Calculate the total media count after deletion
        const updatedTotalMedia = newMedia.length + existingMedia.filter(media => !media.remove && media._id !== mediaId).length;

        // Remove error message if media count is within the limit
        if (updatedTotalMedia <= 5) {
          setMediaError("");
        }
      };

      const handleRemoveNewMedia = (index) => {
        setNewMedia((prev) => {
          const updatedMedia = prev.filter((_, i) => i !== index);
      
          // Calculate the total media count after deletion
          const updatedTotalMedia = updatedMedia.length + existingMedia.filter(media => !media.remove).length;
      
          // Remove error message if media count is within the limit
          if (updatedTotalMedia <= 5) {
            setMediaError("");
          }
      
          return updatedMedia;
        });
      };
      
    
      const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        const resizedFiles = [];
      
        for (const file of selectedFiles) {
          if (file.size > 2 * 1024 * 1024) { // If file is larger than 2MB
            const resizedBlob = await resizeImage(file, 2 * 1024 * 1024);
            const resizedFile = new File([resizedBlob], file.name, { type: file.type });
            resizedFiles.push(resizedFile);
          } else {
            resizedFiles.push(file); // Keep original if <= 2MB
          }
        }
      
        const existingMediaCount = existingMedia.filter((media) => !media.remove).length;
        const totalMediaCount = resizedFiles.length + newMedia.length + existingMediaCount;
        
        // Check conditions for file count
        if (totalMediaCount > 5) {
          setMediaError("Maximum 5 photos allowed.");
        } else {
          setMediaError("");
          // Append newly selected files at the end of the existing array
          setNewMedia((prevMedia) => [...prevMedia, ...resizedFiles]); // Add resized/valid files
        }
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
        setSelectedDate(null);
        setTimeFrom(null);
        setTimeTo(null);
    };

    const openPostDetail = (post) => {
      // setSelectedProduct(product);
      navigate(`/post/${post._id}`);
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
  //     // setSuccessMessage('Location saved successfully.');
  //     setSnackbar({ open: true, message: 'Location saved successfully.', severity: 'success' });
  //   } catch (err) {
  //     // setError('Failed to save location. Please try again later.');
  //     setSnackbar({ open: true, message: 'Failed to save your current location. Please try again later.', severity: 'error' });
  //   }
  // };

  // if (error) return <Alert severity="error">{error}</Alert>;

  const handleChatsOpen = (post) => {
    // setGroupDetailsId(post._id);
    // if (isMobile) {
      navigate(`/chatsOfPost/${post._id}`);
    // }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Define the bounds of the world
  const worldBounds = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));

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
              aria-label="Add New Post"
              title="Add New Post"
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
        {posts.length > 0 ? (
          posts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post._id}>
              {/* <ProductCard product={product} /> */}
              <Card style={{
                margin: '0rem 0', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', // Default shadow boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth transition for hover
                cursor:'pointer'
              }} onClick={() => openPostDetail(post)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)'; // Slight zoom on hover
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)'; // Enhance shadow
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'; // Revert zoom
                  e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)'; // Revert shadow
                }}
                onTouchStart={(e) => {
                  if (e.currentTarget) {
                    e.currentTarget.style.transform = 'scale(1.03)';
                    e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.2)'; // More subtle effect
                    e.currentTarget.style.borderRadius = '14px'; // Ensure smooth edges
                  }
                }}
                onTouchEnd={(e) => {
                  if (e.currentTarget) {
                    setTimeout(() => {
                      if (e.currentTarget) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                      }
                    }, 150);
                  }
                }}
              >
                {/* CardMedia for Images with Scroll */}
                <CardMedia style={{ margin: '0rem 0', borderRadius: '8px', overflow: 'hidden', height: '160px', backgroundColor: '#f5f5f5' }}>
                  <div style={{
                    display: 'flex',
                    overflowX: 'auto',
                    scrollbarWidth: 'thin',
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
                </CardMedia>
                <CardContent style={{ padding: '10px' }}>
                  <Tooltip title={post.title} placement="top" arrow>
                    <Typography variant="h6" component="div" style={{ fontWeight: 'bold', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {post.title.split(" ").length > 5 ? `${post.title.split(" ").slice(0, 5).join(" ")}...` : post.title}
                    </Typography>
                  </Tooltip>
                  <Typography variant="body1" color="textSecondary" style={{ display: 'inline-block', float: 'right', fontWeight: '500' }}>
                    Price: ₹{post.price}
                  </Typography>
                  <Typography variant="body2" color={post.categories === 'Emergency' ? 'rgba(194, 28, 28, 0.89)' : 'textSecondary'} style={{ marginBottom: '0.5rem' }}>
                    Category: {post.categories}
                  </Typography>
                  <Typography variant="body2" color={post.postStatus === 'Active' ? 'green' : 'rgba(194, 28, 28, 0.89)'} style={{ display: 'inline-block', float: 'right', marginBottom: '0.5rem' }}>
                    Post Status: {post.postStatus}
                  </Typography>
                  {/* {post.stockStatus === 'In Stock' && ( */}
                  <Typography variant="body2" color="textSecondary" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                    People Count: {post.peopleCount} ({post.gender})
                  </Typography>
                  {/* <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                    Date : {new Date(post.serviceDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                    Time from - To : {new Date(post.timeFrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(post.timeTo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography> */}
                  <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                    Posted on : {new Date(post.createdAt).toLocaleString() || 'Invalid date'}
                  </Typography>
                  {/* {!(post.createdAt === post.updatedAt) && ( */}
                  {post.updatedAt && (
                  <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
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
                    color="textSecondary"
                    style={{
                      marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis',
                      maxHeight: '4.5rem',  // This keeps the text within three lines based on the line height.
                      lineHeight: '1.5rem'  // Adjust to control exact line spacing.
                    }}>
                    Description: {post.description}
                  </Typography>
                </CardContent>
                <CardActions style={{ justifyContent: 'space-between', padding: '8px 1rem' }}>
                  <Box>
                    <Button color="primary" sx={{ marginRight: '10px', borderRadius:'8px' }} onClick={(event) => {event.stopPropagation(); // Prevent triggering the parent onClick
                      handleEdit(post);}}>Edit</Button>
                    <Button color="secondary" key={post._id} sx={{borderRadius:'8px'}} onClick={(event) => {event.stopPropagation(); handleDeleteClick(post);}}>Delete</Button>
                  </Box>
                  <Button color="primary" variant="contained" sx={{ borderRadius: '8px' }} onClick={(e) => { e.stopPropagation(); handleChatsOpen(post);}}>Chats</Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography textAlign="center" color='grey' padding="1rem" variant="body1">
            You don't have any posts...
          </Typography>
        )}
      </Grid>)}
      </Box>


        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth fullScreen={isMobile ? true : false} sx={{
            margin: '10px',
            '& .MuiPaper-root': { // Target the dialog paper
                borderRadius: '16px', // Apply border radius
                scrollbarWidth: 'thin', scrollbarColor: '#aaa transparent',
            }, '& .MuiDialogContent-root': { margin: isMobile ? '0rem' : '1rem', padding: isMobile ? '8px' : '0rem', 
            }, '& .MuiDialogActions-root': { margin: isMobile ? '1rem' : '1rem',
            }, 
        }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                <DialogTitle>{editingProduct ? "Edit Post" : "Add Post"}
                <IconButton
                  onClick={handleCloseDialog}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    // backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    // color: '#333'
                  }}
                >
                  <CloseIcon />
                </IconButton>
                </DialogTitle>
                <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0rem' }}>
                <Box sx={{paddingBottom:'4rem',marginBottom:'0rem', borderRadius:3, bgcolor:'rgba(0, 0, 0, 0.07)'}}>
                {/* {locationDetails && (
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
                  )} */}
                  {/* <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                    lat, lng: {formData.latitude} {formData.longitude}
                  </Typography> */}
                  {editingProduct && (
                  <Box display="flex" justifyContent="start" mb={1} mt={1} marginInline="4px">
                    <LocationOnIcon color='primary'/>
                    <Typography variant="body1" sx={{marginLeft:'8px', color:'grey' }}>
                      <strong>Post Previous address :</strong> {formData.address || "Address doesn't found"}
                    </Typography>
                  </Box>
                  )}
                  <Box display="flex" justifyContent="start" mb={2} mt={1} marginInline="4px">
                    <LocationOnIcon sx={{color:'rgba(52, 174, 11, 0.95)'}}/>
                    <Typography variant="body1" sx={{marginLeft:'8px', color:'grey' }}>
                      <strong>Your current address :</strong> {currentAddress || "Fetching location..."}
                    </Typography>
                  </Box>
                  <Box sx={{ height: '300px', marginTop: '1rem', paddingInline:'6px' }}>
                    <MapContainer
                      center={formData.latitude ? [formData.latitude, formData.longitude] : [currentLocation.latitude, currentLocation.longitude] }
                      zoom={13}
                      style={{ height: '100%', width: '100%', borderRadius:'8px', }}
                      attributionControl={false}  // Disables the watermark
                      maxBounds={worldBounds} // Restrict the map to the world bounds
                      maxBoundsViscosity={1.0} // Prevents the map from being dragged outside the bounds
                    >
                      <ChangeView center={formData.latitude ? [formData.latitude, formData.longitude] : [currentLocation.latitude, currentLocation.longitude] } />
                      <TileLayer
                        url={mapMode === 'normal'
                          ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                          : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'}
                        noWrap={true} // Disable infinite wrapping
                      />
                      {/* Labels and Roads Layer (Overlay) */}
                      {mapMode === 'satellite' && (
                        <TileLayer
                          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" 
                          opacity={1} // Make it semi-transparent if needed
                        />
                      )}
                      {/* <Marker position={[userData.location.latitude, userData.location.longitude]} icon={customIcon}
                      >
                        <Popup>User Location</Popup>
                      </Marker> */}
                      {/* {currentLocation && ( */}
                      {formData.latitude && (
                        <Marker position={[formData.latitude, formData.longitude]} icon={customIcon} >
                          <Popup>Post Previous Location</Popup>
                        </Marker>
                      )}
                        <Marker position={[currentLocation.latitude, currentLocation.longitude]} icon={userLocationIcon}>
                          <Popup>Your Current Location</Popup>
                        </Marker>
                      {/* )} */}
                    </MapContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', marginBottom:'1rem' }}>
                      <IconButton
                        sx={{fontWeight: '500', width: '60px', borderRadius: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.26)',
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', marginLeft: '0px'}}
                        onClick={() => setMapMode(mapMode === 'normal' ? 'satellite' : 'normal')}
                        // startIcon={mapMode === 'normal' ? <SatelliteAltRoundedIcon/> : <MapRoundedIcon />}
                      >
                        <Tooltip title={mapMode === 'normal' ? 'Switch to Satellite View' : 'Switch to Normal View'} arrow placement="right">
                          <>{mapMode === 'normal' ? <MapRoundedIcon /> : <SatelliteAltRoundedIcon />}</>
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
                      {locationDetails && (
                        <Box sx={{mx:'10px'}}>
                          <Typography variant="body1" style={{ fontWeight: 500 }}>
                            Accuracy (meters):
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {locationDetails.accuracy}
                          </Typography>
                        </Box>
                      )}
                      <IconButton
                        sx={{fontWeight: '500', width: '60px', borderRadius: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.26)',
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', marginLeft: '0px'}}
                        onClick={locateUser}
                        // startIcon={<LocationOnIcon />}
                        disabled={loadingLocation}
                      >
                       <Tooltip title={loadingLocation ? 'Fetching location...' : 'Locate me on Map'} arrow placement="right">
                          <>{loadingLocation ? <CircularProgress size={24} /> : <MyLocationRoundedIcon />}</>
                        </Tooltip>
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
                    <Card style={{ borderRadius: '1rem', marginInline:'2px' }}>
                        {/* Existing media with delete option */}
                        {existingMedia.length > 0 && (
                            <Box style={{ marginBottom: '10px', marginInline: '6px' }}>
                                <Typography ml={1} variant="subtitle1">Existing Images</Typography>
                                <Box style={{ display: 'flex', overflowX: 'scroll', scrollbarWidth: 'none', scrollbarColor: '#888 transparent' }}>
                                    {existingMedia.map((media) => (
                                        !media.remove && (
                                            <Box key={media._id} style={{ position: 'relative', margin: '2px' }}>
                                                <img src={`data:image/jpeg;base64,${media.data}`} alt="Post Media" style={{ height: '160px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }} />
                                                <Button size="small" color="secondary" onClick={() => handleDeleteMedia(media._id)}>Remove</Button>
                                            </Box>
                                        )
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Card>
                    <Card style={{ borderRadius: '1rem', marginBottom: '2rem', marginInline:'2px' }}>
                        <Box style={{ marginBottom: '10px', marginInline: '6px' }}>
                            <Box sx={{marginInline:'4px'}}>
                              <Typography variant="subtitle1">Add Post Photos</Typography>
                              <input type="file" multiple onChange={handleFileChange} />
                              {/* onChange={(e) => setFormData({ ...formData, images: e.target.files })} */}
                              <Typography variant="body2" color="grey">Note : Maximum 5 Photos & Each Photo size should less than 2 MB</Typography>
                              {mediaError && <Alert severity="error">{mediaError}</Alert>}
                            </Box>
                            {newMedia.length > 0 && (
                                <Box style={{ display: 'flex', gap: '4px', marginTop: '10px', overflowX: 'auto', scrollbarWidth: 'none', scrollbarColor: '#888 transparent' }}>
                                    {newMedia.map((file, index) => (
                                        <Box key={index} style={{ position: 'relative' }}>
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index}`}
                                                style={{
                                                    height: '160px',
                                                    borderRadius: '8px',
                                                    objectFit: 'cover',
                                                    flexShrink: 0,
                                                    cursor: 'pointer' // Make the image look clickable
                                                }}
                                            />
                                            <Button size="small" color="secondary" onClick={() => handleRemoveNewMedia(index)}>Remove</Button>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                      </Card>
                      <Box>
                          {/* <TextField
                            label="Post Title"
                            fullWidth
                            value={formData.title}
                            onChange={handleTitleChange}
                          />
                          <Button onClick={() => fetchUnsplashImages(formData.title)}>Generate</Button> */}

                          

                          {/* Selected Images */}
                          {/* <Box>
                            {newMedia.map((file, index) => (
                              <img key={index} src={URL.createObjectURL(file)} alt="Selected" style={{ width: "100px" }} />
                            ))}
                          </Box> */}
                      </Box>
                      <Box>
                      <TextField
                        label="Post Title"
                        fullWidth sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '1rem',
                            bgcolor: theme.palette.background.paper,
                          },
                          '& .MuiInputBase-input': {
                            // padding: '10px 14px',
                          },
                          //  maxWidth: 600, mx: 'auto', paddingTop: '1rem'
                        }}
                        value={formData.title}
                        // onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        onChange={(e) => {
                          const maxLength = 100; // Set character limit
                          if (e.target.value.length <= maxLength) {
                            setFormData({ ...formData, title: e.target.value });
                          }
                        }}
                        inputProps={{ maxLength: 100 }} // Ensures no more than 100 characters can be typed
                        required
                      />
                    <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                    
                    <Typography variant="body2" color="grey" sx={{display: 'inline-block', mx:'10px', my:'4px'}}>You can generate images related to Title of the post.</Typography>
                    <Button variant="text" sx={{float:'inline-end', mr:'10px', borderRadius:'8px'}} onClick={() => fetchUnsplashImages(formData.title)}>Generate</Button>
                    
                    </Box>
                    {/* Floating Card for Generated Images */}
                    
                      <Card sx={{ position: "relative", background: "#fff", padding: "10px", zIndex: 1000, mx:'2px' }}>
                      {generatedImages.length > 0 ? (
                        <>
                        <Typography variant="subtitle1">Select an Image</Typography>
                        <Box style={{ display: "flex", gap: "4px", paddingBottom:'4px', overflowX: "auto", scrollbarWidth: 'thin', scrollbarColor: 'rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0)' }}>
                          {generatedImages.map((img) => (
                            <img
                              key={img.id}
                              src={img.urls.thumb}
                              alt="Generated"
                              style={{ cursor: "pointer", height: "120px", borderRadius: "8px" }}
                              onClick={() => handleSelectImage(img.urls.full)}
                            />
                          ))}
                        </Box>
                        </>
                        ) : 
                        (
                          <Box sx={{ textAlign: 'center', my: 2 }}>
                            <Typography color='grey' sx={{ mb: 2 }}>Images can't found, please check the starting two words correctly in the tiltle.</Typography>
                          </Box>
                        )}
                      </Card>
                    
                    </Box>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                    <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem',}}}>
                        <InputLabel>Categories</InputLabel>
                        <Select
                            value={formData.categories}
                            onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                            required
                            label="Categories"
                        >
                            <MenuItem value="Paid">Paid Service</MenuItem>
                            <MenuItem value="UnPaid">UnPaid Service</MenuItem>
                            <MenuItem value="Emergency">Emergency Service</MenuItem>
                        </Select>
                    </FormControl>
                    {editingProduct && (
                      <FormControl fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem',}}}>
                          <InputLabel>Post Status</InputLabel>
                          <Select
                              value={formData.postStatus}
                              onChange={(e) => setFormData({ ...formData, postStatus: e.target.value })}
                              required
                              label="Post Status"
                          >
                              <MenuItem value="Active">Active</MenuItem>
                              <MenuItem value="InActive">Inactive</MenuItem>
                              <MenuItem value="Closed">Closed</MenuItem>
                          </Select>
                      </FormControl>
                    )}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                    {!(formData.categories === 'UnPaid') && (
                        <TextField
                            label="Price to the service (INR)"
                            type="number"
                            fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem',}}}
                            value={formData.price}
                            onChange={(e) => { 
                              let value = e.target.value;
                              // Remove any invalid characters like "-", "+", or ","
                              value = value.replace(/[-+,]/g, '');
                              
                              // Allow only numbers with up to two decimal places
                              if (/^\d*\.?\d{0,2}$/.test(value)) {  
                                const num = Number(value);
                                
                                // Ensure the value is within range (0 to 10,000,000)
                                if (num >= 0 && num <= 10000000) {
                                  setFormData({ ...formData, price: value });
                                }
                              }
                            }}
                            required
                        />
                    )}
                        <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem',}}}>
                            <InputLabel>Required Gender to service</InputLabel>
                            <Select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                required
                                label="Required Gender to service"
                            >
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                                <MenuItem value="Kids">Kids</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {/* {formData.stockStatus === 'In Stock' && ( */}
                            <TextField
                                label="People Count" required
                                type="number"
                                fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem',}}}
                                value={formData.peopleCount}
                                // onChange={(e) => setFormData({ ...formData, peopleCount: e.target.value })} required
                                onChange={(e) => { 
                                  let value = e.target.value;
                                  
                                  // Remove any non-numeric characters except empty string (allow backspacing)
                                  value = value.replace(/[^0-9]/g, ''); 
                                  
                                  // Convert to a number if it's not empty
                                  if (value === '' || (Number(value) <= 10000)) {  
                                    setFormData({ ...formData, peopleCount: value });
                                  }
                                }}
                                inputProps={{ min: 1, max: 10000, step: 1 }} // Ensures only valid whole numbers
                            />
                        {/* )} */}
                        <TextField
                        label="Service Days"
                        type="number"
                        fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem',}}}
                        value={formData.serviceDays}
                        // onChange={(e) => setFormData({ ...formData, serviceDays: e.target.value })}
                        required
                        onChange={(e) => { 
                          let value = e.target.value;

                          // Remove any non-numeric characters except empty string (allow backspacing)
                          value = value.replace(/[^0-9]/g, ''); 
                          
                          // Convert to a number if it's not empty
                          if (value === '' || (Number(value) <= 10000)) {  
                            setFormData({ ...formData, serviceDays: value });
                          }
                        }}
                        inputProps={{ min: 1, max: 10000, step: 1 }} // Ensures only valid whole numbers
                    />
                    </div>

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Service Date" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem',}}}
                        value={selectedDate} format="dd MM yyyy" // Formats date as "14 03 2025"
                        onChange={handleDateChange}
                        renderInput={(params) => <TextField {...params} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem' }}} />}
                      />
                    </LocalizationProvider>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <TimePicker
                          label="Time From" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem',}}}
                          value={timeFrom}
                          onChange={handleTimeFromChange}
                          renderInput={(params) => <TextField {...params} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem' }}} />}
                        />
                      </LocalizationProvider>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <TimePicker
                          label="Time To" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem',}}}
                          value={timeTo}
                          onChange={handleTimeToChange}
                          renderInput={(params) => <TextField {...params} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem' }}} />}
                        />
                      </LocalizationProvider>
                    </div>
                    
                    <TextField
                        label="Description"
                        multiline
                        rows={6}
                        fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem'}, '& .MuiInputBase-input': {scrollbarWidth: 'thin'} }}
                        value={formData.description}
                        // onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        onChange={(e) => {
                          const maxLength = 1000; // Set character limit
                          if (e.target.value.length <= maxLength) {
                            setFormData({ ...formData, description: e.target.value });
                          }
                        }}
                        inputProps={{ maxLength: 1000 }} // Ensures no more than 100 characters can be typed
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
                        style={loading ? { cursor: 'wait' } : {}} sx={{ borderRadius: '0.5rem' }}
                    >
                        {loading ?  <> <CircularProgress size={20} sx={{ marginRight: '8px' }} /> {editingProduct ? 'Updating...' : 'Adding...'} </> : (editingProduct ? 'Update Post' : 'Add Post')}
                    </Button>
                </DialogActions>
            </form>

        </Dialog>
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
