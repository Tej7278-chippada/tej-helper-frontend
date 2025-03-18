// components/UserProfile.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import { Box, Typography, Avatar, IconButton, Alert, useMediaQuery, Grid, Button, Toolbar, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, CircularProgress, } from '@mui/material';
import { useTheme } from '@emotion/react';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import API from './api/api';
import Layout from './Layout';
import SkeletonProductDetail from './SkeletonProductDetail';
// import { Marker, TileLayer } from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SatelliteAltRoundedIcon from '@mui/icons-material/SatelliteAltRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
// Fix for Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

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


const UserProfile = () => {
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
  const [mapMode, setMapMode] = useState('normal');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [savingLocation, setSavingLocation] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await API.get(`/api/auth/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUserData(response.data);
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

  const locateUser = async () => {
    if (navigator.geolocation) {
      setLoadingLocation(true);
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
          // console.log("User's current location:", latitude, longitude);
          setLoadingLocation(false);
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
          setLoadingLocation(false);
          setSnackbar({ open: true, message: 'Failed to fetch your current location. Please enable the location permission or try again.', severity: 'error' });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // High accuracy mode
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const saveLocation = async () => {
    setSavingLocation(true);
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
      // setSuccessMessage('Location saved successfully.');
      setSnackbar({ open: true, message: 'Location saved successfully.', severity: 'success' });
      setSavingLocation(false);
    } catch (err) {
      // setError('Failed to save location. Please try again later.');
      setSnackbar({ open: true, message: 'Failed to save location. Please try again later.', severity: 'error' });
      setSavingLocation(false);
    }
  };
  
  if (loading || !userData) {
    return (
      <Layout>
        {/* <SkeletonCards /> */}
        <Box sx={{margin: '8px' }}>
        <SkeletonProductDetail />
        </Box>
      </Layout>
    );
  };
  // if (error) return <Alert severity="error">{error}</Alert>;

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Layout>
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
      <Box style={{
        padding: '8px',
        // position: 'relative',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '8px', scrollbarWidth: 'thin'
      }}>
        <Typography variant="h6" style={{ flexGrow: 1, mx: '10px' }} gutterBottom>
          User Profile
        </Typography>
        <Box
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          gap={2} sx={{ bgcolor: '#f5f5f5', borderRadius: '10px', padding: '6px', paddingBottom: '10px', paddingTop: '10px' }}
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
              style={{ paddingRight: isMobile ? "0" : "0rem",
                display: isMobile ? "flex" : "block",
                justifyContent: isMobile ? "center" : "flex-start",
                alignItems: isMobile ? "center" : "flex-start",
              }}
            >
              <Avatar
                alt={userData.username}
                src={
                  userData.profilePic
                    ? `data:image/jpeg;base64,${userData.profilePic}`
                    : 'https://placehold.co/56x56?text=No+Image'
                }
                sx={{ width: isMobile ? '160px' : 'fit-content', height: isMobile ? '160px' : 'auto', borderRadius: isMobile ? '50%' : '50%' }}
              />
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
            // height: 'calc(100vh - 16px)', // Adjust height as needed
          }}>
            <Box flex={isMobile ? "1" : "0 0 70%"} mb={6}>
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
                    {userData.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Typography variant="body1" style={{ fontWeight: 500 }}>
                    User Email:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {userData.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Typography variant="body1" style={{ fontWeight: 500 }}>
                    Address:
                  </Typography>
                  {userData.address && (
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                  {`${userData.address.street}, ${userData.address.area}, ${userData.address.city}, ${userData.address.state} - ${userData.address.pincode}`}
                  </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
            
            <Box>
              <Toolbar sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'white', borderRadius:'16px',
                boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                justifyContent: 'right',
                marginTop: '1rem',
              }}>
                <Box >
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
        </Box>
        <Box sx={{paddingBottom:'4rem',marginBottom:'1rem', borderRadius:3, bgcolor:'rgba(0, 0, 0, 0.07)'}}>
        
          <Box sx={{ height: '300px', marginTop: '1rem', padding:'10px' }}>
            <MapContainer
              center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [userData.location.latitude, userData.location.longitude]}
              zoom={13}
              style={{ height: '100%', width: '100%', borderRadius:'8px', }}
              attributionControl={false}  // Disables the watermark
            >
              <ChangeView center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [userData.location.latitude, userData.location.longitude]} />
              <TileLayer
                url={mapMode === 'normal'
                  ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'}
              />
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <IconButton
                sx={{fontWeight: '500', width: '60px', borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.26)',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', marginLeft: '0px'
                }}
                onClick={() => setMapMode(mapMode === 'normal' ? 'satellite' : 'normal')}
              >
                <Tooltip title={mapMode === 'normal' ? 'Switch to Satellite View' : 'Switch to Normal View'} arrow placement="right">
                <>{mapMode === 'normal' ? <MapRoundedIcon /> : <SatelliteAltRoundedIcon />}</>
              </Tooltip>
              </IconButton>
              {currentLocation && (
                <IconButton
                  sx={{fontWeight: '500', width: '60px', borderRadius: '10px',
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
              )}
              <IconButton
                sx={{fontWeight: '500', width: '60px', borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.26)',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', marginLeft: '0px'
                }}
                onClick={locateUser}
              >
                <Tooltip title={loadingLocation ? 'Fetching location...' : 'Locate me on Map'} arrow placement="right">
                  <>{loadingLocation ? <CircularProgress size={24} /> : <MyLocationRoundedIcon />}</>
                </Tooltip>
              </IconButton>
            </Box>
          </Box>
          
        </Box>
        <Box mt={1} sx={{ borderRadius:3, bgcolor:'rgba(0, 0, 0, 0.07)'}}>
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
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title" 
        sx={{ '& .MuiPaper-root': { borderRadius: '14px' }, }}
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
    </Layout>
  );
};

export default UserProfile;
