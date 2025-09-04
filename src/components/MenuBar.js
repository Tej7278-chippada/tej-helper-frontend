//src/components/MenuBar.js
import React from 'react';
import { Badge, BottomNavigation, BottomNavigationAction, Box, Paper, Tooltip, Typography, useMediaQuery, Zoom } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ChatIcon from '@mui/icons-material/Chat';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

const navItems = [
  {
    label: 'Helper',
    icon: <HomeRoundedIcon />,
    path: `/`,
    activeColor: '#4CAF50',
    description: 'Go to home page',
    bgColor: 'rgba(76, 175, 80, 0.1)'
  },
  {
    label: 'My Posts',
    icon: <PostAddIcon />,
    path: '/userposts',
    activeColor: '#2196F3',
    description: 'View your posts',
    bgColor:'rgba(33, 150, 243, 0.1)' ,
    badgeCount: 0 // Can be dynamically updated
  },
  {
    label: 'Chats',
    icon: <ChatIcon />,
    path: '/chatsOfUser',
    activeColor: '#FF5722',
    description: 'Open chat messages',
    bgColor: 'rgba(255, 87, 34, 0.1)',
    badgeCount: 0 // For unread messages
  },
  {
    label: 'Wishlist',
    icon: <FavoriteIcon />,
    path: '/wishlist',
    activeColor: '#E91E63',
    description: 'View saved posts',
    bgColor: 'rgba(233, 30, 99, 0.1)'
  },
];

const getGlassmorphismStyle = (theme, darkMode) => ({
  background: darkMode 
    ? 'rgba(30, 30, 30, 0.85)' 
    : 'rgba(255, 255, 255, 0.8)', // 0.15
  backdropFilter: 'blur(20px)',
  border: darkMode 
    ? '1px solid rgba(255, 255, 255, 0.1)' 
    : '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: darkMode 
    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
});

const MenuBar = ({ visible, badgeCounts = {}, darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // const [isAnimating, setIsAnimating] = useState(false);
  // const [activeIndex, setActiveIndex] = useState(0);
  // const [isAnimating, setIsAnimating] = useState(false);

  // Update active index based on current path
  // useEffect(() => {
  //   const currentIndex = navItems.findIndex(item => item.path === location.pathname);
  //   if (currentIndex !== -1) {
  //     setActiveIndex(currentIndex);
  //   }
  // }, [location.pathname]);

  // Handle navigation with animation
  const handleNavigation = (path, index) => {
    if (path === location.pathname) return; // Don't navigate to same page

    // setIsAnimating(true);
    // setActiveIndex(index);

    // Add haptic feedback for mobile devices
    // if (navigator.vibrate) {
    //   navigator.vibrate(30);
    // }

    // setTimeout(() => {
      navigate(path);
    //   setIsAnimating(false);
    // }, 150);
  };

  // Animation effect for smooth transitions
  // useEffect(() => {
  //   setIsAnimating(true);
  //   const timer = setTimeout(() => setIsAnimating(false), 400); // Match transition duration
  //   return () => clearTimeout(timer);
  // }, [visible]);

  if (!isMobile) return null;

  return (
    <Paper
      sx={{
        position: 'fixed', 
        // m: "8px 16px ", 
        // borderRadius: '16px',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200, ...getGlassmorphismStyle(theme, darkMode),
        // background: 'rgba(255, 255, 255, 0.85)',
        // backdropFilter: 'blur(20px)',
        // borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        opacity: visible ? 1 : 0.8,
        pointerEvents: visible ? 'auto' : 'none',
        // boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0), transparent)',
        }
      }}
      elevation={3}
    >
      {/* Active indicator */}
      {/* <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: `${(activeIndex / navItems.length) * 100}%`,
          width: `${100 / navItems.length}%`,
          height: '3px',
          background: `linear-gradient(90deg, ${navItems[activeIndex]?.activeColor || theme.palette.primary.main}, ${navItems[activeIndex]?.activeColor || theme.palette.primary.main}99)`,
          borderRadius: '0 0 2px 2px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `0 2px 8px ${navItems[activeIndex]?.activeColor || theme.palette.primary.main}40`,
        }}
      /> */}
      <BottomNavigation showLabels={isMobile}
        value={location.pathname}
        sx={{
          background: 'transparent',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          overflow: 'hidden',
          height: isMobile ? '54px' : '72px',
          '& .MuiBottomNavigationAction-root': {
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '12px',
            margin: '4px 2px',
            minWidth: isMobile ? '60px' : '80px',
            position: 'relative',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              transform: 'translateY(-1px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              '& .MuiBottomNavigationAction-icon': {
                transform: 'scale(1.1)',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
              },
              '& .MuiBottomNavigationAction-label': {
                fontWeight: 600,
              }
            },
            '&:active': {
              transform: 'translateY(0) scale(0.95)',
            }
          },
          '& .MuiBottomNavigationAction-icon': {
            fontSize: isMobile ? '24px' : '26px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '11px',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            marginTop: '2px',
            textTransform: 'capitalize',
          }
        }}
      >
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const badgeCount = badgeCounts[item.label.toLowerCase()] || item.badgeCount || 0;

          const NavigationIcon = (
            <Badge
              badgeContent={badgeCount > 0 ? badgeCount : null}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '10px',
                  height: '18px',
                  minWidth: '18px',
                  backgroundColor: '#FF4444',
                  color: 'white',
                  fontWeight: 'bold',
                  animation: badgeCount > 0 ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                    '50%': {
                      transform: 'scale(1.1)',
                      opacity: 0.8,
                    },
                    '100%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                  }
                }
              }}
            >
              <Box
                sx={{
                  color: isActive ? (item.activeColor || theme.palette.primary.main) : darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </Box>
            </Badge>
          );

          return (
            <Tooltip
              key={item.label}
              title={
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {item.description}
                  </Typography>
                </Box>
              }
              arrow
              placement="top"
              TransitionComponent={Zoom}
              enterDelay={300}
              sx={{
                '& .MuiTooltip-tooltip': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }
              }}
            >
              <BottomNavigationAction
                label={item.label}
                icon={NavigationIcon}
                value={item.path}
                onClick={() => handleNavigation(item.path, index)}
                sx={{
                  // opacity: isAnimating && index !== activeIndex ? 0.5 : 1,
                  // pointerEvents: isAnimating ? 'none' : 'auto',
                  // background: isActive ? ( item.bgColor|| theme.palette.primary.main) : 'null',
                }}
              />
            </Tooltip>
          );
        })}
      </BottomNavigation>
      {/* Decorative elements */}
      {/* <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40px',
          height: '4px',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '2px 2px 0 0',
          opacity: 0.6,
        }}
      /> */}
    </Paper>
  );
};

export default MenuBar;
