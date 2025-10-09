// src/components/Helper/RouteMapDialog.js
import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, Typography, IconButton, CircularProgress, Box, useMediaQuery, Tooltip, Alert, Snackbar, Switch, Slide } from '@mui/material';
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
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';


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

function RouteMapDialog({ open, onClose, post , darkMode}) {
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
  const [directionsCard, setDirectionsCard] = useState(false);
  const [showingRoute, setShowingRoute] = useState(true);

  // Define the bounds of the world
  const worldBounds = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));

  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const iconButtonStyle = (mapMode) => ({
    color: mapMode === 'satellite' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    width: isMobile ? 40 : 44,
    height: isMobile ? 40 : 44,
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        transform: 'scale(1.05)',
    },
    transition: 'all 0.2s ease',
  });

  // this useEffect to handle fullscreen changes
  useEffect(() => {
    if (mapRef.current) {
      // Use setTimeout to ensure the DOM has updated before invalidating the map
      setTimeout(() => {
        mapRef.current.invalidateSize();
        
        // Also trigger a refresh of tile layers
        mapRef.current.eachLayer((layer) => {
          if (layer.redraw) {
            layer.redraw();
          }
        });
      }, 100);
    }
  }, [isFullscreen]);

  // Automatically fetch location and show route when dialog opens
  useEffect(() => {
    if (open) {
      locateUser();
      // setShowingRoute(true);
    } else {
      // Clean up when dialog closes
      if (routingControlRef.current) {
        routingControlRef.current.remove();
        routingControlRef.current = null;
      }
      setCurrentLocation(null);
      setDistance(null);
      if (routingControlRef.current) {
        mapRef.current.removeControl(routingControlRef.current);
        routingControlRef.current = null;
        setDistance(null);
      }
    }
  }, [open]);

  // Show route automatically when currentLocation changes
  useEffect(() => {
    if (currentLocation && open && showingRoute) {
      showDistanceAndRoute();
    }
  }, [currentLocation, open, directionsCard]);

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
        // mapInstance = null;
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

  const toggleDirectionDialog = (e) => {
    const isChecked = e.target.checked;
    setDirectionsCard(isChecked);
  };

  const toggleRoute = (e) => {
    const isChecked = e.target.checked;
    // setDirectionsCard(isChecked);
    if (isChecked) {
      showDistanceAndRoute();
      setShowingRoute(isChecked);
    } else {
      if (routingControlRef.current) {
        mapRef.current.removeControl(routingControlRef.current);
        routingControlRef.current = null;
        setDistance(null);
      }
      setShowingRoute(false);
    }
  };

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
        // show: true, // Ensure the directions panel is shown
        show : directionsCard,
        addWaypoints: false, // Disable adding waypoints by clicking on the map
        draggableWaypoints: false, // Make waypoints non-draggable
        fitSelectedRoutes: true,
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
        // Add close button to the directions panel
        // addCloseButtonToDirectionsPanel();
      });

      routingControl.on('routingerror', function() {
      setRouteCalculating(false);
      setSnackbar({
        open: true,
        message: 'Failed to calculate route. Please try again.',
        severity: 'error'
      });
      // Add event listener for when the directions container is created
      routingControl.on('routesadd', function() {
        addCloseButtonToDirectionsPanel();
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

  // Helper function to add close button to directions panel
  const addCloseButtonToDirectionsPanel = () => {
    const directionsContainer = document.querySelector('.leaflet-routing-container');
    
    if (directionsContainer && !directionsContainer.querySelector('.close-directions-btn')) {
      const closeButton = document.createElement('div');
      closeButton.className = 'close-directions-btn';
      closeButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="pointer-events: none;">
          <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
        </svg>
      `;
      
      closeButton.style.position = 'absolute';
      closeButton.style.top = '10px';
      closeButton.style.right = '10px';
      closeButton.style.cursor = 'pointer';
      closeButton.style.zIndex = '1000';
      closeButton.style.padding = '4px';
      closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
      closeButton.style.borderRadius = '50%';
      closeButton.style.display = 'flex';
      closeButton.style.alignItems = 'center';
      closeButton.style.justifyContent = 'center';
      
      closeButton.onclick = () => {
        if (routingControlRef.current) {
          mapRef.current.removeControl(routingControlRef.current);
          routingControlRef.current = null;
          setDistance(null);
          setShowingRoute(false);
        }
      };
      
      directionsContainer.style.position = 'relative';
      directionsContainer.appendChild(closeButton);
    }
  };


  const removeViaPoint = (index) => {
    if (routingControlRef.current) {
      const waypoints = routingControlRef.current.getWaypoints();
      waypoints.splice(index, 1);
      routingControlRef.current.setWaypoints(waypoints);
    }
  };

  const recenterPostLocation = () => {
    if (mapRef.current && post?.location) {
      mapRef.current.flyTo([post.location.latitude, post.location.longitude], 15, {
        duration: 0.5
      });
    }
  };

  const recenterUserLocation = () => {
    if (mapRef.current && currentLocation) {
      mapRef.current.flyTo([currentLocation.lat, currentLocation.lng], 15, {
        duration: 0.5
      });
    }
  };

  // if (error) return <Alert severity="error">{error}</Alert>;
  if (!post || !post.location) return <Alert severity="error">Post location data is missing.</Alert>;

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isFullscreen || isMobile} sx={{
      // margin: isMobile ? '10px' : '10px',
       '& .MuiPaper-root': { // Target the dialog paper
        borderRadius: isFullscreen ? '0' : '14px', // Apply border radius
        backdropFilter: 'blur(12px)',
      },
    }} 
    TransitionComponent={Slide}
    TransitionProps={{ direction: 'right' }}
    >
      <DialogContent style={{ position: 'sticky', height: 'auto', scrollbarWidth: 'none', paddingInline: isMobile ? '8px' : '1rem' }}>
        {/* Close button */}
        <IconButton
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            // backgroundColor: 'rgba(0, 0, 0, 0.1)',
            // color: '#333'
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6">Route Map to Post Location</Typography>

        <Box sx={{ paddingBottom: '0rem', marginBottom: '1rem', borderRadius: 3, bgcolor: 'rgba(0, 0, 0, 0.07)' }}>
          <Box display="flex" justifyContent="start" sx={{paddingTop: '1rem', marginInline:'4px'}}>
            <LocationOnIcon color='primary'/>
            <Tooltip title="Click to center on post location" arrow placement="top-start">
              <Typography 
                variant="body1" 
                sx={{
                  marginLeft:'4px', 
                  color:'grey',
                  cursor: 'pointer',
                  '&:hover': {
                    // textDecoration: 'underline',
                    color: theme.palette.primary.main
                  }
                }}
                onClick={recenterPostLocation}
              >
                <strong>Post address :</strong> {post.location.address || "Post Address doesn't found..."}
                {/* {(currentAddress.split(" ").length > 3 ? `${currentAddress.split(" ").slice(0, 3).join(" ")}...` : currentAddress) || "Fetching location..."} */}
              </Typography>
            </Tooltip>
          </Box>

          {currentAddress && (
            <Box display="flex" justifyContent="start" mb={1} mt={1} marginInline="4px">
              <LocationOnIcon sx={{color:'rgba(52, 174, 11, 0.95)'}}/>
              <Tooltip title="Click to center on your location" arrow placement="top-start">
                <Typography 
                  variant="body1" 
                  sx={{
                    marginLeft:'4px', 
                    color:'grey',
                    cursor: 'pointer',
                    '&:hover': {
                      // textDecoration: 'underline',
                      color: theme.palette.success.main
                    }
                  }}
                  onClick={recenterUserLocation}
                >
                  <strong>Your current address :</strong> {currentAddress || "Fetching location..."}
                </Typography>
              </Tooltip>
            </Box>
          )}

          <Box sx={{ height: isFullscreen ? '100vh' : (isMobile ? '350px' : '400px'), padding: isFullscreen ? '0' : '10px', position: 'relative',
            ...(isFullscreen && {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              backgroundColor: 'white',
              // padding: 0,
              // height: '100%',
              width: '100%'
            })
           }}>
            <MapContainer 
              // key={isFullscreen ? 'fullscreen' : 'normal'} // Force re-render on fullscreen change
              whenCreated={(map) => {
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
            {/* Floating fullscreen button */}
            <Box sx={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              zIndex: 1000,
              // backgroundColor: 'white',
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                <IconButton
                  onClick={handleFullscreen}
                  sx={iconButtonStyle(mapMode)}
                >
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>
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
           <Box sx={{ display: 'flex', justifyContent: 'space-between', m: '8px 10px', alignItems: 'center' }}>
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
                        <>{mapMode === 'normal' ? <SatelliteAltRoundedIcon /> : <MapRoundedIcon /> }</>
                      </Tooltip>
                    </IconButton>
                    <Typography variant="caption" sx={{ mt: 0.5, textAlign: 'center', color:'grey' }}>
                      {mapMode === 'normal' ? 'Satellite' : 'Normal'}
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
              <Box m={1} sx={{display: 'flex',  gap: '4px'}}>

                {currentLocation && (
                  <>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* <IconButton
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
                    </Typography> */}
                    <Switch
                      checked={showingRoute}
                      onChange={toggleRoute}
                      color="primary" disabled={loadingLocation && routeCalculating}
                    /> 
                    <Typography variant="caption" sx={{ m: 0.8, textAlign: 'center', color:'grey' }}>
                      Route : <strong>{routeCalculating ? <CircularProgress size={12} /> : showingRoute ? 'ON' : 'OFF'}</strong>
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
                    {/* <IconButton
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
                    </IconButton> */}
                    <Switch
                      checked={directionsCard}
                      onChange={toggleDirectionDialog}
                      color="primary" disabled={!showingRoute}
                    /> 
                    <Typography variant="caption" sx={{ m: 0.8, textAlign: 'center', color:'grey' }}>
                      Directions : <strong>{directionsCard ? 'ON' : 'OFF'}</strong>
                    </Typography>
                  </Box>
                  </>
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

        </Box>
        {/* {distance && ( */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', margin: '4px 10px', alignItems: 'center', alignContent: 'center' }}>
            <Typography variant="body1"  style={{ fontWeight: 500 }}>
              Distance to post location: <strong>{distance ? distance : 'click on Route'}</strong>
            </Typography>
          </Box>
        {/* )} */}
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