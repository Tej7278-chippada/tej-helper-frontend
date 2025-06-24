// src/components/Helper/PostService.js
import React, { useCallback, useEffect, useState } from 'react';
import { TextField, Button, Card, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Alert, Box, Toolbar, Grid, CardMedia, CardContent, Tooltip, CardActions, Snackbar, useMediaQuery, IconButton, CircularProgress, LinearProgress, alpha, Fade, Avatar, Paper, Divider, } from '@mui/material';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '@emotion/react';
import LazyBackgroundImage from '../Helper/LazyBackgroundImage';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import Layout from '../Layout';
import SkeletonCards from '../Helper/SkeletonCards';
import { addAdminBanner, deleteAdminBanner, fetchAdminBanners, fetchBannerMediaById, imageGenerationBanner, updateAdminBanner } from '../api/adminApi';

import {
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  Check as CheckIcon,
  AutoAwesome as AutoAwesomeIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import DemoPosts from '../Helper/DemoPosts';


// Custom glassmorphism styling
const getGlassmorphismStyle = (theme, darkMode) => ({
  background: darkMode
    ? 'rgba(205, 201, 201, 0.15)'
    : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  backdropFilter: 'blur(20px)',
  border: darkMode
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : 'null', // '1px solid rgba(255, 255, 255, 0.2)'
  boxShadow: darkMode
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
});




function Banner({ darkMode, toggleDarkMode, unreadCount, shouldAnimate }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [banners, setBanners] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    media: null,
  });
  const [editingBanner, setEditingBanner] = useState(null);
  const [existingMedia, setExistingMedia] = useState([]);
  const [newMedia, setNewMedia] = useState([]);
  const [mediaError, setMediaError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [loadingBannerDeletion, setLoadingBannerDeletion] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [loadingGeneration, setLoadingGeneration] = useState(false);
  const [noImagesFound, setNoImagesFound] = useState(false); 
  const tokenUsername = localStorage.getItem('tokenUsername');
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [loadingImage, setLoadingImage] = useState(null); // Track which image is loading
  const [addedImages, setAddedImages] = useState([]); // Store successfully added image URLs


  const fetchBannersData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchAdminBanners();
      setBanners(response.data || []);
    } catch (error) {
      console.error('Error fetching your banners:', error);
      setSnackbar({ open: true, message: 'Failed to fetch your banners.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  // this useEffect hook for initial data fetch
  useEffect(() => {
    fetchBannersData();
  }, [fetchBannersData]);

  // Fetch images from Unsplash based on title
  const fetchUnsplashImages = async (query) => {
    try {
      setLoadingGeneration(true);
      setNoImagesFound(false); // Reset no images found state
      const response = await imageGenerationBanner(query);
      if (response.data.results.length === 0) {
        setNoImagesFound(true); // Set no images found state
      }
      setGeneratedImages(response.data.results);
    } catch (error) {
      console.error("Error fetching images:", error);
      setNoImagesFound(true); // Also set the state if API fails
    } finally {
      setLoadingGeneration(false);
    }
  };


  const fetchBannerMedia = async (bannerId) => {
    setLoadingMedia(true);
    try {
      const response = await fetchBannerMediaById(bannerId);
      setExistingMedia(response.data.media.map((media, index) => ({ data: media.toString('base64'), _id: index.toString(), remove: false })));
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error('Banner Unavailable.', error);
        setSnackbar({ open: true, message: "Banner Unavailable.", severity: "warning" });
      } else if (error.response && error.response.status === 401) {
        console.error('Error fetching banner details:', error);
      } else {
        console.error('Error fetching banner details:', error);
      }
    } finally {
      setLoadingMedia(false);
    }
  };

  const resizeImage = (blob, maxSize) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set the new dimensions
        let width = img.width;
        let height = img.height;
        const scaleFactor = Math.sqrt(maxSize / blob.size); // Reduce size proportionally

        width *= scaleFactor;
        height *= scaleFactor;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to Blob
        canvas.toBlob(
          (resizedBlob) => {
            resolve(resizedBlob);
          },
          "image/jpeg",
          0.8 // Compression quality
        );
      };
    });
  };


  // Add selected image to new media from UnSplash
  const handleSelectImage = async (imageUrl) => {
    try {
      setLoadingImage(imageUrl); // Start loading progress on the selected image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const existingMediaCount = existingMedia.filter((media) => !media.remove).length;
      const totalMediaCount = newMedia.length + existingMediaCount + 1; // Adding 1 for the new image

      if (totalMediaCount > 8) {
        setMediaError("Maximum 8 photos allowed.");
        setLoadingImage(null); // Remove loading if failed
        setSnackbar({ open: true, message: 'Maximum 8 photos allowed.', severity: 'warning' });
        return; // Prevent adding the image
      }

      let file;
      if (blob.size > 2 * 1024 * 1024) { // If the image is larger than 2MB
        const resizedBlob = await resizeImage(blob, 1 * 1024 * 1024); // Resize image
        file = new File([resizedBlob], `unsplash-${Date.now()}.jpg`, { type: "image/jpeg" });
      } else {
        // Directly add if the image is <= 2MB
        file = new File([blob], `unsplash-${Date.now()}.jpg`, { type: "image/jpeg" });
        // setNewMedia((prev) => [...prev, file]);
      }
      setNewMedia((prev) => [...prev, file]);
      setMediaError(""); // Clear error if image is added successfully
      // Show green tick after successful addition
      setAddedImages((prev) => [...prev, imageUrl]);
    } catch (err) {
      console.error("Error processing image:", err);
    } finally {
      setLoadingImage(null); // Remove loading animation
    }
  };

  const handleDeleteMedia = (mediaId) => {
    setExistingMedia(existingMedia.map(media => media._id === mediaId ? { ...media, remove: true } : media));
    // Calculate the total media count after deletion
    const updatedTotalMedia = newMedia.length + existingMedia.filter(media => !media.remove && media._id !== mediaId).length;

    // Remove error message if media count is within the limit
    if (updatedTotalMedia <= 5) {
      setMediaError("");
    }
  };

  const handleRemoveNewMedia = (index) => {
    setNewMedia((prev) => {
      const updatedMedia = prev.filter((_, i) => i !== index);

      // Calculate the total media count after deletion
      const updatedTotalMedia = updatedMedia.length + existingMedia.filter(media => !media.remove).length;

      // Remove error message if media count is within the limit
      if (updatedTotalMedia <= 8) {
        setMediaError("");
      }

      return updatedMedia;
    });
  };


  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    const resizedFiles = [];

    for (const file of selectedFiles) {
      if (file.size > 2 * 1024 * 1024) { // If file is larger than 2MB
        const resizedBlob = await resizeImage(file, 2 * 1024 * 1024);
        const resizedFile = new File([resizedBlob], file.name, { type: file.type });
        resizedFiles.push(resizedFile);
      } else {
        resizedFiles.push(file); // Keep original if <= 2MB
      }
    }

    const existingMediaCount = existingMedia.filter((media) => !media.remove).length;
    const totalMediaCount = resizedFiles.length + newMedia.length + existingMediaCount;

    // Check conditions for file count
    if (totalMediaCount > 8) {
      setMediaError("Maximum 8 photos allowed.");
      setSnackbar({ open: true, message: 'Maximum 8 photos allowed.', severity: 'warning' });
    } else {
      setMediaError("");
      // Append newly selected files at the end of the existing array
      setNewMedia((prevMedia) => [...prevMedia, ...resizedFiles]); // Add resized/valid files
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading state
    const data = new FormData();

    // Add only new media files to FormData
    newMedia.forEach((file) => data.append('media', file));
    // Append form data
    Object.keys(formData).forEach(key => {
      if (key !== 'media') data.append(key, formData[key]);
    });

    // Include IDs of existing media to keep
    const mediaToKeep = existingMedia.filter(media => !media.remove).map(media => media._id);
    if (mediaToKeep.length > 0) {
      data.append('existingMedia', JSON.stringify(mediaToKeep));
    }

    try {
      if (editingBanner) {
        await updateAdminBanner(editingBanner._id, data);
        setSnackbar({ open: true, message: `${formData.title} details updated successfully.`, severity: 'success' });
      } else {
        await addAdminBanner(data);
        setSnackbar({ open: true, message: `New Banner "${formData.title}" is added successfully.`, severity: 'success' });
      }
      await fetchBannersData(); // Refresh products list
      handleCloseDialog();       // Close dialog
    } catch (error) {
      console.error("Error submitting post:", error);
      setSnackbar({
        open: true, message: editingBanner
          ? `${formData.title} details can't be updated, please try again later.`
          : `New Banner can't be added, please try again later.`, severity: 'error'
      });
    } finally {
      setLoading(false); // Stop loading state
    }
  };


  const handleEdit = (banner) => {
    fetchBannerMedia(banner._id); // to fetch the post's entire media
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
    });
    setOpenDialog(true);
  };


  const handleDeleteClick = (banner) => {
    setSelectedBanner(banner);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBanner) return;
    setLoadingBannerDeletion(true);
    try {
      await deleteAdminBanner(selectedBanner._id);
      setSnackbar({ open: true, message: `Post "${selectedBanner.title}" deleted successfully.`, severity: 'success' });
      await fetchBannersData(); // Refresh posts list
      setLoadingBannerDeletion(false);
    } catch (error) {
      console.error("Error deleting banner:", error);
      setSnackbar({ open: true, message: `Failed to delete "${selectedBanner.title}". Please try again later.`, severity: 'error' });
      setLoadingBannerDeletion(false);
    }
    setDeleteDialogOpen(false); // Close dialog after action
    setLoadingBannerDeletion(false);
  };

  const handleOpenDialog = () => {
    // Reset form data to empty
    setFormData({
      title: '',
      media: null,
    });
    setEditingBanner(null); // Ensure it's not in editing mode
    setExistingMedia([]);
    setNewMedia([]);
    setGeneratedImages([]);
    setNoImagesFound(false);
    setOpenDialog(true);
    setValidationErrors({});
  };

  const handleCloseDialog = () => {
    setFormData({
      title: '',
      media: null,
    });
    setEditingBanner(null);
    setExistingMedia([]);
    setNewMedia([]);
    setOpenDialog(false);
    setMediaError('');
    setSubmitError('');
    setFormData({ title: '', media: null });
    setGeneratedImages([]);
    setNoImagesFound(false);
    setValidationErrors({});
  };

  const openBannerDetail = (banner) => {
    // navigate(`/post/${banner._id}`);
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });


  return (
    <Layout username={tokenUsername} darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate}>
      <DemoPosts isMobile={isMobile} postId={'685afb2de9b24aff7187478e'} api={fetchBannerMediaById} />
      <Box>
        <Toolbar sx={{
          display: 'flex', justifyContent: 'space-between',
          borderRadius: '12px',
          padding: isMobile ? '2px 12px' : '2px 12px', margin: '4px',
          position: 'relative',
          top: 0,
        }}>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{
              background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', //background: '#4361ee',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Banner cards
          </Typography>



          <Button
            variant="contained"
            onClick={() => handleOpenDialog()}
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
              color: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(67, 97, 238, 0.4)',
                transform: 'translateY(-2px)',
              },
              display: 'flex',
              alignItems: 'center',
              gap: '8px', marginRight: '0px',
              textTransform: 'none',
              fontWeight: 600,
            }}
            aria-label="Add New Post"
            title="Add New Post"
          >
            <PostAddRoundedIcon sx={{ fontSize: '20px' }} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Add Banner</span>
          </Button>

        </Toolbar>
        <Box sx={{ background: 'rgba(255, 255, 255, 0)', backdropFilter: 'blur(10px)', paddingTop: '1rem', paddingBottom: '1rem', mx: isMobile ? '6px' : '8px', paddingInline: '8px', borderRadius: '10px' }}> {/* sx={{ p: 2 }} */}
          {loading ? (
            <SkeletonCards />
          ) : (
            <Grid container spacing={1.5}>
              {banners.length > 0 ? (
                banners.map((banner) => (
                  <Grid item xs={12} sm={6} md={4} key={banner._id}>
                    <Card sx={{
                      margin: '0rem 0', borderRadius: 3, overflow: 'hidden',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`,
                        '& .card-actions': {
                          opacity: 1,
                          transform: 'translateY(0)'
                        },
                        '& .price-chip': {
                          transform: 'scale(1.05)'
                        }
                      },
                      cursor: 'pointer', position: 'relative',
                      height: isMobile ? '280px' : '320px',
                    }} onClick={() => openBannerDetail(banner)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)'; // Slight zoom on hover
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)'; // Enhance shadow
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'; // Revert zoom
                        e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)'; // Revert shadow
                      }}
                    >
                      <LazyBackgroundImage
                        base64Image={banner.media?.[0]}
                        alt={banner.title}
                      >

                        {/* Gradient Overlay */}
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '60%',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)'
                        }} />
                        <CardContent sx={{
                          position: 'absolute',
                          bottom: 30,
                          left: 0,
                          right: 0,
                          padding: '16px',
                          color: 'white'
                        }}>
                          <Tooltip title={banner.title} placement="top" arrow>
                            <Typography variant="h6" component="div" style={{ fontWeight: 'bold', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white' }}>
                              {banner.title.split(" ").length > 5 ? `${banner.title.split(" ").slice(0, 5).join(" ")}...` : banner.title}
                            </Typography>
                          </Tooltip>
                          <Typography variant="body2" style={{ marginBottom: '0.5rem' }}>
                            ID: {banner._id}
                          </Typography>
                        </CardContent>
                        <CardActions style={{
                          justifyContent: 'space-between', padding: '12px 1rem', position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          color: 'white'
                        }}>
                          <Box>
                            
                            <Button color="secondary" size="small" variant="outlined" startIcon={<DeleteSweepRoundedIcon />} key={banner._id} sx={{ borderRadius: '8px' }} onClick={(event) => { event.stopPropagation(); handleDeleteClick(banner); }}>Delete</Button>
                          </Box>
                          
                          <Button color="primary" size="small" variant="outlined" startIcon={<EditNoteRoundedIcon />} sx={{ marginRight: '10px', borderRadius: '8px' }} onClick={(event) => {
                            event.stopPropagation(); // Prevent triggering the parent onClick
                            handleEdit(banner);
                          }}>Edit</Button>
                        </CardActions>
                      </LazyBackgroundImage>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography color='grey' padding="2rem" variant="body1">
                    You don't have any banners yet...
                  </Typography>
                  <Button
                    variant="outlined"
                    sx={{ mt: 2, borderRadius: '12px' }}
                    onClick={() => handleOpenDialog()}
                  >
                    <PostAddRoundedIcon sx={{ fontSize: '20px', mr: '8px' }} />
                    Add your first banner
                  </Button>
                </Box>
              )}

            </Grid>)}
          {banners.length > 0 && (
            <Box sx={{
              textAlign: 'center',
              p: 3,
              backgroundColor: 'rgba(25, 118, 210, 0.05)',
              borderRadius: '12px',
              mt: 2
            }}>
              <Typography color="text.secondary">
                No more baners of yous...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              </Typography>
            </Box>
          )}
        </Box>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth fullScreen={isMobile ? true : false}
          PaperProps={{
            sx: {
              borderRadius: isMobile ? 0 : 4,
              ...getGlassmorphismStyle(theme, darkMode),
            }
          }}
          sx={{
            '& .MuiDialogTitle-root': { padding: isMobile ? '1rem' : '1rem', },
          }}
        >
          <DialogTitle
            component="div"  // <-- avoid rendering an <h2>
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
              color: 'white',
              position: 'relative',
            }}
          >
            <Typography variant="h5" fontWeight={600}>
              {editingBanner ? 'Update Banner' : 'Create New Banner'}
            </Typography>

            <IconButton
              onClick={handleCloseDialog}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ px: 2, py: 3, minHeight: '200px' }}>
            <Fade in timeout={300}>
              <Box>
                {/* Image Generation Section */}
                <Card
                  elevation={0}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(233, 30, 99, 0.05) 100%)',
                    borderRadius: 3,
                    border: '1px solid rgba(156, 39, 176, 0.1)',
                    my: 3, '& .MuiCardContent-root': { padding: '1rem', },
                  }}
                >
                  <CardContent >
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                        <AutoAwesomeIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        AI Image Generation
                      </Typography>
                    </Box>

                    <TextField
                      label="Banner Title"
                      fullWidth
                      error={!!validationErrors.title}
                      helperText={validationErrors.title}
                      value={formData.title} required
                      onChange={(e) => {
                        const maxLength = 100; // Set character limit
                        if (e.target.value.length <= maxLength) {
                          setFormData({ ...formData, title: e.target.value });
                          // Clear error when typing
                          if (validationErrors.title) {
                            setValidationErrors(prev => ({ ...prev, title: undefined }));
                          }
                        }
                      }}
                      inputProps={{ maxLength: 100 }} // Ensures no more than 100 characters can be typed
                      sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      placeholder="Enter a descriptive title for better image generation"
                    />

                    <Box display="flex" justifyContent="center" alignItems="center" gap={2} mb={2}>
                      <Typography variant="caption" color="text.secondary">
                        AI will generate relevant images based on your title
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AutoAwesomeIcon />}
                        onClick={() => fetchUnsplashImages(formData.title)}
                        disabled={loadingGeneration || !formData.title}
                        sx={{ borderRadius: 2, px: isMobile ? '24px' : 'null' }}
                      >
                        Generate Images
                      </Button>
                    </Box>

                    {loadingGeneration && (
                      <Box sx={{ mb: 2 }}>
                        <LinearProgress sx={{ borderRadius: 1, height: 6 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Generating amazing images for you...
                        </Typography>
                      </Box>
                    )}

                    {generatedImages.length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                        <Paper
                          elevation={0}
                          sx={{
                            minWidth: 120,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            bgcolor: 'rgba(0,0,0,0)',
                            position: 'relative',
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex", gap: "4px", paddingBottom: '0px', overflowX: "auto",
                            }}
                          >
                            {generatedImages.map((img) => (
                              <Box key={img.id} sx={{ position: "relative", cursor: "pointer" }} onClick={() => handleSelectImage(img.urls.full)}>
                                <img
                                  src={img.urls.thumb}
                                  alt="Generated"
                                  style={{ height: "120px", borderRadius: "8px", opacity: loadingImage === img.urls.full ? 0.6 : 1 }}
                                />
                                {/* Loading progress overlay */}
                                {loadingImage === img.urls.full && (
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      top: "50%",
                                      left: "50%",
                                      transform: "translate(-50%, -50%)",
                                      bgcolor: "rgba(0, 0, 0, 0.5)",
                                      borderRadius: "50%",
                                      padding: "10px",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                                  </Box>
                                )}

                                {/* Green tick when successfully added */}
                                {addedImages.includes(img.urls.full) && (
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: 8,
                                      right: 8,
                                      bgcolor: 'success.main',
                                      borderRadius: '50%',
                                      width: 24,
                                      height: 24,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <CheckIcon sx={{ fontSize: 16, color: 'white' }} />
                                  </Box>
                                )}
                              </Box>
                            ))}
                          </Box>
                        </Paper>
                      </Box>
                    ) : noImagesFound ? (
                      <Box sx={{ textAlign: 'center', my: 2 }}>
                        <Typography color="warning" sx={{ mb: 2 }}>Images doesn't found related to the title, please check the title.</Typography>
                      </Box>
                    ) : null
                    }
                  </CardContent>
                </Card>

                {validationErrors.media && (
                  <Alert severity="error" sx={{ my: 1 }}>
                    {validationErrors.media}
                  </Alert>
                )}

                {/* Photo Upload Section */}
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.1)' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                        <PhotoCameraIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        Upload Photos
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<AddPhotoAlternateRoundedIcon />}
                      sx={{ borderRadius: 2, mb: 2, bgcolor: 'rgba(24, 170, 248, 0.07)' }}
                      fullWidth={isMobile}
                    >
                      Choose Photos
                      <input type="file" multiple hidden onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg, image/webp" />
                    </Button>
                    {mediaError && <Alert severity="error">{mediaError}</Alert>}

                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      Maximum 8 photos allowed. Supported formats: PNG, JPG, JPEG, WebP
                    </Typography>
                    {newMedia.length > 0 && (
                      <Box sx={{ display: 'flex', gap: '4px', p: '6px', borderRadius: '12px', overflowX: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#888 transparent', bgcolor: '#f5f5f5' }}>
                        {newMedia.map((file, index) => (
                          <Box key={index} style={{ display: 'flex', position: 'relative', alignItems: 'flex-start', flexDirection: 'column' }}>
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index}`}
                              style={{
                                height: '120px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                flexShrink: 0,
                                cursor: 'pointer' // Make the image look clickable
                              }}
                            />
                            <IconButton
                              size="small" onClick={() => handleRemoveNewMedia(index)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'error.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'error.dark' }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {editingBanner &&
                      <Box sx={{ mt: 1, p: '6px', bgcolor: '#f5f5f5', borderRadius: '12px' }} >
                        {/* Existing media with delete option */}
                        <Typography variant="subtitle1">Images previously posted</Typography>
                        <Box sx={{ display: 'flex', borderRadius: '8px', gap: '4px', overflowX: 'scroll', scrollbarWidth: 'thin', scrollbarColor: '#888 transparent' }}>
                          {loadingMedia ?
                            <Box display="flex" justifyContent="center" alignItems="center" flexDirection="row" m={2} gap={1} flex={1}>
                              <CircularProgress size={24} />
                              <Typography color='grey' variant='body2'>Loading Images previously posted</Typography>
                            </Box>
                            :
                            (existingMedia.length > 0)
                              ? existingMedia.map((media) => (
                                !media.remove && (
                                  <Box key={media._id} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                                    <img src={`data:image/jpeg;base64,${media.data}`} alt="Post Media" style={{ height: '120px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }} />
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteMedia(media._id)}
                                      sx={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        bgcolor: 'error.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'error.dark' }
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                )))
                              : (
                                <Box display="flex" justifyContent="center" alignItems="center" flexDirection="row" m={1} gap={1} flex={1}>
                                  <Typography variant="body2" color="grey" >Banner doesn't have existing images.</Typography>
                                </Box>
                              )
                          }
                        </Box>
                      </Box>
                    }
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          </DialogContent>

          <Divider />
          {submitError && <Alert severity="error" style={{ margin: '1rem' }}>{submitError}</Alert>}
          <DialogActions sx={{ px: isMobile ? 2 : 3, py: 2, gap: 2 }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ borderRadius: 2 }}
              disabled={loading}
            >
              Cancel
            </Button>

            <Box sx={{ flex: 1 }} />
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                borderRadius: 2, px: isMobile ? '3rem' : '8px',
                minWidth: 120,
                background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #388e3c 0%, #689f38 100%)'
                }
              }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {loading ? 'Publishing...' : (editingBanner ? 'Update Banner' : 'Add Banner')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* existed post Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="delete-dialog-title"
          sx={{ '& .MuiPaper-root': { borderRadius: '14px' }, }}
        >
          <DialogTitle id="delete-dialog-title" >
            Are you sure you want to delete this banner?
          </DialogTitle>
          <DialogContent style={{ padding: '2rem' }}>
            <Typography color='error'>
              If you proceed, the post <strong>{selectedBanner?.title}</strong> will be removed permanently...
            </Typography>
          </DialogContent>
          <DialogActions style={{ padding: '1rem', gap: 1 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} variant='outlined' color="primary" sx={{ borderRadius: '8px' }}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} variant='contained' color="error" sx={{ marginRight: '10px', borderRadius: '8px' }}>
              {loadingBannerDeletion ? <> <CircularProgress size={20} sx={{ marginRight: '8px' }} /> Deleting... </> : "Delete Post"}
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: '1rem' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );

}

export default Banner;
