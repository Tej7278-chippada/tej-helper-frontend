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
  IconButton,
  Grid
} from '@mui/material';
import LiveHelpRoundedIcon from '@mui/icons-material/LiveHelpRounded';
import HomeRepairServiceRoundedIcon from '@mui/icons-material/HomeRepairServiceRounded';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

// Styled components
const AnimatedToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '24px',
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
    : '#4361ee',
  borderRadius: '22px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: 0,
}));

// const StyledChip = styled(Chip)(({ theme, customcolor, isselected }) => ({
//   backgroundColor: isselected === 'true' ? customcolor : 'transparent',
//   color: isselected === 'true' ? 'white' : customcolor,
//   border: `1px solid ${customcolor}`,
//   fontWeight: 500,
//   transition: 'all 0.2s ease',
//   '&:hover': {
//     backgroundColor: customcolor,
//     color: 'white',
//     transform: 'scale(1.05)',
//   }
// }));

const CategoryItem = styled(Box)(({ theme, isselected, customcolor }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: isselected === 'true' 
    ? theme.palette.mode === 'dark' 
      ? `${customcolor}30` 
      : `${customcolor}20`
    : 'transparent',
  border: isselected === 'true' 
    ? `2px solid ${customcolor}` 
    // : '2px solid transparent',
    : theme.palette.mode === 'dark' 
      ? '2px solid rgba(255, 255, 255, 0.1)'
      : '2px solid rgba(0, 0, 0, 0.05)',
  '&:hover': {
     backgroundColor: theme.palette.mode === 'dark' 
      ? `${customcolor}20` 
      : `${customcolor}15`, // 15% opacity on hover
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2],
  }
}));

const CategoryImage = styled('img')(({ theme }) => ({
  width: '104px',
  height: '64px',
  objectFit: 'cover',
  borderRadius: '8px',
  marginBottom: '8px',
}));

const CategoryName = styled(Typography)(({ theme, customcolor, isselected }) => ({
  textAlign: 'center',
  fontSize: '0.8rem',
  fontWeight: isselected === 'true' ? 600 : 500,
  color: isselected === 'true' ? customcolor : theme.palette.text.primary,
}));

const SubCategoryName = styled(Typography)(({ theme, customcolor, isselected }) => ({
  textAlign: 'center',
  fontSize: '0.6rem',
  fontWeight: isselected === 'true' ? 500 : 400,
  color: theme.palette.text.secondary,
}));

const MenuCard = ({ selectedCategory, onCategorySelect, filters, darkMode, isMobile, setSnackbar }) => {
  const [selectedType, setSelectedType] = useState(filters.postType || 'HelpRequest');
  const [showHelpCategories, setShowHelpCategories] = useState(false);
  const [showServiceCategories, setShowServiceCategories] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('right');
  const categoryRef = useRef(null);

  // image mapping for categories and services
  const categoryImages = {
    '': '/categoryBar/all.png' || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=120&fit=crop&auto=format',
    'Paid': '/categoryBar/paid.png' || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=120&fit=crop&auto=format',
    'UnPaid': '/categoryBar/volunteer.png' || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=200&h=120&fit=crop&auto=format',
    'Emergency': '/categoryBar/emergency.png' || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=120&fit=crop&auto=format',
    'Friends': '/categoryBar/friends.png',
    'BloodDonors': '/categoryBar/emergency.png' || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=120&fit=crop&auto=format',
    'StandwithWomen': '/categoryBar/standwithwomen.png' || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=120&fit=crop&auto=format',
    'ParkingSpace': '/categoryBar/parking.png' || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=120&fit=crop&auto=format',
    'VehicleRental': '/categoryBar/vehiclesRental.png' || 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=120&fit=crop&auto=format',
    'FurnitureRental': '/categoryBar/furnitureRentals.png' || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=120&fit=crop&auto=format',
    'Grocery': '/categoryBar/grocery.png',
    'Laundry': '/categoryBar/laundry.png' || 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=200&h=120&fit=crop&auto=format',
    'Events': '/categoryBar/events.png' || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=200&h=120&fit=crop&auto=format',
    'Playgrounds': '/categoryBar/playgrounds.png' || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=120&fit=crop&auto=format',
    'Cleaning': '/categoryBar/cleaning.png' || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=120&fit=crop&auto=format',
    'Cooking': '/categoryBar/cooking.png' || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=120&fit=crop&auto=format',
    'Tutoring': '/categoryBar/tutoring.png' || 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=200&h=120&fit=crop&auto=format',
    'PetCare': '/categoryBar/petCare.png' || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=120&fit=crop&auto=format',
    'Driver': '/categoryBar/driver.png',
    'Delivery': '/categoryBar/delivery.png' || 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200&h=120&fit=crop&auto=format',
    'Maintenance': '/categoryBar/maintance.png' || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200&h=120&fit=crop&auto=format',
    'VehicleMech': '/categoryBar/vehicleMech.png',
    'HouseSaleLease': '/categoryBar/house.png',
    'LandSaleLease': '/categoryBar/land.png',
    'Other': '/categoryBar/others.png' || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=120&fit=crop&auto=format'
  };

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

  // const getGlassmorphismMenuStyle = (darkMode) => ({
  //   background: 'rgba(0, 0, 0, 0)',
  //   backdropFilter: 'blur(1px)',
  // });

  const helpCategories = [
    { value: 'Paid', label: 'Paid', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    { value: 'UnPaid', label: 'Volunteer', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
    { value: 'Emergency', label: 'Emergency', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  ];

  const nearbyPeople = [
    { value: 'BloodDonors', label: 'Blood Donors', sublabel: 'Find Blood donors nearby', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
    { value: 'StandwithWomen', label: 'Stand with Women', sublabel: 'People nearby stand for women safety', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.1)' }
  ];

  const serviceCategories = [
    // { value: 'BloodDonors', label: 'Blood Donors', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
    { value: 'ParkingSpace', label: 'Parking Space', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
    { value: 'VehicleRental', label: 'Vehicle Rental', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
    { value: 'FurnitureRental', label: 'Furniture Rental', color: '#4f46e5', bgColor: 'rgba(79, 70, 229, 0.1)' },
    { value: 'Grocery', label: 'Grocery', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
    { value: 'Laundry', label: 'Laundry', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.1)' },
    { value: 'Events', label: 'Events', color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.1)' },
    { value: 'Playgrounds', label: 'Playgrounds', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
    { value: 'Cleaning', label: 'Cleaning', color: '#14b8a6', bgColor: 'rgba(20, 184, 166, 0.1)' },
    { value: 'Cooking', label: 'Cooking', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.1)' },
    { value: 'Tutoring', label: 'Tutoring', color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.1)' },
    { value: 'PetCare', label: 'Pet Care', color: '#d946ef', bgColor: 'rgba(217, 70, 239, 0.1)' },
    { value: 'Driver', label: 'Driver', color: '#4f46e5', bgColor: 'rgba(79, 70, 229, 0.1)' },
    { value: 'Delivery', label: 'Delivery', color: '#0ea5e9', bgColor: 'rgba(14, 165, 233, 0.1)' },
    { value: 'Maintenance', label: 'Maintenance', color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.1)' },
    { value: 'VehicleMech', label: 'Vehicle Mechanic', color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.1)' },
    { value: 'HouseSaleLease', label: 'House Sale/Lease', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
    { value: 'LandSaleLease', label: 'Land Sale/Lease', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    { value: 'Other', label: 'Other', color: '#94a3b8', bgColor: 'rgba(148, 163, 184, 0.1)' }
  ];

  return (
    <Box
      ref={categoryRef}
      sx={{
        // ...getGlassmorphismMenuStyle(darkMode),
        mx: '4px', mb: '8px',
        px: isMobile ? '8px' : '8px',
        pb: isMobile ? '8px' : '8px',
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
                color: darkMode ? '#fff' : '#fff',
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
            sx={{textTransform: 'none'}}
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
            sx={{textTransform: 'none'}}
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
            top: isMobile ? '80px' : '80px',
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
              <Grid container spacing={1} justifyContent="center" mt={2}>
                {helpCategories.map((category) => (
                  <Grid item xs={6} sm={4} key={category.value}>
                    <CategoryItem
                      isselected={(selectedCategory === category.value).toString()}
                      customcolor={category.color}
                      onClick={() => handleHelpCategorySelect(category.value)}
                      sx={{ WebkitTapHighlightColor: 'transparent', // Remove tap highlight
                        WebkitTouchCallout: 'none', // Disable iOS callout
                        WebkitUserSelect: 'none', // Disable text selection
                        userSelect: 'none', 
                      }}
                    >
                      <CategoryImage 
                        src={categoryImages[category.value]} 
                        alt={category.label}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=120&fit=crop&auto=format';
                        }}
                      />
                      <CategoryName 
                        customcolor={category.color}
                        isselected={(selectedCategory === category.value).toString()}
                      >
                        {category.label}
                      </CategoryName>
                    </CategoryItem>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Slide>
        </Box>

        {/* Service Categories Card */}
        <Box
          sx={{
            position: 'fixed',
            top: isMobile ? '80px' : '80px',
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
                py: 2, px: 1,
                borderRadius: '12px',
                minWidth: isMobile ? '100%' : '300px',
                maxWidth: isMobile ? '100%' : '80%',
                
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
              <Box sx={{maxHeight: '60vh', overflowY: 'auto', pt: 2, px: 1}}>
              <Grid container spacing={1} justifyContent="center">
                {nearbyPeople.map((service) => (
                  <Grid item xs={6} sm={6} key={service.value} sx={{ display: 'flex' }}>
                    <CategoryItem
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        WebkitTapHighlightColor: 'transparent', // Remove tap highlight
                        WebkitTouchCallout: 'none', // Disable iOS callout
                        WebkitUserSelect: 'none', // Disable text selection
                        userSelect: 'none'
                      }}
                      isselected={(selectedCategory === service.value).toString()}
                      customcolor={service.color}
                      // onClick={() => handleServiceCategorySelect(service.value)}
                      // onClick={() => {setSnackbar({ open: true, message: 'We’re working on this feature. It will be available soon!', severity: 'warning' });}}
                      onClick={() => {
                        if (service.value === 'BloodDonors') {
                          handleServiceCategorySelect(service.value);
                        } else {
                          setSnackbar({ open: true, message: 'We’re working on this feature. It will be available soon!', severity: 'warning' });
                        }
                      }}
                    >
                      <CategoryImage 
                        src={categoryImages[service.value]} 
                        alt={service.label}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=120&fit=crop&auto=format';
                        }}
                      />
                      <CategoryName 
                        customcolor={service.color}
                        isselected={(selectedCategory === service.value).toString()}
                      >
                        {service.label}
                      </CategoryName>
                      <SubCategoryName 
                        customcolor={service.color}
                        isselected={(selectedCategory === service.value).toString()}
                      >
                        {service.sublabel}
                      </SubCategoryName>
                    </CategoryItem>
                  </Grid>
                ))}
                {serviceCategories.map((service) => (
                  <Grid item xs={6} sm={4} key={service.value}>
                    <CategoryItem
                      isselected={(selectedCategory === service.value).toString()}
                      customcolor={service.color}
                      onClick={() => handleServiceCategorySelect(service.value)}
                      sx={{ WebkitTapHighlightColor: 'transparent', // Remove tap highlight
                        WebkitTouchCallout: 'none', // Disable iOS callout
                        WebkitUserSelect: 'none', // Disable text selection
                        userSelect: 'none', 
                      }}
                    >
                      <CategoryImage 
                        src={categoryImages[service.value]} 
                        alt={service.label}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=120&fit=crop&auto=format';
                        }}
                      />
                      <CategoryName 
                        customcolor={service.color}
                        isselected={(selectedCategory === service.value).toString()}
                      >
                        {service.label}
                      </CategoryName>
                    </CategoryItem>
                  </Grid>
                ))}
              </Grid>
              </Box>
            </Paper>
          </Slide>
        </Box>
      </Box>
    </Box>
  );
};

export default MenuCard;