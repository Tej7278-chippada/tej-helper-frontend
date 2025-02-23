// components/Helper/Helper.js
import React, { useEffect, useState } from 'react';
import {Box, Button, Card, CardContent, CardMedia, Grid, Toolbar, Tooltip, Typography, useMediaQuery} from '@mui/material';
import Layout from '../Layout';
// import { useTheme } from '@emotion/react';
import FilterListIcon from "@mui/icons-material/FilterList";
import FavoriteIcon from '@mui/icons-material/Favorite';
// import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import SkeletonCards from './SkeletonCards';
import LazyImage from './LazyImage';
import { useTheme } from '@emotion/react';
import { fetchPosts } from '../api/api';
import { useNavigate } from 'react-router-dom';
import FilterPosts from './FilterPosts';

const Helper = ()=> {
  const tokenUsername = localStorage.getItem('tokenUsername');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    category: '',
    gender: '',
    postStatus: '',
    priceRange: [0, 10000],
  });

  // Fetch posts data
  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        // localStorage.setItem('currentPage', currentPage); // Persist current page to localStorage
        try {
            const response = await fetchPosts();
            // const { posts } = response.data;
            setPosts(response.data);
            // setTotalPages(totalPages);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching posts:", error);
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const openPostDetail = (post) => {
    // setSelectedProduct(product);
    navigate(`/post/${post._id}`);
  };

  // Handle opening and closing the filter card
  const handleFilterToggle = () => {
    setFilterOpen((prev) => !prev);
  };

  // Apply filters to the posts
  const applyFilters = (newFilters) => {
    setFilterCriteria(newFilters);
    const filtered = posts.filter((post) => {
      const matchCategory = newFilters.category ? post.category === newFilters.category : true;
      const matchGender = newFilters.gender ? post.gender === newFilters.gender : true;
      const matchPostStatus = newFilters.postStatus ? post.postStatus === newFilters.postStatus : true;
      const matchPrice = post.price >= newFilters.priceRange[0] && post.price <= newFilters.priceRange[1];
      return matchCategory && matchGender && matchPostStatus && matchPrice;
    });
    setFilteredPosts(filtered);
  };

  return (
    <Layout username={tokenUsername}>
      <Box>
      <Toolbar > 
          <Typography variant="h6" style={{ flexGrow: 1, marginRight: '2rem' }}>
            Posts
          </Typography>
          <Button
            variant="contained"
            onClick={handleFilterToggle}
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
            onClick={() => navigate('/wishlist')}
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
            <FavoriteIcon sx={{ fontSize: '20px' }} />
            {/* <span style={{ fontSize: '14px', fontWeight: '500' }}>Filter</span> */}
          </Button>
          
        </Toolbar>

        <Box sx={{ bgcolor: '#f5f5f5', paddingTop: '1rem', paddingBottom: '1rem', paddingInline: isMobile ? '4px' : '8px', borderRadius: '10px' }} > {/* sx={{ p: 2 }} */}
            {loading ? (
              // renderSkeletonCards()
              <SkeletonCards />
              // <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: "50vh" }}>
              //   <CircularProgress />
              // </Box>
            ) : (
              <Grid container spacing={isMobile ? 1 : 2}>
                {posts.map((post) => (
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
                      <CardMedia marginInline={isMobile ? "-12px" : "-2px"} sx={{ margin: '0rem 0', borderRadius: '8px', overflow: 'hidden', height: '200px', backgroundColor: '#f5f5f5' }}>
                        <div style={{
                          display: 'flex',
                          overflowX: 'auto',
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#888 transparent',
                          borderRadius: '8px',
                          gap: '0.1rem',
                          // marginBottom: '1rem'
                          height: '210px'
                        }} 
                        // onClick={() => openProductDetail(product)}
                        >
                          {post.media && post.media.slice(0, 5).map((base64Image, index) => (
                            <LazyImage key={index} base64Image={base64Image} alt={`Post ${index}`} style={{
                              height: '200px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              flexShrink: 0,
                              cursor: 'pointer' // Make the image look clickable
                            }} />
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
                        <Typography variant="body1" color="textSecondary" style={{ display: 'inline-block', float: 'right', fontWeight: '500' }}>
                          Price: ₹{post.price}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                          Gender: {post.gender}
                        </Typography>
                        <Typography variant="body2" color={post.postStatus === 'Active' ? 'green' : 'red'} style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                          Post Status: {post.postStatus}
                        </Typography>
                        {/* {post.stockStatus === 'In Stock' && ( */}
                          <Typography variant="body2" color="textSecondary" style={{ display: 'inline-block',float: 'right',marginBottom: '0.5rem' }}>
                            People Count: {post.peopleCount}
                          </Typography>
                        {/* )} */}
                        <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                          Service Days: {post.serviceDays}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
                          UserCode : {post.userCode}
                        </Typography>
                        {/* <Typography variant="body2" color={product.stockStatus === 'In Stock' ? 'green' : 'red'} style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                          Stock Status: {product.stockStatus}
                        </Typography> */}
                        {/* <Typography variant="body2" color={post.peopleCount > 0 ? "green" : "red"} style={{ marginBottom: '0.5rem' }}>
                          {post.peopleCount > 0 ? `In Stock (${post.peopleCount} available)` : "Out of Stock"}
                        </Typography> */}
                        {/* {product.stockStatus === 'In Stock' && (
                          <Typography variant="body2" color="textSecondary" style={{ display: 'inline-block', float: 'right', marginBottom: '0.5rem' }}>
                            Stock Count: {product.stockCount}
                          </Typography>
                        )} */}
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
                        {/* <Grid item xs={6} sm={4}>
                          <Typography variant="body1" style={{ fontWeight: 500 }}>
                            Seller Details:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {product.sellerTitle}
                          </Typography>
                        </Grid> */}
                      </CardContent>
                    </Card>

                  </Grid>
                ))}

              </Grid>
            )}
          </Box>


      </Box>
      {/* Filter Floating Card */}
      {filterOpen && (
          <FilterPosts
            filterCriteria={filterCriteria}
            applyFilters={applyFilters}
            posts={posts}
            filteredPosts={filteredPosts}
            onClose={handleFilterToggle}
          />
        )}
    
    </Layout>
  );


};

export default Helper;
