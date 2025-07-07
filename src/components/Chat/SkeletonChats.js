// src/components/SkeletonGroups.js
import React from 'react';
import { Box, Skeleton, Card, } from '@mui/material';

// Enhanced glassmorphism styles
const getGlassmorphismStyle = (opacity = 0.15, blur = 20) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: `blur(${blur}px)`,
  // border: '1px solid rgba(255, 255, 255, 0.2)',
  // boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
});

function SkeletonChats() {
  return (
    <Box sx={{ padding: '0px' }}>
      {/* <Grid container spacing={2}> */}
        {/* Groups List Skeleton */}
        {/* <Grid item xs={12} md={4}> */}
          <Box
            sx={{
            //   height: '65vh', // Matches the Groups section height
            //   borderRadius: 3,
            //   boxShadow: 3,
            //   padding: '1rem',
            //   overflowY: 'auto', scrollbarWidth:'none', backgroundColor:'gray'
            }}
          >
            
            {[...Array(8)].map((_, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                //   marginBottom: 2,
                  cursor: 'pointer', marginBottom:'4px',
                  '&:hover': { backdropFilter: 'blur(12px)',},
                //   padding: '4px',
                  borderRadius: 1,
                }}
              >
                <Card sx={{ ...getGlassmorphismStyle(0.1, 10),
              height: '100%', // Matches the Groups section height
              borderRadius: '8px',
            //   boxShadow: 3,
              padding: '8px',
              overflowY: 'auto', scrollbarWidth:'none', width:'100%'
            }}>
                <Skeleton variant="circular" animation="wave" width={50} height={50} sx={{ marginRight: 3 , float:'inline-start', display: 'inline-block'}} />
                <Skeleton variant="text" width="60%" height={35} animation="wave" sx={{float:'left',}} />
                </Card>
              </Box>
            ))}
          </Box>
        {/* </Grid> */}

      {/* </Grid> */}
    </Box>
  );
}

export default SkeletonChats;
