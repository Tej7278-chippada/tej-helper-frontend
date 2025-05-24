// components/Helper/Helper.js
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {Alert, Box, Button, Card, CardContent, CardMedia, CircularProgress, FormControl, Grid, IconButton, InputLabel, LinearProgress, MenuItem, Select, Snackbar, TextField, Toolbar, Tooltip, Typography, useMediaQuery} from '@mui/material';
import Layout from '../Layout';
// import { useTheme } from '@emotion/react';
// import FilterListIcon from "@mui/icons-material/FilterList";
// import FavoriteIcon from '@mui/icons-material/Favorite';
// import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import SkeletonCards from './SkeletonCards';
import LazyImage from './LazyImage';
import { useTheme } from '@emotion/react';
import API, { fetchPosts } from '../api/api';
import { useNavigate } from 'react-router-dom';
// import FilterPosts from './FilterPosts';
import CloseIcon from '@mui/icons-material/Close'
import LocationOnIcon from '@mui/icons-material/LocationOn';
// import RefreshIcon from '@mui/icons-material/Refresh';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SatelliteAltRoundedIcon from '@mui/icons-material/SatelliteAltRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import DistanceSlider from './DistanceSlider';

// Create a cache outside the component to persist between mounts
const globalCache = {
  data: {},
  lastCacheKey: null,
  lastScrollPosition: 0,
  lastViewedPostId: null,
  lastFilters: null
};

// Default filter values
const DEFAULT_FILTERS = {
  categories: '',
  gender: '',
  postStatus: '',
  priceRange: [0, 100000]
};

const Helper = ()=> {
  const tokenUsername = localStorage.getItem('tokenUsername');
  // const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  // const [filteredPosts, setFilteredPosts] = useState([]);
  // const [locationFilteredPosts, setLocationFilteredPosts] = useState([]);
  // const [fetchLocationFilteredPosts, setFetchLocationFilteredPosts] = useState(false);
  // const [filterOpen, setFilterOpen] = useState(false);
  // const [filterCriteria, setFilterCriteria] = useState({
  //   category: '',
  //   gender: '',
  //   postStatus: '',
  //   priceRange: [0, 10000],
  // });
  const [userLocation, setUserLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [distanceRange, setDistanceRange] = useState(10); // Default distance range in km
  // const [anchorEl, setAnchorEl] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  const [mapMode, setMapMode] = useState('normal');
  const [locationDetails, setLocationDetails] = useState(null);
  // const distanceOptions = [2, 5, 10, 20, 30, 50, 70, 100, 120, 150, 200];
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' }); // Snackbar state
  const [showDistanceRanges, setShowDistanceRanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const observer = useRef();
  const lastPostRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadingMore]);
  const userId = localStorage.getItem('userId');
  const [totalPosts, setTotalPosts] = useState(0);
  const [isExtraFiltersOpen, setIsExtraFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(() => {
  const savedFilters = localStorage.getItem('helperFilters');
  return savedFilters ? JSON.parse(savedFilters) : DEFAULT_FILTERS;
  });

  // State for temporary filters before applying
  const [localFilters, setLocalFilters] = useState(filters);
  const isDefaultFilters = useMemo(() => {
    return JSON.stringify(localFilters) === JSON.stringify(DEFAULT_FILTERS);
  }, [localFilters]);
  // Add a ref to track if we've restored scroll position
  const hasRestoredScroll = useRef(false);
  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('helperFilters', JSON.stringify(filters));
    globalCache.lastFilters = filters;
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle price range changes
  const handlePriceChange = (e, type) => {
    const value = Number(e.target.value);
    setLocalFilters(prev => ({
      ...prev,
      priceRange: type === 'min' 
        ? [value, prev.priceRange[1]] 
        : [prev.priceRange[0], value]
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    if (localFilters.priceRange[0] > localFilters.priceRange[1]) {
      // alert("Min price cannot be greater than max price");
      setSnackbar({ open: true, message: 'Min price cannot be greater than max price', severity: 'warning' });
      return;
    }
    // Only update if filters actually changed
    if (JSON.stringify(localFilters) !== JSON.stringify(filters)) {
      setFilters(localFilters);
      setSkip(0); // Reset pagination when filters change
      // setPosts([]); // Clear existing posts
      // Clear cache for the old filter combination
      globalCache.lastCacheKey = null;
    }
    setShowDistanceRanges(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    setLocalFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setSkip(0);
    setPosts([]);
    // Clear cache for the old filter combination
    globalCache.lastCacheKey = null;
    localStorage.removeItem('helperFilters');
  };

  // Custom marker icon
  // const userLocationIcon = new L.Icon({
  //   iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  //   iconSize: [30, 30],
  // });

  const customIcon = new L.Icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41], // Default size
    iconAnchor: [12, 41], // Position relative to the point
    popupAnchor: [1, -34],
  });

  // const [map, setMap] = useState(null);

  const ChangeView = ({ center, getZoomLevel }) => {
    // const map = useMap();
    useEffect(() => {
      if (mapRef.current && userLocation && center) {
        mapRef.current.setView(center, getZoomLevel);
      }
    }, [center, getZoomLevel]);
    return null;
  };

  // Auto-zoom and center map on selected distance
  const getZoomLevel = (distance) => {
    // Adjust zoom level based on distance
    if (distance <= 2) return 13;
    if (distance <= 5) return 12;
    if (distance <= 10) return 11;
    if (distance <= 20) return 10;
    if (distance <= 50) return 9;
    if (distance <= 70) return 8;
    if (distance <= 100) return 8;
    if (distance <= 200) return 7;
    if (distance <= 500) return 6;
    if (distance <= 1000) return 5;
    return 4;
  };

  // Auto-zoom and center map on selected distance
  // useEffect(() => {
  //   if (mapRef.current && userLocation) {
  //     // const zoomLevel = distanceRange > 100 ? 9 : distanceRange > 50 ? 10 : 11; // Adjust zoom based on range
  //     // mapRef.current.setView([userLocation.latitude, userLocation.longitude], zoomLevel);
  //   }
  // }, [distanceRange, userLocation]);


  // Fetch user's location and address
  const fetchUserLocation = useCallback(() => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationData = { latitude, longitude };
          setUserLocation(locationData);
          setLoadingLocation(false);
          localStorage.setItem('userLocation', JSON.stringify(locationData)); // Store in localStorage
          fetchAddress(latitude, longitude);
          setLocationDetails({
            accuracy: position.coords.accuracy, // GPS accuracy in meters
          });
          saveLocation(latitude, longitude);
          const savedDistance = localStorage.getItem('distanceRange');
          if (savedDistance) {
            setDistanceRange(Number(savedDistance));
          }
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

  const saveLocation = async (latitude, longitude) => {
    // setSavingLocation(true);
    try {
      const authToken = localStorage.getItem('authToken');
      await API.put(`/api/auth/${userId}/location`, {
        location: {
          latitude: latitude,
          longitude: longitude,
        },
      }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      // setSuccessMessage('Location saved successfully.');
      // setSnackbar({ open: true, message: 'Location saved successfully.', severity: 'success' });
      // setSavingLocation(false);
    } catch (err) {
      // setError('Failed to save location. Please try again later.');
      // setSnackbar({ open: true, message: 'Failed to save location. Please try again later.', severity: 'error' });
      // setSavingLocation(false);
      console.error('Error saving location:', err);
    }
  };

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

  // Generate a cache key based on current filters/location
  const generateCacheKey = useCallback(() => {
    return JSON.stringify({
      lat: userLocation?.latitude,
      lng: userLocation?.longitude,
      distance: distanceRange,
      ...filters
    });
  }, [userLocation, distanceRange, filters]);

  // Fetch posts data
  useEffect(() => {
    if (!distanceRange || !userLocation) {
      setPosts([]);
      return;
    };
    const currentCacheKey = generateCacheKey();
    const fetchData = async () => {
        // setLoading(true);
        // localStorage.setItem('currentPage', currentPage); // Persist current page to localStorage
        try {
          setLoading(true);
          // Check if we have valid cached data
          if (globalCache.data[currentCacheKey] && 
            globalCache.lastCacheKey === currentCacheKey &&
            JSON.stringify(globalCache.lastFilters) === JSON.stringify(filters)) {
              const { posts: cachedPosts, skip: cachedSkip, hasMore: cachedHasMore } = globalCache.data[currentCacheKey];
          
              setPosts(cachedPosts);
              setSkip(cachedSkip);
              setHasMore(cachedHasMore);
              setLoading(false);
              
              // Reset scroll restoration flag
              hasRestoredScroll.current = false;
              
              return;
            }
          // No valid cache - fetch fresh data
          const response = await fetchPosts(0, 12, userLocation, distanceRange, filters);
          const newPosts = response.data.posts || [];
          setTotalPosts(response.data.totalCount);
          // Update global cache
          globalCache.data[currentCacheKey] = {
            posts: newPosts,
            skip: 12,
            hasMore: newPosts.length > 0 && response.data.totalCount > 12,
            timestamp: Date.now()
          };
          globalCache.lastCacheKey = currentCacheKey;
          globalCache.lastFilters = {...filters};
          
          // Clean up old cache entries (older than 1 hour)
          Object.keys(globalCache.data).forEach(key => {
            if (Date.now() - globalCache.data[key].timestamp > 3600000) {
              delete globalCache.data[key];
            }
          });
          setPosts(newPosts);
          // setTotalPosts(response.data.totalCount || 0);
          setSkip(12); // Set skip to 24 after initial load
          // Check if there are more posts to load
          setHasMore(newPosts.length > 0 && response.data.totalCount > 12); // If we got 24, there might be more
          console.log(`posts fetched in range ${distanceRange} and initial count ${response.data.posts.length} and total count ${response.data.totalCount}`)
        } catch (error) {
          console.error("Error fetching posts:", error);
          setSnackbar({ open: true, message: 'Failed to fetch the posts within your distance radius.', severity: 'error' });
        } finally {
          setLoading(false);
        }
    };
    if (userLocation && distanceRange) {
      fetchData();
    }
  }, [userLocation, distanceRange, filters, generateCacheKey]); // Add distanceRange as dependency

  // Load more posts function
  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const response = await fetchPosts(skip, 12, userLocation, distanceRange, filters);
      const newPosts = response.data.posts || [];
      
      if (newPosts.length > 0) {
        const updatedPosts = [...posts, ...newPosts];
        const currentCacheKey = generateCacheKey();
        
        // Update global cache
        if (globalCache.data[currentCacheKey]) {
          globalCache.data[currentCacheKey] = {
            ...globalCache.data[currentCacheKey],
            posts: updatedPosts,
            skip: skip + newPosts.length,
            hasMore: updatedPosts.length < response.data.totalCount
          };
        }
        setPosts(updatedPosts);
        setSkip(prevSkip => prevSkip + newPosts.length);
        // Update hasMore based on whether we've reached the total count
        setHasMore(updatedPosts.length < response.data.totalCount);
        console.log(`Fetched ${newPosts.length} new posts (skip: ${skip}, total: ${response.data.totalCount})`);
      } else {
        setHasMore(false);
      }
      
      // setHasMore(newPosts.length === 12); // If we got less than 24, we've reached the end
    } catch (error) {
      console.error("Error fetching more posts:", error);
      // setSnackbar({ open: true, message: 'Failed to fetch more posts.', severity: 'error' });
    } finally {
      setLoadingMore(false);
    }
  };

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
  // const handleDistanceMenuOpen = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleDistanceMenuClose = () => {
  //   setAnchorEl(null);
  // };

  const distanceValues = [2, 5, 10, 20, 50, 70, 100, 150, 200];


  // Calculate distance between two coordinates using Haversine formula
  // const calculateDistance = (lat1, lon1, lat2, lon2) => {
  //   const R = 6371; // Radius of the Earth in km
  //   const dLat = (lat2 - lat1) * (Math.PI / 180);
  //   const dLon = (lon2 - lon1) * (Math.PI / 180);
  //   const a =
  //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  //     Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
  //     Math.sin(dLon / 2) * Math.sin(dLon / 2);
  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //   return R * c; // Distance in km
  // };

  // Filter posts based on distance range
  // useEffect(() => {
  //   setFetchLocationFilteredPosts(true);
  //   if (userLocation && posts.length > 0) {
  //     const filtered = posts.filter((post) => {
  //       if (post.location && post.location.latitude && post.location.longitude) {
  //         const distance = calculateDistance(
  //           userLocation.latitude,
  //           userLocation.longitude,
  //           post.location.latitude,
  //           post.location.longitude
  //         );
  //         return distance <= distanceRange;
  //       }
  //       return false;
  //       // setFetchLocationFilteredPosts(false);
  //     });
  //     setLocationFilteredPosts(filtered);
  //     setFetchLocationFilteredPosts(false);
  //   }
  // }, [userLocation, posts, distanceRange]);

  // Effect to handle scroll restoration and post focus
  useEffect(() => {
    if (posts.length > 0 && globalCache.lastViewedPostId && !hasRestoredScroll.current) {
      const timer = setTimeout(() => {
        // First restore scroll position
        window.scrollTo(0, globalCache.lastScrollPosition);
        
        // Then try to find and focus the post
        const postElement = document.getElementById(`post-${globalCache.lastViewedPostId}`);
        if (postElement) {
          postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // // Add temporary highlight
          // postElement.style.boxShadow = '0 0 0 2px rgba(25, 118, 210, 0.5)';
          // setTimeout(() => {
          //   postElement.style.boxShadow = '';
          // }, 2000);
        }
        
        hasRestoredScroll.current = true;
        globalCache.lastViewedPostId = null; // Clear after handling
      }, 100); // Slight delay to ensure posts are rendered

      return () => clearTimeout(timer);
    }
  }, [posts]); // Run when posts change


  // Store navigation info before leaving
  const openPostDetail = (post) => {
    // Save both to global cache and localStorage as backup
    globalCache.lastViewedPostId = post._id;
    globalCache.lastScrollPosition = window.scrollY;
    localStorage.setItem('lastHelperScroll', window.scrollY);
    localStorage.setItem('lastViewedPostId', post._id);
    navigate(`/post/${post._id}`);
  };

  // Initialize scroll position and post ID from localStorage if needed
  useEffect(() => {
    const savedScroll = localStorage.getItem('lastHelperScroll');
    const savedPostId = localStorage.getItem('lastViewedPostId');
    
    if (savedScroll && savedPostId && !globalCache.lastScrollPosition) {
      globalCache.lastScrollPosition = Number(savedScroll);
      globalCache.lastViewedPostId = savedPostId;
    }

    // Cleanup localStorage on unmount
    return () => {
      localStorage.removeItem('lastHelperScroll');
      localStorage.removeItem('lastViewedPostId');
    };
  }, []);

  // // Handle opening and closing the filter card
  // const handleFilterToggle = () => {
  //   setFilterOpen((prev) => !prev);
  // };

  // // Apply filters to the posts
  // const applyFilters = (newFilters) => {
  //   setFilterCriteria(newFilters);
  //   const filtered = posts.filter((post) => {
  //     const matchCategory = newFilters.categories ? post.categories === newFilters.categories : true;
  //     const matchGender = newFilters.gender ? post.gender === newFilters.gender : true;
  //     const matchPostStatus = newFilters.postStatus ? post.postStatus === newFilters.postStatus : true;
  //     const matchPrice = post.price >= newFilters.priceRange[0] && post.price <= newFilters.priceRange[1];
  //     return matchCategory && matchGender && matchPostStatus && matchPrice;
  //   });
  //   setFilteredPosts(filtered);
  // };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Define the bounds of the world
  const worldBounds = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));

  return (
    <Layout username={tokenUsername}>
      <Box>
      <Toolbar sx={{display:'flex', justifyContent:'space-between'}}> 
          {/* <Typography variant="h6" style={{ flexGrow: 1, marginRight: '2rem' }}>
            Posts
          </Typography> */}
          <Box display="flex" justifyContent="flex-start" sx={{flexGrow: 1, marginRight: '6px', marginLeft: isMobile ? '-12px' : '-14px'}}>
          <IconButton color="primary" onClick={() => setShowMap(true)} sx={{borderRadius: 6, px: 0.5, py: 0.5,  '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }}}>
            <LocationOnIcon />
            <Typography variant="body1" sx={{marginLeft:'0px' }}>
              {/* {currentAddress || "Fetching location..."} */}
              {(currentAddress.split(" ").length > (isMobile ? 2 : 3) ? `${currentAddress.split(" ").slice(0, (isMobile ? 2 : 3)).join(" ")}...` : currentAddress) || "Fetching location..."}
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
                top: '50px',
                left: '2%',
                width: '95%',
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
                {/* {userLocation && ( */}
                  <MapContainer
                    center={userLocation ? [userLocation.latitude, userLocation.longitude] : [0, 0]}
                    zoom={getZoomLevel(distanceRange)}
                    style={{ height: '100%', width: '100%' }}
                    attributionControl={false}
                    ref={mapRef}
                    // whenCreated={setMap}
                    whenCreated={(map) => (mapRef.current = map)}
                    maxBounds={worldBounds} // Restrict the map to the world bounds
                    maxBoundsViscosity={1.0} // Prevents the map from being dragged outside the bounds
                  >
                    <ChangeView center={userLocation ? [userLocation.latitude, userLocation.longitude] : [0, 0]} />
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
                    {userLocation && (
                      <Marker position={[userLocation.latitude, userLocation.longitude]} icon={customIcon}>
                        <Popup>Your Current Location</Popup>
                      </Marker>
                    )}
                    {/* Distance Circles */}
                    {userLocation && distanceValues.map((radius) => (
                      <Circle
                        key={radius}
                        center={userLocation ? [userLocation.latitude, userLocation.longitude] : [0, 0]}
                        radius={radius * 1000}
                        pathOptions={{
                          color: radius === distanceRange ? "#1976d2" : "rgba(10, 30, 110, 0)", //#1976d2 #999
                          fillColor: radius === distanceRange ? "rgba(10, 30, 110, 0.05) " : "rgba(10, 30, 110, 0) ",
                          fillOpacity: 0.2,
                          weight: radius === distanceRange ? 1 : 1,
                        }}
                        // eventHandlers={{
                        //   click: () => {
                        //     setDistanceRange(radius);
                        //     mapRef.current.setView([userLocation.latitude, userLocation.longitude], radius > 100 ? 9 : radius > 50 ? 10 : 11);
                        //   },
                        // }}
                      >
                        {/* <Popup>{distanceRange} km</Popup> */}
                      </Circle>
                    ))}
                    {/* Render a circle for custom distances (if it's not in distanceValues) */}
                    {userLocation && !distanceValues.includes(distanceRange) && (
                      <Circle
                        center={[userLocation.latitude, userLocation.longitude]}
                        radius={distanceRange * 1000}
                        pathOptions={{
                          color: "#ff9800", // Orange color for custom distance
                          fillColor: "rgba(255, 152, 0, 0.2)", 
                          fillOpacity: 0.2,
                          weight: 1,
                        }}
                      />
                    )}
                  </MapContainer>
                {/* )} */}
                </Box>

                {/* Locate Me Button */}
                <Box display="flex" justifyContent="space-between" marginTop="1rem">
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
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                        <>{loadingLocation ? <CircularProgress size={24} /> : <MyLocationRoundedIcon />}</>
                      </Tooltip>
                    </IconButton>
                    <Typography variant="caption" sx={{ mt: 0.5, textAlign: 'center', color:'grey' }}>
                      Locate Me
                    </Typography>
                  </Box>
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
            // onClick={handleDistanceMenuOpen}
            onClick={() => setShowDistanceRanges(true)}
            sx={{
              backgroundColor: "#1976d2",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "24px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              "&:hover": { backgroundColor: "#1565c0" },
              display: "flex",
              alignItems: "center",
              gap: "8px",
              // marginRight: "6px",
            }}
          >
            {distanceRange} km
          </Button>

          {/* Distance Range Menu */}
          {showDistanceRanges && (
          <Card
            // anchorEl={anchorEl}
            // open={Boolean(anchorEl)}
            // onClose={handleDistanceMenuClose}
            sx={{ position: 'absolute',
              top: '50px',
              right: '2%', ml: '4px',
              // width: '90%',
              // maxWidth: '400px',
              zIndex: 1000,  '& .MuiPaper-root': { borderRadius:'12px'}, borderRadius: '10px',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
              backgroundColor: '#f5f5f5', '& .MuiCardContent-root': {padding: '10px' },  }}
          >
            <Box sx={{ m: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'column', gap: 1 }}>
              <Box sx={{ m: 0, bgcolor: 'white', borderRadius:'8px'}}>
                <Box
                  sx={{
                    px: isMobile ? '8px' : '10px', py: '12px',
                    display: "flex",
                    flexDirection: isMobile ? "column" : "column",
                    alignItems: 'flex-start',
                    // minWidth: isMobile ? "60px" : "250px", borderRadius:'10px'
                  }}
                >
                  {/* Selected Distance Label */}
                  <Box sx={{mb: 1, display: isMobile ? 'inline': 'flex', justifyContent: isMobile ? 'normal' : 'unset'}}>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      // marginBottom: isMobile ? "20px" : "10px",
                      textAlign: "center",
                    }}
                  >
                    Distance Range: {distanceRange} km
                  </Typography>
                  {/* <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      marginBottom: isMobile ? "20px" : "10px", marginLeft:'10px',
                      textAlign: "center",
                    }}
                  >
                    {distanceRange} km
                  </Typography> */}
                  {/* {!isMobile && ( */}
                    <Box sx={{ position: 'absolute', top: '10px', right: '10px', marginLeft: 'auto', display:'flex', alignItems:'center' }}>
                      {/* <TextField
                        label="custom input (km)"
                        type="number"
                        value={distanceRange}
                        onChange={(e) => {
                          let value = e.target.value.replace(/[^0-9]/g, ''); // Allow only numeric values
                      
                          if (value === '') {
                            setDistanceRange('');
                            // localStorage.removeItem("distanceRange"); // Clear storage when empty
                            return;
                          }
                      
                          const numericValue = Number(value);
                          
                          if (numericValue >= 1 && numericValue <= 1000) {
                            setDistanceRange(numericValue);
                            localStorage.setItem("distanceRange", numericValue);
                            
                            if (mapRef.current && userLocation) {
                              mapRef.current.setView([userLocation.latitude, userLocation.longitude], getZoomLevel(numericValue));
                            }
                          }
                        }}
                        fullWidth={isMobile}
                        sx={{
                          width: isMobile ? "80px" : "80px", marginRight:'4px',
                          "& .MuiOutlinedInput-root": { borderRadius: "8px" }, '& .MuiInputBase-input': { padding: '6px 12px', scrollbarWidth: 'none',  },
                          
                        }}
                        inputProps={{ min: 1, max: 1000 }} // Restrict values in number input UI
                        InputLabelProps={{
                          sx: {
                            // fontSize: "14px", // Custom label font size
                            // fontWeight: "bold", // Make label bold
                            color: "primary.main", // Apply theme color
                          },
                          shrink: true, // Keep label always visible
                        }}
                      /> */}
                      <IconButton
                        onClick={() => setShowDistanceRanges(false)}
                        variant="text"
                      >
                        <CloseIcon/>
                      </IconButton>
                    </Box>
                  {/* )} */}
                  </Box>
                  {/* Distance Slider */}
                  <DistanceSlider distanceRange={distanceRange} setDistanceRange={setDistanceRange} userLocation={userLocation} mapRef={mapRef} isMobile={isMobile} getZoomLevel={getZoomLevel} distanceValues={distanceValues} />

                  
                </Box>
                {/* {isMobile && ( */}
                <Box sx={{ padding: '4px 8px', mt: isMobile ? 2 : 1, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      margin: '4px 10px', 
                      color: 'grey', 
                      // whiteSpace: isMobile ? 'pre-line' : 'nowrap', 
                      textAlign: isMobile ? 'center' : 'inherit'
                    }}
                  >
                    *Distance range {isMobile ? '\n' : ' '} upto 1000km
                  </Typography>
                  <TextField
                    label="custom range (km)"
                    type="number"
                    value={distanceRange}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^0-9]/g, ''); // Allow only numeric values
                  
                      if (value === '') {
                        setDistanceRange('');
                        // localStorage.removeItem("distanceRange"); // Clear storage when empty
                        return;
                      }
                  
                      const numericValue = Number(value);
                      
                      if (numericValue >= 1 && numericValue <= 1000) {
                        setDistanceRange(numericValue);
                        localStorage.setItem("distanceRange", numericValue);
                        
                        if (mapRef.current && userLocation) {
                          mapRef.current.setView([userLocation.latitude, userLocation.longitude], getZoomLevel(numericValue));
                        }
                      }
                    }}
                    sx={{
                      width: "80px",
                      "& .MuiOutlinedInput-root": { borderRadius: "8px" }, '& .MuiInputBase-input': { padding: '6px 14px', },
                    }}
                    inputProps={{ min: 1, max: 1000 }} // Restrict values in number input UI
                    InputLabelProps={{
                      sx: {
                        // fontSize: "14px", // Custom label font size
                        // fontWeight: "bold", // Make label bold
                        color: "primary.main", // Apply theme color
                      },
                      shrink: true, // Keep label always visible
                    }}
                  />
                  {/* <IconButton
                    onClick={() => setShowDistanceRanges(false)}
                    variant="text" 
                  >
                    <CloseIcon/>
                  </IconButton> */}
                  {/* <Button sx={{borderRadius:'1rem', bgcolor:'rgba(0, 85, 255, 0.07)'}} onClick={() => setShowDistanceRanges(false)} fullWidth variant="text">
                    Close
                  </Button> */}
                </Box>
                {/* )} */}
                {/* <Typography 
                  variant="body2" 
                  sx={{ 
                    margin: '4px 10px', 
                    color: 'grey', 
                    whiteSpace: isMobile ? 'pre-line' : 'nowrap', 
                    textAlign: isMobile ? 'center' : 'inherit'
                  }}
                >
                  *Distance range {isMobile ? '\n' : ' '} upto 1000km
                </Typography> */}
              </Box>

              <Box sx={{maxWidth: '450px'}}>
                {/* Filter Card */}
                <Card sx={{
                  m: 0,
                  // bgcolor: '#f5f5f5',
                  borderRadius: '8px',
                  // boxShadow: 3,
                }}>
                   <Box sx={{ display: 'flex', flexGrow: 1, float: 'inline-end', margin:1 }}>
                    <Button
                      variant="outlined" size="small" sx={{borderRadius: '8px'}}
                      onClick={() => setIsExtraFiltersOpen((prev) => !prev)}
                    >
                      {isExtraFiltersOpen ? 'Close Extra Filters' : 'Show Extra Filters'}
                    </Button>
                  </Box>
                  {isExtraFiltersOpen && 
                    <CardContent>
                      <Typography variant="h6" gutterBottom >
                        Filters
                      </Typography>
                      
                      <Box display="flex" gap={2} flexWrap="wrap" sx={{mt: 2}}>
                        {/* Category Filter */}
                        <FormControl size='small' sx={{ flex: '1 1 140px', '& .MuiOutlinedInput-root': { borderRadius: '12px', } }}>
                          <InputLabel>Category</InputLabel>
                          <Select
                            name="categories"
                            value={localFilters.categories}
                            onChange={handleFilterChange}
                            label="Category"
                          >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="Paid">Paid</MenuItem>
                            <MenuItem value="UnPaid">UnPaid</MenuItem>
                            <MenuItem value="Emergency">Emergency</MenuItem>
                          </Select>
                        </FormControl>

                        {/* Gender Filter */}
                        <FormControl size='small' sx={{ flex: '1 1 140px', '& .MuiOutlinedInput-root': { borderRadius: '12px',} }}>
                          <InputLabel>Gender</InputLabel>
                          <Select
                            name="gender"
                            value={localFilters.gender}
                            onChange={handleFilterChange}
                            label="Gender"
                          >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Kids">Kids</MenuItem>
                            <MenuItem value="Everyone">Everyone</MenuItem>
                          </Select>
                        </FormControl>

                        {/* Status Filter */}
                        <FormControl size='small' sx={{ flex: '1 1 180px', '& .MuiOutlinedInput-root': { borderRadius: '12px',} }}>
                          <InputLabel>Status</InputLabel>
                          <Select
                            name="postStatus"
                            value={localFilters.postStatus}
                            onChange={handleFilterChange}
                            label="Status"
                          >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="InActive">InActive</MenuItem>
                            <MenuItem value="Closed">Closed</MenuItem>
                          </Select>
                        </FormControl>

                        {/* Price Range */}
                        <Box display="flex" gap={2} flex="1 1 auto">
                          <TextField
                            label="Min Price"
                            type="number" size='small'
                            value={localFilters.priceRange[0]}
                            onChange={(e) => handlePriceChange(e, 'min')}
                            fullWidth sx={{'& .MuiOutlinedInput-root': { borderRadius: '12px',}}}
                          />
                          <TextField
                            label="Max Price"
                            type="number" size='small'
                            value={localFilters.priceRange[1]}
                            onChange={(e) => handlePriceChange(e, 'max')}
                            fullWidth sx={{'& .MuiOutlinedInput-root': { borderRadius: '12px',}}}
                          />
                        </Box>
                      </Box>

                      {/* Action Buttons */}
                      <Box gap={2} mt={2}>
                        <Button
                          variant="outlined" size="small"
                          onClick={handleResetFilters}
                          disabled={isDefaultFilters}
                          fullWidth sx={{ alignSelf: 'flex-end', float: 'center', marginTop: '1rem', marginRight: '1rem', borderRadius:'8px' }}
                        >
                          Reset
                        </Button>
                        <Button
                          variant="contained" size="small"
                          onClick={handleApplyFilters}
                          disabled={isDefaultFilters}
                          fullWidth sx={{ alignSelf: 'flex-end', float: 'center', marginTop: '12px' , borderRadius:'8px'}}
                        >
                          Apply Filters
                        </Button>
                      </Box>
                    </CardContent>
                  }
                </Card>
              </Box>
            </Box>
          </Card>
          )}
          {/* <Button
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
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Filter</span>
          </Button> */}
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

        <Box mb={1} sx={{ bgcolor: '#f5f5f5', paddingTop: '1rem', paddingBottom: '1rem', mx: isMobile ? '6px' : '8px', paddingInline: isMobile ? '8px' : '10px', borderRadius: '10px' }} > {/* sx={{ p: 2 }} */}
            {loadingLocation ? (
              // renderSkeletonCards()
              <SkeletonCards />
              // <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: "50vh" }}>
              //   <CircularProgress />
              // </Box>
            ) : ( loading ? (
              <SkeletonCards/>
            ) : 
            ( posts.length > 0 ? (
              <Grid container spacing={isMobile ? 1.5 : 1.5}>
                {posts.map((post, index) => (
                  <Grid item xs={12} sm={6} md={4} key={`${post._id}-${index}`} ref={index === posts.length - 3 ? lastPostRef : null} id={`post-${post._id}`}>
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
                      <CardMedia mx={isMobile ? "-12px" : "-2px"} sx={{ margin: '0rem 0', borderRadius: '8px', overflow: 'hidden', height: '160px', backgroundColor: '#f5f5f5' }}>
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
                        // onClick={() => openProductDetail(product)}
                        >
                          {(post.media).length > 0 ? (
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
                            <img
                              // src="../assets/null-product-image.webp" // Replace with the path to your placeholder image
                              src='https://placehold.co/56x56?text=No+Imag'
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
                        {/* {post.stockStatus === 'In Stock' && ( */}
                        <Typography variant="body2" color="textSecondary" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                          People Required: {post.peopleCount} ({post.gender})
                        </Typography>
                        {/* )} */}
                        <Typography variant="body2" color={post.postStatus === 'Active' ? 'green' : 'rgba(194, 28, 28, 0.89)'} style={{ display: 'inline-block', float: 'right', marginBottom: '0.5rem' }}>
                          Status: {post.postStatus}
                        </Typography>
                        {/* <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                          Service Days: {post.serviceDays}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                          UserCode : {post.userCode}
                        </Typography> */}
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

            {loadingMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems:'center', p: 4, gap:'1rem' }}>
                {/* <CircularProgress /> */}
                <LinearProgress sx={{ width: 84, height: 4, borderRadius: 2, mt: 0 }}/>
                <Typography color='grey' variant='body2'>Loading posts...</Typography>
              </Box>
            )}
            {!hasMore && posts.length > 0 && (
              <Typography textAlign="center" sx={{ p: 2, color: 'text.secondary' }}>
                You've reached the end of <strong>{totalPosts} posts</strong> in your area with in distance range {distanceRange} km...
              </Typography>
            )}
          </Box>


      </Box>
      {/* Filter Floating Card */}
      {/* {filterOpen && (
        <FilterPosts
          filterCriteria={filterCriteria}
          applyFilters={applyFilters}
          posts={posts}
          filteredPosts={filteredPosts}
          onClose={handleFilterToggle}
        />
      )} */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        action={snackbar.action}
      >
        <Alert onClose={handleCloseSnackbar} action={snackbar.action} severity={snackbar.severity} sx={{ width: '100%', borderRadius:'1rem' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    
    </Layout>
  );


};

export default Helper;
