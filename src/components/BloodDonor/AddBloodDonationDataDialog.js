// src/components/BloodDonor/AddBloodDonationDataDialog.js
import React, { useEffect, useState } from 'react';
import { 
  Dialog, DialogContent, Typography, TextField, Button, 
  IconButton, CircularProgress, Box, useMediaQuery, Card, 
  CardContent, Avatar, Alert, DialogTitle, DialogActions, 
  Snackbar, FormControl, InputLabel, Select, MenuItem,
  Divider
} from '@mui/material';
import { useTheme } from '@emotion/react';
import {
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  CalendarMonthRounded
} from '@mui/icons-material';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import { addBloodDonation } from '../api/api';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function AddBloodDonationDataDialog({ open, onClose, userData, onDonationAdded }) {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [formData, setFormData] = useState({ 
    notes: '', 
    media: null, 
    latitude: '',
    longitude: '',
    address: '',
    donatedAt: new Date()
  });
  const [newMedia, setNewMedia] = useState([]);
  const [mediaError, setMediaError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [eligibilityInfo, setEligibilityInfo] = useState(null);

  // Check eligibility when dialog opens
  useEffect(() => {
    if (open && userData?.bloodDonor?.lastDonated) {
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
    }
  }, [open, userData]);

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
          (resizedBlob) => {
            resolve(resizedBlob);
          },
          "image/jpeg",
          0.8
        );
      };
    });
  };

  const handleRemoveNewMedia = (index) => {
    setNewMedia((prev) => {
      const updatedMedia = prev.filter((_, i) => i !== index);
      const updatedTotalMedia = updatedMedia.length;

      if (updatedTotalMedia <= 3) {
        setMediaError("");
      }

      return updatedMedia;
    });
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    const resizedFiles = [];

    for (const file of selectedFiles) {
      if (file.size > 2 * 1024 * 1024) {
        const resizedBlob = await resizeImage(file, 2 * 1024 * 1024);
        const resizedFile = new File([resizedBlob], file.name, { type: file.type });
        resizedFiles.push(resizedFile);
      } else {
        resizedFiles.push(file);
      }
    }

    const totalMediaCount = resizedFiles.length + newMedia.length;

    if (totalMediaCount > 3) {
      setMediaError("Maximum 3 photos allowed.");
      setSnackbar({ open: true, message: 'Maximum 3 photos allowed.', severity: 'warning' });
    } else {
      setMediaError("");
      setNewMedia((prevMedia) => [...prevMedia, ...resizedFiles]);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          
          // Reverse geocode to get address (you can implement this with a geocoding API)
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
            .then(response => response.json())
            .then(data => {
              if (data.display_name) {
                setFormData(prev => ({
                  ...prev,
                  address: data.display_name
                }));
              }
            })
            .catch(error => console.error('Geocoding error:', error));
        },
        (error) => {
          console.error('Error getting location:', error);
          setSnackbar({
            open: true,
            message: 'Could not get your location. Please enter manually.',
            severity: 'warning'
          });
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check eligibility
    if (eligibilityInfo && !eligibilityInfo.eligible) {
      setSnackbar({
        open: true,
        message: `You can donate again in ${eligibilityInfo.daysLeft} days.`,
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    const data = new FormData();

    // Add media files
    newMedia.forEach((file) => data.append('media', file));
    
    // Add other form data
    data.append('notes', formData.notes);
    data.append('donatedAt', formData.donatedAt.toISOString());
    
    if (formData.latitude && formData.longitude) {
      data.append('latitude', formData.latitude);
      data.append('longitude', formData.longitude);
      if (formData.address) {
        data.append('address', formData.address);
      }
    }

    try {
      const response = await addBloodDonation(data);
      // setSnackbar({ 
      //   open: true, 
      //   message: 'Blood donation recorded successfully!', 
      //   severity: 'success' 
      // });
      
      // Notify parent component
      if (onDonationAdded) {
        onDonationAdded(response.data.user, response.data.donation);
      }
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        onClose();
        // Reset form
        setFormData({ 
          notes: '', 
          media: null, 
          latitude: '',
          longitude: '',
          address: '',
          donatedAt: new Date()
        });
        setNewMedia([]);
      }, 2000);
      
    } catch (error) {
      console.error("Error submitting blood donation:", error);
      const errorMsg = error.response?.data?.message || 'Failed to submit donation data';
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : 'Not available';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth 
        fullScreen={isMobile}
        sx={{
          m: '12px',
          '& .MuiPaper-root': {
            borderRadius: '14px',
            backdropFilter: 'blur(12px)',
          },
        }}
      >
        <DialogTitle sx={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: '0.5rem',
              right: '1rem',
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6">Record Blood Donation</Typography>
          
          {/* Eligibility Banner */}
          {/* {eligibilityInfo && (
            <Alert 
              severity={eligibilityInfo.eligible ? "success" : "warning"}
              sx={{ mt: 2 }}
            >
              {eligibilityInfo.eligible ? (
                "You are eligible to donate blood today!"
              ) : (
                `You can donate again in ${eligibilityInfo.daysLeft} days. Last donation: ${formatDate(eligibilityInfo.lastDonationDate)}`
              )}
            </Alert>
          )} */}
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Donation helps save lives. Please provide accurate information.
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ position: 'sticky', height: 'auto' }}>
          {/* Date Picker */}
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="subtitle2" mb={2} gutterBottom>
              <CalendarMonthRounded sx={{ verticalAlign: 'middle', mr: 1 }} />
              Donation Date: {<strong>{formatDate(formData.donatedAt)}</strong>}
            </Typography>
            <DatePicker
              label="When did you donate?"
              value={formData.donatedAt}
              onChange={(newDate) => setFormData({ ...formData, donatedAt: newDate })}
              maxDate={new Date()}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  sx={{ mt: 1 }}
                />
              )}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Box>
          
          {/* <Divider sx={{ my: 2 }} /> */}
          
          {/* Location Section */}
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.1)', mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <LocationIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  Donation Location
                </Typography>
              </Box>
              
              <Button
                variant="outlined"
                onClick={getCurrentLocation}
                startIcon={<LocationIcon />}
                sx={{ borderRadius: 2, mb: 2, textTransform: 'none' }}
                fullWidth={isMobile}
              >
                Use Current Location
              </Button>
              
              {/* <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  fullWidth
                  placeholder="e.g., 28.7041"
                />
                <TextField
                  label="Longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  fullWidth
                  placeholder="e.g., 77.1025"
                />
              </Box> */}
              
              <TextField
                label="Address (Optional)"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                fullWidth
                multiline
                rows={isMobile ? 3 : 2}
                placeholder="Hospital name, city, etc."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Location helps to intract with nearby blood donation camps and organizations.
              </Typography>
            </CardContent>
          </Card>
          
          {/* Photo Upload Section */}
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <PhotoCameraIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  Memories of Donation (Optional)
                </Typography>
              </Box>
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<AddPhotoAlternateRoundedIcon />}
                sx={{ borderRadius: 2, mb: 2, bgcolor: 'rgba(24, 170, 248, 0.07)', textTransform: 'none' }}
                fullWidth={isMobile}
                disabled={newMedia.length >= 3}
              >
                Add Photos {newMedia.length > 0 && `(${newMedia.length}/3)`}
                <input 
                  type="file" 
                  multiple 
                  hidden 
                  onChange={handleFileChange} 
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  disabled={newMedia.length >= 3}
                />
              </Button>
              
              {mediaError && <Alert severity="error" sx={{ mb: 2 }}>{mediaError}</Alert>}
              
              <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                Upload photos of donation certificate, bandage, or blood bag.
                Maximum 3 photos. Supported formats: PNG, JPG, JPEG, WebP
              </Typography>
              
              {newMedia.length > 0 && (
                <Box sx={{ 
                  display: 'flex', 
                  gap: '4px', 
                  p: '0px', 
                  borderRadius: '8px', 
                  overflowX: 'auto',
                  scrollbarWidth: 'thin'
                }}>
                  {newMedia.map((file, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      position: 'relative', 
                      flexDirection: 'column' 
                    }}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        style={{
                          height: '120px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />
                      <IconButton
                        size="small" 
                        onClick={() => handleRemoveNewMedia(index)}
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
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <TextField
            label="Additional Notes (Optional)"
            placeholder="E.g., Any side effects, location details, etc."
            fullWidth
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => {
              const maxLength = 500;
              if (e.target.value.length <= maxLength) {
                setFormData({ ...formData, notes: e.target.value });
              }
            }}
            inputProps={{ maxLength: 500 }}
            sx={{
              mt: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                bgcolor: theme.palette.background.paper,
              },
            }}
            helperText={`${formData.notes.length}/500 characters`}
          />
          
          {/* Information Banner */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Note:</strong> Minimum gap between donations: 56 days
               {/* Your donation will be marked as "unverified" initially. 
              It may be verified by administrators or through uploaded proof. */}
            </Typography>
          </Alert>
        </DialogContent>
        
        <DialogActions sx={{ 
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', 
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* <Typography variant="caption" color="text.secondary">
            Minimum gap between donations: 56 days
          </Typography> */}
          
          {/* <Box sx={{ display: 'flex', gap: 1 }}> */}
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{ borderRadius: 2, textTransform: 'none' }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              sx={{ borderRadius: 2, textTransform: 'none' }}
              disabled={loading || (!eligibilityInfo?.eligible && userData?.bloodDonor?.lastDonated)}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Donation'}
            </Button>
          {/* </Box> */}
        </DialogActions>
        
        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Dialog>
    </LocalizationProvider>
  );
}

export default AddBloodDonationDataDialog;