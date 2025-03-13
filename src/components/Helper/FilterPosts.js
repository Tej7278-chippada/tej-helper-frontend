import React, { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, TextField, MenuItem, Select, FormControl, InputLabel, Grid, Typography, Tooltip, CardContent, CardMedia, Card, useMediaQuery, } from '@mui/material';
import { useTheme } from '@emotion/react';
import LazyImage from './LazyImage';
import PostDetailsById from './PostDetailsById';
import { useNavigate } from 'react-router-dom';

const FilterPosts = ({ filterCriteria, applyFilters, posts, filteredPosts, onClose }) => {
    const navigate = useNavigate();
    // Initial state for filters
  const initialFilterState = {
    categories: "",
    gender: "",
    postStatus: "",
    priceRange: [0, 10000],
  };
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [localFilters, setLocalFilters] = useState(filterCriteria || initialFilterState);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showFilteredProducts, setShowFilteredProducts] = useState(false);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handlePriceChange = (e, type) => {
        const value = parseInt(e.target.value, 10);
        setLocalFilters((prev) => ({
            ...prev,
            priceRange: type === 'min'
                ? [value, prev.priceRange[1]]
                : [prev.priceRange[0], value],
        }));
    };

    const handleApplyFilters = () => {
        applyFilters(localFilters);
        setShowFilteredProducts(true); // Show filtered products after "Apply"
        // onClose(); // Close the filter dialog
    };

    const handleResetFilters = () => {
      setLocalFilters(initialFilterState);
      applyFilters(initialFilterState);
      setShowFilteredProducts(false);
    };

    const openPostDetail = (post) => {
        // setSelectedProduct(post);
        navigate(`/post/${post._id}`);
    };

    const handleDialogClose = () => {
        // setLocalFilters(initialFilterState); // Reset filters to default
        // setShowFilteredProducts(false); // Hide filtered products
        onClose(); // Trigger parent close action
      };

    return (
        <Dialog open={true} onClose={handleDialogClose} fullScreen={true}  sx={{margin:'10px', borderRadius:'3', '& .MuiPaper-root': { borderRadius: '16px', scrollbarColor: '#aaa transparent', scrollbarWidth:'thin' },  }}
        >
            {selectedPost && (
                <PostDetailsById post={selectedPost} onClose={() => setSelectedPost(null)} />
            )}
            <DialogTitle sx={{ height: '0px', marginBottom:'1rem' }}>
                Filter Posts
                <Button style={{ float: 'right', marginTop: '-2px' }} variant="text" onClick={handleDialogClose}>Close</Button>
            </DialogTitle>
            <DialogContent sx={{padding: isMobile ? '2px' : '6px', marginTop: '10px',}}>
                <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                    gap={1}  sx={{bgcolor: '#f5f5f5', borderRadius:'10px', height: isMobile ? 'auto' : '96%', paddingBlock: isMobile ? '8px' : '10px', paddingInline: isMobile ? '2px' : '6px'}}
                >
                    {/* Filter Fields */}
                    <Card sx={{
                        flex: 1,
                        // height: 'auto', // Fixed height relative to viewport
                        overflowY: 'auto',
                        bgcolor: 'white', // Card background color (customizable)
                        borderRadius: '8px', // Card border radius (customizable)
                        boxShadow: 3, // Shadow for a modern look
                        scrollbarWidth: 'thin'
                    }}>
                        <CardContent>
                            <Box
                                flex={isMobile ? "1" : "0 0 30%"}
                                style={{ paddingRight: isMobile ? "0" : "0rem" }}
                            >
                                <Typography variant="h6" gutterBottom>
                                    Filters
                                </Typography>
                                <Box display="flex" gap={2} flexWrap="wrap" paddingBottom="0.6rem">
                                    <FormControl style={{ flex: '1 1 200px' }}>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            name="categories"
                                            value={localFilters.categories || ''}
                                            onChange={handleFilterChange}
                                            label="Category"
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            <MenuItem value="Paid">Paid</MenuItem>
                                            <MenuItem value="UnPaid">UnPaid</MenuItem>
                                            <MenuItem value="Emergency">Emergency</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl style={{ flex: '1 1 200px' }}>
                                        <InputLabel>Gender</InputLabel>
                                        <Select
                                            name="gender"
                                            value={localFilters.gender || ''}
                                            onChange={handleFilterChange}
                                            label="Gender"
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            <MenuItem value="Male">Male</MenuItem>
                                            <MenuItem value="Female">Female</MenuItem>
                                            <MenuItem value="Kids">Kids</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl style={{ flex: '1 1 200px' }}>
                                        <InputLabel>Post Status</InputLabel>
                                        <Select
                                            name="postStatus"
                                            value={localFilters.postStatus || ''}
                                            onChange={handleFilterChange}
                                            label="Post Status"
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            <MenuItem value="Active">Active</MenuItem>
                                            <MenuItem value="InActive">InActive</MenuItem>
                                            <MenuItem value="Closed">Closed</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <Box display="flex" gap={2} flex="1 1 auto">
                                        <TextField
                                            label="Min Price"
                                            type="number"
                                            value={localFilters.priceRange[0]}
                                            onChange={(e) => handlePriceChange(e, 'min')}
                                            fullWidth
                                        />
                                        <TextField
                                            label="Max Price"
                                            type="number"
                                            value={localFilters.priceRange[1]}
                                            onChange={(e) => handlePriceChange(e, 'max')}
                                            fullWidth
                                        />
                                    </Box>
                                </Box>

                                {/* Reset Filters Button */}
                                <Button
                                  variant="outlined"
                                  onClick={handleResetFilters}
                                  style={{ alignSelf: 'flex-end', float: 'center', marginTop: '1rem', marginRight: '1rem' }} fullWidth
                                >
                                  Reset Filters
                                </Button>

                                {/* Apply Button */}
                                <Button
                                    variant="contained"
                                    onClick={handleApplyFilters}
                                    style={{ alignSelf: 'flex-end', float: 'center', marginTop: '1rem' ,}} fullWidth
                                >
                                    Apply Filters
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                    <Card sx={{
                        flex: 3,
                        height: '73hv', // Fixed height relative to viewport
                        overflowY: 'auto',
                        bgcolor: 'white', // Card background color (customizable)
                        borderRadius: '8px', // Card border radius (customizable)
                        boxShadow: 3, // Shadow for a modern look
                        scrollbarWidth: 'thin'
                    }}>
                        <CardContent>
                            {/* Display Filtered Products */}
                            {showFilteredProducts && (
                                <Box flex={isMobile ? "1" : "0 0 70%"} marginInline={isMobile ? "-12px" : "-2px"}>
                                    <Typography variant="h6" paddingLeft="10px" gutterBottom>
                                        Filtered Products
                                    </Typography>
                                    <Grid container spacing={isMobile ? 1 : 2}  sx={{ paddingInline : isMobile ? '1px' : '1px'}}>
                                        {filteredPosts.map((post) => (
                                            <Grid item xs={12} sm={6} md={4} key={post._id}>
                                            <Card style={{
                                                margin: '0rem 0',  // spacing between up and down cards
                                                cursor: 'pointer',
                                                backdropFilter: 'none',
                                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                borderRadius: '8px',
                                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', // Default shadow
                                                transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth transition for hover
                                              }}
                                                // onClick={() => openProductDetail(product)}
                                                onMouseEnter={(e) => {
                                                  e.currentTarget.style.transform = 'scale(1.02)'; // Slight zoom on hover
                                                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)'; // Enhance shadow
                                                }}
                                                onMouseLeave={(e) => {
                                                  e.currentTarget.style.transform = 'scale(1)'; // Revert zoom
                                                  e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)'; // Revert shadow
                                                }} >
                                              {/* CardMedia for Images with Scroll */}
                                              <CardMedia style={{ margin: '0rem 0',borderRadius: '8px', overflow: 'hidden', height: '200px', backgroundColor: '#f5f5f5' }}>
                                                <div style={{
                                                  display: 'flex',
                                                  overflowX: 'auto',
                                                  scrollbarWidth: 'thin',
                                                  scrollbarColor: '#888 transparent',
                                                  borderRadius: '8px',
                                                  gap: '0.1rem',
                                                  // marginBottom: '1rem'
                                                  height:'210px'}} onClick={() => openPostDetail(post)}>
                                                  {post.media && post.media.slice(0, 5).map((base64Image, index) => (
                                                    <LazyImage key={index} base64Image={base64Image} alt={`Post ${index}`} style={{
                                                      height: '200px',
                                                      borderRadius: '8px',
                                                      objectFit: 'cover',
                                                      flexShrink: 0,
                                                      cursor: 'pointer' // Make the image look clickable
                                                    }}/>
                                                  ))}
                                                </div>
                                                {post.media && post.media.length > 5 && (
                                                  <Typography variant="body2" color="error" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                                                    Media exceeds its maximum count
                                                  </Typography>
                                                )}
                                              </CardMedia>
                                              <CardContent style={{ padding: '1rem' }}>
                                                <Tooltip title={post.title} placement="top" arrow>
                                                  <Typography variant="h5" component="div" style={{ fontWeight: 'bold', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {post.title.split(" ").length > 5 ? `${post.title.split(" ").slice(0, 5).join(" ")}...` : post.title}
                                                  </Typography>
                                                </Tooltip>
                                                <Typography variant="body1" color="textSecondary" style={{ display: 'inline-block',float: 'right', fontWeight: '500' }}>
                                                  Price: ₹{post.price}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" style={{  marginBottom: '0.5rem' }}>
                                                  Gender: {post.gender}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" style={{  marginBottom: '0.5rem' }}>
                                                  Category: {post.categories}
                                                </Typography>
                                                <Typography variant="body2" color={post.postStatus === 'Active' ? 'green' : 'red'} style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                                                  Post Status: {post.postStatus}
                                                </Typography>
                                                {/* {post.postStatus === 'In Stock' && (
                                                  <Typography variant="body2" color="textSecondary" style={{ display: 'inline-block',float: 'right',marginBottom: '0.5rem' }}>
                                                    Stock Count: {post.stockCount}
                                                  </Typography>
                                                )} */}
                                                {/* <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                                                  Delivery Days: {product.deliveryDays}
                                                </Typography> */}
                                                {/* <IconButton
                                                      onClick={() => handleWishlistToggle(product._id)}
                                                      sx={{
                                                        color: wishlist.has(product._id) ? 'red' : 'gray',
                                                      }}
                                                    >
                                                      {wishlist.has(product._id) ? (
                                                        <FavoriteIcon />
                                                      ) : (
                                                        <FavoriteBorderIcon />
                                                      )}
                                                    </IconButton> */}
                                                <Typography
                                                  variant="body2"
                                                  color="textSecondary"
                                                  style={{ marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',overflow: 'hidden', textOverflow: 'ellipsis',
                                                    maxHeight: '4.5rem',  // This keeps the text within three lines based on the line height.
                                                    lineHeight: '1.5rem'  // Adjust to control exact line spacing.
                                                  }}>
                                                  Description: {post.description}
                                                </Typography>
                                              </CardContent>
                                                  {/* <IconButton onClick={() => handleLike(product._id)}>
                                                    <ThumbUp /> {product.likes}
                                                  </IconButton>
                                                  <IconButton onClick={() => openComments(product)}>
                                                    <Comment /> {product.comments.length}
                                                  </IconButton> */}
                                              
                                            </Card>
                                            
                                          </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default FilterPosts;
