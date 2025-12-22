import React from 'react';
import { Box, Grid, Card, Avatar, Skeleton } from '@mui/material';

const AboutHelperSkeleton = ({ isMobile, darkMode }) => {
  // Number of skeleton items to display
  const skeletonCount = 12;
  // Enhanced glassmorphism styles
    const getGlassmorphismStyle = (opacity = 0.15, blur = 20) => ({
        background: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        // border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    });

  return (
    <Box sx={{ position:'relative'}}>
        <Box
            sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            height: '96%',
            overflowY: 'auto',
            padding: '8px',
            scrollbarWidth: 'thin',
            }}
        >
            <Grid container spacing={isMobile ? 0.5 : 1} direction="row-reverse">
            {Array.from({ length: skeletonCount }).map((_, index) => (
                <Grid
                item
                key={index}
                xs={12}
                sx={{
                    display: 'flex',
                    justifyContent: index % 2 === 0 ? 'flex-end' : 'flex-start', // Alternate alignment
                }}
                >
                <Card
                    sx={{
                    display: 'flex',
                    flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
                    alignItems: 'center',
                    cursor: 'pointer',
                    p: 2, gap: 4,
                    mb: '8px', 
                    width:'100%',
                    // maxWidth: isMobile ? '80%' : '60%',
                    backgroundColor: '#e0e0e0', // Light gray background for skeleton
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    borderRadius: '14px',
                    opacity: 0.7,
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    WebkitTapHighlightColor: 'transparent', ...getGlassmorphismStyle(0.1, 10)
                    }}
                >
                    {/* Skeleton Avatar */}
                    <Skeleton variant="rectangular" sx={{ p: 4, borderRadius: '12px' }}>
                    <Avatar sx={{ width: isMobile ? 90 : 280, height: isMobile ? 40 : 120, }} />
                    </Skeleton>

                    {/* Skeleton Content */}
                    <Box sx={{ flexGrow: 1 }}>
                    {/* <Skeleton variant="text" width="40%" height={24} sx={{ float: 'right', marginLeft:'10px' }} /> */}
                    <Skeleton variant="text" width="60%" height={isMobile ? 30 : 40} sx={{marginRight:'10px'}} />
                    <Skeleton variant="text" width="80%" height={isMobile ? 18 : 24} />
                    <Skeleton variant="text" width="50%" height={isMobile ? 14 : 20} />
                    </Box>
                </Card>
                </Grid>
            ))}
            </Grid>
        </Box>
    </Box>
  );
};

export default AboutHelperSkeleton;