// components/Helper/Helper.js
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {Alert, alpha, Box, Button, Card, CardContent, CardMedia, Chip, CircularProgress, Divider, FormControl, Grid, IconButton, InputAdornment, InputLabel, LinearProgress, MenuItem, Paper, Select, Snackbar, Stack, styled, Switch, TextField, Toolbar, Tooltip, Typography, useMediaQuery, ListItemIcon,
  Fade, Fab, 
  CardActions,
  Avatar,
  Rating} from '@mui/material';
import Layout from '../Layout';
// import { useTheme } from '@emotion/react';
// import FilterListIcon from "@mui/icons-material/FilterList";
// import FavoriteIcon from '@mui/icons-material/Favorite';
// import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import SkeletonCards from './SkeletonCards';
import LazyImage from './LazyImage';
import { useTheme } from '@emotion/react';
import API, { fetchBloodDonorLocations, fetchBloodDonors, fetchNearbyUsers, fetchNearbyUsersLocations, fetchPostById, fetchPostLocations, fetchPosts } from '../api/api';
import { Link, useNavigate } from 'react-router-dom';
// import FilterPosts from './FilterPosts';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
// import RefreshIcon from '@mui/icons-material/Refresh';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SatelliteAltRoundedIcon from '@mui/icons-material/SatelliteAltRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import DistanceSlider from './DistanceSlider';
import LazyBackgroundImage from './LazyBackgroundImage';
import ShareLocationRoundedIcon from '@mui/icons-material/ShareLocationRounded';
// import DemoPosts from '../Banners/DemoPosts';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
// import CategoryBar from './CategoryBar';
// import Friends from '../Friends/Friends';
// import PersonIcon from '@mui/icons-material/Person';
// import CategoryIcon from '@mui/icons-material/Category';
// import PriceChangeIcon from '@mui/icons-material/PriceChange';
import WorkIcon from '@mui/icons-material/Work';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import { formatPrice } from '../../utils/priceFormatter';
import MenuCard from './MenuCard';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
// import LayersIcon from '@mui/icons-material/Layers';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import { WaveAnimationCircles } from '../Maps/WaveAnimation';
import CompareRoundedIcon from '@mui/icons-material/CompareRounded';
// import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import LocationPermissionDialog from '../Maps/LocationPermissionDialog';
import NotificationPermissionDialog from '../Notifications/NotificationPermissionDialog';
import ComparePostsDialog from './ComparePostsDialog';
import BloodDonorCard from './BloodDonorCard';
import { VerifiedRounded, 
  ExpandLess,
  ExpandMore,
  TransgenderRounded,
  ManRounded,
  WomanRounded,
  PersonRounded,
  CakeRounded,
  SearchRounded,
  PeopleRounded,
  FavoriteRounded,
  BusinessCenterRounded,
  SportsSoccerRounded,
  FlightRounded,
  SchoolRounded,
  HandshakeRounded,
  InfoRounded,
  ClearRounded,
  FilterListRounded,
  Diversity1Rounded,
  CheckCircleRounded,
  AttachMoneyRounded,
  BloodtypeRounded,
  ChildCareRounded,
  CurrencyRupeeRounded,
  ScheduleRounded,
 } from '@mui/icons-material';
import UserProfileDetails from './UserProfileDetails';
import { Slider } from '@mui/material';
import FriendsCard from '../Friends/FriendsCard';

// Component to handle map events
function MapEvents({ setMap }) {
  const map = useMap();
  
  useEffect(() => {
    setMap(map);
  }, [map, setMap]);
  
  return null;
}

// Create a cache outside the component to persist between mounts
const globalCache = {
  data: {},
  lastCacheKey: null,
  lastScrollPosition: 0,
  lastViewedPostId: null,
  lastFilters: null,
  totalPostsCount: 0,
  locationsData: {}, // Separate cache for locations
  lastLocationsCacheKey: null, // Separate cache key for locations
  totalLocationsCount: 0, // Separate count for locations
  lastMapCenter: null,
  lastMapZoom: null,
  lastClickedMarkerId: null,
  lastMapBounds: null,
  lastMapView: null,
  mapMode: 'normal',
};

// Default filter values
const DEFAULT_FILTERS = {
  sortBy: 'nearest',
  categories: 'Paid',
  serviceType: '',
  gender: '',
  postStatus: '',
  priceRange: [0, 20000],
  postType: 'HelpRequest', // added this line for only shows the Helper posts on ALL section
  bloodGroup: 'All',
  // Friends-specific filters
  friendsGender: '',
  friendsLookingFor: [],
  friendsAgeRange: [18, 65],
  // friendsMaxDistance: 50,
  // friendsInAppMessaging: 'all',
  // friendsHobbies: [],
  // friendsStatus: 'active'
};

// component to handle map view persistence
// function MapViewPersister({ mapRef }) {
//   const map = useMap();
  
//   useEffect(() => {
//     if (!map) return;
    
//     // Save view on move
//     const saveView = () => {
//       const center = map.getCenter();
//       const zoom = map.getZoom();
      
//       globalCache.lastMapCenter = [center.lat, center.lng];
//       globalCache.lastMapZoom = zoom;
      
//       localStorage.setItem('lastMapCenter', JSON.stringify([center.lat, center.lng]));
//       localStorage.setItem('lastMapZoom', zoom.toString());
//       localStorage.setItem('lastMapViewTimestamp', Date.now().toString());
//     };
    
//     map.on('moveend', saveView);
//     map.on('zoomend', saveView);
    
//     return () => {
//       map.off('moveend', saveView);
//       map.off('zoomend', saveView);
//     };
//   }, [map]);
  
//   return null;
// }

// const getGlassmorphismStyle = (theme, darkMode) => ({
//   background: darkMode 
//     ? 'rgba(30, 30, 30, 0.85)' 
//     : 'rgba(255, 255, 255, 0.15)',
//   backdropFilter: 'blur(20px)',
//   border: darkMode 
//     ? '1px solid rgba(255, 255, 255, 0.1)' 
//     : '1px solid rgba(255, 255, 255, 0.2)',
//   boxShadow: darkMode 
//     ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
//     : '0 8px 32px rgba(0, 0, 0, 0.1)',
// });

// const getGlassmorphismCardStyle = (theme, darkMode) => ({
//   background: 'rgba(205, 201, 201, 0.15)',
//   backdropFilter: 'blur(20px)',
//   border: darkMode 
//     ? '1px solid rgba(255, 255, 255, 0.1)' 
//     : '1px solid rgba(255, 255, 255, 0.2)',
//   boxShadow: darkMode 
//     ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
//     : '0 8px 32px rgba(0, 0, 0, 0.1)',
// });

const getButtonStyle = (darkMode, button) => ({
  background: button 
    ?  (darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)') 
    : 'transparent',
  backdropFilter: button ? 'blur(10px)' : 'none',
  border: button ? (darkMode 
    ? '1px solid rgba(255, 255, 255, 0.1)' 
    : '1px solid rgba(255, 255, 255, 0.2)') : 'transparent',
  color: darkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)',
  transition: 'all 0.2s ease',
  '&:hover': {
    border: button ? (darkMode 
    ? '1px solid rgba(255, 255, 255, 0.1)' 
    : '1px solid rgba(255, 255, 255, 0.2)') : 'transparent',
    transform: 'translateY(-1px)',
  }
});

const gradientHover = 'linear-gradient(135deg, #3a56d4 0%, #2d0a8c 50%, #5c0b9b 100%)';


const mapButtonStyle = (mapMode, isMobile) => ({
  color: mapMode === 'satellite' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  // width: isMobile ? 40 : 44,
  // height: isMobile ? 40 : 44,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'scale(1.05)',
  },
  transition: 'all 0.2s ease',
});

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex', 
  justifyContent: 'center', 
  transition: 'all 0.3s ease',
}));

const SearchTextField = styled(TextField, { shouldForwardProp: (prop) => prop !== "expanded" && prop !== "darkMode", })(({ theme, expanded, darkMode, isMobile }) => ({
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
    padding: expanded
      ? isMobile
        ? '6px 2px 6px 2px'
        : '6px 12px 6px 12px'
      : '6px 0',
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
  const userProfilePic = localStorage.getItem('tokenProfilePic');
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
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState(() => {
    const savedAddress = localStorage.getItem('userAddress');
    return savedAddress 
      ? savedAddress
      : '';
  });
  const [distanceRange, setDistanceRange] = useState(10); // Default distance range in km
  // const [anchorEl, setAnchorEl] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  const [mapMode, setMapMode] = useState( globalCache.mapMode || 'normal');
  const [mapInstance, setMapInstance] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(() => {
    const markerId = localStorage.getItem('lastClickedMarkerId');
    return markerId ? false : true;
    }
  );
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
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const scrollTimeoutRef = useRef(null);
  const lastScrollTopRef = useRef(0);
  const postsContainerRef = useRef(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  // const [bloodDonors, setBloodDonors] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginMessage, setLoginMessage] = useState({ open: false, message: "", severity: "info" });
  const [isUserProfileOpen, setUserProfileOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [isExtraFiltersOpen, setIsExtraFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem('helperFilters');
    return savedFilters ? JSON.parse(savedFilters) : DEFAULT_FILTERS;
  });
  // const [appliedFilter, setAppliedFilter] = useState({
  //   filtersCount: 0,
  //   filterType: '',
  // })

  // State for temporary filters before applying
  const [localFilters, setLocalFilters] = useState(filters);
  const [activePostFilters, setActivePostFilters] = useState({
    gender: false,
    status: false,
    price: false,
  });
  const [activeServiceFilters, setActiveServiceFilters] = useState({
    gender: false,
    status: false,
    price: false,
  });
  const [activeBloodDonorFilters, setActiveBloodDonorFilters] = useState({
    bloodGroup: false,
  });
  const [activeFriendFilters, setActiveFriendFilters] = useState({
    gender: false,
    ageRange: false,
    lookingFor: false
  });
  // const isDefaultFilters = useMemo(() => {
  //   return JSON.stringify(localFilters) === JSON.stringify(DEFAULT_FILTERS);
  // }, [localFilters]);
  // Add a ref to track if we've restored scroll position
  const hasRestoredScroll = useRef(false);
  

  // Handle filter changes
  // const handleFilterChange = (e) => {
  //   const { name, value } = e.target;
  //   setLocalFilters(prev => ({ ...prev, [name]: value }));
  // };

  // Handle price range changes
  // const handlePriceChange = (e, type) => {
  //   const value = Number(e.target.value);
  //   setLocalFilters(prev => ({
  //     ...prev,
  //     priceRange: type === 'min' 
  //       ? [value, prev.priceRange[1]] 
  //       : [prev.priceRange[0], value]
  //   }));
  // };

  // Add friends-specific filter handlers
  // const handleFriendsFilterChange = (e) => {
  //   const { name, value } = e.target;
  //   setLocalFilters(prev => ({ ...prev, [name]: value }));
  // };

  // Handle friends age range changes
  // const handleFriendsAgeRangeChange = (e, type) => {
  //   const value = Number(e.target.value);
  //   setLocalFilters(prev => {
  //     const newAgeRange = type === 'min' 
  //       ? [value, prev.friendsAgeRange[1]] 
  //       : [prev.friendsAgeRange[0], value];
      
  //     // Validate min <= max
  //     if (newAgeRange[0] > newAgeRange[1]) {
  //       if (type === 'min') {
  //         return { ...prev, friendsAgeRange: [value, value] };
  //       } else {
  //         return { ...prev, friendsAgeRange: [newAgeRange[0], newAgeRange[0]] };
  //       }
  //     }
      
  //     return { ...prev, friendsAgeRange: newAgeRange };
  //   });
  // };

  // Quick age range presets
  const handleQuickAgeRange = (range) => {
    setLocalFilters(prev => ({
      ...prev,
      friendsAgeRange: range
    }));
  };

  const handleFriendsGenderPreset = (gender) => {
    setLocalFilters(prev => ({
      ...prev,
      friendsGender: gender
    }));
  };

  // Handle friends distance change
  // const handleFriendsDistanceChange = (value) => {
  //   setLocalFilters(prev => ({
  //     ...prev,
  //     friendsMaxDistance: value
  //   }));
  // };

  // Handle looking for filter (multi-select) with toggle functionality
  // const handleLookingForChange = (event) => {
  //   const {
  //     target: { value },
  //   } = event;
  //   setLocalFilters(prev => ({
  //     ...prev,
  //     friendsLookingFor: typeof value === 'string' ? value.split(',') : value,
  //   }));
  // };

  // Toggle individual lookingFor items
  const toggleLookingForItem = (item) => {
    setLocalFilters(prev => {
      const currentLookingFor = prev.friendsLookingFor || [];
      const newLookingFor = currentLookingFor?.includes(item)
        ? currentLookingFor.filter(i => i !== item)
        : [...currentLookingFor, item];
      
      return { ...prev, friendsLookingFor: newLookingFor };
    });
  };

  // Clear all lookingFor items
  const clearLookingFor = () => {
    setLocalFilters(prev => ({ ...prev, friendsLookingFor: [] }));
  };

  // Handle hobbies filter
  // const handleHobbiesChange = (e) => {
  //   const value = e.target.value;
  //   setLocalFilters(prev => ({
  //     ...prev,
  //     friendsHobbies: value ? value.split(',').map(h => h.trim()) : []
  //   }));
  // };

  

  const [selectedCategory, setSelectedCategory] = useState(() => {
    const savedFilters = localStorage.getItem('helperFilters');
    return savedFilters 
      ? JSON.parse(savedFilters).categories || JSON.parse(savedFilters).serviceType || 'Paid' 
      : 'Paid';
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
      'ParkingSpace', 'VehicleRental', 'FurnitureRental', 'Grocery', 'Laundry', 'Events', 'Playgrounds', 'Cleaning',
      'Cooking', 'Tutoring', 'PetCare', 'Driver', 'Delivery', 'Maintenance', 'VehicleMech', 'HouseSaleLease', 'LandSaleLease', 'Other'
    ].includes(value);
    const isNearbyUser = ['BloodDonors', 'Friends', 'StandwithWomen'].includes(value);

    if (isNearbyUser) {
      setPostMarkers([]); // Clear post markers
      // setPosts([]);
    } else {
      setBloodDonorMarkers([]);
      // setBloodDonors([]); // Clear blood donors
    }

    // Update filters
    const newFilters = { 
      ...filters,
      categories: isCategory ? value : '',
      serviceType: (isService || isNearbyUser) ? value : '',
      postType: (isService || isNearbyUser) ? 'ServiceOffering' : 'HelpRequest' // added this line for only shows the Helper posts on ALL section
    };

    setFilters(newFilters);
    setLocalFilters(newFilters);
    setSkip(0);
    // Clear cache for the old filter combination
    globalCache.lastCacheKey = null;
    // Ensure filters are saved to localStorage
    localStorage.setItem('helperFilters', JSON.stringify(newFilters));
  };

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('helperFilters', JSON.stringify(filters));
    globalCache.lastFilters = filters;
    // Update active filters state based on current filters
    if (selectedCategory === 'Friends') {
      setActiveFriendFilters({
        gender: !!filters?.friendsGender && filters?.friendsGender !== '',
        ageRange: !(filters?.friendsAgeRange?.[0] === 18 && filters?.friendsAgeRange?.[1] === 65),
        lookingFor: filters?.friendsLookingFor && filters?.friendsLookingFor?.length > 0
      });
    } else if (selectedCategory === 'BloodDonors') {
      setActiveBloodDonorFilters({
        bloodGroup: !!filters?.bloodGroup && filters?.bloodGroup !== 'All'
      });
    } else if (selectedCategory === 'Paid' || selectedCategory === 'UnPaid' || selectedCategory === 'Emergency') {
      setActivePostFilters({
        gender: !!filters?.gender && filters?.gender !== '',
        status: !!filters?.postStatus && filters?.postStatus !== '',
        price: !(filters?.priceRange?.[0] === 0 && filters?.priceRange?.[1] === 20000)
      });
    } else {
      // Services
      setActiveServiceFilters({
        gender: !!filters?.gender && filters?.gender !== '',
        status: !!filters?.postStatus && filters?.postStatus !== '',
        price: !(filters?.priceRange?.[0] === 0 && filters?.priceRange?.[1] === 20000)
      });
    }
  }, [filters, selectedCategory]);

  // Apply filters
  const handleApplyFilters = () => {
    if (selectedCategory !== 'Friends' && localFilters.priceRange[0] > localFilters.priceRange[1]) {
      setSnackbar({ open: true, message: 'Min price cannot be greater than max price', severity: 'warning' });
      return;
    }
    
    // Validate age range for friends
    if (selectedCategory === 'Friends' && localFilters?.friendsAgeRange?.[0] > localFilters?.friendsAgeRange?.[1]) {
      setSnackbar({ open: true, message: 'Min age cannot be greater than max age', severity: 'warning' });
      return;
    }

    // Show success message based on category
    let appliedFilters = [];
    let categoryName = '';
    
    switch(selectedCategory) {
      case 'Friends':
        if (localFilters?.friendsGender && localFilters?.friendsGender !== '') {
          appliedFilters.push(`Gender: ${localFilters?.friendsGender}`);
        }
        if (!(localFilters?.friendsAgeRange?.[0] === 18 && localFilters?.friendsAgeRange?.[1] === 65)) {
          appliedFilters.push(`Age: ${localFilters?.friendsAgeRange?.[0]}-${localFilters?.friendsAgeRange?.[1]}`);
        }
        if (localFilters?.friendsLookingFor && localFilters?.friendsLookingFor?.length > 0) {
          appliedFilters.push(`Looking for: ${localFilters?.friendsLookingFor?.length} item(s)`);
        }
        categoryName = 'friends';
        break;
        
      case 'BloodDonors':
        if (localFilters?.bloodGroup && localFilters?.bloodGroup !== 'All') {
          appliedFilters.push(`Blood Group: ${localFilters?.bloodGroup}`);
        }
        categoryName = 'blood donor';
        break;
        
      case 'Paid':
      case 'UnPaid':
      case 'Emergency':
        if (localFilters?.gender && localFilters?.gender !== '') {
          appliedFilters.push(`Gender: ${localFilters?.gender}`);
        }
        if (localFilters?.postStatus && localFilters?.postStatus !== '') {
          appliedFilters.push(`Status: ${localFilters?.postStatus}`);
        }
        if (!(localFilters?.priceRange?.[0] === 0 && localFilters?.priceRange?.[1] === 20000)) {
          appliedFilters.push(`Price: ₹${localFilters?.priceRange?.[0]} - ₹${localFilters?.priceRange?.[1]}`);
        }
        categoryName = 'post';
        break;
        
      default: // Services
        if (localFilters?.gender && localFilters?.gender !== '') {
          appliedFilters.push(`Gender: ${localFilters?.gender}`);
        }
        if (localFilters?.postStatus && localFilters?.postStatus !== '') {
          appliedFilters.push(`Status: ${localFilters?.postStatus}`);
        }
        if (!(localFilters?.priceRange?.[0] === 0 && localFilters?.priceRange?.[1] === 20000)) {
          appliedFilters.push(`Price: ₹${localFilters?.priceRange?.[0]} - ₹${localFilters?.priceRange?.[1]}`);
        }
        categoryName = 'service';
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
    setIsExtraFiltersOpen(false);
    // Show success message
    if (appliedFilters.length > 0) {
      setSnackbar({ 
        open: true, 
        message: `Applied ${appliedFilters.length} ${categoryName} filter(s)`, 
        severity: 'success' 
      });
    }
    // setAppliedFilter({
    //   filtersCount: appliedFilters.length,
    //   filterType: categoryName
    // });
    // Show success message
    // if (selectedCategory === 'Friends') {
    //   const appliedFilters = [];
    //   if (localFilters?.friendsGender && localFilters?.friendsGender !== '') {
    //     appliedFilters.push(`Gender: ${localFilters?.friendsGender}`);
    //   }
    //   if (!(localFilters?.friendsAgeRange?.[0] === 18 && localFilters?.friendsAgeRange?.[1] === 65)) {
    //     appliedFilters.push(`Age: ${localFilters?.friendsAgeRange?.[0]}-${localFilters?.friendsAgeRange?.[1]}`);
    //   }
    //   if (localFilters?.friendsLookingFor && localFilters?.friendsLookingFor?.length > 0) {
    //     appliedFilters.push(`Looking for: ${localFilters?.friendsLookingFor?.length} item(s)`);
    //   }
      
      // if (appliedFilters.length > 0) {
      //   setSnackbar({ 
      //     open: true, 
      //     message: `Applied ${appliedFilters.length} friend filter(s)`, 
      //     severity: 'success' 
      //   });
      // }
    // }
  };

  // Reset filters
  // const handleResetFilters = () => {
  //   setLocalFilters(DEFAULT_FILTERS);
  //   setFilters(DEFAULT_FILTERS);
  //   setSelectedCategory('Paid'); // for category bar 'ALL' selection 
  //   setSortBy('nearest');
  //   setSkip(0);
  //   setPosts([]);
  //   // Clear cache for the old filter combination
  //   globalCache.lastCacheKey = null;
  //   localStorage.removeItem('helperFilters');
  //   setShowDistanceRanges(false);
  // };

  // Add price presets handler
  const handlePricePreset = (preset) => {
    setLocalFilters(prev => ({
      ...prev,
      priceRange: preset
    }));
  };

  // Add blood group presets handler
  const handleBloodGroupPreset = (group) => {
    setLocalFilters(prev => ({
      ...prev,
      bloodGroup: group
    }));
  };

  // Add quick gender presets handler
  const handleGenderPreset = (gender) => {
    setLocalFilters(prev => ({
      ...prev,
      gender: gender
    }));
  };

  // Add quick status presets handler
  const handleStatusPreset = (status) => {
    setLocalFilters(prev => ({
      ...prev,
      postStatus: status
    }));
  };

  // Toggle filter sections for different categories
  const toggleBloodDonorFilterSection = (section) => {
    setActiveBloodDonorFilters(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const togglePostFilterSection = (section) => {
    setActivePostFilters(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleServiceFilterSection = (section) => {
    setActiveServiceFilters(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Reset specific filters for each category
  const resetBloodDonorFilters = () => {
    setLocalFilters(prev => ({
      ...prev,
      bloodGroup: 'All'
    }));
  };

  const resetPostFilters = () => {
    setLocalFilters(prev => ({
      ...prev,
      gender: '',
      postStatus: '',
      priceRange: [0, 20000]
    }));
  };

  // Reset specific friend filters
  const resetFriendFilters = () => {
    setLocalFilters(prev => ({
      ...prev,
      friendsGender: '',
      friendsAgeRange: [18, 65],
      friendsLookingFor: []
    }));
  };

  // Toggle filter sections
  const toggleFilterSection = (section) => {
    setActiveFriendFilters(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const [sortBy, setSortBy] = useState(() => {
    const savedFilters = localStorage.getItem('helperFilters');
    return savedFilters 
      ? JSON.parse(savedFilters).sortBy
      : 'nearest';
  }); // 'latest' or 'nearest'
  const [showSortMenu, setShowSortMenu] = useState(false);

  // function to handle sort change
  const handleSortChange = (sortType) => {
    setSortBy(sortType);
    setShowSortMenu(false);
    // setShowDistanceRanges(false);
    // Update filters
    const newFilters = { 
      ...filters,
      sortBy: sortType
    };

    setFilters(newFilters);
    setLocalFilters(newFilters);
    setSkip(0);
    // Clear cache to force refetch with new sort order
    globalCache.lastCacheKey = null;
    // Ensure filters are saved to localStorage
    localStorage.setItem('helperFilters', JSON.stringify(newFilters));
  };

  // Custom marker icon
  // const userLocationIcon = new L.Icon({
  //   iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  //   iconSize: [30, 30],
  // });

  // Function to center map on user location
  // const centerMapOnUser = () => {
  //     if (userLocation && mapInstance) {
  //     mapInstance.setView([userLocation.latitude, userLocation.longitude], getZoomLevel(distanceRange));
  //     }
  // };

  // Function to handle zoom in
  const zoomIn = () => {
    if (mapInstance) {
      mapInstance.zoomIn();
    }
  };

  // Function to handle zoom out
  const zoomOut = () => {
    if (mapInstance) {
      mapInstance.zoomOut();
    }
  };

  const setMapModeType = () => {
    setMapMode(mapMode === 'normal' ? 'satellite' : 'normal');
    globalCache.mapMode = mapMode === 'normal' ? 'satellite' : 'normal';
  };

  // Function to hide the overlay
  const hideOverlay = () => {
    setOverlayVisible(false);
  };

  // Function to show the overlay
  // const showOverlay = () => {
  //   setOverlayVisible(true);
  // };

  const customIcon = new L.Icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41], // Default size
    iconAnchor: [12, 41], // Position relative to the point
    popupAnchor: [1, -34],
  });

  const userMappingIcon = (profilePic, username) => {
    const size = 40;
    const borderWidth = 2;
    const totalSize = size + borderWidth * 2;
    
    const html = `
      <div style="
        width: ${totalSize}px;
        height: ${totalSize}px;
        border-radius: 50%;
        border: ${borderWidth}px solid ${darkMode ? 'rgba(168, 168, 168, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
        background: linear-gradient(135deg, #4361ee 0%, #3f37c9 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        overflow: hidden;
      ">
        ${profilePic && profilePic !== 'null' 
          ? `<img src="data:image/jpeg;base64,${profilePic}" 
              style="width: ${size}px; height: ${size}px; object-fit: cover; border-radius: 50%;" 
              onerror="this.style.display='none'; this.parentNode.innerHTML='<div style=\\'color: white; font-weight: bold; font-size: 16px;\\'>${username[0]?.toUpperCase() || 'U'}</div>'" 
            />`
          : `<div style="color: white; font-weight: bold; font-size: 16px;">
              ${username[0]?.toUpperCase() || 'U'}
            </div>`
        }
      </div>
    `;
    
    return L.divIcon({
      html: html,
      iconSize: [totalSize, totalSize],
      iconAnchor: [totalSize / 2, totalSize / 2],
      popupAnchor: [0, -totalSize / 2],
      className: 'user-location-marker'
    });
  };

  const postsMappingIcon = useCallback((title, color, darkMode, type) => {
    const cacheKey = `${title}-${color}-${darkMode}`;
    
    if (!postIconCache[cacheKey]) {
      const size = 30;
      const borderWidth = 2;
      const totalSize = size + borderWidth * 2;
      
      const html = `
        <div style="
          width: ${totalSize}px;
          height: ${totalSize}px;
          border-radius: 50%;
          border: ${borderWidth}px solid ${darkMode ? 'rgba(168, 168, 168, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
          background: ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
        "
        onmouseenter="this.style.transform='scale(1.2)'; this.style.zIndex='1000';"
        onmouseleave="this.style.transform='scale(1)'; this.style.zIndex='';"
        >
          <div style="color: white; font-weight: bold; font-size: 16px; user-select: none;">
            ${type === 'BloodDonors' ? title : title?.[0]?.toUpperCase() || 'A'}
          </div>
        </div>
      `;
      
      postIconCache[cacheKey] = L.divIcon({
        html: html,
        iconSize: [totalSize, totalSize],
        iconAnchor: [totalSize / 2, totalSize / 2],
        popupAnchor: [0, -totalSize / 2],
        className: 'post-marker'
      });
    }
    
    return postIconCache[cacheKey];
  }, [darkMode]);

  // const [map, setMap] = useState(null);

  // const ChangeView = ({ center, getZoomLevel }) => {
  //   // const map = useMap();
  //   useEffect(() => {
  //     if (mapRef.current && userLocation && center) {
  //       mapRef.current.setView(center, getZoomLevel);
  //     }
  //   }, [center, getZoomLevel, userLocation]);
  //   return null;
  // };

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

  const fallbackLocation = (userRegion) => {
    const { region, city, raw } = JSON.parse(userRegion);
    setCurrentAddress(`${city}, ${region}`);
    setUserLocation({latitude: raw.latitude, longitude: raw.longitude});
    localStorage.setItem('userLocation', JSON.stringify({latitude: raw.latitude, longitude: raw.longitude, address: `${city}, ${region}`})); // Store in localStorage
  };


  // Fetch user's location and address
  const fetchUserLocation = useCallback(() => {
    window.scrollTo(0, 0);
    setLoadingLocation(true);

    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      const userRegion = localStorage.getItem('userLang');
      if (userRegion) {
        fallbackLocation(userRegion);
      }
      setLoadingLocation(false);
      return;
    }

    triggerLocation();
    
  }, []);

  const triggerLocation = () => {
    const hasSeenLocationDialog = localStorage.getItem('hasSeenLocationDialog');
    const locationPermissionRequested = localStorage.getItem('locationPermissionRequested');

    // Check location permission status first
    if ('geolocation' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(permission => {
        const locationStatus = permission.state;
        
        // If location permission hasn't been handled yet
        if (!hasSeenLocationDialog && locationStatus === 'prompt') {
          // Wait for app to load then show location dialog
          setTimeout(() => {
            setShowLocationDialog(true);
            localStorage.setItem('hasSeenLocationDialog', 'true');
          }, 1500);
        } else if (locationStatus === 'prompt' && locationPermissionRequested === 'later') {
          // Wait for app to load then show location dialog
          setTimeout(() => {
            setShowLocationDialog(true);
            localStorage.setItem('hasSeenLocationDialog', 'true');
          }, 1500);
        } else if (locationStatus === 'denied' && !locationPermissionRequested) {
          // Wait for app to load then show location dialog
          setTimeout(() => {
            setShowLocationDialog(true);
            localStorage.setItem('hasSeenLocationDialog', 'true');
          }, 1500);
        } else if (locationStatus === 'denied' && locationPermissionRequested) {
          // Location was denied, store this
          localStorage.setItem('locationPermissionRequested', 'denied');
          const userRegion = localStorage.getItem('userLang');
          if (userRegion) {
            fallbackLocation(userRegion);
          }
          // Check for notifications after location handling
          checkNotificationsAfterLocation();
          setLoadingLocation(false);
        } else if (locationStatus === 'granted') {
          // Location already granted, check notifications
          localStorage.setItem('locationPermissionRequested', 'granted');
          // checkNotificationsAfterLocation();
        // } else {
          // Location already seen or other status, check notifications
          // checkNotificationsAfterLocation();
          fetchUserPosition();
          checkNotificationsAfterLocation();
        }
      });
    }
  }

  const fetchUserPosition = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          const locationData = { latitude, longitude, accuracy };
          setUserLocation(locationData);
          setLocationDetails({ accuracy });  // GPS accuracy in meters
          const address = await fetchAddress(latitude, longitude); // Fetch address first
          setCurrentAddress(address);
          setLoadingLocation(false);
          localStorage.setItem('userLocation', JSON.stringify(locationData)); // Store in localStorage

          const savedDistance = localStorage.getItem('distanceRange');
          if (savedDistance) {
            setDistanceRange(Number(savedDistance));
          }
          await saveLocation(latitude, longitude, address, accuracy);
          // Clear saved map state when user explicitly recenters
          globalCache.lastMapCenter = null;
          globalCache.lastMapZoom = null;
          globalCache.lastClickedMarkerId = null;
          localStorage.removeItem('lastMapCenter');
          localStorage.removeItem('lastMapZoom');
          localStorage.removeItem('lastClickedMarkerId');
        } catch (error) {
          // console.error('Error fetching location:', error);
          setSnackbar({ open: true, message: 'Failed to fetch your current location. Please enable the location permission or try again.', severity: 'error' });
          setLoadingLocation(false);
        }
      },
      (error) => {
        // console.error('Error fetching location:', error);
        const userRegion = localStorage.getItem('userLang');
        if (userRegion) {
          fallbackLocation(userRegion);
        }
        setSnackbar({
          open: true,
          message: 'Failed to fetch your current location. Please enable the location permission or try again. Your location is never shared publicly.',
          severity: 'error',
        });
        setLoadingLocation(false);
      }
    );
  }

  const checkNotificationsAfterLocation = () => {
    const hasSeenNotificationDialog = localStorage.getItem('hasSeenNotificationDialog');
    const notificationPermissionRequested = localStorage.getItem('notificationPermissionRequested');
    
    // Check notification permission
    if ('Notification' in window && 'serviceWorker' in navigator) {
      if (!hasSeenNotificationDialog && Notification.permission === 'default') {
        // Show notification dialog after a short delay
        setTimeout(() => {
          setShowNotificationDialog(true);
          localStorage.setItem('hasSeenNotificationDialog', 'true');
        }, 500);
      } else if (Notification.permission === 'denied' && !notificationPermissionRequested) {
        localStorage.setItem('notificationPermissionRequested', 'denied');
      } else if (Notification.permission === 'granted') {
        localStorage.setItem('notificationPermissionRequested', 'granted');
      }
    }
  };

  // handler for location dialog
  const handleLocationDialogClose = async (enabled, status) => {
    setShowLocationDialog(false);
    // console.log(enabled, status);
    
    // Store the permission status
    if (status === 'granted') {
      localStorage.setItem('locationPermissionRequested', 'granted');
      fetchUserPosition();
      // Show notification dialog after location is granted
      setTimeout(() => {
        checkNotificationsAfterLocation();
      }, 500);
      
    } else if (status === 'denied') {
      localStorage.setItem('locationPermissionRequested', 'denied');
      const userRegion = localStorage.getItem('userLang');
      if (userRegion) {
        fallbackLocation(userRegion);
      }
      // Still show notification dialog even if location was denied
      setTimeout(() => {
        checkNotificationsAfterLocation();
      }, 500);
      setLoadingLocation(false);
    } else if (status === 'later') {
      localStorage.setItem('locationPermissionRequested', 'later');
      const userRegion = localStorage.getItem('userLang');
      if (userRegion) {
        fallbackLocation(userRegion);
      }
      // Still show notification dialog even if location was denied
      setTimeout(() => {
        checkNotificationsAfterLocation();
      }, 500);
      setLoadingLocation(false);
    }
    
    // Optionally show message based on status
    if (enabled) {
      setSnackbar({ 
        open: true, 
        message: 'Location services enabled', 
        severity: 'success' 
      });
    }
  };

  // notification dialog handler
  const handleNotificationDialogClose = (enabled) => {
    setShowNotificationDialog(false);
    localStorage.setItem('notificationPermissionRequested', enabled ? 'granted' : 'denied');
    if (enabled) {
      setSnackbar({ 
        open: true, 
        message: 'Notifications enabled successfully', 
        severity: 'success' 
      });
    }
  };

  const saveLocation = async (latitude, longitude, address, accuracy) => {
    try {
      const authToken = localStorage.getItem('authToken');
      await API.put(`/api/auth/${userId}/location`, {
        location: {
          latitude: latitude,
          longitude: longitude,
          address: address,
          accuracy: accuracy
        },
      }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
    } catch (err) {
      console.error('Error saving location:', err);
    }
  };

  const formatAccuracy = (accuracy) => {
    if (accuracy >= 1000) {
      return `${(accuracy / 1000).toFixed(2)} km`;
    }
    return `${Math.round(accuracy)} m`;
  };

  const getLocationLabel = ({ loading, address, isMobile }) => {
    if (loading) return 'Finding your location…';

    if (!address)
      return 'Location unavailable';

    const words = address.split(' ');
    const limit = isMobile ? 2 : 3;

    return words.length > limit
      ? `${words.slice(0, limit).join(' ')}…`
      : address;
  };

  const getLocationDescription = ({ loading, address }) => {
    if (loading)
      return 'We’re detecting your current location to show nearby posts…';

    if (!address)
      return 'Location access is disabled. Enable location permission to find posts near you. Your location is never shared publicly.';

    return address;
  };

  // Handle browser back button
  useEffect(() => {
    if (!compareDialogOpen) return;

    const handleBackButton = (e) => {
      e.preventDefault();
      setCompareDialogOpen(false);
    };

    // Add event listener when dialog opens
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handleBackButton);

    // Clean up event listener when dialog closes
    return () => {
      window.removeEventListener('popstate', handleBackButton);
      if (window.history.state === null) {
        window.history.back();
      }
    };
  }, [compareDialogOpen, setCompareDialogOpen]);

  // this useEffect to style Leaflet popups
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .leaflet-popup-content-wrapper {
        background: ${darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)'} !important;
        backdrop-filter: blur(20px) !important;
        border-radius: 12px !important;
        border: ${darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'} !important;
        box-shadow: ${darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)'} !important;
        color: ${darkMode ? 'white' : 'inherit'} !important;
      }
      
      .leaflet-popup-tip {
        background: ${darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)'} !important;
        backdrop-filter: blur(20px) !important;
        border: ${darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'} !important;
      }
      
      .leaflet-popup-content {
        margin: 0 !important;
        padding: 0 !important;
        color: ${darkMode ? 'white' : 'inherit'} !important;
      }
      
      .leaflet-popup-close-button {
        color: ${darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'} !important;
        padding: 2px 2px 0 0 !important;
        font-size: 20px !important;
      }
      
      .leaflet-popup-close-button:hover {
        color: ${darkMode ? 'white' : 'black'} !important;
        background: transparent !important;
      }

      .marker-cluster {
        transition: transform 0.3s ease;
      }
      
      .marker-cluster:hover {
        transform: scale(1.1);
      }
      
      .post-marker {
        transition: transform 0.2s ease, filter 0.2s ease;
      }
      
      .leaflet-marker-icon {
        pointer-events: auto !important;
      }
      
      /* Improve popup performance */
      .leaflet-popup-content-wrapper {
        will-change: transform, opacity;
      }
      
      /* Reduce marker repaints */
      .leaflet-marker-icon {
        will-change: transform;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [darkMode]);
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
    const savedAddress = localStorage.getItem('userAddress');
    const authToken = localStorage.getItem('authToken');
    setIsAuthenticated(!!authToken);

    if (storedLocation && savedAddress) {
      // Use the stored location
      const { latitude, longitude, accuracy } = JSON.parse(storedLocation);
      setUserLocation({ latitude, longitude });
      setLocationDetails({ accuracy });
      // fetchAddress(latitude, longitude);
      setCurrentAddress(savedAddress);
      if (savedDistance) {
        setDistanceRange(Number(savedDistance));
      }
    } else {
      // Fetch location only if not stored
      fetchUserLocation();
    }
  }, [fetchUserLocation]);

  // Optimized scroll handler with throttling
  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        return; // Skip if already processing
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const postsContainer = postsContainerRef.current;
        if (!postsContainer) return;

        const currentScrollTop = postsContainer.scrollTop;
        const scrollHeight = postsContainer.scrollHeight;
        const clientHeight = postsContainer.clientHeight;
        
        // Calculate scroll percentage
        const scrollPercentage = (currentScrollTop / (scrollHeight - clientHeight)) * 100;
        
        // Check if we're at the very bottom (within 5% of bottom)
        const isAtBottom = scrollPercentage >= 95;
        
        // Check if we're at the very top
        const isAtTop = currentScrollTop <= 10;
        
        const scrollDirection = currentScrollTop > lastScrollTopRef.current ? 'down' : 'up';
        
        // Always show header when at top
        if (isAtTop) {
          setIsHeaderVisible(true);
        } 
        // Always show header when at bottom and scrolling up
        else if (isAtBottom && scrollDirection === 'up') {
          setIsHeaderVisible(true);
        }
        // Hide header when scrolling down past threshold, but not at bottom
        else if (scrollDirection === 'down' && currentScrollTop > 100 && !isAtBottom) {
          setIsHeaderVisible(false);
        }
        // Show header when scrolling up
        else if (scrollDirection === 'up' && currentScrollTop > 100) {
          setIsHeaderVisible(true);
        }
        
        lastScrollTopRef.current = currentScrollTop;
        scrollTimeoutRef.current = null;
      }, 50); // Increased throttle time for smoother detection
    };

    const postsContainer = postsContainerRef.current;
    if (postsContainer) {
      postsContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        if (postsContainer) {
          postsContainer.removeEventListener('scroll', handleScroll);
        }
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, []);

  // Add search state at the top with other state declarations
  const [searchQuery, setSearchQuery] = useState(() => {
  const savedSearch = localStorage.getItem('helperSearchQuery');
    return savedSearch || '';
  });
  const [isSearching, setIsSearching] = useState(false);
  const [expanded, setExpanded] = useState(() => {
  const savedSearch = localStorage.getItem('helperSearchQuery');
    return savedSearch ? true : false;
  });
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

  // handlePostSelection function
  const handlePostSelection = (post) => {
    setSelectedPosts(prev => {
      const isSelected = prev.some(p => p._id === post._id);
      if (isSelected) {
        return prev.filter(p => p._id !== post._id);
      } else if (prev.length < 3) {
        return [...prev, post];
      } else {
        setSnackbar({ 
          open: true, 
          message: 'Maximum 3 posts can be compared at a time', 
          severity: 'warning' 
        });
        return prev;
      }
    });
  };

  const closePostsCompare = () => {
    setCompareMode(false);
    setSelectedPosts([]);
  }

  // Reset compare mode when changing categories or filters
  // useEffect(() => {
  //   setCompareMode(false);
  //   setSelectedPosts([]);
  // }, [selectedCategory, filters, searchQuery]);

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
  // const handleSearch = (e) => {
  //   const query = e.target.value;
  //   setSearchQuery(query);
  //   setSkip(0); // Reset pagination when searching
  //   // Clear cache for the old search query
  //   globalCache.lastCacheKey = null;
  // };

  // Add clear search handler
  const handleClearSearch = () => {
    setSearchQuery('');
    setSkip(0);
    globalCache.lastCacheKey = null;
  };

  // Posts locations mapping code starts here
  const [postMarkers, setPostMarkers] = useState([]);
  const [bloodDonorMarkers, setBloodDonorMarkers] = useState([]);
  // const [nearbyUserMarkers, setNearbyUserMarkers] = useState([]);
  const postIconCache = useRef({});
  // const [allPostLocations, setAllPostLocations] = useState([]);
  // const [selectedPost, setSelectedPost] = useState(null);
  // const [postDetails, setPostDetails] = useState(null);
  // const [loadingPostDetails, setLoadingPostDetails] = useState(false);
  // const [showPostDialog, setShowPostDialog] = useState(false);

  
  // debounce utility function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // createPostMarkers function to handle different location formats
  const createPostMarkers = useCallback((locationsData) => {
    if (!locationsData || locationsData.length === 0) {
      setPostMarkers([]);
      return;
    }
    // Batch process markers to reduce rendering overhead
    const markers = [];
    const batchSize = 50; // Process markers in batches
    
    for (let i = 0; i < locationsData.length; i += batchSize) {
      const batch = locationsData.slice(i, i + batchSize);
      
      batch.forEach(post => {
        let latitude, longitude;
        
        if (post.location && post.location.coordinates) {
          [longitude, latitude] = post.location.coordinates;
        } else if (post.location && post.location.latitude && post.location.longitude) {
          latitude = post.location.latitude;
          longitude = post.location.longitude;
        } else {
          return;
        }

        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
          return;
        }

        markers.push({
          id: post._id,
          position: [latitude, longitude],
          title: post.title,
          price: post.price,
          postType: post.postType,
          categories: post.categories,
          serviceType: post.serviceType,
          distance: post.distance,
          postStatus: post.postStatus
        });
      });
    }

    setPostMarkers(markers);
  }, []);

  // useEffect to use allPostLocations
  // useEffect(() => {
  //   if (allPostLocations.length > 0) {
  //     createPostMarkers(allPostLocations);
  //   } else {
  //     setPostMarkers([]);
  //   }
  // }, [allPostLocations, createPostMarkers]);

  // Custom marker icon for posts
  // const postIcon = new L.Icon({
  //   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  //   shadowUrl: markerShadow,
  //   iconSize: [25, 41],
  //   iconAnchor: [12, 41],
  //   popupAnchor: [1, -34],
  //   shadowSize: [41, 41]
  // });

  // // Custom icon for service offerings
  // const serviceIcon = new L.Icon({
  //   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  //   shadowUrl: markerShadow,
  //   iconSize: [25, 41],
  //   iconAnchor: [12, 41],
  //   popupAnchor: [1, -34],
  //   shadowSize: [41, 41]
  // });

  // // Custom icon for emergency posts
  // const emergencyIcon = new L.Icon({
  //   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  //   shadowUrl: markerShadow,
  //   iconSize: [25, 41],
  //   iconAnchor: [12, 41],
  //   popupAnchor: [1, -34],
  //   shadowSize: [41, 41]
  // });

  // cleanup effect to manage cache lifetime
  useEffect(() => {
    // Clear old cache entries periodically
    const clearOldCache = () => {
      // Clear cache entries older than 1 hour
      Object.keys(globalCache.locationsData).forEach(key => {
        if (Date.now() - globalCache.locationsData[key].timestamp > 3600000) {
          delete globalCache.locationsData[key];
        }
      });
      
      // Clear old map view cache (older than 30 minutes)
      if (globalCache.lastMapView && 
          Date.now() - globalCache.lastMapView.timestamp > 1800000) {
        globalCache.lastMapCenter = null;
        globalCache.lastMapZoom = null;
        globalCache.lastMapBounds = null;
        globalCache.lastMapView = null;
      }
    };
    
    // Run cleanup on mount and every 5 minutes
    clearOldCache();
    const intervalId = setInterval(clearOldCache, 300000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Function to fetch blood donors data
  const fetchBloodDonorsData = async () => {
    if (!userLocation || !distanceRange) return;
  
    // setPosts([]);
    setPostMarkers([]);
    const currentCacheKey = generateCacheKey('posts');
  
    try {
      setLoading(true);
      setIsSearching(!!searchQuery); // Set searching state based on query
      setCompareMode(false);
      setSelectedPosts([]);
      setIsHeaderVisible(true);

      // Check if we have valid cached data
      if (globalCache.data[currentCacheKey] && 
        globalCache.lastCacheKey === currentCacheKey &&
        JSON.stringify(globalCache.lastFilters) === JSON.stringify(filters)) {
        const { posts: cachedPosts, skip: cachedSkip, hasMore: cachedHasMore } = globalCache.data[currentCacheKey];
    
        // setBloodDonors(cachedPosts);
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
  
      const response = await fetchNearbyUsers(0, 12, userLocation, distanceRange, filters, searchQuery, sortBy, selectedCategory);
      const usersData = response.data.donors || response.data.friends || [];
      const totalCount = response.data.totalCount || 0;

      globalCache.totalPostsCount = (response.data.totalCount);
      // Update global cache
      globalCache.data[currentCacheKey] = {
        posts: usersData,
        skip: 12,
        hasMore: usersData.length > 0 && response.data.totalCount > 12,
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
  
      // setBloodDonors(usersData);
      setPosts(usersData);
      setTotalPosts(totalCount);
      setSkip(12); // Set skip to 24 after initial load
      // Check if there are more posts to load
      setHasMore(usersData.length > 0 && response.data.totalCount > 12); // If we got 24, there might be more
      console.log(`Nearby users fetched: ${usersData.length} users`);
  
    } catch (error) {
      console.error("Error fetching users data:", error);
      setSnackbar({ open: true, message: `Failed to fetch nearby ${selectedCategory === 'BloodDonors' ? 'Blood Donors' : 'Friends'}.`, severity: 'error' });
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };
  
  // Function to fetch blood donor locations for map - FIXED
  const fetchBloodDonorLocationsData = async () => {
    if (!userLocation || !distanceRange || (selectedCategory !== 'BloodDonors' && selectedCategory !== 'Friends')) return;

    const currentLocationsCacheKey = generateCacheKey('locations');
    
    // Check if we have valid cached locations data
    if (globalCache.locationsData[currentLocationsCacheKey] && 
        globalCache.lastLocationsCacheKey === currentLocationsCacheKey &&
        JSON.stringify(globalCache.lastFilters) === JSON.stringify(filters)) {
      
      const { locations: cachedLocations, totalCount: cachedTotalCount } = globalCache.locationsData[currentLocationsCacheKey];
      
      // setAllPostLocations(cachedLocations);
      globalCache.totalLocationsCount = cachedTotalCount;
      // createPostMarkers(cachedLocations);
      setBloodDonorMarkers(cachedLocations);
      return;
    }

    // Clear saved map state when user explicitly recenters
    globalCache.lastMapCenter = null;
    globalCache.lastMapZoom = null;
    globalCache.lastClickedMarkerId = null;
    localStorage.removeItem('lastMapCenter');
    localStorage.removeItem('lastMapZoom');
    localStorage.removeItem('lastClickedMarkerId');
  
    try {
      // Get current map bounds for viewport-based loading
      const bounds = mapRef.current.getBounds();

      const response = await fetchNearbyUsersLocations(userLocation, distanceRange, filters, searchQuery, selectedCategory);
      const locationsData = response.data.locations || [];
      const totalCount = response.data.totalCount || 0;

      // Update global cache for locations
      globalCache.locationsData[currentLocationsCacheKey] = {
        locations: locationsData,
        totalCount: totalCount,
        timestamp: Date.now(),
        bounds: bounds.toBBoxString() // Store bounds for cache validation
      };
      globalCache.lastLocationsCacheKey = currentLocationsCacheKey;
      globalCache.totalLocationsCount = totalCount;
      globalCache.lastFilters = {...filters};

      // Clean up old cache entries (older than 1 hour)
      Object.keys(globalCache.locationsData).forEach(key => {
        if (Date.now() - globalCache.locationsData[key].timestamp > 3600000) {
          delete globalCache.locationsData[key];
        }
      });
      
      // Create markers for blood donors
      // createBloodDonorMarkers(locationsData);

      // Update blood donors state with locations data
      // setBloodDonors(locationsData);
      setBloodDonorMarkers(locationsData);
      
      // Clear post markers when showing blood donors
      setPostMarkers([]);
      // console.log('blood donors locations', locationsData.length );
  
    } catch (error) {
      console.error("Error fetching users locations:", error);
    }
  };
  
  // Load more blood donors
  const loadMoreBloodDonors = async () => {
    if (loadingMore || !hasMore )  return; // || bloodDonors.length >= totalPosts
    
    try {
      setLoadingMore(true);
      const response = await fetchNearbyUsers(skip, 12, userLocation, distanceRange, filters, searchQuery, sortBy, selectedCategory);
      const newPosts = response.data.donors || response.data.friends || [];
      
      if (newPosts.length > 0) {
        // setBloodDonors(prev => [...prev, ...newDonors]);
        // const updatedPosts = [...bloodDonors, ...newDonors];
        const updatedPosts = [...posts, ...newPosts];
        const currentCacheKey = generateCacheKey('posts');
          
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
          // setBloodDonors(updatedPosts);
          // setBloodDonors(prev => [...prev, ...newDonors]);
          // setPosts(prev => [...prev, ...newPosts]);
          setSkip(prevSkip => prevSkip + newPosts.length);
          // Update hasMore based on whether we've reached the total count
          setHasMore(updatedPosts.length < response.data.totalCount);
          console.log(`Fetched ${newPosts.length} new posts with search "${searchQuery}"  (skip: ${skip}, total: ${response.data.totalCount})`);
        } else {
          setHasMore(false);
        }
      console.log('loading more', newPosts.length);
      
    } catch (error) {
      console.error("Error fetching more blood donors:", error);
    } finally {
      setLoadingMore(false);
    }
  };
  
  // Update useEffect to handle blood donors
  useEffect(() => {
    if (selectedCategory === 'BloodDonors' || selectedCategory === 'Friends') {
      fetchBloodDonorLocationsData();
      fetchBloodDonorsData();
    } else {
      // Clear blood donors when not in BloodDonors mode
      // setBloodDonors([]);
      setBloodDonorMarkers([]);
    }
    // Scroll to top of posts
    setTimeout(() => {
      if (postsContainerRef.current) {
        postsContainerRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, 100); // Small delay to ensure state updates complete
  }, [userLocation, distanceRange, searchQuery, filters, generateCacheKey, selectedCategory]);

  
  const handleOpenUserProfileDialog = (id) => {
    if (!isAuthenticated) { // Prevent unauthenticated actions
      setLoginMessage({
        open: true,
        message: 'Please log in first. Click here to login.',
        severity: 'warning',
      });
      return;
    } 
    // Save map state to cache
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      const zoom = mapRef.current.getZoom();
      const bounds = mapRef.current.getBounds();
      
      globalCache.lastMapCenter = [center.lat, center.lng];
      globalCache.lastMapZoom = zoom;
      globalCache.lastMapBounds = bounds;
      globalCache.lastClickedMarkerId = id;

      // Also save view state (not just center/zoom)
      globalCache.lastMapView = {
        center: [center.lat, center.lng],
        zoom: zoom,
        bounds: bounds.toBBoxString(),
        timestamp: Date.now()
      };
      
      // Also save to localStorage as backup
      localStorage.setItem('lastMapCenter', JSON.stringify([center.lat, center.lng]));
      localStorage.setItem('lastMapZoom', zoom.toString());
      localStorage.setItem('lastMapBounds', JSON.stringify(bounds.toBBoxString()));
      localStorage.setItem('lastClickedMarkerId', id);
      localStorage.setItem('lastMapViewTimestamp', Date.now().toString());
    }
    setSelectedUserId(id);
    setUserProfileOpen(true);
  };
  
  const handleCloseUserProfileDialog = () => {
    setUserProfileOpen(false);
    setSelectedUserId(null);
  };
  
  // Function to handle blood donor click
  // const handleDonorClick = (donor) => {
  //   // Navigate to donor profile or show donor details
  //   console.log('Donor clicked:', donor);
  //   // You can implement navigation to donor profile or show a dialog
  //   // navigate(`/profile/${donor.userCode}`);
  // };

  // to fetch all post locations with viewport-based loading
  useEffect(() => {
    // Don't fetch post locations if BloodDonors is selected
    if (selectedCategory === 'BloodDonors' || selectedCategory === 'Friends') {
      setPostMarkers([]); // Clear post markers
      return;
    }
    
    // Don't fetch post locations if no category/service is selected
    // if (!filters.categories && !filters.serviceType) {
    //   setPostMarkers([]); // Clear post markers
    //   return;
    // }
    const fetchAllPostLocations = async () => {
      if (!userLocation || !distanceRange || !mapRef.current) return;

      const currentLocationsCacheKey = generateCacheKey('locations');
    
      // Check if we have valid cached locations data
      if (globalCache.locationsData[currentLocationsCacheKey] && 
          globalCache.lastLocationsCacheKey === currentLocationsCacheKey &&
          JSON.stringify(globalCache.lastFilters) === JSON.stringify(filters)) {
        
        const { locations: cachedLocations, totalCount: cachedTotalCount } = globalCache.locationsData[currentLocationsCacheKey];
        
        // setAllPostLocations(cachedLocations);
        globalCache.totalLocationsCount = cachedTotalCount;
        createPostMarkers(cachedLocations);
        return;
      }

      // Clear saved map state when user explicitly recenters
      globalCache.lastMapCenter = null;
      globalCache.lastMapZoom = null;
      globalCache.lastClickedMarkerId = null;
      localStorage.removeItem('lastMapCenter');
      localStorage.removeItem('lastMapZoom');
      localStorage.removeItem('lastClickedMarkerId');

      try {
        // Get current map bounds for viewport-based loading
        const bounds = mapRef.current.getBounds();

        const response = await fetchPostLocations(userLocation, distanceRange, filters, searchQuery,
          bounds // Pass map bounds to API if supported
        );
        const locationsData = response.data.locations || [];
        const totalCount = response.data.totalCount || 0;

        // Update global cache for locations
        globalCache.locationsData[currentLocationsCacheKey] = {
          locations: locationsData,
          totalCount: totalCount,
          timestamp: Date.now(),
          bounds: bounds.toBBoxString() // Store bounds for cache validation
        };
        globalCache.lastLocationsCacheKey = currentLocationsCacheKey;
        globalCache.totalLocationsCount = totalCount;
        globalCache.lastFilters = {...filters};

        // Clean up old cache entries (older than 1 hour)
        Object.keys(globalCache.locationsData).forEach(key => {
          if (Date.now() - globalCache.locationsData[key].timestamp > 3600000) {
            delete globalCache.locationsData[key];
          }
        });

        // setAllPostLocations(locationsData);
        createPostMarkers(locationsData);

        console.log(`Fetched ${locationsData.length} post locations within ${distanceRange}km`);

      } catch (error) {
        console.error("Error fetching post locations:", error);
      }
    };

    // debounce to map move events
    const debouncedFetch = debounce(fetchAllPostLocations, 500);
    
    if (mapRef.current) {
      mapRef.current.on('moveend', debouncedFetch);
      mapRef.current.on('zoomend', debouncedFetch);
    }

    // Initial fetch
    fetchAllPostLocations();

    return () => {
      if (mapRef.current) {
        mapRef.current.off('moveend', debouncedFetch);
        mapRef.current.off('zoomend', debouncedFetch);
      }
    };
  }, [userLocation, distanceRange, filters, searchQuery, generateCacheKey, createPostMarkers]);

  // Add this function to fetch post details
  const fetchPostDetails = async (postId) => {
    // setLoadingPostDetails(true);
    // Save map state to cache
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      const zoom = mapRef.current.getZoom();
      const bounds = mapRef.current.getBounds();
      
      globalCache.lastMapCenter = [center.lat, center.lng];
      globalCache.lastMapZoom = zoom;
      globalCache.lastMapBounds = bounds;
      globalCache.lastClickedMarkerId = postId;

      // Also save view state (not just center/zoom)
      globalCache.lastMapView = {
        center: [center.lat, center.lng],
        zoom: zoom,
        bounds: bounds.toBBoxString(),
        timestamp: Date.now()
      };
      
      // Also save to localStorage as backup
      localStorage.setItem('lastMapCenter', JSON.stringify([center.lat, center.lng]));
      localStorage.setItem('lastMapZoom', zoom.toString());
      localStorage.setItem('lastMapBounds', JSON.stringify(bounds.toBBoxString()));
      localStorage.setItem('lastClickedMarkerId', postId);
      localStorage.setItem('lastMapViewTimestamp', Date.now().toString());
    }
    try {
      // setShowPostDialog(true);
      // const response = await fetchPostById(postId);
      // setPostDetails(response.data);
      navigate(`/post/${postId}`);
    } catch (error) {
      console.error("Error fetching post details:", error);
      setSnackbar({ open: true, message: 'Failed to fetch post details', severity: 'error' });
    // } finally {
    //   setLoadingPostDetails(false);
    }
  };

  // function to handle marker click
  // const handleMarkerClick = (post) => {
  //   setSelectedPost(post);
  //   // Optional: Auto-fly to the marker
  //   if (mapRef.current) {
  //     mapRef.current.flyTo(post.position, 15, {
  //       duration: 1
  //     });
  //   }
  // };

  // function to save map state
  // const handleMarkerClick = (marker) => {
  //   // setSelectedPost(marker);
    
  //   // Save map state to cache
  //   if (mapRef.current) {
  //     const center = mapRef.current.getCenter();
  //     const zoom = mapRef.current.getZoom();
  //     const bounds = mapRef.current.getBounds();
      
  //     globalCache.lastMapCenter = [center.lat, center.lng];
  //     globalCache.lastMapZoom = zoom;
  //     globalCache.lastMapBounds = bounds;
  //     globalCache.lastClickedMarkerId = marker.id;
      
  //     // Also save to localStorage as backup
  //     localStorage.setItem('lastMapCenter', JSON.stringify([center.lat, center.lng]));
  //     localStorage.setItem('lastMapZoom', zoom.toString());
  //     localStorage.setItem('lastClickedMarkerId', marker.id);
  //   }
    
  //   // Optional: Auto-fly to the marker with smooth animation
  //   // if (mapRef.current) {
  //   //   mapRef.current.flyTo(marker.position, 15, {
  //   //     duration: 1
  //   //   });
  //   // }
  // };

  // useEffect to restore map state on component mount
  useEffect(() => {
    const restoreMapState = () => {
      if (!mapRef.current) return;
      
      // Check if we have cached map state
      const hasCachedState = globalCache.lastMapCenter && globalCache.lastMapZoom;
      const hasLocalStorageState = localStorage.getItem('lastMapCenter') && localStorage.getItem('lastMapZoom');
      
      if (hasCachedState || hasLocalStorageState) {
        let center, zoom, clickedMarkerId, savedTimestamp;
        let hasSavedState = false;
        
        // Prefer cache over localStorage
        if (hasCachedState) {
          center = globalCache.lastMapCenter;
          zoom = globalCache.lastMapZoom;
          clickedMarkerId = globalCache.lastClickedMarkerId;
          hasSavedState = true;
        
          // Check if cache is recent (within last 5 minutes)
          const cacheTimestamp = globalCache.lastMapView?.timestamp;
          if (cacheTimestamp && Date.now() - cacheTimestamp > 300000) {
            // Cache is old, use user location instead
            hasSavedState = false;
          }
        } else {
          center = JSON.parse(localStorage.getItem('lastMapCenter'));
          zoom = Number(localStorage.getItem('lastMapZoom'));
          clickedMarkerId = localStorage.getItem('lastClickedMarkerId');
          savedTimestamp = localStorage.getItem('lastMapViewTimestamp');

          // Check if saved state is recent
          const isRecent = savedTimestamp && 
            (Date.now() - Number(savedTimestamp)) < 300000; // 5 minutes

          if (isRecent) {
            hasSavedState = true;
          }
          
          // Update cache from localStorage
          globalCache.lastMapCenter = center;
          globalCache.lastMapZoom = zoom;
          globalCache.lastClickedMarkerId = clickedMarkerId;
        }
        
        // Restore map view with smooth transition
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.flyTo(center, zoom, {
              duration: 1,
              animate: true
            });
          }
        }, 300);
        
        // If we have a clicked marker, highlight it
        if (clickedMarkerId) {
          setTimeout(() => {
            const markerElement = document.querySelector(`[data-marker-id="${clickedMarkerId}"]`);
            if (markerElement) {
              markerElement.style.transition = 'all 0.3s ease';
              // markerElement.style.transform = 'scale(1.2)';
              markerElement.style.zIndex = '1000';
              markerElement.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.8)';
              markerElement.style.borderRadius = '50%';
              
              // Remove highlight after 2 seconds
              setTimeout(() => {
                if (markerElement) {
                  // markerElement.style.transform = 'scale(1)';
                  markerElement.style.zIndex = '';
                  markerElement.style.boxShadow = '';
                }
              }, 2000);
            }
          }, 500);
        }
      } else {
        // Default behavior: center on user location
        if (userLocation) {
          mapRef.current.setView(
            [userLocation.latitude, userLocation.longitude],
            getZoomLevel(distanceRange)
          );
        }
      }
    };
    
    // Wait for map to be initialized
    const mapCheckInterval = setInterval(() => {
      if (mapRef.current && (userLocation || globalCache.lastMapCenter)) {
        clearInterval(mapCheckInterval);
        restoreMapState();
      }
    }, 100);
    
    return () => clearInterval(mapCheckInterval);
  }, [userLocation, distanceRange, mapRef.current]);

  // Fetch posts data
  useEffect(() => {
    if (!distanceRange || !userLocation) { //  || selectedCategory === 'BloodDonors'
      setPosts([]);
      return;
    }
    if (selectedCategory === 'BloodDonors' || selectedCategory === 'Friends') {
      return; // Skip fetching posts if BloodDonors is selected
    }
    const currentCacheKey = generateCacheKey('posts');
    const fetchData = async () => {
        // setLoading(true);
        // localStorage.setItem('currentPage', currentPage); // Persist current page to localStorage
        try {
          setLoading(true);
          setIsSearching(!!searchQuery); // Set searching state based on query
          setCompareMode(false);
          setSelectedPosts([]);
          setIsHeaderVisible(true);
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
          const response = await fetchPosts(0, 12, userLocation, distanceRange, filters, searchQuery, sortBy);
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
  }, [userLocation, distanceRange, filters, generateCacheKey, searchQuery, sortBy]); // Add distanceRange as dependency

  // Load more posts function
  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      if (selectedCategory === 'BloodDonors' || selectedCategory === 'Friends') {
        console.log('loading more.. 1');
      // Load more blood donors
      await loadMoreBloodDonors();
    } else {
      const response = await fetchPosts(skip, 12, userLocation, distanceRange, filters, searchQuery, sortBy);
      const newPosts = response.data.posts || [];
      
      if (newPosts.length > 0) {
        const updatedPosts = [...posts, ...newPosts];
        const currentCacheKey = generateCacheKey('posts');
        
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
      }}
      
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
      const address = data.display_name || 'Address not found';
      localStorage.setItem('userAddress', address);
      return address;
    } catch (error) {
      console.error("Error fetching address:", error);
      return '';
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
      // Clear icon cache on unmount to prevent memory leaks
      postIconCache.current = {};
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

  const recenterUserLocation = () => {
    if (mapRef.current && userLocation) {
      // Center on user location
      mapRef.current.flyTo([userLocation.latitude, userLocation.longitude], 15, {
        duration: 0.5
      });
    }
    // Clear saved state when user explicitly recenters
    globalCache.lastMapCenter = null;
    globalCache.lastMapZoom = null;
    globalCache.lastMapBounds = null;
    globalCache.lastMapView = null;
    globalCache.lastClickedMarkerId = null;
    
    // Clear localStorage
    localStorage.removeItem('lastMapCenter');
    localStorage.removeItem('lastMapZoom');
    localStorage.removeItem('lastMapBounds');
    localStorage.removeItem('lastClickedMarkerId');
    localStorage.removeItem('lastMapViewTimestamp');
  };

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return null;

    if (distance < 1) {
      return `${Math.round(distance * 1000)} m away`;
    }

    return `${distance.toFixed(1)} km away`;
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-IN', {
      dateStyle: 'medium',
      // timeStyle: 'short',
    }) : '—';

  const lookingForIcons = {
    'Friendship': <PeopleRounded fontSize="small" />,
    'Dating': <FavoriteRounded fontSize="small" />,
    'Networking': <HandshakeRounded fontSize="small" />,
    'Activity Partners': <SportsSoccerRounded fontSize="small" />,
    'Travel Buddies': <FlightRounded fontSize="small" />,
    'Study Partners': <SchoolRounded fontSize="small" />,
    'Business Connections': <BusinessCenterRounded fontSize="small" />
  };

  return (
    <Layout username={tokenUsername} darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate}>
      <Box sx={{
        position: 'fixed',
        height: isMobile ? '500px' : '500px',
        width: '100%',
        overflow: 'hidden',
        // borderRadius: '0 0 16px 16px',
        mt: -8,
        boxShadow: '0 4px 20px rgba(67, 97, 238, 0.3)',
      }}>
        {/* Map Container */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0
        }}>
          <MapContainer
            center={(() => {
              if (globalCache.lastMapCenter && globalCache.lastMapZoom) {
                return globalCache.lastMapCenter;
              }
              
              const savedCenter = localStorage.getItem('lastMapCenter');
              if (savedCenter) {
                return JSON.parse(savedCenter);
              }
              
              if (userLocation) {
                return [userLocation.latitude, userLocation.longitude];
              }
              
              return [0, 0];
            })()}
            zoom={(() => {
              if (globalCache.lastMapZoom) {
                return globalCache.lastMapZoom;
              }
              
              const savedZoom = localStorage.getItem('lastMapZoom');
              if (savedZoom) {
                return Number(savedZoom);
              }
              
              return getZoomLevel(distanceRange);
            })()}
            style={{ height: '100%', width: '100%' }}
            attributionControl={false}
            ref={mapRef}
            // whenCreated={setMapInstance}
            whenCreated={(map) => {
              mapRef.current = map;
              
              // Set up map event listeners
              map.on('moveend', () => {
                const center = map.getCenter();
                const zoom = map.getZoom();
                
                // Update cache
                globalCache.lastMapCenter = [center.lat, center.lng];
                globalCache.lastMapZoom = zoom;
                
                // Update localStorage as backup
                localStorage.setItem('lastMapCenter', JSON.stringify([center.lat, center.lng]));
                localStorage.setItem('lastMapZoom', zoom.toString());
              });
              
              // Also update on zoom
              map.on('zoomend', () => {
                const zoom = map.getZoom();
                globalCache.lastMapZoom = zoom;
                localStorage.setItem('lastMapZoom', zoom.toString());
              });
            }}
            maxBounds={worldBounds} // Restrict the map to the world bounds
            maxBoundsViscosity={1.0} // Prevents the map from being dragged outside the bounds
            zoomControl={false} // default zoom controls disabled
          >
            {/* <ChangeView center={userLocation ? [userLocation.latitude, userLocation.longitude] : [0, 0]}
              zoom={getZoomLevel(distanceRange)} /> */}
            <MapEvents setMap={setMapInstance} /> {/*  map custum controls like zoomControl */}
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
                opacity={0.8} // Make it semi-transparent if needed
              />
            )}
            {/* Add this component inside your MapContainer, after TileLayer */}
            {/* <MapViewPersister mapRef={mapRef} /> */}
            {userLocation && (
              <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userMappingIcon(userProfilePic, tokenUsername) || customIcon}
                // zIndexOffset={1000} // Ensure user marker is on top
                eventHandlers={{
                  mouseover: (e) => {
                    e.target.setZIndexOffset(1000); // Bring to front on hover
                  },
                  mouseout: (e) => {
                    e.target.setZIndexOffset(0); // Reset on mouseout
                  }
                }}
              >
                <Popup className="custom-popup" closeButton={true}>
                  <Box sx={{ p: 1.5}}>
                    <Typography variant="subtitle1" sx={{ 
                      color: darkMode ? 'white' : 'text.primary'
                    }}>
                      Your Current Location
                    </Typography>
                  </Box>
                </Popup>
              </Marker>
            )}
            {/* // Update the MapContainer component to include MarkerClusterGroup
            // Replace the individual markers rendering with clustered markers */}
            {(selectedCategory !== 'BloodDonors' || selectedCategory !== 'Friends') && postMarkers.length > 0 && (
              <MarkerClusterGroup
                chunkedLoading
                chunkDelay={100}
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={true}
                zoomToBoundsOnClick={true}
                maxClusterRadius={60}
                disableClusteringAtZoom={19} // Spider clustering at zoom 19 and above
                spiderLegPolylineOptions={{
                  weight: 1.5,
                  color: darkMode ? '#3b82f6' : '#2563eb',
                  opacity: 0.7
                }}
                iconCreateFunction={(cluster) => {
                  const count = cluster.getChildCount();
                  const size = count > 100 ? 60 : count > 50 ? 50 : count > 20 ? 40 : 30;
                  
                  return L.divIcon({
                    html: `<div style="
                      width: ${size}px;
                      height: ${size}px;
                      background: ${darkMode ? 'rgba(59, 130, 246, 0.9)' : 'rgba(37, 99, 235, 0.9)'};
                      color: white;
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-weight: bold;
                      font-size: ${size > 40 ? '14px' : '12px'};
                      border: 2px solid white;
                      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                      cursor: pointer;
                    ">${count}</div>`,
                    iconSize: [size, size],
                    className: 'marker-cluster'
                  });
                }}
              >
              {/* posts locations mapping code */}
              {postMarkers.map(marker => {
                let color = '#4CAF50';
                
                // Choose icon color based on post type/category
                if (marker.postType === 'ServiceOffering') {
                  color = '#2196F3';
                } else if (marker.categories === 'Paid') {
                  color = '#4CAF50';
                } else if (marker.categories === 'UnPaid') {
                  color = '#FF9800';
                } else if (marker.categories === 'Emergency') {
                  color = '#E91E63';
                }

                return (
                  <Marker
                    key={marker.id}
                    position={marker.position}
                    icon={postsMappingIcon(marker.title, color, darkMode)}
                    eventHandlers={{
                      // click: () => handleMarkerClick(marker),
                      click: (e) => {
                        e.originalEvent.stopPropagation();
                        
                        // Highlight clicked marker
                        const markerElement = e.target.getElement();
                        if (markerElement) {
                          markerElement.style.transition = 'all 0.3s ease';
                          // markerElement.style.transform = 'scale(1.3)';
                          // markerElement.style.zIndex = '1000';
                          markerElement.style.filter = 'brightness(1.2)';
                          
                          // Remove highlight after 1.5 seconds
                          setTimeout(() => {
                            if (markerElement) {
                              // markerElement.style.transform = 'scale(1)';
                              // markerElement.style.zIndex = '';
                              markerElement.style.filter = 'brightness(1)';
                            }
                          }, 1500);
                        }
                        
                        // Open popup
                        e.target.openPopup();
                      },
                      mouseover: (e) => {
                        e.target.setZIndexOffset(1000); // Bring to front on hover
                        // const markerElement = e.target.getElement();
                        // if (markerElement && !markerElement.style.transform.includes('scale(1.3)')) {
                        //   markerElement.style.transform = 'scale(1.1)';
                        //   markerElement.style.zIndex = '500';
                        // }
                      },
                      mouseout: (e) => {
                        e.target.setZIndexOffset(0); // Reset on mouseout
                        // const markerElement = e.target.getElement();
                        // if (markerElement && !markerElement.style.transform.includes('scale(1.3)')) {
                        //   markerElement.style.transform = 'scale(1)';
                        //   markerElement.style.zIndex = '';
                        // }
                      },
                      add: (e) => {
                        // Add data attribute for easier selection
                        const markerElement = e.target.getElement();
                        if (markerElement) {
                          markerElement.setAttribute('data-marker-id', marker.id);
                        }
                      }
                    }}
                    // data-marker-id={marker.id}
                    // eventHandlers={{
                    //   click: () => {
                        // const postElement = document.getElementById(`post-${marker.id}`);
                        // if (postElement) {
                        //   postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        //   postElement.style.transition = 'all 0.3s ease';
                        //   postElement.style.boxShadow = '0 0 20px rgba(67, 97, 238, 0.5)';
                        //   setTimeout(() => {
                        //     postElement.style.boxShadow = '';
                        //   }, 2000);
                        // }
                      // }
                    // }}
                  >
                    {/*  popup content to show more information */}
                    <Popup 
                      className="custom-popup"
                      closeButton={true}
                      autoClose={false}
                      closeOnClick={false}
                      onOpen={() => {
                        // Save marker state when popup opens
                        if (mapRef.current) {
                          const center = mapRef.current.getCenter();
                          const zoom = mapRef.current.getZoom();
                          const bounds = mapRef.current.getBounds();
                          
                          // Save comprehensive map state
                          globalCache.lastMapView = {
                            center: [center.lat, center.lng],
                            zoom: zoom,
                            bounds: bounds.toBBoxString(),
                            timestamp: Date.now()
                          };
                          
                          globalCache.lastMapCenter = [center.lat, center.lng];
                          globalCache.lastMapZoom = zoom;
                          globalCache.lastClickedMarkerId = marker.id;
                          
                          // Save to localStorage
                          localStorage.setItem('lastMapCenter', JSON.stringify([center.lat, center.lng]));
                          localStorage.setItem('lastMapZoom', zoom.toString());
                          localStorage.setItem('lastMapBounds', JSON.stringify(bounds.toBBoxString()));
                          localStorage.setItem('lastClickedMarkerId', marker.id);
                          localStorage.setItem('lastMapViewTimestamp', Date.now().toString());
                        }
                      }}
                    >
                      <Box sx={{ 
                        minWidth: '180px', 
                        maxWidth: isMobile ? '250px' : '300px',
                        p: 1.5,
                      }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ 
                          fontWeight: 'bold',
                          color: darkMode ? 'white' : 'text.primary'
                        }}>
                          {marker.title}
                        </Typography>
                        
                        <Box sx={{ 
                          mb: 1, 
                          display: 'flex', 
                          flexDirection: 'row', 
                          justifyContent: 'space-between', 
                          alignItems: 'center' 
                        }}>
                          <Box >
                            <Chip 
                              label={marker.postType === 'HelpRequest' 
                                ? (marker.categories || 'Help') 
                                : (marker.serviceType || 'Service')}
                              size="small" 
                              color={marker.postType === 'HelpRequest' ? 'primary' : 'success'}
                              sx={{ fontSize: '0.7rem', height: '20px', mr: 0.8,
                                // fontWeight: '600',
                                backgroundColor: marker.postType === 'HelpRequest' 
                                  ? (marker.categories === 'Paid' 
                                      ? darkMode ? '#065f46' : '#10b981'
                                      : marker.categories === 'UnPaid'
                                      ? darkMode ? '#854d0e' : '#f59e0b'
                                      : marker.categories === 'Emergency'
                                      ? darkMode ? '#991b1b' : '#dc2626'
                                      : darkMode ? '#374151' : '#6b7280'
                                    )
                                  : (darkMode ? '#1e3a8a' : '#3b82f6'),
                                color: 'white',
                                '& .MuiChip-label': {
                                  px: 1
                                }
                              }}
                            />
                            {/* Post Status Chip */}
                            <Chip
                              label={marker.postStatus || 'Active'}
                              size="small"
                              sx={{
                                fontSize: '0.65rem',
                                height: '20px',
                                // fontWeight: '600',
                                backgroundColor: marker.postStatus === 'Active' 
                                  ? (darkMode ? '#065f46' : '#10b981')
                                  : marker.postStatus === 'InActive'
                                  ? (darkMode ? '#6b7280' : '#9ca3af')
                                  : marker.postStatus === 'Closed'
                                  ? (darkMode ? '#991b1b' : '#dc2626')
                                  : (darkMode ? '#854d0e' : '#f59e0b'),
                                color: 'white',
                                '& .MuiChip-label': {
                                  px: 1
                                }
                              }}
                            />
                          </Box>
                          {marker.price > 0 && (
                            <Chip 
                              label={formatPrice(marker.price)}
                              icon={<CurrencyRupeeRoundedIcon sx={{ fontSize: '14px', color: 'inherit' }} />}
                              size="small" 
                              variant="filled"
                              sx={{
                                // fontSize: '0.7rem',
                                height: '20px',
                                // fontWeight: '600',
                                backgroundColor: darkMode 
                                  ? (marker.price > 1000 ? '#7c2d12' : '#365314')
                                  : (marker.price > 1000 ? '#fed7aa' : '#d9f99d'),
                                color: darkMode 
                                  ? (marker.price > 1000 ? '#fdba74' : '#a3e635')
                                  : (marker.price > 1000 ? '#9a3412' : '#3f6212'),
                                border: 'none',
                                '& .MuiChip-label': {
                                  px: 0.5, mr: 1,
                                }
                              }}
                            />
                          )}
                        </Box>
                        {marker.distance !== null && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOnIcon sx={{ 
                              fontSize: 16, mr: 0.5,
                              color: darkMode ? '#60a5fa' : '#3b82f6',
                            }} />
                            <Typography variant="caption" sx={{ color: darkMode ? '#d1d5db' : '#6b7280', }}>
                              {marker.distance < 1 
                                ? `${Math.round(marker.distance * 1000)}m away` 
                                : `${marker.distance.toFixed(1)}km away`
                              }
                            </Typography>
                          </Box>
                        )}

                        <Button 
                          variant="outlined" 
                          size="small" 
                          fullWidth 
                          sx={{ 
                            mt: 1, 
                            fontSize: '0.75rem', 
                            borderRadius: '8px', 
                            textTransform: 'none',
                            fontWeight: '600',
                            color: darkMode 
                              ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
                              : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            // boxShadow: darkMode 
                            //   ? '0 4px 14px rgba(59, 130, 246, 0.4)'
                            //   : '0 4px 14px rgba(37, 99, 235, 0.3)',
                            '&:hover': {
                              color: darkMode 
                                ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' 
                                : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                              boxShadow: darkMode 
                                ? '0 6px 20px rgba(59, 130, 246, 0.6)'
                                : '0 6px 20px rgba(37, 99, 235, 0.4)',
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchPostDetails(marker.id);
                          }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Popup>
                  </Marker>
                );
              })}
              </MarkerClusterGroup>
            )}
            {/* Blood Donor Markers - Only show when in BloodDonors mode */}
            {(selectedCategory === 'BloodDonors' || selectedCategory === 'Friends') && bloodDonorMarkers.length > 0 && (
              <MarkerClusterGroup
                chunkedLoading
                chunkDelay={100}
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={true}
                zoomToBoundsOnClick={true}
                maxClusterRadius={60}
                disableClusteringAtZoom={19} // Spider clustering at zoom 19 and above
                spiderLegPolylineOptions={{
                  weight: 1.5,
                  // color: '#dc3545',
                  color: darkMode ? '#3b82f6' : '#2563eb',
                  opacity: 0.7
                }}
                iconCreateFunction={(cluster) => {
                  const count = cluster.getChildCount();
                  const size = count > 100 ? 60 : count > 50 ? 50 : count > 20 ? 40 : 30;
                  
                  return L.divIcon({
                    html: `<div style="
                      width: ${size}px;
                      height: ${size}px;
                      // background: rgba(220, 53, 69, 0.9);
                      background: ${darkMode ? 'rgba(59, 130, 246, 0.9)' : 'rgba(37, 99, 235, 0.9)'};
                      color: white;
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-weight: bold;
                      font-size: ${size > 40 ? '14px' : '12px'};
                      border: 2px solid white;
                      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                      cursor: pointer;
                    ">${count}</div>`,
                    iconSize: [size, size],
                    className: 'marker-cluster'
                  });
                }}
              >
                {bloodDonorMarkers.map((donor, index) => {
                  if (donor.location && donor.location.latitude && donor.location.longitude) {
                    // Create custom icon for blood donors
                    // const customIcon = new L.Icon({
                    //   iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                    //     <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
                    //       <path d="M15 3C15 10 22 12 22 20C22 28 15 37 15 37C15 37 8 28 8 20C8 12 15 10 15 3Z" 
                    //             fill="#dc3545" stroke="#ffffff" stroke-width="2"/>
                    //       <text x="15" y="25" text-anchor="middle" fill="white" font-size="10" font-weight="bold">
                    //         ${donor.bloodDonor?.bloodGroup?.charAt(0) || 'B'}
                    //       </text>
                    //     </svg>
                    //   `),
                    //   iconSize: [30, 40],
                    //   iconAnchor: [15, 40],
                    //   popupAnchor: [0, -40]
                    // });

                    const donationCount = (donor?.bloodDonor?.donationCount)
                      ? donor.bloodDonor.donationCount
                      : 0;

                    const isBloodDonor = selectedCategory === 'BloodDonors';
                    const isFriend = selectedCategory === 'Friends';

                    // Determine marker color based on category
                    const markerColor = isBloodDonor ? '#dc3545' : '#007bff';
                    // const hoverColor = isBloodDonor ? '#c82333' : '#0056b3';

                    // Get eligibility info for blood donors
                    const getEligibilityInfo = () => {
                      if (!isBloodDonor || !donor.bloodDonor?.lastDonated) {
                        return { eligible: true, daysLeft: 0 };
                      }
                      const lastDate = new Date(donor.bloodDonor.lastDonated);
                      const today = new Date();
                      const diffTime = today.getTime() - lastDate.getTime();
                      const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                      const daysLeft = 56 - daysPassed;
                      return {
                        eligible: daysLeft <= 0,
                        daysLeft: daysLeft > 0 ? daysLeft : 0
                      };
                    };

                    const eligibility = getEligibilityInfo();

                    // Format last seen
                    const formatLastSeen = (date) => {
                      if (!date) return 'Never active';
                      const now = new Date();
                      const lastSeen = new Date(date);
                      const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));
                      if (diffInMinutes < 1) return 'Just now';
                      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
                      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
                      return `${Math.floor(diffInMinutes / 1440)}d ago`;
                    };

                    return (
                      <Marker
                        key={`${donor._id}-${index}`}
                        position={[donor.location.latitude, donor.location.longitude]}
                        // icon={customIcon}
                        icon={postsMappingIcon(
                          isBloodDonor ? donor.bloodDonor?.bloodGroup : donor?.username,
                          markerColor,
                          darkMode,
                          selectedCategory
                        )}
                        eventHandlers={{
                          click: (e) => {
                            e.originalEvent.stopPropagation();
                            e.target.openPopup();
                          }
                        }}
                      >
                        <Popup
                          className="custom-popup"
                          closeButton={true}
                          autoClose={false}
                          closeOnClick={false}
                          onOpen={() => {
                            // Save marker state when popup opens
                            if (mapRef.current) {
                              const center = mapRef.current.getCenter();
                              const zoom = mapRef.current.getZoom();
                              const bounds = mapRef.current.getBounds();
                              
                              // Save comprehensive map state
                              globalCache.lastMapView = {
                                center: [center.lat, center.lng],
                                zoom: zoom,
                                bounds: bounds.toBBoxString(),
                                timestamp: Date.now()
                              };
                              
                              globalCache.lastMapCenter = [center.lat, center.lng];
                              globalCache.lastMapZoom = zoom;
                              globalCache.lastClickedMarkerId = donor._id;
                              
                              // Save to localStorage
                              localStorage.setItem('lastMapCenter', JSON.stringify([center.lat, center.lng]));
                              localStorage.setItem('lastMapZoom', zoom.toString());
                              localStorage.setItem('lastMapBounds', JSON.stringify(bounds.toBBoxString()));
                              localStorage.setItem('lastClickedMarkerId', donor._id);
                              localStorage.setItem('lastMapViewTimestamp', Date.now().toString());
                            }
                          }}
                        >
                          <Box sx={{ 
                            minWidth: isMobile ? '250px' : '280px',
                            maxWidth: isMobile ? '280px' : '320px',
                            p: 1.5,
                          }}>
                            {/* Header Section - Unified for both categories */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                              {/* Profile Picture */}
                              <Avatar
                                src={donor.profilePic ? `data:image/jpeg;base64,${donor.profilePic}` : null}
                                sx={{ 
                                  width: 50, 
                                  height: 50,
                                  border: `2px solid ${isBloodDonor ? '#dc3545' : '#007bff'}`,
                                  bgcolor: darkMode ? '#374151' : '#e5e7eb'
                                }}
                              >
                                {!donor.profilePic && donor.username?.charAt(0).toUpperCase()}
                              </Avatar>
                              
                              <Box flex={1} minWidth={0}>
                                {/* Username and Verification */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, pr: 2 }}>
                                  <Typography 
                                    variant="subtitle1" 
                                    sx={{ 
                                      fontWeight: 'bold',
                                      color: darkMode ? 'white' : 'text.primary',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {donor.username || 'Unknown User'}
                                  </Typography>
                                  {donor.idVerification?.status === 'approved' && (
                                    <VerifiedRounded color="success" fontSize="small" />
                                  )}
                                </Box>
                                
                                {/* Location and Distance */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <LocationOnIcon sx={{ 
                                    fontSize: 14, 
                                    color: darkMode ? '#60a5fa' : '#3b82f6'
                                  }} />
                                  <Typography variant="caption" sx={{ 
                                    color: darkMode ? '#d1d5db' : '#6b7280'
                                  }}>
                                    {/* {donor.location.city || 'Unknown location'} •  */}
                                    {donor.distance < 1 
                                      ? ` ${Math.round(donor.distance * 1000)}m` 
                                      : ` ${donor.distance.toFixed(1)}km`
                                    } away
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>

                            {/* Category-specific badges */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                              {/* Blood Donor Badge */}
                              {isBloodDonor && (
                                <>
                                  <Chip 
                                    icon={<BloodtypeRounded sx={{ fontSize: 14 }} />}
                                    label={donor.bloodDonor?.bloodGroup || 'Unknown'}
                                    size="small"
                                    sx={{ 
                                      fontSize: '0.7rem', 
                                      height: '24px',
                                      backgroundColor: '#dc3545',
                                      color: 'white',
                                      '& .MuiChip-icon': { color: 'white' }
                                    }}
                                  />
                                  {donationCount >= 0 && (
                                    <Chip
                                      icon={<FavoriteRounded sx={{ fontSize: 14 }} />}
                                      label={`${donationCount} donation${donationCount > 1 ? 's' : ''}`}
                                      size="small"
                                      sx={{ 
                                        fontSize: '0.7rem', 
                                        height: '24px',
                                        backgroundColor: '#F57C0015',
                                        color: '#F57C00',
                                        border: '1px solid #F57C00',
                                        '& .MuiChip-icon': { color: '#F57C00' }
                                      }}
                                    />
                                  )}
                                </>
                              )}

                              {/* Friends Badge */}
                              {isFriend && (
                                <>
                                  {donor.friendsProfile?.gender && donor.friendsProfile.gender !== 'Unknown' && (
                                    <Chip
                                      icon={donor.friendsProfile.gender === 'Male' ? <ManRounded sx={{ fontSize: 14 }} /> : 
                                            donor.friendsProfile.gender === 'Female' ? <WomanRounded sx={{ fontSize: 14 }} /> : 
                                            <TransgenderRounded sx={{ fontSize: 14 }} />}
                                      label={donor.friendsProfile.gender}
                                      size="small"
                                      sx={{ 
                                        fontSize: '0.7rem', 
                                        height: '24px',
                                        backgroundColor: donor.friendsProfile.gender === 'Male' ? '#2196f315' :
                                                        donor.friendsProfile.gender === 'Female' ? '#e91e6315' :
                                                        '#9c27b015',
                                        color: donor.friendsProfile.gender === 'Male' ? '#2196f3' :
                                              donor.friendsProfile.gender === 'Female' ? '#e91e63' :
                                              '#9c27b0',
                                        border: `1px solid ${donor.friendsProfile.gender === 'Male' ? '#2196f3' :
                                                          donor.friendsProfile.gender === 'Female' ? '#e91e63' :
                                                          '#9c27b0'}40`
                                      }}
                                    />
                                  )}
                                  {donor.friendsProfile?.age && (
                                    <Chip
                                      icon={<CakeRounded sx={{ fontSize: 14 }} />}
                                      label={`${donor.friendsProfile.age} yrs`}
                                      size="small"
                                      sx={{ 
                                        fontSize: '0.7rem', 
                                        height: '24px',
                                        backgroundColor: '#9c27b015',
                                        color: '#9c27b0',
                                        border: '1px solid #9c27b040'
                                      }}
                                    />
                                  )}
                                </>
                              )}

                              {/* Trust Level Chip - Common for both */}
                              <Chip
                                icon={<Rating value={donor.trustLevel || 0} size="small" readOnly sx={{ fontSize: '12px', color: '#ffb400' }} />}
                                label={donor.trustLevel > 0 ? `${donor.trustLevel.toFixed(1)}/5` : 'N/A'}
                                size="small"
                                sx={{ 
                                  fontSize: '0.7rem', 
                                  height: '24px',
                                  backgroundColor: '#ffb40015',
                                  color: '#ffb400',
                                  border: '1px solid #ffb40040',
                                  '& .MuiChip-icon': { marginLeft: '4px' }
                                }}
                              />
                            </Box>

                            {/* Profile Description */}
                            {donor.profileDescription && (
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  mb: 1.5, 
                                  color: darkMode ? '#d1d5db' : '#4b5563',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  fontSize: '0.75rem',
                                  lineHeight: 1.5
                                }}
                              >
                                {donor.profileDescription}
                              </Typography>
                            )}

                            {/* Blood Donor Eligibility Section */}
                            {isBloodDonor && donor.bloodDonor?.lastDonated && (
                              <Box sx={{ 
                                mb: 1.5, 
                                p: 1, 
                                backgroundColor: darkMode ? 'rgba(220, 53, 69, 0.1)' : 'rgba(220, 53, 69, 0.05)',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <ScheduleRounded sx={{ fontSize: 14, color: '#dc3545' }} />
                                  <Typography variant="caption" sx={{ color: darkMode ? '#d1d5db' : '#4b5563' }}>
                                    Last: {new Date(donor.bloodDonor.lastDonated).toLocaleDateString()}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={eligibility.eligible ? 'Ready' : `${eligibility.daysLeft}d left`}
                                  size="small"
                                  sx={{ 
                                    height: '20px',
                                    fontSize: '0.65rem',
                                    backgroundColor: eligibility.eligible ? '#4caf5015' : '#ff980015',
                                    color: eligibility.eligible ? '#4caf50' : '#ff9800',
                                    border: `1px solid ${eligibility.eligible ? '#4caf50' : '#ff9800'}40`
                                  }}
                                />
                              </Box>
                            )}

                            {/* Friends Looking For Section */}
                            {isFriend && donor.friendsProfile?.lookingFor && donor.friendsProfile.lookingFor.length > 0 && (
                              <Box sx={{ mb: 1.5 }}>
                                <Typography variant="caption" sx={{ 
                                  display: 'block', 
                                  mb: 0.5,
                                  color: darkMode ? '#9ca3af' : '#6b7280',
                                  fontWeight: 500
                                }}>
                                  Looking for:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {donor.friendsProfile.lookingFor.slice(0, 2).map((item, idx) => (
                                    <Chip
                                      key={idx}
                                      label={item}
                                      size="small"
                                      sx={{ 
                                        fontSize: '0.65rem', 
                                        height: '20px',
                                        backgroundColor: '#007bff15',
                                        color: '#007bff',
                                        border: '1px solid #007bff40'
                                      }}
                                    />
                                  ))}
                                  {donor.friendsProfile.lookingFor.length > 2 && (
                                    <Chip
                                      label={`+${donor.friendsProfile.lookingFor.length - 2}`}
                                      size="small"
                                      sx={{ 
                                        fontSize: '0.65rem', 
                                        height: '20px',
                                        backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                                        color: darkMode ? '#9ca3af' : '#6b7280'
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            )}

                            {/* Interests Section - Common for both */}
                            {/* {donor.interests && donor.interests.length > 0 && (
                              <Box sx={{ mb: 1.5 }}>
                                <Typography variant="caption" sx={{ 
                                  display: 'block', 
                                  mb: 0.5,
                                  color: darkMode ? '#9ca3af' : '#6b7280',
                                  fontWeight: 500
                                }}>
                                  Interests:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {donor.interests.slice(0, 3).map((interest, idx) => (
                                    <Chip
                                      key={idx}
                                      label={interest}
                                      size="small"
                                      variant="outlined"
                                      sx={{ 
                                        fontSize: '0.65rem', 
                                        height: '20px',
                                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                        color: darkMode ? '#9ca3af' : '#6b7280'
                                      }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            )} */}

                            {/* Footer Section - Stats and Last Active */}
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              pt: 1,
                              mt: 0.5,
                              borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                  <PeopleRounded sx={{ fontSize: 14, color: darkMode ? '#9ca3af' : '#6b7280' }} />
                                  <Typography variant="caption" sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                                    {donor.followerCount || 0}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                                  • Last seen: {formatLastSeen(donor.lastLoginAt)}
                                </Typography>
                              </Box>
                              
                              {/* <Chip
                                label={donor.userCode || 'N/A'}
                                size="small"
                                sx={{ 
                                  height: '18px',
                                  fontSize: '0.6rem',
                                  backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                                  color: darkMode ? '#9ca3af' : '#6b7280'
                                }}
                              /> */}
                            </Box>
                            {/* View Details Button */}
                            <Button 
                              variant="contained"
                              size="small" 
                              fullWidth 
                              sx={{ 
                                mt: 1.5, 
                                fontSize: '0.75rem', 
                                borderRadius: '6px',
                                textTransform: 'none',
                                fontWeight: 600,
                                py: 0.5,
                                background: isBloodDonor 
                                  ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                                  : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                                '&:hover': {
                                  background: isBloodDonor 
                                    ? 'linear-gradient(135deg, #c82333 0%, #bd2130 100%)'
                                    : 'linear-gradient(135deg, #0056b3 0%, #004085 100%)',
                                  transform: 'translateY(-1px)',
                                  boxShadow: darkMode 
                                    ? `0 4px 12px ${isBloodDonor ? 'rgba(220, 53, 69, 0.4)' : 'rgba(0, 123, 255, 0.4)'}`
                                    : `0 4px 12px ${isBloodDonor ? 'rgba(220, 53, 69, 0.3)' : 'rgba(0, 123, 255, 0.3)'}`
                                },
                                transition: 'all 0.2s ease'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenUserProfileDialog(donor._id);
                              }}
                            >
                              View Full Profile
                            </Button>
                          </Box>
                        </Popup>
                      </Marker>
                    );
                  }
                  return null;
                })}
              </MarkerClusterGroup>
            )}
            {/* Wave Animation Circles */}
            <WaveAnimationCircles 
              center={userLocation ? [userLocation.latitude, userLocation.longitude] : null}
              loading={loading}
              distanceRange={distanceRange}
            />
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
        </Box>

        {/* Floating Map Card */}
        <Box display="flex" justifyContent="flex-start" sx={{
          position: 'absolute',
          bottom: isMobile ? 20 : 20,
          left: 10,
          zIndex: 2, flexGrow: 1, marginRight: '6px', marginLeft: isMobile ? '-12px' : '-14px'
        }} onClick={recenterUserLocation}
        >
          <IconButton onClick={() => setShowMap(true)} sx={{
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
            <Typography
              variant="body1"
              sx={{
                color: '#4361ee',
                fontWeight: 600,
                maxWidth: isMobile ? '120px' : '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {getLocationLabel({
                loading: loadingLocation,
                address: currentAddress,
                isMobile
              })}
            </Typography>
          </IconButton>
        </Box>
        {showMap && (
          <Card
            sx={{
              position: 'absolute',
              bottom: isMobile ? 25 : 25,
              left: '10px',
              // width: '95%',
              minWidth: isMobile ? '95%' : '600px',
              maxWidth: isMobile ? '95%' : '600px',
              zIndex: 1000,
              borderRadius: '12px',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
              // backgroundColor: '#fff', 
              '& .MuiCardContent-root': { padding: '10px' },
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Your Location</Typography>
                <IconButton onClick={() => setShowMap(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box display="flex" justifyContent="start" mb={2} mt={1}>
                <LocationOnIcon color='primary' />
                <Typography
                  variant="body1"
                  sx={{
                    marginLeft: '8px',
                    color: 'grey',
                    cursor: 'pointer',
                    '&:hover': { color: theme.palette.success.main }
                  }}
                  onClick={recenterUserLocation}
                >
                  {getLocationDescription({
                    loading: loadingLocation,
                    address: currentAddress
                  })}
                </Typography>
              </Box>
              {locationDetails?.accuracy && (
                <Box sx={{ m: '10px' }}>
                  <Typography variant="body2" color="textSecondary">
                    📍 Location accuracy: approximately{' '}
                    <strong>{formatAccuracy(locationDetails.accuracy)}</strong>
                  </Typography>
                </Box>
              )}
              {locationDetails?.accuracy > 1000 && (
                <Typography variant="caption" color="warning.main">
                  ⚠️ Low accuracy detected. Move to an open area or enable GPS for better results.
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {/* Map Controls */}
        <Box sx={{
          position: 'absolute',
          top: isMobile ? 80 : 80,
          right: isMobile ? 10 : 20,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          <Fab size="small" sx={mapButtonStyle(mapMode, isMobile)} onClick={zoomIn}>
            <ZoomInIcon />
          </Fab>
          <Fab size="small" sx={mapButtonStyle(mapMode, isMobile)} onClick={zoomOut}>
            <ZoomOutIcon />
          </Fab>
        </Box>
        <Box sx={{
          position: 'absolute',
          bottom: isMobile ? 75 : 75,
          right: isMobile ? 10 : 20,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'row',
          gap: 1
        }}>
          <Fab size="small" sx={mapButtonStyle(mapMode, isMobile)} onClick={fetchUserLocation} disabled={loadingLocation}>
            {loadingLocation ? <CircularProgress size={16} /> : <MyLocationRoundedIcon />}
          </Fab>
          <Fab size="small" sx={mapButtonStyle(mapMode, isMobile)} onClick={setMapModeType} >
            {mapMode === 'normal' ? <SatelliteAltRoundedIcon /> : <MapRoundedIcon />}
          </Fab>
        </Box>


        {/* Distance Range Menu */}
        <Box sx={{
          position: 'absolute',
          bottom: isMobile ? 25 : 25,
          right: isMobile ? 10 : 20,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'row',
          gap: 1
        }}>
          <Fab size="small" sx={{ width: '90px', borderRadius: '20px', ...mapButtonStyle(mapMode, isMobile) }} onClick={() => setShowDistanceRanges(!showDistanceRanges)} >
            <ShareLocationRoundedIcon sx={{ mr: '2px' }} /> {distanceRange} km
          </Fab>
        </Box>
        {showDistanceRanges && (
          <Card
            // anchorEl={anchorEl}
            // open={Boolean(anchorEl)}
            // onClose={handleDistanceMenuClose}
            sx={{
              position: 'absolute',
              bottom: isMobile ? 25 : 25,
              right: '10px',
              // width: '90%',
              // maxWidth: '400px',
              minWidth: isMobile ? '95%' : 'auto',
              maxWidth: isMobile ? '95%' : 'auto',
              zIndex: 1000, '& .MuiPaper-root': { borderRadius: '12px' }, borderRadius: '10px', backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              // background: 'rgba(255, 255, 255, 0.9)',
              background: 'rgba(255, 255, 255, 0.95)',
              '& .MuiCardContent-root': { padding: '10px' },
            }}
          >
            <Box sx={{ m: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'column', gap: 1 }}>
              <Box sx={{ m: 0, borderRadius: '8px' }}>
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
                  <Box sx={{ mb: 1, display: isMobile ? 'inline' : 'flex', justifyContent: isMobile ? 'normal' : 'unset' }}>
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
                    <Box sx={{ position: 'absolute', top: '10px', right: '10px', marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>

                      <IconButton
                        onClick={() => setShowDistanceRanges(false)}
                        variant="text"
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  {/* Distance Slider */}
                  <DistanceSlider distanceRange={distanceRange} setDistanceRange={setDistanceRange} userLocation={userLocation} mapRef={mapRef} isMobile={isMobile} getZoomLevel={getZoomLevel} distanceValues={distanceValues} setShowDistanceRanges={setShowDistanceRanges} />


                </Box>
                {/* {isMobile && ( */}
                <Box sx={{ padding: '4px 8px', mt: isMobile ? 2 : 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                </Box>
              </Box>
            </Box>
          </Card>
        )}

        {/* Distance Slider */}
        {/* <Box sx={{
                position: 'absolute',
                bottom: isMobile ? 20 : 20,
                right: '2px',
                transform: 'translateX(-50%)',
                zIndex: 2,
                width: isMobile ? '80%' : '40%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: 2,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
                <Typography variant="body2" gutterBottom>
                Search within {distanceRange} km
                </Typography>
                <Slider
                value={distanceRange}
                onChange={(e, newValue) => setDistanceRange(newValue)}
                valueLabelDisplay="auto"
                step={1}
                marks={distanceValues.map(value => ({ value, label: `${value}km` }))}
                min={1}
                max={50}
                />
            </Box> */}
        {/* Content Overlay with animation */}
        <Fade in={overlayVisible} timeout={500}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2,
              background: 'linear-gradient(to bottom, rgba(238, 204, 67, 0.85) 0%, rgba(163, 143, 12, 0.85) 50%, transparent 100%)',
              // background: 'linear-gradient(0deg,rgba(155, 39, 176, 0.8) 0%, rgba(57, 12, 163, 0.8) 50%, transparent 100%)', // 'linear-gradient(to bottom, rgba(67, 97, 238, 0.85) 0%, rgba(58, 12, 163, 0.85) 50%, transparent 100%)',
              color: 'white',
              padding: isMobile ? '1.5rem 1rem' : '2rem',
              pt: '6rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'opacity 0.5s ease-in-out',
              WebkitTapHighlightColor: 'transparent',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backdropFilter: 'blur(8px)',
                background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.15) 0%, transparent 70%)',
                zIndex: -1
              },
              '&:hover': {
                background: 'linear-gradient(to bottom, rgba(238, 204, 67, 0.85) 0%, rgba(163, 143, 12, 0.85) 50%, transparent 100%)',
              }
            }}
            onClick={hideOverlay}
          >
            {/* <IconButton
                        sx={{
                            position: 'absolute',
                            top: 116,
                            right: 16,
                            color: 'white',
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            }
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            hideOverlay();
                        }}
                    >
                        <CloseIcon />
                    </IconButton> */}

            <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" sx={{
              fontWeight: 700,
              mb: 2,
              textShadow: '0 2px 8px rgba(0,0,0,0.6)'
            }}>
              Help Others, Earn Money
            </Typography>
            <Typography variant={isMobile ? 'body1' : 'h6'} sx={{
              maxWidth: '800px',
              margin: '0 auto 2rem',
              opacity: 0.95,
              lineHeight: 1.6,
              textShadow: '0 1px 3px rgba(0,0,0,0.6)'
            }}>
              Help others with their needs and get paid for your services.
            </Typography>

            <Chip
              label="Click here to explore the map"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 500,
                backdropFilter: 'blur(10px)',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 0.7 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.7 }
                }
              }}
            />
          </Box>
        </Fade>

        {/* Show Overlay Button (only when overlay is hidden) */}
        {/* {!overlayVisible && (
            <Fab
                color="primary"
                size="small"
                onClick={showOverlay}
                sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 2,
                }}
            >
                <LayersIcon />
            </Fab>
            )} */}
      </Box>
      {/* <CategoryBar selectedCategory={selectedCategory} onCategorySelect={handleCategorySelect} darkMode={darkMode} isMobile={isMobile}/> */}
      {/* <MenuCard selectedCategory={selectedCategory} onCategorySelect={handleCategorySelect} filters={filters} darkMode={darkMode} isMobile={isMobile}/> */}
      <Box 
        sx={{ background: darkMode 
          ? 'rgba(30, 30, 30, 0.95)' 
          : 'rgba(255, 255, 255, 0.27)', backdropFilter: 'blur(20px)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
          mt: isMobile ? '420px' : '420px', 
          position: 'relative', zIndex: 1050, 
          height: isMobile ? '90vh' : '88vh', // Set height to 90% of viewport height
          maxHeight: isMobile ? '90vh' : '88vh', // Ensure it doesn't exceed 90% of viewport
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden' // Prevent container scroll
        }}
      >
        {/* Draggable Handler for Mobile and Laptop */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            height: '24px',
            zIndex: 1100,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'grab',
            // touchAction: 'none',
            background: 'transparent',
            // userSelect: 'none',
            '&:active': {
              cursor: 'grabbing',
            },
            '&:hover': {
              '& .drag-handle': {
                backgroundColor: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
                width: '48px',
              }
            }
          }}
        >
          {/* Drag handle indicator */}
          <Box
            className="drag-handle"
            sx={{
              width: '40px',
              height: '4px',
              borderRadius: '2px',
              backgroundColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease',
            }}
          />
        </Box>
        
        <MenuCard selectedCategory={selectedCategory} onCategorySelect={handleCategorySelect} filters={filters} darkMode={darkMode} isMobile={isMobile} setSnackbar={setSnackbar} />
        {/* <Box 
          sx={{
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)',
            opacity: isHeaderVisible ? 1 : 0,
            height: isHeaderVisible ? 'auto' : '0px',
            // overflow: 'hidden',
            position: 'sticky',
            top: 0,
            zIndex: 999,
            // background: darkMode 
            //   ? 'rgba(30, 30, 30, 0.95)' 
            //   : 'rgba(255, 255, 255, 0.95)',
            // backdropFilter: 'blur(20px)',
            // pointerEvents: isHeaderVisible ? 'auto' : 'none',
            flexShrink: 0,
            // transformOrigin: 'top center',
            willChange: 'transform' // Performance optimization
          }}
        > */}
        <Box sx={{display:'flex', justifyContent:'space-between', transition: 'transform 0.3s ease, opacity 0.3s ease',
          transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isHeaderVisible ? 1 : 0,
          height: isHeaderVisible ? 'auto' : '0px',
          // overflow: 'hidden',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          flexShrink: 0,
          // transformOrigin: 'top center',
          willChange: 'transform', // Performance optimization
          //  background: 'rgba(255,255,255,0.8)',  backdropFilter: 'blur(10px)',
          // boxShadow: '0 2px 10px rgba(0,0,0,0.05)', 
          borderRadius: '12px', 
          px: isMobile ? '12px' : '16px', pb: '8px',  mx: '4px',
          // position: 'relative', //sticky
          // top: 0,
          // zIndex: 1000, 
          // position: 'sticky', // Make it sticky
          // flexShrink: 0 // Prevent shrinking
          // ...getGlassmorphismStyle(0.1, 10),
          }}> 
          {/* <Typography variant="h6" style={{ flexGrow: 1, marginRight: '2rem' }}>
            Posts
          </Typography> */}
          {/* <Box display="flex" justifyContent="flex-start" sx={{flexGrow: 1, marginRight: '6px', marginLeft: isMobile ? '-12px' : '-14px'}}>
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
              {(currentAddress.split(" ").length > (isMobile ? 2 : 3) ? `${currentAddress.split(" ").slice(0, (isMobile ? 2 : 3)).join(" ")}...` : currentAddress) || "Fetching location..."}
            </Typography>
          </IconButton>
          </Box>
          <Box> */}
          
          {/* Floating Map Card */}
          {/* {showMap && (
            <Card
              sx={{
                position: 'absolute',
                top: isMobile ? '62px' : '72px',
                left: '1px',
                // width: '95%',
                minWidth: isMobile ? '100%' : '600px',
                maxWidth: isMobile ? '100%' : '600px',
                zIndex: 1000,
                borderRadius: '12px',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
                // backgroundColor: '#fff', 
                '& .MuiCardContent-root': {padding: '10px' },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Your Location</Typography>
                  <IconButton onClick={() => setShowMap(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                <Box display="flex" justifyContent="start" mb={2} mt={1}>
                <LocationOnIcon color='primary'/>
                <Typography variant="body1" sx={{marginLeft:'8px', color:'grey', cursor: 'pointer', '&:hover': { color: theme.palette.success.main } }} onClick={recenterUserLocation}>
                  {currentAddress || "Fetching location..."}
                </Typography>
                </Box> */}

                {/* Map */}
                {/* <Box sx={{ height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
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
                    Labels and Roads Layer (Overlay)
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
                    Distance Circles
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
                        //<Popup>{distanceRange} km</Popup>
                      </Circle>
                    ))}
                    Render a circle for custom distances (if it's not in distanceValues)
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
                </Box> */}

                {/* Locate Me Button */}
                {/* <Box display="flex" justifyContent="space-between" marginTop="1rem">
                  <Button
                    variant="outlined"
                    startIcon={mapMode === 'normal' ? <SatelliteAltRoundedIcon /> : <MapRoundedIcon />}
                    onClick={() => setMapMode(mapMode === 'normal' ? 'satellite' : 'normal')}
                    sx={{ borderRadius: 3, textTransform: 'none'}}
                  >
                    {mapMode === 'normal' ? 'Satellite' : 'Normal'}
                  </Button>
                    <Button
                      variant="outlined"
                      startIcon={loadingLocation ? <CircularProgress size={16} /> : <MyLocationRoundedIcon />}
                      onClick={fetchUserLocation}
                      disabled={loadingLocation}
                      sx={{ borderRadius: 3, textTransform: 'none' }}
                    >
                      Locate Me
                    </Button>
                </Box>
                {locationDetails && (
                  <Box sx={{m:'10px'}}>
                    <Typography variant="body2" color="textSecondary">
                      * Your location accuracy is approximately <strong>{locationDetails.accuracy}m</strong>.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
          </Box> */}
          {/* Search Bar */}
          { <SearchContainer>  {/* {!isMobile && <SearchContainer> */}
            <Box>
            <SearchTextField
              variant="outlined"
              placeholder={expanded ? selectedCategory === 'BloodDonors' ? "Search donors..." : selectedCategory === 'Friends' ? "Search friends..." : "Search posts..." : ""}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setExpanded(true)}
              onBlur={handleBlur}
              inputRef={inputRef}
              expanded={expanded} darkMode={darkMode} isMobile={isMobile}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 0 }}>
                    <IconButton 
                      onClick={!expanded ? handleSearchClick : undefined}
                      sx={{
                        minWidth: '40px',
                        minHeight: '40px',
                        // marginLeft: expanded ? '8px' : '0px',
                      }}
                    >
                      {isSearching ? (
                        <CircularProgress size={20} />
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
          {/* {isMobile && !expanded && <IconButton 
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
          </IconButton>} */}
          <Box sx={{display:'flex', justifyContent:'space-between', marginRight:'-6px', marginLeft:'8px'}}>
            {/* Sort Button */}
            {/* <Button
              variant="outlined"
              onClick={() => setShowSortMenu(!showSortMenu)}
              startIcon={<SortRoundedIcon />}
              sx={{
                borderRadius: "12px",
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: 'primary.light',
                }
              }}
            >
              Sort
            </Button> */}
            <Tooltip title="Sort" arrow>
              <IconButton 
                onClick={() => setShowSortMenu(!showSortMenu)}
                sx={{
                  minWidth: '40px',
                  minHeight: '40px',
                  mr: '4px', ...getButtonStyle(darkMode, showSortMenu),
                  // backgroundColor: showSortMenu ? darkMode ? 'rgba(255, 255, 255, 0.1)'  : 'rgba(0, 0, 0, 0.05)' : 'transparent',
                }}
              >
                <SortRoundedIcon />
              </IconButton>
            </Tooltip>

            {/* Sort Menu */}
            {showSortMenu && (
              <Card
                sx={{
                  position: 'absolute',
                  top: isMobile ? '45px' : '45px',
                  right: '8px',
                  zIndex: 1001,
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  background: 'rgba(255, 255, 255, 0.95)',
                  minWidth: '200px'
                }}
              >
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, px: 1 }}>
                    Sort by
                  </Typography>
                  <MenuItem 
                    onClick={() => handleSortChange('nearest')}
                    selected={sortBy === 'nearest'}
                    sx={{ borderRadius: '8px' }}
                  >
                    <ListItemIcon>
                      {sortBy === 'nearest' && <CheckRoundedIcon fontSize="small" color="success" />}
                    </ListItemIcon>
                    Nearest posts first
                  </MenuItem>
                  <MenuItem 
                    onClick={() => handleSortChange('latest')}
                    selected={sortBy === 'latest'}
                    sx={{ borderRadius: '8px', mb: 0.5 }}
                  >
                    <ListItemIcon>
                      {sortBy === 'latest' && <CheckRoundedIcon fontSize="small" color="success" />}
                    </ListItemIcon>
                    Latest posts first
                  </MenuItem>
                </Box>
              </Card>
            )}
            {/* filters card */}
            <Tooltip title="Filters" arrow>
              <IconButton 
                onClick={() => setIsExtraFiltersOpen((prev) => !prev)}
                sx={{
                  minWidth: '40px',
                  minHeight: '40px', mr: '4px', ...getButtonStyle(darkMode, isExtraFiltersOpen),
                  // backgroundColor: isExtraFiltersOpen ? darkMode ? 'rgba(255, 255, 255, 0.1)'  : 'rgba(0, 0, 0, 0.05)' : 'transparent',
                }}
              >
                <FilterListRoundedIcon />
              </IconButton>
            </Tooltip>
            {isExtraFiltersOpen &&  (
              <Card
                sx={{
                  position: 'absolute',
                  top: isMobile ? '45px' : '45px',
                  right: '1px', 
                  // ml: '4px', 
                  width: isMobile ? 'calc(100% - 4px)' : '400px',
                  maxWidth: isMobile ? '100%' : '400px',
                  zIndex: 1001,
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  background: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
                  maxHeight: '60vh',
                  overflowY: 'auto',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {selectedCategory === 'BloodDonors' ? 'Blood Donor Filters' : 
                      selectedCategory === 'Friends' ? 'Friends Filters' : 
                      'Filters'}
                    </Typography>
                    <IconButton
                      onClick={() => setIsExtraFiltersOpen(false)}
                      size="small"
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                  
                  {/* Filter Content based on selectedCategory */}
                  <Box sx={{ mt: 2 }}>
                    {selectedCategory === 'BloodDonors' ? (
                      <>
                        {/* Blood Donor Filter Summary */}
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1, 
                          mb: 2, 
                          flexWrap: 'wrap',
                          alignItems: 'center'
                        }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            Active filters:
                          </Typography>
                          
                          {localFilters?.bloodGroup !== 'All' && (
                            <Chip
                              size="small"
                              label={`Blood Group: ${localFilters?.bloodGroup}`}
                              onDelete={resetBloodDonorFilters}
                              color="error"
                              variant="outlined"
                              sx={{ 
                                fontWeight: 500,
                                '& .MuiChip-deleteIcon': { fontSize: '0.8rem' }
                              }}
                            />
                          )}
                          
                          {localFilters?.bloodGroup !== 'All' && (
                            <Button
                              size="small"
                              onClick={resetBloodDonorFilters}
                              sx={{ ml: 'auto', fontSize: '0.75rem', minWidth: 'auto' }}
                            >
                              Clear
                            </Button>
                          )}
                        </Box>

                        {/* Blood Group Filter - Enhanced */}
                        <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(220, 53, 69, 0.05)' }}>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              cursor: 'pointer',
                              mb: activeBloodDonorFilters.bloodGroup ? 2 : 0,
                              WebkitTapHighlightColor: 'transparent',
                              WebkitTouchCallout: 'none',
                              WebkitUserSelect: 'none',
                              userSelect: 'none',
                            }}
                            onClick={() => toggleBloodDonorFilterSection('bloodGroup')}
                          >
                            <Typography variant="subtitle2" fontWeight={600} color="error.main">
                              <BloodtypeRounded fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Blood Group
                            </Typography>
                            <IconButton size="small">
                              {activeBloodDonorFilters.bloodGroup ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </Box>
                          
                          {activeBloodDonorFilters.bloodGroup && (
                            <Box sx={{ mt: 2 }}>
                              {/* Blood Group Quick Presets */}
                              <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                                Select blood group:
                              </Typography>
                              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                                  <Button
                                    key={group}
                                    variant={localFilters?.bloodGroup === group ? "contained" : "outlined"}
                                    color="error"
                                    size="small"
                                    onClick={() => handleBloodGroupPreset(group)}
                                    sx={{
                                      borderRadius: '8px',
                                      textTransform: 'none',
                                      fontWeight: localFilters?.bloodGroup === group ? 600 : 400,
                                      backgroundColor: localFilters?.bloodGroup === group ? '#dc3545' : 'transparent',
                                      '&:hover': {
                                        backgroundColor: localFilters?.bloodGroup === group ? '#c82333' : 'rgba(220, 53, 69, 0.08)'
                                      }
                                    }}
                                  >
                                    {group}
                                  </Button>
                                ))}
                                <Button
                                  variant={localFilters?.bloodGroup === 'All' ? "contained" : "outlined"}
                                  color="primary"
                                  size="small"
                                  onClick={() => handleBloodGroupPreset('All')}
                                  sx={{
                                    gridColumn: 'span 2',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: localFilters?.bloodGroup === 'All' ? 600 : 400,
                                    backgroundColor: localFilters?.bloodGroup === 'All' ? '#1976d2' : 'transparent',
                                    '&:hover': {
                                      backgroundColor: localFilters?.bloodGroup === 'All' ? '#1565c0' : 'rgba(25, 118, 210, 0.08)'
                                    }
                                  }}
                                >
                                  All Blood Groups
                                </Button>
                              </Box>
                              
                              {/* Blood Group Dropdown for precise selection */}
                              {/* <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                                <InputLabel>Select Blood Group</InputLabel>
                                <Select
                                  name="bloodGroup"
                                  value={localFilters?.bloodGroup || 'All'}
                                  onChange={handleFilterChange}
                                  label="Select Blood Group"
                                  sx={{ borderRadius: '12px' }}
                                >
                                  <MenuItem value="All">All Blood Groups</MenuItem>
                                  <MenuItem value="A+">A+</MenuItem>
                                  <MenuItem value="A-">A-</MenuItem>
                                  <MenuItem value="B+">B+</MenuItem>
                                  <MenuItem value="B-">B-</MenuItem>
                                  <MenuItem value="AB+">AB+</MenuItem>
                                  <MenuItem value="AB-">AB-</MenuItem>
                                  <MenuItem value="O+">O+</MenuItem>
                                  <MenuItem value="O-">O-</MenuItem>
                                </Select>
                              </FormControl> */}
                            </Box>
                          )}
                        </Box>

                        {/* Blood Donor Info */}
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          bgcolor: 'rgba(255, 193, 7, 0.05)',
                          border: '1px solid rgba(255, 193, 7, 0.1)'
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InfoRounded fontSize="small" />
                            <Box>
                              <strong>Note:</strong> Blood donors are lifesavers! 
                              Filter by specific blood groups to find compatible donors in emergencies.
                            </Box>
                          </Typography>
                        </Box>
                      </>
                    ) : selectedCategory === 'Friends' ? (
                    <>
                      {/* Filter Summary Bar */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        mb: 2, 
                        flexWrap: 'wrap',
                        alignItems: 'center'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            Active filters:
                          </Typography>
                          {/* {(activeFriendFilters.gender || activeFriendFilters.ageRange || activeFriendFilters.lookingFor) && ( */}
                          {((localFilters?.friendsGender !== DEFAULT_FILTERS?.friendsGender) || 
                            (localFilters?.friendsAgeRange?.[0] !== DEFAULT_FILTERS?.friendsAgeRange?.[0]) || 
                            (localFilters?.friendsAgeRange?.[1] !== DEFAULT_FILTERS?.friendsAgeRange?.[1]) || 
                            (localFilters?.friendsLookingFor?.length > 0)) && (
                            <Button
                              size="small"
                              onClick={resetFriendFilters}
                              sx={{ ml: 'auto', fontSize: '0.75rem' }}
                            >
                              Clear All
                            </Button>
                          )}
                        </Box>
                        
                        {(localFilters?.friendsGender !== '') && (
                          <Chip
                            size="small"
                            label={`Gender: ${localFilters.friendsGender || 'All'}`}
                            onDelete={() => setLocalFilters(prev => ({ ...prev, friendsGender: '' }))}
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        
                        {((localFilters?.friendsAgeRange?.[0] !== DEFAULT_FILTERS?.friendsAgeRange?.[0]) || 
                            (localFilters?.friendsAgeRange?.[1] !== DEFAULT_FILTERS?.friendsAgeRange?.[1])) && (
                          <Chip
                            size="small"
                            label={`Age: ${localFilters?.friendsAgeRange?.[0]}-${localFilters?.friendsAgeRange?.[1]}`}
                            onDelete={() => setLocalFilters(prev => ({ ...prev, friendsAgeRange: [18, 65] }))}
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        
                        {(localFilters?.friendsLookingFor?.length > 0) && (
                          <Chip
                            size="small"
                            label={`Looking for: ${localFilters?.friendsLookingFor?.length || 'All'}`}
                            onDelete={clearLookingFor}
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        
                        
                      </Box>

                      {/* Friends Gender Filter - Enhanced */}
                      <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(25, 118, 210, 0.05)' }}>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            cursor: 'pointer',
                            mb: activeFriendFilters.gender ? 2 : 0,
                            WebkitTapHighlightColor: 'transparent',
                            WebkitTouchCallout: 'none',
                            WebkitUserSelect: 'none',
                            userSelect: 'none',
                          }}
                          onClick={() => toggleFilterSection('gender')}
                        >
                          <Typography variant="subtitle2" fontWeight={600} color="primary.main" >
                            <TransgenderRounded fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Gender Preference
                          </Typography>
                          <IconButton size="small">
                            {activeFriendFilters.gender ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </Box>
                        
                        {activeFriendFilters.gender && (
                          <Box sx={{ mt: 2 }}>
                            {/* Gender Quick Presets */}
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                              Select quickly:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {[
                                { value: '', label: 'All Genders', icon: <PeopleRounded fontSize="small" /> },
                                { value: 'Male', label: 'Male', icon: <ManRounded fontSize="small" /> },
                                { value: 'Female', label: 'Female', icon: <WomanRounded fontSize="small" /> },
                                { value: 'Non-binary', label: 'Non-binary', icon: <TransgenderRounded fontSize="small" /> },
                                { value: 'Other', label: 'Other / Prefer not to say', icon: <PersonRounded fontSize="small" /> }
                              ].map((option) => (
                                <Chip
                                  key={option.value}
                                  label={option.label}
                                  icon={option.icon}
                                  onClick={() => handleFriendsGenderPreset(option.value)}
                                  variant={localFilters?.friendsGender === option.value ? "filled" : "outlined"}
                                  color="primary"
                                  size="small"
                                  sx={{ 
                                    borderRadius: '8px',
                                    gap: 0.2,
                                    padding: '4px 6px',
                                    fontWeight: localFilters?.friendsGender === option.value ? 600 : 400,
                                    '& .MuiChip-icon': { fontSize: '0.8rem' }
                                  }}
                                />
                              ))}
                            </Box>
                            {/* <FormControl fullWidth size="small">
                              <InputLabel>Select Gender</InputLabel>
                              <Select
                                name="friendsGender"
                                value={localFilters.friendsGender}
                                onChange={handleFriendsFilterChange}
                                label="Select Gender"
                                sx={{ borderRadius: '12px' }}
                              >
                                <MenuItem value="">
                                  <em>All Genders</em>
                                  All Genders
                                </MenuItem>
                                <MenuItem value="Male">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ManRounded fontSize="small" />
                                    Male
                                  </Box>
                                </MenuItem>
                                <MenuItem value="Female">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <WomanRounded fontSize="small" />
                                    Female
                                  </Box>
                                </MenuItem>
                                <MenuItem value="Non-binary">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TransgenderRounded fontSize="small" />
                                    Non-binary
                                  </Box>
                                </MenuItem>
                                <MenuItem value="Other">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonRounded fontSize="small" />
                                    Other / Prefer not to say
                                  </Box>
                                </MenuItem>
                              </Select>
                            </FormControl> */}
                          </Box>
                        )}
                      </Box>

                      {/* Age Range Filter - Enhanced */}
                      <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(156, 39, 176, 0.05)' }}>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            cursor: 'pointer',
                            mb: activeFriendFilters.ageRange ? 2 : 0,
                            WebkitTapHighlightColor: 'transparent',
                            WebkitTouchCallout: 'none',
                            WebkitUserSelect: 'none',
                            userSelect: 'none',
                          }}
                          onClick={() => toggleFilterSection('ageRange')}
                        >
                          <Typography variant="subtitle2" fontWeight={600} color="secondary.main" >
                            <CakeRounded fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Age Range
                            {activeFriendFilters.ageRange && (
                              <Typography component="span" variant="caption" sx={{ ml: 1, color: 'secondary.main' }}>
                                ({localFilters?.friendsAgeRange?.[0]}-{localFilters?.friendsAgeRange?.[1]})
                              </Typography>
                            )}
                          </Typography>
                          <IconButton size="small">
                            {activeFriendFilters.ageRange ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </Box>
                        
                        {activeFriendFilters?.ageRange && (
                          <>
                            {/* Age Slider */}
                            <Box sx={{ mt: 1, px: 1 }}>
                              <Slider
                                value={localFilters.friendsAgeRange}
                                onChange={(event, newValue) => {
                                  setLocalFilters(prev => ({ 
                                    ...prev, 
                                    friendsAgeRange: newValue 
                                  }));
                                }}
                                onChangeCommitted={() => {
                                  // Optional: Add debounce here if needed
                                }}
                                valueLabelDisplay="auto"
                                min={18}
                                max={65}
                                sx={{
                                  color: 'secondary.main',
                                  '& .MuiSlider-valueLabel': {
                                    backgroundColor: 'secondary.main',
                                    borderRadius: '8px',
                                    padding: '4px 8px'
                                  }
                                }}
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">18</Typography>
                                <Typography variant="caption" color="text.secondary">65+</Typography>
                              </Box>
                            </Box>
                            
                            {/* Age Inputs */}
                            {/* <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                              <TextField
                                fullWidth
                                label="Min Age"
                                type="number"
                                size="small"
                                value={localFilters?.friendsAgeRange?.[0]}
                                onChange={(e) => handleFriendsAgeRangeChange(e, 'min')}
                                InputProps={{
                                  inputProps: { min: 18, max: localFilters?.friendsAgeRange?.[1] }
                                }}
                                sx={{ borderRadius: '12px' }}
                              />
                              <TextField
                                fullWidth
                                label="Max Age"
                                type="number"
                                size="small"
                                value={localFilters?.friendsAgeRange?.[1]}
                                onChange={(e) => handleFriendsAgeRangeChange(e, 'max')}
                                InputProps={{
                                  inputProps: { min: localFilters?.friendsAgeRange?.[0], max: 120 }
                                }}
                                sx={{ borderRadius: '12px' }}
                              />
                            </Box> */}
                            
                            {/* Quick Age Presets */}
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, mb: 1, display: 'block' }}>
                              Quick presets:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {[
                                { label: '18-25', range: [18, 25] },
                                { label: '26-35', range: [26, 35] },
                                { label: '36-45', range: [36, 45] },
                                { label: '46-55', range: [46, 55] },
                                { label: '56+', range: [56, 65] }
                              ].map((preset) => (
                                <Chip
                                  key={preset.label}
                                  label={preset.label}
                                  size="small"
                                  onClick={() => handleQuickAgeRange(preset.range)}
                                  variant={
                                    localFilters?.friendsAgeRange?.[0] === preset.range[0] && 
                                    localFilters?.friendsAgeRange?.[1] === preset.range[1] 
                                      ? "filled" 
                                      : "outlined"
                                  }
                                  color="secondary"
                                  sx={{ borderRadius: '8px' }}
                                />
                              ))}
                            </Box>
                          </>
                        )}
                      </Box>

                      {/* Looking For Filter - Enhanced */}
                      <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(76, 175, 80, 0.05)' }}>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            cursor: 'pointer',
                            mb: activeFriendFilters.lookingFor ? 2 : 0,
                            WebkitTapHighlightColor: 'transparent',
                            WebkitTouchCallout: 'none',
                            WebkitUserSelect: 'none',
                            userSelect: 'none',
                          }}
                          onClick={() => toggleFilterSection('lookingFor')}
                        >
                          <Typography variant="subtitle2" fontWeight={600} color="success.main" >
                            <SearchRounded fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Looking For
                            {activeFriendFilters?.lookingFor && localFilters?.friendsLookingFor?.length > 0 && (
                              <Typography component="span" variant="caption" sx={{ ml: 1, color: 'success.main' }}>
                                ({localFilters?.friendsLookingFor?.length} selected)
                              </Typography>
                            )}
                          </Typography>
                          <IconButton size="small">
                            {activeFriendFilters.lookingFor ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </Box>
                        
                        {activeFriendFilters.lookingFor && (
                          <Box>
                            {/* Multi-select dropdown */}
                            {/* <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                              <InputLabel>What are they looking for?</InputLabel>
                              <Select
                                multiple
                                name="friendsLookingFor"
                                value={localFilters?.friendsLookingFor || []}
                                onChange={handleLookingForChange}
                                label="What are they looking for?"
                                renderValue={(selected) => selected.join(', ')}
                                sx={{ borderRadius: '12px' }}
                              >
                                <MenuItem value="Friendship">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PeopleRounded fontSize="small" />
                                    Friendship
                                  </Box>
                                </MenuItem>
                                <MenuItem value="Dating">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FavoriteRounded fontSize="small" />
                                    Dating
                                  </Box>
                                </MenuItem>
                                <MenuItem value="Networking">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BusinessCenterRounded fontSize="small" />
                                    Networking
                                  </Box>
                                </MenuItem>
                                <MenuItem value="Activity Partners">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SportsSoccerRounded fontSize="small" />
                                    Activity Partners
                                  </Box>
                                </MenuItem>
                                <MenuItem value="Travel Buddies">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FlightRounded fontSize="small" />
                                    Travel Buddies
                                  </Box>
                                </MenuItem>
                                <MenuItem value="Study Partners">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SchoolRounded fontSize="small" />
                                    Study Partners
                                  </Box>
                                </MenuItem>
                                <MenuItem value="Business Connections">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <HandshakeRounded fontSize="small" />
                                    Business Connections
                                  </Box>
                                </MenuItem>
                              </Select>
                            </FormControl> */}
                            
                            {/* Quick toggle chips */}
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, mb: 1, display: 'block' }}>
                              Select quickly:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {['Friendship', 'Dating', 'Networking', 'Activity Partners', 'Travel Buddies', 'Study Partners', 'Business Connections'].map((item) => (
                                <Chip
                                  key={item}
                                  label={item}
                                  icon={lookingForIcons[item] || <SearchRounded fontSize="small" />}
                                  size="small"
                                  onClick={() => toggleLookingForItem(item)}
                                  variant={localFilters?.friendsLookingFor?.includes(item) ? "filled" : "outlined"}
                                  color="success"
                                  sx={{ borderRadius: '8px', gap: 0.2, padding: '4px 6px',
                                    '& .MuiChip-icon': { fontSize: '0.8rem' }
                                  }}
                                />
                              ))}
                            </Box>
                            
                            {localFilters?.friendsLookingFor?.length > 0 && (
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                <Button
                                  size="small"
                                  onClick={clearLookingFor}
                                  startIcon={<ClearRounded />}
                                  sx={{ fontSize: '0.75rem' }}
                                >
                                  Clear Selection
                                </Button>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Box>

                      {/* Stats and Info */}
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: 'rgba(255, 193, 7, 0.05)',
                        border: '1px solid rgba(255, 193, 7, 0.1)'
                      }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <InfoRounded fontSize="small" />
                          <Box>
                            <strong>Tips:</strong> 
                            <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                              <li>Use age range to find friends in your preferred age group</li>
                              <li>Select multiple "Looking For" options to broaden your search</li>
                              <li>Filters are saved automatically for your next visit</li>
                            </ul>
                          </Box>
                        </Typography>
                      </Box>
                    </>
                    ) : (
                      // Posts and Services filters
                      <>
                        {/* Filter Summary for Posts/Services */}
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1, 
                          mb: 2, 
                          flexWrap: 'wrap',
                          alignItems: 'center'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                              Active filters:
                            </Typography>
                            {(localFilters?.gender || localFilters?.postStatus || 
                              !(localFilters?.priceRange?.[0] === 0 && localFilters?.priceRange?.[1] === 20000)) && (
                              <Button
                                size="small"
                                onClick={resetPostFilters}
                                sx={{ ml: 'auto', fontSize: '0.75rem', minWidth: 'auto' }}
                              >
                                Clear All
                              </Button>
                            )}
                          </Box>
                          
                          {localFilters?.gender && localFilters?.gender !== '' && (
                            <Chip
                              size="small"
                              label={`Gender: ${localFilters?.gender}`}
                              onDelete={() => setLocalFilters(prev => ({ ...prev, gender: '' }))}
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          
                          {(localFilters?.postStatus && localFilters?.postStatus !== '') && (
                            <Chip
                              size="small"
                              label={`Status: ${localFilters?.postStatus}`}
                              onDelete={() => setLocalFilters(prev => ({ ...prev, postStatus: '' }))}
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          
                          {!(localFilters?.priceRange?.[0] === 0 && localFilters?.priceRange?.[1] === 20000) && (
                            <Chip
                              size="small"
                              label={`Price: ₹${localFilters?.priceRange?.[0]} - ₹${localFilters?.priceRange?.[1]}`}
                              onDelete={() => setLocalFilters(prev => ({ 
                                ...prev, 
                                priceRange: [DEFAULT_FILTERS?.priceRange?.[0], DEFAULT_FILTERS?.priceRange?.[1]]
                              }))}
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>

                        {/* Gender Filter - Enhanced */}
                        <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(25, 118, 210, 0.05)' }}>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              cursor: 'pointer',
                              mb: (selectedCategory === 'Paid' || selectedCategory === 'UnPaid' || selectedCategory === 'Emergency') 
                                ? activePostFilters.gender ? 2 : 0
                                : activeServiceFilters.gender ? 2 : 0,
                              WebkitTapHighlightColor: 'transparent',
                              WebkitTouchCallout: 'none',
                              WebkitUserSelect: 'none',
                              userSelect: 'none',
                            }}
                            onClick={() => {
                              if (selectedCategory === 'Paid' || selectedCategory === 'UnPaid' || selectedCategory === 'Emergency') {
                                togglePostFilterSection('gender');
                              } else {
                                toggleServiceFilterSection('gender');
                              }
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight={600} color="primary">
                              <TransgenderRounded fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Gender Preference
                            </Typography>
                            <IconButton size="small">
                              {(selectedCategory === 'Paid' || selectedCategory === 'UnPaid' || selectedCategory === 'Emergency') 
                                ? (activePostFilters.gender ? <ExpandLess /> : <ExpandMore />)
                                : (activeServiceFilters.gender ? <ExpandLess /> : <ExpandMore />)}
                            </IconButton>
                          </Box>
                          
                          {((selectedCategory === 'Paid' || selectedCategory === 'UnPaid' || selectedCategory === 'Emergency') 
                            ? activePostFilters.gender : activeServiceFilters.gender) && (
                            <Box sx={{ mt: 2 }}>
                              {/* Gender Quick Presets */}
                              <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                                Select quickly:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {[
                                  { value: '', label: 'All Genders', icon: <PeopleRounded fontSize="small" /> },
                                  { value: 'Male', label: 'Male', icon: <ManRounded fontSize="small" /> },
                                  { value: 'Female', label: 'Female', icon: <WomanRounded fontSize="small" /> },
                                  { value: 'Kids', label: 'Kids', icon: <ChildCareRounded fontSize="small" /> },
                                  { value: 'Everyone', label: 'Everyone', icon: <PersonRounded fontSize="small" /> }
                                ].map((option) => (
                                  <Chip
                                    key={option.value}
                                    label={option.label}
                                    icon={option.icon}
                                    onClick={() => handleGenderPreset(option.value)}
                                    variant={localFilters?.gender === option.value ? "filled" : "outlined"}
                                    color="primary"
                                    size="small"
                                    sx={{ 
                                      borderRadius: '8px',
                                      gap: 0.2,
                                      padding: '4px 6px',
                                      fontWeight: localFilters?.gender === option.value ? 600 : 400,
                                      '& .MuiChip-icon': { fontSize: '0.8rem' }
                                    }}
                                  />
                                ))}
                              </Box>
                              
                              {/* Gender Dropdown for precise selection */}
                              {/* <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                                <InputLabel>Select Gender</InputLabel>
                                <Select
                                  name="gender"
                                  value={localFilters?.gender || ''}
                                  onChange={handleFilterChange}
                                  label="Select Gender"
                                  sx={{ borderRadius: '12px' }}
                                >
                                  <MenuItem value="">
                                    <em>All Genders</em>
                                  </MenuItem>
                                  <MenuItem value="Male">Male</MenuItem>
                                  <MenuItem value="Female">Female</MenuItem>
                                  <MenuItem value="Kids">Kids</MenuItem>
                                  <MenuItem value="Everyone">Everyone</MenuItem>
                                </Select>
                              </FormControl> */}
                            </Box>
                          )}
                        </Box>

                        {/* Status Filter - Enhanced */}
                        <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(156, 39, 176, 0.05)' }}>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              cursor: 'pointer',
                              mb: (selectedCategory === 'Paid' || selectedCategory === 'UnPaid' || selectedCategory === 'Emergency') 
                                ? activePostFilters.status ? 2 : 0
                                : activeServiceFilters.status ? 2 : 0,
                              WebkitTapHighlightColor: 'transparent',
                              WebkitTouchCallout: 'none',
                              WebkitUserSelect: 'none',
                              userSelect: 'none',
                            }}
                            onClick={() => {
                              if (selectedCategory === 'Paid' || selectedCategory === 'UnPaid' || selectedCategory === 'Emergency') {
                                togglePostFilterSection('status');
                              } else {
                                toggleServiceFilterSection('status');
                              }
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight={600} color="secondary">
                              <CheckCircleRounded fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Post Status
                            </Typography>
                            <IconButton size="small">
                              {(selectedCategory === 'Paid' || selectedCategory === 'UnPaid' || selectedCategory === 'Emergency') 
                                ? (activePostFilters.status ? <ExpandLess /> : <ExpandMore />)
                                : (activeServiceFilters.status ? <ExpandLess /> : <ExpandMore />)}
                            </IconButton>
                          </Box>
                          
                          {((selectedCategory === 'Paid' || selectedCategory === 'UnPaid' || selectedCategory === 'Emergency') 
                            ? activePostFilters.status : activeServiceFilters.status) && (
                            <Box sx={{ mt: 2 }}>
                              {/* Status Quick Presets */}
                              <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                                Select status:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {[
                                  { value: '', label: 'All Status' },
                                  { value: 'Active', label: 'Active Only' },
                                  { value: 'InActive', label: 'InActive Only' },
                                  // { value: 'Closed', label: 'Closed' }
                                ].map((option) => (
                                  <Chip
                                    key={option.value}
                                    label={option.label}
                                    onClick={() => handleStatusPreset(option.value)}
                                    variant={localFilters?.postStatus === option.value ? "filled" : "outlined"}
                                    color="secondary"
                                    size="small"
                                    sx={{ 
                                      borderRadius: '8px',
                                      fontWeight: localFilters?.postStatus === option.value ? 600 : 400,
                                    }}
                                  />
                                ))}
                              </Box>
                              
                              {/* Status Dropdown for precise selection */}
                              {/* <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                                <InputLabel>Select Status</InputLabel>
                                <Select
                                  name="postStatus"
                                  value={localFilters?.postStatus || ''}
                                  onChange={handleFilterChange}
                                  label="Select Status"
                                  sx={{ borderRadius: '12px' }}
                                >
                                  <MenuItem value="">All Status</MenuItem>
                                  <MenuItem value="Active">Active</MenuItem>
                                  <MenuItem value="InActive">InActive</MenuItem>
                                  <MenuItem value="Closed">Closed</MenuItem>
                                </Select>
                              </FormControl> */}
                            </Box>
                          )}
                        </Box>

                        {/* Price Range Filter - Enhanced */}
                        <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(76, 175, 80, 0.05)' }}>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              cursor: 'pointer',
                              mb: (selectedCategory === 'Paid' || selectedCategory === 'UnPaid' || selectedCategory === 'Emergency') 
                                ? activePostFilters.price ? 2 : 0
                                : activeServiceFilters.price ? 2 : 0,
                              WebkitTapHighlightColor: 'transparent',
                              WebkitTouchCallout: 'none',
                              WebkitUserSelect: 'none',
                              userSelect: 'none',
                            }}
                            onClick={() => {
                              if (selectedCategory === 'Paid' || selectedCategory === 'UnPaid' || selectedCategory === 'Emergency') {
                                togglePostFilterSection('price');
                              } else {
                                toggleServiceFilterSection('price');
                              }
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight={600} color="success.main">
                              <CurrencyRupeeRounded fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Price Range
                              {!(localFilters?.priceRange?.[0] === 0 && localFilters?.priceRange?.[1] === 20000) && (
                                <Typography component="span" variant="caption" sx={{ ml: 1, color: 'success.main' }}>
                                  (₹{localFilters?.priceRange?.[0]} - ₹{localFilters?.priceRange?.[1]})
                                </Typography>
                              )}
                            </Typography>
                            <IconButton size="small">
                              {(selectedCategory === 'Paid' || selectedCategory === 'UnPaid' || selectedCategory === 'Emergency') 
                                ? (activePostFilters.price ? <ExpandLess /> : <ExpandMore />)
                                : (activeServiceFilters.price ? <ExpandLess /> : <ExpandMore />)}
                            </IconButton>
                          </Box>
                          
                          {((selectedCategory === 'Paid' || selectedCategory === 'UnPaid' || selectedCategory === 'Emergency') 
                            ? activePostFilters.price : activeServiceFilters.price) && (
                            <>
                              {/* Price Slider */}
                              <Box sx={{ mt: 1, px: 1 }}>
                                <Slider
                                  value={localFilters.priceRange}
                                  onChange={(event, newValue) => {
                                    setLocalFilters(prev => ({ 
                                      ...prev, 
                                      priceRange: newValue 
                                    }));
                                  }}
                                  valueLabelDisplay="auto"
                                  valueLabelFormat={(value) => `₹${value}`}
                                  min={0}
                                  max={20000}
                                  step={1000}
                                  sx={{
                                    color: 'success.main',
                                    '& .MuiSlider-valueLabel': {
                                      backgroundColor: '#4CAF50',
                                      borderRadius: '8px',
                                      padding: '4px 8px'
                                    }
                                  }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">₹0</Typography>
                                  <Typography variant="caption" color="text.secondary">₹20 k</Typography>
                                </Box>
                              </Box>
                              
                              {/* Price Inputs */}
                              {/* <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                <TextField
                                  fullWidth
                                  label="Min Price (₹)"
                                  type="number"
                                  size="small"
                                  value={localFilters.priceRange[0]}
                                  onChange={(e) => handlePriceChange(e, 'min')}
                                  InputProps={{
                                    inputProps: { min: 0, max: localFilters.priceRange[1] }
                                  }}
                                  sx={{ borderRadius: '12px' }}
                                />
                                <TextField
                                  fullWidth
                                  label="Max Price (₹)"
                                  type="number"
                                  size="small"
                                  value={localFilters.priceRange[1]}
                                  onChange={(e) => handlePriceChange(e, 'max')}
                                  InputProps={{
                                    inputProps: { min: localFilters.priceRange[0], max: 20000 }
                                  }}
                                  sx={{ borderRadius: '12px' }}
                                />
                              </Box> */}
                              
                              {/* Quick Price Presets */}
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, mb: 1, display: 'block' }}>
                                Quick presets:
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {[
                                  { label: 'Free', range: [0, 0] },
                                  { label: 'Under ₹500', range: [0, 500] },
                                  { label: 'Under ₹2000', range: [0, 2000] },
                                  { label: '₹1k-5k', range: [1000, 5000] },
                                  { label: '₹5k-10k', range: [5000, 10000] },
                                  { label: '₹10k-20k', range: [10000, 20000] },
                                  { label: '₹20k-1Lakh', range: [20000, 100000] },
                                  { label: '₹1Lakh+', range: [100000, 2000000] },
                                ].map((preset) => (
                                  <Chip
                                    key={preset.label}
                                    label={preset.label}
                                    size="small"
                                    onClick={() => handlePricePreset(preset.range)}
                                    variant={
                                      localFilters.priceRange[0] === preset.range[0] && 
                                      localFilters.priceRange[1] === preset.range[1] 
                                        ? "filled" 
                                        : "outlined"
                                    }
                                    color="success"
                                    sx={{ borderRadius: '8px' }}
                                  />
                                ))}
                              </Box>
                            </>
                          )}
                        </Box>

                        {/* Filter Info */}
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          bgcolor: 'rgba(255, 193, 7, 0.05)',
                          border: '1px solid rgba(255, 193, 7, 0.1)'
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InfoRounded fontSize="small" />
                            <Box>
                              <strong>Tips:</strong> 
                              <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                                <li>Use price range to find services within your budget</li>
                                <li>Filter by status to see only active posts</li>
                                <li>Gender filters help find services suitable for specific needs</li>
                              </ul>
                            </Box>
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </CardContent>
                {/* Action Buttons */}
                <CardActions sx={{ 
                  position: 'sticky', 
                  bottom: 0, 
                  justifyContent: 'center', 
                  p: 2, 
                  background: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                }}>
                  <Button
                    variant="outlined"
                    // onClick={handleResetFilters}
                    onClick={() => setIsExtraFiltersOpen(false)}
                    // disabled={isDefaultFilters}
                    fullWidth 
                    sx={{ 
                      borderRadius:'8px', 
                      textTransform: 'none',
                      borderWidth: '2px',
                      '&:hover': { borderWidth: '2px' }
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    variant="contained" 
                    onClick={handleApplyFilters}
                    disabled={JSON.stringify(localFilters) === JSON.stringify(filters)}
                    fullWidth 
                    sx={{ 
                      borderRadius:'8px', 
                      textTransform: 'none',
                      background: gradientHover,
                      '&:hover': { background: gradientHover },
                      '&.Mui-disabled': {
                        background: darkMode ? 'rgba(255, 255, 255, 0.12)'  : 'rgba(0, 0, 0, 0.12)',
                        color: darkMode ? 'rgba(255, 255, 255, 0.26)' : 'rgba(0, 0, 0, 0.26)',
                      },
                    }}
                  >
                    Apply Filters
                  </Button>
                </CardActions>
              </Card>
            )}

          {/* Compare Icon Button */}
          {(selectedCategory !== 'BloodDonors' && selectedCategory !== 'Friends') &&
          <Tooltip title="Compare Posts" arrow>
            <IconButton 
              onClick={() => setCompareMode(!compareMode)}
              sx={{
                minWidth: '40px',
                minHeight: '40px',
                mr: '4px', ...getButtonStyle(darkMode, compareMode),
                // color: compareMode ? 'primary.main' : 'inherit',
                // backgroundColor: compareMode ? darkMode ? 'rgba(255, 255, 255, 0.1)'  : 'rgba(0, 0, 0, 0.05)' : 'transparent',
              }}
            >
              <CompareRoundedIcon />
            </IconButton>
          </Tooltip>}
          {/* Button to Open Distance Menu */}
          {/* Distance Button */}
          {/* <Button
            variant="contained"
            // onClick={handleDistanceMenuOpen}
            onClick={() => setShowDistanceRanges(!showDistanceRanges)}
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
          </Button> */}

          {/* Distance Range Menu */}
          {/* {showDistanceRanges && (
          <Card
            // anchorEl={anchorEl}
            // open={Boolean(anchorEl)}
            // onClose={handleDistanceMenuClose}
            sx={{ position: 'absolute',
              top: isMobile ? '62px' : '72px',
              right: '1px', ml: '4px',
              // width: '90%',
              // maxWidth: '400px',
              minWidth: isMobile ? '100%' : 'auto',
              maxWidth: isMobile ? '100%' : 'auto',
              zIndex: 1000,  '& .MuiPaper-root': { borderRadius:'12px'}, borderRadius: '10px', backdropFilter: 'blur(10px)',
               boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              // background: 'rgba(255, 255, 255, 0.9)',
              background: 'rgba(255, 255, 255, 0.95)',
              '& .MuiCardContent-root': {padding: '10px' },  }}
          >
            <Box sx={{ m: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'column', gap: 1 }}> */}
              {/* <Box sx={{ m: 0, borderRadius:'8px'}}>
                <Box
                  sx={{
                    px: isMobile ? '8px' : '10px', py: '12px',
                    display: "flex",
                    flexDirection: isMobile ? "column" : "column",
                    alignItems: 'flex-start',
                    // minWidth: isMobile ? "60px" : "250px", borderRadius:'10px'
                  }}
                >
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
                    <Box sx={{ position: 'absolute', top: '10px', right: '10px', marginLeft: 'auto', display:'flex', alignItems:'center' }}>
                      <IconButton
                        onClick={() => setShowDistanceRanges(false)}
                        variant="text"
                      >
                        <CloseIcon/>
                      </IconButton>
                    </Box>
                  </Box>
                  <DistanceSlider distanceRange={distanceRange} setDistanceRange={setDistanceRange} userLocation={userLocation} mapRef={mapRef} isMobile={isMobile} getZoomLevel={getZoomLevel} distanceValues={distanceValues} />

                  
                </Box>
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
                </Box>
              </Box>
              <Divider/> */}
              {/* <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, px: 1 }}>
                  Sort by
                </Typography>
                <MenuItem 
                  onClick={() => handleSortChange('nearest')}
                  selected={sortBy === 'nearest'}
                  sx={{ borderRadius: '8px' }}
                >
                  <ListItemIcon>
                    {sortBy === 'nearest' && <CheckRoundedIcon fontSize="small" color="success" />}
                  </ListItemIcon>
                  Nearest posts first
                </MenuItem>
                <MenuItem 
                  onClick={() => handleSortChange('latest')}
                  selected={sortBy === 'latest'}
                  sx={{ borderRadius: '8px', mb: 0.5 }}
                >
                  <ListItemIcon>
                    {sortBy === 'latest' && <CheckRoundedIcon fontSize="small" color="success" />}
                  </ListItemIcon>
                  Latest posts first
                </MenuItem>
              </Box>
              <Divider/> */}
              {/* <Box sx={{minWidth: isMobile ? '100%' : '450px', maxWidth: isMobile ? '100%' : '450px'}}>
                <Box sx={{
                  m: 0,
                  // bgcolor: '#f5f5f5',
                  borderRadius: '8px',
                  // boxShadow: 3,
                }}>
                   <Box sx={{ display: 'flex', flexGrow: 1, float: 'inline-end', margin:1 }}>
                    <Button
                      variant="outlined" size="small" sx={{borderRadius: '8px', textTransform: 'none'}}
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
                      
                      <Box display="flex" gap={2} flexWrap="wrap" sx={{mt: 2}}> */}
                        {/* Category Filter */}
                        {/* <FormControl size='small' sx={{ flex: '1 1 140px', '& .MuiOutlinedInput-root': { borderRadius: '12px', } }}>
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
                            <MenuItem value="Friends">Friends</MenuItem>
                          </Select>
                        </FormControl> */}

                        {/* Service Filters */}
                        {/* <FormControl size='small' sx={{ flex: '1 1 140px', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                          <InputLabel>Service Type</InputLabel>
                          <Select
                            name="serviceType"
                            value={localFilters.serviceType || ''}
                            onChange={handleFilterChange}
                            label="Service Type"
                          >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="ParkingSpace">Parking Space</MenuItem>
                            <MenuItem value="VehicleRental">Vehicle Rental</MenuItem>
                            <MenuItem value="FurnitureRental">Furniture Rental</MenuItem>
                            <MenuItem value="Laundry">Laundry</MenuItem>
                            <MenuItem value="Events">Events</MenuItem>
                            <MenuItem value="Playgrounds">Playgrounds</MenuItem>
                            <MenuItem value="Cleaning">Cleaning</MenuItem>
                            <MenuItem value="Cooking">Cooking</MenuItem>
                            <MenuItem value="Tutoring">Tutoring</MenuItem>
                            <MenuItem value="PetCare">Pet Care</MenuItem>
                            <MenuItem value="Delivery">Delivery</MenuItem>
                            <MenuItem value="Maintenance">Maintenance</MenuItem>
                            <MenuItem value="HouseSaleLease">House Sale/Lease</MenuItem>
                            <MenuItem value="LandSaleLease">Land Sale/Lease</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                        </FormControl> */}

                        {/* Gender Filter */}
                        {/* <FormControl size='small' sx={{ flex: '1 1 140px', '& .MuiOutlinedInput-root': { borderRadius: '12px',} }}>
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
                        </FormControl> */}

                        {/* Status Filter */}
                        {/* <FormControl size='small' sx={{ flex: '1 1 180px', '& .MuiOutlinedInput-root': { borderRadius: '12px',} }}>
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
                        </FormControl> */}

                        {/* Price Range */}
                        {/* <Box display="flex" gap={2} flex="1 1 auto">
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
                      </Box> */}

                      {/* Action Buttons */}
                      {/* <Box gap={2} mt={3} sx={{display:'flex'}}>
                        <Button
                          variant="outlined"
                          onClick={handleResetFilters}
                          disabled={isDefaultFilters}
                          fullWidth sx={{ borderRadius:'8px', textTransform: 'none' }}
                        >
                          Reset
                        </Button>
                        <Button
                          variant="contained" 
                          onClick={handleApplyFilters}
                          disabled={isDefaultFilters}
                          fullWidth sx={{ borderRadius:'8px', textTransform: 'none'}}
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
          )} */}
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
          
        </Box>
        {/* </Box> */}
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
         {/* {isMobile && expanded &&  <SearchContainer sx={{mx : 1, width: '350px'}}>
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
          </SearchContainer> } */}

        {/* Friends profile visibility */}
        {/* {selectedCategory === 'Friends' && (
           <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              maxHeight: 'calc(90vh - 140px)' // Adjust based on your header heights
            }}>
          <Box sx={{display: 'flex', justifyContent: 'center', m: '12px', alignItems: 'center', gap: '4px'}}>
            <Typography color="text.secondary">Do u want ot visible your profile to nearby Friends!</Typography>
            <Switch
              // checked={protectLocation}
              // onChange={toggleLocationPrivacy}
              color="primary"
            />
          </Box>
          <Friends isMobile={isMobile} darkMode={darkMode} setSnackbar={setSnackbar} />
          </Box>
        )} */}
        {/* compare floating buttons */}
        {selectedPosts.length > 0 && compareMode && (
          <Box sx={{ display: 'flex', flexDirection: 'row', position: 'fixed', gap: 1, bottom: 16, right: 16, zIndex: 1100 }} >
            <Fab
              variant="extended"
              size="small"
              onClick={() => setCompareDialogOpen(true)}
              // disabled={selectedPosts.length <= 1}
              sx={{ height: '35px', width: '120px', borderRadius: '20px', color: '#fff',
                background: darkMode 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: darkMode 
                  ? '0 4px 14px rgba(59, 130, 246, 0.4)'
                  : '0 4px 14px rgba(37, 99, 235, 0.3)',
                '&:hover': {
                  background: darkMode 
                    ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' 
                    : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: darkMode 
                    ? '0 6px 20px rgba(59, 130, 246, 0.6)'
                    : '0 6px 20px rgba(37, 99, 235, 0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {/* <CompareRoundedIcon sx={{ mr: 1 }} /> */}
              Compare ({selectedPosts.length})
            </Fab>
            <Fab
              variant="extended"
              size="small"
              onClick={closePostsCompare}
              sx={{ height: '35px', width: '35px', borderRadius: '20px', color: 'grey',
                '&:hover': {
                  backgroundColor: '#f0f0f0', // subtle gray for hover
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
               }}
            >
              <CloseIcon  />
            </Fab>
          </Box>
        )}


        {/* {selectedCategory !== 'Friends' && ( */}
          <Box
            ref={postsContainerRef}
            sx={{ 
              flex: 1, 
              overflow: 'auto',
              WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
              // // Remove any custom scrollbars that might cause lag
              // '&::-webkit-scrollbar': {
              //   width: '6px',
              // },
              // '&::-webkit-scrollbar-track': {
              //   background: 'transparent',
              // },
              // '&::-webkit-scrollbar-thumb': {
              //   background: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
              //   borderRadius: '3px',
              // },
              // '&::-webkit-scrollbar-thumb:hover': {
              //   background: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
              // },
              paddingTop: '1rem', 
              paddingBottom: '2rem', 
              mx: isMobile ? '8px' : '14px', 
              // mb: '8px',
              // paddingInline: isMobile ? '4px' : '6px', 
              borderRadius: '10px',
              scrollbarWidth: 'none',
              // maxHeight: 'calc(90vh - 140px)' // Adjusts based on header heights
            }}
          >
          {loadingLocation || loading ? (
              <SkeletonCards/>
            ) : selectedCategory === 'BloodDonors' ? ( // Check if showing blood donors
                  /* BLOOD DONORS DISPLAY */
                  posts.length > 0 ? (
                    <Grid container spacing={isMobile ? 1.5 : 1.5}>
                      {posts.map((donor, index) => (
                        <Grid item xs={12} sm={6} md={4} key={`${donor._id}-${index}`} ref={index === posts.length - 3 ? lastPostRef : null} id={`post-${donor._id}`}>
                          <BloodDonorCard
                            donor={donor} 
                            // onClick={() => handleDonorClick(donor._id)} // You'll need to implement this function
                            onClick={() => handleOpenUserProfileDialog(donor._id)}
                            darkMode={darkMode}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  ) : ( 
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      // height: '50vh',
                      textAlign: 'center',
                      p: 2
                    }}>
                      {/* <img 
                        src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" 
                        alt="No blood donors found" 
                        style={{ width: '100px', opacity: 0.7, marginBottom: '16px' }}
                      /> */}
                      <Box sx={{ 
                        width: 120, 
                        height: 120, 
                        borderRadius: '50%', 
                        backgroundColor: darkMode ? 'rgba(220, 53, 69, 0.1)' : 'rgba(220, 53, 69, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3
                      }}>
                        <BloodtypeRounded sx={{ fontSize: 60, color: '#dc3545', opacity: 0.7 }} />
                      </Box>
                      <Typography variant="h6" color="text.primary" gutterBottom>
                        {searchQuery 
                          ? `No blood donors found for "${searchQuery}"`
                          : `No blood donors nearby yet`
                        }
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
                        {searchQuery 
                          ? `Try adjusting your search or expanding the search radius to find more blood donors.`
                          : `Blood donors within ${distanceRange} km will appear here. Try increasing your search radius or adjusting your filters.`
                        }
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {searchQuery ? (
                          <Button 
                            variant="outlined" 
                            startIcon={<ClearRounded />}
                            onClick={handleClearSearch}
                            sx={{ 
                              borderRadius: '20px',
                              textTransform: 'none',
                              px: 3,
                              borderWidth: 2,
                              '&:hover': {
                                borderWidth: 2
                              }
                            }}
                          >
                            Clear Search
                          </Button>
                        ) : (
                          <Button 
                            variant="outlined"
                            startIcon={<LocationOnIcon />}
                            disabled={distanceRange >= 1000}
                            onClick={() => setDistanceRange(prev => Math.min(prev + 10, 1000))}
                            sx={{ 
                              borderRadius: '20px',
                              textTransform: 'none',
                              px: 3,
                              borderWidth: 2,
                              '&:hover': {
                                borderWidth: 2
                              }
                            }}
                          >
                            Increase Radius (+10 km)
                          </Button>
                        )}
                        
                        <Button 
                          variant="contained"
                          startIcon={<FilterListRounded/>}
                          onClick={() => setIsExtraFiltersOpen(true)}
                          sx={{ 
                            borderRadius: '20px',
                            textTransform: 'none',
                            px: 3,
                            backgroundColor: '#2196f3',
                            '&:hover': {
                              backgroundColor: '#1976d2',
                            }
                          }}
                        >
                          Adjust Filters
                        </Button>
                      </Box>
                      {/* {searchQuery && (
                        <Button 
                          variant="outlined" size="small"
                          sx={{ mt: 2, borderRadius: '12px', textTransform: 'none',
                            px: 1.5,
                            color: '#4361ee',
                            background: 'none',
                            border: '1px solid #4361ee',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: 'none',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 25px rgba(67, 97, 238, 0.4)',
                            },
                            '&:active': {
                              transform: 'translateY(0)',
                            },
                           }}
                          onClick={handleClearSearch}
                        >
                          Clear Search
                        </Button>
                      )}
                      {!searchQuery && (
                        <Button 
                          variant="outlined" size="small"
                          disabled={distanceRange >= 100}
                          sx={{ mt: 2, borderRadius: '12px', textTransform: 'none',
                            px: 1.5,
                            color: '#4361ee',
                            background: 'none',
                            border: '1px solid #4361ee',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: 'none',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 25px rgba(67, 97, 238, 0.4)',
                            },
                            '&:active': {
                              transform: 'translateY(0)',
                            },
                           }}
                          onClick={() => setDistanceRange(prev => Math.min(prev + 5, 100))}
                        >
                          Increase Search Radius
                        </Button>
                      )} */}
                      {/* Tips Section */}
                      {!searchQuery && (
                        <Box sx={{ 
                          mt: 4, 
                          p: 2, 
                          borderRadius: 2, 
                          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                          maxWidth: 500,
                          textAlign: 'left'
                        }}>
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            💡 Tips to find more blood donors:
                          </Typography>
                          <Box component="ul" sx={{ 
                            pl: 2, 
                            mb: 0,
                            '& li': { mb: 1, fontSize: '0.875rem', color: 'text.secondary' }
                          }}>
                            <li>Increase search radius to find donors in nearby areas</li>
                            <li>Adjust filters (blood group) to broaden your search</li>
                            {/* <li>Add your own friends profile to appear in others' searches</li> */}
                            <li>Check back later as more people join the platform</li>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )
            ) : selectedCategory === 'Friends' ? ( 
              posts.length > 0 ? (
                <Grid container spacing={isMobile ? 1.5 : 1.5}>
                  {posts.map((user, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={4} key={`${user._id}-${index}`} ref={index === posts.length - 3 ? lastPostRef : null} id={`post-${user._id}`}>
                      <FriendsCard
                        user={user} 
                        onClick={() => handleOpenUserProfileDialog(user._id)}
                        darkMode={darkMode}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : ( 
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // height: '50vh',
                  textAlign: 'center',
                  p: 2
                }}>
                  <Box sx={{ 
                    width: 120, 
                    height: 120, 
                    borderRadius: '50%', 
                    backgroundColor: darkMode ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3
                  }}>
                    <Diversity1Rounded sx={{ fontSize: 60, color: '#2196f3', opacity: 0.7 }} />
                  </Box>
                  
                  <Typography variant="h6" color="text.primary" gutterBottom>
                    {searchQuery 
                      ? `No friends found for "${searchQuery}"`
                      : `No friends nearby yet`
                    }
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
                    {searchQuery 
                      ? `Try adjusting your search or expanding the search radius to find more friends.`
                      : `Friends within ${distanceRange} km will appear here. Try increasing your search radius or adjusting your filters.`
                    }
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {searchQuery ? (
                      <Button 
                        variant="outlined" 
                        startIcon={<ClearRounded />}
                        onClick={handleClearSearch}
                        sx={{ 
                          borderRadius: '20px',
                          textTransform: 'none',
                          px: 3,
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2
                          }
                        }}
                      >
                        Clear Search
                      </Button>
                    ) : (
                      <Button 
                        variant="outlined"
                        startIcon={<LocationOnIcon />}
                        disabled={distanceRange >= 1000}
                        onClick={() => setDistanceRange(prev => Math.min(prev + 10, 1000))}
                        sx={{ 
                          borderRadius: '20px',
                          textTransform: 'none',
                          px: 3,
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2
                          }
                        }}
                      >
                        Increase Radius (+10 km)
                      </Button>
                    )}
                    
                    <Button 
                      variant="contained"
                      startIcon={<FilterListRounded/>}
                      onClick={() => setIsExtraFiltersOpen(true)}
                      sx={{ 
                        borderRadius: '20px',
                        textTransform: 'none',
                        px: 3,
                        backgroundColor: '#2196f3',
                        '&:hover': {
                          backgroundColor: '#1976d2',
                        }
                      }}
                    >
                      Adjust Filters
                    </Button>
                  </Box>
                  
                  {/* Tips Section */}
                  {!searchQuery && (
                    <Box sx={{ 
                      mt: 4, 
                      p: 2, 
                      borderRadius: 2, 
                      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      maxWidth: 500,
                      textAlign: 'left'
                    }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        💡 Tips to find more friends:
                      </Typography>
                      <Box component="ul" sx={{ 
                        pl: 2, 
                        mb: 0,
                        '& li': { mb: 1, fontSize: '0.875rem', color: 'text.secondary' }
                      }}>
                        <li>Increase search radius to find friends in nearby areas</li>
                        <li>Adjust filters (age, interests, looking for) to broaden your search</li>
                        {/* <li>Add your own friends profile to appear in others' searches</li> */}
                        <li>Check back later as more people join the platform</li>
                      </Box>
                    </Box>
                  )}
                </Box>
              )
            ) : ( 
            // Regular posts display       
            posts.length > 0 ? (
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
                      WebkitTapHighlightColor: 'transparent', // Remove tap highlight
                      WebkitTouchCallout: 'none', // Disable iOS callout
                      WebkitUserSelect: 'none', // Disable text selection
                      userSelect: 'none',
                      border: selectedPosts.some(p => p._id === post._id) ? '2px solid #1976d2' : 'none',
                      '&:active': {
                        transform: 'scale(0.98)', // Add press feedback instead
                        transition: 'transform 0.1s ease',
                      },
                      '&:hover': {
                        transform: 'translateY(-8px)',
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
                      height: isMobile ? '300px' : '340px', // Fixed height for consistency
                      overflow: 'hidden',
                    }}
                      onClick={() => {
                        if (compareMode) {
                          handlePostSelection(post);
                        } else {
                          openPostDetail(post);
                        }
                      }}
                      // onMouseEnter={(e) => {
                      //   e.currentTarget.style.transform = 'scale(1.02)'; // Slight zoom on hover
                      //   e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)'; // Enhance shadow
                      // }}
                      // onMouseLeave={(e) => {
                      //   e.currentTarget.style.transform = 'scale(1)'; // Revert zoom
                      //   e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)'; // Revert shadow
                      // }} 
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
                        {/* Selection Checkbox in Compare Mode */}
                        {compareMode && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              zIndex: 10,
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: selectedPosts.some(p => p._id === post._id) 
                                ? '#4361ee' 
                                : 'rgba(255, 255, 255, 0.8)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px solid white',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            }}
                          >
                            {selectedPosts.some(p => p._id === post._id) && (
                              <CheckRoundedIcon sx={{ fontSize: 16, color: 'white' }} />
                            )}
                          </Box>
                        )}                
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
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
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
                      {post.distance != null && (
                        <Chip
                          label={formatDistance(post.distance)}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            backgroundColor: 'rgba(0, 0, 0, 0.25)',
                            color: '#fff',
                            fontSize: '0.7rem',
                            height: '20px',
                            backdropFilter: 'blur(4px)', // subtle glass effect
                          }}
                        />
                      )}

                      {/* Full Time Badge */}
                      {post.isFullTime && (
                        <Chip
                          icon={<WorkIcon sx={{ fontSize: 16 }} />}
                          label="Full Time"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.25)' : 'info.main',
                            color: '#fff',
                            backdropFilter: 'blur(4px)',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: '22px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                            '& .MuiChip-icon': {
                              color: '#fff',
                              marginLeft: '6px',
                              marginRight: '-4px',
                              height: '16px',
                            },
                          }}
                        />
                      )}

                      <CardContent style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '16px',
                        color: 'white'
                      }}>
                        {/* {post.isFullTime && 
                          <Typography sx={{ px: 2, py: 0.5, bgcolor: '#e0f7fa', color: '#006064', borderRadius: '999px', display: 'inline-block', float: 'right', fontWeight: '600', fontSize: '0.875rem' }}>
                            Full Time
                          </Typography>
                        } */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem',}}>
                          {/* <Tooltip title={post.title} placement="top" arrow> */}
                            <Typography variant="h6" component="div" style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white', textTransform: 'capitalize' }}>
                              {post?.title?.split(" ").length > 5 ? `${post?.title?.split(" ").slice(0, 5).join(" ")}...` : post?.title}
                            </Typography>
                          {/* </Tooltip> */}
                          {post.postType === 'HelpRequest' && post.categories !== 'UnPaid' && (
                            <Chip
                              icon={<CurrencyRupeeRoundedIcon sx={{ fontSize: 16 }} />}
                              label={formatPrice(post.price)}
                              size="small"
                              sx={(theme) => ({
                                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                // backgroundColor:
                                //   // darkMode
                                //   //   ?
                                //      'rgba(102, 187, 106, 0.18)', // muted green
                                //     // : theme.palette.success.main,
                                color:
                                  // darkMode
                                  //   ? 
                                    // theme.palette.success.light,
                                    '#fff',
                                border:
                                  // darkMode
                                  //   ? 
                                    // '1px solid rgba(102, 187, 106, 0.45)',
                                    '1px solid rgba(145, 145, 145, 0.45)',
                                    // : 'none',
                                pr: 0.75,
                                height: '22px',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                backdropFilter: 'blur(4px)',
                                WebkitBackdropFilter: 'blur(4px)',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                boxShadow:
                                  darkMode
                                    ? 'none'
                                    : '0 2px 6px rgba(0,0,0,0.2)',
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                },
                                '& .MuiChip-label': {
                                  px: '4px',
                                },
                                '& .MuiChip-icon': {
                                  color: 'inherit',
                                  marginLeft: '4px',
                                  marginRight: '-4px',
                                  height: '16px',
                                },
                              })}
                            />
                          )}

                          {post.postType !== 'HelpRequest' &&
                          // <Chip
                          //   label={post.postStatus}
                          //   size="small"
                          //   sx={{
                          //     backgroundColor: post.postStatus === 'Active' ? 'success.main' : 'error.main',
                          //     color: 'white',
                          //     fontWeight: 600,
                          //     fontSize: '0.75rem'
                          //   }}
                          // />
                          <Chip
                            // icon={<CurrencyRupeeRoundedIcon sx={{ fontSize: 16 }} />}
                            label={post.postStatus}
                            size="small"
                            sx={(theme) => ({
                              backgroundColor:
                                // darkMode
                                //   ?
                                    post.postStatus === 'Active' ? 'rgba(102, 187, 106, 0.18)' : 'rgba(187, 115, 102, 0.18)',  // muted green
                                  // : theme.palette.success.main,
                              color:
                                // darkMode
                                //   ? 
                                  post.postStatus === 'Active' ? theme.palette.success.light : theme.palette.error.main,
                                  // : '#fff',
                              border:
                                // darkMode
                                //   ? 
                                  post.postStatus === 'Active' ? '1px solid rgba(102, 187, 106, 0.45)' : '1px solid rgba(187, 115, 102, 0.45)',
                                  // : 'none',
                              px: 0.75,
                              height: '22px',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              backdropFilter: 'blur(4px)',
                              WebkitBackdropFilter: 'blur(4px)',
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                              boxShadow:
                                darkMode
                                  ? 'none'
                                  : '0 2px 6px rgba(0,0,0,0.2)',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                              },
                              '& .MuiChip-label': {
                                px: '4px',
                              },
                              '& .MuiChip-icon': {
                                color: 'inherit',
                                marginLeft: '4px',
                                marginRight: '-4px',
                                height: '16px',
                              },
                            })}
                          />
                          }
                          {/* {post.postType !== 'HelpRequest' &&
                            <Chip
                              label={post.distance < 1 ? `${Math.round(post.distance * 1000)} m away` : `${post.distance.toFixed(1)} km away`}
                              variant="outlined" size="small"
                              sx={{
                                color: '#fff',
                                px: 0.5, py: 0.5,
                                transition: 'transform 0.2s ease'
                              }}
                            />
                          } */}
                          {/* {post.postType !== 'HelpRequest' &&
                            <Chip
                              // icon={<PriceChangeIcon sx={{ fontSize: 16 }} />}
                              label={`${post.postStatus}`}
                              variant="filled" size="small"
                              // color="post.postStatus === 'Active' ? 'success' : post.postStatus === 'InActive' ? 'warning': 'error'"
                              sx={{
                                backgroundColor: post.postStatus === 'Active' ? 'success.main' : post.postStatus === 'InActive' ? 'warning.main': 'error.main',
                                color: '#fff',
                                px: 0.5, py: 0.5,
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                transition: 'transform 0.2s ease'
                              }}
                            />
                          } */}
                        </Box>
                        {/* <Typography variant="body1" style={{ display: 'inline-block', float: 'right', fontWeight: '500', color: 'white' }}>
                          Price: ₹{post.price}
                        </Typography> */}
                        {/* <Typography variant="body2" color={post.categories === 'Emergency' ? '#ffa5a5' : 'rgba(255, 255, 255, 0.9)'} style={{ marginBottom: '0.5rem' }}>
                          Category: {post.categories}
                        </Typography> */}
                        {/* {post.postType === 'HelpRequest' ?
                          // <Typography variant="body2" color={post.categories !== 'Emergency' ? 'textSecondary' : 'rgba(194, 28, 28, 0.89)'} style={{ display: 'inline-block',  }}>
                          //   {post.categories}
                          // </Typography> 
                          <Chip 
                            label={post.categories} 
                            icon={getServiceIcon(post.categories)}
                            // color="primary"
                            variant="outlined" size="small" color={post.categories !== 'Emergency' ? '#fff' : 'error'} sx={{px: 1, color: '#fff'}}
                          />
                          :
                          <Chip 
                            label={post.serviceType} 
                            icon={getServiceIcon(post.serviceType)}
                            // color="primary"
                            variant="outlined" size="small" sx={{px: 1}}
                          />
                        } */}
                        {/* {post.stockStatus === 'In Stock' && ( */}
                        {/* <Typography variant="body2" style={{ display: 'inline-block', marginBottom: '0.5rem',  color: 'rgba(255, 255, 255, 0.9)' }}>
                          People Required: {post.peopleCount} ({post.gender})
                        </Typography> */}
                        {post.postType === 'HelpRequest' ? (
                          // Help Request specific content
                          <Box sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                label={post.postStatus}
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                  color: '#90caf9',
                                  backdropFilter: 'blur(4px)',
                                  fontSize: '0.7rem',
                                  height: '20px'
                                }}
                              />
                              {post.peopleCount && (
                                <Chip 
                                  label={`${post.peopleCount} ${post.gender || 'People'}`}
                                  // variant="outlined" 
                                  size="small" 
                                  // sx={{ 
                                  //   color: '#fff', 
                                  //   borderColor: 'rgba(255,255,255,0.5)',
                                  //   fontSize: '0.75rem'
                                  // }}
                                  sx={{
                                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                    color: '#90caf9',
                                    backdropFilter: 'blur(4px)',
                                    fontSize: '0.7rem',
                                    height: '20px'
                                  }}
                                />
                              )}
                              <Chip 
                                label={formatDate(post.serviceDate)}
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                  color: '#90caf9',
                                  backdropFilter: 'blur(4px)',
                                  fontSize: '0.7rem',
                                  height: '20px'
                                }}
                              />
                              {/* {post.distance !== null && (
                                <Chip 
                                  label={post.distance < 1 ? `${Math.round(post.distance * 1000)} m away` : `${post.distance.toFixed(1)} km away`}
                                  size="small" 
                                  sx={{
                                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                    color: '#90caf9',
                                    fontSize: '0.7rem',
                                    height: '20px'
                                  }}
                                />
                              )} */}
                              {/* <Chip
                                label={`Status: ${post.postStatus}`}
                                variant="outlined"
                                size="small"
                                sx={{
                                  color: post.postStatus === 'Active' ? '#a5ffa5' : '#ffa5a5',
                                  borderColor: post.postStatus === 'Active' ? '#a5ffa5' : '#ffa5a5',
                                  fontSize: '0.75rem'
                                }}
                              /> */}
                            </Box>
                          </Box>
                        ) : (
                          // Service Offering specific content
                          <Box sx={{ mb: 1 }}>
                            {post.availability?.isAlwaysAvailable ? (
                              <Chip 
                                label="Available 24/7" 
                                variant="outlined" 
                                size="small" 
                                sx={{
                                  color: '#4caf50', 
                                  borderColor: '#4caf50',
                                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                  backdropFilter: 'blur(4px)',
                                  mb: 1,
                                  fontWeight: 600
                                }}
                              />
                            ) : (
                              post.availability?.days && post.availability.days.length > 0 && (
                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5, display: 'block' }}>
                                    Available:
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                    {post.availability.days.slice(0, 7).map(day => (
                                      <Chip 
                                        key={day} 
                                        label={day.slice(0, 3)} 
                                        size="small" 
                                        variant="outlined"
                                        sx={{
                                          backgroundColor: 'rgba(255,255,255,0.15)', 
                                          color: '#fff',
                                          borderColor: 'rgba(255,255,255,0.3)',
                                          backdropFilter: 'blur(4px)',
                                          fontSize: '0.7rem',
                                          height: '20px'
                                        }}
                                      />
                                    ))}
                                    {/* {post.availability.days.length > 4 && (
                                      <Chip 
                                        label={`+${post.availability.days.length - 4}`} 
                                        size="small" 
                                        variant="outlined"
                                        sx={{
                                          backgroundColor: 'rgba(255,255,255,0.15)', 
                                          color: '#fff',
                                          borderColor: 'rgba(255,255,255,0.3)',
                                          fontSize: '0.7rem',
                                          height: '20px'
                                        }}
                                      />
                                    )} */}
                                  </Box>
                                </Box>
                              )
                            )}

                            {/* Service Features */}
                            {post.serviceFeatures && post.serviceFeatures.length > 0 && (
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                                {post.serviceFeatures.slice(0, 5).map((feature, idx) => (
                                  <Chip
                                    key={idx}
                                    label={feature}
                                    size="small"
                                    sx={{
                                      backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                      color: '#90caf9',
                                      backdropFilter: 'blur(4px)',
                                      fontSize: '0.7rem',
                                      height: '20px'
                                    }}
                                  />
                                ))}
                                {post.serviceFeatures.length > 5 && (
                                  <Chip 
                                    label={`+${post.serviceFeatures.length - 5}`} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{
                                      backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                      color: '#90caf9',
                                      backdropFilter: 'blur(4px)',
                                      borderColor: 'rgba(255,255,255,0.3)',
                                      fontSize: '0.7rem',
                                      height: '20px'
                                    }}
                                  />
                                )}
                              </Box>
                            )}
                          </Box>
                        )}
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
                            marginBottom: '0rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis',
                            maxHeight: '3rem',  // This keeps the text within three lines based on the line height.
                            lineHeight: '1.5rem',  // Adjust to control exact line spacing.
                            color: 'rgba(255, 255, 255, 0.9)'
                          }}>
                          {post.description}
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
                p: 2
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
                    variant="outlined" size="small"
                    sx={{ mt: 2, borderRadius: '12px', textTransform: 'none',
                      px: 1.5,
                      color: '#4361ee',
                      background: 'none',
                      border: '1px solid #4361ee',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'none',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 25px rgba(67, 97, 238, 0.4)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                     }}
                    onClick={handleClearSearch}
                  >
                    Clear Search
                  </Button>
                )}
                {!searchQuery && (
                  <Button 
                    variant="outlined" size="small"
                    disabled={distanceRange >= 100}
                    sx={{ m: 2, borderRadius: '12px', textTransform: 'none',
                      px: 1.5,
                      color: '#4361ee',
                      background: 'none',
                      border: '1px solid #4361ee',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'none',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 25px rgba(67, 97, 238, 0.4)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                     }}
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
                  You've reached the end of <strong>{totalPosts} {selectedCategory} posts</strong> in your area
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Current search range: {distanceRange} km
                </Typography>
                {searchQuery && <Typography variant="body2" color="text.secondary">
                  and search of "{searchQuery}"
                </Typography>}
                {/* <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {appliedFilter.filtersCount > 0 && `Applied ${appliedFilter.filtersCount} ${appliedFilter.filterType} filter(s)`}
                </Typography> */}
              </Box>
            )}
            <Box
              sx={{
                p: isMobile ? 2 : 3,
                // mx: isMobile ? 1 : 2,
                mt: 3,
                mb: 3,
                backgroundColor: 'rgba(25, 118, 210, 0.05)',
                // background: darkMode
                //   ? 'rgba(255, 255, 255, 0.03)'
                //   : 'rgba(255, 255, 255, 0.7)',
                // backdropFilter: 'blur(10px)',
                borderRadius: 2,
                border: darkMode
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography variant="h6" gutterBottom>
                📍 Browse Nearby Helper Posts
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Discover help requests and service offerings near your location.
                Use filters to quickly find the most relevant posts within your
                selected distance.
              </Typography>

              {/* How Browsing Works */}
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                🔍 How browsing works
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Posts are shown based on your current location
                <br />• Distance range filters results (1 km – 200 km)
                <br />• Only active posts are displayed
                <br />• Near or recently updated posts appear first
              </Typography>

              {/* Filter Types */}
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                🎯 Filter by what you need
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {/* <br /> */}🧑‍💼 <b>Help Requests</b> – Paid, Unpaid & Emergency
                <br />🧑‍🔧 <b>Service Offerings</b> – Blood donors, Maintenance, Rentals, Cleaning, Tutoring & more
                <br />🚨 <b>Emergency Alerts</b> – Shown with higher priority
              </Typography>

              {/* Why Distance Matters */}
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                📏 Why distance matters
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Closer posts mean faster response
                <br />• Ideal for urgent and daily work
                <br />• Saves travel time and cost
                <br />• Encourages local community support
              </Typography>

              {/* Actions */}
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                🤝 What you can do
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Open a post to view full details
                <br />• Chat or Contact the post owner directly
                <br />• Offer help or book a service
                <br />• Like or save posts for later
              </Typography>

              {/* CTA */}
              <Typography
                variant="body2"
                sx={{ mt: 2, fontWeight: 500 }}
                color="primary"
              >
                👉 Adjust filters to find the best opportunities near you and start helping
                or earning today.
              </Typography>
            </Box>
          </Box>
         {/* )} */}


      </Box>
      {/* Compare Dialog */}
      <ComparePostsDialog isMobile={isMobile} darkMode={darkMode} formatPrice={formatPrice} openPostDetail={openPostDetail} compareDialogOpen={compareDialogOpen} setCompareDialogOpen={setCompareDialogOpen} selectedPosts={selectedPosts} setSelectedPosts={setSelectedPosts} />

      {/* Rating Dialog */}
      <UserProfileDetails
        userId={selectedUserId}
        open={isUserProfileOpen}
        onClose={handleCloseUserProfileDialog}
        // post={post}
        isMobile={isMobile}
        isAuthenticated={isAuthenticated} setLoginMessage={setLoginMessage}  setSnackbar={setSnackbar} darkMode={darkMode}
      />

      {/* Location Permission Dialog - Shows FIRST */}
      <LocationPermissionDialog
        open={showLocationDialog}
        onClose={handleLocationDialogClose}
        darkMode={darkMode}
        isMobile={isMobile}
        setSnackbar={setSnackbar}
      />
      
      {/* Notification Permission Dialog - Shows AFTER location */}
      <NotificationPermissionDialog
        open={showNotificationDialog}
        onClose={handleNotificationDialogClose}
        darkMode={darkMode}
        isMobile={isMobile}
      />

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

      <Snackbar
        open={loginMessage.open}
        autoHideDuration={9000}
        onClose={() => setLoginMessage({ ...loginMessage, open: false })}
        message={
          <span>
            Please log in first.{" "}
            <Link
              to="/login"
              style={{ color: "yellow", textDecoration: "underline", cursor: "pointer" }}
            >
              Click here to login
            </Link>
          </span>
        }
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
        <Alert
          severity="warning"
          variant="filled"
          sx={{
            backgroundColor: "#333",
            color: "#fff",
            borderRadius: "10px",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            // padding: "12px 20px",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          }}
          action={
            <Button
              component={Link}
              to="/login"
              size="small"
              sx={{
                color: "#ffd700",
                fontWeight: "bold",
                textTransform: "none",
                border: "1px solid rgba(255, 215, 0, 0.5)",
                borderRadius: "5px",
                // padding: "3px 8px",
                marginLeft: "10px",
                "&:hover": {
                  backgroundColor: "rgba(255, 215, 0, 0.2)",
                },
              }}
            >
              Login
            </Button>
          }
        >
          Please log in first.
        </Alert>
      </Snackbar>
    
    </Layout>
  );


};

export default Helper;
