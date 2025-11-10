import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  TextField,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  Check as ApproveIcon, 
  Close as RejectIcon,
  Visibility as ViewIcon,
  HourglassEmpty as PendingIcon,
  VerifiedUser as VerifiedIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import Layout from '../Layout';
import { getAllVerifications, updateVerificationStatus } from '../api/adminApi';
import ImageZoomDialog from '../Helper/ImageZoomDialog';

const TabPanel = ({ children, value, index, ...other }) => (
  <div hidden={value !== index} {...other}>
    {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
  </div>
);

const ProfileVerification = ({ darkMode, toggleDarkMode, unreadCount, shouldAnimate, username }) => {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [approvedVerifications, setApprovedVerifications] = useState([]);
  const [rejectedVerifications, setRejectedVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedPredefinedReason, setSelectedPredefinedReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
  try {
    setLoading(true);
    const response = await getAllVerifications();
    
    // Separate verifications by status
    const pending = [];
    const approved = [];
    const rejected = [];
    
    response.data.forEach(user => {
      if (user.idVerification.status === 'pending_review') {
        pending.push(user);
      } else if (user.idVerification.status === 'approved') {
        approved.push(user);
      } else if (user.idVerification.status === 'rejected') {
        rejected.push(user);
      }
    });
    
    setPendingVerifications(pending);
    setApprovedVerifications(approved);
    setRejectedVerifications(rejected);
  } catch (error) {
    console.error('Error fetching verifications:', error);
    setSnackbar({ open: true, message: 'Error fetching verifications', severity: 'error' });
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const handleReviewUser = (user) => {
    setSelectedUser(user);
    setReviewDialogOpen(true);
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await updateVerificationStatus(selectedUser._id, 'approved');
      
      setSnackbar({ open: true, message: 'User verification approved', severity: 'success' });
      // Optimistic update - move user from pending to approved immediately
      const updatedUser = { ...selectedUser };
      updatedUser.idVerification.status = 'approved';
      updatedUser.idVerification.reviewedAt = new Date();
      
      // Remove from pending and add to approved
      setPendingVerifications(prev => prev.filter(user => user._id !== selectedUser._id));
      setApprovedVerifications(prev => [updatedUser, ...prev]);
      
      // Update tab counts and switch to Approved tab
      // setTabValue(1);
      setReviewDialogOpen(false);
      // fetchVerifications();
    } catch (error) {
      console.error('Error approving verification:', error);
      setSnackbar({ open: true, message: 'Error approving verification', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Add predefined rejection reasons
  const predefinedRejectionReasons = [
    'Document image is blurry or unclear',
    'Document details are not readable',
    'Selfie with document is not clear',
    'Document appears to be edited or tampered',
    'Document type does not match selected type',
    'Document is expired or invalid',
    'Face in selfie does not match document photo',
    'Document and selfie do not appear to be taken together',
    'Missing required document images',
    'Document image is cropped or incomplete'
  ];

  const handleReject = async (reason) => {
    try {
      setActionLoading(true);
      await updateVerificationStatus(selectedUser._id, 'rejected', reason);
      
      setSnackbar({ open: true, message: 'User verification rejected', severity: 'success' });
      // Optimistic update - move user from pending to rejected immediately
      const updatedUser = { ...selectedUser };
      updatedUser.idVerification.status = 'rejected';
      updatedUser.idVerification.reviewedAt = new Date();
      updatedUser.idVerification.rejectionReason = reason;
      
      // Remove from pending and add to rejected
      setPendingVerifications(prev => prev.filter(user => user._id !== selectedUser._id));
      setRejectedVerifications(prev => [updatedUser, ...prev]);
      
      // Update tab counts and switch to Rejected tab
      // setTabValue(2);
      setRejectionDialogOpen(false);
      setReviewDialogOpen(false);
      setRejectionReason('');
      setSelectedPredefinedReason('');
      // fetchVerifications();
    } catch (error) {
      console.error('Error rejecting verification:', error);
      setSnackbar({ open: true, message: 'Error rejecting verification', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // await fetchReports(false);
    fetchVerifications();
  };

  // Rejection Reason Dialog component
  // const RejectionReasonDialog = () => (
    
  // );

  const getStatusChip = (status) => {
    const statusConfig = {
      pending_review: { label: 'Pending Review', color: 'warning', icon: <PendingIcon /> },
      approved: { label: 'Approved', color: 'success', icon: <VerifiedIcon /> },
      rejected: { label: 'Rejected', color: 'error', icon: <CancelIcon /> }
    };
    
    const config = statusConfig[status] || statusConfig.pending_review;
    
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        variant="outlined"
        size="small"
      />
    );
  };

  // Function to open the zoomed image modal
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  // Function to close the zoomed image modal
  const handleCloseImageModal = () => {
    setSelectedImage(null);
  };

  const VerificationCard = ({ user }) => (
    <Card sx={{ mb: 2, p: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={6} sm={6} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              src={user.profilePic ? `data:image/jpeg;base64,${user.profilePic}` : undefined}
              alt={user.username}
            >
              {user.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {user.username}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {user.userCode}
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={6} sm={6} md={6}>
          {getStatusChip(user.idVerification.status)}
        </Grid>
        
        <Grid item xs={6} sm={3} md={2}>
          <Typography variant="body2">
            <strong>Document:</strong>
          </Typography>
          <Typography variant="caption">
            {user.idVerification.documentType?.replace('_', ' ').toUpperCase() || 'N/A'}
          </Typography>
        </Grid>
        
        <Grid item xs={6} sm={3} md={2}>
          <Typography variant="body2">
            <strong>Attempts:</strong>
          </Typography>
          <Typography variant="caption">
            {user.idVerification.attempts || 0}/{user.idVerification.maxAttempts || 3}
          </Typography>
        </Grid>
        
        <Grid item xs={6} sm={3} md={2}>
          <Typography variant="body2">
            <strong>Submitted On:</strong>
          </Typography>
          <Typography variant="caption">
            {new Date(user.idVerification.submittedAt).toLocaleString()}
          </Typography>
        </Grid>

        {user.idVerification.reviewedAt && (
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="body2">
              <strong>Reviewed On:</strong>
            </Typography>
            <Typography variant="caption">
              {new Date(user.idVerification.reviewedAt).toLocaleString()}
            </Typography>
          </Grid>
        )}
        
        <Grid item xs={12} sm={6} md={2}>
          <Button sx={{borderRadius: '12px'}}
            variant="outlined"
            size="small"
            startIcon={<ViewIcon />}
            onClick={() => handleReviewUser(user)}
            fullWidth={isMobile}
          >
            Review
          </Button>
        </Grid>
      </Grid>
    </Card>
  );

  // const ReviewDialog = () => (
    
  // );

  return (
    <Layout 
      darkMode={darkMode} 
      toggleDarkMode={toggleDarkMode} 
      unreadCount={unreadCount} 
      shouldAnimate={shouldAnimate}
      username={username}
    >
      <Box sx={{ p: isMobile ? 1 : 2 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <VerifiedUserRoundedIcon color="warning" />
              Profile Verification
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              Review and manage user identity verification requests
            </Typography>
          </Box>
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={handleRefresh} 
              disabled={refreshing}
              color="primary"
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&:disabled': { bgcolor: 'action.disabled' }
              }}
            >
              {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
          <Tab label={`Pending (${pendingVerifications.length})`} />
          <Tab label={`Approved (${approvedVerifications.length})`} />
          <Tab label={`Rejected (${rejectedVerifications.length})`} />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              {pendingVerifications.length === 0 ? (
                <Alert severity="info">No pending verification requests</Alert>
              ) : (
                pendingVerifications.map(user => (
                  <VerificationCard key={user._id} user={user} />
                ))
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {approvedVerifications.length === 0 ? (
                <Alert severity="info">No approved verifications</Alert>
              ) : (
                approvedVerifications.map(user => (
                  <VerificationCard key={user._id} user={user} />
                ))
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              {rejectedVerifications.length === 0 ? (
                <Alert severity="info">No rejected verifications</Alert>
              ) : (
                rejectedVerifications.map(user => (
                  <VerificationCard key={user._id} user={user} />
                ))
              )}
            </TabPanel>
          </>
        )}

        {/* <ReviewDialog /> */}
        <Dialog 
            open={reviewDialogOpen} 
            onClose={() => setReviewDialogOpen(false)}
            maxWidth="lg" fullScreen={isMobile}
            fullWidth
            PaperProps={{
              sx: {
                background: darkMode 
                  ? 'rgba(30, 30, 30, 0.95)' 
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
              }
            }}
        >
            <DialogTitle>
            Review Verification - {selectedUser?.username}
            </DialogTitle>
            <DialogContent>
            {selectedUser && (
                <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Document Front</Typography>
                    {selectedUser.idVerification.documentFront ? (
                    <img
                        src={`data:image/jpeg;base64,${selectedUser.idVerification.documentFront}`}
                        alt="Document Front"
                        style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', cursor: 'pointer' }}
                        onClick={() => handleImageClick(selectedUser.idVerification.documentFront)} // Open image in modal on click
                    />
                    ) : (
                    <Alert severity="warning">No document front uploaded</Alert>
                    )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Document Back</Typography>
                    {selectedUser.idVerification.documentBack ? (
                    <img
                        src={`data:image/jpeg;base64,${selectedUser.idVerification.documentBack}`}
                        alt="Document Back"
                        style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', cursor: 'pointer' }}
                        onClick={() => handleImageClick(selectedUser.idVerification.documentBack)} // Open image in modal on click
                    />
                    ) : (
                    <Alert severity="info">No document back uploaded (optional)</Alert>
                    )}
                </Grid>
                
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Selfie with Document</Typography>
                    {selectedUser.idVerification.selfieWithDocument ? (
                    <img
                        src={`data:image/jpeg;base64,${selectedUser.idVerification.selfieWithDocument}`}
                        alt="Selfie with Document"
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', cursor: 'pointer' }}
                        onClick={() => handleImageClick(selectedUser.idVerification.selfieWithDocument)} // Open image in modal on click
                    />
                    ) : (
                    <Alert severity="error">No selfie with document uploaded</Alert>
                    )}
                </Grid>
                
                <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                    <strong>Document Type:</strong> {selectedUser.idVerification.documentType?.replace('_', ' ').toUpperCase()}
                    <br />
                    <strong>Submitted:</strong> {new Date(selectedUser.idVerification.submittedAt).toLocaleString()}
                    <br />
                    <strong>Attempt:</strong> {selectedUser.idVerification.attempts} of {selectedUser.idVerification.maxAttempts}
                    {selectedUser.idVerification.rejectionReason && (
                        <>
                        <br />
                        <strong>Rejection Reason:</strong> {selectedUser.idVerification.rejectionReason}
                        </>
                    )}
                    </Typography>
                </Grid>
                </Grid>
            )}
            </DialogContent>
            <DialogActions>
            <Button sx={{borderRadius: '12px', mr: 'auto'}}
                onClick={() => setReviewDialogOpen(false)}
                disabled={actionLoading}
            >
                Cancel
            </Button>
            {selectedUser?.idVerification.status === 'pending_review' && (
                <>
                <Button sx={{borderRadius: '12px'}}
                    variant="outlined"
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={() => setRejectionDialogOpen(true)}
                    disabled={actionLoading}
                >
                    Reject
                </Button>
                <Button sx={{borderRadius: '12px'}}
                    variant="contained"
                    color="success"
                    startIcon={actionLoading ? <CircularProgress size={16} /> : <ApproveIcon />}
                    onClick={handleApprove}
                    disabled={actionLoading}
                >
                    {actionLoading ? 'Approving...' : 'Approve'}
                </Button>
                </>
            )}
            </DialogActions>
        </Dialog>
        {/* <RejectionReasonDialog /> */}
        <Dialog 
          open={rejectionDialogOpen} 
          onClose={() => setRejectionDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: darkMode 
                ? 'rgba(30, 30, 30, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
            }
          }}
        >
          <DialogTitle>Select Rejection Reason</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Predefined Reasons:
              </Typography>
              
              <Box sx={{ maxHeight: '200px', overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
                {predefinedRejectionReasons.map((reason, index) => (
                  <Box
                    key={index}
                    onClick={() => {
                      setSelectedPredefinedReason(reason);
                      setRejectionReason(reason);
                    }}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      cursor: 'pointer',
                      backgroundColor: selectedPredefinedReason === reason ? 'primary.light' : 'transparent',
                      color: selectedPredefinedReason === reason ? 'primary.contrastText' : 'text.primary',
                      '&:hover': {
                        backgroundColor: selectedPredefinedReason === reason ? 'primary.light' : 'action.hover',
                      },
                      mb: 0.5,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Typography variant="body2">
                      {reason}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Or enter custom reason:
              </Typography>
              
              <TextField
                multiline
                rows={3}
                fullWidth
                placeholder="Enter custom rejection reason..."
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  setSelectedPredefinedReason(''); // Clear predefined selection when typing custom
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  }
                }}
              />

              <Alert severity="info" sx={{ mt: 1 }}>
                The rejection reason will be visible to the user.
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button sx={{borderRadius: '12px', mr: 'auto'}}
              onClick={() => {
                setRejectionDialogOpen(false);
                setRejectionReason('');
                setSelectedPredefinedReason('');
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button sx={{borderRadius: '12px'}}
              variant="contained"
              color="error"
              onClick={() => handleReject(rejectionReason)}
              disabled={actionLoading || !rejectionReason.trim()}
              startIcon={actionLoading ? <CircularProgress size={16} /> : <RejectIcon />}
            >
              {actionLoading ? 'Rejecting...' : 'Reject Verification'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Image Dialog with Zoom */}
        <ImageZoomDialog
          selectedImage={selectedImage}
          handleCloseImageModal={handleCloseImageModal}
          images={[selectedImage]} // Pass the full media array
          isMobile={isMobile}
        />

        {snackbar.open && (
          <Alert 
            severity={snackbar.severity} 
            sx={{ position: 'fixed', bottom: 16, right: 16, minWidth: 300 }}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        )}
      </Box>
    </Layout>
  );
};

export default ProfileVerification;