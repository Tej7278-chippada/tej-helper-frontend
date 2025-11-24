// components/UserProfile.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import { Box, Typography, Avatar, IconButton, Alert, useMediaQuery, Grid, Button, Toolbar, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, CircularProgress, Card, CardContent, Rating, TextField, Chip, InputAdornment, Slide, MenuItem, Switch, FormControl, InputLabel, Select, Menu } from '@mui/material';
import { useTheme } from '@emotion/react';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import API, { cancelIdVerification, deleteProfilePicture, fetchUserProfile, getIdVerificationStatus, submitIdVerification, updateProfilePicture, updateUserProfile } from './api/api';
import Layout from './Layout';
import SkeletonProductDetail from './SkeletonProductDetail';
// import { Marker, TileLayer } from 'leaflet';
// import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import SatelliteAltRoundedIcon from '@mui/icons-material/SatelliteAltRounded';
// import MapRoundedIcon from '@mui/icons-material/MapRounded';
// Fix for Leaflet marker icon issue
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
// import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
// import StarRoundedIcon from '@mui/icons-material/StarRounded';
// import CloseIcon from '@mui/icons-material/Close';
// import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Cropper from 'react-easy-crop';
import TermsPolicyBar from './TermsAndPolicies/TermsPolicyBar';
import ReviewsRoundedIcon from '@mui/icons-material/ReviewsRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import UserProfileDetails from './Helper/UserProfileDetails';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import GppMaybeRoundedIcon from '@mui/icons-material/GppMaybeRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import VerificationDialog from './VerificationDialog';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import Diversity2RoundedIcon from '@mui/icons-material/Diversity2Rounded';
import InterestsRoundedIcon from '@mui/icons-material/InterestsRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';


// Set default icon manually
// const customIcon = new L.Icon({
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
//   iconSize: [25, 41], // Default size
//   iconAnchor: [12, 41], // Position relative to the point
//   popupAnchor: [1, -34],
// });

// Move map when user location is updated
// const ChangeView = ({ center }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (center) {
//       map.setView(center, 13);
//     }
//   }, [center, map]);
//   return null;
// };

// Fix for default marker icon in Leaflet
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//   iconUrl: require('leaflet/dist/images/marker-icon.png'),
//   shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
// });

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


const UserProfile = ({darkMode, toggleDarkMode, unreadCount, shouldAnimate}) => {
  const { id } = useParams(); // Extract sellerId from URL
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // const [hoveredId, setHoveredId] = useState(null);
  // const [successMessage, setSuccessMessage] = useState('');
  // const [mapMode, setMapMode] = useState('normal');
  // const [currentLocation, setCurrentLocation] = useState(null);
  // const [locationDetails, setLocationDetails] = useState(null);
  // const [loadingLocation, setLoadingLocation] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  // const [savingLocation, setSavingLocation] = useState(false);
  // const [showRatings, setShowRatings] = useState(false);
  const tokenUsername = localStorage.getItem('tokenUsername');
  // const [currentAddress, setCurrentAddress] = useState('');
  // states for profile editing
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    phone: '',
    profileDescription: '',
    withYou: false,
    donate: false,
    bloodGroup: '',
  });
  const [profilePicDialog, setProfilePicDialog] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [interests, setInterests] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('not_started');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationData, setVerificationData] = useState(null);

  // Add this useEffect to fetch verification status
  // useEffect(() => {
  //   const fetchVerificationStatus = async () => {
  //     try {
  //       const response = await getIdVerificationStatus(id);
  //       // setVerificationStatus(response.data.status);
  //       // setVerificationData(response.data);
  //     } catch (error) {
  //       console.error('Error fetching verification status:', error);
  //     }
  //   };

  //   if (userData) {
  //     fetchVerificationStatus();
  //   }
  // }, [id, userData]);

  // to handle verification submission
  const handleSubmitVerification = async (formData) => {
    try {
      setVerificationLoading(true);
      const response = await submitIdVerification(id, formData);
      
      setVerificationStatus('pending_review');
      setVerificationData(prev => ( {...prev,
        attempts: response.data.attempts,
        submittedAt: response.data.submittedAt,
        documentType: response.data.documentType }));
      setVerificationDialogOpen(false);
      setSnackbar({ 
        open: true, 
        message: response.data.message, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error submitting verification:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error submitting verification', 
        severity: 'error' 
      });
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleCancelVerification = async () => {
    try {
      setVerificationLoading(true);
      const response = await cancelIdVerification(id);
      
      setVerificationStatus('not_started');
      setVerificationData(previous => ( {...previous, submittedAt: null, documentType: null }));
      setSnackbar({ 
        open: true, 
        message: response.data.message, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error cancelling verification:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error cancelling verification', 
        severity: 'error' 
      });
    } finally {
      setVerificationLoading(false);
    }
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

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await fetchUserProfile(id);
        setUserData(response.data);
        setFollowerCount(response.data.followerCount);
        setFollowingCount(response.data.followingCount);
        setVerificationStatus(response.data.status);
        setVerificationData(response.data);
        // fetchAddress(response.data.location.latitude, response.data.location.longitude);
        
      } catch (err) {
        // setError('Failed to fetch User details. Please try again later.');
        setSnackbar({ open: true, message: 'Failed to fetch User details. Please try again later.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  const handleDeleteAccount = async () => {

    try {
      const authToken = localStorage.getItem('authToken');
      await API.delete(`/api/auth/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // setSuccessMessage('Your account has been deleted successfully.');
      setSnackbar({ open: true, message: 'Your account has been deleted successfully.', severity: 'success' });
      localStorage.clear();
      navigate('/login');
    } catch (err) {
      // setError('Failed to delete account. Please try again later.');
      setSnackbar({ open: true, message: 'Failed to delete account. Please try again later.', severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  // const locateUser = async () => {
  //   if (navigator.geolocation) {
  //     setLoadingLocation(true);
  //     navigator.geolocation.getCurrentPosition(
  //       async (position) => {
  //         const { latitude, longitude } = position.coords;
  //         setCurrentLocation({ lat: latitude, lng: longitude });

  //         // Set location details manually using lat/lng
  //         // setLocationDetails({
  //         //   latitude,
  //         //   longitude,
  //         //   accuracy: position.coords.accuracy, // GPS accuracy in meters
  //         // });
  //         fetchAddress(latitude, longitude);
  //         // console.log("User's current location:", latitude, longitude);
  //         setLoadingLocation(false);
  //         // Fetch location details using an IP geolocation API
  //         // try {
  //         //   const response = await fetch(`https://ipapi.co/${latitude},${longitude}/json/`);
  //         //   const data = await response.json();
  //         //   setLocationDetails({
  //         //     ip: data.ip,
  //         //     street: data.street || 'Not available',
  //         //     area: data.area || 'Not available',
  //         //     city: data.city,
  //         //     state: data.region,
  //         //     nation: data.country_name,
  //         //     pincode: data.postal,
  //         //     accuracy: position.coords.accuracy, // GPS accuracy in meters
  //         //   });
  //           // 🌍 Fetch location details using OpenStreetMap's Nominatim API
  //         // try {
  //         //   const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
  //         //   const data = await response.json();

  //         //   setLocationDetails({
  //         //     street: data.address.road || 'Not available',
  //         //     area: data.address.neighbourhood || 'Not available',
  //         //     city: data.address.city || data.address.town || 'Not available',
  //         //     state: data.address.state || 'Not available',
  //         //     nation: data.address.country || 'Not available',
  //         //     pincode: data.address.postcode || 'Not available',
  //         //   });
  //         // } catch (err) {
  //         //   console.error('Error fetching location details:', err);
  //         //   setError('Failed to fetch location details. Please try again later.');
  //         // }
  //       },
  //       (error) => {
  //         console.error('Error getting location:', error);
  //         // setError('Failed to fetch your current location. Please enable location access.');
  //         setLoadingLocation(false);
  //         setSnackbar({ open: true, message: 'Failed to fetch your current location. Please enable the location permission or try again.', severity: 'error' });
  //       },
  //       { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // High accuracy mode
  //     );
  //   } else {
  //     console.error('Geolocation is not supported by this browser.');
  //   }
  // };

  // const saveLocation = async () => {
  //   setSavingLocation(true);
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
  //     setSavingLocation(false);
  //   } catch (err) {
  //     // setError('Failed to save location. Please try again later.');
  //     setSnackbar({ open: true, message: 'Failed to save location. Please try again later.', severity: 'error' });
  //     setSavingLocation(false);
  //   }
  // };

  // Fetch address from latitude and longitude
  // const fetchAddress = async (latitude, longitude) => {
  //   try {
  //     const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
  //     const data = await response.json();
  //     setCurrentAddress(data.display_name);
  //     console.log("address fetched");
  //   } catch (error) {
  //     console.error("Error fetching address:", error);
  //   }
  // };
  
  // if (loading || !userData) {
  //   return (
  //     <Layout>
  //       <Box sx={{margin: '8px' }}>
        // {/* <SkeletonCards /> */}
  //       <SkeletonProductDetail />
  //       </Box>
  //     </Layout>
  //   );
  // };
  // if (error) return <Alert severity="error">{error}</Alert>;

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // const [loginMessage, setLoginMessage] = useState({ open: false, message: "", severity: "info" });
  const [isRateDialogOpen, setRateDialogOpen] = useState(false);
  const handleOpenRateDialog = () => setRateDialogOpen(true);
  const handleCloseRateDialog = () => setRateDialogOpen(false);

  const handleEditProfile = () => {
    setProfileForm({
      username: userData.username,
      email: userData.email,
      phone: userData.phone || '',
      withYou: userData.withYou || false,
      donate: userData.bloodDonar?.donate || false,
      bloodGroup: userData.bloodDonar?.bloodGroup || '',
      profileDescription: userData.profileDescription || '',
      interests: userData.interests || []
    });
    setError('');
    setEditProfileOpen(true);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    try { 
      setUpdating(true);
      // Username rules:
      // - Start with a capital letter
      // - Length: 6 to 12 characters total
      // - Can include letters, numbers, @ _ -
      // - Must contain at least one number
      const usernameRegex = /^(?=.*\d)[A-Z][A-Za-z0-9@_-]{5,11}$/;

      if (!usernameRegex.test(profileForm.username)) {
        setError(
          'Username must start with a capital letter, be 6–12 characters long, contain at least one number, and can include @ _ - (spaces not allowed).'
        );
        return;
      }
      // Email validation
      if (!profileForm.email.includes('@') || !profileForm.email.endsWith('.com')) {
        setError('Invalid mail id.');
        return;
      }

      // Phone validation
      if (!profileForm.phone) {
        setError('Phone number is required.');
        return;
      }

      // Phone validation
      if (profileForm.phone.length !== 10 || !/^\d+$/.test(profileForm.phone)) {
        setError('Invalid mobile number.');
        return;
      }

      const response = await updateUserProfile(id, {
        ...profileForm,
        interests: Array.isArray(profileForm.interests) ? profileForm.interests : []
      });
      const updated = response.data.user;
      setUserData(prev => ({
        ...prev,
        username: updated.username,
        email: updated.email,
        phone: updated.phone,
        withYou: updated.withYou,
        bloodDonar: {
          donate: updated.bloodDonar?.donate ?? false,
          bloodGroup: updated.bloodDonar?.bloodGroup ?? ''
        },
        profileDescription: updated.profileDescription,
        interests: updated.interests
      }));
      localStorage.setItem('tokenUsername', updated.username);
      setEditProfileOpen(false);
      setSnackbar({ 
        open: true, 
        message: 'Profile updated successfully!', 
        severity: 'success' 
      });
      setError('');
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error updating profile', 
        severity: 'error' 
      });
    } finally {
      setUpdating(false);
    }
  };

  // Profile picture functions
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      const resizedBlob = await resizeImage(file, 2 * 1024 * 1024);
      const resizedFile = new File([resizedBlob], file.name, { type: file.type });
      setProfilePic(resizedFile);
    } else {
      setProfilePic(file);
    }
  };

  const resizeImage = (blob, maxSize) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let width = img.width;
        let height = img.height;
        const scaleFactor = Math.sqrt(maxSize / blob.size);
        width *= scaleFactor;
        height *= scaleFactor;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (resizedBlob) => resolve(resizedBlob),
          "image/jpeg",
          0.8
        );
      };
    });
  };

  const handleCropComplete = async (_, croppedAreaPixels) => {
    if (!profilePic) return;
    const canvas = document.createElement('canvas');
    const image = new Image();
    const objectURL = URL.createObjectURL(profilePic);
    image.src = objectURL;
    image.onload = () => {
      const ctx = canvas.getContext('2d');
      const { width, height } = croppedAreaPixels;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        width,
        height,
        0,
        0,
        width,
        height
      );
      canvas.toBlob((blob) => {
        if (blob) {
          setCroppedImage(URL.createObjectURL(blob));
        }
      }, 'image/jpeg', 0.8);
    };
  };

  const handleSaveProfilePic = async () => {
    try {
      setUpdating(true);
      if (!croppedImage) {
        setSnackbar({ 
          open: true, 
          message: 'Please select and crop an image first', 
          severity: 'warning' 
        });
        return;
      }

      const blob = await fetch(croppedImage).then(r => r.blob());
      const file = new File([blob], 'profile-pic.jpg', { type: 'image/jpeg' });
      
      const response = await updateProfilePicture(id, file);
      setUserData(prev => ({
        ...prev,
        profilePic: response.data.user.profilePic,
        lastProfilePicUpdate: response.data.user.lastProfilePicUpdate
      }));
      localStorage.setItem('tokenProfilePic', response.data.user.profilePic);
      setProfilePicDialog(false);
      setProfilePic(null);
      setCroppedImage(null);
      setSnackbar({ 
        open: true, 
        message: 'Profile picture updated successfully!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error updating profile picture', 
        severity: 'error' 
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProfilePic = async () => {
    try {
      setDeleting(true);
      const response = await deleteProfilePicture(id);
      setUserData(prev => ({
        ...prev,
        profilePic: null,
        lastProfilePicUpdate: response.data.user.lastProfilePicUpdate
      }));
      localStorage.setItem('tokenProfilePic', null);
      setProfilePicDialog(false);
      setSnackbar({ 
        open: true, 
        message: 'Profile picture deleted successfully!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error deleting profile picture', 
        severity: 'error' 
      });
    } finally {
      setDeleting(false);
    }
  };

  const toggleWithYou = (e) => {
    const isChecked = e.target.checked;
    setProfileForm((prev) => ({
      ...prev,
      withYou: isChecked
    }));
  };

  const toggleBloodDonate = (e) => {
    const isChecked = e.target.checked;
    setProfileForm((prev) => ({
      ...prev,
      donate: isChecked,
      // bloodGroup: isChecked ? prev.bloodGroup : '' // remove group if turned off
    }));
  };

  return (
    <Layout username={tokenUsername} darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate}>
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
      
      <Typography variant="h6" sx={{ flexGrow: 1, mx: isMobile ? '10px' : '16px', mt: 1 }} >
        User Profile
      </Typography>
      {(loading || !userData) ?
        <Box sx={{ padding: '8px' }}>
          <SkeletonProductDetail />
        </Box>
        :
        <Box sx={{
          padding: isMobile ? '8px' : '12px',
          // position: 'relative',
          // backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px', scrollbarWidth: 'thin'
        }}>
          <Box
            display="flex"
            flexDirection={isMobile ? "column" : "row"}
            gap={2} 
            // sx={{  borderRadius: '10px', padding: '6px', paddingBottom: '10px', paddingTop: '10px', ...getGlassmorphismStyle(theme, darkMode) }} // bgcolor: '#f5f5f5',
          >
            <Box sx={{
              flex: 1,
              // height: '73vh', // Fixed height relative to viewport
              overflowY: 'auto',
              // bgcolor: 'transparent', // Card background color (customizable)
              borderRadius: 3, // Card border radius (customizable)
              // boxShadow: 3, // Shadow for a modern look
              scrollbarWidth: 'thin'
            }}>
              <Box
                flex={isMobile ? "1" : "0 0 30%"}
                style={{
                  paddingRight: isMobile ? "0" : "0rem",
                  display: isMobile ? "flex" : "block",
                  justifyContent: isMobile ? "center" : "flex-start",
                  alignItems: isMobile ? "center" : "flex-start",
                }}
              >
                <Box sx={{ position: 'relative', display: 'inline-block', width: isMobile ? '160px' : '100%', objectFit: 'contain',  }}>
                  <Avatar
                    alt={userData.username}
                    src={
                      userData.profilePic
                        ? `data:image/jpeg;base64,${userData.profilePic}`
                        : 'https://placehold.co/200x200?text=No+Image'
                    }
                    sx={{ width: isMobile ? '160px' : '100%', height: isMobile ? '160px' : '100%', borderRadius: isMobile ? '50%' : '50%', cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent', // Remove tap highlight
                      WebkitTouchCallout: 'none', // Disable iOS callout
                      WebkitUserSelect: 'none', // Disable text selection
                      userSelect: 'none',
                      '&:active': {
                        transform: 'scale(0.98)', // Add press feedback instead
                        transition: 'transform 0.1s ease',
                      },
                     }} // fit-content
                    onClick={() => setProfilePicDialog(true)}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)'
                      }
                    }}
                    onClick={() => setProfilePicDialog(true)}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                </Box>
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
              // height: 'calc(100vh - 16px)', // Adjust height as needed
            }}>
              <Box flex={isMobile ? "1" : "0 0 70%"} >
                {/* <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 1, height: '32px', width: '32px' }}>
                    <AccountCircleRoundedIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="h6" >
                    Personal Details
                  </Typography>
                </Box> */}
                {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Personal Details</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleEditProfile}
                    startIcon={<EditIcon />}
                    sx={{ borderRadius: '12px', textTransform: 'none' }}
                  >
                    Edit Profile
                  </Button>
                </Box> */}
                <Grid container spacing={2}>

                  <Grid item xs={6} sm={4}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      User Name:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">
                        {userData.username}
                      </Typography>
                      {(verificationStatus === 'approved') &&
                      <Tooltip title="Verification Badge" placement="top" arrow>
                        <VerifiedRoundedIcon sx={{ fontSize: '20px', color: 'Highlight' }} />  
                      </Tooltip>}
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      User Code:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {userData.userCode}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      User Phone:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {userData?.phone}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      User Email: 
                      <Chip
                        label={userData?.emailVerified === true ? 'Verified' : 'Not Verified'} 
                        color={userData?.emailVerified === true ? 'success' : 'warning' }
                        sx={{ height: '24px', ml: 1 }} variant="outlined" size="small"
                      />
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {userData?.email}
                    </Typography>
                    
                  </Grid>
                  <Grid item xs={12} sm={12} >
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      Profile Description:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {userData?.profileDescription || 'No description added yet.'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} >
                    <Box >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <InterestsRoundedIcon fontSize="small" color="primary" />
                        <Typography variant="body1" style={{ fontWeight: 500 }} >Interests</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 4 }}>
                        {userData?.interests.map((interest, index) => (
                          <Chip
                            key={index}
                            label={interest}
                            variant="outlined" size="small" color="textSecondary"
                            sx={{ borderRadius: '12px', padding: '4px 6px' }}
                          />
                        ))}
                        {userData?.interests?.length === 0 && (
                          <Typography variant="body2" color="textSecondary">
                            No interests specified.
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Diversity2RoundedIcon fontSize="small" color="warning" />
                        <Typography variant="body1" style={{ fontWeight: 500 }} >Network</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 3, ml: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>{followerCount}</strong> Followers
                      </Typography>
                      <Typography variant="body2" color="text.secondary" >
                        <strong>{followingCount}</strong> Following
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} >
                    <Box display="flex" alignItems="center" gap={1}>
                      <VolunteerActivismIcon color="success" fontSize="small" />
                      <Typography variant="body1" style={{ fontWeight: 500 }}>
                        Standing with Women Safety
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {userData?.withYou === true
                        ? 'You are supporting women’s safety — Great!'
                        : userData?.withYou === false
                        ? 'You can enable this anytime.'
                        : `You haven't set this preference yet.`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" marginTop={4}>
                      *Your profile will be visible to women nearby who may need help in unsafe situations.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} >
                    <Box display="flex" alignItems="center" gap={1}>
                      <BloodtypeIcon color="error" fontSize="small" />
                      <Typography variant="body1" fontWeight={500}>
                        Blood Donation Status
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {userData?.bloodDonar?.donate === true
                        ? userData?.bloodDonar?.bloodGroup === "Unknown"
                          ? "You’re a blood donor — thank you! (Blood group not specified)"
                          : `You’re a blood donor — thank you! (${userData?.bloodDonar?.bloodGroup})`
                        : userData?.bloodDonar?.donate === false
                        ? "You haven’t enabled blood donation."
                        : "You haven’t set this preference yet."}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" marginTop={4}>
                      *If you choose to donate, your blood group will be visible to nearby people who may need emergency blood support.
                    </Typography>
                  </Grid>
                  {/* <Grid item xs={6} sm={4}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      Account Status:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {userData?.accountStatus}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      Email Verified:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {userData?.emailVerified === true ? 'Yes' : 'No'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                     Account created at:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(userData?.accountCreatedAt).toLocaleString() || 'Invalid date'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                     Last login at:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(userData?.lastLoginAt).toLocaleString() || 'Invalid date'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                     lastProfilePicUpdate:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(userData?.lastProfilePicUpdate).toLocaleString() || 'Invalid date'}
                    </Typography>
                  </Grid> */}
                  {/* <Grid item xs={12} sm={12}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      Address:
                    </Typography>
                    {userData.address && (
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                    {`${userData.address.street}, ${userData.address.area}, ${userData.address.city}, ${userData.address.state} - ${userData.address.pincode}`}
                    </Typography>
                    )}
                  </Grid> */}
                </Grid>
              </Box>

              {/* <Box sx={{ my: 1, padding: '1rem', borderRadius: 3, ...getGlassmorphismStyle(theme, darkMode) }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Diversity2RoundedIcon fontSize="small" color="primary" />
                    <Typography variant="h6" >Network</Typography>
                  </Box>
                </Box>

                Follow stats
                <Box sx={{ display: 'flex', gap: 3, ml: 4 }}>
                  <Typography variant="body2">
                    <strong>{followerCount}</strong> Followers
                  </Typography>
                  <Typography variant="body2">
                    <strong>{followingCount}</strong> Following
                  </Typography>
                </Box>
              </Box> */}

              {/* Interests Section */}
              {/* {userData?.interests && userData.interests.length > 0 && (
                <Box sx={{ my: 1, padding: '1rem', borderRadius: 3, ...getGlassmorphismStyle(theme, darkMode) }}>
                  <Typography variant="h6" gutterBottom>Interests</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {userData.interests.map((interest, index) => (
                      <Chip
                        key={index}
                        label={interest}
                        variant="outlined"
                        sx={{ borderRadius: '8px' }}
                      />
                    ))}
                  </Box>
                </Box>
              )} */}

              {/* <Box sx={{pt: 2}}>
                <Toolbar sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  // bgcolor: 'white', 
                  borderRadius: '16px',
                  boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  justifyContent: 'right',
                  // marginTop: '1rem',
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flex: 1, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button variant="outlined" size="small" sx={{borderRadius:'12px', padding: '4px 12px'}} onClick={handleOpenRateDialog}>
                        Profile Ratings
                      </Button>
                    </Box>
                    <IconButton
                      onClick={handleOpenDeleteDialog}
                      onMouseEnter={() => setHoveredId(userData._id)} // Set hoveredId to the current button's ID
                      onMouseLeave={() => setHoveredId(null)} // Reset hoveredId when mouse leaves
                      style={{

                        backgroundColor: hoveredId === userData._id ? '#ffe6e6' : 'rgba(255, 255, 255, 0.2)',
                        borderRadius: hoveredId === userData._id ? '12px' : '12px',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center', color: 'red'
                        // transition: 'all 0.2s ease',
                      }}
                    >
                      {hoveredId && (
                        <span
                          style={{
                            fontSize: '14px',
                            color: '#ff0000',
                            marginRight: '8px',
                            whiteSpace: 'nowrap',
                            opacity: hoveredId === userData._id ? 1 : 0,
                            transform: hoveredId === userData._id ? 'translateX(0)' : 'translateX(10px)',
                            transition: 'opacity 0.3s, transform 0.3s',
                          }}
                        >
                          Delete User Account
                        </span>
                      )}
                      <DeleteForeverRoundedIcon />
                    </IconButton>
                  </Box>
                </Toolbar>
              </Box> */}
            </Box>
            {/* {showRatings && (
              <Card
                sx={{
                  position: 'absolute',
                  top: isMobile ? '150px' : '10px',
                  left: isMobile ? '2%' : null,
                  right: isMobile ? null : '2%',
                  width: '95%',
                  maxWidth: '400px',
                  zIndex: 1000,
                  borderRadius: '10px', backdropFilter: 'blur(12px)',
                  // boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                  // backgroundColor: '#fff',
                   '& .MuiCardContent-root': { padding: '10px' },
                }}
              >
                <CardContent>
                  Close Button
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Your Profile Ratings</Typography>
                    <IconButton onClick={() => setShowRatings(false)}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                  <Box display="flex" mb={1} gap={1}>
                    <Typography variant="body2" color="textSecondary" >
                      Trust Level
                    </Typography>
                    <StarRoundedIcon sx={{ color: 'gold', fontSize: 18 }} />
                    <Typography variant="body2" color="textSecondary" ml="-4px">
                      {userData.trustLevel || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">({userData.totalReviews} reviews)</Typography>
                  </Box>
                  <Box sx={{ height: '300px', overflowY: 'auto', scrollbarWidth: 'thin', bgcolor: 'rgba(0, 0, 0, 0.07)', borderRadius: '8px', scrollbarColor: '#aaa transparent', cursor: 'pointer' }}>
                    {userData.ratings.length ? (
                      userData.ratings.map((rating, index) => (
                        <Box
                          key={index}
                          sx={{
                            margin: "6px",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                            marginTop: "6px",
                            // backgroundColor: "#fff"
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar
                              src={`data:image/jpeg;base64,${btoa(
                                String.fromCharCode(...new Uint8Array(rating.userId?.profilePic?.data || []))
                              )}`}
                              alt={rating.userId?.username[0]}
                              style={{ width: 32, height: 32, borderRadius: '50%' }}
                            />
                            <Typography fontWeight="bold">
                              {rating.userId?.username || "Anonymous"}
                            </Typography>
                            <Rating value={rating.rating || 0} precision={0.5} readOnly sx={{ marginLeft: 'auto' }} />
                            <Typography variant="caption" color="textSecondary" marginLeft="auto">
                            {new Date(rating.createdAt).toLocaleString()}
                          </Typography>
                          </Box>
                          <Rating value={rating.rating || 0} precision={0.5} readOnly sx={{marginLeft:'2rem'}}/>
                          <Typography sx={{ paddingTop: "0.5rem" }}>{rating.comment}</Typography>
                          <Typography variant="caption" color="textSecondary" >
                            {new Date(rating.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography color="grey" textAlign="center" sx={{ m: 2 }}>
                        No Ratings available.
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )} */}
          </Box>
          <Box sx={{  my: 1, padding: '1rem', borderRadius: 3, ...getGlassmorphismStyle(theme, darkMode), }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 1, height: '32px', width: '32px' }}>
                  <ReviewsRoundedIcon fontSize="small" />
                </Avatar>
                <Typography variant="h6" >
                  Trust Level
                </Typography>
              </Box>
              <Button variant="outlined" size="small" sx={{borderRadius:'12px', padding: '4px 12px', textTransform: 'none'}} onClick={handleOpenRateDialog}>
                View Ratings
              </Button>
            </Box>
            <Box sx={{display: isMobile? 'flex' : 'flex', gap:'8px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 2, borderRadius: '12px'}}>
              <Rating value={userData?.trustLevel || 0} precision={0.5} readOnly /> 
              <Box sx={{display: isMobile? 'flex' : 'flex', gap:'8px', justifyContent: 'center', alignItems: 'center'}}>
                <Typography variant="body2" color="textPrimary"> {userData?.trustLevel || "N/A"} </Typography>
                <Typography variant="body2" color="textSecondary">({userData?.totalReviews} reviews)</Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ my: 1, padding: '1rem', borderRadius: 3, ...getGlassmorphismStyle(theme, darkMode) }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ 
                  bgcolor: verificationStatus === 'approved' ? 'success.main' : 
                          verificationStatus === 'pending_review' ? 'warning.main' : 
                          verificationStatus === 'rejected' ? 'error.main' : 'grey.500', 
                  mr: 1, 
                  height: '32px', 
                  width: '32px' 
                }}>
                  {verificationStatus === 'approved' ? <VerifiedUserRoundedIcon fontSize="small" /> :
                  verificationStatus === 'pending_review' ? <HourglassEmptyRoundedIcon fontSize="small" /> :
                  verificationStatus === 'rejected' ? <GppMaybeRoundedIcon fontSize="small" /> :
                  <DocumentScannerRoundedIcon fontSize="small" />}
                </Avatar>
                <Typography variant="h6">
                  Identity Verification
                </Typography>
              </Box>
              <Chip
                label={
                  verificationStatus === 'approved' ? 'Verified' :
                  verificationStatus === 'pending_review' ? 'Under Review' :
                  verificationStatus === 'rejected' ? 'Rejected' : 'Not Verified'
                }
                color={
                  verificationStatus === 'approved' ? 'success' :
                  verificationStatus === 'pending_review' ? 'warning' :
                  verificationStatus === 'rejected' ? 'error' : 'default'
                }
                variant={verificationStatus === 'not_started' ? 'outlined' : 'filled'}
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" color="textSecondary">
                {verificationStatus === 'approved' ? 
                  'Your identity has been successfully verified. This builds trust with other users.' :
                verificationStatus === 'pending_review' ? 
                  'Your verification is under review. This usually takes 24-48 hours.' :
                verificationStatus === 'rejected' ? 
                  `Your verification was rejected. ${verificationData?.rejectionReason || 'Please try again with clearer documents.'}` :
                  'Verify your identity to increase trust and access more features. Submit clear photos of your government ID.'}
              </Typography>
              
              {verificationData && (
                <>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, fontSize: '0.875rem' }}>
                  <Typography variant="body2" color="textSecondary">
                    Attempts: {verificationData.attempts || 0}/{verificationData.maxAttempts || 3}
                  </Typography>
                  {verificationData.documentType && (
                    <Typography variant="body2" color="textSecondary" >
                      DocumentType: {getDocType(verificationData.documentType) || 'N/A'}
                    </Typography>
                  )}
                </Box>
                {verificationData.submittedAt && (
                  <Typography variant="body2" color="textSecondary">
                    Submitted on: {new Date(verificationData.submittedAt).toLocaleDateString()}
                  </Typography>
                )}
                {verificationData.reviewedAt && (
                  <Typography variant="body2" color="textSecondary">
                    Reviewed on: {new Date(verificationData.reviewedAt).toLocaleDateString()}
                  </Typography>
                )}
                </>
              )}
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {(verificationStatus === 'not_started' || verificationStatus === 'rejected') && (
                  <Button
                    variant="contained"
                    onClick={() => setVerificationDialogOpen(true)}
                    disabled={verificationLoading || (verificationData?.attempts >= verificationData?.maxAttempts)}
                    startIcon={<DocumentScannerRoundedIcon />}
                    sx={{ borderRadius: '12px', textTransform: 'none' }}
                  >
                    {verificationData?.attempts >= verificationData?.maxAttempts ? 
                      'Max Attempts Reached' : 'Start Verification'}
                  </Button>
                )}
                
                {verificationStatus === 'pending_review' && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleCancelVerification}
                    disabled={verificationLoading}
                    startIcon={<CancelRoundedIcon />}
                    sx={{ borderRadius: '12px', textTransform: 'none' }}
                  >
                    Cancel Verification
                  </Button>
                )}
                
                {verificationStatus === 'approved' && (
                  <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                    <VerifiedUserRoundedIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                    Verified on {new Date(verificationData?.reviewedAt).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
          <Box sx={{  my: 1, padding: '1rem', borderRadius: 3, ...getGlassmorphismStyle(theme, darkMode), }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', mr: 1, height: '32px', width: '32px' }}>
                  <ManageAccountsRoundedIcon fontSize="small" />
                </Avatar>
                <Typography variant="h6" >
                  Account Management
                </Typography>
              </Box>
              {/* <Button variant="outlined" size="small" sx={{borderRadius:'12px', padding: '4px 12px', textTransform: 'none'}} onClick={handleOpenRateDialog}>
                View Ratings
              </Button> */}
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body1" style={{ fontWeight: 500 }}>
                  Account created at:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(userData?.accountCreatedAt).toLocaleString() || 'Not Found'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body1" style={{ fontWeight: 500 }}>
                  Last login at:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(userData?.lastLoginAt).toLocaleString() || 'Not Found'}
                </Typography>
              </Grid>
              <Grid item xs={12} >
                <Button
                    variant="text"
                    size="small"
                    onClick={handleEditProfile}
                    startIcon={<EditIcon />}
                    sx={{ borderRadius: '12px', textTransform: 'none' }}
                  >
                    Edit Profile Details
                  </Button>
              </Grid>
              <Grid item xs={12} >
                <Button
                    variant="text"
                    size="small" color="error"
                    onClick={handleOpenDeleteDialog}
                    startIcon={<DeleteForeverRoundedIcon />}
                    sx={{ borderRadius: '12px', textTransform: 'none' }}
                  >
                    Permanently Delete Account
                  </Button>
              </Grid>
            </Grid>
          </Box>
          {/* <Box sx={{ paddingBottom: isMobile ? '14rem' : '10rem', marginBottom: '1rem', borderRadius: 3, ...getGlassmorphismStyle(theme, darkMode),
            }}>
            <Box sx={{ height: '300px', marginTop: '1rem', padding: '10px' }}>
              <Box display="flex" justifyContent="start" sx={{ marginBottom: isMobile ? '6px' : '8px' }}>
                <LocationOnIcon color="primary" />
                <Typography variant="body1" sx={{ color: 'grey', }}>
                  <strong>Your current address :</strong> {(currentAddress) || "Fetching location..."}
                </Typography>
              </Box>
              <MapContainer
                center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [userData.location.latitude, userData.location.longitude]}
                zoom={13}
                style={{ height: '100%', width: '100%', borderRadius: '8px', }}
                attributionControl={false}  // Disables the watermark
              >
                <ChangeView center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [userData.location.latitude, userData.location.longitude]} />
                <TileLayer
                  url={mapMode === 'normal'
                    ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'}
                />
                Labels and Roads Layer (Overlay)
                {mapMode === 'satellite' && (
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                    opacity={1} // Make it semi-transparent if needed
                  />
                )}
                <Marker position={[userData.location.latitude, userData.location.longitude]} icon={customIcon}
                >
                  <Popup>User Location</Popup>
                </Marker>
                {currentLocation && (
                  <Marker position={[currentLocation.lat, currentLocation.lng]} icon={customIcon}>
                    <Popup>Your Current Location</Popup>
                  </Marker>
                )}
              </MapContainer>
              <Box sx={{
                display: 'flex', justifyContent: 'space-between', marginTop: '1rem',
                flexDirection: 'column', // Stack buttons and labels vertically
                alignItems: 'center', // Center align items
                gap: '8px' // Add some spacing between rows
              }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%' // Ensure buttons take full width
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <IconButton
                      sx={{
                        fontWeight: '500', width: '60px', borderRadius: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.26)',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', marginLeft: '0px'
                      }}
                      onClick={() => setMapMode(mapMode === 'normal' ? 'satellite' : 'normal')}
                    >
                      <Tooltip title={mapMode === 'normal' ? 'Switch to Satellite View' : 'Switch to Normal View'} arrow placement="right">
                        <>{mapMode === 'normal' ? <MapRoundedIcon /> : <SatelliteAltRoundedIcon />}</>
                      </Tooltip>
                    </IconButton>
                    <Typography variant="caption" sx={{ mt: 0.5, textAlign: 'center', color: 'grey' }}>
                      {mapMode === 'normal' ? 'Normal' : 'Salellite'}
                    </Typography>
                  </Box>
                  {currentLocation && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <IconButton
                        sx={{
                          fontWeight: '500', width: '60px', borderRadius: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.26)',
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                        }}
                        onClick={saveLocation}
                        disabled={loadingLocation && savingLocation}
                      >
                        <Tooltip title={savingLocation ? 'Caliculating route...' : 'Show the route and distance'} arrow placement="right">
                          <>{savingLocation ? <CircularProgress size={24} /> : <SaveRoundedIcon />}</>
                        </Tooltip>
                      </IconButton>
                      <Typography variant="caption" sx={{ mt: 0.5, textAlign: 'center', color: 'grey' }}>
                        Save Location
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <IconButton
                      sx={{
                        fontWeight: '500', width: '60px', borderRadius: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.26)',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', marginLeft: '0px'
                      }}
                      onClick={locateUser}
                    >
                      <Tooltip title={loadingLocation ? 'Fetching location...' : 'Locate me on Map'} arrow placement="right">
                        <>{loadingLocation ? <CircularProgress size={24} /> : <MyLocationRoundedIcon />}</>
                      </Tooltip>
                    </IconButton>
                    <Typography variant="caption" sx={{ mt: 0.5, textAlign: 'center', color: 'grey' }}>
                      Locate Me
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box> */}
        </Box>
      }
        {/* <Box mt={1} sx={{ borderRadius:3, bgcolor:'rgba(0, 0, 0, 0.07)'}}>
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
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {locationDetails.accuracy}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box> */}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title" 
        sx={{ '& .MuiPaper-root': { borderRadius: '14px', backdropFilter: 'blur(12px)', }, }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle id="delete-dialog-title" >
          Are you sure you want to delete your account permanently?
        </DialogTitle>
        <DialogContent style={{ padding: '2rem' }}>
          <Typography color='error'>
            This action cannot be undone. If you proceed, all your account's data will be removed permanently...
          </Typography>
        </DialogContent>
        <DialogActions style={{ padding: '1rem' }}>
          <Button onClick={handleDeleteAccount} variant='contained' color="error" sx={{ marginRight: '10px', borderRadius:'8px' }}>
            Yes, permanently delete my account
          </Button>
          <Button onClick={handleCloseDeleteDialog} variant='outlined' color="primary" sx={{borderRadius:'8px'}}>
            Cancel
          </Button>

        </DialogActions>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflow: 'visible'
          }
        }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        sx={{ '& .MuiPaper-root': { borderRadius: '14px', backdropFilter: 'blur(12px)', }, }}
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box >
            <TextField
              fullWidth
              label="Username"
              placeholder="Format ex: Abc1234"
              name="username"
              value={profileForm.username}
              onChange={handleProfileChange}
              margin="normal"
              required
              // size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  // backgroundColor: '#ffffff',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#5f6368',
                },
              }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={profileForm.email}
              onChange={handleProfileChange}
              margin="normal"
              required
              // size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  // backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#5f6368',
                },
              }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              type="number"
              value={profileForm.phone}
              onChange={handleProfileChange}
              margin="normal"
              // size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                inputProps: { 
                  style: { paddingLeft: 8 }, 
                  maxLength: 10 // restrict to 10 digits after +91 if needed
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  // backgroundColor: '#ffffff',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#5f6368',
                },
              }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Profile Description"
              name="profileDescription"
              placeholder="Tell us about yourself..."
              value={profileForm.profileDescription}
              onChange={handleProfileChange}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
              inputProps={{ maxLength: 100 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0, display: 'block' }}>
              {profileForm?.profileDescription?.length}/100 characters
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Typography variant="body2" gutterBottom>Interests</Typography>
                <Typography variant="caption" color="textSecondary">
                  {profileForm?.interests?.length}/10 added
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {profileForm.interests?.map((interest, index) => (
                  <Chip
                    key={index}
                    label={interest}
                    onDelete={() => {
                      const newInterests = [...profileForm.interests];
                      newInterests.splice(index, 1);
                      setProfileForm(prev => ({ ...prev, interests: newInterests }));
                    }}
                    sx={{ borderRadius: '8px' }}
                  />
                ))}
              </Box>
              <TextField
                fullWidth
                label="Add Interest"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && interests.trim()) {
                    e.preventDefault();
                    setProfileForm(prev => ({
                      ...prev,
                      interests: [...(prev.interests || []), interests.trim()]
                    }));
                    setInterests('');
                  }
                }}
                placeholder="Type an interest and press Enter"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
                inputProps={{ maxLength: 20 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button 
                        onClick={() => {
                          if (interests.trim()) {
                            setProfileForm(prev => ({
                              ...prev,
                              interests: [...(prev.interests || []), interests.trim()]
                            }));
                            setInterests('');
                          }
                        }}
                        disabled={!interests.trim() || profileForm?.interests?.length >= 10}
                        sx={{ borderRadius: '8px' }}
                      >
                        Add
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
              
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" fontWeight={500}>
                  {profileForm.withYou
                    ? 'You stand for women’s safety'
                    : 'Stand for women’s safety?'}
                </Typography>
                <Switch
                  checked={profileForm.withYou}
                  onChange={toggleWithYou}
                  color="primary"
                />
              </Box>
              <Typography variant="caption" color="text.secondary" marginTop={4}>
                *Your profile will be visible to women nearby who may need help in unsafe situations.
              </Typography>
            </Box>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" fontWeight={500}>
                  {profileForm.donate
                    ? "You're donating blood — thank you for helping others!"
                    : "Would you like to become a blood donor?"}
                </Typography>

                <Switch
                  checked={profileForm.donate}
                  onChange={toggleBloodDonate}
                  color="primary"
                />
              </Box>

              {profileForm.donate && (
                <FormControl fullWidth required sx={{ mt: 2 }}>
                  <InputLabel>Blood Group</InputLabel>
                  <Select
                    value={profileForm.bloodGroup || ''}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, bloodGroup: e.target.value })
                    }
                    label="BloodGroup"
                    sx={{ borderRadius: 2 }}
                    required
                  >
                    <MenuItem value="A+">A+</MenuItem>
                    <MenuItem value="A-">A-</MenuItem>
                    <MenuItem value="B+">B+</MenuItem>
                    <MenuItem value="B-">B-</MenuItem>
                    <MenuItem value="AB+">AB+</MenuItem>
                    <MenuItem value="AB-">AB-</MenuItem>
                    <MenuItem value="O+">O+</MenuItem>
                    <MenuItem value="O-">O-</MenuItem>
                    <MenuItem value="Unknown">I don't know my blood group</MenuItem>
                  </Select>
                </FormControl>
              )}

              <Typography variant="caption" color="text.secondary" marginTop={4}>
                *If you choose to donate, your blood group will be visible to nearby people who may need emergency blood support.
              </Typography>

            </Box>


            </Box>
          </Box>
        </DialogContent>
        {error && <Alert  
            sx={{ mx: 2 , borderRadius: '12px', color: darkMode ? 'error.contrastText' : 'text.primary', border: darkMode ? '1px solid rgba(244, 67, 54, 0.3)' : '1px solid rgba(244, 67, 54, 0.2)', boxShadow: darkMode ? '0 2px 8px rgba(244, 67, 54, 0.15)' : '0 2px 8px rgba(244, 67, 54, 0.1)', }} 
          severity="error">{error}</Alert>}
        <DialogActions sx={{p: 2}}>
          
          <Button sx={{borderRadius: '12px', textTransform: 'none'}} onClick={() => setEditProfileOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateProfile} 
            variant="contained"
            disabled={updating}
            sx={{
              textTransform:'none', borderRadius: '12px'
            }}
          >
            {updating ? <CircularProgress size={24} /> : 'Update Profile'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Picture Dialog */}
      <Dialog
        open={profilePicDialog}
        onClose={() => setProfilePicDialog(false)}
        maxWidth="sm"
        fullWidth
        // fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflow: 'visible'
          }
        }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent sx={{ scrollbarWidth: 'thin' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Current Profile Picture Preview */}
            {/* {userData?.profilePic && !profilePic && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="body1" gutterBottom>
                  Current Profile Picture:
                </Typography>
                <Avatar
                  src={`data:image/jpeg;base64,${userData.profilePic}`}
                  sx={{ width: 120, height: 120, margin: '0 auto', mb: 2 }}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteProfilePic}
                  disabled={updating}
                  startIcon={<DeleteIcon />}
                  sx={{ borderRadius: '12px', textTransform: 'none' }}
                >
                  {updating ? <CircularProgress size={20} /> : 'Delete Current Photo'}
                </Button>
              </Box>
            )} */}
            <Box sx={{display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row-reverse', gap: 1, alignItems: 'center', mb: 2, }}>
              <Button 
                variant="contained" 
                component="label"
                sx={{ borderRadius: '12px' }}
              >
                Choose Photo
                <input 
                  type="file" 
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              {userData?.profilePic && (<Button
                variant="outlined"
                color="error"
                onClick={handleDeleteProfilePic}
                disabled={deleting || updating}
                startIcon={<DeleteIcon />}
                sx={{ borderRadius: '12px', textTransform: 'none' }}
              >
                {deleting ? <CircularProgress size={20} /> : 'Delete Current Photo'}
              </Button>)}
            </Box>

            {profilePic && (
              <Box sx={{ position: 'relative', width: '100%', height: 300 }}>
                <Cropper
                  image={URL.createObjectURL(profilePic)}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                  style={{
                    containerStyle: {
                      height: 300,
                      position: 'relative',
                    },
                    cropAreaStyle: {
                      border: '2px dashed #2196f3',
                      borderRadius: '50%',
                    },
                  }}
                />
              </Box>
            )}

            {croppedImage && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" gutterBottom>
                  Preview:
                </Typography>
                <Avatar
                  src={croppedImage}
                  sx={{ width: 120, height: 120, margin: '0 auto' }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{p: 2}}>
          <Button 
            sx={{
              textTransform:'none', borderRadius: '12px'
            }} 
            onClick={() => setProfilePicDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveProfilePic} 
            variant="contained"
            disabled={updating || !croppedImage || deleting}
            sx={{
              textTransform:'none', borderRadius: '12px'
            }}
          >
            {updating ? <CircularProgress size={24} /> : 'Save Picture'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* verification submission dialog */}
      <VerificationDialog
        open={verificationDialogOpen}
        onClose={() => setVerificationDialogOpen(false)}
        onSubmit={handleSubmitVerification}
        loading={verificationLoading}
        attempts={verificationData?.attempts || 0}
        maxAttempts={verificationData?.maxAttempts || 3}
        isMobile={isMobile} darkMode={darkMode}
      />

      <UserProfileDetails
        userId={id}
        open={isRateDialogOpen}
        onClose={handleCloseRateDialog}
        // post={post}
        isMobile={isMobile}
        // isAuthenticated={isAuthenticated} 
        // setLoginMessage={setLoginMessage}  
        setSnackbar={setSnackbar} darkMode={darkMode}
      />

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
      <TermsPolicyBar darkMode={darkMode}/>
    </Layout>
  );
};

export default UserProfile;
