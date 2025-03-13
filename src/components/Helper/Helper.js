// components/Helper/Helper.js
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {Alert, Box, Button, Card, CardContent, CardMedia, CircularProgress, Grid, IconButton, Menu, Slider, Snackbar, Toolbar, Tooltip, Typography, useMediaQuery} from '@mui/material';
import Layout from '../Layout';
// import { useTheme } from '@emotion/react';
import FilterListIcon from "@mui/icons-material/FilterList";
// import FavoriteIcon from '@mui/icons-material/Favorite';
// import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import SkeletonCards from './SkeletonCards';
import LazyImage from './LazyImage';
import { useTheme } from '@emotion/react';
import { fetchPosts } from '../api/api';
import { useNavigate } from 'react-router-dom';
import FilterPosts from './FilterPosts';
import CloseIcon from '@mui/icons-material/Close'
import LocationOnIcon from '@mui/icons-material/LocationOn';
// import RefreshIcon from '@mui/icons-material/Refresh';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SatelliteAltRoundedIcon from '@mui/icons-material/SatelliteAltRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';

const Helper = ()=> {
  const tokenUsername = localStorage.getItem('tokenUsername');
  // const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [locationFilteredPosts, setLocationFilteredPosts] = useState([]);
  const [fetchLocationFilteredPosts, setFetchLocationFilteredPosts] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    category: '',
    gender: '',
    postStatus: '',
    priceRange: [0, 10000],
  });
  const [userLocation, setUserLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [distanceRange, setDistanceRange] = useState(10); // Default distance range in km
  const [anchorEl, setAnchorEl] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  const [mapMode, setMapMode] = useState('normal');
  const [locationDetails, setLocationDetails] = useState(null);
  // const distanceOptions = [2, 5, 10, 20, 30, 50, 70, 100, 120, 150, 200];
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' }); // Snackbar state
  

  // Custom marker icon
  const userLocationIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [30, 30],
  });


  // Fetch user's location and address
  const fetchUserLocation = useCallback(() => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationData = { latitude, longitude };
          setUserLocation(locationData);
          localStorage.setItem('userLocation', JSON.stringify(locationData)); // Store in localStorage
          fetchAddress(latitude, longitude);
          setLocationDetails({
            accuracy: position.coords.accuracy, // GPS accuracy in meters
          });
          setLoadingLocation(false);
        },
        (error) => {
          console.error('Error fetching location:', error);
          setSnackbar({ open: true, message: 'Failed to fetch the current location. Please enable the location permission or try again.', severity: 'error' });
          setLoadingLocation(false);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setLoadingLocation(false);
    }
  }, []);

  // useEffect(() => {
  //   fetchUserLocation();
  // }, [fetchUserLocation]);

  // When component mounts, check if location is stored in localStorage
  // useEffect(() => {
  //   const savedLocation = localStorage.getItem('userLocation');
  //   const savedAddress = localStorage.getItem('currentAddress');

  //   if (savedLocation && savedAddress) {
  //     setUserLocation(JSON.parse(savedLocation));
  //     setCurrentAddress(savedAddress);
  //   } else {
  //     fetchUserLocation(); // Fetch only if no saved location
  //   }
  // }, [fetchUserLocation]);

  // Get user's current location
  useEffect(() => {
    const storedLocation = localStorage.getItem("userLocation");
    const savedDistance = localStorage.getItem('distanceRange');

    if (storedLocation) {
      // Use the stored location
      const { latitude, longitude } = JSON.parse(storedLocation);
      setUserLocation({ latitude, longitude });
      fetchAddress(latitude, longitude);
      if (savedDistance) {
        setDistanceRange(Number(savedDistance));
      }
    } else {
      // Fetch location only if not stored
      fetchUserLocation();
    }
  }, [fetchUserLocation]);

  // Fetch posts data
  useEffect(() => {
    const fetchData = async () => {
        // setLoading(true);
        // localStorage.setItem('currentPage', currentPage); // Persist current page to localStorage
        try {
            const response = await fetchPosts();
            // const { posts } = response.data;
            setPosts(response.data);
            // setTotalPages(totalPages);
            // setLoading(false);
        } catch (error) {
            console.error("Error fetching posts:", error);
            // setLoading(false);
        }
    };
    fetchData();
  }, []);

  // Get user's current location
  // useEffect(() => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const { latitude, longitude } = position.coords;
  //         setUserLocation({ latitude, longitude });
  //         fetchAddress(latitude, longitude);
  //       },
  //       (error) => {
  //         console.error("Error fetching location:", error);
  //       }
  //     );
  //   } else {
  //     console.error("Geolocation is not supported by this browser.");
  //   }
  // }, []);
  

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

  // Refresh user's current location
  // const refreshLocation = () => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const { latitude, longitude } = position.coords;
  //         setUserLocation({ latitude, longitude });
  //         fetchAddress(latitude, longitude);
  //       },
  //       (error) => {
  //         console.error("Error fetching location:", error);
  //       }
  //     );
  //   }
  // };

  // Handle opening and closing the distance range menu
  const handleDistanceMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDistanceMenuClose = () => {
    setAnchorEl(null);
  };

  const distanceValues = [2, 5, 10, 20, 30, 50, 70, 100, 120, 150, 200];

  // Normalize distances into equal positions (0 to distanceValues.length - 1)
  const marks = distanceValues.map((value, index) => ({
    value: index,
    label: `${value}`,
  }));

  const handleDistanceRangeChange = (event, newValue) => {
    const selectedDistance = distanceValues[newValue];
    setDistanceRange(selectedDistance);  // Convert index back to actual distance
    localStorage.setItem('distanceRange', selectedDistance); 
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Filter posts based on distance range
  useEffect(() => {
    setFetchLocationFilteredPosts(true);
    if (userLocation && posts.length > 0) {
      const filtered = posts.filter((post) => {
        if (post.location && post.location.latitude && post.location.longitude) {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            post.location.latitude,
            post.location.longitude
          );
          return distance <= distanceRange;
        }
        return false;
        // setFetchLocationFilteredPosts(false);
      });
      setLocationFilteredPosts(filtered);
      setFetchLocationFilteredPosts(false);
    }
  }, [userLocation, posts, distanceRange]);

  


  const openPostDetail = (post) => {
    // setSelectedProduct(product);
    navigate(`/post/${post._id}`);
  };

  // Handle opening and closing the filter card
  const handleFilterToggle = () => {
    setFilterOpen((prev) => !prev);
  };

  // Apply filters to the posts
  const applyFilters = (newFilters) => {
    setFilterCriteria(newFilters);
    const filtered = locationFilteredPosts.filter((post) => {
      const matchCategory = newFilters.categories ? post.categories === newFilters.categories : true;
      const matchGender = newFilters.gender ? post.gender === newFilters.gender : true;
      const matchPostStatus = newFilters.postStatus ? post.postStatus === newFilters.postStatus : true;
      const matchPrice = post.price >= newFilters.priceRange[0] && post.price <= newFilters.priceRange[1];
      return matchCategory && matchGender && matchPostStatus && matchPrice;
    });
    setFilteredPosts(filtered);
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Layout username={tokenUsername}>
      <Box>
      <Toolbar sx={{display:'flex', justifyContent:'space-between'}}> 
          {/* <Typography variant="h6" style={{ flexGrow: 1, marginRight: '2rem' }}>
            Posts
          </Typography> */}
          <Box display="flex" justifyContent="flex-start" sx={{flexGrow: 1, marginRight: '10px', marginLeft: '-1rem'}}>
          <IconButton color="primary" onClick={() => setShowMap(true)} >
            <LocationOnIcon />
            <Typography variant="body1" sx={{marginLeft:'0px' }}>
              {/* {currentAddress || "Fetching location..."} */}
              {(currentAddress.split(" ").length > (isMobile ? 1 : 2) ? `${currentAddress.split(" ").slice(0, (isMobile ? 1 : 2)).join(" ")}...` : currentAddress) || "Fetching location..."}
            </Typography>
          </IconButton>
          </Box>
          <Box>
          {/* <IconButton color="primary" onClick={() => setShowMap(true)}>
            <LocationOnIcon />
            <Typography variant="body1" sx={{marginLeft:'8px' }}>
              {currentAddress || "Fetching location..."}
              {(currentAddress.split(" ").length > 3 ? `${currentAddress.split(" ").slice(0, 3).join(" ")}...` : currentAddress) || "Fetching location..."}
            </Typography>
          </IconButton> */}
          {/* <IconButton color="primary">
            <RefreshIcon onClick={refreshLocation} />
          </IconButton> */}
          {/* Floating Map Card */}
          {showMap && (
            <Card
              sx={{
                position: 'absolute',
                top: '10%',
                left: '5%',
                width: '90%',
                maxWidth: '400px',
                zIndex: 1000,
                borderRadius: '10px',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                backgroundColor: '#fff', '& .MuiCardContent-root': {padding: '10px' },
              }}
            >
              <CardContent>
                {/* Close Button */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Your Location</Typography>
                  <IconButton onClick={() => setShowMap(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                <Box display="flex" justifyContent="start" mb={2} mt={1}>
                <LocationOnIcon color='primary'/>
                <Typography variant="body1" sx={{marginLeft:'8px', color:'grey' }}>
                  {currentAddress || "Fetching location..."}
                  {/* {(currentAddress.split(" ").length > 3 ? `${currentAddress.split(" ").slice(0, 3).join(" ")}...` : currentAddress) || "Fetching location..."} */}
                </Typography>
                </Box>

                {/* Map */}
                <Box sx={{ height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
                  <MapContainer
                    center={userLocation ? [userLocation.latitude, userLocation.longitude] : [0, 0]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    attributionControl={false}
                    ref={mapRef}
                  >
                    <TileLayer
                      url={mapMode === 'normal'
                        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'}
                    />
                    {userLocation && (
                      <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userLocationIcon}>
                        <Popup>Your Current Location</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </Box>

                {/* Locate Me Button */}
                <Box display="flex" justifyContent="space-between" marginTop="1rem">
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
                    onClick={fetchUserLocation}
                    disabled={loadingLocation}
                    sx={{
                      width: '60px', borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.26)',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', marginLeft: '0px',
                      // height: '50px',
                    }}
                  >
                    <Tooltip title={loadingLocation ? 'Fetching location...' : 'Locate me on Map'}>
                      {loadingLocation ? <CircularProgress size={24} /> : <MyLocationRoundedIcon />}
                    </Tooltip>
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          )}
          </Box>
          <Box sx={{display:'flex', justifyContent:'space-between', marginRight:'-10px'}}>
          {/* Button to Open Distance Menu */}
          {/* Distance Button */}
          <Button
            variant="contained"
            onClick={handleDistanceMenuOpen}
            sx={{
              backgroundColor: "#1976d2",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "24px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              "&:hover": { backgroundColor: "#1565c0" },
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginRight: "10px",
            }}
          >
            {distanceRange} km
          </Button>

          {/* Distance Range Menu */}
          {anchorEl && (
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleDistanceMenuClose}
            sx={{ padding: "10px", '& .MuiPaper-root': { borderRadius:'12px'},  }}
          >
            <Box
              style={{
                padding: isMobile ? '15px' : '10px',
                display: "flex",
                flexDirection: isMobile ? "column" : "column",
                alignItems: 'flex-start',
                // minWidth: isMobile ? "60px" : "250px", borderRadius:'10px'
              }}
            >
              {/* Selected Distance Label */}
              <Box sx={{display: isMobile ? 'inline': 'flex', justifyContent: isMobile ? 'normal' : 'unset'}}>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  // marginBottom: isMobile ? "20px" : "10px",
                  textAlign: "center",
                }}
              >
                Distance Range: 
              </Typography>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginBottom: isMobile ? "20px" : "10px", marginLeft:'10px',
                  textAlign: "center",
                }}
              >
                {distanceRange} km
              </Typography>
              </Box>

              {/* Distance Slider */}
              <Slider
                orientation={isMobile ? "vertical" : "horizontal"}
                value={distanceValues.indexOf(distanceRange)} // Map actual distance to index
                onChange={handleDistanceRangeChange}
                aria-labelledby="distance-slider"
                // valueLabelDisplay="auto"
                step={1}
                marks={marks}
                min={0}
                max={distanceValues.length - 1}
                sx={{
                  ...(isMobile
                    ? { height: "300px", margin: "0 auto" }
                    : { width: "400px", mx: "10px" }),
                  color: "#1976d2",
                }}
              />
            </Box>
          </Menu>
          )}
          <Button
            variant="contained"
            onClick={handleFilterToggle}
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
              gap: '0px', marginRight: '0px'
            }}
          >
            <FilterListIcon sx={{ fontSize: '20px' }} />
            {/* <span style={{ fontSize: '14px', fontWeight: '500' }}>Filter</span> */}
          </Button>
          {/* <Button
            variant="contained"
            onClick={() => navigate('/wishlist')}
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
              gap: '8px',
            }}
          >
            <FavoriteIcon sx={{ fontSize: '20px' }} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Filter</span>
          </Button> */}
          </Box>
          
        </Toolbar>

        <Box sx={{ bgcolor: '#f5f5f5', paddingTop: '1rem', paddingBottom: '1rem', paddingInline: isMobile ? '4px' : '8px', borderRadius: '10px' }} > {/* sx={{ p: 2 }} */}
            {loadingLocation ? (
              // renderSkeletonCards()
              <SkeletonCards />
              // <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: "50vh" }}>
              //   <CircularProgress />
              // </Box>
            ) : ( fetchLocationFilteredPosts ? (
              <SkeletonCards/>
            ) : 
            ( locationFilteredPosts.length > 0 ? (
              <Grid container spacing={isMobile ? 1 : 2}>
                {locationFilteredPosts.map((post) => (
                  <Grid item xs={12} sm={6} md={4} key={post._id}>
                    <Card style={{
                      margin: '0rem 0',  // spacing between up and down cards
                      cursor: 'pointer',
                      backdropFilter: 'none',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '8px',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', // Default shadow
                      transition: 'transform 0.1s ease, box-shadow 0.1s ease', // Smooth transition for hover
                    }}
                      onClick={() => openPostDetail(post)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)'; // Slight zoom on hover
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)'; // Enhance shadow
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'; // Revert zoom
                        e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)'; // Revert shadow
                      }} >
                      {/* CardMedia for Images with Scroll */}
                      <CardMedia mx={isMobile ? "-12px" : "-2px"} sx={{ margin: '0rem 0', borderRadius: '8px', overflow: 'hidden', height: '200px', backgroundColor: '#f5f5f5' }}>
                        <div style={{
                          display: 'flex',
                          overflowX: 'auto',
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#888 transparent',
                          borderRadius: '8px',
                          gap: '0.1rem',
                          // marginBottom: '1rem'
                          height: '210px'
                        }} 
                        // onClick={() => openProductDetail(product)}
                        >
                          {post.media && post.media.slice(0, 5).map((base64Image, index) => (
                            <LazyImage key={index} base64Image={base64Image} alt={`Post ${index}`} style={{
                              height: '200px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              flexShrink: 0,
                              cursor: 'pointer' // Make the image look clickable
                            }} />
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
                        <Typography variant="body1" color="textSecondary" style={{ display: 'inline-block', float: 'right', fontWeight: '500' }}>
                          Price: ₹{post.price}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
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
                        {/* <Typography variant="body2" color={product.stockStatus === 'In Stock' ? 'green' : 'red'} style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                          Stock Status: {product.stockStatus}
                        </Typography> */}
                        {/* <Typography variant="body2" color={post.peopleCount > 0 ? "green" : "red"} style={{ marginBottom: '0.5rem' }}>
                          {post.peopleCount > 0 ? `In Stock (${post.peopleCount} available)` : "Out of Stock"}
                        </Typography> */}
                        {/* {product.stockStatus === 'In Stock' && (
                          <Typography variant="body2" color="textSecondary" style={{ display: 'inline-block', float: 'right', marginBottom: '0.5rem' }}>
                            Stock Count: {product.stockCount}
                          </Typography>
                        )} */}
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
                        {/* <Grid item xs={6} sm={4}>
                          <Typography variant="body1" style={{ fontWeight: 500 }}>
                            Seller Details:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {product.sellerTitle}
                          </Typography>
                        </Grid> */}
                      </CardContent>
                    </Card>

                  </Grid>
                ))}

              </Grid>
            ) : ( 
              <Typography color='error' textAlign="center" sx={{ m: 2 }}>No posts found within {distanceRange} km of your location...</Typography>
            )
            ))}
          </Box>


      </Box>
      {/* Filter Floating Card */}
      {filterOpen && (
        <FilterPosts
          filterCriteria={filterCriteria}
          applyFilters={applyFilters}
          posts={posts}
          filteredPosts={filteredPosts}
          onClose={handleFilterToggle}
        />
      )}

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

export default Helper;
