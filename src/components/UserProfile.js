// components/UserProfile.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Alert,
  useMediaQuery,
  Grid,
  Button,
  Toolbar,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useTheme } from '@emotion/react';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import API from './api/api';
import Layout from './Layout';
import SkeletonProductDetail from './SkeletonProductDetail';

const UserProfile = () => {
  const { id } = useParams(); // Extract sellerId from URL
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await API.get(`/api/auth/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUserData(response.data);
      } catch (err) {
        setError('Failed to fetch User details. Please try again later.');
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

      setSuccessMessage('Your account has been deleted successfully.');
      localStorage.clear();
      navigate('/');
    } catch (err) {
      setError('Failed to delete account. Please try again later.');
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
  
  if (loading || !userData) {
    return (
      <Layout>
        {/* <SkeletonCards /> */}
        <SkeletonProductDetail />
      </Layout>
    );
  };
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Layout>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={9000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>
      <Box >
        <div style={{
          padding: '8px',
          // position: 'relative',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px', scrollbarWidth: 'thin'
        }}>
          <Typography variant="h5" style={{ flexGrow: 1, margin: '10px' }} gutterBottom>
            User Profile
          </Typography>
          <Box
            display="flex"
            flexDirection={isMobile ? "column" : "row"}
            gap={2} sx={{ bgcolor: '#f5f5f5', borderRadius: '10px', padding: '6px', paddingBottom: '10px', paddingTop: '10px' }}
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
                style={{ paddingRight: isMobile ? "0" : "0rem" }}
              >
                <Avatar
                  alt={userData.username}
                  src={
                    userData.profilePic
                      ? `data:image/jpeg;base64,${userData.profilePic}`
                      : undefined
                  }
                  sx={{ width: 'fit-content', height: 'auto', borderRadius: '16px' }}
                />
              </Box>
            </Box>


            <Box sx={{
              flex: 3,
              // height: '73vh', // Fixed height relative to viewport
              overflowY: 'auto',
              bgcolor: 'white', // Card background color (customizable)
              borderRadius: 3, // Card border radius (customizable)
              // boxShadow: 3, // Shadow for a modern look
              scrollbarWidth: 'thin', padding: '1rem',
              position: 'relative', // To enable absolute positioning of the button
              // height: 'calc(100vh - 16px)', // Adjust height as needed
            }}>
              <Box flex={isMobile ? "1" : "0 0 70%"} mb={6}>
                <Grid container spacing={2}>

                  <Grid item xs={6} sm={4}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      User Name:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {userData.username}
                    </Typography>
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
                      {userData.phone}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      User Email:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {userData.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      Address:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                    {`${userData.address.street}, ${userData.address.area}, ${userData.address.city}, ${userData.address.state} - ${userData.address.pincode}`}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              <Toolbar sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'white', borderRadius:'16px',
                boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '1rem',
              }}>
                <Box >
                  <IconButton
                    onClick={handleOpenDeleteDialog}
                    onMouseEnter={() => setHoveredId(userData._id)} // Set hoveredId to the current button's ID
                    onMouseLeave={() => setHoveredId(null)} // Reset hoveredId when mouse leaves
                    style={{

                      backgroundColor: hoveredId === userData._id ? '#ffe6e6' : 'rgba(255, 255, 255, 0.2)',
                      borderRadius: hoveredId === userData._id ? '6px' : '50%',
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
            </Box>
          </Box>
        </div>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
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
          <Button onClick={handleDeleteAccount} variant='contained' color="error" style={{ marginRight: '10px' }}>
            Yes, permanently delete my account
          </Button>
          <Button onClick={handleCloseDeleteDialog} variant='outlined' color="primary">
            Cancel
          </Button>

        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default UserProfile;
