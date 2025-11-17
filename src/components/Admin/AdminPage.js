// src/components/Admin/AdminPage.js
import React from "react";
import { 
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Stack
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import Layout from "../Layout";
import { 
  PeopleAlt as UsersIcon,
  Feedback as FeedbackIcon,
  Campaign as BannerIcon,
  AdminPanelSettings as AdminIcon
} from "@mui/icons-material";
import WorkHistoryRoundedIcon from '@mui/icons-material/WorkHistoryRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
// import SettingsInputComponentRoundedIcon from '@mui/icons-material/SettingsInputComponentRounded';
import ReportGmailerrorredRoundedIcon from '@mui/icons-material/ReportGmailerrorredRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';

const AdminPage = ({ darkMode, toggleDarkMode, unreadCount, shouldAnimate, username }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const adminCards = [
    {
      title: "User Management",
      description: "Manage users, view profiles, and handle user-related activities",
      icon: <UsersIcon sx={{ fontSize: 40 }} />,
      color: "#2196f3",
      route: "/userManagement",
      bgGradient: "linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)"
    },
    {
      title: "Profile Verification",
      description: "Review and verify user identity documents and profiles",
      icon: <VerifiedUserRoundedIcon sx={{ fontSize: 40 }} />,
      color: "#ff9800",
      route: "/profile-verification",
      bgGradient: "linear-gradient(135deg, #ff9800 0%, #ff5722 100%)"
    },
    {
      title: "Reports Management",
      description: "Review reported posts, take actions, and manage content moderation",
      icon: <ReportGmailerrorredRoundedIcon sx={{ fontSize: 40 }} />,
      color: "#f44336",
      route: "/post-reports",
      bgGradient: "linear-gradient(135deg, #f44336 0%, #e91e63 100%)"
    },
    {
      title: "User Feedback",
      description: "View and manage user feedback and support requests",
      icon: <FeedbackIcon sx={{ fontSize: 40 }} />,
      color: "#4caf50",
      route: "/userFeedbacks",
      bgGradient: "linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)"
    },
    {
      title: "Post Status Management",
      description: "Monitor and manually trigger automatic post status updates",
      icon: <WorkHistoryRoundedIcon sx={{ fontSize: 40 }} />,
      color: "#9c27b0",
      route: "/post-status-management",
      bgGradient: "linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)"
    },
    // {
    //   title: "Admin Preferences",
    //   description: "Manage post status update settings and system preferences",
    //   icon: <SettingsInputComponentRoundedIcon sx={{ fontSize: 40 }} />,
    //   color: "#673ab7",
    //   route: "/admin-preferences",
    //   bgGradient: "linear-gradient(135deg, #673ab7 0%, #512da8 100%)"
    // },
    {
      title: "System Health",
      description: "Monitor system performance, database status, and notifications",
      icon: <MemoryRoundedIcon sx={{ fontSize: 40 }} />,
      color: "#00bcd4",
      route: "/system-health",
      bgGradient: "linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)"
    },
    {
      title: "Admin Banners",
      description: "Create and manage promotional banners and announcements",
      icon: <BannerIcon sx={{ fontSize: 40 }} />,
      color: "#ff9800",
      route: "/adminBanners",
      bgGradient: "linear-gradient(135deg, #ff9800 0%, #ffc107 100%)"
    }
  ];

  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <Layout 
      darkMode={darkMode} 
      toggleDarkMode={toggleDarkMode} 
      unreadCount={unreadCount} 
      shouldAnimate={shouldAnimate}
      username={username}
    >
      <Box sx={{ m: isMobile ? '12px' : '18px' }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'primary.main', 
              width: isMobile ? 40 : 56, 
              height: isMobile ? 40 : 56 
            }}>
              <AdminIcon sx={{ fontSize: isMobile ? 24 : 32 }} />
            </Avatar>
            <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom sx={{ m: 0 }}>
              Admin Dashboard
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Manage platform settings and content.
          </Typography>
        </Box>

        {/* Navigation Cards */}
        <Grid container spacing={2}>
          {adminCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex', borderRadius: '12px',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent', // Remove tap highlight
                  WebkitTouchCallout: 'none', // Disable iOS callout
                  WebkitUserSelect: 'none', // Disable text selection
                  userSelect: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  background: darkMode 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: darkMode 
                    ? '1px solid rgba(255, 255, 255, 0.1)' 
                    : '1px solid rgba(0, 0, 0, 0.1)',
                }}
                onClick={() => handleNavigation(card.route)}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pb: 1 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: card.bgGradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      color: 'white',
                      boxShadow: `0 4px 20px ${card.color}40`,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button 
                    variant="contained" 
                    sx={{
                      background: card.bgGradient,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        background: card.bgGradient,
                        filter: 'brightness(1.1)',
                      }
                    }}
                  >
                    Access
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Stats Section */}
        <Box sx={{ mt: 4, p: 3, 
          background: darkMode 
            ? 'rgba(255, 255, 255, 0.03)' 
            : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          border: darkMode 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : '1px solid rgba(0, 0, 0, 0.1)',
        }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Quick Access
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the cards above to navigate to different admin sections. Each section provides comprehensive tools for managing application.
          </Typography>
        </Box>
      </Box>
    </Layout>
  );
};

export default AdminPage;