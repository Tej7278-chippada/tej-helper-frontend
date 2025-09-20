// components/UserProfile.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import { Box, Typography, Avatar, IconButton, Alert, useMediaQuery, Grid, Button, Toolbar, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, CircularProgress, Card, CardContent, Rating, TextField, } from '@mui/material';
import { useTheme } from '@emotion/react';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import API, { deleteProfilePicture, updateProfilePicture, updateUserProfile } from './api/api';
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
import RateUserDialog from './Helper/RateUserDialog';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Cropper from 'react-easy-crop';
import TermsPolicyBar from './TermsAndPolicies/TermsPolicyBar';


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
  // const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
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
    phone: ''
  });
  const [profilePicDialog, setProfilePicDialog] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const authToken = localStorage.getItem('authToken');
        const response = await API.get(`/api/auth/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUserData(response.data);
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
      phone: userData.phone || ''
    });
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
      const response = await updateUserProfile(id, profileForm);
      setUserData(prev => ({
        ...prev,
        username: response.data.user.username,
        email: response.data.user.email,
        phone: response.data.user.phone
      }));
      localStorage.setItem('tokenUsername', response.data.user.username);
      setEditProfileOpen(false);
      setSnackbar({ 
        open: true, 
        message: 'Profile updated successfully!', 
        severity: 'success' 
      });
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
            gap={2} sx={{  borderRadius: '10px', padding: '6px', paddingBottom: '10px', paddingTop: '10px', ...getGlassmorphismStyle(theme, darkMode) }} // bgcolor: '#f5f5f5',
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
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    alt={userData.username}
                    src={
                      userData.profilePic
                        ? `data:image/jpeg;base64,${userData.profilePic}`
                        : 'https://placehold.co/200x200?text=No+Image'
                    }
                    sx={{ width: isMobile ? '160px' : 'auto', height: isMobile ? '160px' : 'auto', borderRadius: isMobile ? '50%' : '50%', cursor: 'pointer' }} // fit-content
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
              <Box flex={isMobile ? "1" : "0 0 70%"} mb={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Profile Information</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleEditProfile}
                    startIcon={<EditIcon />}
                    sx={{ borderRadius: '12px', textTransform: 'none' }}
                  >
                    Edit Profile
                  </Button>
                </Box>
                <Grid container spacing={2}>

                  <Grid item xs={6} sm={4}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      User Name:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {userData.username}
                    </Typography>
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
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {userData?.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
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
                  </Grid>
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

              <Box>
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
                  marginTop: '1rem',
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flex: 1, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {/* <Button variant="text" size="small" onClick={() => setShowRatings(true)}>
                        Ratings
                      </Button> */}
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
              </Box>
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
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflow: 'visible'
          }
        }}
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box >
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={profileForm.username}
              onChange={handleProfileChange}
              margin="normal"
              required
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
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
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
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
              value={profileForm.phone}
              onChange={handleProfileChange}
              margin="normal"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#5f6368',
                },
              }}
            />
          </Box>
        </DialogContent>
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

      <RateUserDialog
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
