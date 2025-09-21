// /src/components/Register.js
import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Alert, useMediaQuery, ThemeProvider, createTheme, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, IconButton, MenuItem, Paper } from '@mui/material';
import axios from 'axios';
import Layout from './Layout';
import Cropper from 'react-easy-crop';
import PasswordRoundedIcon from '@mui/icons-material/PasswordRounded';
import PinOutlinedIcon from '@mui/icons-material/PinOutlined';
import CloseIcon from '@mui/icons-material/Close';
import GoogleOAuth from './GoogleOAuth/GoogleOAuth';
import TermsPolicyBar from './TermsAndPolicies/TermsPolicyBar';

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

// Custom glassmorphism styling
const getGlassmorphismStyle = (theme, darkMode) => ({
  background: darkMode 
    ? 'rgba(205, 201, 201, 0.15)' 
    : 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  border: darkMode 
    ? '1px solid rgba(255, 255, 255, 0.1)' 
    : '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: darkMode 
    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
});

// const indianStates = [
//   "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
//   "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
//   "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
//   "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", 
//   "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", 
//   "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
//   "Delhi", "Lakshadweep", "Puducherry"
// ];

const Register = ({ darkMode, toggleDarkMode, unreadCount, shouldAnimate }) => {
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
  // const [profilePicError, setProfilePicError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State to toggle password visibility
  // const [pincodeValidation, setPincodeValidation] = useState('');
  // const [address, setAddress] = useState({ street: '', area: '', city: '', state: '', pincode: '' });
  // const [ loadingImg, setLoadingImg ] = useState(false);
  const [ finalPic, setFinalPic ] = useState(null);

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
        try {
          if (blob) {
            setCroppedImage(URL.createObjectURL(blob));
            const croppedImg = (blob.size / (1024 * 1024)).toFixed(2);
          }
        } catch (error) {
          console.log('error in cropping image', error);
        }
      }, 'image/jpeg', 0.8); // <-- compress to JPEG at 80% quality
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
    // setPincodeValidation(''); // Reset pincode validation message

    // Validate username and password
    // Username rules:
    // - Start with a capital letter
    // - Length: 6 to 12 characters total
    // - Can include letters, numbers, @ _ -
    // - Must contain at least one number
    const usernameRegex = /^[A-Z][A-Za-z0-9@_-]{5,11}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*@).{8,}$/;

    if (!usernameRegex.test(username)) {
      setError(
        'Username must start with a capital letter, be 6–12 characters long, contain at least one number, and can include @ _ - and spaces not allowed.'
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
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError('Invalid mobile number.');
      setLoading(false);
      return;
    }

    // if (Object.values(address).some((field) => field.trim() === '')) {
    //   setError('All address fields (street, area, city, state, pincode) are required.');
    //   setLoading(false);
    //   return;
    // }

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
    // formData.append('address', JSON.stringify(address));
    formData.append('ip', userIP);
    formData.append('location', JSON.stringify({ city, region, country_name, latitude, longitude }));

    if (finalPic) {
      const blob = await fetch(finalPic).then(r => r.blob());
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
      setFinalPic(null);
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      // setAddress({ street: '', area: '', city: '', state: '', pincode: '' });
      if (response.status === 201) {
        // window.location.href = '/login';
      }
    } catch (error) {
      setError(error.response.data.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

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
            // const originalSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
            // const resizedSizeMB = (resizedBlob.size / (1024 * 1024)).toFixed(2);
            // console.log(`Original size: ${originalSizeMB} MB`);
            // console.log(`Resized size: ${resizedSizeMB} MB`);
          },
          "image/jpeg",
          0.8 // Compression quality
        );
        console.log('image resized');
      };
    });
  };

  const handleFileChange = async (e) => {
    try {
      const file = e.target.files[0];
        if (file && file.size > 2 * 1024 * 1024) { // If file is larger than 2MB
          const resizedBlob = await resizeImage(file, 2 * 1024 * 1024);
          const resizedFile = new File([resizedBlob], file.name, { type: file.type });
          setProfilePic(resizedFile);
          // const resizedSizeMB = (resizedFile.size / (1024 * 1024)).toFixed(2);
          // console.log(`Resized size: ${resizedSizeMB} MB`);
        } else {
          setProfilePic(file);
        }
    } catch (error) {
      console.log('Error taking image', error);
    } 
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle password visibility
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSaveImg = () => {
    setFinalPic(croppedImage);
    setCropDialog(false);
  };

  // const handleCancelImg = () => {
  //   setProfilePic(null); 
  //   setCropDialog(false);
  // };

  // const handleChangeImg = () => {
  //   setProfilePic(null); 
  //   setCroppedImage(null);
  // };

  const handleDeleteImg = () => {
    setProfilePic(null); 
    setCroppedImage(null); 
    setFinalPic(null); 
    setCropDialog(false);
  };

  // const handleAddressChange = (field, value) => {
  //   setAddress((prevAddress) => ({ ...prevAddress, [field]: value }));
  // };

  // const validatePincode = async (pincode) => {
  //   try {
  //     const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
  //     if (response.data[0].Status === 'Success') {
  //       const place = response.data[0].PostOffice[0].Name;
  //       const state = response.data[0].PostOffice[0].State;
  //       const district = response.data[0].PostOffice[0].District;
  //       setPincodeValidation(`Matched: ${place}`);
  //       handleAddressChange('state', state);
  //       handleAddressChange('city', district);
  //       handleAddressChange('area', place);
  //     } else {
  //       setPincodeValidation('Pincode doesn\'t match. Please verify it once.');
  //     }
  //   } catch {
  //     setPincodeValidation('Error validating pincode.');
  //   }
  // };

  return (
    <ThemeProvider theme={theme}>
      <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="70vh" padding={isMobile ? 2 : 4} >
          <Typography variant={isMobile ? "h5" : "h5"} gutterBottom>
            Create New Account
          </Typography>
          <form onSubmit={handleRegister} style={{ maxWidth: isMobile ? '400px' : '600px', width: '100%' }}>
            <Box paddingTop={3} mb={2} sx={{display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'end', gap: isMobile ? 1 : 2, alignContent: 'center', textAlign: 'center', justifyContent: 'center'}}>
              {finalPic ? (
                <div>
                  <img
                    src={finalPic}
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
              <Box sx={{display: 'flow', width: '280px', maxWidth: '400px' }}>
                <Typography variant="body2" align="center" sx={{ marginTop: '10px', color: 'grey' }}>
                  Enter your unique User Name 
                </Typography>
                <TextField
                  label="Username"
                  placeholder="Format ex: Abc1234"
                  variant="outlined"
                  fullWidth 
                  // sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', }, '& .MuiInputBase-input': { padding: '14px 14px', }, maxWidth: '280px' }}
                  margin="normal"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)} required
                  sx={{ maxWidth: '280px',
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '12px',
                      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      '& fieldset': {
                        borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                        transition: 'border-color 0.3s ease',
                      },
                      '&:hover fieldset': {
                        borderColor: '#4361ee',
                        borderWidth: '1px',
                        // borderColor: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4361ee',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                      '&.Mui-focused': {
                        color: '#4361ee',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: darkMode ? '#ffffff' : '#000000',
                      '&::placeholder': {
                        color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                        opacity: 1,
                      },
                    },
                    // Fix for autofill background
                    '& input:-webkit-autofill': {
                      WebkitBoxShadow: darkMode ? '0 0 0 100px #121212 inset' : '0 0 0 100pxrgba(255, 255, 255, 0.07) inset',
                      WebkitTextFillColor: darkMode ? '#ffffff' : '#000000',
                      caretColor: darkMode ? '#ffffff' : '#000000',
                      // borderRadius: '12px',
                      // opacity: 1,
                    },
                    // '& input:-webkit-autofill:focus': {
                    //   WebkitBoxShadow: darkMode 
                    //     ? '0 0 0 100px #121212 inset, 0 0 0 2px #90caf9' 
                    //     : '0 0 0 100px #ffffff inset, 0 0 0 2px #90caf9',
                    // },
                  }}
                />
              </Box>
            </Box>

            <Dialog open={cropDialog} onClose={() => setCropDialog(false)} maxWidth="md" fullWidth fullScreen={isMobile ? true : false} sx={{ margin: '1rem',
              '& .MuiPaper-root': { // Target the dialog paper
                borderRadius: '16px', // Apply border radius
                minHeight: '500px'},  }}
            >
              <DialogTitle>
                <Typography variant="h6" color={darkMode ? 'white' : 'black'} gutterBottom>Add Profile Pic</Typography>
                <IconButton
                  onClick={() => setCropDialog(false)}
                  sx={{
                    position: 'absolute', top: 10, right: 10,
                    color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                    // backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent sx={{ minHeight: '250px' }}>
                {/* Styled Upload Button */}
                <Button 
                  variant="text"  
                  component="label" size="small"
                  sx={{ m: 1, borderRadius: "8px", textTransform: "none", bgcolor:'rgba(24, 170, 248, 0.07)' }}
                >
                  Choose Photo
                  <input 
                    type="file" 
                    hidden
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileChange}
                  />
                </Button>
                {/* <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ marginTop: 10 }}
                /> */}
                {profilePic ? (
                  <Cropper
                    image={URL.createObjectURL(profilePic)}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round" // or 'rect'
                    showGrid={false} // disable grid if desired
                    // objectFit="cover" // or 'contain'
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                    style={{
                      containerStyle: {
                        // border: '2px solid #4caf50',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        marginTop: '7rem', marginBottom:'4rem',
                      },
                      mediaStyle: {
                        filter: 'brightness(1.05) contrast(1.1)',
                        borderRadius: '16px',
                      },
                      cropAreaStyle: {
                        border: '2px dashed #2196f3',
                        borderRadius: '50%',
                      },
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="grey" textAlign="center" m="24px 6px">
                    Please select an image to upload.
                    {/* {profilePicError && <Alert severity="error">{profilePicError}</Alert>} */}
                  </Typography>
                )}


              </DialogContent>
              <DialogActions sx={{display: 'flex', justifyContent: 'space-between'}}>
                <Box sx={{display: 'flex', gap: '4px'}}>
                  {finalPic && 
                    <Button variant='contained' color="error" onClick={handleDeleteImg} sx={{borderRadius: '12px'}}>
                      Delete
                    </Button>
                  }
                  {/* {profilePic && croppedImage && (
                    <Button color="secondary" onClick={handleChangeImg} sx={{borderRadius: '12px'}}>
                      Change
                    </Button>
                  )} */}
                </Box>
                <Box sx={{display: 'flex', gap: '4px'}}>
                  {/* <Button onClick={handleCancelImg} sx={{borderRadius: '12px'}}>Cancel</Button> */}
                  <Button variant="contained"
                    onClick={handleSaveImg}
                    disabled={!profilePic} sx={{borderRadius: '12px', background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)'}}
                  >
                    Save
                  </Button>
                </Box>
              </DialogActions>
            </Dialog>

            <Paper sx={{display: 'flex', mb: 3,  p: isMobile ? 1 : 2, borderRadius: '12px', ...getGlassmorphismStyle(theme, darkMode), }}> {/* bgcolor: '#f5f5f5', */}
              <Box sx={{  p: 1, px: 2, borderRadius: '12px' }}>
                {/* <TextField
                  label="Username (Format ex: Abc1234)"
                  variant="outlined"
                  fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', }, '& .MuiInputBase-input': { padding: '14px 14px', }, }}
                  margin="normal"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)} required
                /> */}
                <TextField label="Email" fullWidth 
                  // sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', }, '& .MuiInputBase-input': { padding: '14px 14px', }, }} 
                  margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} required
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '12px',
                      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      '& fieldset': {
                        borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                        transition: 'border-color 0.3s ease',
                      },
                      '&:hover fieldset': {
                        borderColor: '#4361ee',
                        borderWidth: '1px',
                        // borderColor: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4361ee',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                      '&.Mui-focused': {
                        color: '#4361ee',
                      },
                    },
                    '& .MuiInputBase-input': { padding: '14px 14px', 
                      color: darkMode ? '#ffffff' : '#000000',
                      '&::placeholder': {
                        color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                        opacity: 1,
                      },
                    },
                    // Fix for autofill background
                    '& input:-webkit-autofill': {
                      WebkitBoxShadow: darkMode ? '0 0 0 100px #121212 inset' : '0 0 0 100pxrgba(255, 255, 255, 0.07) inset',
                      WebkitTextFillColor: darkMode ? '#ffffff' : '#000000',
                      caretColor: darkMode ? '#ffffff' : '#000000',
                      // borderRadius: '12px',
                      // opacity: 1,
                    },
                    // '& input:-webkit-autofill:focus': {
                    //   WebkitBoxShadow: darkMode 
                    //     ? '0 0 0 100px #121212 inset, 0 0 0 2px #90caf9' 
                    //     : '0 0 0 100px #ffffff inset, 0 0 0 2px #90caf9',
                    // },
                  }}
                />
                <TextField label="Phone" fullWidth type="number"
                  // sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', }, '& .MuiInputBase-input': { padding: '14px 14px', }, }}
                  margin="normal" value={phone} onChange={(e) => setPhone(e.target.value)} required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                    inputProps: { 
                      style: { paddingLeft: 8 }, 
                      maxLength: 10 // restrict to 10 digits after +91 if needed
                    },
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '12px',
                      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      '& fieldset': {
                        borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                        transition: 'border-color 0.3s ease',
                      },
                      '&:hover fieldset': {
                        borderColor: '#4361ee',
                        borderWidth: '1px',
                        // borderColor: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4361ee',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                      '&.Mui-focused': {
                        color: '#4361ee',
                      },
                    },
                    '& .MuiInputBase-input': { padding: '14px 14px', 
                      color: darkMode ? '#ffffff' : '#000000',
                      '&::placeholder': {
                        color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                        opacity: 1,
                      },
                    },
                    // Fix for autofill background
                    '& input:-webkit-autofill': {
                      WebkitBoxShadow: darkMode ? '0 0 0 100px #121212 inset' : '0 0 0 100pxrgba(255, 255, 255, 0.07) inset',
                      WebkitTextFillColor: darkMode ? '#ffffff' : '#000000',
                      caretColor: darkMode ? '#ffffff' : '#000000',
                      // borderRadius: '12px',
                      // opacity: 1,
                    },
                    // '& input:-webkit-autofill:focus': {
                    //   WebkitBoxShadow: darkMode 
                    //     ? '0 0 0 100px #121212 inset, 0 0 0 2px #90caf9' 
                    //     : '0 0 0 100px #ffffff inset, 0 0 0 2px #90caf9',
                    // },
                  }}
                />
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'} // Toggle between text and password
                  variant="outlined"
                  fullWidth 
                  // sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', }, '& .MuiInputBase-input': { padding: '14px 14px', }, }}
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: ( // Only show on mobile screens isMobile && 
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          sx={{
                            color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                          }}
                        >
                          {showPassword ? <PasswordRoundedIcon /> : <PinOutlinedIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    // style: {
                    //   // Hide default password reveal button
                    //   WebkitAppearance: 'none',
                    //   MozAppearance: 'textfield',
                    // },
                  }} required
                  sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '12px',
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    '& fieldset': {
                      borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                      transition: 'border-color 0.3s ease',
                    },
                    '&:hover fieldset': {
                      borderColor: '#4361ee',
                      borderWidth: '1px',
                      // borderColor: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#4361ee',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                    '&.Mui-focused': {
                      color: '#4361ee',
                    },
                  },
                  '& .MuiInputBase-input': { padding: '14px 14px', 
                    color: darkMode ? '#ffffff' : '#000000',
                    '&::placeholder': {
                      color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                      opacity: 1,
                    },
                  },
                  // Fix for autofill background
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: darkMode ? '0 0 0 100px #121212 inset' : '0 0 0 100pxrgba(255, 255, 255, 0.07) inset',
                    WebkitTextFillColor: darkMode ? '#ffffff' : '#000000',
                    caretColor: darkMode ? '#ffffff' : '#000000',
                    // borderRadius: '12px',
                    // opacity: 1,
                  },
                  // '& input:-webkit-autofill:focus': {
                  //   WebkitBoxShadow: darkMode 
                  //     ? '0 0 0 100px #121212 inset, 0 0 0 2px #90caf9' 
                  //     : '0 0 0 100px #ffffff inset, 0 0 0 2px #90caf9',
                  // },
                  '& input[type="password"]::-ms-reveal': {
                    display: 'none',
                  },
                  '& input[type="password"]::-webkit-credentials-auto-fill-button': {
                    display: 'none !important',
                  },
                }}
                />
                <TextField
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'} // Toggle between text and password
                  variant="outlined"
                  fullWidth 
                  // sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', }, '& .MuiInputBase-input': { padding: '14px 14px', }, }}
                  margin="normal"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{
                    endAdornment: ( // Only show on desktop screens
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleToggleConfirmPasswordVisibility}
                          edge="end"
                          sx={{
                            color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                          }}
                        >
                          {showConfirmPassword ? <PasswordRoundedIcon /> : <PinOutlinedIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }} required
                   sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '12px',
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    '& fieldset': {
                      borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                      transition: 'border-color 0.3s ease',
                    },
                    '&:hover fieldset': {
                      borderColor: '#4361ee',
                      borderWidth: '1px',
                      // borderColor: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#4361ee',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                    '&.Mui-focused': {
                      color: '#4361ee',
                    },
                  },
                  '& .MuiInputBase-input': { padding: '14px 14px', 
                    color: darkMode ? '#ffffff' : '#000000',
                    '&::placeholder': {
                      color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                      opacity: 1,
                    },
                  },
                  // Fix for autofill background
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: darkMode ? '0 0 0 100px #121212 inset' : '0 0 0 100pxrgba(255, 255, 255, 0.07) inset',
                    WebkitTextFillColor: darkMode ? '#ffffff' : '#000000',
                    caretColor: darkMode ? '#ffffff' : '#000000',
                    // borderRadius: '12px',
                    // opacity: 1,
                  },
                  // '& input:-webkit-autofill:focus': {
                  //   WebkitBoxShadow: darkMode 
                  //     ? '0 0 0 100px #121212 inset, 0 0 0 2px #90caf9' 
                  //     : '0 0 0 100px #ffffff inset, 0 0 0 2px #90caf9',
                  // },
                  '& input[type="password"]::-ms-reveal': {
                    display: 'none',
                  },
                  '& input[type="password"]::-webkit-credentials-auto-fill-button': {
                    display: 'none !important',
                  },
                }}
                />
              </Box>
              
              {/* <Box sx={{ bgcolor: 'white', p: 1, px: 2, borderRadius: '12px' }}>
                <TextField
                  label="Pincode"
                  fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', }, '& .MuiInputBase-input': { padding: '14px 14px', }, }}
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
                  fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', }, '& .MuiInputBase-input': { padding: '14px 14px', }, }}
                  margin="normal"
                  value={address.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                />
                <TextField
                  label="Area"
                  variant="outlined"
                  fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', }, '& .MuiInputBase-input': { padding: '14px 14px', }, }}
                  margin="normal"
                  value={address.area}
                  onChange={(e) => handleAddressChange('area', e.target.value)}
                />
                <TextField
                  label="City"
                  variant="outlined"
                  fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', }, '& .MuiInputBase-input': { padding: '14px 14px', }, }}
                  margin="normal"
                  value={address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                />

                <TextField
                  select
                  label="State"
                  fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', }, '& .MuiInputBase-input': { padding: '14px 14px', }, }}
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
              </Box> */}
            </Paper>

            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {error && <Alert  
                sx={{borderRadius: '12px', color: darkMode ? 'error.contrastText' : 'text.primary', border: darkMode ? '1px solid rgba(244, 67, 54, 0.3)' : '1px solid rgba(244, 67, 54, 0.2)', boxShadow: darkMode ? '0 2px 8px rgba(244, 67, 54, 0.15)' : '0 2px 8px rgba(244, 67, 54, 0.1)', }} 
              severity="error">{error}</Alert>}
              {success && <Alert
                sx={{borderRadius: '12px', color: darkMode ? 'success.contrastText' : 'text.primary', border: darkMode ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(76, 175, 80, 0.2)', boxShadow: darkMode ? '0 2px 8px rgba(76, 175, 80, 0.15)' : '0 2px 8px rgba(76, 175, 80, 0.1)',}}
              severity="success">{success}</Alert>}
              <Button type="submit" sx={{marginTop:'1rem', borderRadius:'12px', maxWidth: isMobile ? '300px' : '500px', background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)'}} variant="contained" color="primary" fullWidth disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Register'}
              </Button>
              <Typography variant="body2" align="center" sx={{ marginTop: '10px' }}>
                Already have an account?{' '}
                <Button href="/login" variant="text" sx={{borderRadius:'12px'}}>
                  Login
                </Button>
              </Typography>
            </Box>
            <GoogleOAuth setSuccess={setSuccess} setError={setError} darkMode={darkMode} />
          </form>
        </Box>
        <TermsPolicyBar darkMode={darkMode}/>
      </Layout>
    </ThemeProvider>
  );
};

export default Register;
