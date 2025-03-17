import { useTheme } from "@emotion/react";
import { Card, CardContent, Grid, Skeleton, useMediaQuery } from "@mui/material";
import React from "react";




const SkeletonCards = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  return (
    <Grid container spacing={1.5}>
      {Array.from({ length: isMobile ? 6 : 12 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card style={{
                      borderRadius: '8px'
                    }}>
            <Skeleton variant="rectangular" height={160} style={{ borderRadius: '8px' }} />
            <CardContent>
              <Skeleton variant="text" height={30} width="60%" />
              <Skeleton variant="text" height={20} width="80%" />
              <Skeleton variant="text" height={20} width="40%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )};

export default SkeletonCards;