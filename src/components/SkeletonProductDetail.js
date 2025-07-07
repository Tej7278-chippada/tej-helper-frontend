// src/components/SkeletonProductDetail.js
import React from 'react';
import { Box, Skeleton, Grid, Card, CardContent, useMediaQuery } from '@mui/material';
import { useTheme } from '@emotion/react';

// Enhanced glassmorphism styles
const getGlassmorphismStyle = (opacity = 0.15, blur = 20) => ({
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    // border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  });

const SkeletonProductDetail = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <Box sx={{ padding: '0rem' }}>
            <Grid container spacing={2}>
                {/* Media Section Skeleton */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: isMobile ? 250 : 300, borderRadius: 3 , ...getGlassmorphismStyle(0.1, 10),}}>
                        <Skeleton variant="rectangular" animation="wave" width="100%" height="100%" />
                    </Card>
                </Grid>

                {/* Product Info Skeleton */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, padding: '1rem', height: 265, ...getGlassmorphismStyle(0.1, 10), }}>
                        <CardContent>
                            {/* Interaction Buttons Skeleton */}
                            <Grid item xs={12} sx={{ display: 'inline-block', float: 'right', paddingBottom: '1rem' }}>
                                <Box display="flex" justifyContent="flex-end" gap={2}>
                                    <Skeleton variant="circular" animation="wave" width={40} height={40} />
                                </Box>
                            </Grid>
                            <Skeleton variant="text" animation="wave" width="80%" height={42} sx={{ marginBottom: '1rem' }} />
                            <Grid container spacing={2}>
                                {[...Array(6)].map((_, index) => (
                                    <Grid item xs={6} sm={4} key={index}>
                                        <Skeleton variant="text" animation="wave" width="80%" height={24} />
                                        <Skeleton variant="text" animation="wave" width="60%" height={20} />
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>


                {/* Description Skeleton */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, padding: '1rem', ...getGlassmorphismStyle(0.1, 10), }}>
                        {/* Interaction Buttons Skeleton */}
                        <Grid item xs={12} sx={{ display: 'inline-block', float: 'right', paddingBottom: '1rem' }}>
                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                <Skeleton variant="circular" animation="wave" width={40} height={40} />
                                <Skeleton variant="circular" animation="wave" width={40} height={40} />
                            </Box>
                        </Grid>
                        <Skeleton variant="text" animation="wave" width="40%" height={28} sx={{ marginBottom: '1rem' }} />
                        <Skeleton variant="rectangular" animation="wave" width="100%" height={200} sx={{ borderRadius: 2 }} />
                    </Card>
                </Grid>


            </Grid>
        </Box>
    );
};

export default SkeletonProductDetail;
