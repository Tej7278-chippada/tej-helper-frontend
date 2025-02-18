// components/Helper/Helper.js
import React from 'react';
import { Box, Typography, Card,useMediaQuery, IconButton } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
// import apiClient from '../../utils/axiosConfig'; // Use axiosConfig here
import { useTheme } from '@emotion/react';
// import CreateGroup from './CreateGroup';
// import JoinGroup from './JoinGroup';
// import SkeletonGroups from './SkeletonGroups';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import Diversity2RoundedIcon from '@mui/icons-material/Diversity2Rounded';

const Helper = ()=> {
    const tokenUsername = localStorage.getItem('tokenUsername');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Layout username={tokenUsername}>
        <Card sx={{
            flex: 1.5, margin:1,
            height: '80vh', // Fixed height relative to viewport
            overflowY: 'auto',
            bgcolor: 'white', // Card background color (customizable)
            borderRadius: 2, // Card border radius (customizable)
            // boxShadow: 3, // Shadow for a modern look
            scrollbarWidth: 'none'
          }}>

            <Box height={isMobile ? "77vh" : "auto"} sx={{ padding: '0px' }}>
              <Box
                position="sticky" //fixed
                top={0}
                left={0}
                right={0}
                zIndex={10}
                sx={{
                  bgcolor: 'white', // Background color to ensure visibility
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Optional shadow for separation
                  padding: '8px 16px', // Padding for a clean look
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography position="relative" variant="h5">Posts</Typography>
                  <Box>
                    <IconButton
                      color="default"
                    //   onClick={() => setOpenCreateGroup(true)}
                      sx={{ mr: 1 }}
                    >
                      <Diversity2RoundedIcon />
                    </IconButton>
                    <IconButton
                      color="default"
                    //   onClick={() => setOpenJoinGroup(true)}
                    >
                      <PersonAddRoundedIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
              <Box bgcolor="#f5f5f5"
                // mt="64px" // Matches the approximate height of the fixed header
                height="calc(80vh - 64px)" // Adjust the height of the scrollable area
                sx={{
                  overflowY: 'auto',
                  paddingInline: isMobile ? '4px' : '6px', scrollbarWidth: 'none'
                }}
              >
                <Box style={{ paddingTop: '8px', paddingBottom: '1rem' }}>
                </Box>
              </Box>
            </Box>
          </Card>
          </Layout>
    );


};

export default Helper;
