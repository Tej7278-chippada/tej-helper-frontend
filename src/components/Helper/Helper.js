// components/Helper/Helper.js
import React from 'react';
import {Box, Button, Toolbar, Typography, useMediaQuery } from '@mui/material';
import Layout from '../Layout';
import { useTheme } from '@emotion/react';
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded';
import FilterListIcon from "@mui/icons-material/FilterList";
import FavoriteIcon from '@mui/icons-material/Favorite';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';

const Helper = ()=> {
  const tokenUsername = localStorage.getItem('tokenUsername');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Layout username={tokenUsername}>
      <Box>
      <Toolbar > 
          <Typography variant="h6" style={{ flexGrow: 1, marginRight: '2rem' }}>
            Posts
          </Typography>
          <Button
            variant="contained"
            // onClick={() => openUserProfile()}
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
              gap: '8px', marginRight: '10px'
            }}
          >
            <PostAddRoundedIcon sx={{ fontSize: '20px' }} />
            {/* <span style={{ fontSize: '14px', fontWeight: '500' }}>Add Product</span> */}
          </Button>
          <Button
            variant="contained"
            // onClick={handleFilterToggle}
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
              gap: '8px', marginRight: '10px'
            }}
          >
            <FilterListIcon sx={{ fontSize: '20px' }} />
            {/* <span style={{ fontSize: '14px', fontWeight: '500' }}>Filter</span> */}
          </Button>
          <Button
            variant="contained"
            // onClick={() => navigate('/wishlist')}
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
              gap: '8px', marginRight: '10px'
            }}
          >
            <FavoriteIcon sx={{ fontSize: '20px' }} />
            {/* <span style={{ fontSize: '14px', fontWeight: '500' }}>Filter</span> */}
          </Button>
          <Button
            variant="contained"
            // onClick={() => navigate("/my-orders")}
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
            <LocalMallRoundedIcon sx={{ fontSize: '20px' }} />
            {/* <span style={{ fontSize: '14px', fontWeight: '500' }}>Filter</span> */}
          </Button>
          
        </Toolbar>


      </Box>
    
    </Layout>
  );


};

export default Helper;
