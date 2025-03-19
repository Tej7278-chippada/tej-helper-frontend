// /src/components/Register.js
import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Alert, useMediaQuery, ThemeProvider, createTheme, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, IconButton, MenuItem } from '@mui/material';
import axios from 'axios';
import Layout from './Layout';
import Cropper from 'react-easy-crop';
import PasswordRoundedIcon from '@mui/icons-material/PasswordRounded';
import PinOutlinedIcon from '@mui/icons-material/PinOutlined';

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", 
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Lakshadweep", "Puducherry"
];

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm')); // Media query for small screens
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(null); // State for profile picture
  const [croppedImage, setCroppedImage] = useState(null);
  const [cropDialog, setCropDialog] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [profilePicError, setProfilePicError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State to toggle password visibility
  const [pincodeValidation, setPincodeValidation] = useState('');
  const [address, setAddress] = useState({ street: '', area: '', city: '', state: '', pincode: '' });

  const handleCropComplete = async (_, croppedAreaPixels) => {
    if (!profilePic) return; // Ensure profilePic is set before proceeding
    const canvas = document.createElement('canvas');
    const image = new Image();
    // Create an object URL for the image file
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
        // Check if the blob is a valid object before creating a URL
        if (blob) {
          setCroppedImage(URL.createObjectURL(blob));
        }
      });
    };
  };

  const handleReplaceImage = () => {
    setCroppedImage(null);
    setProfilePic(null);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // setCroppedImage(null);
    setPincodeValidation(''); // Reset pincode validation message

    // Validate username and password
    const usernameRegex = /^[A-Z][A-Za-z0-9@_-]{5,}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*@).{8,}$/;

    if (!usernameRegex.test(username)) {
      setError(
        'Username must start with a capital letter, be at least 6 characters long, contain at least one number, and can include @ _ - and spaces not allowed.'
      );
      setLoading(false);
      return;
    }

    if (!passwordRegex.test(password)) {
      setError(
        'Password must be at least 8 characters long, contain at least one letter, one number, and include @.'
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirm password does not match.');
      setLoading(false);
      return;
    }

    // Email validation
    if (!email.includes('@') || !email.endsWith('.com')) {
      setError('Invalid mail id.');
      setLoading(false);
      return;
    }

    // Phone validation
    if (!phone) {
      setError('Phone number is required.');
      setLoading(false);
      return;
    }

    // Phone validation
    if (phone.length < 10 || !/^\d+$/.test(phone)) {
      setError('Invalid mobile number.');
      setLoading(false);
      return;
    }

    if (Object.values(address).some((field) => field.trim() === '')) {
      setError('All address fields (street, area, city, state, pincode) are required.');
      setLoading(false);
      return;
    }

    // Fetch user's IP address
    const ipResponse = await axios.get('https://api64.ipify.org?format=json');
    const userIP = ipResponse.data.ip;

    // Fetch user's location based on IP
    const locationResponse = await axios.get(`https://ipapi.co/${userIP}/json/`);
    const { city, region, country_name, latitude, longitude } = locationResponse.data;

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('address', JSON.stringify(address));
    formData.append('ip', userIP);
    formData.append('location', JSON.stringify({ city, region, country_name, latitude, longitude }));

    if (croppedImage) {
      const blob = await fetch(croppedImage).then(r => r.blob());
      formData.append('profilePic', blob, 'profilePic.jpg');
    }

    try {                             // 'http://localhost:5002/api/auth/register' 'https://tej-chat-app-8cd7e70052a5.herokuapp.com/api/auth/register'
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      setSuccess(`Your new account has been created with username ${username} and linked to email ${email}`);
      setUsername('');
      setProfilePic(null);
      setCroppedImage(null);
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setAddress({ street: '', area: '', city: '', state: '', pincode: '' });
      if (response.status === 201) {
        // window.location.href = '/login';
      }
    } catch (error) {
      setError(error.response.data.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      setProfilePicError('Profile pic must be under 2MB size.');
      return;
    }
    setProfilePic(file);
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle password visibility
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleAddressChange = (field, value) => {
    setAddress((prevAddress) => ({ ...prevAddress, [field]: value }));
  };

  const validatePincode = async (pincode) => {
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      if (response.data[0].Status === 'Success') {
        const place = response.data[0].PostOffice[0].Name;
        const state = response.data[0].PostOffice[0].State;
        const district = response.data[0].PostOffice[0].District;
        setPincodeValidation(`Matched: ${place}`);
        handleAddressChange('state', state);
        handleAddressChange('city', district);
        handleAddressChange('area', place);
      } else {
        setPincodeValidation('Pincode doesn\'t match. Please verify it once.');
      }
    } catch {
      setPincodeValidation('Error validating pincode.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Layout>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="70vh"
          padding={isMobile ? 2 : 4} // Adjust padding for mobile
        >
          <Typography variant={isMobile ? "h5" : "h5"} gutterBottom>
            Create New Account
          </Typography>
          <form onSubmit={handleRegister} style={{ maxWidth: '400px', width: '100%' }}>
            <Box textAlign="center" paddingTop={3} mb={2} >
              {croppedImage ? (
                <div>
                  <img
                    src={croppedImage}
                    alt="Cropped Profile"
                    style={{ width: '180px', height: '180px', borderRadius: '50%', cursor: 'pointer' }}
                    onClick={() => setCropDialog(true)}
                  />
                  <Typography variant="body2">Your Profile Pic</Typography>
                </div>
              ) : (
                <div>
                  <img
                    src="https://placehold.co/400?text=Add+Photo"
                    alt="Dummy Profile"
                    style={{ width: '180px', height: '180px', borderRadius: '50%', cursor: 'pointer' }}
                    onClick={() => setCropDialog(true)}
                  />
                  <Typography variant="body2">Add Profile Pic</Typography>
                </div>
              )}
              {/* <Typography variant="body2">Profile Pic</Typography> */}
            </Box>
            <Dialog open={cropDialog} onClose={() => setCropDialog(false)} fullWidth maxWidth="sm">
              <DialogTitle>Crop and Upload Picture</DialogTitle>
              <DialogContent sx={{ minHeight: '250px' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ marginTop: 10 }}
                />
                {profilePic ? (
                  <Cropper
                    image={URL.createObjectURL(profilePic)}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                  />
                ) : (
                  <Typography variant="body2" textAlign="center">
                    Please select an image to upload.
                    {profilePicError && <Alert severity="error">{profilePicError}</Alert>}
                  </Typography>
                )}


              </DialogContent>
              <DialogActions>
                {croppedImage && (
                  <Button color="secondary" onClick={handleReplaceImage}>
                    Delete
                  </Button>
                )}
                <Button onClick={() => setCropDialog(false)}>Cancel</Button>
                <Button variant="contained"
                  onClick={() => {
                    setCropDialog(false);
                  }}
                  disabled={!croppedImage}
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>
            <TextField
              label="Username (Format ex: Abc1234)"
              variant="outlined"
              fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px',} , '& .MuiInputBase-input': { padding: '14px 14px', },}}
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField label="Email" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px',}, '& .MuiInputBase-input': { padding: '14px 14px', },}} margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField label="Phone" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px',}, '& .MuiInputBase-input': { padding: '14px 14px', },}} margin="normal" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'} // Toggle between text and password
              variant="outlined"
              fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px',}, '& .MuiInputBase-input': { padding: '14px 14px', },}}
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: isMobile && ( // Only show on desktop screens
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <PasswordRoundedIcon /> : <PinOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'} // Toggle between text and password
              variant="outlined"
              fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px',}, '& .MuiInputBase-input': { padding: '14px 14px', },}}
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                endAdornment: isMobile && ( // Only show on desktop screens
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <PasswordRoundedIcon /> : <PinOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Pincode"
              fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px',}, '& .MuiInputBase-input': { padding: '14px 14px', },}}
              margin="normal"
              value={address.pincode}
              onChange={(e) => {
                handleAddressChange('pincode', e.target.value);
                validatePincode(e.target.value);
              }}
            />
            {pincodeValidation && <Typography variant="body2">{pincodeValidation}</Typography>}
            <TextField
              label="Street"
              variant="outlined"
              fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px',}, '& .MuiInputBase-input': { padding: '14px 14px', },}}
              margin="normal"
              value={address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
            />
            <TextField
              label="Area"
              variant="outlined"
              fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px',}, '& .MuiInputBase-input': { padding: '14px 14px', },}}
              margin="normal"
              value={address.area}
              onChange={(e) => handleAddressChange('area', e.target.value)}
            />
            <TextField
              label="City"
              variant="outlined"
              fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px',}, '& .MuiInputBase-input': { padding: '14px 14px', },}}
              margin="normal"
              value={address.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
            />
            
            <TextField
              select
              label="State"
              fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px',}, '& .MuiInputBase-input': { padding: '14px 14px', },}}
              margin="normal"
              value={address.state}
              onChange={(e) => handleAddressChange('state', e.target.value)}
            >
              {indianStates.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </TextField>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <Button type="submit" sx={{marginTop:'1rem', borderRadius:'12px'}} variant="contained" color="primary" fullWidth disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
            <Typography variant="body2" align="center" sx={{ marginTop: '10px' }}>
              Already have an account?{' '}
              <Button href="/login" variant="text" sx={{borderRadius:'12px'}}>
                Login
              </Button>
            </Typography>
          </form>
        </Box>
      </Layout>
    </ThemeProvider>
  );
};

export default Register;
