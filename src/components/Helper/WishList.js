import React, { useEffect, useState } from 'react';
import { Card, CardMedia, CardContent, Typography, Tooltip, IconButton, Grid, Box, useMediaQuery, CircularProgress, Snackbar, Alert } from '@mui/material';
// import { fetchWishlist, removeFromWishlist } from '../../api/api';
import LazyImage from './LazyImage';
import SkeletonCards from './SkeletonCards';
// import ProductDetail from './ProductDetail';
import Layout from '../Layout';
import { useNavigate } from 'react-router-dom';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import { fetchWishlist, removeFromWishlist } from '../api/api';
import { useTheme } from '@emotion/react';

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

  useEffect(() => {
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
    <Layout>
      <Box p={'4px'} sx={{ margin: '0rem' }}>
        <Typography variant="h6" align="left" mx="8px" marginTop="4px" gutterBottom>
          Wishlisted Posts
        </Typography>

        {/* <div style={{
          backgroundSize: 'cover', backgroundPosition: 'center', backdropFilter: 'blur(10px)'
        }}> */}
          <Box sx={{ bgcolor: '#f5f5f5', paddingTop: '1rem', paddingBottom: '1rem', paddingInline: isMobile ? '6px' : '8px', borderRadius: '10px' }} > {/* sx={{ p: 2 }} */}
            {loading ? (
              <SkeletonCards />
            ) : (
              <Grid container spacing={1}>
                {wishlist.length > 0 ? (
                  wishlist.map((post) => (
                    <Grid item xs={12} sm={6} md={4} key={post._id}>
                      <Card style={{
                        margin: '0rem 0',  // spacing between up and down cards
                        cursor: 'pointer',
                        backdropFilter: 'none',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '8px',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', // Default shadow
                        transition: 'transform 0.1s ease, box-shadow 0.1s ease', // Smooth transition for hover
                      }}
                        onClick={() => openPostDetail(post)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.02)'; // Slight zoom on hover
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)'; // Enhance shadow
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)'; // Revert zoom
                          e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)'; // Revert shadow
                        }} >
                        {/* CardMedia for Images with Scroll */}
                        <CardMedia sx={{ position: 'relative', margin: '0rem 0', borderRadius: '8px', overflow: 'hidden', height: '160px', backgroundColor: '#f5f5f5' }} >
                          <div style={{
                            display: 'flex',
                            overflowX: 'auto',
                            scrollbarWidth: 'thin',
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
                        </CardMedia>
                        <CardContent style={{ padding: '10px' }}>
                          <Tooltip title={post.title} placement="top" arrow>
                            <Typography variant="h5" component="div" style={{ fontWeight: 'bold', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {post.title.split(" ").length > 5 ? `${post.title.split(" ").slice(0, 5).join(" ")}...` : post.title}
                            </Typography>
                          </Tooltip>
                          <Typography variant="body1" color="textSecondary" style={{ display: 'inline-block', float: 'right', fontWeight: '500' }}>
                            Price: ₹{post.price}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                            Gender: {post.gender}
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
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Box textAlign="center" sx={{ margin: 2 }}>
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
