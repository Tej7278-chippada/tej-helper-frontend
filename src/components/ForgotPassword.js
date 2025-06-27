// components/ForgotPassword.js
import React, { useEffect, useRef, useState } from 'react';
import { TextField, Button, Alert, Typography, Box, CircularProgress, Grid, Dialog, DialogContent, DialogActions, DialogTitle } from '@mui/material';
import axios from 'axios';
// import Layout from './Layout';
// import { useNavigate } from 'react-router-dom';

const ForgotPassword = ({darkMode, forgotPasswordOpen, setForgotPasswordOpen, isMobile}) => {
  const [username, setUsername] = useState('');
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  // const navigate = useNavigate();
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef  ([]);


  useEffect(() => {
    let timer;
    if (resendDisabled && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
      setResendTimer(60); // Reset timer for the next resend
    }
    return () => clearInterval(timer);
  }, [resendDisabled, resendTimer]);

  const handleOtpChange = (event, index) => {
    const value = event.target.value;

    // Allow only digits and handle input change
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to the next input if a digit is entered
      if (value && index < otp.length - 1) {
        otpRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        otpRefs.current[index - 1].focus(); // Move back on empty backspace
      }
    }
  };

  // Regex to validate password format
  const passwordRegex = /^[A-Za-z][A-Za-z0-9@]{7,}$/;

  const handleRequestOtp = async () => {
    setLoading(true);
    try {
      // Send request to backend to initiate OTP process  // 'http://localhost:5002/api/auth/request-otp'
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/request-otp`, { username, contact });
      setSuccess('OTP sent to your email or phone number');
      setError('');
      setStep(2); // Move to the OTP verification step
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error sending OTP';
      setError(errorMessage === 'contact_not_matched' 
        ? "Entered Email or phone number doesn't match to the user's data"
        : errorMessage);
      setSuccess('');
      console.log('Error requesting otp', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/resend-otp`, { username, contact });
      setSuccess('New OTP sent to your email or phone number');
      setError('');
      setResendDisabled(true); // Disable resend button for 1 minute
    } catch (error) {
      setError(error.response?.data?.message || 'Error resending OTP');
      setSuccess('');
    }
    finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setError('New Password and Confirm Password do not match');
      return;
    }
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters, start with a letter, include at least one number, and contain @');
      return;
    }
    setLoading(true);
    try {
      // Send OTP and new password to backend for validation and password reset // 'http://localhost:5002/api/auth/reset-password'
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
        username,
        contact,
        otp: otp.join(''),
        newPassword,
      });
      setSuccess(`Your password has been reset successfully for account: ${username}`);
      setError('');
      setStep(3); // Move to success step
    } catch (error) {
      setError(error.response?.data?.message === 'otp_invalid' 
        ? 'OTP not valid, or please verify the OTP'
        : error.response?.data?.message || 'Error resetting password');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)} fullWidth /* fullScreen={isMobile ? true : false} */
        sx={{  minWidth: '350px', maxWidth: isMobile ? '400px' : '500px', margin: 'auto', '& .MuiPaper-root': { backdropFilter: 'blur(20px)',borderRadius: '16px', scrollbarWidth: 'thin', scrollbarColor: '#aaa transparent', },}}>
      <DialogTitle sx={{display: 'flex', justifyContent: 'space-between'}}>
        <Typography variant="h5" color={darkMode ? 'white' : 'black'} gutterBottom>Forgot Password</Typography>
        <Button sx={{borderRadius:'12px', ml:'auto'}} onClick={() => setForgotPasswordOpen(false)} color="secondary">Close</Button>
      </DialogTitle>
      <DialogContent sx={{scrollbarWidth:'thin', }}>
      {/* <Box display="flex" flexDirection="column" alignItems="center" margin="auto" padding={0} sx={{ gap: 2 }}> */}
      {step === 1 && (
        <>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth 
            // sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px',} , '& .MuiInputBase-input': { padding: '14px 14px', },}}
            sx={{ 
              '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.95)',
              },
              '&.Mui-focused': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 1)',
                // boxShadow: darkMode 
                //   ? '0 0 0 2px rgba(67, 97, 238, 0.3)' 
                //   : '0 0 0 2px rgba(67, 97, 238, 0.2)',
              },
              '& fieldset': {
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                transition: 'border-color 0.3s ease',
              },
              '&:hover fieldset': {
                // borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.4)',
                borderColor: '#4361ee', borderWidth: '1px',
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
            '& .MuiOutlinedInput-input': {
              color: darkMode ? '#ffffff' : '#000000',
              '&::placeholder': {
                color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                opacity: 1,
              },
            },
            }}
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Email or Phone"
            variant="outlined"
            fullWidth 
            // sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px',} , '& .MuiInputBase-input': { padding: '14px 14px', },}}
            sx={{ 
              '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.95)',
              },
              '&.Mui-focused': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 1)',
                // boxShadow: darkMode 
                //   ? '0 0 0 2px rgba(67, 97, 238, 0.3)' 
                //   : '0 0 0 2px rgba(67, 97, 238, 0.2)',
              },
              '& fieldset': {
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                transition: 'border-color 0.3s ease',
              },
              '&:hover fieldset': {
                // borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.4)',
                borderColor: '#4361ee', borderWidth: '1px',
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
            '& .MuiOutlinedInput-input': {
              color: darkMode ? '#ffffff' : '#000000',
              '&::placeholder': {
                color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                opacity: 1,
              },
            },
            }}
            margin="normal"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
          {success && <Alert severity="success" 
           sx={{ mt: 2, borderRadius: '12px', color: darkMode ? 'success.contrastText' : 'text.primary', border: darkMode ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(76, 175, 80, 0.2)', boxShadow: darkMode ? '0 2px 8px rgba(76, 175, 80, 0.15)' : '0 2px 8px rgba(76, 175, 80, 0.1)',}}
          >{success}</Alert>}
          {error && <Alert severity="error" 
           sx={{mt: 2, borderRadius: '12px', color: darkMode ? 'error.contrastText' : 'text.primary', border: darkMode ? '1px solid rgba(244, 67, 54, 0.3)' : '1px solid rgba(244, 67, 54, 0.2)', boxShadow: darkMode ? '0 2px 8px rgba(244, 67, 54, 0.15)' : '0 2px 8px rgba(244, 67, 54, 0.1)', }} 
          >{error}</Alert>}
          <Button variant="contained" color="primary" fullWidth onClick={handleRequestOtp} disabled={loading} sx={{ marginTop: '1rem', borderRadius:'12px', background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', }}>
          {loading ? <CircularProgress size={24} /> : 'Request OTP'}
        </Button>
        </>
      )}
      {step === 2 && (
        <>
          <Typography variant="body1" color={darkMode ? 'white' : 'black'} gutterBottom>Enter the 6-digit OTP:</Typography>
          <Box container justifyContent="center" sx={{my: '1.5rem', display: 'flex', gap: 1}}>
            {otp.map((digit, index) => (
              <Grid item key={index} xs="auto">
                <TextField
                  inputRef={(el) => (otpRefs.current[index] = el)} // Store refs for each input
                  variant="outlined"
                  inputProps={{
                    maxLength: 1,
                    style: { textAlign: 'center', fontSize: '1.5rem' },
                  }}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  sx={{ 
                    // '& .MuiOutlinedInput-root': { borderRadius: '12px',} , 
                    '& .MuiInputBase-input': { padding: '6px 8px', },
                    // sx={{ 
              '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.95)',
              },
              '&.Mui-focused': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 1)',
                // boxShadow: darkMode 
                //   ? '0 0 0 2px rgba(67, 97, 238, 0.3)' 
                //   : '0 0 0 2px rgba(67, 97, 238, 0.2)',
              },
              '& fieldset': {
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                transition: 'border-color 0.3s ease',
              },
              '&:hover fieldset': {
                // borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.4)',
                borderColor: '#4361ee', borderWidth: '1px',
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
            '& .MuiOutlinedInput-input': {
              color: darkMode ? '#ffffff' : '#000000',
              '&::placeholder': {
                color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                opacity: 1,
              },
            },
            // }}
                    width: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                    margin: { xs: '1 0.25rem', sm: '1 0.5rem', md: '1 0.25rem' },
                    
                  }}
                />
              </Grid>
            ))}
          </Box>
          <TextField
            label="New Password"
            type="password"
            fullWidth 
            // sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px',} , '& .MuiInputBase-input': { padding: '14px 14px', },}}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: '12px',
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.95)',
                },
                '&.Mui-focused': {
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 1)',
                  // boxShadow: darkMode 
                  //   ? '0 0 0 2px rgba(67, 97, 238, 0.3)' 
                  //   : '0 0 0 2px rgba(67, 97, 238, 0.2)',
                },
                '& fieldset': {
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  transition: 'border-color 0.3s ease',
                },
                '&:hover fieldset': {
                  // borderColor: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                  borderColor: '#4361ee', borderWidth: '1px',
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
            }}
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth 
            // sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px',} , '& .MuiInputBase-input': { padding: '14px 14px', },}}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: '12px',
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.95)',
                },
                '&.Mui-focused': {
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 1)',
                  // boxShadow: darkMode 
                  //   ? '0 0 0 2px rgba(67, 97, 238, 0.3)' 
                  //   : '0 0 0 2px rgba(67, 97, 238, 0.2)',
                },
                '& fieldset': {
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  transition: 'border-color 0.3s ease',
                },
                '&:hover fieldset': {
                  // borderColor: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                  borderColor: '#4361ee', borderWidth: '1px',
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
            }}
            margin="normal"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
          {success && <Alert severity="success" 
            sx={{ mt: 2, borderRadius: '12px', color: darkMode ? 'success.contrastText' : 'text.primary', border: darkMode ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(76, 175, 80, 0.2)', boxShadow: darkMode ? '0 2px 8px rgba(76, 175, 80, 0.15)' : '0 2px 8px rgba(76, 175, 80, 0.1)',}}
          >{success}</Alert>}
          {error && <Alert severity="error"
            sx={{ mt: 2, borderRadius: '12px', color: darkMode ? 'error.contrastText' : 'text.primary', border: darkMode ? '1px solid rgba(244, 67, 54, 0.3)' : '1px solid rgba(244, 67, 54, 0.2)', boxShadow: darkMode ? '0 2px 8px rgba(244, 67, 54, 0.15)' : '0 2px 8px rgba(244, 67, 54, 0.1)', }} 
          >{error}</Alert>}
          
          <Button variant="contained" sx={{borderRadius:'12px', background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', mt: 2}} color="primary" fullWidth onClick={handleResetPassword} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
          <Box sx={{marginTop: '10px' , display:'flex', justifyContent:'center', alignItems:'center', gap:'10px'}}>
            <Typography variant="body2" color={darkMode ? 'white' : 'black'}>Didn't receive OTP?</Typography>
            <Button variant="text" sx={{borderRadius:'12px',  }} color="secondary" onClick={handleResendOtp} disabled={resendDisabled || loading} >
              {resendDisabled ? `Resend OTP (${resendTimer}s)` : 'Resend OTP'}
            </Button>
          </Box>
        </>
      )}
      {step === 3 && (
        <>
          <Alert severity="success"
           sx={{ mt: 2, borderRadius: '12px', color: darkMode ? 'success.contrastText' : 'text.primary', border: darkMode ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(76, 175, 80, 0.2)', boxShadow: darkMode ? '0 2px 8px rgba(76, 175, 80, 0.15)' : '0 2px 8px rgba(76, 175, 80, 0.1)',}}
          >{success}</Alert>
          {/* <Button variant="contained" color="primary" fullWidth onClick={() => navigate('/register')}>
            Go to Login
          </Button> */}
        </>
      )}
      {/* </Box> */}
      </DialogContent>
      {/* <DialogActions>
        <Button sx={{borderRadius:'12px'}} onClick={() => setForgotPasswordOpen(false)} color="secondary">Close</Button>
      </DialogActions> */}
    </Dialog>
  );
};

export default ForgotPassword;
