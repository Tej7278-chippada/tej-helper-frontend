// Footer.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const TermsPolicyBar = () => {
  return (
    <Box sx={{ m: 1, mb: 3}}>
        {/* <Box sx={{ bgcolor: 'background.paper', p: 3, mt: 'auto', textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
            &copy; Tej Pay 2024
        </Typography>
        </Box> */}
        <Box sx={{ textAlign: "center", py: 2 }}>
        <Typography variant="body2" color="textSecondary">
        &copy;2025 Tej Tech |{" "}
        <Link to="/terms-conditions">Terms and Conditions</Link> |{" "}
        <Link to="/privacy-policy">Privacy Policy</Link>
        {/* <Link to="/contact">Contact</Link> |{" "} */}
        {/* <Link to="/cancellation-refund">Cancellation and Refund</Link> |{" "} */}
        {/* <Link to="/shipping-delivery">Shipping and Delivery</Link> */}
        </Typography>
    </Box>
  </Box>
  );
};

export default TermsPolicyBar;
