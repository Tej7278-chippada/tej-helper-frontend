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
  FormHelperText,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slide
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
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import React, { useCallback, useEffect, useState } from 'react';
// import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Card, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Alert, Box, Toolbar, Grid, CardMedia, CardContent, Tooltip, CardActions, Snackbar, useMediaQuery, IconButton, CircularProgress, LinearProgress, Switch, } from '@mui/material';
import API, { addUserPost, deleteUserPost, fetchPostMediaById, fetchUserPosts, updateUserPost } from '../api/api';
// import { useTheme } from '@emotion/react';
// import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import Layout from '../Layout';
import SkeletonCards from './SkeletonCards';
import LazyImage from './LazyImage';
// import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
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
  TwoWheelerRounded as RentalIcon,
  PinDropRounded as PinDropIcon
} from '@mui/icons-material';
// import { NotificationAdd } from '@mui/icons-material';
// import axios from "axios";

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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Add these constants after the serviceTypes array
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', 
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', 
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

const getDurationUnit = (pricingModel) => {
  switch (pricingModel) {
    case 'hourly': return 'hours';
    case 'daily': return 'days';
    case 'weekly': return 'weeks';
    case 'monthly': return 'months';
    default: return '';
  }
};

// to get service type examples on the general services name input
const getServiceTypeExamples = (serviceType) => {
  switch (serviceType) {
    case 'Cleaning':
      return [
        'Basic House Cleaning',
        'Deep Cleaning',
        'Office Cleaning',
        'Move-In/Move-Out Cleaning',
        'Carpet Cleaning',
        'Window Cleaning'
      ];
    case 'Cooking':
      return [
        'Home Cooked Meals',
        'Meal Prep Service',
        'Diet Specific Meals',
        'Party Catering',
        'Cooking Classes',
        'Local Cuisine'
      ];
    case 'Tutoring':
      return [
        'Math Tutoring',
        'Science Tutoring',
        'Language Classes',
        'Exam Preparation',
        'Homework Help',
        'Online Sessions'
      ];
    case 'PetCare':
      return [
        'Pet Sitting',
        'Dog Walking',
        'Pet Grooming',
        'Veterinary Assistance',
        'Pet Training',
        'Pet Boarding'
      ];
    case 'Delivery':
      return [
        'Food Delivery',
        'Package Delivery',
        'Grocery Delivery',
        'Express Delivery',
        'Local Courier',
        'Luggage shifting'
      ];
    case 'Maintenance':
      return [
        'Plumbing Repair',
        'Electrical Work',
        'AC Service',
        'Appliance Repair',
        'Carpentry Work',
        'Painting Service'
      ];
    case 'Laundry':
      return [
        'Wash & Fold',
        'Dry Cleaning',
        'Ironing Service',
        'Bulk Laundry',
        'Stain Removal',
        'Special Fabric Care',
        'Shoes wash'
      ];
    case 'Events':
      return [
        'Event Planning',
        'Venue Decoration',
        'Fire works show',
        'Photography',
        'DJ night',
        'Guest Management'
      ];
    case 'FurnitureRental':
      return [
        'Sofa Rental',
        'Bed Rental',
        'Table Rental',
        'Chair Rental',
        'Office Furniture',
        'Event Furniture'
      ];
    case 'Playgrounds':
      return [
        'Kids Party Package',
        'Play Area Access',
        'Cricket ground',
        'Volly ball court',
        'Shuttle court',
        'Carroms, Chess'
      ];
    case 'HouseSaleLease':
      return [
        'Apartment for Rent',
        'House for Sale',
        'Commercial Property',
        'Vacation Rental',
        'Studio Apartment',
        'Family Home'
      ];
    case 'LandSaleLease':
      return [
        'Residential Plot',
        'Commercial Land',
        'Agricultural Land',
        'Industrial Property',
        'Development Land',
        'Investment Property'
      ];
    case 'Other':
      return [
        'Custom Service',
        'Specialized Service',
        'Professional Service',
        'Consultation Service',
        'Repair Service',
        'Maintenance Service'
      ];
    default:
      return [
        'Basic Service',
        'Premium Package',
        'Standard Service',
        'Custom Package',
        'Professional Service',
        'Specialized Service'
      ];
  }
};

// function to get random examples
const getRandomExamples = (serviceType) => {
  const examples = getServiceTypeExamples(serviceType);
  // Return 2-3 random examples
  const shuffled = [...examples].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 2) + 2).join(', ');
};

// Service features constant (copy from your provided data)
const SERVICE_FEATURES = {
  ParkingSpace: ['24/7 Available', 'Covered Parking', 'Security Surveillance', 'Well Lit Area', 'EV Charging Station', 'Valet Service', 'Monthly Discount', 'Reserved Spot', 'Accessible Parking', 'Indoor Parking'],
  VehicleRental: ['Insurance Included', 'Free Delivery', '24/7 Support', 'Multiple Payment Options', 'Child Seats Available', 'GPS Navigation', 'Unlimited Mileage', 'Roadside Assistance', 'Fuel Included', 'Airport Delivery'],
  FurnitureRental: ['Free Delivery & Setup', 'Assembly Included', 'Flexible Rental Terms', 'Damage Waiver', 'Upgrade Options', 'Maintenance Included', 'Quick Delivery', 'Eco-Friendly Furniture', 'Customization Available', 'Storage Solutions'],
  Laundry: ['Pickup & Delivery', 'Same Day Service', 'Eco-Friendly Detergents', 'Ironing Included', 'Dry Cleaning', 'Stain Removal', 'Fold & Pack', 'Bulk Discounts', 'Emergency Service', 'Special Fabric Care'],
  Events: ['Full Planning Service', 'Venue Decoration', 'Catering Options', 'Audio-Visual Equipment', 'Photography/Videography', 'Entertainment Arrangements', 'Guest Management', 'Budget Planning', 'Theme Development', 'Cleanup Service'],
  Playgrounds: ['Safety Certified', 'Supervision Included', 'Party Packages', 'Indoor Facility', 'Weather Protected', 'Educational Toys', 'Snack Bar', 'Birthday Decorations', 'Group Discounts', 'Special Needs Accessible'],
  Cleaning: ['Eco-Friendly Products', 'Deep Cleaning', 'Move-In/Move-Out Cleaning', 'Regular Maintenance', 'Disinfection Service', 'Window Cleaning', 'Carpet Cleaning', 'Quick Service', 'Equipment Provided', 'Green Certified'],
  Cooking: ['Diet Specific Meals', 'Meal Prep Service', 'Local Cuisine', 'International Dishes', 'Ingredients Provided', 'Cooking Classes', 'Party Catering', 'Healthy Options', 'Custom Menu', 'Food Safety Certified'],
  Tutoring: ['Certified Tutors', 'Online Sessions', 'Group Discounts', 'Exam Preparation', 'Homework Help', 'Special Needs Support', 'Progress Reports', 'Flexible Scheduling', 'Multiple Subjects', 'Study Materials Included'],
  PetCare: ['Veterinary Background', 'Pet Grooming', 'Medication Administration', 'Daily Updates', 'Emergency Care', 'Multiple Pets Discount', 'Pet Training', 'Playtime Included', 'Special Diet Management', '24/7 Availability'],
  Delivery: ['Express Delivery', 'Same Day Service', 'Tracking Available', 'Fragile Handling', 'Large Items Delivery', 'Multiple Stops', 'Cash on Delivery', 'Temperature Controlled', 'Weekend Service', 'Real-time Updates'],
  Maintenance: ['Emergency Repair', '24/7 Service', 'Warranty Included', 'Free Diagnosis', 'Quality Parts', 'Senior Discount', 'Regular Maintenance Plans', 'Eco-Friendly Solutions', 'Licensed Technicians', 'Same Day Service'],
  HouseSaleLease: ['Legal Documentation Help', 'Property Valuation', 'Virtual Tours', 'Negotiation Support', 'Home Inspection', 'Financing Assistance', 'Interior Staging', 'Photography Service', 'Flexible Viewing', 'Tenant Screening'],
  LandSaleLease: ['Surveying Services', 'Zoning Information', 'Development Potential', 'Legal Assistance', 'Financing Options', 'Environmental Assessment', 'Infrastructure Details', 'Investment Analysis', 'Long-term Lease Options', 'Multiple Payment Plans'],
  Other: ['Customizable Service', 'Quick Response', 'Quality Guarantee', 'Affordable Pricing', 'Experienced Professional', 'Free Consultation', 'Satisfaction Guaranteed', 'Emergency Service', 'Eco-Friendly', 'Technology Enabled']
};

const EnhancedPostServiceDialog = ({ openDialog, onCloseDialog, theme, isMobile, fetchPostsData, /* generatedImages, loadingGeneration,
  noImagesFound, */ newMedia, setNewMedia, editingProduct, /* formData, setFormData, */ selectedDate, setSelectedDate, mediaError, setMediaError,
  timeFrom, setTimeFrom, timeTo, setTimeTo, existingMedia, setExistingMedia, /* fetchUnsplashImages, */ loadingMedia,
  setSnackbar, setSubmitError, submitError, protectLocation, setProtectLocation, fakeAddress, setFakeAddress, activeStep, setActiveStep,
  darkMode, validationErrors, setValidationErrors, onPostSuccess }) => {
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

  const steps = ['Location & Privacy', 'Title & Media', 'Service Details', 'Summary & Submit'];

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
    postType: '', // New field
    categories: '', // For help requests
    serviceType: '', // For service offerings
    postStatus: '',
    peopleCount: '',
    gender: '',
    serviceDays: '',
    description: '',
    media: null,
    isFullTime: false,
  });
  // Service type options
  const serviceTypes = [
    { value: 'ParkingSpace', label: 'Parking Space', icon: '🅿️' },
    { value: 'VehicleRental', label: 'Vehicle Rental', icon: '🚗' },
    { value: 'FurnitureRental', label: 'Furniture Rental', icon: '🛋️' },
    { value: 'Laundry', label: 'Laundry Service', icon: '👕' },
    { value: 'Events', label: 'Events', icon: '🕺' },
    { value: 'Playgrounds', label: 'Playgrounds', icon: '🏸' },
    { value: 'Cleaning', label: 'Cleaning Service', icon: '🧹' },
    { value: 'Cooking', label: 'Cooking Service', icon: '👨‍🍳' },
    { value: 'Tutoring', label: 'Tutoring', icon: '📚' },
    { value: 'PetCare', label: 'Pet Care', icon: '🐕' },
    { value: 'Delivery', label: 'Delivery Service', icon: '📦' },
    { value: 'Maintenance', label: 'Maintenance', icon: '🔧' },
    { value: 'HouseSaleLease', label: 'House Sale/Lease', icon: '🏠' },
    { value: 'LandSaleLease', label: 'Land Sale/Lease', icon: '⛰️' },
    { value: 'Other', label: 'Other Services', icon: '⚙️' }
  ];
  const [generatedImages, setGeneratedImages] = useState([]);
  const [loadingGeneration, setLoadingGeneration] = useState(false);
  const [noImagesFound, setNoImagesFound] = useState(false); // NEW state for empty results
  const [loadingSubmit, setLoadingSubmit] = useState(false);


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
        postType: editingProduct?.postType,
        categories: editingProduct?.categories,
        serviceType: editingProduct?.serviceType,
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
      // setKeepPreviousLocation(true);
      // setProtectLocation(editingProduct.location.isProtected || false);
      
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
      if (editingProduct.availability) {
        setAvailability(editingProduct.availability);
      }
      if (editingProduct.serviceFeatures) {
        setSelectedFeatures(editingProduct.serviceFeatures);
      }
      if (editingProduct.availability) {
        setAvailability(editingProduct.availability);
      }
      // Initialize pricing data based on service type
      if (editingProduct.pricing) {
        switch (editingProduct.pricing.type) {
          case 'parking':
            const parkingPricingData = editingProduct.pricing.parking;
      
            // if (parkingPricingData.vehicleTypes && parkingPricingData.vehicleTypes.length > 0) {
            //   setParkingVehicleTypes(parkingPricingData.vehicleTypes);
            // } else {
            //   // Convert legacy parking data to new format
            //   const vehicleTypes = [];
              
            //   // Add predefined vehicle types if they have rates
            //   if (parkingPricingData.hourlyRate || parkingPricingData.dailyRate || parkingPricingData.monthlyRate) {
            //     vehicleTypes.push({
            //       type: 'Car',
            //       hourlyRate: parkingPricingData.hourlyRate || '',
            //       dailyRate: parkingPricingData.dailyRate || '',
            //       weeklyRate: parkingPricingData.weeklyRate || '',
            //       monthlyRate: parkingPricingData.monthlyRate || '',
            //       slotsAvailable: parkingPricingData.capacity || '',
            //       description: ''
            //     });
            //   }
              
            //   setParkingVehicleTypes(vehicleTypes.length > 0 ? vehicleTypes : [
            //     {
            //       type: 'Car',
            //       hourlyRate: '',
            //       dailyRate: '',
            //       weeklyRate: '',
            //       monthlyRate: '',
            //       slotsAvailable: '',
            //       description: ''
            //     }
            //   ]);
            // }
      
            if (parkingPricingData.vehicleTypes && parkingPricingData.vehicleTypes.length > 0) {
              // Use the new vehicleTypes array if available
              const formattedVehicleTypes = parkingPricingData.vehicleTypes.map(vehicle => {
                // Check if this is a custom vehicle type (not in predefined list)
                const predefinedTypes = [
                  'Car', 'Motorcycle', 'Scooter', 'Bike', 'SUV', 'Truck', 
                  'Van', 'Bus', 'Electric Vehicle'
                ];
                
                if (!predefinedTypes.includes(vehicle.type)) {
                  return {
                    ...vehicle,
                    type: 'custom',
                    customType: vehicle.type
                  };
                }
                return vehicle;
              });
              
              setParkingVehicleTypes(formattedVehicleTypes);
            } else if (parkingPricingData.vehicleType) {
              // Convert legacy single vehicle type to array format
              const predefinedTypes = [
                'Car', 'Motorcycle', 'Scooter', 'Bike', 'SUV', 'Truck', 
                'Van', 'Bus', 'Electric Vehicle'
              ];
              
              const isCustomType = !predefinedTypes.includes(parkingPricingData.vehicleType);
              
              setParkingVehicleTypes([{
                type: isCustomType ? 'custom' : parkingPricingData.vehicleType,
                customType: isCustomType ? parkingPricingData.vehicleType : '',
                hourlyRate: parkingPricingData.hourlyRate || '',
                dailyRate: parkingPricingData.dailyRate || '',
                weeklyRate: parkingPricingData.weeklyRate || '',
                monthlyRate: parkingPricingData.monthlyRate || '',
                slotsAvailable: parkingPricingData.slotsAvailable || '',
                description: parkingPricingData.description || ''
              }]);
            }
            setPricingType('parking');
            break;
          
          case 'vehicle_rental':
            const pricingData = editingProduct.pricing.vehicleRental;
      
            if (pricingData.vehicleTypes && pricingData.vehicleTypes.length > 0) {
              // Use the new vehicleTypes array if available
              const formattedVehicleTypes = pricingData.vehicleTypes.map(vehicle => {
                // Check if this is a custom vehicle type (not in predefined list)
                const predefinedTypes = [
                  'Sedan', 'SUV', 'Hatchback', 'Bike', 'Scooter', 'Truck', 
                  'Luxury', 'Van', 'Convertible', 'Minivan', 'Pickup Truck', 
                  'Sports Car', 'Electric Vehicle', 'Hybrid'
                ];
                
                if (!predefinedTypes.includes(vehicle.type)) {
                  return {
                    ...vehicle,
                    type: 'custom',
                    customType: vehicle.type
                  };
                }
                return vehicle;
              });
              
              setVehicleTypes(formattedVehicleTypes);
            } else if (pricingData.vehicleType) {
              // Convert legacy single vehicle type to array format
              const predefinedTypes = [
                'Sedan', 'SUV', 'Hatchback', 'Bike', 'Scooter', 'Truck', 
                'Luxury', 'Van', 'Convertible', 'Minivan', 'Pickup Truck', 
                'Sports Car', 'Electric Vehicle', 'Hybrid'
              ];
              
              const isCustomType = !predefinedTypes.includes(pricingData.vehicleType);
              
              setVehicleTypes([{
                type: isCustomType ? 'custom' : pricingData.vehicleType,
                customType: isCustomType ? pricingData.vehicleType : '',
                quantity: pricingData.quantity || '',
                hourlyRate: pricingData.hourlyRate || '',
                dailyRate: pricingData.dailyRate || '',
                weeklyRate: pricingData.weeklyRate || '',
                monthlyRate: pricingData.monthlyRate || '',
                description: pricingData.description || '',
                fuelIncluded: pricingData.fuelIncluded || false,
                insuranceIncluded: pricingData.insuranceIncluded || false
              }]);
            }
            setPricingType('vehicle_rental');
            break;
          
          case 'service_tiered':
            const serviceItemsData = editingProduct.pricing.service;
      
            if (serviceItemsData.serviceItems && serviceItemsData.serviceItems.length > 0) {
              setServiceItems(serviceItemsData.serviceItems);
            } else {
              // Convert legacy data to new format
              setServiceItems([{
                name: serviceItemsData.name || '',
                price: serviceItemsData.price || '',
                pricingModel: serviceItemsData.pricingModel || 'fixed',
                description: serviceItemsData.description || '',
                quantity: serviceItemsData.quantity || '',
                minDuration: serviceItemsData.minDuration || '',
                maxDuration: serviceItemsData.maxDuration || ''
              }]);
            }
            setPricingType('service_tiered');
            break;
          
          default:
            setPricingType('service_tiered');
            break;
        }
      }
    } else {
      // Reset form when creating new post
      setFormData({
        title: '',
        price: '',
        postType: '', // New field
        categories: '', // For help requests
        serviceType: '', // For service offerings
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
      setAvailability({
        days: [],
        timeSlots: [],
        isAlwaysAvailable: false
      });
      setSelectedFeatures([]);
      setParkingVehicleTypes([
        {
          type: 'Car',
          customType: '',
          hourlyRate: '',
          dailyRate: '',
          weeklyRate: '',
          monthlyRate: '',
          slotsAvailable: '',
          description: ''
        }
      ]);
      setVehicleTypes([
        {
          type: 'Sedan',
          customType: '',
          quantity: '',
          hourlyRate: '',
          dailyRate: '',
          weeklyRate: '',
          monthlyRate: '',
          description: '',
          fuelIncluded: false,
          insuranceIncluded: false
        }
      ]);
      setServiceItems([
        {
          name: '',
          price: '',
          pricingModel: 'fixed',
          description: '',
          quantity: '',
          minDuration: '',
          maxDuration: ''
        }
      ]);
      setPricingType('service_tiered');
    }
  }, [editingProduct]);

  const handleCloseDialog = () => {
    // Reset all form states
    setFormData({
      title: '',
      price: '',
      postType: '', // New field
      categories: '', // For help requests
      serviceType: '', // For service offerings
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
    // Clear validation error when date is selected
    if (validationErrors.selectedDate) {
      setValidationErrors(prev => ({ ...prev, selectedDate: undefined }));
      setStepsWithErrors(prev => prev.filter(step => step !== 2));
    }
  };

  const handleTimeFromChange = (time) => {
    setTimeFrom(time);
    // Clear validation error when time is selected
    if (validationErrors.timeFrom) {
      setValidationErrors(prev => ({ ...prev, timeFrom: undefined }));
      setStepsWithErrors(prev => prev.filter(step => step !== 2));
    }
  };

  const handleTimeToChange = (time) => {
    setTimeTo(time);
    // Clear validation error when time is selected
    if (validationErrors.timeTo) {
      setValidationErrors(prev => ({ ...prev, timeTo: undefined }));
      setStepsWithErrors(prev => prev.filter(step => step !== 2));
    }
  };

  const locateUser = useCallback(async () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
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
      setLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    // fetchProducts().then((response) => setProducts(response.data));
    // localStorage.setItem('currentPage', currentPage); // Persist current page to localStorage
    fetchPostsData();
    const storedLocation = localStorage.getItem("userLocation");
    const savedAddress = localStorage.getItem('userAddress');
    if (storedLocation && savedAddress) {
      // Use the stored location
      const { latitude, longitude } = JSON.parse(storedLocation);
      // setUserLocation({ latitude, longitude });
      setCurrentLocation({ latitude, longitude });
      // fetchAddress(latitude, longitude);
      setCurrentAddress(savedAddress);
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
      localStorage.setItem('userAddress', data.display_name);
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

  const [keepPreviousLocation, setKeepPreviousLocation] = useState(false);

  const toggleKeepPreviousLocation = (e) => {
    const isChecked = e.target.checked;
    setKeepPreviousLocation(isChecked);
    if (isChecked) {
      setSnackbar({ open: true, message: 'Using previous location data from post', severity: 'info' });
    } else {
      setSnackbar({ open: true, message: 'Using current location data', severity: 'info' });
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
    longitude: currentLocation.longitude,
    address: currentAddress
  };

  if (keepPreviousLocation && editingProduct) {
    // Use the original post's location
    finalLocation = {
      latitude: editingProduct.location.latitude,
      longitude: editingProduct.location.longitude,
      address: editingProduct.location.address
    };
  } else if (protectLocation) {
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
    setLoadingSubmit(true); // Show loading state
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

    // Append availability data
    data.append('availability', JSON.stringify(availability));

    // Append service features
    selectedFeatures.forEach(feature => {
      data.append('serviceFeatures', feature);
    });

    // Prepare pricing data based on service type
    let pricingData = {
      type: 'service_tiered'
    };

    if (formData.postType === 'ServiceOffering') {
      switch (formData.serviceType) {
        case 'ParkingSpace':
          pricingData = {
            type: 'parking',
            parking: {
              vehicleTypes: parkingVehicleTypes.map(vehicle => {
                // Use custom type if specified, otherwise use the selected type
                const finalVehicleType = vehicle.type === 'custom' && vehicle.customType 
                  ? vehicle.customType 
                  : vehicle.type;
                
                return {
                  type: finalVehicleType,
                  hourlyRate: Number(vehicle.hourlyRate) || undefined,
                  dailyRate: Number(vehicle.dailyRate) || undefined,
                  weeklyRate: Number(vehicle.weeklyRate) || undefined,
                  monthlyRate: Number(vehicle.monthlyRate) || undefined,
                  slotsAvailable: Number(vehicle.slotsAvailable) || undefined,
                  description: vehicle.description || ''
                };
              }),
              // minDuration: Number(parkingPricing.minDuration) || 1,
              // maxDuration: Number(parkingPricing.maxDuration) || 24,
              // // Legacy fields for backward compatibility
              // hourlyRate: parkingVehicleTypes[0]?.hourlyRate || 0,
              // dailyRate: parkingVehicleTypes[0]?.dailyRate || 0,
              // monthlyRate: parkingVehicleTypes[0]?.monthlyRate || 0
            }
          };
          break;
        case 'VehicleRental':
          pricingData = {
            type: 'vehicle_rental',
            vehicleRental: {
              vehicleTypes: vehicleTypes.map(vehicle => {
                // Use custom type if specified, otherwise use the selected type
                const finalVehicleType = vehicle.type === 'custom' && vehicle.customType 
                  ? vehicle.customType 
                  : vehicle.type;
                
                return {
                  type: finalVehicleType,
                  quantity: Number(vehicle.quantity) || undefined,
                  hourlyRate: Number(vehicle.hourlyRate) || undefined,
                  dailyRate: Number(vehicle.dailyRate) || undefined,
                  weeklyRate: Number(vehicle.weeklyRate) || undefined,
                  monthlyRate: Number(vehicle.monthlyRate) || undefined,
                  description: vehicle.description || '',
                  fuelIncluded: vehicle.fuelIncluded,
                  insuranceIncluded: vehicle.insuranceIncluded
                };
              })
            }
          };
          break;
        default:
          pricingData = {
            type: 'service_tiered',
            service: {
              serviceItems: serviceItems.map(service => ({
                name: service.name || undefined,
                price: Number(service.price) || undefined,
                description: service.description || undefined,
                pricingModel: service.pricingModel,
                quantity: service.quantity || undefined,
                minDuration: Number(service.minDuration) || undefined,
                maxDuration: Number(service.maxDuration) || undefined
              })),
              // minNotice: Number(servicePricing.minNotice) || 24,
              // maxDailyBookings: Number(servicePricing.maxDailyBookings) || 10
            }
          };
          break;
      }
    }

    // Append pricing data
    data.append('pricing', JSON.stringify(pricingData));

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
      address: fakeAddress ? fakeAddress : finalLocation.address,
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
      let response;
      if (editingProduct) {
        response = await updateUserPost(editingProduct._id, data);
        // showNotification(`${formData.title} details updated successfully.`, 'success');
        if (onPostSuccess) {
          onPostSuccess(response.data.post, true);
        }
        setSnackbar({ open: true, message: `${formData.title} details updated successfully.`, severity: 'success' });
      } else {
        response = await addUserPost(data);
        // const postTypeText = formData.postType === 'HelpRequest' ? 'Help Request' : 'Service';
        // showNotification(`New Post "${formData.title}" is added successfully.`, 'success');
        if (onPostSuccess) {
          onPostSuccess(response.data.post, false);
        }
        setSnackbar({ open: true, message: `New Post "${formData.title}" is added successfully.`, severity: 'success' });
      }
      // Reset form after successful submission
      setFormData({
        title: '',
        price: '',
        postType: '',
        categories: '',
        serviceType: '',
        gender: '',
        postStatus: '',
        peopleCount: '',
        serviceDays: '',
        description: '',
        isFullTime: false,
        media: null,
      });
      setAvailability({
        days: [],
        timeSlots: [],
        isAlwaysAvailable: false
      });
      setSelectedFeatures([]);
      setExistingMedia([]);
      setNewMedia([]);
      setGeneratedImages([]);
      setSelectedDate(null);
      setTimeFrom(null);
      setTimeTo(null);
      setProtectLocation(false);
      setFakeAddress('');
      // setActiveStep(0);
      setValidationErrors({});
      // await fetchPostsData(); // Refresh products list
      handleCloseDialog();       // Close dialog
    } catch (error) {
      console.error("Error submitting post:", error);
      setSnackbar({
        open: true, message: editingProduct
          ? `${formData.title} details can't be updated, please try again later.`
          : `New post can't be added, please try again later.`, severity: 'error'
      });
    } finally {
      setLoadingSubmit(false); // Stop loading state
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
          if (!formData.postType) {
            errors.postType = 'Post Type is required.';
            errorSteps.add(2);
          } else {
            errorSteps.delete(2);
          }
          if (!currentAddress && !fakeAddress) {
            errors.location = 'Location is required, Please check your Location settings.';
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
          if (formData.postType === 'HelpRequest' && !formData.categories) {
            errors.categories = 'Category is required';
            errorSteps.add(2);
          } else {
            errorSteps.delete(2);
          }
          if (formData.postType === 'ServiceOffering' && !formData.serviceType) {
            errors.serviceType = 'Service Type is required';
            errorSteps.add(2);
          } else {
            errorSteps.delete(2);
          }
          if (formData.postType === 'HelpRequest' && formData.categories !== 'UnPaid' && !formData.price) {
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
          // People Count validation
          if (formData.postType === 'HelpRequest' && !formData.peopleCount) {
            errors.peopleCount = 'People count is required';
            errorSteps.add(2);
          } else if (formData.postType === 'HelpRequest' && formData.peopleCount) {
            const peopleCount = parseInt(formData.peopleCount);
            if (peopleCount < 1 || peopleCount > 10000) {
              errors.peopleCount = 'People count must be between 1 and 10000';
              errorSteps.add(2);
            } else {
              errorSteps.delete(2);
            }
          } else {
            errorSteps.delete(2);
          }
          // Service Days validation
          if (formData.postType === 'HelpRequest' && !formData.serviceDays) {
            errors.serviceDays = 'Service Days is required';
            errorSteps.add(2);
          } else if (formData.postType === 'HelpRequest' && formData.serviceDays) {
            const serviceDays = parseInt(formData.serviceDays);
            if (serviceDays < 1 || serviceDays > 365) {
              errors.serviceDays = 'Service days must be between 1 and 365';
              errorSteps.add(2);
            } else {
              errorSteps.delete(2);
            }
          } else {
            errorSteps.delete(2);
          }
          // Date and Time validations
          if (formData.postType === 'HelpRequest' && !selectedDate) {
            errors.selectedDate = 'Service Date is required';
            errorSteps.add(2);
          } else if (formData.postType === 'HelpRequest' && selectedDate) {
            // Check if date is in the past (except for emergency)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selected = new Date(selectedDate);
            selected.setHours(0, 0, 0, 0);
            
            if (selected < today && formData.categories !== 'Emergency') {
              errors.selectedDate = 'Service date cannot be in the past';
              errorSteps.add(2);
            } else {
              errorSteps.delete(2);
            }
          } else {
            errorSteps.delete(2); 
          }
          
          // Time validations - required for all categories, but especially for Emergency
          if (formData.postType === 'HelpRequest' && !timeFrom) {
            errors.timeFrom = 'Start time is required';
            errorSteps.add(2);
          } else {
            errorSteps.delete(2);
          }
          
          if (formData.postType === 'HelpRequest' && !timeTo) {
            errors.timeTo = 'End time is required';
            errorSteps.add(2);
          } else {
            errorSteps.delete(2);
          }
          
          // Validate time range
          // if (formData.postType === 'HelpRequest' && timeFrom && timeTo) {
          //   if (timeFrom >= timeTo) {
          //     errors.timeTo = 'End time must be after start time';
          //     errorSteps.add(2);
          //   } else {
          //     errorSteps.delete(2);
          //   }
          // }
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
          errorsToRemove.push('categories', 'serviceType', 'gender', 'peopleCount', 'serviceDays', 'price', 'serviceDate', 'serviceTime', 'selectedDate', 'timeFrom', 'timeTo');
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

    // useEffect to handle emergency category logic
    useEffect(() => {
      if (formData.postType === 'HelpRequest' && formData.categories === 'Emergency') {
        // Set selectedDate to today's date for emergency
        const today = new Date();
        setSelectedDate(today);
        
        // Set default time range for emergency (current time to 2 hours later)
        const now = new Date();
        const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        
        setTimeFrom(now);
        setTimeTo(twoHoursLater);
      }
    }, [formData.categories, formData.postType]);

    const renderLocationStep = () => (
      <Fade in timeout={300}>
        <Box>
          {/* Post Type Selection */}
          {!editingProduct && (
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.1)' , mb: 2}}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <PostAddRoundedIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  What are you posting?
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant={formData.postType === 'HelpRequest' ? 'contained' : 'outlined'}
                  fullWidth
                  onClick={() => {
                    setFormData({...formData, postType: 'HelpRequest', serviceType: '', categories: ''});
                    // Clear postType error when selecting
                    if (validationErrors.postType) {
                      setValidationErrors(prev => ({ ...prev, postType: undefined }));
                      setStepsWithErrors(prev => prev.filter(step => step !== 0));
                    }
                  }}
                  sx={{ borderRadius: 2, p: 2 }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <HelpRoundedIcon sx={{ mb: 1 }} />
                    <Typography variant="body2">I Need Help (Request)</Typography>
                  </Box>
                </Button>
                
                <Button
                  variant={formData.postType === 'ServiceOffering' ? 'contained' : 'outlined'}
                  fullWidth
                  onClick={() => {
                    setFormData({...formData, postType: 'ServiceOffering', categories: '', serviceType: ''});
                    // Clear postType error when selecting
                    if (validationErrors.postType) {
                      setValidationErrors(prev => ({ ...prev, postType: undefined }));
                      setStepsWithErrors(prev => prev.filter(step => step !== 0));
                    }
                  }}
                  sx={{ borderRadius: 2, p: 2 }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <BusinessCenterRoundedIcon sx={{ mb: 1 }} />
                    <Typography variant="body2">I Provide Service (Offer)</Typography>
                  </Box>
                </Button>
              </Box>
              {/* {validationErrors.postType && (
                <FormHelperText error sx={{ mt: -1, mb: 1 }}>{validationErrors.postType}</FormHelperText>
              )} */}
              {validationErrors.postType && (
                <Alert severity="error" sx={{ my: 1, borderRadius: 2 }}>
                  {validationErrors.postType}
                </Alert>
              )}
            </CardContent>
          </Card>)}
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
                sx={{ borderRadius: 3, textTransform: 'none' }}
              >
                {mapMode === 'normal' ? 'Satellite' : 'Normal'}
              </Button>
              <Button
                variant="outlined"
                startIcon={loadingLocation ? <CircularProgress size={16} /> : <MyLocationIcon />}
                disabled={loadingLocation} onClick={locateUser}
                sx={{ borderRadius: 3, textTransform: 'none' }}
              >
                Locate Me
              </Button>
            </Box>
          </Card>
          {validationErrors.location && (
            <Alert severity="error" sx={{ my: 1, borderRadius: 2 }}>
              {validationErrors.location}
            </Alert>
          )}

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
              {editingProduct && (
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: isMobile ? 1 : 2, 
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: 2,
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    mb: 1
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      <PinDropIcon sx={{ color: 'info.main', mr: 2 }} />
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          Use Previous Location
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Keep the previous location data from this post
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      checked={keepPreviousLocation}
                      onChange={toggleKeepPreviousLocation}
                      color="primary"
                    />
                  </Box>
                </Paper>
              )}
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
                  sx={{ borderRadius: 2, px: isMobile ? '24px' : 'null', textTransform: 'none', background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)', color: '#fff' }}
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
            <Alert severity="error" sx={{ my: 1, borderRadius: 2 }}>
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
                sx={{ borderRadius: 2, mb: 2, bgcolor: 'rgba(24, 170, 248, 0.07)', textTransform: 'none'}}
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
                <Box sx={{ display: 'flex', gap: '4px', p:'6px', borderRadius: '12px', overflowX: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#888 transparent', bgcolor: 'rgba(25, 118, 210, 0.05)' }}>
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
                <Box sx={{ mt: 1, p: '6px', bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: '12px'}} >
                  {/* Existing media with delete option */}
                  <Typography variant="subtitle1" mb={1}>Images previously posted</Typography>
                  <Box sx={{ display: 'flex', borderRadius: '8px', gap: '4px', overflowX: 'scroll', pb: 1 }}>
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

          {/* Category Selection based on Post Type */}
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <CategoryIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  {formData.postType === 'HelpRequest' ? 'Help Category' : 'Service Type'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                {formData.postType === 'HelpRequest' ? (
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
                ) : (
                  <FormControl fullWidth required>
                    <InputLabel>Service Type</InputLabel>
                    <Select
                      value={formData.serviceType}
                      required
                      error={!!validationErrors.serviceType}
                      onChange={(e) => {
                        setFormData({ ...formData, serviceType: e.target.value });
                        if (validationErrors.serviceType) {
                          setValidationErrors(prev => ({ ...prev, serviceType: undefined }));
                          setStepsWithErrors(prev => prev.filter(step => step !== 2));
                        }
                      }}
                      label="Service Type"
                      sx={{ borderRadius: 2 }}
                    >
                      {serviceTypes.map((service) => (
                        <MenuItem key={service.value} value={service.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{service.icon}</span>
                            {service.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {validationErrors.serviceType && (
                      <FormHelperText error>{validationErrors.serviceType}</FormHelperText>
                    )}
                  </FormControl>
                )}
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

              {(formData.postType === 'HelpRequest' && formData.categories === 'Paid') && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={500}>
                      {formData.postType === 'HelpRequest' ? 'Full-time position?' : 'Always(24/7) available service?'}
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

          {formData.postType === 'ServiceOffering' && formData.serviceType && (
            <>
              {renderAvailabilitySection()}
              {renderPricingSection()}
            </>
          )}

          {/* Pricing & Requirements */}
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              {formData.postType === 'HelpRequest' ? 
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <CurrencyRupeeIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Pricing & Requirements
                  </Typography>
                </Box> 
                : 
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <SupervisorAccountRoundedIcon/>
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Target Customers
                  </Typography>
                </Box> 
              }

              <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 2 }}>
                {/* Price field - show for paid help requests or all service offerings */}
                {(formData.postType === 'HelpRequest' && formData.categories !== 'UnPaid') && (
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
                  <InputLabel>{formData.postType === 'ServiceOffering' ? 'Target Customers' : 'Preferred gender for this position'}</InputLabel>
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
                    label={formData.postType === 'ServiceOffering' ? 'Target Customers' : 'Preferred gender for this position'}
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

              {formData.postType === 'HelpRequest' && (
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
              )}
            </CardContent>
          </Card>

          {formData.postType === 'HelpRequest' ? (
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
                    disabled={formData.categories === 'Emergency'} // Disable date selection for emergency
                    slotProps={{
                      textField: { fullWidth: true, sx: { mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                      error: !!validationErrors.selectedDate,
                      helperText: validationErrors.selectedDate, required: true }
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
                        textField: { fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                        error: !!validationErrors.timeFrom,
                        helperText: validationErrors.timeFrom, required: true }
                      }}
                    />
                  </LocalizationProvider>
                  
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      label="End Time" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '1rem', } }}
                      value={timeTo}
                      onChange={handleTimeToChange}
                      slotProps={{
                        textField: { fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                        error: !!validationErrors.timeTo,
                        helperText: validationErrors.timeTo, required: true }
                      }}
                    />
                  </LocalizationProvider>
                </Box>

                {formData.categories === 'Emergency' && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 0, 0, 0.05)', borderRadius: 2, border: '1px solid rgba(255, 0, 0, 0.2)' }}>
                    <Typography variant="body2" color="error" fontWeight={500}>
                      ⚠️ Emergency Service: Date is automatically set to today and cannot be changed. Please ensure timing is accurate.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ) : ( formData.serviceType && 
            <>
              {renderServiceFeaturesSection()}
            </>
          )}
          
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
                  <strong>Post Type:</strong> {formData.postType || 'Not selected'}
                </Typography>
                {formData.postType === 'HelpRequest' ? (
                  <>
                    <Typography variant="body2">
                      <strong>Category:</strong> {formData.categories || 'Not selected'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Price:</strong> ₹{formData.price || 'Not specified'}
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
                  </>
                  ) : (
                  <>
                    <Typography variant="body2">
                      <strong>Service Type:</strong> {formData.serviceType || 'Not selected'}
                    </Typography>
                    {formData.serviceType === 'ParkingSpace' ? (
                      // <Typography variant="body2">
                      //   <strong>Vehicle Rates:</strong>{' '}
                      //   {parkingPricing.vehicleTypes.map(vehicle => 
                      //     `${vehicle.name}: ₹${vehicle.price} ${vehicle.duration}`
                      //   ).join(', ')}
                      // </Typography>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Parking Rates:
                        </Typography>
                        {parkingVehicleTypes.map((vehicle, index) => {
                          const displayType = vehicle.type === 'custom' && vehicle.customType 
                            ? vehicle.customType 
                            : vehicle.type;
                          
                          return (
                            <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                              • {displayType}: ₹{vehicle.hourlyRate}/hr, ₹{vehicle.dailyRate}/day
                              {vehicle.weeklyRate && `, ₹${vehicle.weeklyRate}/week`}
                              {vehicle.monthlyRate && `, ₹${vehicle.monthlyRate}/month`}
                              {vehicle.slotsAvailable && ` (${vehicle.slotsAvailable} slots available)`}
                              {vehicle.description && ` - ${vehicle.description}`}
                            </Typography>
                          );
                        })}
                        {/* {parkingPricing.minDuration && (
                          <Typography variant="body2" sx={{ ml: 2, mt: 1 }}>
                            Min duration: {parkingPricing.minDuration} hours, Max duration: {parkingPricing.maxDuration} hours
                          </Typography>
                        )} */}
                      </Box>
                      ) : formData.serviceType === 'VehicleRental' ? (
                      // <Typography variant="body2">
                      //   <strong>Rental Rates:</strong>{' '}
                      //   {`Hourly: ₹${vehicleRentalPricing.hourlyRate}, Daily: ₹${vehicleRentalPricing.dailyRate}, Weekly: ₹${vehicleRentalPricing.weeklyRate}, Monthly: ₹${vehicleRentalPricing.monthlyRate}`}
                      //   {vehicleRentalPricing.fuelIncluded && ', Fuel Included'}
                      //   {vehicleRentalPricing.insuranceIncluded && ', Insurance Included'}
                      // </Typography>
                      // {vehicleTypes.length > 0 && (
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Vehicle Rental Rates:
                          </Typography>
                          {vehicleTypes.map((vehicle, index) => {
                            const displayType = vehicle.type === 'custom' && vehicle.customType 
                              ? vehicle.customType 
                              : vehicle.type;
                            
                            return (
                              <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                                • {displayType}: ₹{vehicle.hourlyRate}/hr, ₹{vehicle.dailyRate}/day
                                {vehicle.weeklyRate && `, ₹${vehicle.weeklyRate}/week`}
                                {vehicle.monthlyRate && `, ₹${vehicle.monthlyRate}/month`}
                                {vehicle.quantity && ` (${vehicle.quantity} vehicles available)`}
                                {vehicle.description && ` - ${vehicle.description}`}
                                {vehicle.fuelIncluded && ' (Fuel Included)'}
                                {vehicle.insuranceIncluded && ' (Insurance Included)'}
                              </Typography>
                            );
                          })}
                        </Box>
                      // )}
                      ) : (
                      // <Typography variant="body2">
                      //   <strong>Service Pricing:</strong>{' '}
                      //   {`Base: ₹${servicePricing.basePrice} (${servicePricing.pricingModel})`}
                      // </Typography>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Service Pricing:
                        </Typography>
                        {serviceItems.map((service, index) => (
                          <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                            • {service.name}: ₹{service.price} ({service.pricingModel})
                            {service.quantity && ` (${service.quantity} items or slots available)`}
                            {service.description && ` - ${service.description}`}
                            {(service.minDuration || service.maxDuration) && ` [Duration: ${service.minDuration || 'Any'}-${service.maxDuration || 'Any'} ${getDurationUnit(service.pricingModel)}]`}
                          </Typography>
                        ))}
                        {/* {servicePricing.minNotice && (
                          <Typography variant="body2" sx={{ ml: 2, mt: 1 }}>
                            Minimum notice: {servicePricing.minNotice} hours
                          </Typography>
                        )}
                        {servicePricing.maxDailyBookings && (
                          <Typography variant="body2" sx={{ ml: 2 }}>
                            Max bookings per day: {servicePricing.maxDailyBookings}
                          </Typography>
                        )} */}
                      </Box>
                    )}
                    <Typography variant="body2">
                      <strong>Availability:</strong> {availability.isAlwaysAvailable ? '24/7' : availability.days.join(', ')}
                    </Typography>
                    {selectedFeatures.length > 0 && (
                      <Typography variant="body2">
                        <strong>Features:</strong> {selectedFeatures.join(', ')}
                      </Typography>
                    )}
                  </>
                )}
                <Typography variant="body2">
                  <strong>Target Gender:</strong> {formData.gender || 'Not specified'}
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

    // Add these state variables after the existing states
    const [availability, setAvailability] = useState({
      days: [],
      timeSlots: [],
      isAlwaysAvailable: false
    });
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [expandedDay, setExpandedDay] = useState(null);
    const [showCustomFeatureInput, setShowCustomFeatureInput] = useState(false);
    const [customFeature, setCustomFeature] = useState('');

    // handler functions for custom features
    const handleAddCustomFeature = () => {
      if (customFeature.trim()) {
        setSelectedFeatures(prev => [...prev, customFeature.trim()]);
        setCustomFeature('');
        setShowCustomFeatureInput(false);
      }
    };

    const handleCancelCustomFeature = () => {
      setCustomFeature('');
      setShowCustomFeatureInput(false);
    };

    // function to remove feature
    const handleRemoveFeature = (featureToRemove) => {
      setSelectedFeatures(prev => prev.filter(feature => feature !== featureToRemove));
    };

    // Add these handler functions
    const handleDayToggle = (day) => {
      setAvailability(prev => {
        const newDays = prev.days.includes(day)
          ? prev.days.filter(d => d !== day)
          : [...prev.days, day];
        
        return {
          ...prev,
          days: newDays
        };
      });
    };

    const handleAlwaysAvailableToggle = (e) => {
      setAvailability(prev => ({
        ...prev,
        isAlwaysAvailable: e.target.checked
      }));
    };

    const handleTimeSlotChange = (day, from, to) => {
      setAvailability(prev => {
        const existingSlotIndex = prev.timeSlots.findIndex(slot => slot.day === day);
        let newTimeSlots;
        
        if (existingSlotIndex >= 0) {
          newTimeSlots = [...prev.timeSlots];
          newTimeSlots[existingSlotIndex] = { day, from, to };
        } else {
          newTimeSlots = [...prev.timeSlots, { day, from, to }];
        }
        
        return {
          ...prev,
          timeSlots: newTimeSlots
        };
      });
    };

    const handleFeatureToggle = (feature) => {
      setSelectedFeatures(prev =>
        prev.includes(feature)
          ? prev.filter(f => f !== feature)
          : [...prev, feature]
      );
    };

    // Add this function to render the availability section
    const renderAvailabilitySection = () => (
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.1)', mb: 0 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
              <ScheduleIcon />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              Availability
            </Typography>
          </Box>

          <FormGroup sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={availability.isAlwaysAvailable}
                  onChange={handleAlwaysAvailableToggle}
                  color="primary"
                />
              }
              label="Available 24/7"
            />
          </FormGroup>

          {!availability.isAlwaysAvailable && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Select Available Days
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {DAYS_OF_WEEK.map(day => (
                  <Chip
                    key={day}
                    label={day}
                    clickable
                    color={availability.days.includes(day) ? 'primary' : 'default'}
                    onClick={() => handleDayToggle(day)}
                    variant={availability.days.includes(day) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Set Time Slots
              </Typography>
              {DAYS_OF_WEEK.map(day => (
                <Accordion 
                  key={day} 
                  expanded={expandedDay === day}
                  onChange={() => setExpandedDay(expandedDay === day ? null : day)}
                  disabled={!availability.days.includes(day)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{day}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <FormControl sx={{ minWidth: 100 }} size='small'>
                        <InputLabel>From</InputLabel>
                        <Select
                          value={availability.timeSlots.find(slot => slot.day === day)?.from || ''}
                          onChange={(e) => handleTimeSlotChange(day, e.target.value, availability.timeSlots.find(slot => slot.day === day)?.to || '')}
                          label="From"
                        >
                          {TIME_SLOTS.map(time => (
                            <MenuItem key={`${day}-from-${time}`} value={time}>
                              {time}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <Typography>to</Typography>
                      
                      <FormControl sx={{ minWidth: 100 }} size='small'>
                        <InputLabel>To</InputLabel>
                        <Select
                          value={availability.timeSlots.find(slot => slot.day === day)?.to || ''}
                          onChange={(e) => handleTimeSlotChange(day, availability.timeSlots.find(slot => slot.day === day)?.from || '', e.target.value)}
                          label="To"
                        >
                          {TIME_SLOTS.map(time => (
                            <MenuItem key={`${day}-to-${time}`} value={time}>
                              {time}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    );

    // this function to render the service features section
    const renderServiceFeaturesSection = () => (
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.1)', mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
              <CheckIcon />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              Service Features
            </Typography>
          </Box>

          {formData.serviceType && SERVICE_FEATURES[formData.serviceType] ? (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select available features for your service:
              </Typography>
              
              {/* Selected Features */}
              {selectedFeatures.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Features:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {selectedFeatures.map(feature => (
                      <Chip
                        key={feature}
                        label={feature}
                        onDelete={() => handleRemoveFeature(feature)}
                        color="primary"
                        variant="filled"
                        sx={{ 
                          // borderRadius: 1,
                          '& .MuiChip-deleteIcon': {
                            color: 'white',
                            '&:hover': {
                              color: 'rgba(255, 255, 255, 0.8)'
                            }
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Available Features */}
              <Typography variant="subtitle2" gutterBottom>
                Available Features:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {SERVICE_FEATURES[formData.serviceType].map(feature => (
                  <Chip
                    key={feature}
                    label={feature}
                    clickable
                    color={selectedFeatures.includes(feature) ? 'primary' : 'default'}
                    onClick={() => handleFeatureToggle(feature)}
                    variant={selectedFeatures.includes(feature) ? 'filled' : 'outlined'}
                    // sx={{ borderRadius: 1 }}
                  />
                ))}
              </Box>

              {/* Custom Feature Input */}
              {showCustomFeatureInput ? (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Add Custom Feature:
                  </Typography>
                  <TextField
                    fullWidth
                    value={customFeature}
                    onChange={(e) => setCustomFeature(e.target.value)}
                    placeholder="Enter your custom feature"
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomFeature();
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={handleAddCustomFeature}
                      disabled={!customFeature.trim()}
                      size="small"
                    >
                      Add Feature
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleCancelCustomFeature}
                      size="small"
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setShowCustomFeatureInput(true)}
                  sx={{ mt: 1, borderRadius: 2 }}
                  size="small"
                >
                  Add Custom Feature
                </Button>
              )}

              {/* Helper text */}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Select features that apply to your service. You can also add custom features not listed above.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select a service type to see available features, or add custom features:
              </Typography>
              
              {/* Custom Feature Input when no service type selected */}
              {showCustomFeatureInput ? (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Add Custom Feature:
                  </Typography>
                  <TextField
                    fullWidth
                    value={customFeature}
                    onChange={(e) => setCustomFeature(e.target.value)}
                    placeholder="Enter your custom feature"
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomFeature();
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={handleAddCustomFeature}
                      disabled={!customFeature.trim()}
                      size="small"
                    >
                      Add Feature
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleCancelCustomFeature}
                      size="small"
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setShowCustomFeatureInput(true)}
                  sx={{ mt: 1, borderRadius: 2 }}
                  size="small"
                >
                  Add Custom Feature
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );

    const [pricingType, setPricingType] = useState('simple');
    const [parkingVehicleTypes, setParkingVehicleTypes] = useState([
      {
        type: 'Car',
        hourlyRate: '',
        dailyRate: '',
        weeklyRate: '',
        monthlyRate: '',
        slotsAvailable: '',
        description: ''
      }
    ]);

    // Add these handler functions for parking pricing
    const addParkingVehicleType = () => {
      setParkingVehicleTypes([
        ...parkingVehicleTypes,
        {
          type: 'Car',
          hourlyRate: '',
          dailyRate: '',
          weeklyRate: '',
          monthlyRate: '',
          slotsAvailable: '',
          description: ''
        }
      ]);
    };

    const removeParkingVehicleType = (index) => {
      if (parkingVehicleTypes.length > 1) {
        setParkingVehicleTypes(parkingVehicleTypes.filter((_, i) => i !== index));
      }
    };

    const updateParkingVehicleType = (index, field, value) => {
      const updatedVehicleTypes = [...parkingVehicleTypes];
      updatedVehicleTypes[index][field] = value;
      setParkingVehicleTypes(updatedVehicleTypes);
    };

    const [vehicleTypes, setVehicleTypes] = useState([{
      vehicleType: 'Sedan',
      quantity: '',
      hourlyRate: '',
      dailyRate: '',
      weeklyRate: '',
      monthlyRate: '',
      description: '',
      fuelIncluded: false,
      insuranceIncluded: false
    }]);

    // Add these handler functions
    const addVehicleType = () => {
      setVehicleTypes([
        ...vehicleTypes,
        {
          type: 'Sedan',
          customType: '',
          quantity: '',
          hourlyRate: '',
          dailyRate: '',
          weeklyRate: '',
          monthlyRate: '',
          description: '',
          fuelIncluded: false,
          insuranceIncluded: false
        }
      ]);
    };

    const removeVehicleType = (index) => {
      if (vehicleTypes.length > 1) {
        setVehicleTypes(vehicleTypes.filter((_, i) => i !== index));
      }
    };

    const updateVehicleType = (index, field, value) => {
      const updatedVehicleTypes = [...vehicleTypes];
      updatedVehicleTypes[index][field] = value;
      setVehicleTypes(updatedVehicleTypes);
    };

    const [serviceItems, setServiceItems] = useState([
      {
        name: '',
        price: '',
        pricingModel: 'fixed',
        quantity: '',
        description: '',
        minDuration: '',
        maxDuration: ''
      }
    ]);

    const addServiceItem = () => {
      setServiceItems([
        ...serviceItems,
        {
          name: '',
          price: '',
          pricingModel: 'fixed',
          quantity: '',
          description: '',
          minDuration: '',
          maxDuration: ''
        }
      ]);
    };

    const removeServiceItem = (index) => {
      if (serviceItems.length > 1) {
        setServiceItems(serviceItems.filter((_, i) => i !== index));
      }
    };

    const updateServiceItem = (index, field, value) => {
      const updatedItems = [...serviceItems];
      updatedItems[index][field] = value;
      setServiceItems(updatedItems);
    };

    // Add this function to render pricing section
    const renderPricingSection = () => {
      if (formData.postType !== 'ServiceOffering') return null;

      switch (formData.serviceType) {
        case 'ParkingSpace':
          return renderParkingPricing();
        case 'VehicleRental':
          return renderVehicleRentalPricing();
        default:
          return renderGeneralServicePricing();
      }
    };

    const renderParkingPricing = () => (
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.1)', mb: 0 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
              <CurrencyRupeeIcon />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              Parking Pricing
            </Typography>
          </Box>

          {parkingVehicleTypes.map((vehicle, index) => (
            <Box key={index} sx={{ 
              p: 2, 
              mb: 2, 
              border: '1px solid rgba(0, 0, 0, 0.1)', 
              borderRadius: 2,
              position: 'relative'
            }}>
              {parkingVehicleTypes.length > 1 && (
                <IconButton
                  size="small"
                  onClick={() => removeParkingVehicleType(index)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'error.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'error.dark' }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}

              <Typography variant="subtitle1" gutterBottom>
                Vehicle Type {index + 1}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Vehicle Type</InputLabel>
                  <Select
                    value={vehicle.type}
                    onChange={(e) => updateParkingVehicleType(index, 'type', e.target.value)}
                    label="Vehicle Type"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="Car">Car</MenuItem>
                    <MenuItem value="Motorcycle">Motorcycle</MenuItem>
                    <MenuItem value="Scooter">Scooter</MenuItem>
                    <MenuItem value="Bike">Bike</MenuItem>
                    <MenuItem value="SUV">SUV</MenuItem>
                    <MenuItem value="Truck">Truck</MenuItem>
                    <MenuItem value="Van">Van</MenuItem>
                    <MenuItem value="Bus">Bus</MenuItem>
                    <MenuItem value="Electric Vehicle">Electric Vehicle</MenuItem>
                    <MenuItem value="custom">Custom Vehicle Type...</MenuItem>
                  </Select>
                </FormControl>
                
                {/* Show custom input field when "Custom Vehicle Type..." is selected */}
                {vehicle.type === 'custom' && (
                  <TextField
                    fullWidth
                    label="Custom Vehicle Type Name"
                    value={vehicle.customType || ''}
                    onChange={(e) => updateParkingVehicleType(index, 'customType', e.target.value)}
                    sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    placeholder="Enter your custom vehicle type name"
                  />
                )}
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Hourly Rate (₹)"
                    type="number"
                    fullWidth
                    value={vehicle.hourlyRate}
                    onChange={(e) => updateParkingVehicleType(index, 'hourlyRate', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                      startAdornment: <CurrencyRupeeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Daily Rate (₹)"
                    type="number"
                    fullWidth
                    value={vehicle.dailyRate}
                    onChange={(e) => updateParkingVehicleType(index, 'dailyRate', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                      startAdornment: <CurrencyRupeeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Weekly Rate (₹)"
                    type="number"
                    fullWidth
                    value={vehicle.weeklyRate}
                    onChange={(e) => updateParkingVehicleType(index, 'weeklyRate', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                      startAdornment: <CurrencyRupeeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Monthly Rate (₹)"
                    type="number"
                    fullWidth
                    value={vehicle.monthlyRate}
                    onChange={(e) => updateParkingVehicleType(index, 'monthlyRate', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                      startAdornment: <CurrencyRupeeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Slots Available"
                    type="number"
                    fullWidth
                    value={vehicle.slotsAvailable}
                    onChange={(e) => updateParkingVehicleType(index, 'slotsAvailable', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                      inputProps: { min: 1, max: 1000 }
                    }}
                    helperText="Number of parking slots available for this vehicle type"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Description (Optional)"
                    fullWidth
                    value={vehicle.description}
                    onChange={(e) => updateParkingVehicleType(index, 'description', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    placeholder="e.g., Covered parking, EV charging, etc."
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addParkingVehicleType}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Add Another Vehicle Type
          </Button>

          {/* Additional parking settings */}
          {/* <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Additional Parking Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Min Parking Duration (hours)"
                  type="number"
                  fullWidth
                  value={parkingPricing.minDuration}
                  onChange={(e) => setParkingPricing({ ...parkingPricing, minDuration: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    inputProps: { min: 1, max: 24 }
                  }}
                  helperText="Minimum parking duration in hours"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Parking Duration (hours)"
                  type="number"
                  fullWidth
                  value={parkingPricing.maxDuration}
                  onChange={(e) => setParkingPricing({ ...parkingPricing, maxDuration: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    inputProps: { min: 1, max: 744 } // 31 days
                  }}
                  helperText="Maximum parking duration in hours"
                />
              </Grid>
            </Grid>
          </Box> */}
        </CardContent>
      </Card>
    );

    const renderVehicleRentalPricing = () => (
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.1)', mb: 0 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
              <CurrencyRupeeIcon />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              Vehicle Rental Pricing
            </Typography>
          </Box>

          {vehicleTypes.map((vehicle, index) => (
            <Box key={index} sx={{ 
              p: 2, 
              mb: 2, 
              border: '1px solid rgba(0, 0, 0, 0.1)', 
              borderRadius: 2,
              position: 'relative'
            }}>
              {vehicleTypes.length > 1 && (
                <IconButton
                  size="small"
                  onClick={() => removeVehicleType(index)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'error.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'error.dark' }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}

              <Typography variant="subtitle1" gutterBottom>
                Vehicle Type {index + 1}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth >
                  <InputLabel>Vehicle Type</InputLabel>
                  <Select
                    value={vehicle.type}
                    onChange={(e) => updateVehicleType(index, 'type', e.target.value)}
                    label="Vehicle Type"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="Sedan">Sedan</MenuItem>
                    <MenuItem value="SUV">SUV</MenuItem>
                    <MenuItem value="Hatchback">Hatchback</MenuItem>
                    <MenuItem value="Bike">Bike</MenuItem>
                    <MenuItem value="Scooter">Scooter</MenuItem>
                    <MenuItem value="Truck">Truck</MenuItem>
                    <MenuItem value="Luxury">Luxury</MenuItem>
                    <MenuItem value="Van">Van</MenuItem>
                    <MenuItem value="Convertible">Convertible</MenuItem>
                    <MenuItem value="Minivan">Minivan</MenuItem>
                    <MenuItem value="Pickup Truck">Pickup Truck</MenuItem>
                    <MenuItem value="Sports Car">Sports Car</MenuItem>
                    <MenuItem value="Electric Vehicle">Electric Vehicle</MenuItem>
                    <MenuItem value="Hybrid">Hybrid</MenuItem>
                    <MenuItem value="custom">Custom Vehicle Type...</MenuItem>
                  </Select>
                </FormControl>
                {/* Show custom input field when "Custom Vehicle Type..." is selected */}
                {vehicle.type === 'custom' && (
                  <TextField
                    fullWidth
                    label="Custom Vehicle Type Name"
                    value={vehicle.customType || ''}
                    onChange={(e) => updateVehicleType(index, 'customType', e.target.value)}
                    sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    placeholder="Enter your custom vehicle type name"
                  />
                )}
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Hourly Rate (₹)"
                    type="number"
                    fullWidth
                    value={vehicle.hourlyRate}
                    onChange={(e) => updateVehicleType(index, 'hourlyRate', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                      startAdornment: <CurrencyRupeeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Daily Rate (₹)"
                    type="number"
                    fullWidth
                    value={vehicle.dailyRate}
                    onChange={(e) => updateVehicleType(index, 'dailyRate', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                      startAdornment: <CurrencyRupeeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Weekly Rate (₹)"
                    type="number"
                    fullWidth
                    value={vehicle.weeklyRate}
                    onChange={(e) => updateVehicleType(index, 'weeklyRate', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                      startAdornment: <CurrencyRupeeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Monthly Rate (₹)"
                    type="number"
                    fullWidth
                    value={vehicle.monthlyRate}
                    onChange={(e) => updateVehicleType(index, 'monthlyRate', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                      startAdornment: <CurrencyRupeeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="No.of Vehicles available"
                    type="number"
                    fullWidth
                    value={vehicle.quantity}
                    onChange={(e) => updateVehicleType(index, 'quantity', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                      inputProps: { min: 1, max: 1000 }
                    }}
                    helperText="Number of vehicles available for this vehicle type"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Description (Optional)"
                    fullWidth
                    value={vehicle.description}
                    onChange={(e) => updateVehicleType(index, 'description', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    placeholder="e.g., Driving Licence must, Minimun 2000 cash deposit, etc."
                  />
                </Grid>
              </Grid>

              <FormGroup sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={vehicle.fuelIncluded}
                      onChange={(e) => updateVehicleType(index, 'fuelIncluded', e.target.checked)}
                    />
                  }
                  label="Fuel Included"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={vehicle.insuranceIncluded}
                      onChange={(e) => updateVehicleType(index, 'insuranceIncluded', e.target.checked)}
                    />
                  }
                  label="Insurance Included"
                />
              </FormGroup>
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addVehicleType}
            sx={{ borderRadius: 2, alignSelf: 'center', textTransform: 'none' }}
          >
            Add Another Vehicle Type
          </Button>
        </CardContent>
      </Card>
    );

    const renderGeneralServicePricing = () => (
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.1)', mb: 0 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
              <CurrencyRupeeIcon />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              Service Pricing
            </Typography>
          </Box>

          {serviceItems.map((service, index) => (
            <Box key={index} sx={{ 
              p: 2, 
              mb: 2, 
              border: '1px solid rgba(0, 0, 0, 0.1)', 
              borderRadius: 2,
              position: 'relative'
            }}>
              {serviceItems.length > 1 && (
                <IconButton
                  size="small"
                  onClick={() => removeServiceItem(index)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'error.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'error.dark' }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}

              <Typography variant="subtitle1" gutterBottom>
                Service Item {index + 1}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Service or Item Type Name"
                    fullWidth
                    value={service.name}
                    onChange={(e) => updateServiceItem(index, 'name', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    placeholder={`e.g., ${getRandomExamples(formData.serviceType)}`}
                    helperText={formData.serviceType ? `Examples: ${getServiceTypeExamples(formData.serviceType).slice(0, 3).join(', ')}...` : 'Enter the name of your service or item'}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="No.of items or slots Available"
                    type="number"
                    fullWidth
                    value={service.quantity}
                    onChange={(e) => updateServiceItem(index, 'quantity', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                      inputProps: { min: 1, max: 1000 }
                    }}
                    helperText="Number of items or slots available for this item or service  type"
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Price (₹)"
                    type="number"
                    fullWidth
                    value={service.price}
                    onChange={(e) => updateServiceItem(index, 'price', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                      startAdornment: <CurrencyRupeeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      inputProps: { min: 0 }
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Pricing Model</InputLabel>
                    <Select
                      value={service.pricingModel}
                      onChange={(e) => updateServiceItem(index, 'pricingModel', e.target.value)}
                      label="Pricing Model"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="fixed">Fixed Price</MenuItem>
                      <MenuItem value="hourly">Hourly Rate</MenuItem>
                      <MenuItem value="daily">Daily Rate</MenuItem>
                      <MenuItem value="weekly">Weekly Rate</MenuItem>
                      <MenuItem value="monthly">Monthly Rate</MenuItem>
                      <MenuItem value="per_item">Per Item</MenuItem>
                      <MenuItem value="per_person">Per Person</MenuItem>
                      <MenuItem value="per_square_foot">Per Square Foot</MenuItem>
                      <MenuItem value="per_room">Per Room</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Show duration fields only for time-based pricing models */}
              {(service.pricingModel === 'hourly' || service.pricingModel === 'daily' || 
              service.pricingModel === 'weekly' || service.pricingModel === 'monthly') && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Min Duration"
                      type="number"
                      fullWidth
                      value={service.minDuration}
                      onChange={(e) => updateServiceItem(index, 'minDuration', e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      InputProps={{
                        inputProps: { min: 1 }
                      }}
                      helperText={`Minimum ${service.pricingModel.replace('ly', '')}s`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Max Duration"
                      type="number"
                      fullWidth
                      value={service.maxDuration}
                      onChange={(e) => updateServiceItem(index, 'maxDuration', e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      InputProps={{
                        inputProps: { min: 1 }
                      }}
                      helperText={`Maximum ${service.pricingModel.replace('ly', '')}s`}
                    />
                  </Grid>
                </Grid>
              )}

              <Grid container >
                <Grid item xs={12} sm={12}>
                  <TextField
                    label="Description (Optional)"
                    fullWidth
                    value={service.description}
                    onChange={(e) => updateServiceItem(index, 'description', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    placeholder="Describe what this service includes"
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addServiceItem}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Add Another Service or Item Type
          </Button>

          {/* Global service settings */}
          {/* <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Service Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Minimum Booking Notice (hours)"
                  type="number"
                  fullWidth
                  value={servicePricing.minNotice}
                  onChange={(e) => setServicePricing({ ...servicePricing, minNotice: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    inputProps: { min: 1, max: 168 }
                  }}
                  helperText="Hours advance notice required"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Bookings Per Day"
                  type="number"
                  fullWidth
                  value={servicePricing.maxDailyBookings}
                  onChange={(e) => setServicePricing({ ...servicePricing, maxDailyBookings: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    inputProps: { min: 1, max: 100 }
                  }}
                  helperText="Maximum bookings accepted per day"
                />
              </Grid>
            </Grid>
          </Box> */}
        </CardContent>
      </Card>
    );

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
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'left' }}
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
          disabled={loadingSubmit}
        >
          Cancel
        </Button>

        <Box sx={{ flex: 1 }} />

        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            variant="outlined"
            sx={{ borderRadius: 2 }}
            disabled={loadingSubmit}
          >
            Back
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            sx={{ borderRadius: 2, minWidth: 100 }}
            disabled={loadingSubmit}
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
            disabled={loadingSubmit}
            startIcon={loadingSubmit ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {loadingSubmit ? 'Publishing...' : (editingProduct ? 'Update Post' : 'Publish Post')}
          </Button>
        )}
      </DialogActions>
    </Dialog>

  );
};

export default EnhancedPostServiceDialog;