import React from 'react';
import { Box, Grid, Card, Skeleton } from '@mui/material';
// import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';

// Enhanced glassmorphism styles
const getGlassmorphismStyle = (opacity = 0.15, blur = 20) => ({
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  });

const ChatsSkeleton = ({ isMobile }) => {
  // Number of skeleton items to display
  const skeletonCount = isMobile ? 6 : 8;

  return (
    <Box sx={{ position:'relative'}}>
        <Box
            sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            height: '96%',
            overflowY: 'auto',
            // padding: '8px',
            scrollbarWidth: 'none',
            }}
        >
            <Grid container spacing={0} direction="row-reverse">
            {Array.from({ length: skeletonCount }).map((_, index) => (
                <Grid
                item
                key={index}
                xs={12}
                sx={{
                    display: 'flex',
                    justifyContent: index % 4 === 0 ? 'flex-end' : 'flex-start', // Alternate alignment
                }}
                >
                <Card
                    sx={{ ...getGlassmorphismStyle(0.1, 10),
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    cursor: 'pointer',
                    p: 1,
                    mb: '8px', width:'300px',
                    maxWidth: isMobile ? '80%' : '50%',
                    // backgroundColor: '#e0e0e0', // Light gray background for skeleton
                    // boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    borderRadius: '10px',
                    opacity: 0.7,
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    WebkitTapHighlightColor: 'transparent',
                    }}
                >
                    {/* Skeleton Content */}
                    <Box sx={{ flexGrow: 1 }}>
                    {/* <Skeleton variant="text" width="40%" height={24} sx={{ float: 'right', marginLeft:'10px' }} /> */}
                    <Skeleton variant="text" width="70%" height={25} animation="wave" sx={{marginRight:'10px'}} />
                    {/* <Skeleton variant="text" width="80%" height={16} /> */}
                    <Skeleton variant="text" width="40%" height={14} animation="wave" sx={{float:'inline-end'}}  />
                    </Box>
                </Card>
                </Grid>
            ))}
            </Grid>

            {/* Skeleton Scroll-to-Bottom Button */}
            {/* <IconButton
            style={{
                position: 'absolute',
                bottom: isMobile ? '50px' : '55px',
                right: isMobile ? '4px' : '12px',
                borderRadius: '24px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                width: isMobile ? '30px' : '25px',
                height: isMobile ? '35px' : '30px',
                backgroundColor: '#e0e0e0', // Light gray background for skeleton
            }}
            >
            <KeyboardDoubleArrowDownRoundedIcon style={{ fontSize: '14px' }} />
            </IconButton> */}
        </Box>
    </Box>
  );
};

export default ChatsSkeleton;