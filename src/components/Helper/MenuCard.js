// components/Helper/MenuCard.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  ToggleButton, 
  ToggleButtonGroup, 
  Chip, 
  Paper, 
  Slide,
  Typography,
  IconButton
} from '@mui/material';
import LiveHelpRoundedIcon from '@mui/icons-material/LiveHelpRounded';
import HomeRepairServiceRoundedIcon from '@mui/icons-material/HomeRepairServiceRounded';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

// Styled components
const AnimatedToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '20px',
  padding: '4px',
  background: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)',
  '& .MuiToggleButton-root': {
    position: 'relative',
    zIndex: 1,
    border: 'none',
    transition: 'all 0.3s ease',
  }
}));

const SliderThumb = styled(Box)(({ theme, position }) => ({
  position: 'absolute',
  top: '4px',
  left: position === 'left' ? '4px' : '49%',
  width: '50%',
  height: 'calc(100% - 8px)',
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(67, 97, 238, 0.7)' 
    : 'rgba(67, 97, 238, 0.2)',
  borderRadius: '18px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: 0,
}));

const StyledChip = styled(Chip)(({ theme, customcolor, isselected }) => ({
  backgroundColor: isselected === 'true' ? customcolor : 'transparent',
  color: isselected === 'true' ? 'white' : customcolor,
  border: `1px solid ${customcolor}`,
  fontWeight: 500,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: customcolor,
    color: 'white',
    transform: 'scale(1.05)',
  }
}));

const MenuCard = ({ selectedCategory, onCategorySelect, filters, darkMode, isMobile }) => {
  const [selectedType, setSelectedType] = useState(filters.postType || 'HelpRequest');
  const [showHelpCategories, setShowHelpCategories] = useState(false);
  const [showServiceCategories, setShowServiceCategories] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('right');
  const categoryRef = useRef(null);

  const handleTypeChange = (event, newType) => {
    // Prevent default to avoid auto-scrolling
    event.preventDefault();
    
    if (newType !== null) {
      // Set animation direction based on toggle movement
      if (newType !== selectedType) {
        setAnimationDirection(newType === 'HelpRequest' ? 'left' : 'right');
      }
      
      setSelectedType(newType);
      
      if (newType === 'HelpRequest') {
        // Toggle help categories visibility when help is clicked
        if (selectedType === 'HelpRequest') {
          setShowHelpCategories(!showHelpCategories);
          setShowServiceCategories(false);
        } else {
          setShowHelpCategories(true);
          setShowServiceCategories(false);
        }
      } else {
        // Toggle service categories visibility when services is clicked
        if (selectedType === 'ServiceOffering') {
          setShowServiceCategories(!showServiceCategories);
          setShowHelpCategories(false);
        } else {
          setShowServiceCategories(true);
          setShowHelpCategories(false);
        }
      }
    }
  };

  const handleHelpCategorySelect = (category) => {
    onCategorySelect(category);
    setShowHelpCategories(false);
  };

  const handleServiceCategorySelect = (service) => {
    onCategorySelect(service);
    setShowServiceCategories(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowHelpCategories(false);
        setShowServiceCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getGlassmorphismStyle = (darkMode) => ({
    background: darkMode 
      ? 'rgba(30, 30, 30, 0.95)' 
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: darkMode 
      ? '1px solid rgba(255, 255, 255, 0.2)' 
      : '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: darkMode 
      ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
      : '0 8px 32px rgba(0, 0, 0, 0.2)',
  });

  const getGlassmorphismMenuStyle = (darkMode) => ({
    background: 'rgba(0, 0, 0, 0)',
    backdropFilter: 'blur(1px)',
  });

  const helpCategories = [
    { value: 'Paid', label: 'Paid', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    { value: 'UnPaid', label: 'Volunteer', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
    { value: 'Emergency', label: 'Emergency', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  ];

  const serviceCategories = [
    { value: 'ParkingSpace', label: 'Parking Space', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
    { value: 'VehicleRental', label: 'Vehicle Rental', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
    { value: 'FurnitureRental', label: 'Furniture Rental', color: '#4f46e5', bgColor: 'rgba(79, 70, 229, 0.1)' },
    { value: 'Laundry', label: 'Laundry', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.1)' },
    { value: 'Events', label: 'Events', color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.1)' },
    { value: 'Playgrounds', label: 'Playgrounds', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
    { value: 'Cleaning', label: 'Cleaning', color: '#14b8a6', bgColor: 'rgba(20, 184, 166, 0.1)' },
    { value: 'Cooking', label: 'Cooking', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.1)' },
    { value: 'Tutoring', label: 'Tutoring', color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.1)' },
    { value: 'PetCare', label: 'Pet Care', color: '#d946ef', bgColor: 'rgba(217, 70, 239, 0.1)' },
    { value: 'Delivery', label: 'Delivery', color: '#0ea5e9', bgColor: 'rgba(14, 165, 233, 0.1)' },
    { value: 'Maintenance', label: 'Maintenance', color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.1)' },
    { value: 'HouseSaleLease', label: 'House Sale/Lease', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
    { value: 'LandSaleLease', label: 'Land Sale/Lease', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    { value: 'Other', label: 'Other', color: '#94a3b8', bgColor: 'rgba(148, 163, 184, 0.1)' }
  ];

  return (
    <Box
      ref={categoryRef}
      sx={{
        ...getGlassmorphismMenuStyle(darkMode),
        m: '8px 4px',
        p: isMobile ? '8px' : '8px',
        borderRadius: '12px', 
        position: 'relative',
        zIndex: 1050,
      }}
    >
      {/* Type Selection Toggle with Slider Animation */}
      <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <AnimatedToggleButtonGroup
          value={selectedType}
          exclusive
          onChange={handleTypeChange}
          aria-label="post type selection"
          sx={{
            minWidth: isMobile ? '340px' : '380px',
            '& .MuiToggleButton-root': {
              px: 1,
              py: 1,
              width: '50%',
              borderRadius: '18px',
              fontWeight: 600,
              fontSize: isMobile ? '0.875rem' : '0.9rem',
              '&.Mui-selected': {
                backgroundColor: 'transparent',
                color: darkMode ? '#fff' : '#4361ee',
                '&:hover': {
                  backgroundColor: 'transparent',
                }
              },
              '&:not(.Mui-selected)': {
                color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
              },
              '&:hover': {
                backgroundColor: 'transparent',
              }
            }
          }}
        >
          <ToggleButton 
            value="HelpRequest" 
            aria-label="help posts"
            // Prevent default to avoid auto-scrolling
            onClick={(e) => {
              e.preventDefault();
              handleTypeChange(e, 'HelpRequest');
            }}
          >
            <LiveHelpRoundedIcon sx={{ mr: 1, fontSize: '18px' }} />
            Help Requests
          </ToggleButton>
          <ToggleButton 
            value="ServiceOffering" 
            aria-label="services nearby"
            // Prevent default to avoid auto-scrolling
            onClick={(e) => {
              e.preventDefault();
              handleTypeChange(e, 'ServiceOffering');
            }}
          >
            <HomeRepairServiceRoundedIcon sx={{ mr: 1, fontSize: '18px' }} />
            Services Nearby
          </ToggleButton>
          
          {/* Slider thumb for animation */}
          <SliderThumb position={selectedType === 'HelpRequest' ? 'left' : 'right'} />
        </AnimatedToggleButtonGroup>
      </Box>

      {/* Floating Category Cards with Slide Animation */}
      <Box sx={{ position: 'relative', zIndex: 1200 }}>
        {/* Help Categories Card */}
        <Box
          sx={{
            position: 'fixed',
            top: isMobile ? '60px' : '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: isMobile ? '90%' : '400px',
            maxWidth: '90%',
            zIndex: 1300,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Slide 
            direction={animationDirection === 'left' ? 'right' : 'right'} 
            in={showHelpCategories} 
            mountOnEnter 
            unmountOnExit
          >
            <Paper
              sx={{
                mt: 1,
                p: 2,
                borderRadius: '12px',
                minWidth: isMobile ? '100%' : '300px',
                maxWidth: isMobile ? '100%' : '400px',
                ...getGlassmorphismStyle(darkMode),
              }}
            >
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  textAlign: 'center', 
                  mb: 1, 
                  fontWeight: 600,
                  color: darkMode ? '#fff' : '#4361ee'
                }}
              >
                Select Help Type
              </Typography>
              <IconButton onClick={() => setShowHelpCategories(false)}
                sx={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  // backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  // color: '#333'
                }}
              >
                <CloseIcon />
              </IconButton>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {helpCategories.map((category) => (
                  <StyledChip
                    key={category.value}
                    label={category.label}
                    customcolor={category.color}
                    isselected={(selectedCategory === category.value).toString()}
                    onClick={() => handleHelpCategorySelect(category.value)}
                  />
                ))}
              </Box>
            </Paper>
          </Slide>
        </Box>

        {/* Service Categories Card */}
        <Box
          sx={{
            position: 'fixed',
            top: isMobile ? '60px' : '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: isMobile ? '90%' : '80%',
            maxWidth: '90%',
            zIndex: 1300,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Slide 
            direction={animationDirection === 'right' ? 'right' : 'right'} 
            in={showServiceCategories} 
            mountOnEnter 
            unmountOnExit
          >
            <Paper
              sx={{
                mt: 1,
                p: 2,
                borderRadius: '12px',
                minWidth: isMobile ? '100%' : '300px',
                maxWidth: isMobile ? '100%' : '80%',
                maxHeight: '60vh',
                overflowY: 'auto',
                ...getGlassmorphismStyle(darkMode),
              }}
            >
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  textAlign: 'center', 
                  mb: 1, 
                  fontWeight: 600,
                  color: darkMode ? '#fff' : '#4361ee'
                }}
              >
                Select Service Type
              </Typography>
              <IconButton onClick={() => setShowServiceCategories(false)}
                sx={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  // backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  // color: '#333'
                }}
              >
                <CloseIcon />
              </IconButton>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {serviceCategories.map((service) => (
                  <StyledChip
                    key={service.value}
                    label={service.label}
                    customcolor={service.color}
                    isselected={(selectedCategory === service.value).toString()}
                    onClick={() => handleServiceCategorySelect(service.value)}
                  />
                ))}
              </Box>
            </Paper>
          </Slide>
        </Box>
      </Box>
    </Box>
  );
};

export default MenuCard;