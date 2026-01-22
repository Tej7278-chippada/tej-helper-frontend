// components/UserProfile.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link} from 'react-router-dom';
import { Box, Typography, Avatar, IconButton, Alert, useMediaQuery, Grid, Button, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, CircularProgress, Card, CardContent, Rating, TextField, Chip, InputAdornment, Slide, MenuItem, Switch, FormControl, InputLabel, Select } from '@mui/material';
import { useTheme } from '@emotion/react';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import API, { cancelIdVerification, deleteProfilePicture, fetchUserProfile, getBloodDonationHistory, getBloodDonationRequests, submitIdVerification, updateBloodRequestStatus, updateProfilePicture, updateUserBloodData, updateUserProfile } from './api/api';
import Layout from './Layout';
import SkeletonProductDetail from './SkeletonProductDetail';
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
import FollowDialog from './Helper/FollowDialog';
import RequestCoupon from './Banners/RequestCoupon';
import { AddRounded, ChatRounded, CollectionsBookmarkRounded, EditNoteRounded, NewReleasesRounded, PlaylistAddRounded, QuestionAnswerRounded } from '@mui/icons-material';
import AddBloodDonationDataDialog from './BloodDonor/AddBloodDonationDataDialog';
import {
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import BloodDonationRequestsDialog from './BloodDonor/BloodDonationRequestsDialog';
import BloodDonationHistoryDialog from './BloodDonor/BloodDonationHistoryDialog';
// Note: Discord and Snapchat icons might need to be imported from different packages

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

// Social media platform options with icons and domain patterns
const SOCIAL_MEDIA_OPTIONS = [
  { id: 'whatsapp', label: 'WhatsApp', domain: 'wa.me/', placeholder: 'wa.me/yournumber' },
  { id: 'telegram', label: 'Telegram', domain: 't.me/', placeholder: 't.me/username' },
  { id: 'instagram', label: 'Instagram', domain: 'instagram.com/', placeholder: 'instagram.com/username' },
  { id: 'facebook', label: 'Facebook', domain: 'facebook.com/', placeholder: 'facebook.com/profile' },
  { id: 'twitter', label: 'Twitter', domain: 'twitter.com/', placeholder: 'twitter.com/username' },
  { id: 'linkedin', label: 'LinkedIn', domain: 'linkedin.com/in/', placeholder: 'linkedin.com/in/username' },
  { id: 'youtube', label: 'YouTube', domain: 'youtube.com/', placeholder: 'youtube.com/c/username' },
  { id: 'discord', label: 'Discord', domain: 'discord.gg/', placeholder: 'discord.gg/invite-code' },
  { id: 'snapchat', label: 'Snapchat', domain: 'snapchat.com/add/', placeholder: 'snapchat.com/add/username' },
  { id: 'other', label: 'Other', domain: '', placeholder: 'Enter full URL' }
];


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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const tokenUsername = localStorage.getItem('tokenUsername');
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    phone: '',
    profileDescription: '',
    withYou: false,
    // donate: false,
    // bloodGroup: '',
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
  const [followDialogOpen, setFollowDialogOpen] = useState(false);
  const [followType, setFollowType] = useState(''); // 'followers' or 'following'
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProfileDetailsOpen, setUserProfileDetailsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication
  const [loginMessage, setLoginMessage] = useState({ open: false, message: "", severity: "info" });
  const [showAddDonationDialog, setShowAddDonationDialog] = useState(false);
  const [eligibilityInfo, setEligibilityInfo] = useState({ eligible: true, daysLeft: 0 });
  const [showEditDonorDialog, setShowEditDonorDialog] = useState(false);
  const [bloodData, setBloodData] = useState({
    donate: false,
    bloodGroup: '',
    phone: '',
    email: '',
    socialMedia: []
  });
  const [newSocialLink, setNewSocialLink] = useState({
    platform: '',
    url: ''
  });
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [showBloodRequestsDialog, setShowBloodRequestsDialog] = useState(false);
  const [showDonationHistoryDialog, setShowDonationHistoryDialog] = useState(false);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

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
        const authToken = localStorage.getItem('authToken');
        setIsAuthenticated(!!authToken); // Check if user is authenticated
        const response = await fetchUserProfile(id);
        setUserData(response.data);
        setFollowerCount(response.data.followerCount);
        setFollowingCount(response.data.followingCount);
        setVerificationStatus(response.data.status);
        setVerificationData(response.data);
        // fetchAddress(response.data.location.latitude, response.data.location.longitude);
        if (response.data.pendingBloodRequests) {
          setPendingRequestsCount(response.data.pendingBloodRequests);
        }
        
      } catch (err) {
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
      setSnackbar({ open: true, message: 'Your account has been deleted successfully.', severity: 'success' });
      localStorage.clear();
      navigate('/login');
    } catch (err) {
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

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  const [isRateDialogOpen, setRateDialogOpen] = useState(false);
  const handleOpenRateDialog = () => setRateDialogOpen(true);
  const handleCloseRateDialog = () => setRateDialogOpen(false);

  const handleEditProfile = () => {
    setProfileForm({
      username: userData.username,
      email: userData.email,
      phone: userData.phone || '',
      withYou: userData.withYou || false,
      donate: userData.bloodDonor?.donate || false,
      bloodGroup: userData.bloodDonor?.bloodGroup || '',
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
      // if (!profileForm.phone) {
      //   setError('Phone number is required.');
      //   return;
      // }
      let phoneNumber = null;
      // Phone validation
      if (profileForm.phone && profileForm.phone.length > 0) {
        if (profileForm.phone.length !== 10 || !/^\d+$/.test(profileForm.phone)) {
          setError('Invalid mobile number.');
          return;
        }
        phoneNumber = profileForm.phone;
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
        phone: phoneNumber,
        withYou: updated.withYou,
        // bloodDonor: {
        //   donate: updated.bloodDonor?.donate ?? false,
        //   bloodGroup: updated.bloodDonor?.bloodGroup ?? ''
        // },
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
    setBloodData((prev) => ({
      ...prev,
      donate: isChecked,
      // bloodGroup: isChecked ? prev.bloodGroup : '' // remove group if turned off
    }));
  };

  const handleOpenFollowers = () => {
    setFollowType('followers');
    setFollowDialogOpen(true);
  };

  const handleOpenFollowing = () => {
    setFollowType('following');
    setFollowDialogOpen(true);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setUserProfileDetailsOpen(true);
    // setFollowDialogOpen(false);
  };

  // const formatDistance = (distance) => {
  //   if (distance === null || distance === undefined) return null;

  //   if (distance < 1) {
  //     return `${Math.round(distance * 1000)} m away`;
  //   }

  //   return `${distance.toFixed(1)} km away`;
  // };

  const donationCount = Array.isArray(userData?.bloodDonor?.lastDonated)
    ? userData.bloodDonor.lastDonated.length
    : 0;

  const formatDonateDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-IN', {
      dateStyle: 'medium',
      // timeStyle: 'short',
    }) : '—';

  // const formatDate = (date) =>
  //   date ? new Date(date).toLocaleString('en-IN', {
  //     dateStyle: 'medium',
  //     timeStyle: 'short',
  //   }) : '—';

  const LAST_DONATION_GAP_DAYS = 56; // 8 weeks

  const lastDonationDate =
    donationCount > 0
      ? userData.bloodDonor.lastDonated[donationCount - 1] // latest donation
      : null;

  const getEligibilityInfo = () => {
    if (!lastDonationDate) {
      return { eligible: true, daysLeft: 0 };
    }

    const lastDate = new Date(lastDonationDate);
    const today = new Date();

    const diffTime = today.getTime() - lastDate.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const daysLeft = LAST_DONATION_GAP_DAYS - daysPassed;

    return {
      eligible: daysLeft <= 0,
      daysLeft: daysLeft > 0 ? daysLeft : 0
    };
  };

  const eligibility = getEligibilityInfo();

  // Initialize blood data from userData
  const handleEditBloodData = () => {
    setBloodData({
      donate: userData.bloodDonor?.donate || false,
      bloodGroup: userData.bloodDonor?.bloodGroup || '',
      phone: userData?.bloodDonor?.contactWay?.phone || '',
      email: userData?.bloodDonor?.contactWay?.email || '',
      socialMedia: userData?.bloodDonor?.contactWay?.socialMedia || []
    });
    setNewSocialLink({ platform: '', url: '' });
    setError('');
    setShowEditDonorDialog(true);
  };

  const handleBloodDataChange = (e) => {
    const { name, value } = e.target;
    setBloodData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle social media platform change
  const handlePlatformChange = (platformId) => {
    const selectedPlatform = SOCIAL_MEDIA_OPTIONS.find(opt => opt.id === platformId);
    setNewSocialLink({
    platformId,
    url: selectedPlatform?.domain
      ? selectedPlatform.domain
      : ''
  });

  };

  // Handle social media URL change
  const handleSocialUrlChange = (e) => {
    const value = e.target.value;
    setNewSocialLink(prev => ({
      ...prev,
      url: value
    }));
  };

  // Add new social media link
  const addSocialLink = () => {
    if (!newSocialLink.platformId || !newSocialLink.url.trim()) {
      setError('Please select a platform and enter URL');
      return;
    }

    // Validate URL
    // const url = newSocialLink.url.trim();
    // if (!url.startsWith('http://') && !url.startsWith('https://')) {
    //   setError('Please enter a valid URL starting with http:// or https://');
    //   return;
    // }

    setBloodData(prev => ({
      ...prev,
      socialMedia: [
        ...prev.socialMedia,
        {
          platform: SOCIAL_MEDIA_OPTIONS.find(
            opt => opt.id === newSocialLink.platformId
          )?.label,
          url: !newSocialLink.url.startsWith('https://') ? `https://${newSocialLink.url.trim()}` : newSocialLink.url.trim()
        }
      ]
    }));

    setNewSocialLink({ platform: '', url: '' });
    setError('');
  };

  // Remove social media link
  const removeSocialLink = (index) => {
    setBloodData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateBloodData = async () => {
    try { 
      setUpdating(true);
      setError('');

      let emailId = null;
      // Email validation
      if (bloodData.email && bloodData.email.length > 0) {
        if (!bloodData.email.includes('@') || !bloodData.email.endsWith('.com')) {
          setError('Invalid mail id.');
          setUpdating(false);
          return;
        }
        emailId = bloodData.email;
      }

      let phoneNumber = null;
      // Phone validation
      if (bloodData.phone && bloodData.phone.length > 0) {
        if (bloodData.phone.length !== 10 || !/^\d+$/.test(bloodData.phone)) {
          setError('Invalid mobile number.');
          setUpdating(false);
          return;
        }
        phoneNumber = bloodData.phone;
      }

      // Validate social media URLs
      for (const link of bloodData.socialMedia) {
        try {
          new URL(link.url);
        } catch {
          setError(`Invalid URL for ${link.platform}. Please check the format.`);
          setUpdating(false);
          return;
        }
      }

      const response = await updateUserBloodData(id, {
        // ...bloodData,
        // interests: Array.isArray(profileForm.interests) ? profileForm.interests : []
        donate: bloodData.donate,
        bloodGroup: bloodData.bloodGroup,
        phone: phoneNumber,
        email: emailId,
        socialMedia: bloodData.socialMedia
      });
      const updated = response.data.user;
      setUserData(prev => ({
        ...prev,
        // username: updated.username,
        // email: emailId,
        // phone: phoneNumber,
        // withYou: updated.withYou,
        bloodDonor: { ...prev.bloodDonor,
          donate: updated.bloodDonor?.donate ?? false,
          bloodGroup: updated.bloodDonor?.bloodGroup ?? '',
          contactWay: {
            phone: phoneNumber,
            email: emailId,
            socialMedia: updated.bloodDonor?.contactWay?.socialMedia || []
          }
        },
        // profileDescription: updated.profileDescription,
        // interests: updated.interests
      }));
      setShowEditDonorDialog(false);
      setSnackbar({ 
        open: true, 
        message: 'Profile blood donor data updated successfully!', 
        severity: 'success' 
      });
      setError('');
    } catch (error) {
      console.error('Error updating profile blood data:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error updating profile blood data', 
        severity: 'error' 
      });
    } finally {
      setUpdating(false);
    }
  };

  // Check eligibility on component mount or when userData changes
useEffect(() => {
  if (userData?.bloodDonor?.lastDonated) {
    const lastDonationDate = new Date(userData.bloodDonor.lastDonated);
    const today = new Date();
    const MIN_DAYS_BETWEEN_DONATIONS = 56;
    
    const diffTime = today.getTime() - lastDonationDate.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const daysLeft = MIN_DAYS_BETWEEN_DONATIONS - daysPassed;
    
    setEligibilityInfo({
      eligible: daysPassed >= MIN_DAYS_BETWEEN_DONATIONS,
      daysLeft: daysLeft > 0 ? daysLeft : 0,
      lastDonationDate: lastDonationDate
    });
  } else {
    setEligibilityInfo({ eligible: true, daysLeft: 0 });
  }
}, [userData]);

// Handle opening donation dialog with eligibility check
const handleOpenAddDonationDialog = () => {
  if (!eligibilityInfo.eligible) {
    setSnackbar({
      open: true,
      message: `You can donate again in ${eligibilityInfo.daysLeft} days. Minimum gap is 56 days.`,
      severity: 'warning'
    });
    return;
  }
  
  // Check if user is a blood donor
  if (!userData?.bloodDonor?.donate) {
    setSnackbar({
      open: true,
      message: 'Please enable blood donation first from Edit Blood Donation.',
      severity: 'warning'
    });
    return;
  }
  
  setShowAddDonationDialog(true);
};

// Handle successful donation
const handleDonationAdded = (updatedUser, donationData) => {
  // Update local state
  setUserData(prev => ({
    ...prev,
    bloodDonor: {
      ...prev.bloodDonor,
      lastDonated: donationData.donatedAt,
      donationCount: updatedUser.bloodDonor.donationCount || ((prev.bloodDonor?.donationCount || 0) + 1)
    }
  }));
  
  // Update eligibility info
  const MIN_DAYS_BETWEEN_DONATIONS = 56;
  const nextEligibilityDate = donationData.donatedAt ? new Date(donationData.donatedAt) : new Date();
  nextEligibilityDate.setDate(nextEligibilityDate.getDate() + MIN_DAYS_BETWEEN_DONATIONS);
  
  setEligibilityInfo({
    eligible: false,
    daysLeft: MIN_DAYS_BETWEEN_DONATIONS,
    lastDonationDate: donationData.donatedAt
  });
  
  setSnackbar({
    open: true,
    message: 'Blood donation recorded successfully! Thank you for saving lives.',
    severity: 'success'
  });
};

// Helper function to detect social platform from URL
const detectSocialPlatform = (url) => {
  if (!url) return 'other';
  
  const lowerUrl = url.toLowerCase();
  
  for (const [platform, data] of Object.entries(SOCIAL_MEDIA_PLATFORMS)) {
    if (platform !== 'other' && data.pattern.test(lowerUrl.replace('https://', '').replace('http://', ''))) {
      return platform;
    }
  }
  
  return 'other';
};

// Helper function to format URL for opening
const formatSocialUrl = (url, platform) => {
  if (!url) return '#';
  
  // If it's already a full URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Add platform-specific domain if needed
  const platformData = SOCIAL_MEDIA_PLATFORMS[platform];
  if (platformData && platformData.domain) {
    // Remove any existing domain prefix from the stored value
    const cleanUrl = url.replace(platformData.domain.replace('https://', ''), '');
    return platformData.domain + cleanUrl;
  }
  
  // Default to https://
  return 'https://' + url;
};

// Helper function to get social media icon component
const getSocialIcon = (platform, fontSize = 'small', color = 'inherit') => {
  const icons = {
    whatsapp: <WhatsAppIcon fontSize={fontSize} sx={{ color }} />,
    telegram: <TelegramIcon fontSize={fontSize} sx={{ color }} />,
    instagram: <InstagramIcon fontSize={fontSize} sx={{ color }} />,
    facebook: <FacebookIcon fontSize={fontSize} sx={{ color }} />,
    twitter: <TwitterIcon fontSize={fontSize} sx={{ color }} />,
    linkedin: <LinkedInIcon fontSize={fontSize} sx={{ color }} />,
    youtube: <YouTubeIcon fontSize={fontSize} sx={{ color }} />,
    discord: <ChatRounded fontSize={fontSize} sx={{ color }} />,
    snapchat: <QuestionAnswerRounded fontSize={fontSize} sx={{ color }} />,
    other: <LinkIcon fontSize={fontSize} sx={{ color }} />
  };
  return icons[platform] || <LinkIcon fontSize={fontSize} sx={{ color }} />;
};

// Function to handle social chip click
const handleSocialChipClick = (url, platform) => {
  const formattedUrl = formatSocialUrl(url, platform);
  
  // Check if it's a mobile device for WhatsApp/Telegram
  if ((platform === 'whatsapp' || platform === 'telegram') && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // For mobile, let the OS handle the app opening
    window.open(formattedUrl, '_blank');
  } else {
    // For desktop, open in new tab
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
  }
};

// Social media platform options with icons, colors, and domain patterns
const SOCIAL_MEDIA_PLATFORMS = {
  whatsapp: {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: 'WhatsApp',
    color: '#25D366',
    domain: 'https://wa.me/',
    placeholder: 'wa.me/yournumber',
    pattern: /^wa\.me\/.+/
  },
  telegram: {
    id: 'telegram',
    label: 'Telegram',
    icon: 'Telegram',
    color: '#0088cc',
    domain: 'https://t.me/',
    placeholder: 't.me/username',
    pattern: /^t\.me\/.+/
  },
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    icon: 'Instagram',
    color: '#E4405F',
    domain: 'https://instagram.com/',
    placeholder: 'instagram.com/username',
    pattern: /^instagram\.com\/.+/
  },
  facebook: {
    id: 'facebook',
    label: 'Facebook',
    icon: 'Facebook',
    color: '#1877F2',
    domain: 'https://facebook.com/',
    placeholder: 'facebook.com/profile',
    pattern: /^facebook\.com\/.+/
  },
  twitter: {
    id: 'twitter',
    label: 'Twitter',
    icon: 'Twitter',
    color: '#1DA1F2',
    domain: 'https://twitter.com/',
    placeholder: 'twitter.com/username',
    pattern: /^twitter\.com\/.+/
  },
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: 'LinkedIn',
    color: '#0A66C2',
    domain: 'https://linkedin.com/in/',
    placeholder: 'linkedin.com/in/username',
    pattern: /^linkedin\.com\/in\/.+/
  },
  youtube: {
    id: 'youtube',
    label: 'YouTube',
    icon: 'YouTube',
    color: '#FF0000',
    domain: 'https://youtube.com/',
    placeholder: 'youtube.com/c/username',
    pattern: /^youtube\.com\/.+/
  },
  discord: {
    id: 'discord',
    label: 'Discord',
    icon: 'Discord',
    color: '#5865F2',
    domain: 'https://discord.gg/',
    placeholder: 'discord.gg/invite-code',
    pattern: /^discord\.gg\/.+/
  },
  snapchat: {
    id: 'snapchat',
    label: 'Snapchat',
    icon: 'Snapchat',
    color: '#FFFC00',
    domain: 'https://snapchat.com/add/',
    placeholder: 'snapchat.com/add/username',
    pattern: /^snapchat\.com\/add\/.+/
  },
  other: {
    id: 'other',
    label: 'Other',
    icon: 'Link',
    color: darkMode ? '#888' : '#666',
    domain: '',
    placeholder: 'Enter full URL',
    pattern: /^https?:\/\/.+/
  }
};

  const handleOpenBloodRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await getBloodDonationRequests();
      setBloodRequests(response.data.requests || []);
      setShowBloodRequestsDialog(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to load blood requests',
        severity: 'error'
      });
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleOpenDonationHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await getBloodDonationHistory();
      setDonationHistory(response.data.donationHistory || []);
      setShowDonationHistoryDialog(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to load donation history',
        severity: 'error'
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUpdateRequestStatus = async (requesterId, status) => {
    try {
      await updateBloodRequestStatus(requesterId, status);
      
      // Update local state
      setBloodRequests(prev => 
        prev.map(req => 
          req.userId._id === requesterId 
            ? { ...req, status }
            : req
        )
      );
      
      // Update pending count
      if (status !== 'pending') {
        setPendingRequestsCount(prev => Math.max(0, prev - 1));
      }
      
      setSnackbar({
        open: true,
        message: `Request ${status} successfully`,
        severity: 'success'
      });
      
      // Refresh user data to update counts
      const response = await fetchUserProfile(id);
      if (response.data.pendingBloodRequests) {
        setPendingRequestsCount(response.data.pendingBloodRequests);
      }
      
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update request status',
        severity: 'error'
      });
    }
  };

  return (
    <Layout username={tokenUsername} darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate}>
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
                sx={{
                  display: 'flex',
                  justifyContent: isMobile ? 'center' : 'flex-start',
                  alignItems: 'flex-start',
                }}
              >
                <Box sx={{ position: 'relative', display: 'inline-block', width: isMobile ? '160px' : '100%', objectFit: 'contain',
                  aspectRatio: '1 / 1', // makes height = width
                  }}>
                  {userData?.profilePic ? 
                    <Avatar
                      alt={userData.username}
                      src={
                        // userData.profilePic
                        //   ? 
                          `data:image/jpeg;base64,${userData.profilePic}`
                          // : 'https://placehold.co/200x200?text=No+Image'
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
                    : 
                    <Box
                      sx={{
                        width: isMobile ? '160px' : '100%', 
                        height: isMobile ? '160px' : '100%',
                        borderRadius: '50%', cursor: 'pointer',
                        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0, mr: 0,
                        '&:active': {
                          transform: 'scale(0.98)', // Add press feedback instead
                          transition: 'transform 0.1s ease',
                        },
                      }}
                      onClick={() => setProfilePicDialog(true)}
                    >
                      <Typography 
                        variant="h6" 
                        color="textSecondary"
                        sx={{ textAlign: 'center', px: 2 }}
                      >
                        No Image
                      </Typography>
                    </Box>
                  }
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
                      {userData?.phone || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      User Email: 
                      <Chip
                        label={userData?.emailVerified === true ? 'Verified' : 'Not Verified'} 
                        color={userData?.emailVerified === true ? 'success' : 'warning' }
                        sx={{ height: '18px', ml: 1, fontSize: '0.7rem', }} variant="outlined" size="small"
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
                      <Typography variant="body2" color="text.secondary" 
                        onClick={handleOpenFollowers}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { 
                            color: 'primary.main',
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        <strong>{followerCount}</strong> Followers
                      </Typography>
                      <Typography variant="body2" color="text.secondary"
                        onClick={handleOpenFollowing}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { 
                            color: 'primary.main',
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        <strong>{followingCount}</strong> Following
                      </Typography>
                    </Box>
                    <RequestCoupon id={id} isAuthenticated={isAuthenticated} followerCount={followerCount} setSnackbar={setSnackbar} />
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
                  {/* <Grid item xs={12} sm={12} md={6} >
                    <Box display="flex" alignItems="center" gap={1}>
                      <BloodtypeIcon color="error" fontSize="small" />
                      <Typography variant="body1" fontWeight={500}>
                        Blood Donation Status
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {userData?.bloodDonor?.donate === true
                        ? userData?.bloodDonor?.bloodGroup === "Unknown"
                          ? "You’re a blood donor — thank you! (Blood group not specified)"
                          : `You’re a blood donor — thank you! (${userData?.bloodDonor?.bloodGroup})`
                        : userData?.bloodDonor?.donate === false
                        ? "You haven’t enabled blood donation."
                        : "You haven’t set this preference yet."}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" marginTop={4}>
                      *If you choose to donate, your blood group will be visible to nearby people who may need emergency blood support.
                    </Typography>
                  </Grid> */}
                </Grid>
              </Box>

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
          </Box>
          <Box sx={{  my: 1, padding: isMobile ? 2 : 3, borderRadius: 3, ...getGlassmorphismStyle(theme, darkMode), }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'error.main', mr: 1, height: '32px', width: '32px' }}>
                  <BloodtypeIcon fontSize="small" />
                </Avatar>
                <Typography variant="h6" >
                  Blood Donation
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: '8px' }}>
                <Button variant="outlined" size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
                    color: '#fff', px: 1.5,
                    borderRadius: 5,
                    textTransform: 'none',
                    // boxShadow: '0 6px 25px rgba(67,97,238,0.35)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 10px 30px rgba(67,97,238,0.45)',
                    },
                  }} 
                  onClick={handleEditBloodData}
                  startIcon={<EditNoteRounded />}
                >
                  Edit
                </Button>
                {/* <Tooltip title="Edit Blood Donation" arrow>
                  <IconButton 
                    onClick={handleEditBloodData}
                    sx={{
                      minWidth: '40px',
                      minHeight: '40px',
                      ...getButtonStyle(darkMode, showEditDonorDialog),
                      // backgroundColor: showSortMenu ? darkMode ? 'rgba(255, 255, 255, 0.1)'  : 'rgba(0, 0, 0, 0.05)' : 'transparent',
                    }}
                  >
                    <EditNoteRounded />
                  </IconButton>
                </Tooltip> */}
                {/* <Tooltip 
                  title={
                    !userData?.bloodDonor?.donate 
                      ? "Enable blood donation first" 
                      : !eligibilityInfo.eligible 
                      ? `Eligible in ${eligibilityInfo.daysLeft} days` 
                      : "Add Donation"
                  } 
                  arrow
                >
                  <span>
                    <IconButton 
                      onClick={handleOpenAddDonationDialog}
                      sx={{
                        minWidth: '40px',
                        minHeight: '40px',
                        ...getButtonStyle(darkMode, showAddDonationDialog),
                        // opacity: (!eligibilityInfo.eligible || !userData?.bloodDonor?.donate) ? 0.5 : 1,
                      }}
                      // disabled={!eligibilityInfo.eligible || !userData?.bloodDonor?.donate}
                    >
                      <PlaylistAddRounded />
                    </IconButton>
                  </span>
                </Tooltip> */}
              </Box>
            </Box>
            <Box sx={{display: 'flex', gap:'8px', flexDirection: 'column', borderRadius: '12px'}}>
              <Box sx={{ 
                // mb: 3, 
                // p: 2, 
                // borderRadius: '12px',
                // background: darkMode 
                //   ? 'rgba(255, 255, 255, 0.05)' 
                //   : 'rgba(67, 97, 238, 0.05)',
                // border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(67, 97, 238, 0.1)'}`
              }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }} >
                  {userData?.bloodDonor?.donate === true
                    ? "🎉 You're a registered blood donor — thank you for being a lifesaver!"
                    : userData?.bloodDonor?.donate === false
                    ? "🔒 Blood donation is currently disabled"
                    : "ℹ️ You haven't set your donation preference yet"}
                </Typography>
                {userData?.bloodDonor?.bloodGroup && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 1.5 }}>
                  <Chip 
                    label={`🩸 ${userData?.bloodDonor?.bloodGroup || 'Unknown'}`}
                    // color="error"
                    size="small" variant="filled"
                    // sx={{ fontWeight: 'bold' }}
                    sx={{ 
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                      color: 'white',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(238, 90, 82, 0.4)',
                      }
                    }}
                  />
                  {userData?.bloodDonor?.donationCount > 0 && (
                    <Chip
                      label={`🏆 ${userData.bloodDonor.donationCount} Donation${userData.bloodDonor.donationCount > 1 ? 's' : ''}`}
                      variant="filled"
                      size="small"
                      sx={{ 
                        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                        color: 'white',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(46, 125, 50, 0.4)',
                        }
                      }}
                    />
                  )}
                  {!eligibilityInfo.eligible && (
                    <Chip
                      label={`⏳ Eligible in ${eligibilityInfo.daysLeft} days`}
                      variant="filled"
                      size="small"
                      sx={{ 
                        background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                        color: 'white',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(245, 124, 0, 0.4)',
                        }
                      }}
                    />
                  )}
                </Box>
                )}
                <Typography variant="body2" color="textSecondary">
                  📅 Last donated: {userData?.bloodDonor?.lastDonated 
                    ? formatDonateDate(userData.bloodDonor.lastDonated) 
                    : 'No donation history yet'}
                </Typography>
              </Box>
              {userData?.bloodDonor?.donate === true && (userData?.bloodDonor?.contactWay?.phone || userData?.bloodDonor?.contactWay?.email || (userData?.bloodDonor?.contactWay?.socialMedia && userData?.bloodDonor?.contactWay?.socialMedia?.length > 0)) && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle1" color="textSecondary" style={{ fontWeight: 500 }}>
                  Contact Medium:
                </Typography>
                {(userData?.bloodDonor?.contactWay?.phone || userData.bloodDonor.contactWay.email) && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    {userData.bloodDonor.contactWay.phone && (
                      <Chip
                        key="phone"
                        label={`📱 ${userData.bloodDonor.contactWay.phone}`}
                        variant="outlined"
                        size="small"
                        onClick={() => window.open(`tel:${userData.bloodDonor.contactWay.phone}`)}
                        sx={{ 
                          borderColor: '#4CAF50',
                          color: '#4CAF50',
                          '&:hover': {
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            borderColor: '#388E3C',
                            cursor: 'pointer',
                          }
                        }}
                      />
                    )}
                    {userData.bloodDonor.contactWay.email && (
                      <Chip
                        key="email"
                        label={`✉️ ${userData.bloodDonor.contactWay.email}`}
                        variant="outlined"
                        size="small"
                        onClick={() => window.open(`mailto:${userData.bloodDonor.contactWay.email}`)}
                        sx={{ 
                          borderColor: '#2196F3',
                          color: '#2196F3',
                          '&:hover': {
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            borderColor: '#1976D2',
                            cursor: 'pointer',
                          }
                        }}
                      />
                    )}
                  </Box>
                )}
                {userData?.bloodDonor?.contactWay?.socialMedia && userData.bloodDonor.contactWay.socialMedia.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      Connect via social media:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {userData.bloodDonor.contactWay.socialMedia.map((social, index) => {
                        const platform = detectSocialPlatform(social.url || social.platform);
                        const platformData = SOCIAL_MEDIA_PLATFORMS[platform] || SOCIAL_MEDIA_PLATFORMS.other;
                        
                        return (
                          <Chip
                            key={index}
                            icon={getSocialIcon(platform, 'small', platformData.color)}
                            label={social.platform || platformData.label}
                            variant="filled"
                            size="small"
                            onClick={() => handleSocialChipClick(social.url, platform)}
                            sx={{ 
                              backgroundColor: platformData.color,
                              color: 'white',
                              fontWeight: 500, p: 0.5,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: platformData.color,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 12px ${platformData.color}80`,
                                cursor: 'pointer',
                              },
                              '&:active': {
                                transform: 'translateY(0)',
                              }
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </Box>
              )}
              {userData?.bloodDonor?.bloodGroup && (
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', px: 1 }}>
                <Button
                  variant="outlined" fullWidth={isMobile}
                  onClick={handleOpenAddDonationDialog}
                  // disabled={!eligibilityInfo.eligible || !userData?.bloodDonor?.donate}
                  startIcon={<PlaylistAddRounded />}
                  sx={{ borderRadius: '12px', textTransform: 'none',
                    color: '#4361ee',
                    background: 'none',
                    border: '1px solid #4361ee',
                    transition: 'all 0.3s ease',
                    // boxShadow: '0 4px 20px rgba(67, 97, 238, 0.3)',
                    '&:hover': {
                      background: 'none',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 25px rgba(67, 97, 238, 0.4)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    '&.Mui-disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)',
                    },
                   }}
                >
                  Add Donation Memory
                </Button>
                <Button
                  variant="outlined" fullWidth={isMobile}
                  startIcon={<CollectionsBookmarkRounded />}
                  onClick={handleOpenDonationHistory}
                  sx={{ borderRadius: '12px', textTransform: 'none',
                    color: '#4361ee',
                    background: 'none',
                    border: '1px solid #4361ee',
                    transition: 'all 0.3s ease',
                    // boxShadow: '0 4px 20px rgba(67, 97, 238, 0.3)',
                    '&:hover': {
                      background: 'none',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 25px rgba(67, 97, 238, 0.4)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    '&.Mui-disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)',
                    },
                   }}
                >
                  View Donation Memories
                </Button>
                <Button
                  variant="outlined" fullWidth={isMobile}
                  startIcon={<NewReleasesRounded />}
                  onClick={handleOpenBloodRequests}
                  sx={{ borderRadius: '12px', textTransform: 'none',
                    color: '#4361ee',
                    background: 'none',
                    border: '1px solid #4361ee',
                    transition: 'all 0.3s ease',
                    // boxShadow: '0 4px 20px rgba(67, 97, 238, 0.3)',
                    '&:hover': {
                      background: 'none',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 25px rgba(67, 97, 238, 0.4)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    '&.Mui-disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)',
                    },
                   }}
                >
                  View Blood Requests 
                  {pendingRequestsCount > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: 'error.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {pendingRequestsCount}
                    </Box>
                  )}
                </Button>
              </Box>)}
              <Typography variant="caption" color="text.secondary" sx={{ 
                display: 'block',
                // mt: 3,
                pt: 2,
                // borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                fontSize: '0.75rem',
                lineHeight: 1.4
              }}>
                ⚠️ Note: When you enable blood donation, your blood group and contact information 
                will be visible to nearby people in need of emergency blood support. 
                You can update your privacy settings anytime.
              </Typography>
            </Box>
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
        fullWidth fullScreen={isMobile}
        aria-labelledby="edit-profile-dialog-title"
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
              // onChange={handleProfileChange}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  handleProfileChange(e);
                }
              }}
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
                  // backgroundColor: '#ffffff',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#5f6368',
                },
              }}
              inputProps={{ maxLength: 100 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0, display: 'block' }}>
              {profileForm?.profileDescription?.length}/100 characters
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" gutterBottom>Interests</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {profileForm?.interests?.length}/10 added
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1}}>
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
              </Box>
              {/* <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
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
              </Box> */}
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

      {/* Edit Blood donation Dialog */}
      <Dialog
        open={showEditDonorDialog}
        onClose={() => setShowEditDonorDialog(false)}
        maxWidth="xs"
        fullWidth fullScreen={isMobile}
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
        <DialogTitle>Edit Blood Donation Information</DialogTitle>
        <DialogContent>
          <Box >
            <Box >
              <Box sx={{ p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={500}>
                    {bloodData.donate
                      ? "You're donating blood — thank you for helping others!"
                      : "Would you like to become a blood donor?"}
                  </Typography>

                  <Switch
                    checked={bloodData.donate}
                    onChange={toggleBloodDonate}
                    color="primary"
                  />
                </Box>

                {bloodData.donate && (
                  <FormControl fullWidth required sx={{ mt: 2 }}>
                    <InputLabel>Blood Group</InputLabel>
                    <Select
                      value={bloodData.bloodGroup || ''}
                      onChange={(e) =>
                        setBloodData({ ...bloodData, bloodGroup: e.target.value })
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

              {/* Contact Information */}
              {bloodData.donate &&
              <Box sx={{ p: 2, mt: 2, bgcolor: 'rgba(25, 210, 34, 0.05)', borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={500} gutterBottom>
                  Contact Medium
                </Typography>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  type="number"
                  value={bloodData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setBloodData(prev => ({ ...prev, phone: value }));
                    }
                  }}
                  margin="normal"
                  // size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                    inputProps: { 
                      style: { paddingLeft: 8 }, 
                      maxLength: 10 // restrict to 10 digits after +91 if needed
                    },
                  }}
                  placeholder="Enter 10-digit phone number"
                  helperText="Optional - Only visible to verified users"
                  // sx={{ mb: 2 }}
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
                  value={bloodData.email}
                  onChange={handleBloodDataChange}
                  margin="normal"
                  placeholder="your.email@example.com"
                  helperText="Optional - For emergency contact"
                  // required
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
                {/* Social Media Links Section */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                    Social Media Links (Optional)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" paragraph>
                    Add links to your social media profiles for easier communication
                  </Typography>

                  {/* Add Social Media Link Form */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', flexDirection: 'column' }}>
                    <FormControl sx={{ minWidth: 150, flex: 1, borderRadius: 2 }}>
                      <InputLabel id="platform-label">Platform</InputLabel>
                      <Select
                        labelId="platform-label"
                        id="platform-select"
                        value={newSocialLink.platformId}
                        onChange={(e) => handlePlatformChange(e.target.value)}
                        label="Platform" 
                        // size="small"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">
                          <em>Select Platform</em>
                        </MenuItem>
                        {SOCIAL_MEDIA_OPTIONS.map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      label="URL"
                      value={newSocialLink.url}
                      onChange={handleSocialUrlChange}
                      placeholder={
                        SOCIAL_MEDIA_OPTIONS.find(opt => opt.id === newSocialLink.platformId)?.placeholder || 
                        'Enter full URL (https://...)'
                      }
                      // size="small"
                      InputProps={{
                        startAdornment: newSocialLink.url.startsWith('http') ? null : (
                          <InputAdornment position="start">https://</InputAdornment>
                        )
                      }}
                      sx={{ minWidth: 150, flex: 2, borderRadius: 2,
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

                    <Button
                      variant="contained"
                      onClick={addSocialLink}
                      startIcon={<AddRounded />}
                      disabled={!newSocialLink.platformId || !newSocialLink.url.trim()}
                      sx={{ borderRadius: 2 }}
                    >
                      Add
                    </Button>
                  </Box>

                  {/* Display Added Social Media Links */}
                  {bloodData.socialMedia.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Added Links ({bloodData.socialMedia.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {bloodData.socialMedia.map((link, index) => (
                          <Chip
                            key={index} fullWidth
                            label={`${link.platform}: ${link.url.substring(0, 20)}...`}
                            onDelete={() => removeSocialLink(index)}
                            // deleteIcon={<Close />}
                            sx={{
                              borderRadius: '8px',
                              // maxWidth: 200,
                              '& .MuiChip-label': {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Tip: Add WhatsApp or Telegram links for instant communication during emergencies
                  </Typography>
                </Box>
              </Box>
              }
            </Box>
          </Box>
        </DialogContent>
        {error && <Alert  
            sx={{ mx: 2 , borderRadius: '12px', color: darkMode ? 'error.contrastText' : 'text.primary', border: darkMode ? '1px solid rgba(244, 67, 54, 0.3)' : '1px solid rgba(244, 67, 54, 0.2)', boxShadow: darkMode ? '0 2px 8px rgba(244, 67, 54, 0.15)' : '0 2px 8px rgba(244, 67, 54, 0.1)', }} 
          severity="error">{error}</Alert>}
        <DialogActions sx={{p: 2}}>
          
          <Button sx={{borderRadius: '12px', textTransform: 'none'}} onClick={() => setShowEditDonorDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateBloodData} 
            variant="contained"
            disabled={updating}
            sx={{
              textTransform:'none', borderRadius: '12px'
            }}
          >
            {updating ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <AddBloodDonationDataDialog
        open={showAddDonationDialog}
        onClose={() => setShowAddDonationDialog(false)}
        userData={userData}
        onDonationAdded={handleDonationAdded}
      />

      {/* Blood Donation Requests Dialog */}
      <BloodDonationRequestsDialog
        open={showBloodRequestsDialog}
        onClose={() => setShowBloodRequestsDialog(false)}
        requests={bloodRequests}
        loading={loadingRequests}
        onUpdateStatus={handleUpdateRequestStatus}
        isMobile={isMobile}
        darkMode={darkMode}
      />

      {/* Blood Donation History Dialog */}
      <BloodDonationHistoryDialog
        open={showDonationHistoryDialog}
        onClose={() => setShowDonationHistoryDialog(false)}
        donationHistory={donationHistory}
        loading={loadingHistory}
        isMobile={isMobile}
        darkMode={darkMode}
      />

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

      {/* Followers/Following Dialog */}
      <FollowDialog
        open={followDialogOpen}
        onClose={() => setFollowDialogOpen(false)}
        userId={id}
        followType={followType}
        onUserClick={handleUserClick}
        darkMode={darkMode}
        isMobile={isMobile}
      />

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
        userId={selectedUser?._id || id}
        open={userProfileDetailsOpen || isRateDialogOpen}
        onClose={() => {
          setUserProfileDetailsOpen(false);
          setSelectedUser(null);
          setRateDialogOpen(false);
          if (isRateDialogOpen) handleCloseRateDialog();
        }}
        // post={post}
        isMobile={isMobile}
        isAuthenticated={isAuthenticated} 
        setLoginMessage={setLoginMessage}  
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
      <TermsPolicyBar darkMode={darkMode}/>
    </Layout>
  );
};

export default UserProfile;
