import React, { useEffect, useState } from 'react';
import { Card, CardMedia, CardContent, Typography, Tooltip, IconButton, Grid, Box, useMediaQuery, CircularProgress, Snackbar, Alert, alpha, Stack, Chip } from '@mui/material';
// import { fetchWishlist, removeFromWishlist } from '../../api/api';
import LazyImage from './LazyImage';
import SkeletonCards from './SkeletonCards';
// import ProductDetail from './ProductDetail';
import Layout from '../Layout';
import { useNavigate } from 'react-router-dom';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import { fetchWishlist, removeFromWishlist } from '../api/api';
import { useTheme } from '@emotion/react';
// import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
// import FavoriteIcon from '@mui/icons-material/Favorite';
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import WorkIcon from '@mui/icons-material/Work';
// import EmptyStateIcon from '@mui/icons-material/BookmarkBorder';

const WishList = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  // const [selectedProduct, setSelectedProduct] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loadingPostRemove, setLoadingPostRemove] = useState({}); // Track loading per post
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const tokenUsername = localStorage.getItem('tokenUsername');

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadWishlist = async () => {
      setLoading(true);
      try {
        const response = await fetchWishlist();
        setWishlist(response.data.wishlist.reverse() || []); // Assuming the backend response has `wishlist` array
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        // setError('Failed to fetch wishlist.');
        setSnackbar({ open: true, message: 'Failed to fetch your wishlist.', severity: 'error' });
        // setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    loadWishlist();
  }, []);

  const handleRemove = async (post) => {
    setLoadingPostRemove((prev) => ({ ...prev, [post._id]: true })); // Set loading for specific post
    try {
      await removeFromWishlist(post._id);
      setWishlist((prev) => prev.filter((prevPost) => prevPost._id !== post._id));
      setSnackbar({ open: true, message: `Post ${post.title} removed from wishlist successfully.`, severity: 'success' });
    } catch (error) {
      console.error('Error removing post:', error);
      // alert('Failed to remove post from wishlist.');
      setSnackbar({ open: true, message: 'Failed to removing post from your wishlist.', severity: 'error' });
    } finally {
      setLoadingPostRemove((prev) => ({ ...prev, [post._id]: false })); // Reset loading state
    }
  };

  const openPostDetail = (post) => {
    // setSelectedProduct(product);
    navigate(`/post/${post._id}`);
  };

  // if (loading) return <p>Loading wishlist...</p>;
  // if (error) return <p>{error}</p>;

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Layout username={tokenUsername}>
      <Box p={'0px'} sx={{ margin: '0rem' }}>
        {/* <Typography variant="h6" align="left" mx={isMobile ? "10px" : "16px"} marginTop="6px" gutterBottom>
          Wishlisted Posts
        </Typography> */}
        <Box mb={2} mx={isMobile ? "10px" : "16px"} mt="12px">
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            {/* <FavoriteIcon 
              sx={{ 
                fontSize: 32, 
                color: 'primary.main',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }} 
            /> */}
            <Box>
              <Typography 
                variant="h6" 
                fontWeight={600}
                sx={{
                  background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text', ml:'6px'
                }}
              >
                Wishlist
              </Typography>
              {/* <Typography variant="body1" color="text.secondary">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
              </Typography> */}
            </Box>
          </Stack>
        </Box>

        {/* <div style={{
          backgroundSize: 'cover', backgroundPosition: 'center', backdropFilter: 'blur(10px)'
        }}> */}
          <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`, paddingTop: '1rem', paddingBottom: '1rem', mx: isMobile ? '6px' : '8px', paddingInline: isMobile ? '6px' : '8px', borderRadius: '10px' }} > {/* sx={{ p: 2 }} */}
            {loading ? (
              <SkeletonCards />
            ) : (
              <Grid container spacing={2}>
                {wishlist.length > 0 ? (
                  wishlist.map((post) => (
                    <Grid item xs={12} sm={6} md={4} key={post._id}>
                      <Card
                      //  style={{
                      //   margin: '0rem 0',  // spacing between up and down cards
                      //   cursor: 'pointer',
                      //   backdropFilter: 'none',
                      //   backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      //   borderRadius: '8px',
                      //   boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', // Default shadow
                      //   transition: 'transform 0.1s ease, box-shadow 0.1s ease', // Smooth transition for hover
                      // }}
                      sx={{
                        position: 'relative',
                        cursor: 'pointer',
                        borderRadius: 3,
                        overflow: 'hidden',
                        backgroundColor: 'background.paper',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`,
                          '& .card-actions': {
                            opacity: 1,
                            transform: 'translateY(0)'
                          },
                          '& .price-chip': {
                            transform: 'scale(1.05)'
                          }
                        }
                      }}
                        onClick={() => openPostDetail(post)}
                        // onMouseEnter={(e) => {
                        //   e.currentTarget.style.transform = 'scale(1.02)'; // Slight zoom on hover
                        //   e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)'; // Enhance shadow
                        // }}
                        // onMouseLeave={(e) => {
                        //   e.currentTarget.style.transform = 'scale(1)'; // Revert zoom
                        //   e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)'; // Revert shadow
                        // }}
                        // onTouchStart={(e) => {
                        //   if (e.currentTarget) {
                        //     e.currentTarget.style.transform = 'scale(1.03)';
                        //     e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.2)'; // More subtle effect
                        //     e.currentTarget.style.borderRadius = '14px'; // Ensure smooth edges
                        //   }
                        // }}
                        // onTouchEnd={(e) => {
                        //   if (e.currentTarget) {
                        //     setTimeout(() => {
                        //       if (e.currentTarget) {
                        //         e.currentTarget.style.transform = 'scale(1)';
                        //         e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                        //       }
                        //     }, 150);
                        //   }
                        // }} 
                        >
                        {/* CardMedia for Images with Scroll */}
                        <CardMedia sx={{ position: 'relative', margin: '0rem 0', borderRadius: '8px', overflow: 'hidden', height: '160px', backgroundColor: alpha(theme.palette.grey[500], 0.1), }} >
                          <div style={{
                            display: 'flex',
                            overflowX: 'auto', overflowY: 'hidden',
                            scrollbarWidth: 'none',
                            scrollbarColor: '#888 transparent',
                            borderRadius: '8px',
                            gap: '0.1rem',
                            // marginBottom: '1rem'
                            height: '170px'
                          }} >
                            {post.media && post.media.length > 0 ? (
                              post.media.slice(0, 5).map((base64Image, index) => (
                                <LazyImage
                                  key={index}
                                  base64Image={base64Image}
                                  alt={`Product ${index}`}
                                  style={{
                                    height: '160px',
                                    borderRadius: '8px',
                                    objectFit: 'cover',
                                    flexShrink: 0,
                                    cursor: 'pointer',
                                  }}
                                />
                              ))
                            ) : (
                              // Show a placeholder image if no media is available
                              <img
                                src="https://placehold.co/56x56?text=No+Imag" // Replace with the path to your placeholder image
                                alt="No media available"
                                style={{
                                  height: '160px',
                                  borderRadius: '8px',
                                  objectFit: 'cover',
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </div>
                          <IconButton
                            onClick={(event) => {
                              event.stopPropagation(); // Prevent triggering the parent onClick
                              handleRemove(post);
                            }}
                            onMouseEnter={() => setHoveredId(post._id)} // Set hoveredId to the current button's ID
                            onMouseLeave={() => setHoveredId(null)} // Reset hoveredId when mouse leaves
                            style={{
                              position: 'absolute',
                              bottom: '10px',
                              right: '8px',
                              backgroundColor: hoveredId === post._id ? '#ffe6e6' : 'rgba(255, 255, 255, 0.2)',
                              borderRadius: hoveredId === post._id ? '12px' : '12px',
                              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                              display: 'flex',
                              alignItems: 'center', color: 'red'
                              // transition: 'all 0.2s ease',
                            }}
                          >
                            {hoveredId === post._id && (
                              <span
                                style={{
                                  fontSize: '14px',
                                  color: '#ff0000',
                                  marginRight: '8px',
                                  whiteSpace: 'nowrap',
                                  opacity: hoveredId === post._id ? 1 : 0,
                                  transform: hoveredId === post._id ? 'translateX(0)' : 'translateX(10px)',
                                  transition: 'opacity 0.3s, transform 0.3s',
                                }}
                              >
                                {loadingPostRemove[post._id] ? 'Removing...' : 'Remove from wishlist'}
                              </span>
                            )}
                            {loadingPostRemove[post._id] ? <CircularProgress size={20}/> : <HeartBrokenIcon />}
                          </IconButton>
                          {/* Status Badge */}
                          <Chip
                            label={post.postStatus}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              backgroundColor: post.postStatus === 'Active' ? 'success.main' : 'error.main',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                          {/* Full Time Badge */}
                          {post.isFullTime && (
                            <Chip
                              icon={<WorkIcon sx={{ fontSize: 16 }} />}
                              label="Full Time"
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                backgroundColor: 'info.main',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          )}

                          {/* Floating Action Buttons */}
                          <Box
                            className="card-actions"
                            sx={{
                              position: 'absolute',
                              bottom: 12,
                              right: 12,
                              display: 'flex',
                              gap: 1,
                              opacity: 0,
                              transform: 'translateY(10px)',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                sx={{
                                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                                  backdropFilter: 'blur(8px)',
                                  '&:hover': {
                                    backgroundColor: theme.palette.primary.main,
                                    color: 'white'
                                  }
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title={loadingPostRemove[post._id] ? 'Removing...' : 'Remove from wishlist'}>
                              <IconButton
                                size="small"
                                onClick={(e) => handleRemove(post, e)}
                                disabled={loadingPostRemove[post._id]}
                                sx={{
                                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                                  color: 'error.main',
                                  backdropFilter: 'blur(8px)',
                                  '&:hover': {
                                    backgroundColor: 'error.main',
                                    color: 'white'
                                  }
                                }}
                              >
                                {loadingPostRemove[post._id] ? (
                                  <CircularProgress size={16} color="inherit" />
                                ) : (
                                  <HeartBrokenIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                          </Box>

                          </CardMedia>
                          <CardContent style={{ padding: '10px' }}>
                            <Stack spacing={1.5}>
                              {/* Title and Price Row */}
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Tooltip title={post.title} placement="top">
                                  <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    sx={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      flex: 1,
                                      mr: 1,
                                      color: 'text.primary'
                                    }}
                                  >
                                    {post.title}
                                  </Typography>
                                </Tooltip>
                                
                                <Chip
                                  className="price-chip"
                                  icon={<PriceChangeIcon sx={{ fontSize: 16 }} />}
                                  label={`₹${post.price}`}
                                  variant="filled"
                                  sx={{
                                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                                    color: 'success.main',
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                    transition: 'transform 0.2s ease'
                                  }}
                                />
                              </Box>

                              {/* Category and People Count */}
                              <Box display="flex" gap={1} flexWrap="wrap">
                                <Chip
                                  icon={<CategoryIcon sx={{ fontSize: 14 }} />}
                                  label={post.categories}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: post.categories === 'Emergency' ? 'error.main' : 'divider',
                                    color: post.categories === 'Emergency' ? 'error.main' : 'text.secondary',
                                    fontSize: '0.75rem'
                                  }}
                                />
                                
                                <Chip
                                  icon={<PersonIcon sx={{ fontSize: 14 }} />}
                                  label={`${post.peopleCount} (${post.gender})`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                                />
                              </Box>

                              {/* Description */}
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1, // no of lines of description
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  lineHeight: 1.4
                                }}
                              >
                                {post.description}
                              </Typography>
                            </Stack>
                          {/* {post.isFullTime && 
                            <Typography sx={{ px: 2, py: 0.5, bgcolor: '#e0f7fa', color: '#006064', borderRadius: '999px', display: 'inline-block', float: 'right', fontWeight: '600', fontSize: '0.875rem' }}>
                              Full Time
                            </Typography>
                          }
                          <Tooltip title={post.title} placement="top" arrow>
                            <Typography variant="h6" component="div" style={{ fontWeight: 'bold', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {post.title.split(" ").length > 5 ? `${post.title.split(" ").slice(0, 5).join(" ")}...` : post.title}
                            </Typography>
                          </Tooltip>
                          <Typography variant="body1" color="textSecondary" style={{ display: 'inline-block', float: 'right', fontWeight: '500' }}>
                            Price: ₹{post.price}
                          </Typography>
                          <Typography variant="body2" color={post.categories === 'Emergency' ? 'rgba(194, 28, 28, 0.89)' : 'textSecondary'} style={{ marginBottom: '0.5rem' }}>
                            Category: {post.categories}
                          </Typography>
                          <Typography variant="body2" color={post.postStatus === 'Active' ? 'green' : 'rgba(194, 28, 28, 0.89)'} style={{ display: 'inline-block',float: 'right', marginBottom: '0.5rem' }}>
                            Status: {post.postStatus}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" style={{  marginBottom: '0.5rem' }}>
                            People Required: {post.peopleCount} ({post.gender})
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            style={{
                              marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis',
                              maxHeight: '4.5rem',  // This keeps the text within three lines based on the line height.
                              lineHeight: '1.5rem'  // Adjust to control exact line spacing.
                            }}>
                            Description: {post.description}
                          </Typography> */}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Box textAlign="center" sx={{ margin: 2, flex: 1 }}>
                    <Typography textAlign="center" color="grey"  variant="body1" >
                      Your wishlist is empty...
                    </Typography>
                  </Box>
                )}</Grid>
            )}
          </Box>
        {/* </div> */}
        {/* {selectedProduct && (
          <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        )} */}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius:'1rem' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default WishList;
