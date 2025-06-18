// src/components/Helper/RouteMapDialog.js
import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, Typography, IconButton, CircularProgress, Box, useMediaQuery, Tooltip, Alert, Snackbar } from '@mui/material';
// import { addComment } from '../../api/api';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@emotion/react';


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
import LocationOnIcon from '@mui/icons-material/LocationOn';


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
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//   iconUrl: require('leaflet/dist/images/marker-icon.png'),
//   shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
// });

function RouteMapDialog({ open, onClose, post }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  // const { productId } = useParams();
  //   const [stockCountId, setStockCountId] = useState(null); // Track only stock count
  const [mapMode, setMapMode] = useState('normal');
  const [currentLocation, setCurrentLocation] = useState(null);
  // const [locationDetails, setLocationDetails] = useState(null);
  // const [error, setError] = useState('');
  //   const [successMessage, setSuccessMessage] = useState('');
  const [distance, setDistance] = useState(null);
  // const [route, setRoute] = useState(null);
  const mapRef = useRef();
  const routingControlRef = useRef();
  const [routeCalculating, setRouteCalculating] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' }); // Snackbar state
  const [currentAddress, setCurrentAddress] = useState('');

  // Automatically fetch location and show route when dialog opens
  useEffect(() => {
    if (open) {
      locateUser();
    } else {
      // Clean up when dialog closes
      if (routingControlRef.current) {
        routingControlRef.current.remove();
        routingControlRef.current = null;
      }
      setCurrentLocation(null);
      setDistance(null);
    }
  }, [open]);

  // Show route automatically when currentLocation changes
  useEffect(() => {
    if (currentLocation && open) {
      showDistanceAndRoute();
    }
  }, [currentLocation, open]);

  // Expose removeViaPoint to the window object
  useEffect(() => {
    window.removeViaPoint = removeViaPoint;
    return () => {
      delete window.removeViaPoint;
    };
  }, []);

  useEffect(() => {
    const mapInstance = mapRef.current; // Capture ref value at the start
    return () => {
      // Remove routing control first
      if (routingControlRef.current) {
        routingControlRef.current.remove(); // Clean up the routing control
        routingControlRef.current = null;
      }
       // Then remove the map
      if (mapInstance) {
        mapInstance.remove(); // Clean up the map instance
        mapInstance = null;
      }
    };
  }, []);

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

  const locateUser = async () => {
    const storedLocation = localStorage.getItem("userLocation");

    if (storedLocation) {
      // Use the stored location
      const { latitude, longitude } = JSON.parse(storedLocation);
      setCurrentLocation({ lat: latitude, lng: longitude });
      fetchAddress(latitude, longitude);
    } else {
    if (navigator.geolocation) {
      setLoadingLocation(true); // Show progress indicator
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const locationData = { latitude, longitude };
          setCurrentLocation({ lat: latitude, lng: longitude });
          localStorage.setItem('userLocation', JSON.stringify(locationData)); // Store in localStorage
          // Set location details manually using lat/lng
          // setLocationDetails({
          //   latitude,
          //   longitude,
          //   accuracy: position.coords.accuracy, // GPS accuracy in meters
          // });
          fetchAddress(latitude, longitude);
          // console.log("User's current location:", latitude, longitude);
          setLoadingLocation(false); // Hide progress indicator
        },
        (error) => {
          console.error('Error getting location:', error);
          // setError('Failed to fetch your current location. Please enable location access.');
          setSnackbar({ open: true, message: 'Failed to fetch the current location. Please enable the location permission or try again.', severity: 'error' });
          setLoadingLocation(false); // Hide progress indicator
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // High accuracy mode
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setSnackbar({ open: true, message: 'Geolocation is not supported by this browser.', severity: 'error' });
    }
  }
  };

  // useEffect(() => {
  //   const storedLocation = localStorage.getItem("userLocation");

  //   if (storedLocation) {
  //     // Use the stored location
  //     const { latitude, longitude } = JSON.parse(storedLocation);
  //     setCurrentLocation({ lat: latitude, lng: longitude });
  //   } else {
  //     // Fetch location only if not stored
  //     locateUser();
  //   }
  // }, [locateUser]);

  const showDistanceAndRoute = () => {
    if (!mapRef.current || !mapRef.current._leaflet_id || !currentLocation || !post?.location) {
      return; // Map doesn't exist or is being destroyed
    }
    if (currentLocation && post && mapRef.current) {
      setRouteCalculating(true); // Show progress indicator
      const map = mapRef.current;
      if (routingControlRef.current) {   // Remove existing routing control if any
        map.removeControl(routingControlRef.current);
      }
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(currentLocation.lat, currentLocation.lng),
          L.latLng(post.location.latitude, post.location.longitude)
        ],
        routeWhileDragging: true,
        createMarker: function (i, waypoint, n) {
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

      routingControl.on('routingerror', function() {
      setRouteCalculating(false);
      setSnackbar({
        open: true,
        message: 'Failed to calculate route. Please try again.',
        severity: 'error'
      });
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

  // if (error) return <Alert severity="error">{error}</Alert>;
  if (!post || !post.location) return <Alert severity="error">Post location data is missing.</Alert>;

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Define the bounds of the world
  const worldBounds = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile ? true : false} sx={{
      margin: isMobile ? '10px' : '10px', '& .MuiPaper-root': { // Target the dialog paper
        borderRadius: '14px', // Apply border radius
      },
    }} >
      <DialogContent style={{ position: 'sticky', height: 'auto', scrollbarWidth: 'none', paddingInline: isMobile ? '8px' : '1rem' }}>
        {/* Close button */}
        <IconButton
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            color: '#333'
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6">Route Map to Post Location</Typography>

        <Box sx={{ paddingBottom: '5rem', marginBottom: '1rem', borderRadius: 3, bgcolor: 'rgba(0, 0, 0, 0.07)' }}>
          <Box display="flex" justifyContent="start" sx={{paddingTop: '1rem', marginInline:'4px'}}>
            <LocationOnIcon color='primary'/>
            <Tooltip title="Post Address" arrow placement="top-start" 
              enterTouchDelay={0}  // Show tooltip immediately on touch
              leaveTouchDelay={1500} // Keep tooltip visible for 1.5 seconds on touch
              disableInteractive // Prevent tooltip from disappearing on accidental touches
              >
              <Typography variant="body1" sx={{marginLeft:'4px', color:'grey' }}>
              <strong>Post address :</strong> {post.location.address || "Post Address doesn't found..."}
                {/* {(currentAddress.split(" ").length > 3 ? `${currentAddress.split(" ").slice(0, 3).join(" ")}...` : currentAddress) || "Fetching location..."} */}
              </Typography>
            </Tooltip>
          </Box>
          {currentAddress && (
          <Box display="flex" justifyContent="start" mb={1} mt={1} marginInline="4px">
            <LocationOnIcon sx={{color:'rgba(52, 174, 11, 0.95)'}}/>
            <Typography variant="body1" sx={{marginLeft:'4px', color:'grey' }}>
              <strong>Your current address :</strong> {currentAddress || "Fetching location..."}
            </Typography>
          </Box>
          )}

          <Box sx={{ height: isMobile ? '350px' : '400px', padding: '10px' }}>
            <MapContainer  whenCreated={(map) => {
                            mapRef.current = map;
                            map.on('unload', () => {
                              // Clean up references when map is unloaded
                              mapRef.current = null;
                            });
                          }}
              center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [post.location.latitude, post.location.longitude]}
              zoom={13}
              style={{ height: '100%', width: '100%', borderRadius: '8px', }}
              attributionControl={false}  // Disables the watermark
              ref={mapRef}
              maxBounds={worldBounds} // Restrict the map to the world bounds
              maxBoundsViscosity={1.0} // Prevents the map from being dragged outside the bounds
            >
              <ChangeView center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [post.location.latitude, post.location.longitude]} />
              <TileLayer
                url={mapMode === 'normal'
                  ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                }
                noWrap={true} // Disable infinite wrapping
                // attribution="Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              />
              {/* Labels and Roads Layer (Overlay) */}
              {mapMode === 'satellite' && (
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" //url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_only_labels/{z}/{x}/{y}{r}.png"
                  // attribution="© OpenStreetMap contributors, © CartoDB"
                  opacity={1} // Make it semi-transparent if needed
                />
              )}
              <Marker position={[post.location.latitude, post.location.longitude]} icon={customIcon}
              >
                <Popup>Post Location</Popup>
              </Marker>
              {currentLocation && (
                <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userLocationIcon}>
                  <Popup>Your Current Location</Popup>
                </Marker>
              )}
              {/* {route && <Polyline positions={route} color="blue" />} */}

            </MapContainer>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', alignItems: 'center' }}>
              {/* <Button
                    variant="contained"
                    onClick={() => setMapMode(mapMode === 'normal' ? 'satellite' : 'normal')}
                    startIcon={mapMode === 'normal' ? <SatelliteAltRoundedIcon /> : <MapRoundedIcon />}
                  >
                    {mapMode === 'normal' ? 'Satellite View' : 'Normal View'}
                  </Button> */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <IconButton
                      style={{
                        // display: 'inline-block',
                        // float: 'right',
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
              <Box m={1}>

                {currentLocation && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <IconButton
                      style={{
                        // display: 'inline-block',
                        // float: 'right',
                        fontWeight: '500', width: '60px', borderRadius: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.26)',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                      }}
                      onClick={showDistanceAndRoute}
                      disabled={loadingLocation && routeCalculating} // Disable button while loading
                    >
                      <Tooltip title={routeCalculating ? 'Caliculating route...' : 'Show the route and distance'} arrow placement="right">
                        <>{routeCalculating ? <CircularProgress size={24} /> : <RouteRoundedIcon />}</>
                      </Tooltip>
                    </IconButton>
                    <Typography variant="caption" sx={{ mt: 0.5, textAlign: 'center', color:'grey' }}>
                      Show Route
                    </Typography>
                  </Box>
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
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <IconButton
                  style={{
                    // display: 'inline-block',
                    // float: 'right',
                    fontWeight: '500', width: '60px', borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.26)',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', marginLeft: '0px'
                  }}
                  onClick={locateUser}
                  disabled={loadingLocation} // Disable button while loading
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
              {/* <Button
                    variant="contained"
                    onClick={locateUser}
                    startIcon={<LocationOnIcon />}
                  >
                    Locate Me
                  </Button> */}

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
        {distance && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', margin: '4px 10px', alignItems: 'center', alignContent: 'center' }}>
            <Typography variant="body1"  style={{ fontWeight: 500 }}>
              Distance to post location: <strong>{distance}</strong>
            </Typography>
          </Box>
        )}
        <Typography 
          variant="body2" 
          sx={{ 
            margin: '4px 10px', 
            color: 'grey', 
            whiteSpace: 'pre-line', 
            textAlign: 'inherit'
          }}
        >
          *Click on <strong>Locate Me</strong> button to see your current location. {'\n'}
          *Click on <strong>Show Route</strong> button to see the distance between your location and Post location.
        </Typography>
        {/* <Box mt={1}>
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
        </Box> */}



      </DialogContent>
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

    </Dialog>

  );
}

export default RouteMapDialog;