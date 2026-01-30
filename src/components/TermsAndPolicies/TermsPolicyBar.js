// Footer.js
import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const TermsPolicyBar = ({isMobile, darkMode}) => {
  const getGlassmorphismStyle = (opacity = 0.16, blur = 18) => ({
    background: darkMode
      ? `rgba(25,25,25,${opacity})`
      : `rgba(255,255,255,${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    borderRadius: '14px',
  });

  return (
    <Box sx={{ m: 1, mb: 3}}>
      {/* <Box sx={{ textAlign: "center", py: 2 }}>
        <Typography variant="body2" color={darkMode ? '#f5f5f5' : 'textSecondary'}>
        &copy;2025 Tej Tech |{" "}
        <Link to="/terms-conditions">Terms and Conditions</Link> |{" "}
        <Link to="/privacy-policy">Privacy Policy</Link>
        </Typography>
    </Box> */}
      <Box sx={{ mt: 3 }}>
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            ...getGlassmorphismStyle(0.18, 20),
          }}
        >
          {/* <Typography
            variant={isMobile ? 'h6' : 'h5'}
            fontWeight={700}
            gutterBottom
            sx={{ color: darkMode ? '#fff' : '#222' }}
          >
            Your Community, One App
          </Typography>

          <Typography
            variant="body2"
            sx={{ opacity: 0.85, mb: 1.5, color: darkMode ? '#ccc' : '#555' }}
          >
            Post a task, find work, or help someone nearby.
            Helper makes helping and earning simple.
          </Typography> */}
          {/* <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}> */}
            <Typography variant="body2" align="center" sx={{ color: darkMode ? '#ccc' : '#555' }} >
              By signing in, you agree to our{' '}
              <Typography component={Link} variant="body2" color="primary" to="/terms-conditions" sx={{ cursor: 'pointer', textDecoration: "none" }}>
                Terms of Service
              </Typography>{' '}
              and{' '}
              <Typography component={Link} variant="body2" color="primary" to="/privacy-policy" sx={{ cursor: 'pointer', textDecoration: "none" }}>
                Privacy Policy
              </Typography>
            </Typography>
          {/* </Box> */}
          <Box sx={{ mt: 0, textAlign: 'center' }}>
            <Typography
              variant="caption"
              sx={{ opacity: 0.6, color: darkMode ? '#aaa' : '#666' }}
            >
              Need support? Contact helper.in.dev@gmail.com
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{ opacity: 0.6, color: darkMode ? '#aaa' : '#666' }}
          >
            © 2026 • Tej Tech • Helper • Built for local communities
          </Typography>
        </Box>
      </Box>
  </Box>
  );
};

export default TermsPolicyBar;
