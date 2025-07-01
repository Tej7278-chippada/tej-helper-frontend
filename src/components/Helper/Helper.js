// components/Helper/Helper.js
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {Alert, alpha, Box, Button, Card, CardContent, CardMedia, Chip, CircularProgress, Divider, FormControl, Grid, IconButton, InputAdornment, InputLabel, LinearProgress, MenuItem, Paper, Select, Snackbar, Stack, styled, TextField, Toolbar, Tooltip, Typography, useMediaQuery} from '@mui/material';
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
import CloseIcon from '@mui/icons-material/Close';
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
import LazyBackgroundImage from './LazyBackgroundImage';
import ShareLocationRoundedIcon from '@mui/icons-material/ShareLocationRounded';
import DemoPosts from '../Banners/DemoPosts';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CategoryBar from './CategoryBar';
// import PersonIcon from '@mui/icons-material/Person';
// import CategoryIcon from '@mui/icons-material/Category';
// import PriceChangeIcon from '@mui/icons-material/PriceChange';
// import WorkIcon from '@mui/icons-material/Work';

// Create a cache outside the component to persist between mounts
const globalCache = {
  data: {},
  lastCacheKey: null,
  lastScrollPosition: 0,
  lastViewedPostId: null,
  lastFilters: null,
  totalPostsCount: 0
};

// Default filter values
const DEFAULT_FILTERS = {
  categories: '',
  serviceType: '',
  gender: '',
  postStatus: '',
  priceRange: [0, 100000],
  postType: 'HelpRequest' // added this line for only shows the Helper posts on ALL section
};

const getGlassmorphismStyle = (theme, darkMode) => ({
  background: darkMode 
    ? 'rgba(30, 30, 30, 0.85)' 
    : 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  border: darkMode 
    ? '1px solid rgba(255, 255, 255, 0.1)' 
    : '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: darkMode 
    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
});

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex', 
  justifyContent: 'flex-end', 
  transition: 'all 0.3s ease',
}));

const SearchTextField = styled(TextField)(({ theme, expanded, darkMode }) => ({
  transition: 'all 0.3s ease',
  width: expanded ? '100%' : '40px',
  overflow: 'hidden',
  // ...getGlassmorphismStyle(),
  // background:'rgba(0,0,0,0)',
  '& .MuiInputBase-root': {
    height: '40px',
    borderRadius: '20px',
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '&.Mui-focused': {
      // ...getGlassmorphismStyle(0.25, 20),
      // background:'rgba(0,0,0,0)',
      background: darkMode 
        ? 'rgba(205, 201, 201, 0.15)' 
        : 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px)',
      border: darkMode 
        ? '1px solid rgba(255, 255, 255, 0.1)' 
        : '1px solid rgba(255, 255, 255, 0.2)',
    },
  },
  '& .MuiInputBase-input': {
    opacity: expanded ? 1 : 0,
    transition: 'opacity 0.2s ease',
    padding: expanded ? '6px 12px 6px 12px' : '6px 0',
    cursor: expanded ? 'text' : 'pointer',
    // ...getGlassmorphismStyle(),
  },
}));

// Enhanced glassmorphism styles
// const getGlassmorphismStyle = (opacity = 0.15, blur = 20) => ({
//   background: `rgba(255, 255, 255, ${opacity})`,
//   backdropFilter: `blur(${blur}px)`,
//   border: '1px solid rgba(255, 255, 255, 0.2)',
//   boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
// });

const Helper = ({ darkMode, toggleDarkMode, unreadCount, shouldAnimate})=> {
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

  const [selectedCategory, setSelectedCategory] = useState(() => {
    const savedFilters = localStorage.getItem('helperFilters');
    return savedFilters 
      ? JSON.parse(savedFilters).categories || JSON.parse(savedFilters).serviceType || '' 
      : '';
  });
  // useEffect to sync selectedCategory with filters
  // useEffect(() => {
  //   setSelectedCategory(filters.categories || filters.serviceType  || '');
  // }, [filters.categories, filters.serviceType]);

  // function to handle category selection
  const handleCategorySelect = (value) => {
    setSelectedCategory(value);
    // Determine if the selected value is a category or service
    const isCategory = ['', 'Paid', 'UnPaid', 'Emergency'].includes(value);
    const isService = [
      'ParkingSpace', 'VehicleRental', 'Laundry', 'Cleaning', 
      'Cooking', 'Tutoring', 'PetCare', 'Delivery', 'Maintenance', 'Other'
    ].includes(value);

    // Update filters
    const newFilters = { 
      ...filters,
      categories: isCategory ? value : '',
      serviceType: isService ? value : '',
      postType: isService ? 'ServiceOffering' : 'HelpRequest' // added this line for only shows the Helper posts on ALL section
    };

    setFilters(newFilters);
    setLocalFilters(newFilters);
    setSkip(0);
    // Clear cache for the old filter combination
    globalCache.lastCacheKey = null;
    // Ensure filters are saved to localStorage
    localStorage.setItem('helperFilters', JSON.stringify(newFilters));
  };

  // Reset filters
  const handleResetFilters = () => {
    setLocalFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setSelectedCategory(''); // for category bar 'ALL' selection 
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

  // Add search state at the top with other state declarations
  const [searchQuery, setSearchQuery] = useState(() => {
  const savedSearch = localStorage.getItem('helperSearchQuery');
    return savedSearch || '';
  });
  const [isSearching, setIsSearching] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef(null);

  const handleSearchClick = () => {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100); // Small delay for smooth expansion
  };

  const handleClearClick = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    if (!searchQuery) {
      setExpanded(false);
    }
  };

  // Generate a cache key based on current filters/location/searchQuery
  const generateCacheKey = useCallback(() => {
    return JSON.stringify({
      lat: userLocation?.latitude,
      lng: userLocation?.longitude,
      distance: distanceRange,
      search: searchQuery, // Add search query to cache key
      ...filters
    });
  }, [userLocation, distanceRange, filters, searchQuery]);

  // Add this effect to save search query to localStorage
  useEffect(() => {
    localStorage.setItem('helperSearchQuery', searchQuery);
  }, [searchQuery]);

  // Add search handler function
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSkip(0); // Reset pagination when searching
    // Clear cache for the old search query
    globalCache.lastCacheKey = null;
  };

  // Add clear search handler
  const handleClearSearch = () => {
    setSearchQuery('');
    setSkip(0);
    globalCache.lastCacheKey = null;
  };

  // Fetch posts data
  useEffect(() => {
    if (!distanceRange || !userLocation) {
      setPosts([]);
      return;
    }
    const currentCacheKey = generateCacheKey();
    const fetchData = async () => {
        // setLoading(true);
        // localStorage.setItem('currentPage', currentPage); // Persist current page to localStorage
        try {
          setLoading(true);
          setIsSearching(!!searchQuery); // Set searching state based on query
          // if (globalCache.lastSearchQuery) {
          //   setSearchQuery(globalCache.lastSearchQuery);
          //   // // Trigger a search if we have a cached query
          //   // const timer = setTimeout(() => {
          //   //   handleSearch();
          //   // }, 100);
            
          //   // return () => clearTimeout(timer);
          // }
          // Check if we have valid cached data
          if (globalCache.data[currentCacheKey] && 
            globalCache.lastCacheKey === currentCacheKey &&
            JSON.stringify(globalCache.lastFilters) === JSON.stringify(filters)) {
              const { posts: cachedPosts, skip: cachedSkip, hasMore: cachedHasMore } = globalCache.data[currentCacheKey];
          
              setPosts(cachedPosts);
              setSkip(cachedSkip);
              setHasMore(cachedHasMore);
              setTotalPosts(globalCache.totalPostsCount);
              setLoading(false);
              setIsSearching(false);
              
              // Reset scroll restoration flag
              hasRestoredScroll.current = false;
              
              return;
            }
          // No valid cache - fetch fresh data
          const response = await fetchPosts(0, 12, userLocation, distanceRange, filters, searchQuery);
          const newPosts = response.data.posts || [];
          setTotalPosts(response.data.totalCount);
          globalCache.totalPostsCount = (response.data.totalCount);
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
          console.log(`posts fetched in range ${distanceRange} with search "${searchQuery}" and initial count ${response.data.posts.length} and total count ${response.data.totalCount}`);
        } catch (error) {
          console.error("Error fetching posts:", error);
          setSnackbar({ open: true, message: 'Failed to fetch the posts within your distance radius.', severity: 'error' });
        } finally {
          setLoading(false);
          setIsSearching(false);
        }
    };
    if (userLocation && distanceRange) {
      fetchData();
    }
  }, [userLocation, distanceRange, filters, generateCacheKey, searchQuery]); // Add distanceRange as dependency

  // Load more posts function
  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const response = await fetchPosts(skip, 12, userLocation, distanceRange, filters, searchQuery);
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
        console.log(`Fetched ${newPosts.length} new posts with search "${searchQuery}"  (skip: ${skip}, total: ${response.data.totalCount})`);
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

  // Add this function to clear search query on page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only clear on actual page refresh, not navigation
      localStorage.removeItem('helperSearchQuery');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
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
    <Layout username={tokenUsername} darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate}>
      {/* Demo Posts Banner Section */}
      <Box sx={{                              // to top
        background: isMobile ? 'linear-gradient(310deg, #4361ee 0%, #3a0ca3 50%, transparent 100%)' : 'linear-gradient(310deg, #4361ee 0%, #3a0ca3 50%, transparent 100%)',
        color: 'white',
        padding: isMobile ? '1.5rem 1rem' : '2rem', pt: '6rem',
        textAlign: 'center',
        borderRadius: '0 0 16px 16px', mt: -8,
        // margin: isMobile ? '0.5rem' : '1rem',
        boxShadow: '0 4px 20px rgba(67, 97, 238, 0.3)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0, backdropFilter: 'blur(20px)',
          background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.2) 0%, transparent 70%)',
          zIndex: 0
        }
      }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" sx={{
          fontWeight: 700,
          mb: 1,
          position: 'relative',
          zIndex: 1,
          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          Help Others, Earn Money
        </Typography>
        <Typography variant={isMobile ? 'body1' : 'h6'} sx={{
          maxWidth: '800px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          opacity: 0.9,
          lineHeight: 1.6
        }}>
          Help others with their needs and get paid for your services.
           {/* Find opportunities in your area and make a difference while earning. */}
        </Typography>
        {/* <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 2,
          position: 'relative',
          zIndex: 1
        }}>
          <Button 
            variant="contained" 
            color="secondary"
            sx={{
              borderRadius: '50px',
              px: 3,
              py: 1,
              fontWeight: 600,
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 15px rgba(0,0,0,0.3)'
              },
              transition: 'all 0.3s ease'
            }}
            onClick={() => setShowDistanceRanges(true)}
          >
            Explore Opportunities
          </Button>
        </Box> */}
        <DemoPosts isMobile={isMobile} postId={'685bee5458f2f12cad780008'} />
      </Box>
      {/* <Paper
        sx={{
          // position: 'fixed',
          // bottom: 0,
          // left: 0,
          // right: 0,
          zIndex: 1200, ...getGlassmorphismStyle(theme, darkMode), m: '12px', p:'12px',
          // background: 'rgba(255, 255, 255, 0.85)',
          // backdropFilter: 'blur(20px)',
          // borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          // borderTopRightRadius: '20px',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          // transform: visible ? 'translateY(0)' : 'translateY(100%)',
          // opacity: visible ? 1 : 0,
          // pointerEvents: visible ? 'auto' : 'none',
          // boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0), transparent)',
          }
        }}
        elevation={3}
      >
        <Typography textAlign="center">
          Category Bar (Under development)
        </Typography>
      </Paper> */}
      <CategoryBar selectedCategory={selectedCategory} onCategorySelect={handleCategorySelect} darkMode={darkMode} isMobile={isMobile}/>
      <Box>
      <Toolbar sx={{display:'flex', justifyContent:'space-between',
      //  background: 'rgba(255,255,255,0.8)',  backdropFilter: 'blur(10px)',
          // boxShadow: '0 2px 10px rgba(0,0,0,0.05)', 
          borderRadius: '12px', 
          padding: isMobile ? '2px 12px' : '2px 16px',  margin: '4px',
          position: 'relative', //sticky
          top: 0,
          zIndex: 1000, 
          // ...getGlassmorphismStyle(0.1, 10),
          }}> 
          {/* <Typography variant="h6" style={{ flexGrow: 1, marginRight: '2rem' }}>
            Posts
          </Typography> */}
          <Box display="flex" justifyContent="flex-start" sx={{flexGrow: 1, marginRight: '6px', marginLeft: isMobile ? '-12px' : '-14px'}}>
          <IconButton  onClick={() => setShowMap(true)}sx={{
              borderRadius: '12px',
              padding: '8px 12px',
              // background: 'rgba(67, 97, 238, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(67, 97, 238, 0.1)',
                transform: 'translateY(-2px)',
              }
            }}>
            <LocationOnIcon sx={{ color: '#4361ee' }} />
            <Typography variant="body1" sx={{ 
                color: '#4361ee',
                fontWeight: 600,
                maxWidth: isMobile ? '120px' : '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
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
                top: isMobile ? '62px' : '72px',
                left: '1px',
                width: '95%',
                maxWidth: isMobile ? '400px' : '600px',
                zIndex: 1000,
                borderRadius: '12px',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
                // backgroundColor: '#fff', 
                '& .MuiCardContent-root': {padding: '10px' },
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
          {/* Search Bar */}
          {!isMobile && <SearchContainer>
            <Box>
            <SearchTextField
              variant="outlined"
              placeholder={expanded ? "Search posts..." : ""}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setExpanded(true)}
              onBlur={handleBlur}
              inputRef={inputRef}
              expanded={expanded} darkMode={darkMode}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton 
                      onClick={!expanded ? handleSearchClick : undefined}
                      sx={{
                        minWidth: '40px',
                        minHeight: '40px',
                        // marginLeft: expanded ? '8px' : '0px',
                      }}
                    >
                      {isSearching ? (
                        <CircularProgress size={16} />
                      ) : (
                        <SearchIcon color="action" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
                endAdornment: expanded && searchQuery && (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={handleClearClick}
                      size="small"
                      sx={{ mr: '6px' }}
                    >
                      <ClearIcon color="action" fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  padding: 0,
                }
              }}
            />
            
            </Box>
          </SearchContainer>}
          {/* {!isMobile && (<>
            <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexGrow: 1, 
            maxWidth: isMobile ? '200px' : '300px',
            marginRight: '8px'
          }}>
            <TextField
              placeholder="Search posts..."
              value={searchQuery}
              onChange={handleSearch}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    {isSearching ? (
                      <CircularProgress size={16} />
                    ) : (
                      <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    )}
                  </Box>
                ),
                endAdornment: searchQuery && (
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    sx={{ p: 0.5 }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                ),
                sx: {
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }
                }
              }}
            />
          </Box>
            </>)} */}
          {isMobile && !expanded && <IconButton 
            onClick={!expanded ? handleSearchClick : undefined}
            sx={{
              minWidth: '40px',
              minHeight: '40px',
              marginLeft: expanded ? '8px' : '0px',
            }}
          >
            {isSearching ? (
              <CircularProgress size={16} />
            ) : (
              <SearchIcon color="action" />
            )}
          </IconButton>}
          <Box sx={{display:'flex', justifyContent:'space-between', marginRight:'-6px', marginLeft:'8px'}}>
          {/* Button to Open Distance Menu */}
          {/* Distance Button */}
          <Button
            variant="contained"
            // onClick={handleDistanceMenuOpen}
            onClick={() => setShowDistanceRanges(true)}
            startIcon={<ShareLocationRoundedIcon />}
            sx={{
              // backgroundColor: "#1976d2",
              // color: "#fff",
              // padding: "8px 12px",
              borderRadius: "12px",
              // boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              // "&:hover": { backgroundColor: "#1565c0" },
              // display: "flex",
              // alignItems: "center",
              // gap: "8px",
              // marginRight: "6px",
              boxShadow: '0 2px 8px rgba(67, 97, 238, 0.2)',
              '&:hover': { 
                boxShadow: '0 6px 20px rgba(67, 97, 238, 0.4)',
                transform: 'translateY(-2px)',
              },
              background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
              textTransform: 'none',
              fontWeight: 600,
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
              top: isMobile ? '62px' : '72px',
              right: '1px', ml: '4px',
              // width: '90%',
              // maxWidth: '400px',
              zIndex: 1000,  '& .MuiPaper-root': { borderRadius:'12px'}, borderRadius: '10px', backdropFilter: 'blur(10px)',
              /* boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', */  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              // background: 'rgba(255, 255, 255, 0.9)',
              background: 'rgba(255, 255, 255, 0.95)',
              '& .MuiCardContent-root': {padding: '10px' },  }}
          >
            <Box sx={{ m: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'column', gap: 1 }}>
              <Box sx={{ m: 0, borderRadius:'8px'}}>
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
                    *Custom range (1-1000km)
                  </Typography>
                  <TextField
                    // label="custom range (km)"
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
                      width: "100px",
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
              <Divider/>
              <Box sx={{maxWidth: '450px'}}>
                {/* Filter Card */}
                <Box sx={{
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

                        {/* Service Filters */}
                        <FormControl size='small' sx={{ flex: '1 1 140px', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                          <InputLabel>Service Type</InputLabel>
                          <Select
                            name="serviceType"
                            value={localFilters.serviceType || ''}
                            onChange={handleFilterChange}
                            label="Service Type"
                          >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="ParkingSpace">Parking</MenuItem>
                            <MenuItem value="VehicleRental">Vehicle Rental</MenuItem>
                            <MenuItem value="Laundry">Laundry</MenuItem>
                            <MenuItem value="Cleaning">Cleaning</MenuItem>
                            <MenuItem value="Cooking">Cooking</MenuItem>
                            <MenuItem value="Tutoring">Tutoring</MenuItem>
                            <MenuItem value="PetCare">Pet Care</MenuItem>
                            <MenuItem value="Delivery">Delivery</MenuItem>
                            <MenuItem value="Maintenance">Maintenance</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
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
                      <Box gap={2} mt={3} sx={{display:'flex'}}>
                        <Button
                          variant="outlined"
                          onClick={handleResetFilters}
                          disabled={isDefaultFilters}
                          fullWidth sx={{ borderRadius:'8px' }}
                        >
                          Reset
                        </Button>
                        <Button
                          variant="contained" 
                          onClick={handleApplyFilters}
                          disabled={isDefaultFilters}
                          fullWidth sx={{ borderRadius:'8px'}}
                        >
                          Apply
                        </Button>
                      </Box>
                    </CardContent>
                  }
                </Box>
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
        {/* Search Bar */}
        {/* {isMobile && (<>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          // flexGrow: 1, 
          // maxWidth: isMobile ? '200px' : '300px',
          mx: 3
        }}>
          <TextField
            placeholder="Search posts..."
            value={searchQuery}
            onChange={handleSearch}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  {isSearching ? (
                    <CircularProgress size={16} />
                  ) : (
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  )}
                </Box>
              ),
              endAdornment: searchQuery && (
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  sx={{ p: 0.5 }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              ),
              sx: {
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }
              }
            }}
          />
        </Box></>)} */}
        {/* Search Bar */}
         {isMobile && expanded &&  <SearchContainer sx={{mx : 2}}>
            <Box>
            <SearchTextField
              variant="outlined"
              placeholder={expanded ? "Search posts..." : ""}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setExpanded(true)}
              onBlur={handleBlur}
              inputRef={inputRef}
              expanded={expanded} darkMode={darkMode}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton 
                      onClick={!expanded ? handleSearchClick : undefined}
                      sx={{
                        minWidth: '40px',
                        minHeight: '40px',
                        // marginLeft: expanded ? '8px' : '0px',
                      }}
                    >
                      {isSearching ? (
                        <CircularProgress size={16} />
                      ) : (
                        <SearchIcon color="action" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
                endAdornment: expanded && searchQuery && (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={handleClearClick}
                      size="small"
                      sx={{ mr: '6px' }}
                    >
                      <ClearIcon color="action" fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  p: 0,
                }
              }}
            />
            
            </Box>
          </SearchContainer> }

        <Box mb={1} sx={{ background: 'rgba(255, 255, 255, 0)',  backdropFilter: 'blur(10px)', paddingTop: '1rem', paddingBottom: '1rem', mx: isMobile ? '6px' : '8px', paddingInline: isMobile ? '8px' : '10px', borderRadius: '10px' }} > {/* sx={{ p: 2 }} */}
          {loadingLocation || loading ? (
              <SkeletonCards/>
            ) : 
            ( posts.length > 0 ? (
              <Grid container spacing={isMobile ? 1.5 : 1.5}>
                {posts.map((post, index) => (
                  <Grid item xs={12} sm={6} md={4} key={`${post._id}-${index}`} ref={index === posts.length - 3 ? lastPostRef : null} id={`post-${post._id}`}>
                    <Card sx={{
                      margin: '0rem 0',  // spacing between up and down cards
                      cursor: 'pointer',
                      // backdropFilter: 'blur(5px)',
                      // background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                      // backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        // transform: 'translateY(-8px)',
                        boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`,
                        '& .card-actions': {
                          opacity: 1,
                          transform: 'translateY(0)'
                        },
                        '& .price-chip': {
                          transform: 'scale(1.05)'
                        }
                      },
                      // border: '1px solid rgba(255,255,255,0.2)',
                      // boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      // transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      // '&:hover': {
                      //   transform: 'translateY(-4px)',
                      //   boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                      // },
                      // transition: 'transform 0.1s ease, box-shadow 0.1s ease', // Smooth transition for hover
                      position: 'relative',
                      height: isMobile ? '260px' : '300px', // Fixed height for consistency
                      overflow: 'hidden',
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
                      {/* <CardMedia mx={isMobile ? "-12px" : "-2px"} sx={{ margin: '0rem 0', borderRadius: '8px', overflow: 'hidden', height: '160px', backgroundColor: '#f5f5f5' }}>
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
                      {/* Status Badge */}
                      {/* <Chip
                        label={post.postStatus}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          backgroundColor: post.postStatus === 'Active' ? 'success.main' : 'error.main',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      /> */}
                      {/* Full Time Badge */}
                      {/* {post.isFullTime && (
                        <Chip
                          icon={<WorkIcon sx={{ fontSize: 16 }} />}
                          label="Full Time"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            backgroundColor: 'info.main',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      )} */}
                      <CardContent style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '16px',
                        color: 'white'
                      }}>
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
                        {/* {post.stockStatus === 'In Stock' && ( */}
                        <Typography variant="body2" style={{ display: 'inline-block', marginBottom: '0.5rem',  color: 'rgba(255, 255, 255, 0.9)' }}>
                          People Required: {post.peopleCount} ({post.gender})
                        </Typography>
                        {/* )} */}
                        <Typography variant="body2" style={{ display: 'inline-block', float: 'right', marginBottom: '0.5rem', color: post.postStatus === 'Active' ? '#a5ffa5' : '#ffa5a5' }}>
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
                            marginBottom: '0rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis',
                            maxHeight: '3rem',  // This keeps the text within three lines based on the line height.
                            lineHeight: '1.5rem',  // Adjust to control exact line spacing.
                            color: 'rgba(255, 255, 255, 0.9)'
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
                       {/* <Stack spacing={1.5}>
                          Title and Price Row
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Tooltip title={post.title} placement="top">
                              <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  flex: 1,
                                  mr: 1,
                                  color: 'white'
                                }}
                              >
                                {post.title}
                              </Typography>
                            </Tooltip>
                            
                            <Chip
                              className="price-chip"
                              icon={<PriceChangeIcon sx={{ fontSize: 16 }} />}
                              label={`₹${post.price}`}
                              variant="filled"
                              sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.77)',
                                color: 'success.main',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                transition: 'transform 0.2s ease', p:'2px 4px'
                              }}
                            />
                          </Box>

                          Category and People Count
                          <Box display="flex" gap={1} flexWrap="wrap">
                            <Chip
                              icon={<CategoryIcon color="#f5f5f5" sx={{ fontSize: 14 }} />}
                              label={post.categories}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: post.categories === 'Emergency' ? 'error.main' : 'white',
                                color: post.categories === 'Emergency' ? 'error.main' : 'white',
                                fontSize: '0.75rem'
                              }}
                            />
                            
                            <Chip
                              icon={<PersonIcon color="#f5f5f5" sx={{ fontSize: 14 }} />}
                              label={`${post.peopleCount} (${post.gender})`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem', color: 'white' }}
                            />
                          </Box>

                          Description
                          <Typography
                            variant="body2"
                            color="white"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 1, // no of lines of description
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.4
                            }}
                          >
                            {post.description}
                          </Typography>
                        </Stack> */}
                      </CardContent>
                      </LazyBackgroundImage>
                    </Card>

                  </Grid>
                ))}

              </Grid>
            ) : ( 
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '50vh',
                textAlign: 'center',
              }}>
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" 
                  alt="No posts found" 
                  style={{ width: '100px', opacity: 0.7, marginBottom: '16px' }}
                />
                <Typography variant="body1" color="text.secondary">
                  {searchQuery 
                    ? `No posts found for "${searchQuery}" within ${distanceRange} km`
                    : `No posts found within ${distanceRange} km of your location...`
                  }
                </Typography>
                {searchQuery && (
                  <Button 
                    variant="outlined" 
                    sx={{ mt: 2, borderRadius: '12px' }}
                    onClick={handleClearSearch}
                  >
                    Clear Search
                  </Button>
                )}
                {!searchQuery && (
                  <Button 
                    variant="outlined" 
                    disabled={distanceRange >= 100}
                    sx={{ mt: 2, borderRadius: '12px' }}
                    onClick={() => setDistanceRange(prev => Math.min(prev + 5, 100))}
                  >
                    Increase Search Radius
                  </Button>
                )}
              </Box>
            )
            )}

            {loadingMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems:'center', p: 4, gap:'1rem' }}>
                <CircularProgress size={24} />
                {/* <LinearProgress sx={{ width: 84, height: 4, borderRadius: 2, mt: 0 }}/> */}
                <Typography color='grey' variant='body2'>Loading posts...</Typography>
              </Box>
            )}
            {!hasMore && posts.length > 0 && (
              <Box sx={{ 
                textAlign: 'center', 
                p: 3,
                backgroundColor: 'rgba(25, 118, 210, 0.05)',
                borderRadius: '12px',
                mt: 2
              }}>
                <Typography color="text.secondary">
                  You've reached the end of <strong>{totalPosts} posts</strong> in your area
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Current search range: {distanceRange} km
                </Typography>
              </Box>
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
