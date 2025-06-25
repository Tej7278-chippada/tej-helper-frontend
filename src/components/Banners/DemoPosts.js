// /components/Helper/DemoPosts.js
import React, { useEffect, useState, useRef } from "react";
import { 
  Box, 
  Typography, 
  Card, 
  CardMedia, 
  IconButton, 
  Skeleton,
  Fade,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { 
  PlayArrow as PlayIcon, 
  Pause as PauseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon 
} from "@mui/icons-material";
import { fetchBannerMediaById } from "../api/adminApi";

const DemoPosts = ({ isMobile, postId}) => {
  const [offers, setOffers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const intervalRef = useRef(null);
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Minimum swipe distance
  const minSwipeDistance = 50;

  useEffect(() => {
    const fetchPostMedia = async () => {
      try {
        setLoading(true);
        const response = await fetchBannerMediaById(postId);
        const mediaData = response.data.media.map((media, index) => ({ 
          data: media.toString('base64'), 
          _id: index.toString(), 
          remove: false,
          title: `Demo Post ${index + 1}` // Added default titles
        }));
        setOffers(mediaData);
      } catch (error) {
        console.error('Error fetching post details:', error);
        // Add some demo fallback data for better UX
        setOffers([
          { data: '/images/p8.png', _id: '1', remove: false, title: 'Demo Paid Post' },
          { data: '/images/u9.png', _id: '2', remove: false, title: 'Demo UnPaid Post' },
          { data: '/images/e3.png', _id: '3', remove: false, title: 'Demo Emergency Post' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPostMedia();
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (offers.length > 1 && isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length);
      }, 4000); // Slightly longer interval for better UX
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [offers.length, isPlaying]);

  // Touch handlers for swipe functionality
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
    setImageLoaded(false);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length);
    setImageLoaded(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + offers.length) % offers.length);
    setImageLoaded(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", maxWidth: "800px", margin: "auto", mt: 3 }}>
        <Skeleton 
          variant="rectangular" 
          height={isMobile ? 200 : 300} 
          sx={{ borderRadius: "16px" }}
          animation="wave"
        />
      </Box>
    );
  }

  if (offers.length === 0) {
    return null;
  }

  return (
    <Box sx={{ 
      width: "100%", 
      maxWidth: "800px", // 1200px
      margin: "auto", 
      mt: 3,
      position: 'relative'
    }}>
      <Card sx={{ 
        position: "relative", 
        borderRadius: "16px",
        overflow: 'hidden',
        boxShadow: theme.shadows[8],
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        // border: '1px solid rgba(255, 255, 255, 0.2)',
        // '&:hover': {
        //   transform: 'translateY(-2px)',
        //   transition: 'transform 0.3s ease-in-out',
        //   boxShadow: theme.shadows[12],
        // }
      }}>
        {/* Main Image Container */}
        <Box
          sx={{ position: 'relative', overflow: 'hidden' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Fade in={imageLoaded} timeout={500}>
            <CardMedia
              component="img"
              height={isMobile ? 200 : 300}
              image={ offers[currentIndex]?.data.startsWith('/image') 
                    ? `${process.env.PUBLIC_URL}${offers[currentIndex]?.data}`
                    : `data:image/jpeg;base64,${offers[currentIndex]?.data}`
              }
              alt={offers[currentIndex]?.title}
              onLoad={handleImageLoad}
              sx={{ 
                borderRadius: 0,
                cursor: "pointer",
                transition: 'transform 0.3s ease-in-out',
                // '&:hover': {
                //   transform: 'scale(1.02)'
                // }
              }}
              onClick={() => offers[currentIndex]?.url && window.open(offers[currentIndex].url, "_blank")}
            />
          </Fade>

          {/* Loading overlay for image transitions */}
          {!imageLoaded && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.1)',
                zIndex: 2
              }}
            >
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height="100%" 
                animation="wave"
              />
            </Box>
          )}

          {/* Navigation Arrows - Only show on hover for desktop */}
          {offers.length > 1 && !isMobile && (
            <>
              <IconButton
                onClick={goToPrevious}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  opacity: 0,
                  transition: 'opacity 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                  '.MuiCard-root:hover &': {
                    opacity: 1,
                  },
                  zIndex: 3
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              
              <IconButton
                onClick={goToNext}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  opacity: 0,
                  transition: 'opacity 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                  '.MuiCard-root:hover &': {
                    opacity: 1,
                  },
                  zIndex: 3
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </>
          )}

          {/* Play/Pause Button */}
          {offers.length > 1 && (
            <IconButton
              onClick={togglePlayPause}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                opacity: 0,
                transition: 'opacity 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
                '.MuiCard-root:hover &': {
                  opacity: 1,
                },
                zIndex: 3
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
          )}

          {/* Image Title Overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
              color: 'white',
              p: 2,
              zIndex: 2,
              opacity: 0,
                transition: 'opacity 0.3s ease-in-out',
                // '&:hover': {
                //   backgroundColor: 'rgba(0, 0, 0, 0.7)',
                // },
                '.MuiCard-root:hover &': {
                  opacity: 1,
                },
                // zIndex: 3
            }}
          >
            <Typography 
              variant={isMobile ? "body2" : "h6"} 
              sx={{ 
                fontWeight: 600,
                textShadow: '0 1px 3px rgba(0,0,0,0.5)', textAlign: 'left'
              }}
            >
              {offers[currentIndex]?.title || `Demo Post ${currentIndex + 1}`}
            </Typography>
          </Box>
        </Box>

        {/* Enhanced Dots Navigation */}
        {offers.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              bottom: "20px",
              width: "100%",
              display: "flex",
              justifyContent: "right", right: 16,
              gap: "6px",
              zIndex: 4,
            }}
          >
            {offers.map((_, index) => (
              <Box
                key={index}
                onClick={() => handleDotClick(index)}
                sx={{
                  width: index === currentIndex ? "24px" : "8px",
                  height: "8px",
                  backgroundColor: index === currentIndex 
                    ? 'rgba(255, 255, 255, 0.9)' 
                    : 'rgba(255, 255, 255, 0.4)',
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    transform: 'scale(1.1)'
                  }
                }}
              />
            ))}
          </Box>
        )}

        {/* Progress Bar */}
        {offers.length > 1 && isPlaying && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '3px',
              backgroundColor: theme.palette.primary.main,
              borderRadius: '2px 2px 0 0',
              animation: 'progressBar 4s linear infinite',
              zIndex: 4,
              opacity: 0,
                transition: 'opacity 0.3s ease-in-out',
                // '&:hover': {
                //   backgroundColor: 'rgba(0, 0, 0, 0.7)',
                // },
                '.MuiCard-root:hover &': {
                  opacity: 1,
                },
              '@keyframes progressBar': {
                '0%': { width: '0%' },
                '100%': { width: '100%' }
              }
            }}
          />
        )}
      </Card>

      {/* Swipe Hint for Mobile */}
      {/* {isMobile && offers.length > 1 && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 1,
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.75rem'
          }}
        >
          Swipe left or right to navigate • {currentIndex + 1} of {offers.length}
        </Typography>
      )} */}
    </Box>
  );
};

export default DemoPosts;