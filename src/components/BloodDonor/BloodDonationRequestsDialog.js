// src/components/BloodDonor/BloodDonationRequestsDialog.js
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Slide,
  Divider,
  Grid,
} from '@mui/material';
import {
  CheckCircleRounded,
  CancelRounded,
  PersonRounded,
  PhoneRounded,
  EmailRounded,
  BloodtypeRounded,
} from '@mui/icons-material';

const BloodDonationRequestsDialog = ({
  open,
  onClose,
  requests,
  loading,
  onUpdateStatus,
  isMobile,
  darkMode,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
      sx={{
        '& .MuiPaper-root': {
          borderRadius: '14px',
          backdropFilter: 'blur(12px)',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Blood Donation Requests</Typography>
          <Chip
            label={`${requests.filter(r => r.status === 'pending').length} Pending`}
            color="warning"
            size="small"
          />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        ) : requests.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">
              No blood donation requests found
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {requests.map((request, index) => (
              <Box
                key={request._id}
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  backgroundColor: darkMode
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid',
                  borderColor: darkMode
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.08)',
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          // src={request.userId?.profilePic}
                          src={`data:image/png;base64,${request.userId?.profilePic}`}
                          alt={request.userId?.username}
                          sx={{ width: 40, height: 40 }}
                        >
                          <PersonRounded />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {request.userId?.username}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {request.userId?.userCode}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={getStatusLabel(request.status)}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Requested at:
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(request.requestAt)}
                    </Typography>
                  </Grid>

                  {/* <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Blood Group:
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <BloodtypeRounded color="error" fontSize="small" />
                      <Typography variant="body2">
                        {request.userId?.bloodDonor?.bloodGroup || 'Unknown'}
                      </Typography>
                    </Box>
                  </Grid> */}

                  {request.userId?.bloodDonor?.contactWay && (
                    <>
                      {request.userId.bloodDonor.contactWay.phone && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            Contact:
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PhoneRounded fontSize="small" />
                            <Typography variant="body2">
                              {request.userId.bloodDonor.contactWay.phone}
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {request.userId.bloodDonor.contactWay.email && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            Email:
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <EmailRounded fontSize="small" />
                            <Typography variant="body2">
                              {request.userId.bloodDonor.contactWay.email}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </>
                  )}

                  {request.status === 'pending' && (
                    <Grid item xs={12}>
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleRounded />}
                          onClick={() => onUpdateStatus(request.userId._id, 'accepted')}
                          size="small"
                          sx={{ borderRadius: '8px' }}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CancelRounded />}
                          onClick={() => onUpdateStatus(request.userId._id, 'rejected')}
                          size="small"
                          sx={{ borderRadius: '8px' }}
                        >
                          Reject
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="text" onClick={onClose} sx={{ borderRadius: '12px', textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BloodDonationRequestsDialog;