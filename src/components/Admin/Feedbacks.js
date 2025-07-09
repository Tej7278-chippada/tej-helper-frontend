import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Grid,
  Skeleton,
  useTheme,
  useMediaQuery,
  Pagination,
} from "@mui/material";
import {
  Person,
  Email,
  AccessTime,
  Image as ImageIcon,
  Close,
  Feedback as FeedbackIcon,
  AccountCircle,
} from "@mui/icons-material";
import Layout from "../Layout";
import { getAllFeedbacks } from "../api/adminApi";
// import { getAllFeedbacks } from "../adminApi"; // Import the API function

const Feedbacks = ({ darkMode, toggleDarkMode, unreadCount, shouldAnimate, userName }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbacksPerPage] = useState(6);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await getAllFeedbacks();
      setFeedbacks(response.data);
    } catch (err) {
      setError("Failed to fetch feedbacks. Please try again.");
      console.error("Error fetching feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageBase64) => {
    setSelectedImage(imageBase64);
    setImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
    setSelectedImage(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Pagination logic
  const indexOfLastFeedback = currentPage * feedbacksPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - feedbacksPerPage;
  const currentFeedbacks = feedbacks.slice(indexOfFirstFeedback, indexOfLastFeedback);
  const totalPages = Math.ceil(feedbacks.length / feedbacksPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const LoadingSkeleton = () => (
    <Grid container spacing={2} >
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} md={6} lg={4} key={index}>
        <Card key={index} sx={{ mb: 0, p: 2, borderRadius: '12px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ ml: 2, flex: 1 }}>
              <Skeleton variant="text" width="30%" />
              <Skeleton variant="text" width="50%" />
            </Box>
          </Box>
          <Skeleton variant="rectangular" height={60} />
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Skeleton variant="rectangular" width={80} height={80} />
            <Skeleton variant="rectangular" width={80} height={80} />
          </Box>
        </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Layout 
      darkMode={darkMode} 
      toggleDarkMode={toggleDarkMode} 
      unreadCount={unreadCount} 
      shouldAnimate={shouldAnimate} 
      userName={userName}
    >
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
        //   flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <FeedbackIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            User Feedbacks
          </Typography>
          <Chip 
            label={`${feedbacks.length} Total`} 
            color="primary" 
            sx={{ ml:  'auto' }}
          />
        </Box>

        {/* Error State */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={fetchFeedbacks}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && <LoadingSkeleton />}

        {/* Empty State */}
        {!loading && !error && feedbacks.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <FeedbackIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No feedbacks found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Users haven't submitted any feedback yet.
            </Typography>
          </Box>
        )}

        {/* Feedbacks Grid */}
        {!loading && !error && feedbacks.length > 0 && (
          <>
            <Grid container spacing={2}>
              {currentFeedbacks.map((feedback) => (
                <Grid item xs={12} md={6} lg={4} key={feedback._id}>
                  <Card 
                    sx={{ 
                      height: '100%', borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* User Info */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          {feedback.userId?.username ? 
                            feedback.userId.username.charAt(0).toUpperCase() : 
                            <AccountCircle />
                          }
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {feedback.userId?.username || 'Anonymous User'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {feedback.userId?.email || 'No email'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Feedback Content */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 2,
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          whiteSpace: "pre-wrap", // Retain line breaks and tabs
                          wordWrap: "break-word", // Handle long words gracefully
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {feedback.feedback}
                      </Typography>

                      {/* Media Images */}
                      {feedback.media && feedback.media.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            Attachments ({feedback.media.length})
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {feedback.media.slice(0, 3).map((image, index) => (
                              <Box
                                key={index}
                                sx={{
                                  width: 60,
                                  height: 60,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  position: 'relative',
                                  '&:hover': {
                                    opacity: 0.8,
                                  }
                                }}
                                onClick={() => handleImageClick(image)}
                              >
                                <img
                                  src={`data:image/jpeg;base64,${image}`}
                                  alt={`Feedback attachment ${index + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                  }}
                                />
                                {index === 2 && feedback.media.length > 3 && (
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      bgcolor: 'rgba(0, 0, 0, 0.6)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: 'white',
                                      fontSize: 12,
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    +{feedback.media.length - 3}
                                  </Box>
                                )}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Timestamp */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                        <AccessTime sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(feedback.createdAt)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                  size={isMobile ? 'small' : 'medium'}
                />
              </Box>
            )}
          </>
        )}

        {/* Image Dialog */}
        <Dialog
          open={imageDialogOpen}
          onClose={handleCloseImageDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              maxHeight: '90vh',
              m: 2, borderRadius: '12px'
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            pb: 1
          }}>
            <Typography variant="h6">Feedback Image</Typography>
            <IconButton onClick={handleCloseImageDialog}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {selectedImage && (
              <img
                src={`data:image/jpeg;base64,${selectedImage}`}
                alt="Feedback attachment"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Feedbacks;