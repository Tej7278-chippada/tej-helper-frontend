// /components/Login.js
import React, { useEffect, useRef, useState } from 'react';
import { TextField, Button, Typography, Box, Alert, useMediaQuery, ThemeProvider, createTheme, Dialog, DialogContent, DialogActions, CircularProgress, InputAdornment, IconButton, Divider, Fade,
  //  IconButton
   } from '@mui/material';
import axios from 'axios';
import Layout from './Layout';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
// import CloseIcon from '@mui/icons-material/Close';
import PasswordRoundedIcon from '@mui/icons-material/PasswordRounded';
import PinOutlinedIcon from '@mui/icons-material/PinOutlined';
import DemoPosts from './Banners/DemoPosts';
import GoogleOAuth from './GoogleOAuth/GoogleOAuth';
import TermsPolicyBar from './TermsAndPolicies/TermsPolicyBar';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import AboutHelperSkeleton from './Banners/AboutHelperSkeleton';
import AboutHelper from './Banners/AboutHelper';

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
// const getGlassmorphismStyle = (theme) => ({
//   background: 'rgba(255, 255, 255, 0.15)',
//   backdropFilter: 'blur(20px)',
//   border: '1px solid rgba(255, 255, 255, 0.2)',
//   boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
// });

const Login = ({darkMode, toggleDarkMode, unreadCount, shouldAnimate, setLoginStatus}) => {
  // const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState(''); // Can be email or username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  // const [resetData, setResetData] = useState(''); // For email or phone number
  // const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md')); // Media query for small screens
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showAboutHelper, setShowAboutHelper] = useState(false);
  const aboutHelperRef = useRef(null);

  // const gradientBackground = darkMode
  //   ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
  //   : 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 50%, #c7d2fe 100%)';

  // const gradientButton = 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 50%, #7209b7 100%)';
  const gradientHover = 'linear-gradient(135deg, #3a56d4 0%, #2d0a8c 50%, #5c0b9b 100%)';
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (showAboutHelper && aboutHelperRef.current) {
      setTimeout(() => {
        aboutHelperRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [showAboutHelper]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {     
      const isEmail = validateEmail(identifier);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, { identifier, password, isEmail  });
      setSuccess(`You are logged in with ${isEmail ? 'email' : 'username'}: ${identifier}`);
      setIdentifier('');
      setPassword('');

      const { authToken, tokenUsername, userId, tokenPic } = response.data;
      // if (authToken) {
      //   // Store the token in localStorage
      //   localStorage.setItem('authToken', authToken);
      //   localStorage.setItem('tokenUsername', tokenUsername);
      //   // Redirect to chat page
      //   navigate('/productList'); // navigate(`/chat-${username}`);
      // } else {
      //   setError('Token is missing in response');
      // }
      if (authToken && userId){

      // Store authToken uniquely for the user
      const tokens = JSON.parse(localStorage.getItem('authTokens')) || {};
      tokens[tokenUsername] = authToken;
      localStorage.setItem('authTokens', JSON.stringify(tokens));

      // Set authToken and active user in localStorage
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('activeUser', tokenUsername);
      localStorage.setItem('tokenUsername', tokenUsername);
      localStorage.setItem('userId', userId); // Store userId
      localStorage.setItem('tokenProfilePic', tokenPic);

      setSuccess('Login successful!');
      navigate('/', { replace: true });
      setLoginStatus(true);
    } else {
        setError('Token is missing in response');
      }
      
      // Redirect to chat page or dashboard here
      // if (response.status === 200) {
      //   window.location.href = '/chat';
      // }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError(`${validateEmail(identifier) ? 'Email' : 'Username'} ${identifier} doesn't match any existing account.`);
      } else if (error.response && error.response.status === 401) {
        setError(`Password doesn't match for ${validateEmail(identifier) ? 'Email' : 'Username'} : ${identifier}`);
      } else if (error.response && error.response.status === 403) {
        setError(`This account ${identifier} has been Suspened.`);
      } else {
        setError('An error occurred while logging in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // navigate('/forgot-password');
    setForgotPasswordOpen(true);
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Function to check if the identifier is a valid email
  const validateEmail = (email) => {
    const re = /^[a-zA-Z\d][\w.+-]*@[a-zA-Z\d-]+(\.[a-zA-Z\d-]+)*(\.[a-zA-Z]{2,})$/;
    return re.test(email);
  };

  return (
    <ThemeProvider theme={theme}>
    <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate}>
      <Box sx={{display: isMobile ? 'flow' : 'flex'}}>
        {/* Demo Posts Banner Section */}
        <Box sx={{                              // to top
          background: isMobile ? 'linear-gradient(310deg, #4361ee 0%, #3a0ca3 50%, transparent 100%)' : 'linear-gradient(310deg, #4361ee 0%, #3a0ca3 50%, transparent 100%)',
          color: 'white', height: isMobile ? 'auto' : '80vh', minWidth : isMobile ? 'auto' : '400px',
          padding: isMobile ? '1.5rem 1rem' : '2rem', pt: '6rem',
          textAlign: 'center', backdropFilter: 'blur(20px)',
          borderRadius: isMobile ? '0 0 16px 16px' : '0 0 16px 0', mt: -8,
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
           "Helper is a community-driven platform connecting people who need help with those willing to offer it—whether for paid work, volunteering, or emergencies."
          </Typography>
         <DemoPosts isMobile={isMobile} postId={'685bec9758f2f12cad77fff0'} /> {/* {!isMobile &&  */}
        </Box>
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="70vh" width= {isMobile ? "auto" : "100%"}
    padding={isMobile ? 2 : 4} sx={{ position: 'relative' }}// sx={{...getGlassmorphismStyle(theme),}}
    >
      {/* <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
        Login
      </Typography> */}
      {/* <Typography 
        variant={isMobile ? "h5" : "h4"}
        fontWeight={700}
        sx={{
          background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', //background: '#4361ee', // 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)'
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', mb:'2rem'
        }}
      >
        Sign In to Your Account
      </Typography> */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        {/* <LoginIcon
          sx={{
            fontSize: 48,
            background: gradientButton,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 2,
          }}
        /> */}
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          sx={{
            fontWeight: 700,
            // background: gradientButton,
            background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 1,
          }}
        >
          Sign In
        </Typography>
        <Typography variant="body1" color="inherit">
          Access your Helper account
        </Typography>
      </Box>
      <GoogleOAuth setSuccess={setSuccess} setError={setError} darkMode={darkMode} />
      <Box sx={{ 
        // display: { xs: 'flex', sm: 'none' }, 
        display: 'flex',
        alignItems: 'center', 
        my: 2,
        width: '100%', maxWidth: isMobile ? '220px' : '300px',
      }}>
        <Divider sx={{ flexGrow: 1, borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }} />
        <Typography variant="caption" sx={{ px: 2, color: 'inherit' }}>or continue with</Typography>
        <Divider sx={{ flexGrow: 1, borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }} />
      </Box>
      <form onSubmit={handleLogin} style={{ maxWidth: isMobile ? '300px' : '400px', width: '100%',  }}> {/* ...getGlassmorphismStyle(theme), padding:'12px', borderRadius:isMobile ? '12px' : '18px' */}
        {location.state?.message && !error && !success && <div>{location.state.message}</div>}
        {error && (
          <Fade in={!!error}>
            <Alert
              severity="error"
              sx={{
                animation: 'slideDown 0.3s ease',
                '@keyframes slideDown': {
                  from: { opacity: 0, transform: 'translateY(-10px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
                borderRadius: '12px', color: darkMode ? 'error.contrastText' : 'text.primary',
                border: darkMode ? '1px solid rgba(244, 67, 54, 0.3)' : '1px solid rgba(244, 67, 54, 0.2)',
                boxShadow: darkMode ? '0 2px 8px rgba(244, 67, 54, 0.15)' : '0 2px 8px rgba(244, 67, 54, 0.1)',
                mb: 1
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}
        {success && (
          <Fade in={!!success}>
            <Alert
              severity="success"
              sx={{
                animation: 'slideDown 0.3s ease',
                borderRadius: '12px', color: darkMode ? 'success.contrastText' : 'text.primary', 
                border: darkMode ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(76, 175, 80, 0.2)', 
                boxShadow: darkMode ? '0 2px 8px rgba(76, 175, 80, 0.15)' : '0 2px 8px rgba(76, 175, 80, 0.1)',
                mb: 1
              }}
            >
              {success}
            </Alert>
          </Fade>
        )}
        <TextField
          label="Username or Email"
          variant="outlined"
          fullWidth sx={{ 
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
          margin="normal"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'} // Toggle between text and password
          variant="outlined"
          fullWidth sx={{ 
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
            '& input[type="password"]::-ms-reveal': {
              display: 'none',
            },
            '& input[type="password"]::-webkit-credentials-auto-fill-button': {
              display: 'none !important',
            },
          }}
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment:  ( // Only show on desktop screens // isMobile &&
              <InputAdornment position="end">
                <IconButton
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                  aria-label={showPassword ? "Hide password" : "Show password"} // Accessible name
                  title={showPassword ? "Hide password" : "Show password"} // Tooltip for better UX
                  sx={{
                    color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                  }}
                >
                  {showPassword ? <PasswordRoundedIcon /> : <PinOutlinedIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button type="submit" variant="contained"  fullWidth sx={{ marginTop: '1rem', background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', // background: gradientButton,
          color: 'white',
          py: 1,
          borderRadius: 3,
          fontWeight: 600,
          fontSize: '1rem',
          textTransform: 'none',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 20px rgba(67, 97, 238, 0.3)',
          '&:hover': {
            background: gradientHover,
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
        }} disabled={loading}>
          {loading ? <CircularProgress size={24} sx={{ color: '#3a0ca3' }}/> : 'Sign In'}
        </Button>
        <Button variant="text" fullWidth onClick={handleForgotPassword} sx={{ marginTop: '10px', borderRadius:'12px',
          color: '#4361ee',
          fontWeight: 600,
          fontSize: '1rem',
          textTransform: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            // background: gradientHover,
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
         }}>
          Forgot Password?
        </Button>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="inherit">
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: '#4361ee',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#3a0ca3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#4361ee';
              }}
            >
              Create Account
            </Link>
          </Typography>
        </Box>
      </form>
      <ForgotPassword darkMode={darkMode} forgotPasswordOpen={forgotPasswordOpen} setForgotPasswordOpen={setForgotPasswordOpen} isMobile={isMobile}/>
       {/* {isMobile && <DemoPosts isMobile={isMobile} postId={'685bec9758f2f12cad77fff0'}/> } */}
      <Button
        variant="text"
        onClick={() => setShowAboutHelper(!showAboutHelper)}
        size="small"
        sx={{
          position: isMobile ? 'relative' : 'absolute',
          mt: isMobile ? 2 : 0,
          zIndex: 2,
          bottom: 6,
          right: 6,
          width: '150px', borderRadius: 4,
          color: '#4361ee',
          fontWeight: 600,
          fontSize: '1rem',
          textTransform: 'none',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 20px rgba(67, 97, 238, 0.3)',
          '&:hover': {
            // background: gradientHover,
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 25px rgba(67, 97, 238, 0.4)',

          },
          '&:active': {
            transform: 'translateY(0)',
          },
        }}
      >
        {showAboutHelper ? 'Hide' : 'About Helper'}
        {showAboutHelper ? <KeyboardArrowUpRoundedIcon fontSize="small" /> : <KeyboardArrowDownRoundedIcon fontSize="small" />}
      </Button>
    </Box>
</Box>
        {showAboutHelper && (
          <div ref={aboutHelperRef} style={{
              scrollMarginTop: isMobile ? '80px' : '100px',
            }}>
            <AboutHelper isMobile={isMobile} darkMode={darkMode} />
          </div>
        )}
        {/* {showAboutHelper && <HelperHome darkMode={darkMode}/>} */}
        <TermsPolicyBar isMobile={isMobile} darkMode={darkMode}/>
    </Layout>
    </ThemeProvider>
  );
};

export default Login;
