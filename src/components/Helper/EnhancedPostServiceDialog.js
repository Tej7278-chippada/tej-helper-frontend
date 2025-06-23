// import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  Alert,
  CircularProgress,
  LinearProgress,
  Tooltip,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Paper,
  Divider,
  Avatar,
  ListItemIcon,
  ListItemText,
  FormHelperText
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn as LocationOnIcon,
  MyLocation as MyLocationIcon,
  Map as MapIcon,
  Satellite as SatelliteIcon,
  PhotoCamera as PhotoCameraIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  CurrencyRupee as CurrencyRupeeIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  AutoAwesome as AutoAwesomeIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

import React, { useCallback, useEffect, useState } from 'react';
// import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Card, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Alert, Box, Toolbar, Grid, CardMedia, CardContent, Tooltip, CardActions, Snackbar, useMediaQuery, IconButton, CircularProgress, LinearProgress, Switch, } from '@mui/material';
import API, { addUserPost, deleteUserPost, fetchPostMediaById, fetchUserPosts, updateUserPost } from '../api/api';
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
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useTheme } from '@emotion/react';
// import CloseIcon from '@mui/icons-material/Close';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
// import LocationOnIcon from '@mui/icons-material/LocationOn';
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
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import {
  MaleRounded as MaleIcon,
  FemaleRounded as FemaleIcon,
  ChildCareRounded as KidsIcon,
  GroupsRounded as EveryoneIcon,
  PaidRounded as PaidIcon,
  VolunteerActivismRounded as FreeIcon,
  EmergencyRounded as EmergencyRoundedIcon,
  LocalParkingRounded as ParkingIcon,
  TwoWheelerRounded as RentalIcon
} from '@mui/icons-material';
// import { NotificationAdd } from '@mui/icons-material';
// import axios from "axios";
// const UnsplashAccessKey = "sqHFnHOp1xZakVGb7Om7qsRP0rO9G8GDzTRn0X1cH_k"; // Replace with your Unsplash API key

// Custom glassmorphism styling
const getGlassmorphismStyle = (theme, darkMode) => ({
  background: darkMode 
    ? 'rgba(205, 201, 201, 0.15)' 
    // : 'rgba(255, 255, 255, 0.15)',
    :'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  backdropFilter: 'blur(20px)',
  border: darkMode 
    ? '1px solid rgba(255, 255, 255, 0.1)' 
    : 'null', // '1px solid rgba(255, 255, 255, 0.2)'
  boxShadow: darkMode 
    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
});

// Set default icon manually
const customIcon = new L.Icon({
  iconUrl:  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png', // markerIcon
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', // markerShadow
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

const EnhancedPostServiceDialog = ({ openDialog, onCloseDialog, theme, isMobile, fetchPostsData, /* generatedImages, loadingGeneration,
  noImagesFound, */ newMedia, setNewMedia, editingProduct, /* formData, setFormData, */ selectedDate, setSelectedDate, mediaError, setMediaError,
  timeFrom, setTimeFrom, timeTo, setTimeTo, existingMedia, setExistingMedia, /* fetchUnsplashImages, */ loadingMedia, loading, setLoading,
  setSnackbar, setSubmitError, submitError, protectLocation, setProtectLocation, fakeAddress, setFakeAddress, activeStep, setActiveStep,
  darkMode, validationErrors, setValidationErrors, }) => {
  //   const [openDialog, setOpenDialog] = useState(false);
  // const [activeStep, setActiveStep] = useState(0);
  //   const [editingProduct, setEditingProduct] = useState(false);
  //   const [loading, setLoading] = useState(false);
  //   const [loadingLocation, setLoadingLocation] = useState(false);
  //   const [loadingGeneration, setLoadingGeneration] = useState(false);
  //   const [protectLocation, setProtectLocation] = useState(false);
  //   const [mapMode, setMapMode] = useState('normal');
  //   const [formData, setFormData] = useState({
  //     title: '',
  //     categories: '',
  //     price: '',
  //     gender: '',
  //     peopleCount: '',
  //     serviceDays: '',
  //     description: '',
  //     postStatus: 'Active',
  //     isFullTime: false
  //   });
  //   const [existingMedia, setExistingMedia] = useState([]);
  //   const [newMedia, setNewMedia] = useState([]);
  //   const [generatedImages, setGeneratedImages] = useState([]);
  //   const [addedImages, setAddedImages] = useState([]);

  const steps = ['Location & Privacy', 'Media & Images', 'Service Details', 'Summary & Submit'];

  //   const isMobile = window.innerWidth <= 768;

  //   const handleCloseDialog = () => {
  //     setOpenDialog(false);
  //   };

  //   const handleSubmit = (e) => {
  //     e.preventDefault();
  //     setLoading(true);
  //     // Simulate API call
  //     setTimeout(() => {
  //       setLoading(false);
  //       setOpenDialog(false);
  //     }, 2000);
  //   };

  // const [formData, setFormData] = useState({
  //     title: '',
  //     price: '',
  //     postStatus: '',
  //     peopleCount: '',
  //     gender: '',
  //     serviceDays: '',
  //     description: '',
  //     media: null,
  //     isFullTime: false,
  //   });
  //   const [editingProduct, setEditingProduct] = useState(null);
  //   const [existingMedia, setExistingMedia] = useState([]);
  //   const [newMedia, setNewMedia] = useState([]);
  //   const [mediaError, setMediaError] = useState('');
  //   const [loading, setLoading] = useState(false); // to show loading state
  //   const [submitError, setSubmitError] = useState(''); // Error for failed product submission
  // const [selectedProduct, setSelectedProduct] = useState(null);
  // const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' }); // For notifications
  // const theme = useTheme();
  // const navigate = useNavigate();
  //   const navigate = useNavigate();
  const [mapMode, setMapMode] = useState('normal');
  const [currentLocation, setCurrentLocation] = useState({ latitude: 0, longitude: 0 });
  const [locationDetails, setLocationDetails] = useState(null);
  // const { id } = useParams(); // Extract sellerId from URL
  // const [error, setError] = useState('');
  // const [successMessage, setSuccessMessage] = useState('');
  //   const theme = useTheme();
  //   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  //   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');
  //   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  //   const [selectedPost, setSelectedPost] = useState(null);
  //   const [loadingPostDeletion, setLoadingPostDeletion] = useState(false);
  //   const [selectedDate, setSelectedDate] = useState(null);
  //   const [timeFrom, setTimeFrom] = useState(null);
  //   const [timeTo, setTimeTo] = useState(null);
  // Initialize socket connection (add this near your other state declarations)
  //   const [generatedImages, setGeneratedImages] = useState([]);
  //   const [loadingGeneration, setLoadingGeneration] = useState(false);
  const [loadingImage, setLoadingImage] = useState(null); // Track which image is loading
  const [addedImages, setAddedImages] = useState([]); // Store successfully added image URLs
  //   const [noImagesFound, setNoImagesFound] = useState(false); // NEW state for empty results
  //   const tokenUsername = localStorage.getItem('tokenUsername');
  //   const [protectLocation, setProtectLocation] = useState(false);
  //   const [fakeAddress, setFakeAddress] = useState('');
  //   const [loadingMedia, setLoadingMedia] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  // const [validationErrors, setValidationErrors] = useState({});
  const [stepsWithErrors, setStepsWithErrors] = useState([]);
  // Add formData state inside the component
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
  const [generatedImages, setGeneratedImages] = useState([]);
  const [loadingGeneration, setLoadingGeneration] = useState(false);
  const [noImagesFound, setNoImagesFound] = useState(false); // NEW state for empty results


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

  // Initialize form data when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        title: editingProduct.title,
        price: editingProduct.price,
        categories: editingProduct.categories,
        gender: editingProduct.gender,
        postStatus: editingProduct.postStatus,
        peopleCount: editingProduct.peopleCount,
        serviceDays: editingProduct.serviceDays,
        description: editingProduct.description,
        isFullTime: editingProduct.isFullTime,
        latitude: editingProduct.location.latitude,
        longitude: editingProduct.location.longitude,
        coordinates: [editingProduct.location.longitude, editingProduct.location.latitude],
        type: 'Point',
        address: editingProduct.location.address,
      });
      
      // Set date and time fields if they exist
      if (editingProduct.serviceDate) {
        setSelectedDate(new Date(editingProduct.serviceDate));
      }
      if (editingProduct.timeFrom) {
        setTimeFrom(new Date(editingProduct.timeFrom));
      }
      if (editingProduct.timeTo) {
        setTimeTo(new Date(editingProduct.timeTo));
      }
    } else {
      // Reset form when creating new post
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
      setSelectedDate(null);
      setTimeFrom(null);
      setTimeTo(null);
    }
  }, [editingProduct]);

  const handleCloseDialog = () => {
    // Reset all form states
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
    setExistingMedia([]);
    setNewMedia([]);
    setGeneratedImages([]);
    setSelectedDate(null);
    setTimeFrom(null);
    setTimeTo(null);
    setProtectLocation(false);
    setFakeAddress('');
    setActiveStep(0);
    setValidationErrors({});
    setMediaError('');
    setSubmitError('');
    
    // Call parent's close handler
    onCloseDialog();  // Changed from handleCloseDialog to onCloseDialog
  };

  // useEffect(() => {
  //   if (submitError) {
  //     const timer = setTimeout(() => {
  //       setSubmitError(null);
  //     }, 5000);

  //     return () => clearTimeout(timer); // cleanup on unmount or error change
  //   }
  // }, [submitError]);

  // Add this useEffect hook to handle scroll events
  useEffect(() => {
    const dialogContent = document.querySelector('.MuiDialogContent-root');
    if (!dialogContent) return;

    const handleScroll = () => {
      const currentScrollPosition = dialogContent.scrollTop;
      setLastScrollPosition(currentScrollPosition);
    };

    dialogContent.addEventListener('scroll', handleScroll);
    return () => dialogContent.removeEventListener('scroll', handleScroll);
  }, [lastScrollPosition]);


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
        const resizedBlob = await resizeImage(blob, 1 * 1024 * 1024); // Resize image
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

  // const validateForm = () => {
  //   const errors = {};
  //   const errorSteps = new Set();

  //   // Step 0: Location validation
  //   if (!currentAddress && !fakeAddress) {
  //     errors.location = 'Location is required';
  //     errorSteps.add(0);
  //   }

  //   // Step 1: Media validation
  //   if (!formData.title) {
  //     errors.title = 'Title is required';
  //     errorSteps.add(1);
  //   }
  //   if (newMedia.length === 0 && existingMedia.filter(m => !m.remove).length === 0) {
  //     errors.media = 'At least one image is required';
  //     errorSteps.add(1);
  //   }

  //   // Step 2: Service Details validation
  //   if (!formData.categories) {
  //     errors.categories = 'Category is required';
  //     errorSteps.add(2);
  //   }
  //   if (!formData.gender) {
  //     errors.gender = 'Preferred gender is required';
  //     errorSteps.add(2);
  //   }
  //   if (!formData.peopleCount) {
  //     errors.peopleCount = 'People count is required';
  //     errorSteps.add(2);
  //   }
  //   if (!formData.serviceDays) {
  //     errors.serviceDays = 'Service days is required';
  //     errorSteps.add(2);
  //   }
  //   if (formData.categories !== 'UnPaid' && !formData.price) {
  //     errors.price = 'Price is required for paid services';
  //     errorSteps.add(2);
  //   }
  //   if (!selectedDate) {
  //     errors.serviceDate = 'Service date is required';
  //     errorSteps.add(2);
  //   }
  //   if (!timeFrom || !timeTo) {
  //     errors.serviceTime = 'Service time range is required';
  //     errorSteps.add(2);
  //   }

  //   // Step 3: Description validation
    
  //   if (!formData.description) {
  //     errors.description = 'Description is required';
  //     errorSteps.add(3);
  //   }

  //   setValidationErrors(errors);
  //   setStepsWithErrors(Array.from(errorSteps));
  //   return Object.keys(errors).length === 0;
  // };

  // Create a helper function to check if step has errors
  const stepHasError = (stepIndex) => {
    return stepsWithErrors.includes(stepIndex);
  };


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
    // // Validate before submitting
    // if (!validateForm()) {
    //   setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
    //   return;
    // }
    // Clear errors for the current step when moving forward
    clearStepErrors(activeStep);
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      const dialogContent = document.querySelector('.MuiDialogContent-root');
      if (dialogContent) {
        dialogContent.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }
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
      // Reset form after successful submission
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
      setExistingMedia([]);
      setNewMedia([]);
      setGeneratedImages([]);
      setSelectedDate(null);
      setTimeFrom(null);
      setTimeTo(null);
      setProtectLocation(false);
      setFakeAddress('');
      setActiveStep(0);
      setValidationErrors({});
      await fetchPostsData(); // Refresh products list
      handleCloseDialog();       // Close dialog
    } catch (error) {
      console.error("Error submitting post:", error);
      setSnackbar({
        open: true, message: editingProduct
          ? `${formData.title} details can't be updated, please try again later.`
          : `New post can't be added, please try again later.`, severity: 'error'
      });
    } finally {
      setLoading(false); // Stop loading state
    }
  };



  // const handleEdit = (post) => {
  //   fetchPostMedia(post._id); // to fetch the post's entire media
  //   setEditingProduct(post);
  //   setFormData({
  //     title: post.title,
  //     price: post.price,
  //     categories: post.categories,
  //     gender: post.gender,
  //     postStatus: post.postStatus,
  //     peopleCount: post.peopleCount,
  //     serviceDays: post.serviceDays,
  //     description: post.description,
  //     isFullTime: post.isFullTime,
  //     latitude: post.location.latitude,
  //     longitude: post.location.longitude,
  //     coordinates: [post.location.longitude, post.location.latitude],
  //     type: 'Point',
  //     address: post.location.address,
  //     // media: null, // Reset images to avoid re-uploading
  //   });
  //   // Set the date and time fields if they exist in the post
  //   if (post.serviceDate) {
  //     setSelectedDate(new Date(post.serviceDate));
  //   }
  //   if (post.timeFrom) {
  //     setTimeFrom(new Date(post.timeFrom));
  //   }
  //   if (post.timeTo) {
  //     setTimeTo(new Date(post.timeTo));
  //   }
  //   // setExistingMedia(post.media.map((media, index) => ({ data: media.toString('base64'), _id: index.toString(), remove: false })));
  //   setOpenDialog(true);
  // };

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


  // Define the bounds of the world
  const worldBounds = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));


    const handleNext = () => {
      // Clear errors for the current step when moving forward
      clearStepErrors(activeStep);
      // Validate current step before proceeding
      if (!validateCurrentStep()) {
        const dialogContent = document.querySelector('.MuiDialogContent-root');
        if (dialogContent) {
          dialogContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }
      setActiveStep((prevStep) => prevStep + 1);
      // Scroll to top when moving to next step
      const dialogContent = document.querySelector('.MuiDialogContent-root');
      if (dialogContent) {
        dialogContent.scrollTo({ top: 0, behavior: 'auto' });
      }
    };

    // Add these helper functions
    const validateCurrentStep = () => {
      const errors = {};
      const errorSteps = new Set(stepsWithErrors);

      switch (activeStep) {
        case 0: // Location step
          if (!currentAddress && !fakeAddress) {
            errors.location = 'Location is required';
            errorSteps.add(0);
          } else {
            errorSteps.delete(0);
          }
          break;
          
        case 1: // Media step
          if (!formData.title) {
            errors.title = 'Post Title is required';
            errorSteps.add(1);
          } else {
            errorSteps.delete(1);
          }
          if (newMedia.length === 0 && existingMedia.filter(m => !m.remove).length === 0) {
            errors.media = 'At least one image is required';
            errorSteps.add(1);
          } else {
            errorSteps.delete(1);
          }
          break;
          
        case 2: // Service Details step
          if (!formData.categories) {
            errors.categories = 'Category is required';
            errorSteps.add(2);
          } else {
            errorSteps.delete(2);
          }
          if (formData.categories !== 'UnPaid' && !formData.price) {
            errors.price = 'Price is required';
            errorSteps.add(2);
          } else {
            errorSteps.delete(2);
          }
          if (!formData.gender) {
            errors.gender = 'Preferred gender is required';
            errorSteps.add(2);
          } else {
            errorSteps.delete(2);
          }
          if (!formData.peopleCount) {
            errors.peopleCount = 'People count is required';
            errorSteps.add(2);
          } else {
            errorSteps.delete(2);
          }
          if (!formData.serviceDays) {
            errors.serviceDays = 'Service Days is required';
            errorSteps.add(2);
          } else {
            errorSteps.delete(2);
          }
          // Add other field validations for step 2...
          break;
          
        case 3: // Description step
          
          if (!formData.description) {
            errors.description = 'Description is required';
            errorSteps.add(3);
          } else {
            errorSteps.delete(3);
          }
          break;
      }

      setValidationErrors(prev => ({ ...prev, ...errors }));
      setStepsWithErrors(Array.from(errorSteps));
      
      return Object.keys(errors).length === 0;
    };

    const clearStepErrors = (stepIndex) => {
      const errorsToRemove = [];
      
      switch (stepIndex) {
        case 0:
          errorsToRemove.push('location');
          break;
        case 1:
          errorsToRemove.push('title','media');
          break;
        case 2:
          errorsToRemove.push('categories', 'gender', 'peopleCount', 'serviceDays', 'price', 'serviceDate', 'serviceTime');
          break;
        case 3:
          errorsToRemove.push( 'description');
          break;
      }

      setValidationErrors(prev => {
        const newErrors = { ...prev };
        errorsToRemove.forEach(error => delete newErrors[error]);
        return newErrors;
      });

      setStepsWithErrors(prev => prev.filter(step => step !== stepIndex));
    };

    const handleBack = () => {
      clearStepErrors(activeStep);
      setActiveStep((prevStep) => prevStep - 1);
      // Scroll to top when going back
      const dialogContent = document.querySelector('.MuiDialogContent-root');
      if (dialogContent) {
        dialogContent.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const renderLocationStep = () => (
      <Fade in timeout={300}>
        <Box>
          {validationErrors.location && (
            <Alert severity="error" sx={{ my: 1 }}>
              {validationErrors.location}
            </Alert>
          )}
          {/* Map Placeholder */}
          <Card elevation={0} sx={{ borderRadius: 3, height: 360, bgcolor: 'grey.100', mb: 1 }}>
            {/* <Box 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <LocationOnIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              <Typography color="text.secondary">Interactive Map View</Typography>
            </Box> */}
            <Box elevation={0} sx={{ borderRadius: 3, height: 300, bgcolor: 'grey.100', m: 1 }}>
            <MapContainer
              center={formData.latitude ? [formData.latitude, formData.longitude] : protectLocation ? [finalLocation.latitude, finalLocation.longitude] : [currentLocation.latitude, currentLocation.longitude]}
              zoom={13}
              style={{ height: '100%', width: '100%', borderRadius: '8px', }}
              attributionControl={false}  // Disables the watermark
              maxBounds={worldBounds} // Restrict the map to the world bounds
              maxBoundsViscosity={1.0} // Prevents the map from being dragged outside the bounds
            >
              <ChangeView center={formData.latitude ? [formData.latitude, formData.longitude] : protectLocation ? [finalLocation.latitude, finalLocation.longitude] : [currentLocation.latitude, currentLocation.longitude]} />
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
                      ? "Dummy location (within 500m radius)"
                      : "Exact post location"}
                  </Popup>
                </Marker>
              }
              {/* )} */}
            </MapContainer>
            </Box>
            {/* Map Controls */}
            <Box sx={{ m: 1, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={mapMode === 'normal' ? <SatelliteIcon /> : <MapIcon />}
                onClick={() => setMapMode(mapMode === 'normal' ? 'satellite' : 'normal')}
                sx={{ borderRadius: 3 }}
              >
                {mapMode === 'normal' ? 'Satellite' : 'Normal'}
              </Button>
              <Button
                variant="outlined"
                startIcon={loadingLocation ? <CircularProgress size={16} /> : <MyLocationIcon />}
                disabled={loadingLocation} onClick={locateUser}
                sx={{ borderRadius: 3 }}
              >
                Locate Me
              </Button>
            </Box>
          </Card>
          

          <Card 
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
              borderRadius: 3,
              border: '1px solid rgba(25, 118, 210, 0.1)',
              mb: 3, mt: 2
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <LocationOnIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  Location Settings
                </Typography>
              </Box>

              {/* Current Location Display */}
              <Box sx={{ mb: 2 }}>
                {/* <Box display="flex" alignItems="center" mb={1}>
                  <LocationOnIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="body1" fontWeight={500}>
                    Current Location
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  123 Main Street, Quthbullapur, Telangana, India
                </Typography> */}
                {editingProduct && (
                <>
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOnIcon sx={{ color: 'warning.main', mr: 1 }} />
                    <Typography variant="body1" fontWeight={500}>
                      Post Previous address
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="start" mb={1} mt={1} marginInline="4px">
                    {/* <LocationOnIcon color='primary' /> */}
                    <Typography variant="body2" color="text.secondary" sx={{ marginLeft: '8px' }}>
                      {formData.address || "Address doesn't found"}
                    </Typography>
                  </Box>
                </>
                )}
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOnIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="body1" fontWeight={500}>
                    Current Address
                  </Typography>
                  {locationDetails?.accuracy && !isMobile && (
                    <Box sx={{ mx: '10px', alignContent: 'center' }}>
                      <Typography variant="body2" style={{ fontWeight: 500 }}>
                        ( Accuracy: {locationDetails.accuracy} meters )
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box display="flex" justifyContent="start" mb={2} mt={1} marginInline="4px">
                  {/* <LocationOnIcon sx={{ color: 'rgba(52, 174, 11, 0.95)' }} /> */}
                  <Typography variant="body2" color="text.secondary" sx={{ marginLeft: '8px' }}>
                    {currentAddress || "Fetching location..."}
                  </Typography>
                </Box>
                {fakeAddress &&
                <>
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOnIcon sx={{ color: 'error.main', mr: 1 }} />
                    <Typography variant="body1" fontWeight={500}>
                      Dummy address
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="start" mb={2} mt={1} marginInline="4px">
                    {/* <LocationOnIcon sx={{ color: 'rgba(174, 11, 11, 0.95)' }} /> */}
                    <Typography variant="body2" color="text.secondary" sx={{ marginLeft: '8px' }}>
                      {fakeAddress || "Fetching location..."}
                    </Typography>
                  </Box>
                </>
                }
              </Box>

              {/* Privacy Protection Toggle */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: isMobile ? 1 : 2, 
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.05)'
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" >
                  <Box display="flex" alignItems="center">
                    <SecurityIcon sx={{ color: 'warning.main', mr: 2 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        Protect Location Privacy
                      </Typography>
                      <Typography variant="caption" color="text.secondary"> {/* approximate */}
                        Show Dummy location within 500m radius
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={protectLocation}
                    onChange={toggleLocationPrivacy}
                    color="primary"
                  />
                </Box>
              </Paper>
            </CardContent>
          </Card>

          
        </Box>
      </Fade>
    );

    const renderMediaStep = () => (
      <Fade in timeout={300}>
        <Box>
          {/* Image Generation Section */}
          <Card 
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(233, 30, 99, 0.05) 100%)',
              borderRadius: 3,
              border: '1px solid rgba(156, 39, 176, 0.1)',
              mb: 3, '& .MuiCardContent-root': { padding: '1rem', },
            }}
          >
            <CardContent >
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <AutoAwesomeIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  AI Image Generation
                </Typography>
              </Box>

              <TextField
                label="Post Title"
                fullWidth
                error={!!validationErrors.title}
                helperText={validationErrors.title}
                value={formData.title} required
                onChange={(e) => {
                  const maxLength = 100; // Set character limit
                  if (e.target.value.length <= maxLength) {
                    setFormData({ ...formData, title: e.target.value });
                    // Clear error when typing
                    if (validationErrors.title) {
                      setValidationErrors(prev => ({ ...prev, title: undefined }));
                      setStepsWithErrors(prev => prev.filter(step => step !== 1));
                    }
                  }
                }}
                inputProps={{ maxLength: 100 }} // Ensures no more than 100 characters can be typed
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                placeholder="Enter a descriptive title for better image generation"
              />

              <Box display="flex" justifyContent="center" alignItems="center" gap={2} mb={2}>
                <Typography variant="caption" color="text.secondary">
                  AI will generate relevant images based on your title
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={() => fetchUnsplashImages(formData.title)}
                  disabled={loadingGeneration || !formData.title}
                  sx={{ borderRadius: 2, px: isMobile ? '24px' : 'null'  }}
                >
                  Generate Images
                </Button>
              </Box>

              {loadingGeneration && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress sx={{ borderRadius: 1, height: 6 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Generating amazing images for you...
                  </Typography>
                </Box>
              )}

              {generatedImages.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                  {/* {[1, 2, 3, 4].map((img) => ( */}
                    <Paper
                      // key={img}
                      elevation={0}
                      sx={{
                        minWidth: 120,
                        // height: 120,
                        // borderRadius: 2,
                        overflow: 'hidden',
                        cursor: 'pointer', 
                        bgcolor: 'rgba(0,0,0,0)',
                        position: 'relative',
                        // '&:hover': { transform: 'scale(1.02)' },
                        // transition: 'transform 0.2s'
                      }}
                    >
                      <Box
                        sx={{
                          // height: '100%',
                          // bgcolor: `( 70%, 85%)`,
                          // alignItems: 'center',
                          // justifyContent: 'center',
                          display: "flex", gap: "4px", paddingBottom: '0px', overflowX: "auto", 
                        }}
                      >
                        {/* <PhotoCameraIcon sx={{ fontSize: 32, color: 'white' }} /> */}
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
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  bgcolor: 'success.main',
                                  borderRadius: '50%',
                                  width: 24,
                                  height: 24,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <CheckIcon sx={{ fontSize: 16, color: 'white' }} />
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Box>
                      {/* {addedImages.includes(img) && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'success.main',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <CheckIcon sx={{ fontSize: 16, color: 'white' }} />
                        </Box>
                      )} */}
                    </Paper>
                  {/* ))} */}
                </Box>
                )  : noImagesFound ? (
                  <Box sx={{ textAlign: 'center', my: 2 }}>
                    <Typography color="warning" sx={{ mb: 2 }}>Images doesn't found related to the title, please check the title.</Typography>
                  </Box>
                ) : null
              }
            </CardContent>
          </Card>

          {validationErrors.media && (
            <Alert severity="error" sx={{ my: 1 }}>
              {validationErrors.media}
            </Alert>
          )}

          {/* Photo Upload Section */}
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <PhotoCameraIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  Upload Photos
                </Typography>
              </Box>

              <Button
                variant="outlined"
                component="label"
                startIcon={<AddPhotoAlternateRoundedIcon />}
                sx={{ borderRadius: 2, mb: 2, bgcolor: 'rgba(24, 170, 248, 0.07)'}}
                fullWidth={isMobile} 
                // variant="text"
    //                 component="label" size="small"
                    // sx={{ my: 1, borderRadius: "8px", textTransform: "none", bgcolor: 'rgba(24, 170, 248, 0.07)' }}
                                  
              >
                Choose Photos
                <input type="file" multiple hidden onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg, image/webp" />
              </Button>
              {mediaError && <Alert severity="error">{mediaError}</Alert>}

              <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                Maximum 5 photos allowed. Supported formats: PNG, JPG, JPEG, WebP
              </Typography>
              {/* <PhotoCameraIcon sx={{ color: 'white' }} /> */}
              {newMedia.length > 0 && (
                <Box sx={{ display: 'flex', gap: '4px', p:'6px', borderRadius: '12px', overflowX: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#888 transparent', bgcolor:'#f5f5f5' }}>
                  {newMedia.map((file, index) => (
                    <Box key={index} style={{ display: 'flex', position: 'relative', alignItems: 'flex-start', flexDirection: 'column' }}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        style={{
                          height: '120px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          flexShrink: 0,
                          cursor: 'pointer' // Make the image look clickable
                        }}
                      />
                      <IconButton
                        size="small" onClick={() => handleRemoveNewMedia(index)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      {/* <Button size="small" color="secondary" onClick={() => handleRemoveNewMedia(index)}>Remove</Button> */}
                    </Box>
                  ))}
                </Box>
              )}

              {editingProduct &&
                <Box sx={{ mt: 1, p: '6px', bgcolor: '#f5f5f5', borderRadius: '12px'}} >
                  {/* Existing media with delete option */}
                  <Typography variant="subtitle1">Images previously posted</Typography>
                  <Box sx={{ display: 'flex', borderRadius: '8px', gap: '4px', overflowX: 'scroll', scrollbarWidth: 'thin', scrollbarColor: '#888 transparent' }}>
                    {loadingMedia ?
                      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="row" m={2} gap={1} flex={1}>
                        <CircularProgress size={24} />
                        <Typography color='grey' variant='body2'>Loading Images previously posted</Typography>
                      </Box>
                      :
                      (existingMedia.length > 0)
                        ? existingMedia.map((media) => (
                          !media.remove && (
                            <Box key={media._id} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                              <img src={`data:image/jpeg;base64,${media.data}`} alt="Post Media" style={{ height: '120px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }} />
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteMedia(media._id)}
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  bgcolor: 'error.main',
                                  color: 'white',
                                  '&:hover': { bgcolor: 'error.dark' }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                              {/* <Button size="small" color="secondary" onClick={() => handleDeleteMedia(media._id)}>Remove</Button> */}
                            </Box>
                          )))
                        : (
                          <Box display="flex" justifyContent="center" alignItems="center" flexDirection="row" m={1} gap={1} flex={1}>
                            <Typography variant="body2" color="grey" >Post doesn't have existing images.</Typography>
                          </Box>
                        )
                    }
                  </Box>
                </Box>
              }
            </CardContent>
          </Card>
        </Box>
      </Fade>
    );

    const renderServiceDetailsStep = () => (
      <Fade in timeout={300}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* {Object.keys(validationErrors).some(key => 
            ['categories', 'gender', 'peopleCount', 'serviceDays', 'price', 'serviceDate', 'serviceTime'].includes(key)
          ) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Please fill all required fields marked with *
            </Alert>
          )} */}
          {/* Service Category */}
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <CategoryIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  Service Category
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.categories}
                    required
                    error={!!validationErrors.categories}
                    onChange={(e) => {
                      const value = e.target.value;

                      // Set form data
                      setFormData({ ...formData, categories: value });

                      // Clear validation error if any
                      if (validationErrors.categories) {
                        setValidationErrors(prev => ({ ...prev, categories: undefined }));
                        setStepsWithErrors(prev => prev.filter(step => step !== 2));
                      }
                    }}
                    label="Category"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="Paid">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PaidIcon />
                        Paid Service
                      </Box>
                    </MenuItem>
                    <MenuItem value="UnPaid">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FreeIcon />
                        Free Service
                      </Box>
                    </MenuItem>
                    <MenuItem value="Emergency">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmergencyRoundedIcon />
                        Emergency Service
                      </Box>
                    </MenuItem>
                    {/* <MenuItem value="Parking">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ParkingIcon />
                        Parking Space Service
                      </Box>
                    </MenuItem>
                    <MenuItem value="CarBikeRentals">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RentalIcon />
                        Car/Bike Rental Service
                      </Box>
                    </MenuItem> */}
                  </Select>
                  {validationErrors.categories && (
                    <FormHelperText error>{validationErrors.categories}</FormHelperText>
                  )}
                </FormControl>

                {editingProduct && (
                  <FormControl fullWidth required>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.postStatus}
                      onChange={(e) => setFormData({ ...formData, postStatus: e.target.value })}
                      label="Status" required
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="Active">
                        <Chip label="Active" color="success" size="small" sx={{ mr: 1 }} />
                        Active
                      </MenuItem>
                      <MenuItem value="InActive">
                        <Chip label="Inactive" color="warning" size="small" sx={{ mr: 1 }} />
                        Inactive
                      </MenuItem>
                      <MenuItem value="Closed">
                        <Chip label="Closed" color="error" size="small" sx={{ mr: 1 }} />
                        Closed
                      </MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Box>

              {formData.categories === 'Paid' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={500}>
                      Full-time position?
                    </Typography>
                    <Switch
                      checked={formData.isFullTime}
                      onChange={toggleIsFullTime}
                      color="primary"
                    />
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Pricing & Requirements */}
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CurrencyRupeeIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  Pricing & Requirements
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 2 }}>
                {formData.categories !== 'UnPaid' && (
                  <TextField
                    label="Service Price (₹)"
                    type="number"
                    fullWidth
                    error={!!validationErrors.price}
                    helperText={validationErrors.price}
                    value={formData.price}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Remove any invalid characters like "-", "+", or ","
                      value = value.replace(/[-+,]/g, '');
    
                      // Allow only numbers with up to two decimal places
                      if (/^\d*\.?\d{0,2}$/.test(value)) {
                        const num = Number(value);
    
                        // Ensure the value is within range (0 to 100,00,00,000)
                        if (num >= 0 && num <= 1000000000) {
                          setFormData({ ...formData, price: value });
                        }
                      }
                      // Clear error when typing
                      if (validationErrors.price) {
                        setValidationErrors(prev => ({ ...prev, price: undefined }));
                        setStepsWithErrors(prev => prev.filter(step => step !== 2));
                      }
                    }}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                      startAdornment: <CurrencyRupeeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                )}

                <FormControl fullWidth required>
                  <InputLabel>Preferred gender for this position</InputLabel>
                  <Select
                    value={formData.gender}
                    error={!!validationErrors.gender}
                    onChange={(e) => {
                      const value = e.target.value;

                      // Set form data
                      setFormData({ ...formData, gender: value });

                      // Clear validation error if any
                      if (validationErrors.gender) {
                        setValidationErrors(prev => ({ ...prev, gender: undefined }));
                        setStepsWithErrors(prev => prev.filter(step => step !== 2));
                      }
                    }}
                    label="Preferred gender for this position"
                    sx={{ borderRadius: 2 }} required
                  >
                    <MenuItem value="Male">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MaleIcon />
                        Male
                      </Box>
                    </MenuItem>
                    <MenuItem value="Female">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FemaleIcon />
                        Female
                      </Box>
                    </MenuItem>
                    <MenuItem value="Kids">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <KidsIcon />
                        Kids
                      </Box>
                    </MenuItem>
                    <MenuItem value="Everyone">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EveryoneIcon />
                        Everyone
                      </Box>
                    </MenuItem>
                  </Select>
                  {validationErrors.gender && (
                    <FormHelperText error>{validationErrors.gender}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                <TextField
                  label="People Count" required
                  type="number"
                  fullWidth
                  error={!!validationErrors.peopleCount}
                  helperText={validationErrors.peopleCount}
                  value={formData.peopleCount}
                  onChange={(e) => {
                    let value = e.target.value;
    
                    // Remove any non-numeric characters except empty string (allow backspacing)
                    value = value.replace(/[^0-9]/g, '');
    
                    // Convert to a number if it's not empty
                    if (value === '' || (Number(value) <= 10000)) {
                      setFormData({ ...formData, peopleCount: value });
                    }

                    // Clear error when typing
                    if (validationErrors.peopleCount) {
                      setValidationErrors(prev => ({ ...prev, peopleCount: undefined }));
                      setStepsWithErrors(prev => prev.filter(step => step !== 2));
                    }

                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} /> , min: 1, max: 10000, step: 1,
                  }}
                />

                <TextField
                  label="Service Days"
                  type="number"
                  fullWidth required
                  error={!!validationErrors.serviceDays}
                  helperText={validationErrors.serviceDays}
                  value={formData.serviceDays}
                  onChange={(e) => {
                    let value = e.target.value;
    
                    // Remove any non-numeric characters except empty string (allow backspacing)
                    value = value.replace(/[^0-9]/g, '');
    
                    // Convert to a number if it's not empty
                    if (value === '' || (Number(value) <= 365)) {
                      setFormData({ ...formData, serviceDays: value });
                    }
                    // Clear error when typing
                    if (validationErrors.serviceDays) {
                      setValidationErrors(prev => ({ ...prev, serviceDays: undefined }));
                      setStepsWithErrors(prev => prev.filter(step => step !== 2));
                    }
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />, min: 1, max: 365, step: 1,
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  Schedule & Timing
                </Typography>
              </Box>

              {/* <TextField
                type="date"
                label="Service Date"
                fullWidth
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputLabelProps={{ shrink: true }}
              /> */}

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Service Date" sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 5, } }}
                  value={selectedDate} format="dd MM yyyy" // Formats date as "14 03 2025"
                  onChange={handleDateChange}
                  slotProps={{
                    textField: { fullWidth: true, sx: { mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </LocalizationProvider>

              <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                {/* <TextField
                  type="time"
                  label="Start Time"
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="time"
                  label="End Time"
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputLabelProps={{ shrink: true }}
                /> */}
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    label="Start Time" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem', } }}
                    value={timeFrom}
                    onChange={handleTimeFromChange}
                    slotProps={{
                      textField: { fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
                    }}
                  />
                </LocalizationProvider>
                
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    label="End Time" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem', } }}
                    value={timeTo}
                    onChange={handleTimeToChange}
                    slotProps={{
                      textField: { fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </CardContent>
          </Card>
          
        </Box>
      </Fade>
    );

    const renderScheduleStep = () => (
      <Fade in timeout={300}>
        <Box>
          {/* Description */}
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <DescriptionIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  Service Description
                </Typography>
              </Box>

              <TextField
                multiline
                rows={4}
                fullWidth
                error={!!validationErrors.description}
                helperText={validationErrors.description}
                label="Describe your service in detail"
                value={formData.description}
                onChange={(e) => {
                  const maxLength = 1000; // Set character limit
                  if (e.target.value.length <= maxLength) {
                    setFormData({ ...formData, description: e.target.value });
                  }
                  // Clear error when typing
                  if (validationErrors.description) {
                    setValidationErrors(prev => ({ ...prev, description: undefined }));
                    setStepsWithErrors(prev => prev.filter(step => step !== 3));
                  }
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                placeholder="Provide detailed information about your service, requirements, and what customers can expect..."
                inputProps={{ maxLength: 1000 }} // Ensures no more than 100 characters can be typed
                required
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {formData.description.length}/1000 characters
              </Typography>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card 
            elevation={0}
            sx={{
              mt: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(139, 195, 74, 0.05) 100%)',
              border: '1px solid rgba(76, 175, 80, 0.2)'
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2} color="success.main">
                Service Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Title:</strong> {formData.title || 'Not specified'}
                </Typography>
                <Typography variant="body2">
                  <strong>Category:</strong> {formData.categories || 'Not selected'}
                </Typography>
                {formData.price && (
                  <Typography variant="body2">
                    <strong>Price:</strong> ₹{formData.price}
                  </Typography>
                )}
                <Typography variant="body2">
                  <strong>Target Gender:</strong> {formData.gender || 'Not specified'}
                </Typography>
                <Typography variant="body2">
                  <strong>People Count:</strong> {formData.peopleCount || 'Not specified'}
                </Typography>
                <Typography variant="body2">
                  <strong>Service Days:</strong> {formData.serviceDays || 'Not specified'}
                </Typography>
                <Typography variant="body2">
                  <strong>Service Date on:</strong> {new Date(selectedDate).toLocaleDateString() || 'Not specified'} <strong>Time From To:</strong> {new Date(timeFrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(timeTo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Not specified'}
                </Typography>
                <Typography variant="body2">
                  <strong>Post Address:</strong> {fakeAddress || currentAddress || 'Loading location...'}
                </Typography>
                <Typography variant="body2" style={{
                  whiteSpace: "pre-wrap", // Retain line breaks and tabs
                  wordWrap: "break-word", }}
                >
                  <strong>Description:</strong> {formData.description || 'Not specified'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                 (Note: Post addresses may be inaccurate.)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Fade>
    );

    const getStepContent = (step) => {
      switch (step) {
        case 0:
          return renderLocationStep();
        case 1:
          return renderMediaStep();
        case 2:
          return renderServiceDetailsStep();
        case 3:
          return renderScheduleStep();
        default:
          return null;
      }
    };

  return (
    
    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth fullScreen={isMobile ? true : false}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 4,
          // background: darkMode ? 'null' : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          // minHeight: isMobile ? '80vh' : '80vh', 
          // m: isMobile ? '14px' : '0px',
          ...getGlassmorphismStyle(theme, darkMode),
        }
      }}
      sx={{'& .MuiDialogTitle-root': { padding: isMobile ? '1rem' : '1rem', },
      // margin: '10px',
      //   '& .MuiPaper-root': { // Target the dialog paper
      //     borderRadius: '16px', // Apply border radius
      //     scrollbarWidth: 'thin', scrollbarColor: '#aaa transparent',
      //   }, '& .MuiDialogContent-root': {
      //     margin: isMobile ? '0rem' : '1rem', padding: isMobile ? '8px' : '0rem',
      //   }, '& .MuiDialogActions-root': {
      //     margin: isMobile ? '1rem' : '1rem',
      //   },
      }}
    >
      <DialogTitle
        component="div"  // <-- avoid rendering an <h2>
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
          color: 'white',
          position: 'relative',
          // pb: 1,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          {editingProduct ? 'Update Service Post' : 'Create New Service Post'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          {editingProduct ? 'Modify your existing service details' : 'Share your service with the community'}
        </Typography>

        <IconButton
          onClick={handleCloseDialog}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      

      <DialogContent sx={{ px: 2, py: 3, minHeight: '200px' }}>
        <Box sx={{ px: isMobile ? 1 : 3, pt: 2, pb: 1, mx: '-1rem' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label} completed={activeStep > index} error={stepHasError(index)}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      '&.Mui-active': {
                        color: 'primary.main'
                      },
                      '&.Mui-completed': {
                        color: stepHasError(index) ? 'error.main' : 'success.main'
                      },
                      '&.Mui-error': {
                        color: 'error.main'
                      }
                    }
                  }}
                >
                  <Typography variant="caption" fontWeight={500}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        <Divider sx={{mb:'2rem', mx: '-1rem'}}/>

        {getStepContent(activeStep)}
      </DialogContent>

      <Divider />
      {submitError && <Alert severity="error" style={{ margin: '1rem' }}>{submitError}</Alert>}
      <DialogActions sx={{ px: isMobile ? 2 : 3, py: 2, gap: 2 }}>
        <Button
          onClick={handleCloseDialog}
          variant="outlined"
          sx={{ borderRadius: 2 }}
          disabled={loading}
        >
          Cancel
        </Button>

        <Box sx={{ flex: 1 }} />

        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            variant="outlined"
            sx={{ borderRadius: 2 }}
            disabled={loading}
          >
            Back
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            sx={{ borderRadius: 2, minWidth: 100 }}
            disabled={loading}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ 
              borderRadius: 2, px: isMobile ? '3rem' : '8px',
              minWidth: 120,
              background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #388e3c 0%, #689f38 100%)'
              }
            }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {loading ? 'Publishing...' : (editingProduct ? 'Update Post' : 'Publish Post')}
          </Button>
        )}
      </DialogActions>
    </Dialog>

    // <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth fullScreen={isMobile ? true : false} sx={{
    //   margin: '10px',
    //   '& .MuiPaper-root': { // Target the dialog paper
    //     borderRadius: '16px', // Apply border radius
    //     scrollbarWidth: 'thin', scrollbarColor: '#aaa transparent',
    //   }, '& .MuiDialogContent-root': {
    //     margin: isMobile ? '0rem' : '1rem', padding: isMobile ? '8px' : '0rem',
    //   }, '& .MuiDialogActions-root': {
    //     margin: isMobile ? '1rem' : '1rem',
    //   },
    // }}>
    //   <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
    //     <DialogTitle>{editingProduct ? "Edit Post" : "Add Post"}
    //       <IconButton
    //         onClick={handleCloseDialog}
    //         style={{
    //           position: 'absolute',
    //           top: '12px',
    //           right: '12px',
    //           // backgroundColor: 'rgba(0, 0, 0, 0.1)',
    //           // color: '#333'
    //         }}
    //       >
    //         <CloseIcon />
    //       </IconButton>
    //     </DialogTitle>
    //     <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0rem' }}>
    //       <Box sx={{ paddingBottom: isMobile ? '8rem' : '8rem', marginBottom: '0rem', borderRadius: 3, bgcolor: 'rgba(0, 0, 0, 0.07)' }}>
    //         {/* {locationDetails && (
    //                     <Box sx={{ margin: '1rem' }}>
    //                       <Typography variant="h6" gutterBottom>
    //                         Current Location Details
    //                       </Typography>
    //                       <Grid container spacing={2}>
    //                         <Grid item xs={6} sm={4}>
    //                           <Typography variant="body1" style={{ fontWeight: 500 }}>
    //                             IP Address:
    //                           </Typography>
    //                           <Typography variant="body2" color="textSecondary">
    //                             {locationDetails.ip}
    //                           </Typography>
    //                         </Grid>
    //                         <Grid item xs={6} sm={4}>
    //                           <Typography variant="body1" style={{ fontWeight: 500 }}>
    //                             Street:
    //                           </Typography>
    //                           <Typography variant="body2" color="textSecondary">
    //                             {locationDetails.street}
    //                           </Typography>
    //                         </Grid>
    //                         <Grid item xs={6} sm={4}>
    //                           <Typography variant="body1" style={{ fontWeight: 500 }}>
    //                             Area:
    //                           </Typography>
    //                           <Typography variant="body2" color="textSecondary">
    //                             {locationDetails.area}
    //                           </Typography>
    //                         </Grid>
    //                         <Grid item xs={6} sm={4}>
    //                           <Typography variant="body1" style={{ fontWeight: 500 }}>
    //                             City:
    //                           </Typography>
    //                           <Typography variant="body2" color="textSecondary">
    //                             {locationDetails.city}
    //                           </Typography>
    //                         </Grid>
    //                         <Grid item xs={6} sm={4}>
    //                           <Typography variant="body1" style={{ fontWeight: 500 }}>
    //                             State:
    //                           </Typography>
    //                           <Typography variant="body2" color="textSecondary">
    //                             {locationDetails.state}
    //                           </Typography>
    //                         </Grid>
    //                         <Grid item xs={6} sm={4}>
    //                           <Typography variant="body1" style={{ fontWeight: 500 }}>
    //                             Nation:
    //                           </Typography>
    //                           <Typography variant="body2" color="textSecondary">
    //                             {locationDetails.nation}
    //                           </Typography>
    //                         </Grid>
    //                         <Grid item xs={6} sm={4}>
    //                           <Typography variant="body1" style={{ fontWeight: 500 }}>
    //                             Pincode:
    //                           </Typography>
    //                           <Typography variant="body2" color="textSecondary">
    //                             {locationDetails.pincode}
    //                           </Typography>
    //                         </Grid>
    //                         <Grid item xs={6} sm={4}>
    //                           <Typography variant="body1" style={{ fontWeight: 500 }}>
    //                             Latitude:
    //                           </Typography>
    //                           <Typography variant="body2" color="textSecondary">
    //                             {locationDetails.latitude}
    //                           </Typography>
    //                         </Grid>
    //                         <Grid item xs={6} sm={4}>
    //                           <Typography variant="body1" style={{ fontWeight: 500 }}>
    //                             Longitude:
    //                           </Typography>
    //                           <Typography variant="body2" color="textSecondary">
    //                             {locationDetails.longitude}
    //                           </Typography>
    //                         </Grid>
    //                         <Grid item xs={6} sm={4}>
    //                           <Typography variant="body1" style={{ fontWeight: 500 }}>
    //                             Accuracy (meters):
    //                           </Typography>
    //                           <Typography variant="body2" color="textSecondary">
    //                             {locationDetails.accuracy}
    //                           </Typography>
    //                         </Grid>
    //                       </Grid>
    //                     </Box>
    //                   )} */}
    //         {/* <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
    //                     lat, lng: {formData.latitude} {formData.longitude}
    //                   </Typography> */}
    //         {editingProduct && (
    //           <Box display="flex" justifyContent="start" mb={1} mt={1} marginInline="4px">
    //             <LocationOnIcon color='primary' />
    //             <Typography variant="body1" sx={{ marginLeft: '8px', color: 'grey' }}>
    //               <strong>Post Previous address :</strong> {formData.address || "Address doesn't found"}
    //             </Typography>
    //           </Box>
    //         )}
    //         <Box display="flex" justifyContent="start" mb={2} mt={1} marginInline="4px">
    //           <LocationOnIcon sx={{ color: 'rgba(52, 174, 11, 0.95)' }} />
    //           <Typography variant="body1" sx={{ marginLeft: '8px', color: 'grey' }}>
    //             <strong>Your current address :</strong> {currentAddress || "Fetching location..."}
    //           </Typography>
    //         </Box>
    //         {fakeAddress &&
    //           <Box display="flex" justifyContent="start" mb={2} mt={1} marginInline="4px">
    //             <LocationOnIcon sx={{ color: 'rgba(174, 11, 11, 0.95)' }} />
    //             <Typography variant="body1" sx={{ marginLeft: '8px', color: 'grey' }}>
    //               <strong>Protected address :</strong> {fakeAddress || "Fetching location..."}
    //             </Typography>
    //           </Box>
    //         }
    //         <Box sx={{ height: '300px', marginTop: '1rem', paddingInline: '6px' }}>
    //           <MapContainer
    //             center={formData.latitude ? [formData.latitude, formData.longitude] : protectLocation ? [finalLocation.latitude, finalLocation.longitude] : [currentLocation.latitude, currentLocation.longitude]}
    //             zoom={13}
    //             style={{ height: '100%', width: '100%', borderRadius: '8px', }}
    //             attributionControl={false}  // Disables the watermark
    //             maxBounds={worldBounds} // Restrict the map to the world bounds
    //             maxBoundsViscosity={1.0} // Prevents the map from being dragged outside the bounds
    //           >
    //             <ChangeView center={formData.latitude ? [formData.latitude, formData.longitude] : protectLocation ? [finalLocation.latitude, finalLocation.longitude] : [currentLocation.latitude, currentLocation.longitude]} />
    //             <TileLayer
    //               url={mapMode === 'normal'
    //                 ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    //                 : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'}
    //               noWrap={true} // Disable infinite wrapping
    //             />
    //             {/* Labels and Roads Layer (Overlay) */}
    //             {mapMode === 'satellite' && (
    //               <TileLayer
    //                 url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
    //                 opacity={1} // Make it semi-transparent if needed
    //               />
    //             )}
    //             {/* <Marker position={[userData.location.latitude, userData.location.longitude]} icon={customIcon}
    //                       >
    //                         <Popup>User Location</Popup>
    //                       </Marker> */}
    //             {/* {currentLocation && ( */}
    //             {formData.latitude && (
    //               <Marker position={[formData.latitude, formData.longitude]} icon={customIcon} >
    //                 <Popup>Post Previous Location</Popup>
    //               </Marker>
    //             )}
    //             <>
    //               <Marker position={[currentLocation.latitude, currentLocation.longitude]} icon={userLocationIcon}>
    //                 {/* <Popup>Your Current Location</Popup> */}
    //                 <Popup>
    //                   {protectLocation
    //                     ? "Your exact location (hidden from others)"
    //                     : "Your exact location"}
    //                 </Popup>
    //               </Marker>
    //               {protectLocation &&
    //                 <Circle
    //                   center={[currentLocation.latitude, currentLocation.longitude]}
    //                   radius={500}
    //                   color="#ff0000"
    //                   fillColor="#ff0000"
    //                   fillOpacity={0.2}
    //                 />
    //               }
    //             </>
    //             {/* Show both locations if privacy is enabled */}
    //             {/* {protectLocation && (
    //                           <>
    //                             <Marker 
    //                               position={[currentLocation.latitude, currentLocation.longitude]} 
    //                               icon={userLocationIcon}
    //                             >
    //                               <Popup>Your exact location (hidden from others)</Popup>
    //                             </Marker>
    //                             <Circle
    //                               center={[currentLocation.latitude, currentLocation.longitude]}
    //                               radius={500}
    //                               color="#ff0000"
    //                               fillColor="#ff0000"
    //                               fillOpacity={0.2}
    //                             />
    //                           </>
    //                         )} */}
    //             {/* Show the post location (either exact or protected) */}
    //             {protectLocation &&
    //               <Marker
    //                 position={[finalLocation.latitude, finalLocation.longitude]}
    //                 icon={userPrivacyLocationIcon}
    //               >
    //                 <Popup>
    //                   {protectLocation
    //                     ? "Protected location (within 500m radius)"
    //                     : "Exact post location"}
    //                 </Popup>
    //               </Marker>
    //             }
    //             {/* )} */}
    //           </MapContainer>
    //           <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', marginBottom: '6px' }}>
    //             <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    //               <IconButton
    //                 sx={{
    //                   fontWeight: '500', width: '60px', borderRadius: '10px',
    //                   backgroundColor: 'rgba(255, 255, 255, 0.26)',
    //                   boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', marginLeft: '0px'
    //                 }}
    //                 onClick={() => setMapMode(mapMode === 'normal' ? 'satellite' : 'normal')}
    //               // startIcon={mapMode === 'normal' ? <SatelliteAltRoundedIcon/> : <MapRoundedIcon />}
    //               >
    //                 <Tooltip title={mapMode === 'normal' ? 'Switch to Satellite View' : 'Switch to Normal View'} arrow placement="right">
    //                   <>{mapMode === 'normal' ? <MapRoundedIcon /> : <SatelliteAltRoundedIcon />}</>
    //                 </Tooltip>
    //               </IconButton>
    //               <Typography variant="caption" sx={{ mt: 0.5, textAlign: 'center', color: 'grey' }}>
    //                 {mapMode === 'normal' ? 'Normal' : 'Salellite'}
    //               </Typography>
    //             </Box>
    //             {/* {currentLocation && (
    //                         <Button
    //                           variant="contained"
    //                           onClick={saveLocation}
    //                         >
    //                           Save Location
    //                         </Button>
    //                       )} */}
    //             {locationDetails?.accuracy && (
    //               <Box sx={{ mx: '10px', alignContent: 'center' }}>
    //                 <Typography variant="body2" style={{ fontWeight: 500 }}>
    //                   Accuracy (meters): {locationDetails.accuracy}
    //                 </Typography>
    //                 {/* <Typography variant="body2" color="textSecondary">
    //                             {locationDetails.accuracy}
    //                           </Typography> */}
    //               </Box>
    //             )}
    //             <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    //               <IconButton
    //                 sx={{
    //                   fontWeight: '500', width: '60px', borderRadius: '10px',
    //                   backgroundColor: 'rgba(255, 255, 255, 0.26)',
    //                   boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', marginLeft: '0px'
    //                 }}
    //                 onClick={locateUser}
    //                 // startIcon={<LocationOnIcon />}
    //                 disabled={loadingLocation}
    //               >
    //                 <Tooltip title={loadingLocation ? 'Fetching location...' : 'Locate me on Map'} arrow placement="right">
    //                   <>{loadingLocation ? <CircularProgress size={24} /> : <MyLocationRoundedIcon />}</>
    //                 </Tooltip>
    //               </IconButton>
    //               <Typography variant="caption" sx={{ mt: 0.5, textAlign: 'center', color: 'grey' }}>
    //                 Locate Me
    //               </Typography>
    //             </Box>
    //           </Box>
    //           <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
    //             <Tooltip title="When enabled, your exact location will be hidden and shown as an approximate area">
    //               <InfoOutlinedIcon fontSize="small" color="action" />
    //             </Tooltip>
    //             <Typography variant="body2" sx={{ mx: '6px' }}>
    //               Protect my location privacy {/* (will show approximate location within 500m radius) */}
    //             </Typography>
    //             {/* <FormControlLabel
    //                         control={ */}
    //             <Switch
    //               checked={protectLocation}
    //               onChange={toggleLocationPrivacy}
    //               color="primary"
    //             />
    //             {/* }
    //                         label={
    //                           <Typography variant="body2">
    //                             Protect my location privacy (will show approximate location within 500m radius)
    //                           </Typography>
    //                         }
    //                       /> */}
    //           </Box>
    //         </Box>
    //       </Box>
    //       {editingProduct &&
    //         <Card sx={{ borderRadius: 3, marginInline: '2px', bgcolor: '#f5f5f5' }}>
    //           {/* Existing media with delete option */}
    //           <Box style={{ marginBottom: '10px', marginInline: '6px' }}>
    //             <Typography ml={1} variant="subtitle1">Existing Images</Typography>
    //             <Box style={{ display: 'flex', gap: '4px', overflowX: 'scroll', scrollbarWidth: 'none', scrollbarColor: '#888 transparent' }}>
    //               {loadingMedia ?
    //                 <Box display="flex" justifyContent="center" alignItems="center" flexDirection="row" m={2} gap={1} flex={1}>
    //                   <CircularProgress size={24} />
    //                   <Typography color='grey' variant='body2'>Loading Existing Post Images</Typography>
    //                 </Box>
    //                 :
    //                 (existingMedia.length > 0)
    //                   ? existingMedia.map((media) => (
    //                     !media.remove && (
    //                       <Box key={media._id} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
    //                         <img src={`data:image/jpeg;base64,${media.data}`} alt="Post Media" style={{ height: '160px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }} />
    //                         <Button size="small" color="secondary" onClick={() => handleDeleteMedia(media._id)}>Remove</Button>
    //                       </Box>
    //                     )))
    //                   : (
    //                     <Box display="flex" justifyContent="center" alignItems="center" flexDirection="row" m={1} gap={1} flex={1}>
    //                       <Typography variant="body2" color="grey" >Post doesn't have existing images.</Typography>
    //                     </Box>
    //                   )}
    //             </Box>
    //           </Box>
    //         </Card>
    //       }
    //       <Card sx={{ borderRadius: 3, marginBottom: '0rem', mx: '2px', bgcolor: '#f5f5f5' }}>
    //         <Box sx={{ mx: '6px', my: '4px' }}>
    //           <Box sx={{ mx: '6px' }}>
    //             <Typography variant="subtitle1">Add Post Photos</Typography>
    //             <Box sx={{ mx: '4px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'null' : 'center', gap: isMobile ? '2px' : '14px' }}>
    //               {/* Styled Upload Button */}
    //               <Button
    //                 variant="text"
    //                 component="label" size="small"
    //                 sx={{ my: 1, borderRadius: "8px", textTransform: "none", bgcolor: 'rgba(24, 170, 248, 0.07)' }}
    //               >
    //                 Choose Photos
    //                 <input
    //                   type="file"
    //                   multiple
    //                   hidden
    //                   accept="image/png, image/jpeg, image/jpg, image/webp"
    //                   onChange={handleFileChange}
    //                 />
    //               </Button>
    //               {/* onChange={(e) => setFormData({ ...formData, images: e.target.files })} */}
    //               <Typography variant="body2" color="grey">Note : Maximum 5 Photos allowed.</Typography>
    //             </Box>
    //             {mediaError && <Alert severity="error">{mediaError}</Alert>}
    //           </Box>
    //           {newMedia.length > 0 && (
    //             <Box sx={{ display: 'flex', gap: '4px', marginTop: '10px', mx: '4px', overflowX: 'auto', scrollbarWidth: 'none', scrollbarColor: '#888 transparent' }}>
    //               {newMedia.map((file, index) => (
    //                 <Box key={index} style={{ display: 'flex', position: 'relative', alignItems: 'flex-start', flexDirection: 'column' }}>
    //                   <img
    //                     src={URL.createObjectURL(file)}
    //                     alt={`Preview ${index}`}
    //                     style={{
    //                       height: '160px',
    //                       borderRadius: '8px',
    //                       objectFit: 'cover',
    //                       flexShrink: 0,
    //                       cursor: 'pointer' // Make the image look clickable
    //                     }}
    //                   />
    //                   <Button size="small" color="secondary" onClick={() => handleRemoveNewMedia(index)}>Remove</Button>
    //                 </Box>
    //               ))}
    //             </Box>
    //           )}
    //         </Box>
    //       </Card>
    //       <Box>
    //         {/* <TextField
    //                             label="Post Title"
    //                             fullWidth
    //                             value={formData.title}
    //                             onChange={handleTitleChange}
    //                           />
    //                           <Button onClick={() => fetchUnsplashImages(formData.title)}>Generate</Button> */}



    //         {/* Selected Images */}
    //         {/* <Box>
    //                             {newMedia.map((file, index) => (
    //                               <img key={index} src={URL.createObjectURL(file)} alt="Selected" style={{ width: "100px" }} />
    //                             ))}
    //                           </Box> */}
    //       </Box>
    //       <Card sx={{ bgcolor: '#f5f5f5', borderRadius: 3, px: '4px', py: '4px', mx: '2px', pt: '12px', pb: isMobile ? '6px' : '6px' }}>
    //         <TextField
    //           label="Post Title"
    //           fullWidth sx={{
    //             '& .MuiOutlinedInput-root': {
    //               borderRadius: '12px',
    //               bgcolor: theme.palette.background.paper,
    //             },
    //             '& .MuiInputBase-input': {
    //               // padding: '10px 14px',
    //             },
    //             //  maxWidth: 600, mx: 'auto', paddingTop: '1rem'
    //           }}
    //           value={formData.title}
    //           // onChange={(e) => setFormData({ ...formData, title: e.target.value })}
    //           onChange={(e) => {
    //             const maxLength = 100; // Set character limit
    //             if (e.target.value.length <= maxLength) {
    //               setFormData({ ...formData, title: e.target.value });
    //             }
    //           }}
    //           inputProps={{ maxLength: 100 }} // Ensures no more than 100 characters can be typed
    //           required
    //         />
    //         <Box display="flex" justifyContent="center" alignItems="center" flexDirection="row" m={1} gap={1}>
    //           <Typography variant="body2" color="grey" >*You can generate images related to Title of the post.</Typography>
    //           <Button variant="text" sx={{ borderRadius: '8px', bgcolor: 'rgba(24, 170, 248, 0.07)', px: isMobile ? '24px' : 'null' }} onClick={() => fetchUnsplashImages(formData.title)} disabled={loadingGeneration}>Generate</Button>
    //         </Box>
    //         {/* Floating Card for Generated Images */}
    //         {/* <Card sx={{ position: "relative", background: "#fff", padding: "10px", zIndex: 1000, mx:'2px' }}> */}
    //         {loadingGeneration ? (
    //           <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', p: 6, gap: '1rem' }}>
    //             <LinearProgress sx={{ width: 84, height: 4, borderRadius: 2, mt: 0 }} />
    //             <Typography color='grey' variant='body2'>Generating Images...</Typography>
    //           </Box>
    //         ) : (
    //           generatedImages.length > 0 ? (
    //             <Box sx={{ position: "relative", padding: "0px", px: isMobile ? '0px' : '4px', zIndex: 1000, mx: '2px', borderRadius: 3 }}>
    //               <Typography variant="subtitle1">Select an Image</Typography>
    //               <Box style={{ display: "flex", gap: "4px", paddingBottom: '0px', overflowX: "auto", scrollbarWidth: isMobile ? 'none' : 'thin', scrollbarColor: 'rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0)' }}>
    //                 {generatedImages.map((img) => (
    //                   <Box key={img.id} sx={{ position: "relative", cursor: "pointer" }} onClick={() => handleSelectImage(img.urls.full)}>
    //                     <img
    //                       // key={img.id}
    //                       src={img.urls.thumb}
    //                       alt="Generated"
    //                       style={{ height: "120px", borderRadius: "8px", opacity: loadingImage === img.urls.full ? 0.6 : 1 }}
    //                     // onClick={() => handleSelectImage(img.urls.full)}
    //                     />
    //                     {/* Loading progress overlay */}
    //                     {loadingImage === img.urls.full && (
    //                       <Box
    //                         sx={{
    //                           position: "absolute",
    //                           top: "50%",
    //                           left: "50%",
    //                           transform: "translate(-50%, -50%)",
    //                           bgcolor: "rgba(0, 0, 0, 0.5)",
    //                           borderRadius: "50%",
    //                           padding: "10px",
    //                           display: "flex",
    //                           justifyContent: "center",
    //                           alignItems: "center",
    //                         }}
    //                       >
    //                         <CircularProgress size={24} sx={{ color: "#fff" }} />
    //                       </Box>
    //                     )}

    //                     {/* Green tick when successfully added */}
    //                     {addedImages.includes(img.urls.full) && (
    //                       <Box
    //                         sx={{
    //                           position: "absolute",
    //                           bottom: "8px",
    //                           right: "5px",
    //                           backgroundColor: "green",
    //                           borderRadius: "50%",
    //                           width: "24px",
    //                           height: "24px",
    //                           display: "flex",
    //                           justifyContent: "center",
    //                           alignItems: "center",
    //                         }}
    //                       >
    //                         <TaskAltRoundedIcon sx={{ color: "white", fontSize: "18px" }} />
    //                       </Box>
    //                     )}
    //                   </Box>
    //                 ))}
    //               </Box>
    //             </Box>
    //           ) : noImagesFound ? (
    //             <Box sx={{ textAlign: 'center', my: 2 }}>
    //               <Typography color="warning" sx={{ mb: 2 }}>Images doesn't found related to the title, please check the title.</Typography>
    //             </Box>
    //           ) : null
    //         )}
    //         {/* </Card> */}
    //       </Card>
    //       <Box>
    //         <div style={{ display: 'flex', gap: '1rem' }}>
    //           <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem', } }} required>
    //             <InputLabel>Categories</InputLabel>
    //             <Select
    //               value={formData.categories}
    //               onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
    //               required
    //               label="Categories"
    //             >
    //               <MenuItem value="Paid">Paid Service</MenuItem>
    //               <MenuItem value="UnPaid">UnPaid Service</MenuItem>
    //               <MenuItem value="Emergency">Emergency Service</MenuItem>
    //             </Select>
    //           </FormControl>
    //           {editingProduct && (
    //             <FormControl fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem', } }}>
    //               <InputLabel>Post Status</InputLabel>
    //               <Select
    //                 value={formData.postStatus}
    //                 onChange={(e) => setFormData({ ...formData, postStatus: e.target.value })}
    //                 required
    //                 label="Post Status"
    //               >
    //                 <MenuItem value="Active">Active</MenuItem>
    //                 <MenuItem value="InActive">Inactive</MenuItem>
    //                 <MenuItem value="Closed">Closed</MenuItem>
    //               </Select>
    //             </FormControl>
    //           )}
    //         </div>
    //         {formData.categories === 'Paid' &&
    //           <Box display="flex" alignItems="center" justifyContent="center" >
    //             <Tooltip title="If this enabled, then this post showing as Full Time works.">
    //               <InfoOutlinedIcon fontSize="small" color="action" />
    //             </Tooltip>
    //             <Typography variant="body2" sx={{ mx: '6px' }}>
    //               Is this work Full Time
    //             </Typography>
    //             <Switch
    //               checked={formData.isFullTime}
    //               onChange={toggleIsFullTime}
    //               color="primary"
    //             />
    //           </Box>}
    //       </Box>
    //       <div style={{ display: 'flex', gap: '1rem' }}>
    //         {!(formData.categories === 'UnPaid') && (
    //           <TextField
    //             label="Price to the service (INR)"
    //             type="number"
    //             fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem', } }}
    //             value={formData.price}
    //             onChange={(e) => {
    //               let value = e.target.value;
    //               // Remove any invalid characters like "-", "+", or ","
    //               value = value.replace(/[-+,]/g, '');

    //               // Allow only numbers with up to two decimal places
    //               if (/^\d*\.?\d{0,2}$/.test(value)) {
    //                 const num = Number(value);

    //                 // Ensure the value is within range (0 to 10,000,000)
    //                 if (num >= 0 && num <= 10000000) {
    //                   setFormData({ ...formData, price: value });
    //                 }
    //               }
    //             }}
    //             required
    //           />
    //         )}
    //         <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem', } }} required>
    //           <InputLabel>Required Gender to service</InputLabel>
    //           <Select
    //             value={formData.gender}
    //             onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
    //             required
    //             label="Required Gender to service"
    //           >
    //             <MenuItem value="Male">Male</MenuItem>
    //             <MenuItem value="Female">Female</MenuItem>
    //             <MenuItem value="Kids">Kids</MenuItem>
    //             <MenuItem value="Everyone">Everyone</MenuItem>
    //           </Select>
    //         </FormControl>
    //       </div>
    //       <div style={{ display: 'flex', gap: '1rem' }}>
    //         {/* {formData.stockStatus === 'In Stock' && ( */}
    //         <TextField
    //           label="People Count" required
    //           type="number"
    //           fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem', } }}
    //           value={formData.peopleCount}
    //           // onChange={(e) => setFormData({ ...formData, peopleCount: e.target.value })} required
    //           onChange={(e) => {
    //             let value = e.target.value;

    //             // Remove any non-numeric characters except empty string (allow backspacing)
    //             value = value.replace(/[^0-9]/g, '');

    //             // Convert to a number if it's not empty
    //             if (value === '' || (Number(value) <= 10000)) {
    //               setFormData({ ...formData, peopleCount: value });
    //             }
    //           }}
    //           inputProps={{ min: 1, max: 10000, step: 1 }} // Ensures only valid whole numbers
    //         />
    //         {/* )} */}
    //         <TextField
    //           label="Service Days"
    //           type="number"
    //           fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem', } }}
    //           value={formData.serviceDays}
    //           // onChange={(e) => setFormData({ ...formData, serviceDays: e.target.value })}
    //           required
    //           onChange={(e) => {
    //             let value = e.target.value;

    //             // Remove any non-numeric characters except empty string (allow backspacing)
    //             value = value.replace(/[^0-9]/g, '');

    //             // Convert to a number if it's not empty
    //             if (value === '' || (Number(value) <= 10000)) {
    //               setFormData({ ...formData, serviceDays: value });
    //             }
    //           }}
    //           inputProps={{ min: 1, max: 10000, step: 1 }} // Ensures only valid whole numbers
    //         />
    //       </div>

    //       <LocalizationProvider dateAdapter={AdapterDateFns}>
    //         <DatePicker
    //           label="Service Date" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem', } }}
    //           value={selectedDate} format="dd MM yyyy" // Formats date as "14 03 2025"
    //           onChange={handleDateChange}
    //           slotProps={{
    //             textField: { fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: '1rem' } } }
    //           }}
    //         />
    //       </LocalizationProvider>

    //       <div style={{ display: 'flex', gap: '1rem' }}>
    //         <LocalizationProvider dateAdapter={AdapterDateFns}>
    //           <TimePicker
    //             label="Time From" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem', } }}
    //             value={timeFrom}
    //             onChange={handleTimeFromChange}
    //             slotProps={{
    //               textField: { fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: '1rem' } } }
    //             }}
    //           />
    //         </LocalizationProvider>
    //         <LocalizationProvider dateAdapter={AdapterDateFns}>
    //           <TimePicker
    //             label="Time To" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem', } }}
    //             value={timeTo}
    //             onChange={handleTimeToChange}
    //             slotProps={{
    //               textField: { fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: '1rem' } } }
    //             }}
    //           />
    //         </LocalizationProvider>
    //       </div>

    //       <TextField
    //         label="Description"
    //         multiline
    //         rows={6}
    //         fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem' }, '& .MuiInputBase-input': { scrollbarWidth: 'thin' } }}
    //         value={formData.description}
    //         // onChange={(e) => setFormData({ ...formData, description: e.target.value })}
    //         onChange={(e) => {
    //           const maxLength = 1000; // Set character limit
    //           if (e.target.value.length <= maxLength) {
    //             setFormData({ ...formData, description: e.target.value });
    //           }
    //         }}
    //         inputProps={{ maxLength: 1000 }} // Ensures no more than 100 characters can be typed
    //         required
    //       />


    //     </DialogContent>
    //     {submitError && <Alert severity="error" style={{ margin: '1rem' }}>{submitError}</Alert>}
    //     <DialogActions sx={{ margin: '2rem', gap: '1rem' }}>
    //       <Button onClick={handleCloseDialog} disabled={loading} variant='text' color='warning' sx={{ borderRadius: '8px' }}>Cancel</Button>
    //       <Button
    //         type="submit"
    //         variant="contained"
    //         color="primary"
    //         disabled={loading}
    //         style={loading ? { cursor: 'wait' } : {}} sx={{ borderRadius: '0.5rem' }}
    //       >
    //         {loading ? <> <CircularProgress size={20} sx={{ marginRight: '8px' }} /> {editingProduct ? 'Updating...' : 'Adding...'} </> : (editingProduct ? 'Update Post' : 'Add Post')}
    //       </Button>
    //     </DialogActions>
    //   </form>

    // </Dialog>
  );
};

export default EnhancedPostServiceDialog;