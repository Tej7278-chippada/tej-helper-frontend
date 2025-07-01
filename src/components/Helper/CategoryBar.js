// components/Helper/CategoryBar.js
import React, { useRef, useEffect} from 'react';
import { Box, Chip, Divider } from '@mui/material';
import PaidIcon from '@mui/icons-material/Paid';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import EmergencyIcon from '@mui/icons-material/Emergency';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SchoolIcon from '@mui/icons-material/School';
import PetsIcon from '@mui/icons-material/Pets';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import HandymanIcon from '@mui/icons-material/Handyman';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const CategoryBar = ({ selectedCategory, onCategorySelect, darkMode, isMobile }) => {

  const scrollContainerRef = useRef(null);
  
  // Add this useEffect to scroll to the selected item
  useEffect(() => {
    if (scrollContainerRef.current && selectedCategory) {
      // Wait for the next render cycle to ensure all chips are rendered
      setTimeout(() => {
        const selectedChip = scrollContainerRef.current.querySelector(
          `[data-value="${selectedCategory}"]`
        );
        if (selectedChip) {
          selectedChip.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }, 100);
    }
  }, [selectedCategory]);


  const categories = [
    { 
      value: '', 
      label: 'All', 
      icon: <ViewModuleIcon sx={{ fontSize: '18px' }} />,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)'
    },
    { 
      value: 'Paid', 
      label: 'Paid', 
      icon: <PaidIcon sx={{ fontSize: '18px' }} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    { 
      value: 'UnPaid', 
      label: 'Volunteer', 
      icon: <VolunteerActivismIcon sx={{ fontSize: '18px' }} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    { 
      value: 'Emergency', 
      label: 'Emergency', 
      icon: <EmergencyIcon sx={{ fontSize: '18px' }} />,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    }
  ];

  const services = [
    { 
      value: 'ParkingSpace', 
      label: 'Parking', 
      icon: <LocalParkingIcon sx={{ fontSize: '18px' }} />,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    { 
      value: 'VehicleRental', 
      label: 'Vehicle', 
      icon: <DirectionsCarIcon sx={{ fontSize: '18px' }} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    { 
      value: 'Laundry', 
      label: 'Laundry', 
      icon: <LocalLaundryServiceIcon sx={{ fontSize: '18px' }} />,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)'
    },
    { 
      value: 'Cleaning', 
      label: 'Cleaning', 
      icon: <CleaningServicesIcon sx={{ fontSize: '18px' }} />,
      color: '#14b8a6',
      bgColor: 'rgba(20, 184, 166, 0.1)'
    },
    { 
      value: 'Cooking', 
      label: 'Cooking', 
      icon: <RestaurantIcon sx={{ fontSize: '18px' }} />,
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.1)'
    },
    { 
      value: 'Tutoring', 
      label: 'Tutoring', 
      icon: <SchoolIcon sx={{ fontSize: '18px' }} />,
      color: '#eab308',
      bgColor: 'rgba(234, 179, 8, 0.1)'
    },
    { 
      value: 'PetCare', 
      label: 'Pet Care', 
      icon: <PetsIcon sx={{ fontSize: '18px' }} />,
      color: '#d946ef',
      bgColor: 'rgba(217, 70, 239, 0.1)'
    },
    { 
      value: 'Delivery', 
      label: 'Delivery', 
      icon: <DeliveryDiningIcon sx={{ fontSize: '18px' }} />,
      color: '#0ea5e9',
      bgColor: 'rgba(14, 165, 233, 0.1)'
    },
    { 
      value: 'Maintenance', 
      label: 'Maintenance', 
      icon: <HandymanIcon sx={{ fontSize: '18px' }} />,
      color: '#64748b',
      bgColor: 'rgba(100, 116, 139, 0.1)'
    },
    { 
      value: 'Other', 
      label: 'Other', 
      icon: <MoreHorizIcon sx={{ fontSize: '18px' }} />,
      color: '#94a3b8',
      bgColor: 'rgba(148, 163, 184, 0.1)'
    }
  ];

  const getGlassmorphismStyle = (darkMode) => ({
    background: darkMode 
      ? 'rgba(30, 30, 30, 0.85)' 
      : 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    border: darkMode 
      ? '1px solid rgba(255, 255, 255, 0.1)' 
      : '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: darkMode 
      ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
      : '0 8px 32px rgba(0, 0, 0, 0.1)',
  });

  const renderChips = (items) => {
    return items.map((item) => {
      const isSelected = selectedCategory === item.value;
      return (
        <Chip
          key={item.value}
          data-value={item.value} // Add this data attribute
          icon={item.icon}
          label={item.label}
          onClick={() => onCategorySelect(item.value)}
          variant={isSelected ? 'filled' : 'outlined'}
          sx={{
            minWidth: 'fit-content',
            height: isMobile ? '36px' : '40px',
            px: isMobile ? 1 : 1.5,
            fontWeight: isSelected ? 600 : 500,
            fontSize: isMobile ? '0.875rem' : '0.9rem',
            borderRadius: '20px',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backgroundColor: isSelected 
              ? item.color 
              : item.bgColor,
            color: isSelected 
              ? 'white' 
              : item.color,
            border: `1px solid ${item.color}`,
            '&:hover': {
              backgroundColor: item.color,
              color: 'white',
              boxShadow: `0 4px 12px ${item.color}40`, //   transform: 'translateY(-2px)',
            },
            '& .MuiChip-icon': {
              color: isSelected ? 'white' : item.color,
              marginLeft: isMobile ? '4px' : '8px',
            },
            '&:hover .MuiChip-icon': {
              color: 'white',
            }
          }}
        />
      );
    });
  };

  return (
    <Box
      sx={{
        ...getGlassmorphismStyle(darkMode),
        m: '12px',
        p: isMobile ? '8px' : '8px',
        borderRadius: '12px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
        }
      }}
    >
      <Box
        ref={scrollContainerRef} // Add this ref
        sx={{
          display: 'flex',
          gap: isMobile ? 1 : 1.5,
          overflowX: 'auto', 
          borderRadius: '6px',
          scrollBehavior: 'smooth', 
          scrollbarWidth: 'none', //   pb: 0.5,
          '&::-webkit-scrollbar': {
            height: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(99, 102, 241, 0.5)',
            borderRadius: '10px',
            '&:hover': {
              background: 'rgba(99, 102, 241, 0.7)',
            }
          },
        }}
      >
        {renderChips(categories)}
        <Divider orientation="vertical" flexItem sx={{ borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
        {renderChips(services)}
      </Box>
    </Box>
  );
};

export default CategoryBar;