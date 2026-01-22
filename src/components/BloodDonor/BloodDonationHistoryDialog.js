// src/components/BloodDonor/BloodDonationHistoryDialog.js
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Grid,
  Slide,
  // Card,
  // CardContent,
  // CardMedia,
} from '@mui/material';
import {
  CalendarTodayRounded,
  LocationOnRounded,
  NoteRounded,
  ImageRounded,
  BloodtypeRounded,
} from '@mui/icons-material';

const BloodDonationHistoryDialog = ({
  open,
  onClose,
  donationHistory,
  loading,
  isMobile,
  darkMode,
}) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const formatAddress = (location) => {
    if (!location) return 'Location not specified';
    if (location.address) return location.address;
    // return `${location.latitude?.toFixed(4)}, ${location.longitude?.toFixed(4)}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
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
          <Typography variant="h6">Blood Donation History</Typography>
          <Chip
            label={`${donationHistory.length} Donations`}
            color="primary"
            size="small"
          />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        ) : donationHistory.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">
              No donation history found
            </Typography>
          </Box>
        ) : (
          <Box 
          // sx={{ maxHeight: '70vh', overflowY: 'auto' }}
          >
            <Grid container spacing={2}>
              {donationHistory.map((donation, index) => (
                <Grid item xs={12} key={donation._id || index}>
                  <Box
                    sx={{
                      p: 2,
                      // mb: 2,
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
                    {/* <CardContent> */}
                      <Grid container spacing={2}>
                        {/* Donation Images */}
                        {donation.media && donation.media.length > 0 && (
                          <Grid item xs={12}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <ImageRounded fontSize="small" />
                              <Typography variant="subtitle2">Donation memories</Typography>
                            </Box>
                            <Box display="flex" gap={1} overflow="auto">
                              {donation.media.map((img, imgIndex) => (
                                <Box
                                  key={imgIndex}
                                  sx={{
                                    // width: 100,
                                    height: '140px',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                  }}
                                >
                                  <img
                                    src={`data:image/jpeg;base64,${img.toString('base64')}`}
                                    alt={`Donation proof ${imgIndex + 1}`}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                    }}
                                  />
                                </Box>
                              ))}
                            </Box>
                          </Grid>
                        )}

                        {/* Donation Date */}
                        <Grid item xs={12} sm={6}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CalendarTodayRounded fontSize="small" color="primary" />
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                Donated on
                              </Typography>
                              <Typography variant="body2">
                                {formatDate(donation.donatedAt)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Location */}
                        {donation?.location?.address && (
                          <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="flex-start" gap={1}>
                              <LocationOnRounded fontSize="small" color="error" sx={{ mt: 0.5 }} />
                              <Box>
                                <Typography variant="caption" color="textSecondary">
                                  Location
                                </Typography>
                                <Typography variant="body2" sx={{ maxWidth: 200 }}>
                                  {formatAddress(donation.location)}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        )}

                        {/* Notes */}
                        {donation.notes && (
                          <Grid item xs={12}>
                            <Box display="flex" alignItems="flex-start" gap={1}>
                              <NoteRounded fontSize="small" color="warning" sx={{ mt: 0.5 }} />
                              <Box>
                                <Typography variant="caption" color="textSecondary">
                                  Notes
                                </Typography>
                                <Typography variant="body2">
                                  {donation.notes}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        )}

                        {/* Status Badge */}
                        <Grid item xs={12}>
                          <Chip
                            label="Donation Completed"
                            color="success"
                            size="small"
                            icon={<BloodtypeRounded />}
                          />
                        </Grid>
                      </Grid>
                    {/* </CardContent> */}
                  </Box>
                </Grid>
              ))}
            </Grid>
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

export default BloodDonationHistoryDialog;