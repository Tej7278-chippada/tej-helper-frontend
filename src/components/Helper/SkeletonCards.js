import { useTheme } from "@emotion/react";
import { Card, CardContent, Grid, Skeleton, useMediaQuery } from "@mui/material";
import React from "react";

// Enhanced glassmorphism styles
const getGlassmorphismStyle = (opacity = 0.15, blur = 20) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: `blur(${blur}px)`,
  // border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
});


const SkeletonCards = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Grid container spacing={1.5}>
      {Array.from({ length: isMobile ? 6 : 12 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{
                      borderRadius: '8px', ...getGlassmorphismStyle(0.1, 10),
                    }}>
            <Skeleton variant="rectangular" height={160} animation="wave" style={{ borderRadius: '8px' }} />
            <CardContent>
              <Skeleton variant="text" animation="wave" height={30} width="60%" />
              <Skeleton variant="text" animation="wave" height={20} width="80%" />
              <Skeleton variant="text" animation="wave" height={20} width="40%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default SkeletonCards;