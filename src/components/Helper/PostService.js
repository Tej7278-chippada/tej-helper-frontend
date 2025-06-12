// src/components/Helper/PostService.js
import React, { useCallback, useEffect, useState } from 'react';
import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Card, Typography, Dialog, DialogActions, DialogContent, DialogTitle,Alert, Box, Toolbar, Grid, CardMedia, CardContent, Tooltip, CardActions, Snackbar, useMediaQuery, IconButton, CircularProgress, LinearProgress, Switch, } from '@mui/material';
import API, { addUserPost, deleteUserPost, fetchUserPosts, updateUserPost } from '../api/api';
// import { useTheme } from '@emotion/react';
// import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import Layout from '../Layout';
import SkeletonCards from './SkeletonCards';
import LazyImage from './LazyImage';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import { useNavigate } from 'react-router-dom';
// import { MapContainer, Marker, Popup } from 'react-leaflet';
import { MapContainer, TileLayer, Marker, useMap, Popup, Circle } from 'react-leaflet';
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
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LazyBackgroundImage from './LazyBackgroundImage';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
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

const userPrivacyLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
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
  const [generatedImages, setGeneratedImages] = useState([]);
  const [loadingGeneration, setLoadingGeneration] = useState(false);
  const [loadingImage, setLoadingImage] = useState(null); // Track which image is loading
  const [addedImages, setAddedImages] = useState([]); // Store successfully added image URLs
  const [noImagesFound, setNoImagesFound] = useState(false); // NEW state for empty results
  const tokenUsername = localStorage.getItem('tokenUsername');
  const [protectLocation, setProtectLocation] = useState(false);
  const [fakeAddress, setFakeAddress] = useState('');
  // const [loadingMedia, setLoadingMedia] = useState(false);
  // const [postMedia, setPostMedia] = useState([]);

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
      setLoadingImage(imageUrl); // Start loading progress on the selected image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const existingMediaCount = existingMedia.filter((media) => !media.remove).length;
      const totalMediaCount = newMedia.length + existingMediaCount + 1; // Adding 1 for the new image

      if (totalMediaCount > 5) {
        setMediaError("Maximum 5 photos allowed.");
        setLoadingImage(null); // Remove loading if failed
        setSnackbar({ open: true, message: 'Maximum 5 photos allowed.', severity: 'warning' });
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
      // Show green tick after successful addition
      setAddedImages((prev) => [...prev, imageUrl]);
    } catch (err) {
      console.error("Error processing image:", err);
    } finally {
      setLoadingImage(null); // Remove loading animation
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

    const toggleIsFullTime = (e) => {
      const isChecked = e.target.checked;
      setFormData((prev) => ({
        ...prev,
        isFullTime: isChecked
      }));
    };

    // const toggleLocationProvacy = (e) => {
    //   setProtectLocation(e.target.checked);
    //   fetchFakeAddress(finalLocation.latitude, finalLocation.longitude);
    // };

    const toggleLocationPrivacy = (e) => {
      const isChecked = e.target.checked;
      setProtectLocation(isChecked);
      if (isChecked) {
        fetchFakeAddress(finalLocation.latitude, finalLocation.longitude);
        setSnackbar({ open: true, message: 'Location privacy turned on (will show approximate location within 500m radius)', severity: 'warning' });
      } else {
        setFakeAddress(null);
        setSnackbar({ open: true, message: 'Location privacy turned off (your exact location posted as post location)', severity: 'warning' });
      }
    };

    const fetchFakeAddress = async (lat, lng) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        setFakeAddress(data.display_name);
      } catch (error) {
        console.error("Error fetching address:", error);
      }
    };

    const offsetCoordinates = (lat, lng, distanceMeters) => {
      // Earth's radius in meters
      const earthRadius = 6378137;
      
      // Convert distance to radians
      const offset = distanceMeters / earthRadius;
      
      // Convert latitude and longitude to radians
      const latRad = lat * (Math.PI / 180);
      const lngRad = lng * (Math.PI / 180);
      
      // Random bearing (0 to 2π)
      const bearing = Math.random() * 2 * Math.PI;
      
      // Calculate new latitude
      const newLat = Math.asin(
        Math.sin(latRad) * Math.cos(offset) + 
        Math.cos(latRad) * Math.sin(offset) * Math.cos(bearing)
      );
      
      // Calculate new longitude
      const newLng = lngRad + Math.atan2(
        Math.sin(bearing) * Math.sin(offset) * Math.cos(latRad),
        Math.cos(offset) - Math.sin(latRad) * Math.sin(newLat)
      );
      
      // Convert back to degrees
      return {
        latitude: newLat * (180 / Math.PI),
        longitude: newLng * (180 / Math.PI)
      };
    };

    // Apply location offset if privacy protection is enabled
    let finalLocation = {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude
    };

    if (protectLocation) {
      finalLocation = offsetCoordinates(
        currentLocation.latitude,
        currentLocation.longitude,
        500 // 500 meters
      );
    }
    
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
          latitude: finalLocation.latitude,
          longitude: finalLocation.longitude,
          accuracy: locationDetails.accuracy,
          // street: locationDetails.street,
          // area: locationDetails.area,
          // city: locationDetails.city,
          // state: locationDetails.state,
          // nation: locationDetails.nation,
          // pincode: locationDetails.pincode,
          address: fakeAddress ? fakeAddress : currentAddress,
          coordinates: [finalLocation.longitude, finalLocation.latitude],
          type: 'Point',
          isProtected: protectLocation,
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

      // const fetchPostMedia = async (postId) => {
      //   setLoadingMedia(true);
      //   try {
      //     const response = await fetchPostMediaById(postId);
      //     setPostMedia(response.data || []);
      //     console.log('media fetched',response.data);
      //   } catch (error) {
      //     if (error.response && error.response.status === 404) {
      //       console.error('Post Unavailable.', error);
      //       setSnackbar({ open: true, message: "Post Unavailable.", severity: "warning" });
      //     } else if (error.response && error.response.status === 401) {
      //       console.error('Error fetching post details:', error);
      //     } else {
      //       console.error('Error fetching post details:', error);
      //     }
      //   } finally {
      //     setLoadingMedia(false);
      //   }
      // };
    
      const handleEdit = (post) => {
        // fetchPostMedia(post._id);
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
        setExistingMedia(post.media.map((media, index) => ({ data: media.toString('base64'), _id: index.toString(), remove: false })));
        // setExistingMedia(postMedia.map((media, index) => ({ data: media.toString('base64'), _id: index.toString(), remove: false })));
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
          setSnackbar({ open: true, message: 'Maximum 5 photos allowed.', severity: 'warning' });
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
            isFullTime: false,
            media: null,
        });
        setEditingProduct(null); // Ensure it's not in editing mode
        setExistingMedia([]); // Clear any existing media
        setNewMedia([]); // Clear new media files
        setGeneratedImages([]);
        setNoImagesFound(false); // Reset no images found state
        setOpenDialog(true);
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
                <Box sx={{paddingBottom: isMobile ? '8rem' : '8rem', marginBottom:'0rem', borderRadius:3, bgcolor:'rgba(0, 0, 0, 0.07)'}}>
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
                  {fakeAddress && 
                    <Box display="flex" justifyContent="start" mb={2} mt={1} marginInline="4px">
                      <LocationOnIcon sx={{color:'rgba(174, 11, 11, 0.95)'}}/>
                      <Typography variant="body1" sx={{marginLeft:'8px', color:'grey' }}>
                        <strong>Protected address :</strong> {fakeAddress || "Fetching location..."}
                      </Typography>
                    </Box>
                  }
                  <Box sx={{ height: '300px', marginTop: '1rem', paddingInline:'6px' }}>
                    <MapContainer
                      center={formData.latitude ? [formData.latitude, formData.longitude] : protectLocation ? [finalLocation.latitude, finalLocation.longitude] : [currentLocation.latitude, currentLocation.longitude] }
                      zoom={13}
                      style={{ height: '100%', width: '100%', borderRadius:'8px', }}
                      attributionControl={false}  // Disables the watermark
                      maxBounds={worldBounds} // Restrict the map to the world bounds
                      maxBoundsViscosity={1.0} // Prevents the map from being dragged outside the bounds
                    >
                      <ChangeView center={formData.latitude ? [formData.latitude, formData.longitude] : protectLocation ? [finalLocation.latitude, finalLocation.longitude] : [currentLocation.latitude, currentLocation.longitude] } />
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
                      <>
                        <Marker position={[currentLocation.latitude, currentLocation.longitude]} icon={userLocationIcon}>
                          {/* <Popup>Your Current Location</Popup> */}
                          <Popup>
                            {protectLocation 
                              ? "Your exact location (hidden from others)" 
                              : "Your exact location"}
                          </Popup>
                        </Marker>
                        {protectLocation && 
                          <Circle
                            center={[currentLocation.latitude, currentLocation.longitude]}
                            radius={500}
                            color="#ff0000"
                            fillColor="#ff0000"
                            fillOpacity={0.2}
                          />
                        }
                      </>
                        {/* Show both locations if privacy is enabled */}
                        {/* {protectLocation && (
                          <>
                            <Marker 
                              position={[currentLocation.latitude, currentLocation.longitude]} 
                              icon={userLocationIcon}
                            >
                              <Popup>Your exact location (hidden from others)</Popup>
                            </Marker>
                            <Circle
                              center={[currentLocation.latitude, currentLocation.longitude]}
                              radius={500}
                              color="#ff0000"
                              fillColor="#ff0000"
                              fillOpacity={0.2}
                            />
                          </>
                        )} */}
                      {/* Show the post location (either exact or protected) */}
                      {protectLocation && 
                        <Marker 
                          position={[finalLocation.latitude, finalLocation.longitude]} 
                          icon={userPrivacyLocationIcon}
                        >
                          <Popup>
                            {protectLocation 
                              ? "Protected location (within 500m radius)" 
                              : "Exact post location"}
                          </Popup>
                        </Marker>
                      }
                      {/* )} */}
                    </MapContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', marginBottom:'6px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                        <Typography variant="caption" sx={{ mt: 0.5, textAlign: 'center', color:'grey' }}>
                          {mapMode === 'normal' ? 'Normal' : 'Salellite'}
                        </Typography>
                      </Box>
                      {/* {currentLocation && (
                        <Button
                          variant="contained"
                          onClick={saveLocation}
                        >
                          Save Location
                        </Button>
                      )} */}
                      {locationDetails?.accuracy && (
                        <Box sx={{mx:'10px', alignContent: 'center'}}>
                          <Typography variant="body2" style={{ fontWeight: 500 }}>
                            Accuracy (meters): {locationDetails.accuracy}
                          </Typography>
                          {/* <Typography variant="body2" color="textSecondary">
                            {locationDetails.accuracy}
                          </Typography> */}
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                        <Typography variant="caption" sx={{ mt: 0.5, textAlign: 'center', color:'grey' }}>
                          Locate Me
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                      <Tooltip title="When enabled, your exact location will be hidden and shown as an approximate area">
                        <InfoOutlinedIcon fontSize="small" color="action"/>
                      </Tooltip>
                      <Typography variant="body2" sx={{ mx: '6px' }}>
                        Protect my location privacy {/* (will show approximate location within 500m radius) */}
                      </Typography>
                      {/* <FormControlLabel
                        control={ */}
                          <Switch
                            checked={protectLocation}
                            onChange={toggleLocationPrivacy}
                            color="primary"
                          />
                        {/* }
                        label={
                          <Typography variant="body2">
                            Protect my location privacy (will show approximate location within 500m radius)
                          </Typography>
                        }
                      /> */}
                    </Box>
                  </Box>
                </Box>
                    <Card sx={{ borderRadius: 3, marginInline:'2px', bgcolor: '#f5f5f5' }}>
                        {/* Existing media with delete option */}
                        {existingMedia.length > 0 && (
                            <Box style={{ marginBottom: '10px', marginInline: '6px' }}>
                                <Typography ml={1} variant="subtitle1">Existing Images</Typography>
                                <Box style={{ display: 'flex', gap: '4px', overflowX: 'scroll', scrollbarWidth: 'none', scrollbarColor: '#888 transparent' }}>
                                    {existingMedia.map((media) => (
                                        !media.remove && (
                                            <Box key={media._id} style={{ position: 'relative', display:'flex', alignItems:'flex-start', flexDirection:'column'  }}>
                                                <img src={`data:image/jpeg;base64,${media.data}`} alt="Post Media" style={{ height: '160px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }} />
                                                <Button size="small" color="secondary" onClick={() => handleDeleteMedia(media._id)}>Remove</Button>
                                            </Box>
                                        )
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Card>
                    <Card sx={{ borderRadius: 3, marginBottom: '0rem', mx:'2px', bgcolor: '#f5f5f5' }}>
                        <Box sx={{ mx: '6px', my:'4px' }}>
                            <Box sx={{mx:'6px' }}>
                              <Typography variant="subtitle1">Add Post Photos</Typography>
                              <Box sx={{mx:'4px', display:'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'null' : 'center', gap: isMobile ? '2px' : '14px' }}>
                              {/* Styled Upload Button */}
                              <Button 
                                variant="text"  
                                component="label" size="small"
                                sx={{ my: 1, borderRadius: "8px", textTransform: "none", bgcolor:'rgba(24, 170, 248, 0.07)' }}
                              >
                                Choose Photos
                                <input 
                                  type="file" 
                                  multiple 
                                  hidden 
                                  accept="image/png, image/jpeg, image/jpg, image/webp"
                                  onChange={handleFileChange} 
                                />
                              </Button>
                              {/* onChange={(e) => setFormData({ ...formData, images: e.target.files })} */}
                              <Typography variant="body2" color="grey">Note : Maximum 5 Photos allowed.</Typography>
                              </Box>
                              {mediaError && <Alert severity="error">{mediaError}</Alert>}
                            </Box>
                            {newMedia.length > 0 && (
                                <Box sx={{ display: 'flex', gap: '4px', marginTop: '10px', mx:'4px', overflowX: 'auto', scrollbarWidth: 'none', scrollbarColor: '#888 transparent' }}>
                                    {newMedia.map((file, index) => (
                                        <Box key={index} style={{display:'flex', position: 'relative', alignItems:'flex-start', flexDirection:'column' }}>
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
                    <Card sx={{bgcolor: '#f5f5f5', borderRadius: 3, px: '4px' , py: '4px', mx:'2px', pt: '12px', pb: isMobile ? '6px' : '6px'}}>
                      <TextField
                        label="Post Title"
                        fullWidth sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
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
                      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="row" m={1} gap={1}>
                        <Typography variant="body2" color="grey" >*You can generate images related to Title of the post.</Typography>
                        <Button variant="text" sx={{ borderRadius:'8px', bgcolor:'rgba(24, 170, 248, 0.07)', px: isMobile ? '24px' : 'null'}} onClick={() => fetchUnsplashImages(formData.title)} disabled={loadingGeneration}>Generate</Button>
                      </Box>
                      {/* Floating Card for Generated Images */}
                      {/* <Card sx={{ position: "relative", background: "#fff", padding: "10px", zIndex: 1000, mx:'2px' }}> */}
                      {loadingGeneration ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection:'column', alignItems:'center', p: 6, gap:'1rem' }}>
                          <LinearProgress sx={{ width: 84, height: 4, borderRadius: 2, mt: 0 }}/>
                          <Typography color='grey' variant='body2'>Generating Images...</Typography>
                        </Box>
                      ) : (
                      generatedImages.length > 0 ? (
                        <Box sx={{ position: "relative", padding: "0px", px: isMobile ? '0px' : '4px' , zIndex: 1000, mx:'2px' , borderRadius: 3}}>
                          <Typography variant="subtitle1">Select an Image</Typography>
                          <Box style={{ display: "flex", gap: "4px", paddingBottom:'0px', overflowX: "auto", scrollbarWidth: isMobile ? 'none' : 'thin', scrollbarColor: 'rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0)' }}>
                            {generatedImages.map((img) => (
                            <Box key={img.id} sx={{ position: "relative", cursor: "pointer" }} onClick={() => handleSelectImage(img.urls.full)}>
                              <img
                                // key={img.id}
                                src={img.urls.thumb}
                                alt="Generated"
                                style={{ height: "120px", borderRadius: "8px", opacity: loadingImage === img.urls.full ? 0.6 : 1 }}
                                // onClick={() => handleSelectImage(img.urls.full)}
                              />
                              {/* Loading progress overlay */}
                              {loadingImage === img.urls.full && (
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    bgcolor: "rgba(0, 0, 0, 0.5)",
                                    borderRadius: "50%",
                                    padding: "10px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                                </Box>
                              )}

                              {/* Green tick when successfully added */}
                              {addedImages.includes(img.urls.full) && (
                                <Box
                                  sx={{
                                    position: "absolute",
                                    bottom: "8px",
                                    right: "5px",
                                    backgroundColor: "green",
                                    borderRadius: "50%",
                                    width: "24px",
                                    height: "24px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <TaskAltRoundedIcon sx={{ color: "white", fontSize: "18px" }} />
                                </Box>
                              )}
                            </Box>
                            ))}
                          </Box>
                        </Box>
                        ) : noImagesFound ? (
                          <Box sx={{ textAlign: 'center', my: 2 }}>
                            <Typography color="warning" sx={{ mb: 2 }}>Images doesn't found related to the title, please check the title.</Typography>
                          </Box>
                        ) : null
                      )}
                      {/* </Card> */}
                    </Card>
                    <Box>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                    <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem',}}} required>
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
                    {formData.categories === 'Paid' && 
                    <Box display="flex" alignItems="center" justifyContent="center" >
                      <Tooltip title="When enabled, your exact location will be hidden and shown as an approximate area">
                        <InfoOutlinedIcon fontSize="small" color="action"/>
                      </Tooltip>
                      <Typography variant="body2" sx={{ mx: '6px' }}>
                        Is this work Full Time 
                      </Typography>
                          <Switch
                            checked={formData.isFullTime}
                            onChange={toggleIsFullTime}
                            color="primary"
                          />
                    </Box>}
                    </Box>
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
                        <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem',}}} required>
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
                                <MenuItem value="Everyone">Everyone</MenuItem>
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
                        slotProps={{
                          textField: { fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: '1rem' } } }
                        }}
                      />
                    </LocalizationProvider>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <TimePicker
                          label="Time From" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem',}}}
                          value={timeFrom}
                          onChange={handleTimeFromChange}
                          slotProps={{
                            textField: { fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: '1rem' } } }
                          }}
                        />
                      </LocalizationProvider>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <TimePicker
                          label="Time To" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem',}}}
                          value={timeTo}
                          onChange={handleTimeToChange}
                          slotProps={{
                            textField: { fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: '1rem' } } }
                          }}
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
